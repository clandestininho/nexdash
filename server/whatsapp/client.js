import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { registerSocket } from './messageHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_DIR = process.env.SESSION_DIR || path.join(__dirname, '..', '..', 'auth_sessions');

const activeSessions = new Map(); // userId -> sessionObject
let io = null;

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 2000;

/**
 * Initialize the WhatsApp Manager.
 * @param {import('socket.io').Server} socketIo
 */
export async function init(socketIo) {
  io = socketIo;
  
  // Auto-connect all users who have an active session folder
  await autoConnectAllUsers();
}

/**
 * Scan session directory and auto-connect previously connected users.
 */
async function autoConnectAllUsers() {
  try {
    if (!fs.existsSync(SESSION_DIR)) {
      fs.mkdirSync(SESSION_DIR, { recursive: true });
      return;
    }

    const files = fs.readdirSync(SESSION_DIR);
    for (const fileName of files) {
      if (fileName.startsWith('session_user_')) {
        const userId = fileName.replace('session_user_', '');
        console.log(`[WhatsApp] Restoring saved session for user ${userId}...`);
        connectUser(userId).catch((err) => {
          console.error(`[WhatsApp] Failed to restore session for user ${userId}:`, err.message);
        });
      }
    }
  } catch (err) {
    console.error('[WhatsApp] Error auto-connecting users:', err.message);
  }
}

/**
 * Connect a specific user to WhatsApp.
 * @param {string|number} userId
 */
export async function connectUser(userId) {
  const uId = String(userId);

  if (activeSessions.has(uId)) {
    const session = activeSessions.get(uId);
    if (session.status === 'connected' || session.status === 'connecting') {
      console.log(`[WhatsApp] User ${uId} is already connected/connecting.`);
      return session;
    }
  }

  console.log(`[WhatsApp] Initializing connection for user ${uId}...`);

  const userSessionPath = path.join(SESSION_DIR, `session_user_${uId}`);
  if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
  }

  const session = {
    socket: null,
    qrCode: null,
    status: 'connecting',
    phoneNumber: null,
    profilePic: null,
    reconnectAttempts: 0,
  };

  activeSessions.set(uId, session);
  emitUserStatus(uId);

  try {
    const { state, saveCreds } = await useMultiFileAuthState(userSessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      browser: ['NEXDASH CRM', 'Chrome', '1.0.0'],
    });

    session.socket = sock;

    // Register this socket with the message handler
    registerSocket(uId, sock, io);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          session.qrCode = await QRCode.toDataURL(qr);
          session.status = 'scanning';
          emitUserStatus(uId);
          if (io) {
            io.to(`user_${uId}`).emit('whatsapp:qr', { qr: session.qrCode });
          }
          console.log(`[WhatsApp] User ${uId}: QR code generated. Waiting for scan...`);
        } catch (err) {
          console.error(`[WhatsApp] User ${uId}: Failed to generate QR code:`, err.message);
        }
      }

      if (connection === 'open') {
        session.status = 'connected';
        session.qrCode = null;
        session.reconnectAttempts = 0;

        if (sock.user) {
          session.phoneNumber = sock.user.id.split(':')[0].split('@')[0];
          try {
            session.profilePic = await sock.profilePictureUrl(sock.user.id, 'image').catch(() => null);
          } catch {
            session.profilePic = null;
          }
        }

        emitUserStatus(uId);
        if (io) {
          io.to(`user_${uId}`).emit('whatsapp:connected', {
            phoneNumber: session.phoneNumber,
            profilePic: session.profilePic,
          });
        }
        console.log(`[WhatsApp] User ${uId}: Connected successfully. Phone:`, session.phoneNumber);
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log(
          `[WhatsApp] User ${uId}: Connection closed. Status code: ${statusCode} | Reconnect: ${shouldReconnect}`
        );

        if (statusCode === DisconnectReason.loggedOut) {
          // Clear credentials on logout
          try {
            if (fs.existsSync(userSessionPath)) {
              fs.rmSync(userSessionPath, { recursive: true, force: true });
              console.log(`[WhatsApp] User ${uId}: Session cleared after logout.`);
            }
          } catch (err) {
            console.error(`[WhatsApp] User ${uId}: Failed to clear session:`, err.message);
          }

          activeSessions.delete(uId);
          emitOfflineStatus(uId);
        } else if (shouldReconnect && session.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          session.reconnectAttempts++;
          const delay = Math.min(
            BASE_RECONNECT_DELAY * Math.pow(2, session.reconnectAttempts - 1),
            60000
          );
          console.log(
            `[WhatsApp] User ${uId}: Reconnecting in ${delay}ms (attempt ${session.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`
          );

          session.status = 'connecting';
          emitUserStatus(uId);

          setTimeout(() => {
            connectUser(uId);
          }, delay);
        } else {
          console.error(`[WhatsApp] User ${uId}: Reconnect attempts exhausted or logged out.`);
          activeSessions.delete(uId);
          emitOfflineStatus(uId);
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);
    return session;
  } catch (error) {
    console.error(`[WhatsApp] User ${uId}: Connection error:`, error.message);
    activeSessions.delete(uId);
    emitOfflineStatus(uId);
    return null;
  }
}

/**
 * Disconnect a user and optionally remove session files.
 * @param {string|number} userId
 * @param {boolean} clearSession
 */
export async function disconnectUser(userId, clearSession = false) {
  const uId = String(userId);
  const session = activeSessions.get(uId);

  if (session) {
    try {
      if (session.socket) {
        session.socket.end(undefined);
      }
    } catch (err) {
      console.error(`[WhatsApp] User ${uId}: Error ending socket:`, err.message);
    }
  }

  if (clearSession) {
    const userSessionPath = path.join(SESSION_DIR, `session_user_${uId}`);
    try {
      if (fs.existsSync(userSessionPath)) {
        fs.rmSync(userSessionPath, { recursive: true, force: true });
        console.log(`[WhatsApp] User ${uId}: Stored session files deleted.`);
      }
    } catch (err) {
      console.error(`[WhatsApp] User ${uId}: Failed to clear session directory:`, err.message);
    }
  }

  activeSessions.delete(uId);
  emitOfflineStatus(uId);
  console.log(`[WhatsApp] User ${uId}: Disconnected.`);
}

/**
 * Get connection status for a user.
 * @param {string|number} userId
 */
export function getStatus(userId) {
  const uId = String(userId);
  const session = activeSessions.get(uId);

  if (!session) {
    return {
      status: 'disconnected',
      qrCode: null,
      phoneNumber: null,
      profilePic: null,
    };
  }

  return {
    status: session.status,
    qrCode: session.qrCode,
    phoneNumber: session.phoneNumber,
    profilePic: session.profilePic,
  };
}

/**
 * Get active Baileys socket for a user.
 * @param {string|number} userId
 */
export function getSocket(userId) {
  const uId = String(userId);
  const session = activeSessions.get(uId);
  return session ? session.socket : null;
}

/**
 * Helper to emit a status change to a user's Socket.io room.
 * @param {string} uId
 */
function emitUserStatus(uId) {
  if (io) {
    const session = activeSessions.get(uId);
    io.to(`user_${uId}`).emit('whatsapp:status', {
      status: session.status,
      phoneNumber: session.phoneNumber,
      profilePic: session.profilePic,
    });
  }
}

/**
 * Helper to emit a disconnected offline status to a user's room.
 * @param {string} uId
 */
function emitOfflineStatus(uId) {
  if (io) {
    io.to(`user_${uId}`).emit('whatsapp:status', {
      status: 'disconnected',
      phoneNumber: null,
      profilePic: null,
    });
  }
}
