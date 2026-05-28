const { Client } = require('ssh2');

const conn = new Client();
const cmd = process.argv.slice(2).join(' ') || 'pm2 status';

conn.on('ready', () => {
  console.log('⚡ Conectado à VPS. Executando: ' + cmd);
  conn.exec(cmd, (err, stream) => {
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
