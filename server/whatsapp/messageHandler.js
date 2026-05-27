import { classifyConversation } from '../ai/classifier.js';
import {
  saveMessage,
  upsertContact,
  getContactById,
  getMessages,
  getSetting,
  updateContactStage,
  addClassificationLog,
} from '../db/database.js';
import { applyLabel, syncLabels } from './labelManager.js';

let io = null;

/**
 * Register a active WhatsApp socket for a user to listen for new messages.
 * @param {string|number} userId
 * @param {object} sock - Baileys socket instance
 * @param {import('socket.io').Server} socketIo
 */
export function registerSocket(userId, sock, socketIo) {
  io = socketIo;
  const uId = String(userId);

  // Sync WhatsApp Business labels for this user
  syncLabels(uId).catch((err) => {
    console.warn(`[MessageHandler] User ${uId}: Initial label sync failed:`, err.message);
  });

  // Attach upsert message listener
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const message of messages) {
      try {
        await handleMessage(uId, message, sock);
      } catch (error) {
        console.error(`[MessageHandler] User ${uId}: Error handling message:`, error.message);
      }
    }
  });

  console.log(`[MessageHandler] User ${uId}: Event listeners attached to active connection.`);
}

/**
 * Handle a single incoming message for a specific tenant.
 * @param {string} uId - User JID owner
 * @param {object} message - The Baileys message object
 * @param {object} sock - Baileys socket instance
 */
async function handleMessage(uId, message, sock) {
  // Skip if no message content
  if (!message.message) return;

  const jid = message.key.remoteJid;

  // Skip status broadcasts
  if (jid === 'status@broadcast') return;

  // Skip group messages
  if (jid.endsWith('@g.us')) return;

  // Extract message text
  const text =
    message.message.conversation ||
    message.message.extendedTextMessage?.text ||
    '';

  // Skip empty text messages
  if (!text.trim()) return;

  const fromMe = message.key.fromMe ? 1 : 0;
  const timestamp = message.messageTimestamp
    ? new Date(Number(message.messageTimestamp) * 1000).toISOString()
    : new Date().toISOString();
  const now = new Date().toISOString();

  // Save message to isolated database
  try {
    const messageData = {
      id: message.key.id,
      contact_id: jid,
      content: text,
      from_me: fromMe,
      timestamp,
    };
    saveMessage(uId, messageData);
    if (io) {
      io.to(`user_${uId}`).emit('message:new', messageData);
    }
  } catch (err) {
    console.error(`[MessageHandler] User ${uId}: Failed to save message:`, err.message);
  }

  // Upsert contact to isolated database
  const contactName = message.pushName || jid.split('@')[0];
  const phone = jid.split('@')[0];

  try {
    upsertContact(uId, {
      id: jid,
      name: contactName,
      phone,
      last_message: text,
      last_activity: now,
    });
  } catch (err) {
    console.error(`[MessageHandler] User ${uId}: Failed to upsert contact:`, err.message);
  }

  // Get fresh contact data
  const contact = getContactById(uId, jid);
  if (!contact) return;

  // Skip blacklisted contacts
  if (contact.is_blacklisted) {
    return;
  }

  // Check cooldown
  const cooldownMinutes = parseInt(getSetting(uId, 'cooldown_minutes') || '30', 10);
  if (contact.last_classified) {
    const lastClassified = new Date(contact.last_classified);
    const cooldownMs = cooldownMinutes * 60 * 1000;
    const elapsed = Date.now() - lastClassified.getTime();

    if (elapsed < cooldownMs) {
      console.log(
        `[MessageHandler] User ${uId}: Cooldown active for ${jid}. ${Math.round((cooldownMs - elapsed) / 1000)}s remaining.`
      );
      return;
    }
  }

  // Get last 15 messages for this contact from database
  const recentMessages = getMessages(uId, jid, 15);

  if (recentMessages.length === 0) return;

  // Format conversation text
  const conversationText = recentMessages
    .map((msg) => {
      const sender = msg.from_me ? 'Você' : 'Cliente';
      return `${sender}: ${msg.content}`;
    })
    .join('\n');

  // Classify conversation with customer settings
  const result = await classifyConversation(uId, conversationText);

  if (!result) return;

  // Check minimum confidence
  const minConfidence = parseFloat(getSetting(uId, 'min_confidence') || '0.85');

  if (result.confidence < minConfidence) {
    console.log(
      `[MessageHandler] User ${uId}: Classification confidence too low for ${jid}: ${result.confidence} < ${minConfidence} (stage: ${result.stage}, reason: ${result.reason})`
    );
    return;
  }

  // Check if stage changed
  if (result.stage !== contact.current_stage) {
    const previousStage = contact.current_stage;

    // Update contact stage in DB
    try {
      updateContactStage(uId, jid, result.stage, result.confidence, result.reason);
    } catch (err) {
      console.error(`[MessageHandler] User ${uId}: Failed to update contact stage:`, err.message);
    }

    // Add classification log entry
    const logEntry = {
      contact_id: jid,
      previous_stage: previousStage,
      new_stage: result.stage,
      confidence: result.confidence,
      reason: result.reason,
      was_manual: 0,
    };

    try {
      addClassificationLog(uId, logEntry);
    } catch (err) {
      console.error(`[MessageHandler] User ${uId}: Failed to add classification log:`, err.message);
    }

    // Try to apply WhatsApp label
    try {
      await applyLabel(uId, jid, result.stage, previousStage);
    } catch (err) {
      console.error(`[MessageHandler] User ${uId}: Failed to apply label:`, err.message);
    }

    // Emit real-time updates via Socket.io ONLY to the user room
    const updatedContact = getContactById(uId, jid);
    if (io) {
      io.to(`user_${uId}`).emit('contact:updated', updatedContact);
      io.to(`user_${uId}`).emit('classification:new', {
        ...logEntry,
        contact_name: updatedContact?.name || contactName,
      });
    }

    console.log(
      `[MessageHandler] User ${uId}: ${contactName} (${jid}): ${previousStage} → ${result.stage} (confidence: ${result.confidence})`
    );
  } else {
    // Stage is the same, but still update last_classified timestamp
    try {
      updateContactStage(uId, jid, result.stage, result.confidence, result.reason);
    } catch (err) {
      console.error(`[MessageHandler] User ${uId}: Failed to update last_classified:`, err.message);
    }
  }
}
