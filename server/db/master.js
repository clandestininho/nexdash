import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_DB_PATH = process.env.MASTER_DB_PATH || path.join(__dirname, '..', '..', 'master.db');

let db = null;

// Initialize Master Database
export async function initMasterDatabase() {
  const SQL = await initSqlJs();

  try {
    if (fs.existsSync(MASTER_DB_PATH)) {
      const buffer = fs.readFileSync(MASTER_DB_PATH);
      db = new SQL.Database(buffer);
      console.log('[MasterDB] Loaded master database from', MASTER_DB_PATH);
    } else {
      db = new SQL.Database();
      console.log('[MasterDB] Created new master database.');
    }
  } catch (err) {
    console.error('[MasterDB] Error loading master database, creating fresh:', err.message);
    db = new SQL.Database();
  }

  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      plan TEXT DEFAULT 'trial',
      trial_ends_at DATETIME DEFAULT (datetime('now', '+7 days')),
      role TEXT DEFAULT 'user',
      amount_paid REAL DEFAULT 0.0,
      billing_cycle TEXT DEFAULT 'monthly',
      last_payment_at DATETIME,
      phone TEXT,
      last_reminded_at DATETIME,
      created_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  // Dynamically add columns to existing installations safely
  const alterColumns = [
    { name: 'plan', type: 'TEXT DEFAULT \'trial\'' },
    { name: 'trial_ends_at', type: 'DATETIME' }, // Simpler type to avoid SQLite "default value not constant" error!
    { name: 'role', type: 'TEXT DEFAULT \'user\'' },
    { name: 'amount_paid', type: 'REAL DEFAULT 0.0' },
    { name: 'billing_cycle', type: 'TEXT DEFAULT \'monthly\'' },
    { name: 'last_payment_at', type: 'DATETIME' },
    { name: 'phone', type: 'TEXT' },
    { name: 'last_reminded_at', type: 'DATETIME' }
  ];

  for (const col of alterColumns) {
    try {
      db.run(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
    } catch (e) {
      if (!e.message.includes('duplicate column name') && !e.message.includes('already exists')) {
        console.warn(`[MasterDB] Safe migration column warning for "${col.name}":`, e.message);
      }
    }
  }

  saveMasterDatabase();
  console.log('[MasterDB] Master schema initialized successfully.');
  return db;
}

function saveMasterDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(MASTER_DB_PATH, buffer);
  } catch (err) {
    console.error('[MasterDB] Error saving master database:', err.message);
  }
}

// Query Helpers
function queryOne(sql, params = []) {
  if (!db) throw new Error('[MasterDB] Database not initialized.');
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  let result = null;
  if (stmt.step()) {
    result = stmt.getAsObject();
  }
  stmt.free();
  return result;
}

function runSql(sql, params = []) {
  if (!db) throw new Error('[MasterDB] Database not initialized.');
  db.run(sql, params);
  saveMasterDatabase();
}

// User Actions
export function getUserByEmail(email) {
  return queryOne('SELECT * FROM users WHERE email = ?', [email]);
}

export function getUserById(id) {
  return queryOne('SELECT * FROM users WHERE id = ?', [id]);
}

export function createUser(email, passwordHash, name) {
  runSql(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
    [email.toLowerCase().trim(), passwordHash, name]
  );
  return getUserByEmail(email);
}

export function updateUserPlan(id, plan) {
  runSql('UPDATE users SET plan = ? WHERE id = ?', [plan, id]);
  return getUserById(id);
}

export function updateUserTrialEndsAt(id, trialEndsAt) {
  runSql('UPDATE users SET trial_ends_at = ? WHERE id = ?', [trialEndsAt, id]);
  return getUserById(id);
}

export function getAllUsers() {
  if (!db) throw new Error('[MasterDB] Database not initialized.');
  const stmt = db.prepare('SELECT id, email, name, plan, trial_ends_at, role, amount_paid, billing_cycle, last_payment_at, phone, last_reminded_at, created_at FROM users ORDER BY created_at DESC');
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function updateUserAdminDetails(id, fields) {
  const allowed = ['plan', 'trial_ends_at', 'role', 'amount_paid', 'billing_cycle', 'last_payment_at', 'phone', 'last_reminded_at'];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      runSql(`UPDATE users SET ${key} = ? WHERE id = ?`, [fields[key], id]);
    }
  }
  return getUserById(id);
}

export default { 
  initMasterDatabase, 
  getUserByEmail, 
  getUserById, 
  createUser, 
  updateUserPlan, 
  updateUserTrialEndsAt,
  getAllUsers,
  updateUserAdminDetails
};
