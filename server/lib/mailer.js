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
 * Sends a password reset email to the user.
 * @param {string} email Target user email
 * @param {string} name Target user name
 * @param {string} resetLink Exclusive password reset URL
 */
export const sendResetPasswordEmail = async (email, name, resetLink) => {
  const transporter = getTransporter();
  const fromAddress = process.env.SMTP_FROM || '"NEXDASH Suporte" <suporte@nexdash.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Recuperação de Senha — NEXDASH</title>
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
        .btn-container {
          text-align: center;
          margin: 35px 0;
        }
        .btn {
          display: inline-block;
          background-color: #e13a40;
          color: #ffffff !important;
          text-decoration: none;
          padding: 14px 28px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(225,58,64,0.3);
          transition: background-color 0.2s;
        }
        .btn:hover {
          background-color: #c52f34;
        }
        .footer {
          padding: 20px 30px;
          text-align: center;
          background-color: #08080a;
          border-top: 1px solid #1f1f1f;
          font-size: 11px;
          color: #52525b;
        }
        .footer a {
          color: #e13a40;
          text-decoration: none;
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
          <p>Para criar uma nova senha de forma segura, clique no botão abaixo. Este link expira em 15 minutos por medidas de segurança.</p>
          
          <div class="btn-container">
            <a href="${resetLink}" class="btn" target="_blank">Redefinir Minha Senha</a>
          </div>
          
          <p style="font-size: 12px; color: #71717a;">Se o botão não funcionar, copie e cole o link a seguir no seu navegador:</p>
          <p style="font-size: 12px; word-break: break-all; color: #71717a;">${resetLink}</p>
          
          <p style="margin-top: 30px; border-top: 1px solid #1f1f1f; padding-top: 20px; font-size: 13px;">Se você não realizou esta solicitação, pode desconsiderar este e-mail com segurança. Sua senha atual permanecerá intacta.</p>
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
Por favor, acesse o link abaixo para redefinir sua senha com segurança (expira em 15 minutos):

${resetLink}

Se você não realizou esta solicitação, por favor desconsidere este e-mail.

NEXDASH CRM & Automação.
  `;

  await transporter.sendMail({
    from: fromAddress,
    to: email,
    subject: 'Recuperação de Senha — NEXDASH CRM',
    text: textContent,
    html: htmlContent,
  });
};
