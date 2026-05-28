const fs = require('fs');

async function run() {
  try {
    console.log('--- VPS .ENV FILE ---');
    const envPath = '/var/www/nexdash/.env';
    if (fs.existsSync(envPath)) {
      console.log(fs.readFileSync(envPath, 'utf8'));
    } else {
      console.log('.env file not found at ' + envPath);
    }
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.error);




