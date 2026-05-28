import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';

const conn = new Client();
const localFileContent = fs.readFileSync('scratch/read_vps_db.js', 'utf8');

conn.on('ready', () => {
  console.log('⚡ Conectado à VPS.');
  
  // Write the file to /tmp/read_vps_db.js using a command
  conn.exec(`cat << 'EOF' > /tmp/read_vps_db.js\n${localFileContent}\nEOF\nnode /tmp/read_vps_db.js`, (err, stream) => {
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
