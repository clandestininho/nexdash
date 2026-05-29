import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

const SEARCH_TERMS = ['FRIYAY', 'CUBS', '120363169975121665'];

async function run() {
  const SQL = await initSqlJs();
  const files = fs.readdirSync(ROOT_DIR);
  const dbFiles = files.filter(f => f.endsWith('.db'));

  console.log(`Found ${dbFiles.length} SQLite database files in root.`);

  for (const dbFile of dbFiles) {
    const dbPath = path.join(ROOT_DIR, dbFile);
    try {
      const buffer = fs.readFileSync(dbPath);
      const db = new SQL.Database(buffer);

      // Check if table 'messages' exists
      const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='messages'");
      let hasMessagesTable = false;
      if (tableCheck.step()) {
        hasMessagesTable = true;
      }
      tableCheck.free();

      if (hasMessagesTable) {
        // Query all messages
        const stmt = db.prepare("SELECT * FROM messages");
        while (stmt.step()) {
          const row = stmt.getAsObject();
          const rowStr = JSON.stringify(row).toLowerCase();
          
          for (const term of SEARCH_TERMS) {
            if (rowStr.includes(term.toLowerCase())) {
              console.log(`\n🎉 MATCH FOUND in database: ${dbFile}`);
              console.log(`Table: messages`);
              console.log(`Row:`, row);
            }
          }
        }
        stmt.free();
      }

      // Check if table 'contacts' exists
      const contactCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='contacts'");
      let hasContactsTable = false;
      if (contactCheck.step()) {
        hasContactsTable = true;
      }
      contactCheck.free();

      if (hasContactsTable) {
        // Query all contacts
        const stmt = db.prepare("SELECT * FROM contacts");
        while (stmt.step()) {
          const row = stmt.getAsObject();
          const rowStr = JSON.stringify(row).toLowerCase();

          for (const term of SEARCH_TERMS) {
            if (rowStr.includes(term.toLowerCase())) {
              console.log(`\n🎉 MATCH FOUND in database: ${dbFile}`);
              console.log(`Table: contacts`);
              console.log(`Row:`, row);
            }
          }
        }
        stmt.free();
      }

      db.close();
    } catch (err) {
      console.error(`Error scanning ${dbFile}:`, err.message);
    }
  }
  console.log('\nScan completed.');
}

run().catch(console.error);
