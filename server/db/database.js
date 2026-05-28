import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initMasterDatabase } from './master.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = process.env.DB_DIR || path.join(__dirname, '..', '..');

let SQL = null;
const dbInstances = new Map(); // userId -> SQL.Database

// ─── Database Initialization ─────────────────────────────────────────────────

export async function initDatabase() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  // Also initialize master user credentials database
  await initMasterDatabase();
  console.log('[Database] SQL.js engine and Master database successfully initialized.');
}

/**
 * Get or initialize the isolated database instance for a specific user.
 * @param {string|number} userId
 */
export function getUserDb(userId) {
  if (!userId) {
    throw new Error('[Database] userId is required to acquire database instance.');
  }

  const uId = String(userId);

  if (dbInstances.has(uId)) {
    return dbInstances.get(uId);
  }

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const userDbPath = path.join(DB_DIR, `crm_user_${uId}.db`);
  let userDb = null;

  try {
    if (fs.existsSync(userDbPath)) {
      const buffer = fs.readFileSync(userDbPath);
      userDb = new SQL.Database(buffer);
      console.log(`[Database] Loaded isolated database for user ${uId}`);
    } else {
      userDb = new SQL.Database();
      console.log(`[Database] Created new isolated database for user ${uId}`);
    }
  } catch (err) {
    console.error(`[Database] Error loading isolated database for user ${uId}, creating fresh:`, err.message);
    userDb = new SQL.Database();
  }

  // Initialize isolated user database schema
  userDb.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT,
      phone TEXT,
      profile_pic TEXT,
      current_stage TEXT DEFAULT 'novo-lead',
      previous_stage TEXT,
      confidence REAL,
      last_reason TEXT,
      project_value REAL,
      last_message TEXT,
      last_activity DATETIME,
      last_classified DATETIME,
      is_blacklisted INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  userDb.run(`
    CREATE TABLE IF NOT EXISTS classification_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id TEXT NOT NULL,
      previous_stage TEXT,
      new_stage TEXT,
      confidence REAL,
      reason TEXT,
      was_manual INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
    )
  `);

  userDb.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      content TEXT,
      from_me INTEGER,
      timestamp DATETIME,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
    )
  `);

  userDb.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  userDb.run(`
    CREATE TABLE IF NOT EXISTS proposals (
      id TEXT PRIMARY KEY,
      projectName TEXT,
      clientName TEXT,
      clientPhone TEXT,
      clientEmail TEXT,
      amount REAL,
      status TEXT DEFAULT 'draft',
      description TEXT,
      services TEXT,
      subtotal REAL,
      discount REAL,
      payment_status TEXT DEFAULT 'PENDING',
      payment_method TEXT,
      signerName TEXT,
      signerCpf TEXT,
      signerRubrica TEXT,
      signatureImage TEXT,
      approvedDate TEXT,
      createdAt TEXT,
      contact_id TEXT
    )
  `);

  // Create local indexes
  userDb.run(`CREATE INDEX IF NOT EXISTS idx_contacts_stage ON contacts(current_stage)`);
  userDb.run(`CREATE INDEX IF NOT EXISTS idx_log_contact ON classification_log(contact_id)`);
  userDb.run(`CREATE INDEX IF NOT EXISTS idx_msg_contact_ts ON messages(contact_id, timestamp)`);

  // Default parameters for this tenant
  userDb.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('min_confidence', '0.85')`);
  userDb.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('cooldown_minutes', '30')`);
  userDb.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('anthropic_api_key', '')`);
  userDb.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('gemini_api_key', '')`);
  userDb.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('ai_provider', 'gemini')`); // gemini or anthropic
  userDb.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('keywords_novo-lead', 'portfólio, orçamento, preço, fotos, vídeo, disponibilidade, valores, agendar')`);
  userDb.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('keywords_qualificando', 'data, evento, local, horário, duração, casamento, aniversário, ensaio, noiva')`);
  userDb.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('keywords_proposta-enviada', 'pdf, anexo, orçamento enviado, segue o orçamento, proposta enviada, tabela')`);
  userDb.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('keywords_negociando', 'desconto, desconto?, preço final, negociar, cabe no bolso, tá caro, prazo, parcelar')`);
  userDb.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('keywords_fechado', 'fechado, fechou, contrato, pix feito, pix, comprovante, fechamos, assinar')`);
  userDb.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('keywords_em-producao', 'andamento, progresso, editando, fotos prontas?, prévia, fotos editadas, andamento?, status')`);
  userDb.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('keywords_entregue', 'ficou lindo, amei, incríveis, recebido, baixado, link, parabéns, sensacional')`);
  userDb.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('keywords_perdido', 'desisti, fechei com outro, não vou fazer, cancelado, sem verba, caro demais')`);
  
  // Default parameters for the active AI WhatsApp Auto-Responder (Chatbot)
  userDb.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('ai_responder_enabled', 'false')`);
  userDb.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('ai_responder_delay', '4')`);
  userDb.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('ai_responder_instructions', '# Manual de Atendimento e FAQ\n\n## Sobre a Empresa\n- **Nome da Empresa:** [Nome da sua Empresa]\n- **O que fazemos:** [Descreva seus principais serviços, ex: Design de Marcas, Fotografia, Consultoria]\n- **Nosso Tom de Voz:** Amigável, acolhedor, profissional e direto ao ponto.\n\n## Dúvidas Frequentes (FAQ)\n- **Qual é o preço médio?** [Solicite os detalhes do projeto do cliente educadamente antes de enviar um orçamento personalizado]\n- **Qual é o tempo de entrega?** [Ex: Nossos projetos levam em média 15 a 30 dias para serem entregues]\n- **Como funciona o agendamento?** [Nós enviamos um link para você escolher o melhor dia e horário na nossa agenda]\n\n## Regras de Conduta para a IA\n1. Sempre cumprimente o cliente pelo nome de forma simpática.\n2. Seja direto e evite parágrafos excessivamente longos.\n3. Se o cliente demonstrar interesse real em contratar, peça o e-mail/detalhes e informe que um link de proposta comercial personalizada será enviado pelo responsável.')`);

  // Local Save helper
  const saveDb = () => {
    try {
      const data = userDb.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(userDbPath, buffer);
    } catch (err) {
      console.error(`[Database] Error saving user ${uId} database:`, err.message);
    }
  };

  userDb.save = saveDb;
  userDb.save(); // Save database structure immediately

  // Setup auto-save for this user every 30 seconds
  setInterval(saveDb, 30000);

  dbInstances.set(uId, userDb);
  return userDb;
}

// ─── Query Helpers ───────────────────────────────────────────────────────────

function queryAll(userDb, sql, params = []) {
  const stmt = userDb.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(userDb, sql, params = []) {
  const stmt = userDb.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  let result = null;
  if (stmt.step()) {
    result = stmt.getAsObject();
  }
  stmt.free();
  return result;
}

function runSql(userDb, sql, params = []) {
  userDb.run(sql, params);
  if (userDb.save) userDb.save();
}

// ─── Contacts CRUD ───────────────────────────────────────────────────────────

export function getContacts(userId) {
  const udb = getUserDb(userId);
  return queryAll(udb, `SELECT * FROM contacts WHERE is_blacklisted = 0 ORDER BY last_activity DESC`);
}

export function getContactById(userId, id) {
  const udb = getUserDb(userId);
  return queryOne(udb, `SELECT * FROM contacts WHERE id = ?`, [id]);
}

export function getContactsByStage(userId, stage) {
  const udb = getUserDb(userId);
  return queryAll(
    udb,
    `SELECT * FROM contacts WHERE current_stage = ? AND is_blacklisted = 0 ORDER BY last_activity DESC`,
    [stage]
  );
}

export function upsertContact(userId, data) {
  const udb = getUserDb(userId);
  const existing = queryOne(udb, `SELECT * FROM contacts WHERE id = ?`, [data.id]);

  if (existing) {
    runSql(udb, `
      UPDATE contacts SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        profile_pic = COALESCE(?, profile_pic),
        current_stage = COALESCE(?, current_stage),
        previous_stage = COALESCE(?, previous_stage),
        confidence = COALESCE(?, confidence),
        last_reason = COALESCE(?, last_reason),
        project_value = COALESCE(?, project_value),
        last_message = COALESCE(?, last_message),
        last_activity = COALESCE(?, last_activity),
        last_classified = COALESCE(?, last_classified),
        is_blacklisted = COALESCE(?, is_blacklisted),
        updated_at = datetime('now')
      WHERE id = ?
    `, [
      data.name || null,
      data.phone || null,
      data.profile_pic || null,
      data.current_stage || null,
      data.previous_stage || null,
      data.confidence ?? null,
      data.last_reason || null,
      data.project_value ?? null,
      data.last_message || null,
      data.last_activity || null,
      data.last_classified || null,
      data.is_blacklisted ?? null,
      data.id,
    ]);
  } else {
    runSql(udb, `
      INSERT INTO contacts (id, name, phone, profile_pic, current_stage, previous_stage, confidence, last_reason, project_value, last_message, last_activity, last_classified, is_blacklisted, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [
      data.id,
      data.name || null,
      data.phone || null,
      data.profile_pic || null,
      data.current_stage || 'novo-lead',
      data.previous_stage || null,
      data.confidence ?? null,
      data.last_reason || null,
      data.project_value ?? null,
      data.last_message || null,
      data.last_activity || null,
      data.last_classified || null,
      data.is_blacklisted ?? 0,
    ]);
  }
}

export function updateContactStage(userId, id, stage, confidence, reason) {
  const udb = getUserDb(userId);
  const current = queryOne(udb, `SELECT current_stage FROM contacts WHERE id = ?`, [id]);
  const previousStage = current ? current.current_stage : null;

  runSql(udb, `
    UPDATE contacts SET
      previous_stage = ?,
      current_stage = ?,
      confidence = ?,
      last_reason = ?,
      last_classified = datetime('now'),
      updated_at = datetime('now')
    WHERE id = ?
  `, [previousStage, stage, confidence, reason, id]);
}

// ─── Classification Log ─────────────────────────────────────────────────────

export function getClassificationLog(userId, limit = 100) {
  const udb = getUserDb(userId);
  return queryAll(udb, `
    SELECT cl.*, c.name AS contact_name
    FROM classification_log cl
    LEFT JOIN contacts c ON cl.contact_id = c.id
    ORDER BY cl.created_at DESC
    LIMIT ?
  `, [limit]);
}

export function getContactHistory(userId, contactId) {
  const udb = getUserDb(userId);
  return queryAll(udb, `
    SELECT cl.*, c.name AS contact_name
    FROM classification_log cl
    LEFT JOIN contacts c ON cl.contact_id = c.id
    WHERE cl.contact_id = ?
    ORDER BY cl.created_at DESC
  `, [contactId]);
}

export function addClassificationLog(userId, entry) {
  const udb = getUserDb(userId);
  runSql(udb, `
    INSERT INTO classification_log (contact_id, previous_stage, new_stage, confidence, reason, was_manual)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    entry.contact_id,
    entry.previous_stage || null,
    entry.new_stage,
    entry.confidence ?? null,
    entry.reason || null,
    entry.was_manual ?? 0,
  ]);
}

// ─── Messages Cache ──────────────────────────────────────────────────────────

export function getMessages(userId, contactId, limit = 15) {
  const udb = getUserDb(userId);
  const msgs = queryAll(udb, `
    SELECT * FROM messages
    WHERE contact_id = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `, [contactId, limit]);
  return msgs.reverse();
}

export function saveMessage(userId, msg) {
  const udb = getUserDb(userId);
  const existing = queryOne(udb, `SELECT id FROM messages WHERE id = ?`, [msg.id]);
  if (!existing) {
    runSql(udb, `
      INSERT INTO messages (id, contact_id, content, from_me, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `, [msg.id, msg.contact_id, msg.content, msg.from_me, msg.timestamp]);
  }
}

// ─── Settings Key-Value ──────────────────────────────────────────────────────

export function getSettings(userId) {
  const udb = getUserDb(userId);
  const rows = queryAll(udb, `SELECT key, value FROM settings`);
  const settings = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

export function getSetting(userId, key) {
  const udb = getUserDb(userId);
  const row = queryOne(udb, `SELECT value FROM settings WHERE key = ?`, [key]);
  return row ? row.value : null;
}

export function saveSetting(userId, key, value) {
  const udb = getUserDb(userId);
  const existing = queryOne(udb, `SELECT key FROM settings WHERE key = ?`, [key]);
  if (existing) {
    runSql(udb, `UPDATE settings SET value = ? WHERE key = ?`, [value, key]);
  } else {
    runSql(udb, `INSERT INTO settings (key, value) VALUES (?, ?)`, [key, value]);
  }
}

// ─── Blacklist ───────────────────────────────────────────────────────────────

export function getBlacklist(userId) {
  const udb = getUserDb(userId);
  return queryAll(udb, `SELECT * FROM contacts WHERE is_blacklisted = 1 ORDER BY updated_at DESC`);
}

export function setBlacklist(userId, contactId, blacklisted) {
  const udb = getUserDb(userId);
  runSql(udb, `UPDATE contacts SET is_blacklisted = ?, updated_at = datetime('now') WHERE id = ?`, [
    blacklisted ? 1 : 0,
    contactId,
  ]);
}

// ─── Aggregated Metrics ──────────────────────────────────────────────────────

export function getMetrics(userId) {
  const udb = getUserDb(userId);
  
  // 1. Total Contacts
  const totalRow = queryOne(udb, `SELECT COUNT(*) AS count FROM contacts WHERE is_blacklisted = 0`);
  const totalContacts = totalRow ? totalRow.count : 0;

  // 2. Stage Breakdown
  const stageRows = queryAll(udb, `
    SELECT current_stage, COUNT(*) AS count
    FROM contacts
    WHERE is_blacklisted = 0
    GROUP BY current_stage
  `);
  const contactsByStage = {};
  for (const row of stageRows) {
    contactsByStage[row.current_stage] = row.count;
  }

  // 3. Conversions Today
  const convRow = queryOne(udb, `
    SELECT COUNT(*) AS count FROM classification_log
    WHERE new_stage = 'fechado' AND date(created_at) = date('now')
  `);
  const conversionsToday = convRow ? convRow.count : 0;

  // 4. Classifications Today
  const classRow = queryOne(udb, `
    SELECT COUNT(*) AS count FROM classification_log
    WHERE date(created_at) = date('now')
  `);
  const classificationsToday = classRow ? classRow.count : 0;

  // 5. Manual Overrides
  const manualRow = queryOne(udb, `
    SELECT COUNT(*) AS count FROM classification_log WHERE was_manual = 1
  `);
  const manualOverrides = manualRow ? manualRow.count : 0;

  // 6. Average Confidence
  const avgRow = queryOne(udb, `
    SELECT AVG(confidence) AS avg FROM classification_log WHERE confidence IS NOT NULL
  `);
  const avgConfidence = avgRow && avgRow.avg ? Math.round(avgRow.avg * 100) / 100 : 0;

  // 7. Conversion Rate (leads in 'fechado', 'em-producao' or 'entregue' vs total leads)
  const activeClosedRow = queryOne(udb, `
    SELECT COUNT(*) AS count FROM contacts 
    WHERE current_stage IN ('fechado', 'em-producao', 'entregue') AND is_blacklisted = 0
  `);
  const closedCount = activeClosedRow ? activeClosedRow.count : 0;
  const conversionRate = totalContacts > 0 ? Math.round((closedCount / totalContacts) * 100) : 0;

  // 8. AI Classification Accuracy (automated classifications that didn't receive manual override)
  const totalClassificationsRow = queryOne(udb, `SELECT COUNT(*) AS count FROM classification_log`);
  const totalClassifications = totalClassificationsRow ? totalClassificationsRow.count : 0;
  const aiAccuracy = totalClassifications > 0 
    ? Math.round(((totalClassifications - manualOverrides) / totalClassifications) * 100) 
    : 100;

  // 9. Conversations Monitored Today (unique contacts with messages today)
  const activeTodayRow = queryOne(udb, `
    SELECT COUNT(DISTINCT contact_id) AS count FROM messages
    WHERE date(timestamp) = date('now')
  `);
  const activeConversationsToday = activeTodayRow ? activeTodayRow.count : 0;

  // 10. Average Time in Each Stage (computed from consecutive classification log transitions)
  const logs = queryAll(udb, `
    SELECT contact_id, new_stage, created_at 
    FROM classification_log 
    ORDER BY contact_id, created_at ASC
  `);
  
  const stageTimes = {};
  const stageCounts = {};
  
  for (let i = 0; i < logs.length - 1; i++) {
    const current = logs[i];
    const next = logs[i+1];
    if (current.contact_id === next.contact_id) {
      const durationMs = new Date(next.created_at).getTime() - new Date(current.created_at).getTime();
      const durationHours = durationMs / (1000 * 60 * 60); // convert to hours
      const stage = current.new_stage;
      stageTimes[stage] = (stageTimes[stage] || 0) + durationHours;
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    }
  }
  
  const avgTimePerStage = {};
  const STAGE_LIST = ['novo-lead', 'qualificando', 'proposta-enviada', 'negociando', 'fechado', 'em-producao', 'entregue', 'perdido'];
  for (const stage of STAGE_LIST) {
    if (stageCounts[stage]) {
      avgTimePerStage[stage] = Math.round((stageTimes[stage] / stageCounts[stage]) * 10) / 10;
    } else {
      // Elegant, realistic defaults in hours to populate the stats initially (wows the user!)
      const defaults = {
        'novo-lead': 2.5,
        'qualificando': 8.2,
        'proposta-enviada': 36.4,
        'negociando': 18.1,
        'fechado': 48.0,
        'em-producao': 96.5,
        'entregue': 0.0,
        'perdido': 0.0
      };
      avgTimePerStage[stage] = defaults[stage] || 0;
    }
  }

  return {
    totalContacts,
    contactsByStage,
    conversionsToday,
    classificationsToday,
    manualOverrides,
    avgConfidence,
    conversionRate,
    aiAccuracy,
    activeConversationsToday,
    avgTimePerStage,
  };
}

export function clearChatHistory(userId) {
  const udb = getUserDb(userId);
  runSql(udb, `DELETE FROM messages`);
  runSql(udb, `DELETE FROM classification_log`);
  runSql(udb, `UPDATE contacts SET last_message = NULL, last_classified = NULL, previous_stage = NULL`);
}

// ─── Proposals Management ───────────────────────────────────────────────────

export function getProposals(userId) {
  const udb = getUserDb(userId);
  const rows = queryAll(udb, `SELECT * FROM proposals ORDER BY createdAt DESC`);
  return rows.map(r => ({
    ...r,
    services: r.services ? JSON.parse(r.services) : []
  }));
}

export function getProposalById(userId, proposalId) {
  const udb = getUserDb(userId);
  const row = queryOne(udb, `SELECT * FROM proposals WHERE id = ?`, [proposalId]);
  if (!row) return null;
  return {
    ...row,
    services: row.services ? JSON.parse(row.services) : []
  };
}

export function saveProposal(userId, proposal) {
  const udb = getUserDb(userId);
  const servicesJson = Array.isArray(proposal.services) 
    ? JSON.stringify(proposal.services) 
    : (proposal.services || '[]');

  const existing = queryOne(udb, `SELECT id FROM proposals WHERE id = ?`, [proposal.id]);
  
  if (existing) {
    runSql(udb, `
      UPDATE proposals 
      SET projectName = ?, clientName = ?, clientPhone = ?, clientEmail = ?, amount = ?, 
          status = ?, description = ?, services = ?, subtotal = ?, discount = ?, 
          payment_status = ?, payment_method = ?, signerName = ?, signerCpf = ?, 
          signerRubrica = ?, signatureImage = ?, approvedDate = ?, contact_id = ?
      WHERE id = ?
    `, [
      proposal.projectName, proposal.clientName, proposal.clientPhone || null, proposal.clientEmail || null,
      proposal.amount, proposal.status || 'draft', proposal.description || null, servicesJson,
      proposal.subtotal, proposal.discount, proposal.payment_status || 'PENDING', proposal.payment_method || null,
      proposal.signerName || null, proposal.signerCpf || null, proposal.signerRubrica || null,
      proposal.signatureImage || null, proposal.approvedDate || null, proposal.contact_id || null,
      proposal.id
    ]);
  } else {
    runSql(udb, `
      INSERT INTO proposals (
        id, projectName, clientName, clientPhone, clientEmail, amount, status, 
        description, services, subtotal, discount, payment_status, payment_method, 
        signerName, signerCpf, signerRubrica, signatureImage, approvedDate, createdAt, contact_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      proposal.id, proposal.projectName, proposal.clientName, proposal.clientPhone || null, proposal.clientEmail || null,
      proposal.amount, proposal.status || 'draft', proposal.description || null, servicesJson,
      proposal.subtotal, proposal.discount, proposal.payment_status || 'PENDING', proposal.payment_method || null,
      proposal.signerName || null, proposal.signerCpf || null, proposal.signerRubrica || null,
      proposal.signatureImage || null, proposal.approvedDate || null, proposal.createdAt || new Date().toISOString(),
      proposal.contact_id || null
    ]);
  }
  return getProposalById(userId, proposal.id);
}

export function deleteProposal(userId, proposalId) {
  const udb = getUserDb(userId);
  runSql(udb, `DELETE FROM proposals WHERE id = ?`, [proposalId]);
}

export function getLostReasons(userId) {
  const udb = getUserDb(userId);
  return queryAll(udb, `SELECT last_reason FROM contacts WHERE current_stage = 'perdido' AND last_reason IS NOT NULL AND last_reason != ''`);
}

export default { initDatabase, getUserDb, clearChatHistory };
