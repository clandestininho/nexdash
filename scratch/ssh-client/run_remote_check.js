const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const localFileContent = fs.readFileSync(path.join(__dirname, '..', 'read_vps_db.js'), 'utf8');

conn.on('ready', () => {
  console.log('⚡ Conectado à VPS.');
  
  // Write and run the file inside /var/www/nexdash with .cjs extension
  conn.exec(`cat << 'EOF' > /var/www/nexdash/read_vps_db.cjs\n${localFileContent}\nEOF\ncd /var/www/nexdash && node read_vps_db.cjs && rm read_vps_db.cjs`, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log(`\n🔴 Comando encerrado com código: ${code}`);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: '2.24.86.33',
  port: 22,
  username: 'root',
  password: 'Gle@147852369',
  readyTimeout: 20000
});
