import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

async function run() {
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync('master.db');
  const db = new SQL.Database(buffer);
  
  const stmt = db.prepare('SELECT id, email, name, plan, phone, created_at FROM users');
  const users = [];
  while (stmt.step()) {
    users.push(stmt.getAsObject());
  }
  stmt.free();
  
  console.log('USERS IN MASTER DB:');
  console.log(JSON.stringify(users, null, 2));
}

run().catch(console.error);
