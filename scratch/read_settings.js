import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

async function run() {
  const SQL = await initSqlJs();
  const dbFiles = fs.readdirSync('.').filter(f => f.startsWith('crm_user_') && f.endsWith('.db'));
  
  for (const file of dbFiles) {
    const buffer = fs.readFileSync(file);
    const db = new SQL.Database(buffer);
    
    try {
      const stmt = db.prepare("SELECT key, value FROM settings WHERE key IN ('onboarding_completed', 'profile_empresa', 'profile_nome')");
      const settings = {};
      while (stmt.step()) {
        const row = stmt.getAsObject();
        settings[row.key] = row.value;
      }
      stmt.free();
      console.log(`File: ${file} | Settings:`, JSON.stringify(settings));
    } catch (e) {
      console.log(`File: ${file} | Error:`, e.message);
    }
  }
}

run().catch(console.error);
