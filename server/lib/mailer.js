import nodemailer from 'nodemailer';

// Create the transporter. Fallback to a development mock if no SMTP configs exist.
const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '465'),
      secure: SMTP_PORT === '465', // true for 465, false for other ports (like 587)
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  // Development / fallback transporter
  return {
    sendMail: async (options) => {
      console.log('========================================================');
      console.log('📬 [EMAIL MOCK SERVICE] SIMULATION DETECTED');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log('--- Body ---');
      console.log(options.text);
      console.log('========================================================');
      return { messageId: 'mock-id-' + Date.now() };
    }
  };
};

/**
 * Sends a password reset verification code email.
 * @param {string} email Target user email
 * @param {string} name Target user name
 * @param {string} code 6-digit verification code
 */
export const sendResetPasswordEmail = async (email, name, code) => {
  const transporter = getTransporter();
  const fromAddress = process.env.SMTP_FROM || '"NEXDASH Suporte" <suporte@nexdash.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Código de Recuperação — NEXDASH</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background-color: #050505;
          color: #f2f2f2;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #0c0c0e;
          border: 1px solid #1f1f1f;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .header {
          padding: 30px;
          text-align: center;
          background-color: #121214;
          border-bottom: 1px solid #1f1f1f;
        }
        .header h1 {
          color: #ffffff;
          font-size: 24px;
          margin: 0;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .content {
          padding: 40px 30px;
          line-height: 1.6;
        }
        .content p {
          margin: 0 0 20px;
          font-size: 15px;
          color: #a1a1aa;
        }
        .code-box {
          font-size: 32px;
          font-weight: 850;
          color: #e13a40;
          text-align: center;
          margin: 30px auto;
          letter-spacing: 6px;
          background: #121214;
          padding: 18px;
          border-radius: 12px;
          border: 1px dashed rgba(225, 58, 64, 0.4);
          max-width: 240px;
          box-shadow: 0 0 15px rgba(225, 58, 64, 0.1);
        }
        .footer {
          padding: 20px 30px;
          text-align: center;
          background-color: #08080a;
          border-top: 1px solid #1f1f1f;
          font-size: 11px;
          color: #52525b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NEXDASH</h1>
        </div>
        <div class="content">
          <p>Olá, <strong>${name}</strong>,</p>
          <p>Recebemos uma solicitação para redefinir a senha de acesso da sua conta corporativa no <strong>NEXDASH CRM</strong>.</p>
          <p>Utilize o código de verificação exclusivo abaixo na tela de redefinição para criar uma nova senha com segurança. Este código expira em 15 minutos.</p>
          
          <div class="code-box">${code}</div>
          
          <p style="margin-top: 30px; border-top: 1px solid #1f1f1f; padding-top: 20px; font-size: 13px; color: #71717a;">Se você não realizou esta solicitação, pode ignorar este e-mail com segurança. Sua senha atual continuará ativa.</p>
        </div>
        <div class="footer">
          NEXDASH CRM &bull; Inteligência & Automação de Vendas<br>
          Este é um e-mail automático, por favor não responda.
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Olá, ${name}!

Recebemos uma solicitação para redefinir a senha de sua conta corporativa no NEXDASH CRM.
Utilize o código de verificação abaixo na tela de redefinição para alterar sua senha (expira em 15 minutos):

CÓDIGO: ${code}

Se você não realizou esta solicitação, por favor desconsidere este e-mail.

NEXDASH CRM & Automação.
  `;

  await transporter.sendMail({
    from: fromAddress,
    to: email,
    subject: 'Código de Recuperação — NEXDASH CRM',
    text: textContent,
    html: htmlContent,
  });
};
