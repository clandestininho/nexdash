import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

import authRoutes from './routes/auth.js';
import whatsappRoutes from './routes/whatsapp.js';
import createContactsRouter from './routes/contacts.js';
import settingsRoutes from './routes/settings.js';
import adminRoutes from './routes/admin.js';
import proposalsRouter, { registerProposalsIo } from './routes/proposals.js';
import { init as initWhatsAppClient } from './whatsapp/client.js';
import { initDatabase } from './db/database.js';
import { initScheduler } from './db/scheduler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'millalipe-crm-super-secret-key-saas';

// ─── Express App ─────────────────────────────────────────────────────────────

const app = express();
app.set('trust proxy', 1);
const httpServer = createServer(app);

// ─── Socket.io ───────────────────────────────────────────────────────────────

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
  },
});

// Socket.io JWT Authentication Middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
}));
app.use(express.json({ limit: '10mb' }));

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/whatsapp', whatsappRoutes(io));
app.use('/api/contacts', createContactsRouter(io));
app.use('/api/admin', adminRoutes);
app.use('/api', settingsRoutes);
app.use('/api', proposalsRouter);
registerProposalsIo(io);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy endpoint to fetch external calendar .ics files bypassing CORS
app.get('/api/proxy-ical', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL parameter is required' });
  try {
    const fetchResponse = await fetch(url);
    if (!fetchResponse.ok) throw new Error(`HTTP error! status: ${fetchResponse.status}`);
    const icsContent = await fetchResponse.text();
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.send(icsContent);
  } catch (err) {
    console.error('Error proxying iCal feed:', err);
    res.status(500).json({ error: 'Failed to fetch calendar feed' });
  }
});

// ─── Socket.io Events ───────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id} (User ID: ${socket.userId})`);

  // Join user-specific isolated room for status and chat updates
  if (socket.userId) {
    const userRoom = `user_${socket.userId}`;
    socket.join(userRoom);
    console.log(`[Socket.io] Socket ${socket.id} joined room ${userRoom}`);
  }

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.io] Client disconnected: ${socket.id} (${reason})`);
  });
});

// Serve static uploads
const uploadsPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// ─── Static Files (Production) ──────────────────────────────────────────────

const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback — serve index.html for any unmatched routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });

  console.log(`[Server] Serving static files from ${clientDistPath}`);
}

// ─── Start Server ────────────────────────────────────────────────────────────

httpServer.listen(PORT, async () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     Estúdio Milla & Lipe CRM — Server          ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  🚀 HTTP Server:  http://localhost:${PORT}         ║`);
  console.log(`║  🔌 Socket.io:    ws://localhost:${PORT}           ║`);
  console.log('║  📊 Dashboard:    http://localhost:5173          ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');

  // Initialize database first
  try {
    await initDatabase();
    console.log('[Server] Database initialized.');
  } catch (error) {
    console.error('[Server] Failed to initialize database:', error.message);
    process.exit(1);
  }

  // Initialize WhatsApp client
  try {
    await initWhatsAppClient(io);
    console.log('[Server] WhatsApp client initialized.');
  } catch (error) {
    console.error('[Server] Failed to initialize WhatsApp client:', error.message);
  }

  // Initialize background automation scheduler
  try {
    initScheduler();
  } catch (error) {
    console.error('[Server] Failed to initialize scheduler daemon:', error.message);
  }

  console.log('[Server] All systems ready. Waiting for connections...');
});

// ─── Graceful Shutdown ───────────────────────────────────────────────────────

function gracefulShutdown(signal) {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);

  io.close(() => {
    console.log('[Server] Socket.io connections closed.');
  });

  httpServer.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('[Server] Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
