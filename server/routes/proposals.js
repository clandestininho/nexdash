import { Router } from 'express';
import {
  getProposals,
  getProposalById,
  saveProposal,
  deleteProposal,
  getSettings,
  saveSetting,
  getContactById,
  updateContactStage,
  addClassificationLog,
} from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
let ioInstance = null;

// Allow registering the Socket.io instance
export function registerProposalsIo(io) {
  ioInstance = io;
}

// ─── ADMIN ENDPOINTS ─────────────────────────────────────────────────────────

// GET /api/proposals - Get all proposals for the tenant
router.get('/proposals', authenticateToken, (req, res) => {
  const userId = req.user.id;
  try {
    const proposals = getProposals(userId);
    res.json(proposals);
  } catch (error) {
    console.error(`[Route:Proposals] User ${userId}: Error getting proposals:`, error.message);
    res.status(500).json({ error: 'Falha ao carregar orçamentos.' });
  }
});

// GET /api/proposals/:id - Get a single proposal for the tenant
router.get('/proposals/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const proposal = getProposalById(userId, id);
    if (!proposal) {
      return res.status(404).json({ error: 'Orçamento não encontrado.' });
    }
    res.json(proposal);
  } catch (error) {
    console.error(`[Route:Proposals] User ${userId}: Error getting proposal ${id}:`, error.message);
    res.status(500).json({ error: 'Falha ao carregar orçamento.' });
  }
});

// POST /api/proposals - Save (create or update) a proposal for the tenant
router.post('/proposals', authenticateToken, (req, res) => {
  const userId = req.user.id;
  try {
    const proposalData = req.body;
    if (!proposalData.id) {
      return res.status(400).json({ error: 'ID do orçamento é obrigatório.' });
    }

    const saved = saveProposal(userId, {
      ...proposalData,
      amount: Number(proposalData.amount || 0),
      subtotal: Number(proposalData.subtotal || 0),
      discount: Number(proposalData.discount || 0),
    });

    // Notify client-side via sockets if needed
    if (ioInstance) {
      ioInstance.to(`user_${userId}`).emit('proposal:updated', saved);
    }

    res.json(saved);
  } catch (error) {
    console.error(`[Route:Proposals] User ${userId}: Error saving proposal:`, error.message);
    res.status(500).json({ error: 'Falha ao salvar orçamento.' });
  }
});

// DELETE /api/proposals/:id - Delete a proposal for the tenant
router.delete('/proposals/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    deleteProposal(userId, id);
    if (ioInstance) {
      ioInstance.to(`user_${userId}`).emit('proposal:deleted', id);
    }
    res.json({ success: true });
  } catch (error) {
    console.error(`[Route:Proposals] User ${userId}: Error deleting proposal ${id}:`, error.message);
    res.status(500).json({ error: 'Falha ao excluir orçamento.' });
  }
});


// ─── PUBLIC CUSTOMER ENDPOINTS ──────────────────────────────────────────────

// GET /api/public/proposals/:id - Fetch public proposal for customer signature view
router.get('/public/proposals/:id', (req, res) => {
  try {
    const { id } = req.params;
    const parts = id.split('_');
    if (parts.length < 3 || parts[0] !== 'prop') {
      return res.status(400).json({ error: 'Formato de link de proposta inválido.' });
    }

    const userId = parts[1];
    const proposal = getProposalById(userId, id);
    if (!proposal) {
      return res.status(404).json({ error: 'Orçamento/Proposta não encontrada.' });
    }

    const settings = getSettings(userId);
    res.json({
      proposal,
      branding: {
        companyName: settings.profile_empresa || 'NEXDASH',
        primaryColor: settings.proposal_primary_color || '#e13a40',
        secondaryColor: settings.proposal_secondary_color || '#0f766e',
        customTitle: settings.proposal_title || '',
        customWelcome: settings.proposal_welcome || '',
        customBtnText: settings.proposal_btn_text || '',
        customThanks: settings.proposal_thanks || '',
        showReviews: settings.proposal_show_reviews === 'true',
        showProjects: settings.proposal_show_projects !== 'false',
        maxProjects: parseInt(settings.proposal_max_projects || '4', 10),
        proposalLogo: settings.proposal_logo || '',
        proposalFavicon: settings.proposal_favicon || '',
        currency: settings.profile_moeda || 'BRL'
      },
      gateways: {
        asaas: !!settings.asaas_api_key,
        mercadopago: !!settings.mercadopago_api_key,
        stripe: !!settings.stripe_api_key
      }
    });
  } catch (error) {
    console.error('[Route:Proposals] Public fetch error:', error.message);
    res.status(500).json({ error: 'Erro ao carregar proposta pública.' });
  }
});

// POST /api/public/proposals/:id/approve - Customer signs and digitally approves the proposal
router.post('/public/proposals/:id/approve', (req, res) => {
  try {
    const { id } = req.params;
    const { signerName, signerCpf, signerRubrica, signatureImage } = req.body;
    
    if (!signerName || !signerCpf) {
      return res.status(400).json({ error: 'Nome e CPF são obrigatórios para a assinatura digital.' });
    }

    const parts = id.split('_');
    if (parts.length < 3 || parts[0] !== 'prop') {
      return res.status(400).json({ error: 'ID de proposta inválido.' });
    }

    const userId = parts[1];
    const proposal = getProposalById(userId, id);
    if (!proposal) {
      return res.status(404).json({ error: 'Orçamento não encontrado.' });
    }

    const updated = saveProposal(userId, {
      ...proposal,
      status: 'approved',
      signerName,
      signerCpf,
      signerRubrica,
      signatureImage,
      approvedDate: new Date().toLocaleDateString('pt-BR')
    });

    // Move contact to "fechado" in the Kanban SQLite DB when signed
    if (proposal.contact_id) {
      try {
        const contact = getContactById(userId, proposal.contact_id);
        if (contact && contact.current_stage !== 'fechado') {
          const previousStage = contact.current_stage;
          updateContactStage(userId, proposal.contact_id, 'fechado', 1.0, 'Proposta comercial assinada/aprovada digitalmente pelo cliente');
          
          const logEntry = {
            contact_id: proposal.contact_id,
            previous_stage: previousStage,
            new_stage: 'fechado',
            confidence: 1.0,
            reason: 'Proposta comercial assinada/aprovada digitalmente pelo cliente',
            was_manual: 0
          };
          addClassificationLog(userId, logEntry);

          if (ioInstance) {
            const updatedContact = getContactById(userId, proposal.contact_id);
            ioInstance.to(`user_${userId}`).emit('contact:updated', updatedContact);
            ioInstance.to(`user_${userId}`).emit('classification:new', {
              ...logEntry,
              contact_name: updatedContact?.name || proposal.clientName
            });
          }
        }
      } catch (err) {
        console.error('[Route:Proposals] Error updating contact stage on signature:', err.message);
      }
    }

    // Notify backend WebSocket that proposal was approved (client signed)
    if (ioInstance) {
      ioInstance.to(`user_${userId}`).emit('proposal:updated', updated);
    }

    res.json({ success: true, proposal: updated });
  } catch (error) {
    console.error('[Route:Proposals] Approval error:', error.message);
    res.status(500).json({ error: 'Erro ao aprovar proposta.' });
  }
});

// POST /api/public/proposals/:id/pay-simulate - Simulate payment webhook callback
router.post('/public/proposals/:id/pay-simulate', (req, res) => {
  try {
    const { id } = req.params;
    const { method } = req.body; // PIX, STRIPE, etc.
    
    const parts = id.split('_');
    if (parts.length < 3 || parts[0] !== 'prop') {
      return res.status(400).json({ error: 'ID de proposta inválido.' });
    }

    const userId = parts[1];
    const proposal = getProposalById(userId, id);
    if (!proposal) {
      return res.status(404).json({ error: 'Orçamento não encontrado.' });
    }

    // Update proposal to paid
    const updated = saveProposal(userId, {
      ...proposal,
      status: 'approved',
      payment_status: 'PAID',
      payment_method: method || 'PIX',
      approvedDate: proposal.approvedDate || new Date().toLocaleDateString('pt-BR')
    });

    // Move contact to "fechado" in the Kanban SQLite DB
    if (proposal.contact_id) {
      try {
        const contact = getContactById(userId, proposal.contact_id);
        if (contact && contact.current_stage !== 'fechado') {
          const previousStage = contact.current_stage;
          updateContactStage(userId, proposal.contact_id, 'fechado', 1.0, 'Simulação de Pagamento de Proposta Efetuado');
          
          const logEntry = {
            contact_id: proposal.contact_id,
            previous_stage: previousStage,
            new_stage: 'fechado',
            confidence: 1.0,
            reason: 'Pagamento confirmado via Proposta Comercial (Simulado)',
            was_manual: 0
          };
          addClassificationLog(userId, logEntry);

          if (ioInstance) {
            const updatedContact = getContactById(userId, proposal.contact_id);
            ioInstance.to(`user_${userId}`).emit('contact:updated', updatedContact);
            ioInstance.to(`user_${userId}`).emit('classification:new', {
              ...logEntry,
              contact_name: updatedContact?.name || proposal.clientName
            });
          }
        }
      } catch (err) {
        console.error('[Route:Proposals] Kanban update error:', err.message);
      }
    }

    // Emit live real-time Socket.io payment notice to admin (triggers cash register sound)
    if (ioInstance) {
      ioInstance.to(`user_${userId}`).emit('proposal:updated', updated);
      ioInstance.to(`user_${userId}`).emit('payment:received', {
        proposalId: id,
        amount: proposal.amount,
        clientName: proposal.clientName,
        projectName: proposal.projectName,
        paymentMethod: method || 'PIX'
      });
    }

    res.json({ success: true, proposal: updated });
  } catch (error) {
    console.error('[Route:Proposals] Pay simulation error:', error.message);
    res.status(500).json({ error: 'Erro ao processar simulação de pagamento.' });
  }
});


// ─── GATEWAY MULTI-TENANT WEBHOOKS ───────────────────────────────────────────

// POST /api/payments/webhook/:userId - Master endpoint for Mercado Pago / Asaas / Stripe Webhooks
router.post('/payments/webhook/:userId', async (req, res) => {
  const { userId } = req.params;
  const payload = req.body;

  try {
    console.log(`[Webhook] User ${userId}: Received payment gateway callback.`);

    // 1. AS A AS WEBHOOK
    if (payload.event && payload.payment) {
      const isPaid = payload.event === 'PAYMENT_RECEIVED' || payload.event === 'PAYMENT_CONFIRMED';
      if (isPaid) {
        const asaasPay = payload.payment;
        const externalId = asaasPay.externalReference; // Storing proposal ID here!
        if (externalId && externalId.startsWith('prop_')) {
          handleSuccessPayment(userId, externalId, 'PIX');
        }
      }
    }

    // 2. MERCADO PAGO WEBHOOK
    else if (payload.action && payload.data?.id) {
      const action = payload.action;
      if (action === 'payment.created' || action === 'payment.updated') {
        const mpPaymentId = payload.data.id;
        // Verify payment with Mercado Pago API using individual keys
        const settings = getSettings(userId);
        const mpToken = settings.mercadopago_api_key;
        if (mpToken) {
          const verifyUrl = `https://api.mercadopago.com/v1/payments/${mpPaymentId}`;
          const mpRes = await fetch(verifyUrl, {
            headers: { 'Authorization': `Bearer ${mpToken}` }
          });
          if (mpRes.ok) {
            const paymentInfo = await mpRes.json();
            if (paymentInfo.status === 'approved') {
              const externalId = paymentInfo.external_reference; // Storing proposal ID here!
              if (externalId && externalId.startsWith('prop_')) {
                handleSuccessPayment(userId, externalId, 'PIX');
              }
            }
          }
        }
      }
    }

    // 3. STRIPE WEBHOOK
    else if (payload.type && payload.data?.object) {
      const stripeEvent = payload;
      if (stripeEvent.type === 'checkout.session.completed') {
        const session = stripeEvent.data.object;
        const externalId = session.client_reference_id || session.metadata?.proposalId;
        if (externalId && externalId.startsWith('prop_')) {
          handleSuccessPayment(userId, externalId, 'Cartão de Crédito (Stripe)');
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`[Webhook] User ${userId}: Webhook process failure:`, error.message);
    res.status(500).json({ error: 'Erro ao processar notificação de pagamento.' });
  }
});

/**
 * Handle a successful payment, updating state across systems and notifying the client.
 */
function handleSuccessPayment(userId, proposalId, method) {
  try {
    const proposal = getProposalById(userId, proposalId);
    if (!proposal) {
      console.warn(`[Webhook] User ${userId}: Proposal ${proposalId} not found in database.`);
      return;
    }

    if (proposal.payment_status === 'PAID') {
      console.log(`[Webhook] User ${userId}: Proposal ${proposalId} was already processed paid.`);
      return;
    }

    // Update proposal paid status
    const updated = saveProposal(userId, {
      ...proposal,
      status: 'approved',
      payment_status: 'PAID',
      payment_method: method || 'PIX',
      approvedDate: proposal.approvedDate || new Date().toLocaleDateString('pt-BR')
    });

    // Move stage to 'fechado' in SQLite contact record
    if (proposal.contact_id) {
      try {
        const contact = getContactById(userId, proposal.contact_id);
        if (contact && contact.current_stage !== 'fechado') {
          const previousStage = contact.current_stage;
          updateContactStage(userId, proposal.contact_id, 'fechado', 1.0, 'Pagamento confirmado via gateway');
          
          const logEntry = {
            contact_id: proposal.contact_id,
            previous_stage: previousStage,
            new_stage: 'fechado',
            confidence: 1.0,
            reason: `Pagamento recebido via gateway (${method})`,
            was_manual: 0
          };
          addClassificationLog(userId, logEntry);

          if (ioInstance) {
            const updatedContact = getContactById(userId, proposal.contact_id);
            ioInstance.to(`user_${userId}`).emit('contact:updated', updatedContact);
            ioInstance.to(`user_${userId}`).emit('classification:new', {
              ...logEntry,
              contact_name: updatedContact?.name || proposal.clientName
            });
          }
        }
      } catch (err) {
        console.error('[Webhook] Failed to move Kanban stage:', err.message);
      }
    }

    // Emit live real-time Socket.io payment notification (triggers cash register sound)
    if (ioInstance) {
      ioInstance.to(`user_${userId}`).emit('proposal:updated', updated);
      ioInstance.to(`user_${userId}`).emit('payment:received', {
        proposalId: proposalId,
        amount: proposal.amount,
        clientName: proposal.clientName,
        projectName: proposal.projectName,
        paymentMethod: method || 'PIX'
      });
    }

    console.log(`[Webhook] User ${userId}: Proposal ${proposalId} marked PAID successfully.`);
  } catch (e) {
    console.error(`[Webhook] User ${userId}: Error in handleSuccessPayment:`, e.message);
  }
}

export default router;
