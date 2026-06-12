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
  saveProposal,
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
      const pagePrimaryColor = getSetting(targetUserId, 'page_primary_color') || '#e13a40';

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
        pageHeroImage,
        pagePrimaryColor
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
      const { name, phone, current_stage, project_value, pipeline_id } = req.body;
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
        pipeline_id: pipeline_id || 'principal',
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
      const { stage, reason, project_value, pipeline_id } = req.body;

      const contact = getContactById(userId, contactId);
      if (!contact) {
        return res.status(404).json({ error: 'Contato não encontrado.' });
      }

      // Handle pipeline_id update if present
      if (pipeline_id !== undefined) {
        try {
          upsertContact(userId, {
            id: contactId,
            pipeline_id: pipeline_id,
          });
        } catch (err) {
          console.error(`[Route:Contacts] User ${userId}: Error updating pipeline_id:`, err.message);
        }
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
        const targetPipeline = pipeline_id !== undefined ? pipeline_id : (contact.pipeline_id || 'principal');
        if (targetPipeline === 'principal' && !VALID_STAGES.includes(stage)) {
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

  // GET /api/contacts/public-contract-request/:userId/:contactId
  router.get('/public-contract-request/:userId/:contactId', async (req, res) => {
    const { userId, contactId } = req.params;
    try {
      const contact = getContactById(userId, contactId);
      if (!contact) {
        return res.status(404).json({ error: 'Contato não encontrado.' });
      }

      const companyName = getSetting(userId, 'profile_empresa') || 'NEXDASH';
      const companyLogo = getSetting(userId, 'profile_avatar') || getSetting(userId, 'onboarding_logo') || '';
      const servicesListStr = getSetting(userId, 'services_list') || '[]';
      const defaultContractTemplate = getSetting(userId, 'dgflow_active_template') || '';

      res.json({
        contact: {
          id: contact.id,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          project_interest: contact.project_interest || '',
          doc: contact.doc || '',
          cep: contact.cep || '',
          endereço: contact.endereço || '',
          numero: contact.numero || '',
          complemento: contact.complemento || '',
          bairro: contact.bairro || '',
          cidade: contact.cidade || '',
          estado: contact.estado || '',
          pais: contact.pais || 'Brasil',
          project_value: contact.project_value || 0
        },
        branding: {
          companyName,
          companyLogo,
          servicesList: JSON.parse(servicesListStr),
          defaultContractTemplate
        }
      });
    } catch (error) {
      console.error(`[PublicContractRequest] Error:`, error.message);
      res.status(500).json({ error: 'Erro ao obter dados da solicitação de contrato.' });
    }
  });

  // POST /api/contacts/public-contract-submit/:userId/:contactId
  router.post('/public-contract-submit/:userId/:contactId', async (req, res) => {
    const { userId, contactId } = req.params;
    try {
      const { 
        name, email, phone, doc, cep, endereço, 
        numero, complemento, bairro, cidade, estado, 
        pais, compiledContractText, projectName, amount, services
      } = req.body;

      const contact = getContactById(userId, contactId);
      if (!contact) {
        return res.status(404).json({ error: 'Contato não encontrado.' });
      }

      const previousStage = contact.current_stage;
      const targetStage = 'fechado';

      upsertContact(userId, {
        id: contactId,
        name,
        email,
        phone,
        current_stage: targetStage,
        last_activity: new Date().toISOString()
      });

      if (previousStage !== targetStage) {
        updateContactStage(userId, contactId, targetStage, 1.0, 'Preenchimento público de dados do contrato');
        const logEntry = {
          contact_id: contactId,
          previous_stage: previousStage,
          new_stage: targetStage,
          confidence: 1.0,
          reason: 'Preenchimento público de dados do contrato',
          was_manual: 1,
        };
        addClassificationLog(userId, logEntry);
      }

      try {
        await applyLabel(userId, contactId, targetStage, previousStage);
      } catch (err) {
        console.warn(`[Route:Contacts] Public submit user ${userId}: Failed to apply label:`, err.message);
      }

      const updatedContact = getContactById(userId, contactId);
      if (io) {
        io.to(`user_${userId}`).emit('contact:updated', updatedContact);
      }

      const newProposalId = `prop_${userId}_${Date.now()}`;
      const newProposal = {
        id: newProposalId,
        contact_id: contactId,
        clientName: name,
        clientPhone: phone || null,
        clientEmail: email || null,
        projectName: projectName || `Contrato - ${name}`,
        amount: parseFloat(amount) || 0,
        status: 'pending_review',
        description: `Contrato gerado a partir do formulário público de solicitação de dados para o projeto "${projectName}".`,
        compiledText: compiledContractText,
        services: services || [],
        subtotal: parseFloat(amount) || 0,
        discount: 0
      };

      saveProposal(userId, newProposal);

      if (io) {
        io.to(`user_${userId}`).emit('dgflow_proposals_updated', newProposal);
      }

      res.json({ success: true, proposalId: newProposalId });

    } catch (error) {
      console.error(`[PublicContractSubmit] Error:`, error.message);
      res.status(500).json({ error: 'Erro ao salvar os dados e gerar o contrato.' });
    }
  });

  return router;
}
