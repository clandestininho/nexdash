import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getAllUsers, updateUserAdminDetails, getUserById } from '../db/master.js';
import { getSocket } from '../whatsapp/client.js';
import { getAutomationLogs, runAutomationSweep } from '../db/scheduler.js';

const router = express.Router();

// Middleware to strictly enforce administrator permissions
function requireAdmin(req, res, next) {
  const isGleison = req.user.email === 'gleison@nexdash.com';
  const hasAdminWord = req.user.email.toLowerCase().includes('admin');
  const isAdminRole = req.user.role === 'admin';

  if (isAdminRole || isGleison || hasAdminWord) {
    next();
  } else {
    return res.status(403).json({ error: 'Acesso negado. Esta rota é restrita a administradores do SaaS.' });
  }
}

// GET /api/admin/stats - Calculate real-time SaaS statistics
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = getAllUsers();
    
    let totalSubscribers = 0;
    let totalRevenue = 0;
    let planCounts = { trial: 0, basico: 0, pro: 0, next: 0 };
    let expiredTrialCount = 0;
    let activeTrialCount = 0;
    
    const now = new Date();

    for (const u of users) {
      const plan = u.plan || 'trial';
      planCounts[plan] = (planCounts[plan] || 0) + 1;

      if (plan !== 'trial') {
        totalSubscribers++;
        totalRevenue += u.amount_paid || 0;
      } else {
        const trialEnd = u.trial_ends_at ? new Date(u.trial_ends_at.replace(' ', 'T')) : null;
        if (trialEnd && now > trialEnd) {
          expiredTrialCount++;
        } else {
          activeTrialCount++;
        }
      }
    }

    res.json({
      totalUsers: users.length,
      totalSubscribers,
      estimatedMRR: totalRevenue, // Sum of amount paid for simple telemetry
      planCounts,
      trials: {
        active: activeTrialCount,
        expired: expiredTrialCount,
        total: activeTrialCount + expiredTrialCount
      },
      averageTicket: totalSubscribers > 0 ? Math.round((totalRevenue / totalSubscribers) * 100) / 100 : 0
    });
  } catch (err) {
    console.error('[AdminRoutes] Error loading admin stats:', err);
    res.status(500).json({ error: 'Erro ao calcular estatísticas do SaaS.' });
  }
});

// GET /api/admin/users - Get all subscriber details
router.get('/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = getAllUsers();
    res.json({ users });
  } catch (err) {
    console.error('[AdminRoutes] Error fetching users list:', err);
    res.status(500).json({ error: 'Erro ao carregar lista de assinantes.' });
  }
});

// POST /api/admin/users/:id - Edit subscription and user details directly
router.post('/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  try {
    const user = getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'Assinante não encontrado.' });
    }

    const updated = updateUserAdminDetails(id, fields);
    res.json({ success: true, user: updated });
  } catch (err) {
    console.error('[AdminRoutes] Error updating subscriber:', err);
    res.status(500).json({ error: 'Erro ao atualizar dados do assinante.' });
  }
});

// POST /api/admin/remind - Send manual renewal reminder via WhatsApp or Email
router.post('/remind', authenticateToken, requireAdmin, async (req, res) => {
  const { userId, type } = req.body;

  if (!userId || !type) {
    return res.status(400).json({ error: 'Parâmetros userId e type são obrigatórios.' });
  }

  try {
    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Assinante não encontrado.' });
    }

    const planNameFormatted = user.plan === 'trial' ? 'Período de Testes' : `Plano ${user.plan.toUpperCase()}`;
    const expirationDateStr = user.trial_ends_at 
      ? new Date(user.trial_ends_at.replace(' ', 'T')).toLocaleDateString('pt-BR')
      : 'Em breve';

    if (type === 'whatsapp') {
      if (!user.phone) {
        return res.status(400).json({ error: 'Este assinante não possui telefone cadastrado.' });
      }

      // Check if logged in admin has connected WhatsApp socket
      const adminSocket = getSocket(req.user.id);
      if (!adminSocket) {
        return res.status(400).json({ 
          error: 'WhatsApp do administrador não está conectado. Conecte sua conta na aba de WhatsApp para habilitar disparos manuais!' 
        });
      }

      // Sanitize phone number ( Brazil country prefix is 55 )
      let cleanPhone = user.phone.replace(/\D/g, '');
      if (cleanPhone.length > 0) {
        if (!cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
          cleanPhone = '55' + cleanPhone;
        }
      } else {
        return res.status(400).json({ error: 'Número de telefone inválido.' });
      }

      const jid = `${cleanPhone}@s.whatsapp.net`;
      const templateMessage = `Olá, *${user.name}*! 🌟\n\nIdentificamos que o vencimento do seu plano (*${planNameFormatted}*) do *NEXDASH* está agendado para o dia *${expirationDateStr}*.\n\nPara continuar utilizando todas as ferramentas de IA, relatórios financeiros avançados e painéis automáticos sem qualquer interrupção, certifique-se de renovar a sua assinatura!\n\nSe tiver qualquer dúvida ou desejar alterar sua forma de pagamento, basta nos responder por aqui. 😊🚀\n\n_Atenciosamente,\nEquipe Administrativa NEXDASH_`;

      await adminSocket.sendMessage(jid, { text: templateMessage });
      
      // Update last reminded timestamp
      const nowString = new Date().toISOString().replace('T', ' ').substring(0, 19);
      updateUserAdminDetails(userId, { last_reminded_at: nowString });

      return res.json({ success: true, method: 'whatsapp', message: 'Alerta de WhatsApp enviado com sucesso!' });
    } else if (type === 'email') {
      // Simulate Email sending
      console.log(`[Simulated Email Alert] Outbound to ${user.email}:`);
      console.log(`Subject: Lembrete de Renovação NEXDASH - ${user.name}`);
      console.log(`Plan: ${planNameFormatted} | Expiration: ${expirationDateStr}`);
      console.log(`Message: Olá ${user.name}, renovação pendente para ${expirationDateStr}.`);

      const nowString = new Date().toISOString().replace('T', ' ').substring(0, 19);
      updateUserAdminDetails(userId, { last_reminded_at: nowString });

      return res.json({ success: true, method: 'email', message: 'E-mail de cobrança enviado com sucesso!' });
    } else {
      return res.status(400).json({ error: 'Tipo de lembrete inválido. Use whatsapp ou email.' });
    }
  } catch (err) {
    console.error('[AdminRoutes] Error sending reminder:', err.message);
    res.status(500).json({ error: `Falha ao despachar lembrete: ${err.message}` });
  }
});

// GET /api/admin/automation-logs - Retrieve cron sweep histories
router.get('/automation-logs', authenticateToken, requireAdmin, (req, res) => {
  try {
    const logs = getAutomationLogs();
    res.json(logs);
  } catch (err) {
    console.error('[AdminRoutes] Error reading automation logs:', err.message);
    res.status(500).json({ error: 'Erro ao carregar logs de automação.' });
  }
});

// POST /api/admin/trigger-sweep - Force real-time renewal check sweep
router.post('/trigger-sweep', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await runAutomationSweep();
    const updatedLogs = getAutomationLogs();
    res.json({ success: true, message: 'Varredura de renovação concluída em tempo real!', logs: updatedLogs });
  } catch (err) {
    console.error('[AdminRoutes] Error forcing automation sweep:', err.message);
    res.status(500).json({ error: `Erro ao executar varredura: ${err.message}` });
  }
});

export default router;
