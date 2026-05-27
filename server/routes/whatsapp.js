import { Router } from 'express';
import { getStatus, disconnectUser, connectUser, getSocket } from '../whatsapp/client.js';
import { authenticateToken } from '../middleware/auth.js';
import { getContacts, getContactById, saveMessage, upsertContact, getMessages, getSetting } from '../db/database.js';

/**
 * Create the WhatsApp router with access to Socket.io.
 * @param {import('socket.io').Server} io
 * @returns {Router}
 */
export default function createWhatsAppRouter(io) {
  const router = Router();

  // GET /api/whatsapp/status - Get status or trigger connect
  router.get('/status', authenticateToken, (req, res) => {
    try {
      const userId = req.user.id;
      let sessionStatus = getStatus(userId);

      // If completely offline and not in progress, auto-trigger WhatsApp socket setup
      if (sessionStatus.status === 'disconnected') {
        connectUser(userId).catch((err) => {
          console.error(`[Route:WhatsApp] User ${userId}: Background auto-connect failed:`, err.message);
        });
        sessionStatus.status = 'connecting';
      }

      res.json(sessionStatus);
    } catch (error) {
      console.error(`[Route:WhatsApp] Error getting status for user ${req.user.id}:`, error.message);
      res.status(500).json({ error: 'Falha ao buscar status do WhatsApp.' });
    }
  });

  // GET /api/whatsapp/qr - Get current scan QR code
  router.get('/qr', authenticateToken, (req, res) => {
    try {
      const userId = req.user.id;
      const { qrCode } = getStatus(userId);
      res.json({ qr: qrCode });
    } catch (error) {
      console.error(`[Route:WhatsApp] Error getting QR code for user ${req.user.id}:`, error.message);
      res.status(500).json({ error: 'Falha ao buscar QR code.' });
    }
  });

  // POST /api/whatsapp/disconnect - Disconnect and clear credentials
  router.post('/disconnect', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      await disconnectUser(userId, true); // true to completely wipe local session directory
      res.json({ success: true });
    } catch (error) {
      console.error(`[Route:WhatsApp] Error disconnecting user ${req.user.id}:`, error.message);
      res.status(500).json({ error: 'Falha ao desconectar do WhatsApp.' });
    }
  });

  // GET /api/whatsapp/chats - Get active unique conversations sorted by last activity
  router.get('/chats', authenticateToken, (req, res) => {
    try {
      const userId = req.user.id;
      const contacts = getContacts(userId);
      res.json(contacts);
    } catch (error) {
      console.error(`[Route:WhatsApp] Error fetching chats for user ${req.user.id}:`, error.message);
      res.status(500).json({ error: 'Falha ao buscar conversas.' });
    }
  });

  // GET /api/whatsapp/groups - Fetch active groups from Baileys socket
  router.get('/groups', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const sock = getSocket(userId);

      if (!sock) {
        return res.json([]); // Return empty list cleanly if socket is offline
      }

      const groupsDict = await sock.groupFetchAllParticipating();
      const groupsList = Object.values(groupsDict).map((g) => ({
        id: g.id,
        subject: g.subject,
        size: g.participants?.length || 0,
        owner: g.owner || g.creator || '',
        creation: g.creation || 0,
      }));

      res.json(groupsList);
    } catch (error) {
      console.error(`[Route:WhatsApp] Error fetching WhatsApp groups for user ${req.user.id}:`, error.message);
      res.status(500).json({ error: 'Falha ao sincronizar grupos do WhatsApp.' });
    }
  });

  // POST /api/whatsapp/send - Send a manual message through the socket and save to DB
  router.post('/send', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { jid, text } = req.body;

      if (!jid || !text) {
        return res.status(400).json({ error: 'Número/JID e texto são obrigatórios.' });
      }

      const sock = getSocket(userId);
      if (!sock) {
        return res.status(400).json({ error: 'WhatsApp desconectado. Por favor, conecte o aparelho na aba Conexão.' });
      }

      let targetJid = jid;
      if (!targetJid.includes('@')) {
        targetJid = `${targetJid.replace(/\D/g, '')}@s.whatsapp.net`;
      }

      // Send via Baileys socket
      await sock.sendMessage(targetJid, { text });

      // Save message in local SQLite messages table
      const msgId = 'manual_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const timestamp = new Date().toISOString();

      const messageData = {
        id: msgId,
        contact_id: targetJid,
        content: text,
        from_me: 1,
        timestamp,
      };

      saveMessage(userId, messageData);

      // Fetch or create contact details to record last message
      let contact = getContactById(userId, targetJid);
      const now = new Date().toISOString();

      if (!contact) {
        const phone = targetJid.split('@')[0];
        contact = {
          id: targetJid,
          name: phone,
          phone,
          last_message: text,
          last_activity: now,
          created_at: now,
          updated_at: now,
        };
      } else {
        contact.last_message = text;
        contact.last_activity = now;
        contact.updated_at = now;
      }

      upsertContact(userId, contact);

      const updatedContact = getContactById(userId, targetJid) || contact;

      // Broadcast changes to active client screens
      if (io) {
        io.to(`user_${userId}`).emit('message:new', messageData);
        io.to(`user_${userId}`).emit('contact:updated', updatedContact);
      }

      res.json({ success: true, message: messageData, contact: updatedContact });
    } catch (error) {
      console.error(`[Route:WhatsApp] Error sending message for user ${req.user.id}:`, error.message);
      res.status(500).json({ error: `Falha ao enviar mensagem: ${error.message}` });
    }
  });

  // POST /api/whatsapp/ai-suggest - Generate an AI response recommendation based on recent history
  router.post('/ai-suggest', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { jid } = req.body;

      if (!jid) {
        return res.status(400).json({ error: 'O ID do contato (JID) é obrigatório.' });
      }

      const recentMessages = getMessages(userId, jid, 15);
      if (recentMessages.length === 0) {
        return res.json({ suggestion: 'Olá! Como posso te ajudar hoje?' });
      }

      const provider = getSetting(userId, 'ai_provider') || 'gemini';
      const geminiKey = getSetting(userId, 'gemini_api_key') || process.env.GEMINI_API_KEY;
      const claudeKey = getSetting(userId, 'anthropic_api_key') || process.env.ANTHROPIC_API_KEY;

      const activeKey = provider === 'gemini' ? geminiKey : claudeKey;
      if (!activeKey) {
        return res.status(400).json({ error: 'Nenhuma chave de API de IA configurada. Preencha na aba Configurações.' });
      }

      // Format recent chat history
      const formattedHistory = recentMessages
        .map((m) => `${m.from_me === 1 ? 'Você' : 'Cliente'}: ${m.content}`)
        .join('\n');

      const companyName = getSetting(userId, 'profile_empresa') || 'NEXDASH';
      const systemPrompt = `Você é o assistente de atendimento inteligente da empresa "${companyName}", no Brasil.
Analise o histórico recente da conversa e sugira uma resposta curta, profissional, empática e altamente persuasiva para o cliente (em português).
Não invente informações não fornecidas. Mantenha um tom caloroso e adequado para fechar vendas.
Retorne APENAS o texto da mensagem sugerida, sem explicações extras, sem aspas e sem introduções.`;

      let suggestion = '';

      if (provider === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `${systemPrompt}\n\nHistórico da Conversa:\n${formattedHistory}\n\nSugira a melhor resposta:` }]
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini respondeu com status ${response.status}`);
        }

        const data = await response.json();
        suggestion = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        // Claude 3.5 request using standard fetch
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': activeKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 150,
            system: systemPrompt,
            messages: [{ role: 'user', content: `Histórico da Conversa:\n${formattedHistory}\n\nSugira a melhor resposta:` }]
          })
        });

        if (!response.ok) {
          throw new Error(`Claude respondeu com status ${response.status}`);
        }

        const data = await response.json();
        suggestion = data.content?.[0]?.text || '';
      }

      // Cleanup response formatting
      suggestion = suggestion.trim().replace(/^"|"$/g, '');
      res.json({ suggestion });
    } catch (error) {
      console.error(`[Route:WhatsApp] AI suggestion error for user ${req.user.id}:`, error.message);
      res.status(500).json({ error: `Falha ao gerar sugestão de IA: ${error.message}` });
    }
  });

  return router;
}
