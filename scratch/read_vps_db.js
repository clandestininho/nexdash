const { execSync } = require('child_process');
const fs = require('fs');

async function run() {
  console.log('=== INVESTIGATING USER 17 AND DB VIA PYTHON ===');
  
  try {
    // 1. Get user 17 information from master.db
    console.log('\n--- User 17 Info from master.db ---');
    const userCmd = `python3 -c "import sqlite3; conn = sqlite3.connect('/var/www/nexdash/master.db'); print(conn.execute('SELECT * FROM users WHERE id = 17').fetchall())"`;
    const userResult = execSync(userCmd, { encoding: 'utf8' });
    console.log(userResult.trim());
    
    // 2. Get tables in crm_user_17.db
    console.log('\n--- Tables in crm_user_17.db ---');
    const tablesCmd = `python3 -c "import sqlite3; conn = sqlite3.connect('/var/www/nexdash/crm_user_17.db'); print(conn.execute('SELECT name FROM sqlite_master WHERE type=\\'table\\'').fetchall())"`;
    const tablesResult = execSync(tablesCmd, { encoding: 'utf8' });
    console.log(tablesResult.trim());

    // 3. Search messages in crm_user_17.db
    console.log('\n--- Matches in messages table ---');
    const msgCmd = `python3 -c "import sqlite3; conn = sqlite3.connect('/var/www/nexdash/crm_user_17.db'); [print(row) for row in conn.execute('SELECT id, contact_id, content, from_me, timestamp FROM messages WHERE content LIKE \\'%FRIYAY%\\' OR content LIKE \\'%CUBS%\\' OR contact_id LIKE \\'%120363169975121665%\\'').fetchall()]"`;
    const msgResult = execSync(msgCmd, { encoding: 'utf8' });
    console.log(msgResult.trim() || 'No matching messages in messages table');

    // 4. Search contacts in crm_user_17.db
    console.log('\n--- Matches in contacts table ---');
    const contactCmd = `python3 -c "import sqlite3; conn = sqlite3.connect('/var/www/nexdash/crm_user_17.db'); [print(row) for row in conn.execute('SELECT id, name, phone, last_message, last_activity FROM contacts WHERE id IN (\\'120363169975121665@newsletter\\', \\'183262244790313@lid\\', \\'54357290663946@lid\\')').fetchall()]"`;
    const contactResult = execSync(contactCmd, { encoding: 'utf8' });
    console.log(contactResult.trim() || 'No matching contacts in contacts table');
    
    // 5. Let's see some other messages from the same contact or around that timestamp in crm_user_17.db
    console.log('\n--- Recent messages from or related to that contact ---');
    const recentCmd = `python3 -c "import sqlite3; conn = sqlite3.connect('/var/www/nexdash/crm_user_17.db'); [print(row) for row in conn.execute('SELECT id, contact_id, content, from_me, timestamp FROM messages WHERE contact_id IN (\\'120363169975121665@newsletter\\', \\'183262244790313@lid\\', \\'54357290663946@lid\\') ORDER BY timestamp DESC LIMIT 10').fetchall()]"`;
    const recentMsgs = execSync(recentCmd, { encoding: 'utf8' });
    console.log(recentMsgs.trim() || 'No messages found for this contact JID');
    
  } catch (err) {
    console.error('Error executing query:', err.message);
  }
}

run().catch(console.error);
