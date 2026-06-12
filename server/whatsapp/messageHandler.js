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

  // Skip group and channel/newsletter messages
  if (jid.endsWith('@g.us') || jid.endsWith('@newsletter')) return;

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
  const phone = jid.split('@')[0];
  let contactName = undefined;

  if (fromMe === 0) {
    contactName = message.pushName || phone;
  } else {
    // If the message is from me, only set the name as phone if the contact does not exist yet
    const existing = getContactById(uId, jid);
    if (!existing) {
      contactName = phone;
    }
  }

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

  const contactPipeline = contact.pipeline_id || 'principal';

  // Run active AI auto-responder if enabled and message is from contact (not me) and contact is in principal pipeline
  const responderEnabled = getSetting(uId, 'ai_responder_enabled') === 'true';
  if (responderEnabled && fromMe === 0 && contactPipeline === 'principal') {
    runAutoResponder(uId, jid, text, sock).catch((err) => {
      console.error(`[AutoResponder] User ${uId}: Error in auto-responder:`, err.message);
    });
  }

  // Skip AI classification if not in principal pipeline
  if (contactPipeline !== 'principal') {
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
        contact_name: updatedContact?.name || contactName || phone,
      });
    }

    console.log(
      `[MessageHandler] User ${uId}: ${updatedContact?.name || contactName || phone} (${jid}): ${previousStage} → ${result.stage} (confidence: ${result.confidence})`
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

/**
 * Run the active AI Auto-Responder Chatbot using Gemini 2.5 Flash.
 */
async function runAutoResponder(uId, jid, text, sock) {
  try {
    const apiKey = getSetting(uId, 'gemini_api_key') || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn(`[AutoResponder] User ${uId}: No Gemini API key configured. Skipping response.`);
      return;
    }

    // Get delay in seconds
    const delaySec = parseInt(getSetting(uId, 'ai_responder_delay') || '4', 10);

    // Update presence to composing (typing status)
    try {
      await sock.sendPresenceUpdate('composing', jid);
    } catch (e) {
      console.warn(`[AutoResponder] User ${uId}: Failed to send composing status:`, e.message);
    }

    // Wait for the configured delay
    await new Promise((resolve) => setTimeout(resolve, delaySec * 1000));

    // Get instructions and contact messages for conversation context
    const instructions = getSetting(uId, 'ai_responder_instructions') || '';
    const companyName = getSetting(uId, 'profile_empresa') || 'NEXDASH';
    const recentMessages = getMessages(uId, jid, 10);
    const conversationContext = recentMessages
      .map((msg) => `${msg.from_me ? 'Atendente' : 'Cliente'}: ${msg.content}`)
      .join('\n');

    const systemPrompt = `Você é o assistente virtual inteligente da empresa "${companyName}".
Seu objetivo é atender o cliente de forma extremamente natural, prestativa e amigável no WhatsApp, seguindo estritamente as instruções e FAQ abaixo.

## Manual de Atendimento da Empresa:
${instructions}

## Regras Importantes:
1. Responda apenas com a mensagem a ser enviada ao cliente. NÃO adicione prefixos como "Atendente:", "Resposta:" ou aspas no início/fim.
2. Seja natural, simpático, use emojis de forma moderada e evite respostas excessivamente formais.
3. Não invente informações que não estejam no manual. Se não souber responder algo sobre a empresa, peça desculpas de forma amigável e diga que irá transferir para um atendente humano.
4. Escreva respostas relativamente curtas e fáceis de ler (com quebras de linha amigáveis).

## Histórico Recente da Conversa:
${conversationContext}

Responda à última mensagem do Cliente de forma natural e direta.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }]
          }
        ]
      })
    });

    // Update presence to paused
    try {
      await sock.sendPresenceUpdate('paused', jid);
    } catch (e) {}

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    let replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText || !replyText.trim()) {
      console.warn(`[AutoResponder] User ${uId}: Empty reply from Gemini.`);
      return;
    }

    replyText = replyText.trim();

    // Send the message via WhatsApp
    const sentMsg = await sock.sendMessage(jid, { text: replyText });

    // Save to database
    const timestamp = new Date().toISOString();
    const messageData = {
      id: sentMsg.key.id,
      contact_id: jid,
      content: replyText,
      from_me: 1,
      timestamp,
    };
    saveMessage(uId, messageData);

    // Upsert contact
    upsertContact(uId, {
      id: jid,
      last_message: replyText,
      last_activity: timestamp,
    });

    // Emit updates
    if (io) {
      io.to(`user_${uId}`).emit('message:new', messageData);
      const updatedContact = getContactById(uId, jid);
      if (updatedContact) {
        io.to(`user_${uId}`).emit('contact:updated', updatedContact);
      }
    }

    console.log(`[AutoResponder] User ${uId}: Replied to ${jid} successfully.`);
  } catch (err) {
    console.error(`[AutoResponder] User ${uId}: Error generating/sending AI response:`, err.message);
  }
}
