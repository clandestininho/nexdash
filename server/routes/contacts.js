import { Router } from 'express';
import {
  getContacts,
  getContactById,
  getContactHistory,
  updateContactStage,
  addClassificationLog,
  upsertContact,
  getMessages,
  clearChatHistory,
  getSetting,
} from '../db/database.js';
import { VALID_STAGES } from '../ai/classifier.js';
import { applyLabel } from '../whatsapp/labelManager.js';
import { authenticateToken } from '../middleware/auth.js';

/**
 * Create the contacts router with access to Socket.io.
 * @param {import('socket.io').Server} io
 * @returns {Router}
 */
export default function createContactsRouter(io) {
  const router = Router();

  // GET /api/contacts — return all contacts grouped by stage
  router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;
    try {
      const contacts = getContacts(userId);

      const stages = {};
      for (const stage of VALID_STAGES) {
        stages[stage] = [];
      }

      for (const contact of contacts) {
        const stage = contact.current_stage || 'novo-lead';
        if (!stages[stage]) {
          stages[stage] = [];
        }
        stages[stage].push(contact);
      }

      res.json({ stages });
    } catch (error) {
      console.error(`[Route:Contacts] User ${userId}: Error getting contacts:`, error.message);
      res.status(500).json({ error: 'Falha ao buscar contatos.' });
    }
  });

  // GET /api/contacts/public-info/:userId — Public endpoint to get white-label info and lead customizable fields
  router.get('/public-info/:userId', (req, res) => {
    try {
      const targetUserId = req.params.userId || '1';
      const companyName = getSetting(targetUserId, 'profile_empresa') || 'NEXDASH';
      const companyLogo = getSetting(targetUserId, 'profile_avatar') || getSetting(targetUserId, 'onboarding_logo') || '';
      const customFieldsStr = getSetting(targetUserId, 'lead_custom_fields') || '{"doc":true,"cep":true,"notes":true,"project_interest":true}';
      
      // Load public page customization settings saved via Visual Editor
      const pageBadgeText = getSetting(targetUserId, 'page_badge_text') || 'Design Profissional';
      const pageMainTitle = getSetting(targetUserId, 'page_main_title') || companyName;
      const pageSubtitleText = getSetting(targetUserId, 'page_subtitle_text') || '';
      const pageDescText = getSetting(targetUserId, 'page_desc_text') || '';
      const pageButtonText = getSetting(targetUserId, 'page_button_text') || 'Enviar Cadastro';
      const pageSecondaryBtnText = getSetting(targetUserId, 'page_secondary_btn_text') || 'Ver Portfólio';
      const pageHeroImage = getSetting(targetUserId, 'page_hero_image') || '';

      res.json({
        companyName,
        companyLogo,
        customFields: JSON.parse(customFieldsStr),
        // customization styles/texts
        pageBadgeText,
        pageMainTitle,
        pageSubtitleText,
        pageDescText,
        pageButtonText,
        pageSecondaryBtnText,
        pageHeroImage
      });
    } catch (error) {
      console.error(`[Route:Contacts] Public Info Error:`, error.message);
      res.status(500).json({ error: 'Falha ao buscar informações públicas.' });
    }
  });

  // POST /api/contacts/public-register — Public endpoint for self-registration
  router.post('/public-register', (req, res) => {
    try {
      const { 
        name, 
        phone, 
        email, 
        doc, 
        cep, 
        endereço, 
        numero, 
        complemento, 
        bairro, 
        cidade, 
        estado, 
        empresa, 
        obs, 
        userId 
      } = req.body;
      
      if (!name || !phone) {
        return res.status(400).json({ error: 'Nome e telefone são obrigatórios.' });
      }

      // Check if userId is provided, else fallback to '1'
      const targetUserId = userId || '1';

      // Format JID
      let jid = phone.replace(/\D/g, '');
      if (!jid.includes('@')) {
        jid = `${jid}@s.whatsapp.net`;
      }

      const newContact = {
        id: jid,
        name,
        phone: phone.replace(/\D/g, ''),
        email: email || '',
        current_stage: 'novo-lead',
        project_value: 0,
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Extra properties
        doc: doc || '',
        cep: cep || '',
        endereço: endereço || '',
        numero: numero || '',
        complemento: complemento || '',
        bairro: bairro || '',
        cidade: cidade || '',
        estado: estado || '',
        project_interest: empresa || '',
        last_message: obs || 'Lead se cadastrou via formulário externo NEXDASH.'
      };

      upsertContact(targetUserId, newContact);

      // Create initial log entry
      const logEntry = {
        contact_id: jid,
        previous_stage: null,
        new_stage: newContact.current_stage,
        confidence: 1.0,
        reason: 'Auto-cadastro via formulário externo NEXDASH',
        was_manual: 1
      };
      addClassificationLog(targetUserId, logEntry);

      if (io) {
        io.to(`user_${targetUserId}`).emit('contact:updated', newContact);
        io.to(`user_${targetUserId}`).emit('classification:new', {
          ...logEntry,
          contact_name: newContact.name
        });
      }

      res.status(201).json(newContact);
    } catch (error) {
      console.error(`[Route:Contacts] Public Register Error:`, error.message);
      res.status(500).json({ error: 'Falha ao processar cadastro de cliente.' });
    }
  });

  // POST /api/contacts — Create a new contact manually
  router.post('/', authenticateToken, (req, res) => {
    const userId = req.user.id;
    try {
      const { name, phone, current_stage, project_value } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ error: 'Nome e telefone são obrigatórios.' });
      }

      // Format JID
      let jid = phone;
      if (!jid.includes('@')) {
        jid = `${phone.replace(/\D/g, '')}@s.whatsapp.net`;
      }

      const newContact = {
        id: jid,
        name,
        phone: phone.replace(/\D/g, ''),
        current_stage: current_stage || 'novo-lead',
        project_value: parseFloat(project_value) || 0,
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      upsertContact(userId, newContact);

      // Create initial log entry
      const logEntry = {
        contact_id: jid,
        previous_stage: null,
        new_stage: newContact.current_stage,
        confidence: 1.0,
        reason: 'Criado manualmente no painel',
        was_manual: 1
      };
      addClassificationLog(userId, logEntry);

      if (io) {
        io.to(`user_${userId}`).emit('contact:updated', newContact);
        io.to(`user_${userId}`).emit('classification:new', {
          ...logEntry,
          contact_name: newContact.name
        });
      }

      res.status(201).json(newContact);
    } catch (error) {
      console.error(`[Route:Contacts] User ${userId}: Error creating contact:`, error.message);
      res.status(500).json({ error: 'Falha ao criar contato.' });
    }
  });

  // GET /api/contacts/:id — return single contact
  router.get('/:id', authenticateToken, (req, res) => {
    const userId = req.user.id;
    try {
      const contact = getContactById(userId, req.params.id);
      if (!contact) {
        return res.status(404).json({ error: 'Contato não encontrado.' });
      }
      res.json(contact);
    } catch (error) {
      console.error(`[Route:Contacts] User ${userId}: Error getting contact:`, error.message);
      res.status(500).json({ error: 'Falha ao buscar contato.' });
    }
  });

  // GET /api/contacts/:id/messages — return classification history for a contact
  router.get('/:id/history', authenticateToken, (req, res) => {
    const userId = req.user.id;
    try {
      const history = getContactHistory(userId, req.params.id);
      res.json(history);
    } catch (error) {
      console.error(`[Route:Contacts] User ${userId}: Error getting history:`, error.message);
      res.status(500).json({ error: 'Falha ao buscar histórico do contato.' });
    }
  });

  // GET /api/contacts/:id/messages — return chat history for a contact
  router.get('/:id/messages', authenticateToken, (req, res) => {
    const userId = req.user.id;
    try {
      const messages = getMessages(userId, req.params.id, 30);
      res.json(messages);
    } catch (error) {
      console.error(`[Route:Contacts] User ${userId}: Error getting messages:`, error.message);
      res.status(500).json({ error: 'Falha ao buscar mensagens do contato.' });
    }
  });

  // POST /api/contacts/:id/override — manual stage or project value override
  router.post('/:id/override', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const contactId = req.params.id;

    try {
      const { stage, reason, project_value } = req.body;

      const contact = getContactById(userId, contactId);
      if (!contact) {
        return res.status(404).json({ error: 'Contato não encontrado.' });
      }

      // Handle project value update if present
      if (project_value !== undefined) {
        try {
          upsertContact(userId, {
            id: contactId,
            project_value: parseFloat(project_value) || 0,
          });
        } catch (err) {
          console.error(`[Route:Contacts] User ${userId}: Error updating project value:`, err.message);
        }
      }

      // Handle stage override if stage is provided
      if (stage) {
        if (!VALID_STAGES.includes(stage)) {
          return res.status(400).json({
            error: `Estágio inválido. Deve ser um de: ${VALID_STAGES.join(', ')}`,
          });
        }

        const previousStage = contact.current_stage;

        // Update contact stage in isolated DB
        updateContactStage(userId, contactId, stage, 1.0, reason || 'Override manual');

        // Add classification log with was_manual = 1
        const logEntry = {
          contact_id: contactId,
          previous_stage: previousStage,
          new_stage: stage,
          confidence: 1.0,
          reason: reason || 'Override manual',
          was_manual: 1,
        };
        addClassificationLog(userId, logEntry);

        // Try to apply WhatsApp label for this user connection
        try {
          await applyLabel(userId, contactId, stage, previousStage);
        } catch (err) {
          console.warn(`[Route:Contacts] User ${userId}: Failed to apply label:`, err.message);
        }

        // Emit real-time updates ONLY to the user's specific room
        const updatedContact = getContactById(userId, contactId);

        if (io) {
          io.to(`user_${userId}`).emit('contact:updated', updatedContact);
          io.to(`user_${userId}`).emit('classification:new', {
            ...logEntry,
            contact_name: updatedContact?.name || contactId,
          });
        }

        return res.json(updatedContact);
      }

      // If only project value was updated
      const updatedContact = getContactById(userId, contactId);
      if (io) {
        io.to(`user_${userId}`).emit('contact:updated', updatedContact);
      }
      res.json(updatedContact);

    } catch (error) {
      console.error(`[Route:Contacts] User ${userId}: Error overriding contact:`, error.message);
      res.status(500).json({ error: 'Falha ao atualizar contato.' });
    }
  });

  // POST /api/contacts/clear-history - Clear message logs and classification history
  router.post('/clear-history', authenticateToken, (req, res) => {
    const userId = req.user.id;
    try {
      clearChatHistory(userId);
      res.json({ success: true });
    } catch (error) {
      console.error(`[Route:Contacts] User ${userId}: Error clearing chat history:`, error.message);
      res.status(500).json({ error: 'Falha ao limpar histórico de conversas.' });
    }
  });

  return router;
}
