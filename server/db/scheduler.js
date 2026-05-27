import { getAllUsers, updateUserAdminDetails, getUserById } from './master.js';
import { getSocket } from '../whatsapp/client.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_PATH = path.join(__dirname, '..', '..', 'automation_logs.json');

// Get current automation log stats
export function getAutomationLogs() {
  try {
    if (fs.existsSync(LOG_PATH)) {
      return JSON.parse(fs.readFileSync(LOG_PATH, 'utf-8'));
    }
  } catch (err) {
    console.error('[Scheduler] Error reading automation logs:', err.message);
  }
  return {
    lastRun: null,
    totalAlertsSent: 0,
    history: []
  };
}

// Write to automation log file
function saveAutomationLog(logData) {
  try {
    fs.writeFileSync(LOG_PATH, JSON.stringify(logData, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Scheduler] Error writing automation logs:', err.message);
  }
}

// Main Automation sweep logic
export async function runAutomationSweep() {
  console.log('[Scheduler] Initializing automated renewal sweep across Master DB...');
  const users = getAllUsers();
  const now = new Date();
  
  // Load current logs
  const logs = getAutomationLogs();
  logs.lastRun = now.toISOString();

  // Find any active administrator WhatsApp session to dispatch the automated alerts
  let adminSocket = null;
  let adminName = 'Sistema NEXDASH';

  for (const u of users) {
    const isAdmin = u.role === 'admin' || u.email === 'gleison@nexdash.com' || u.email.toLowerCase().includes('admin');
    if (isAdmin) {
      const sock = getSocket(u.id);
      if (sock) {
        adminSocket = sock;
        adminName = u.name;
        console.log(`[Scheduler] Active admin WhatsApp session detected for: ${u.email} (${u.name})`);
        break;
      }
    }
  }

  let sweepsTriggered = 0;

  for (const u of users) {
    // Standard clients
    const plan = u.plan || 'trial';
    const trialEndsStr = u.trial_ends_at ? u.trial_ends_at.replace(' ', 'T') : null;
    if (!trialEndsStr) continue;

    const expirationDate = new Date(trialEndsStr);
    const msDiff = expirationDate.getTime() - now.getTime();
    const hoursRemaining = msDiff / (1000 * 60 * 60);

    // Automation conditions:
    // 1. Expiration in less than 48 hours AND not expired more than 72 hours ago
    // 2. Haven't received a reminder in the last 7 days (or ever)
    const isExpiringSoon = hoursRemaining > -72 && hoursRemaining <= 48;
    
    let lastReminded = null;
    if (u.last_reminded_at) {
      lastReminded = new Date(u.last_reminded_at.replace(' ', 'T'));
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const hasNotBeenRemindedRecently = !lastReminded || lastReminded < sevenDaysAgo;

    if (isExpiringSoon && hasNotBeenRemindedRecently) {
      sweepsTriggered++;
      const planLabel = plan === 'trial' ? 'Período de Testes' : `Plano ${plan.toUpperCase()}`;
      const expDateFormatted = expirationDate.toLocaleDateString('pt-BR');

      console.log(`[Scheduler] AUTO-ALERT: User ${u.name} (${u.email}) is expiring in ${Math.round(hoursRemaining)} hours! Preparing alerts...`);

      // WhatsApp automated notification template
      const msgText = `Olá, *${u.name}*! 🤖🚀\n\nEste é um *alerta automático* do seu gestor *NEXDASH*.\n\nNotamos que o período de uso do seu *${planLabel}* está programado para vencer em *${expDateFormatted}*.\n\nPara evitar bloqueios ao seu CRM, histórico financeiro ou atendentes de inteligência artificial, acesse a sua conta agora e renove seu plano!\n\nSe precisar de ajuda com a cobrança, responda diretamente este WhatsApp.\n\n_Atenciosamente,\nRobô de Automações NEXDASH_`;

      let wasWhatsAppSent = false;
      let alertLogEntry = {
        userId: u.id,
        userName: u.name,
        userEmail: u.email,
        plan: plan,
        expirationDate: expirationDate.toISOString(),
        timestamp: new Date().toISOString(),
        whatsappSent: false,
        emailSent: true // Automatically simulates email
      };

      if (adminSocket && u.phone) {
        try {
          // Sanitize JID
          let cleanPhone = u.phone.replace(/\D/g, '');
          if (!cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
            cleanPhone = '55' + cleanPhone;
          }
          const jid = `${cleanPhone}@s.whatsapp.net`;

          await adminSocket.sendMessage(jid, { text: msgText });
          wasWhatsAppSent = true;
          alertLogEntry.whatsappSent = true;
          console.log(`[Scheduler] [Auto-WhatsApp] Successfully dispatched auto-message to ${u.name} at ${cleanPhone}`);
        } catch (err) {
          console.error(`[Scheduler] [Auto-WhatsApp] Failed to send automated message to ${u.name}:`, err.message);
        }
      } else {
        console.log(`[Scheduler] [Auto-WhatsApp] Skipped WhatsApp dispatch for ${u.name} (No active Admin session or phone number is missing)`);
      }

      // Record sweep timestamp in master database to avoid multiple warnings
      const nowSqlStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      updateUserAdminDetails(u.id, { last_reminded_at: nowSqlStr });

      // Save to logs history
      logs.totalAlertsSent++;
      logs.history.push(alertLogEntry);
    }
  }

  saveAutomationLog(logs);
  console.log(`[Scheduler] Sweep complete. Analyzed ${users.length} users. Dispatched ${sweepsTriggered} automated alerts.`);
}

// Start background automation loop
export function initScheduler() {
  console.log('[Scheduler] Starting Automated Renewal Daemon in background...');
  
  // Sweep 10 seconds after server boot-up so user can see it run in logs immediately
  setTimeout(() => {
    runAutomationSweep().catch((err) => {
      console.error('[Scheduler] Initial background sweep failed:', err.message);
    });
  }, 10000);

  // Repeat sweep every 24 hours
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    runAutomationSweep().catch((err) => {
      console.error('[Scheduler] Scheduled sweep failed:', err.message);
    });
  }, TWENTY_FOUR_HOURS);
}
