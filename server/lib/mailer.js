import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

/**
 * Sends a premium welcoming email with credentials and embedded onboarding banner.
 * @param {string} email Target user email
 * @param {string} name Target user name
 * @param {string} password Raw generated password
 */
export const sendWelcomeEmail = async (email, name, password) => {
  const transporter = getTransporter();
  const fromAddress = process.env.SMTP_FROM || '"NEXDASH Suporte" <suporte@nexdash.com>';
  
  // High fidelity email template incorporating dark mode, glowing red elements and cards
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bem-vindo ao NEXDASH CRM</title>
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
          border: 1px solid #1f1f23;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 15px 40px rgba(0,0,0,0.6);
        }
        .banner-container {
          width: 100%;
          display: block;
          overflow: hidden;
        }
        .banner-img {
          width: 100%;
          height: auto;
          display: block;
        }
        .content {
          padding: 40px 35px;
          line-height: 1.6;
        }
        .greeting {
          font-size: 20px;
          font-weight: 800;
          color: #ffffff;
          margin-top: 0;
          margin-bottom: 10px;
        }
        .accent-text {
          color: #e13a40;
          font-weight: 700;
        }
        .desc {
          font-size: 14px;
          color: #a1a1aa;
          margin-bottom: 25px;
        }
        .credentials-card {
          background-color: #121215;
          border: 1px solid #2a2a30;
          border-radius: 14px;
          padding: 25px;
          margin: 30px 0;
          position: relative;
        }
        .credentials-title {
          font-size: 12px;
          font-weight: 800;
          color: #e13a40;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-top: 0;
          margin-bottom: 15px;
        }
        .credential-field {
          margin-bottom: 12px;
          font-size: 14px;
        }
        .credential-field:last-child {
          margin-bottom: 0;
        }
        .label {
          color: #71717a;
          font-weight: 600;
          display: inline-block;
          width: 80px;
        }
        .value {
          color: #ffffff;
          font-weight: 700;
          font-family: monospace;
          background: #18181c;
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid #27272a;
        }
        .btn-container {
          text-align: center;
          margin: 35px 0 10px;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #e13a40 0%, #ff483d 100%);
          color: #ffffff !important;
          text-decoration: none;
          font-weight: 800;
          font-size: 13px;
          padding: 14px 35px;
          border-radius: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
          box-shadow: 0 4px 15px rgba(225, 58, 64, 0.3);
          transition: all 0.3s ease;
        }
        .footer {
          padding: 25px 35px;
          text-align: center;
          background-color: #08080a;
          border-top: 1px solid #1f1f23;
          font-size: 11px;
          color: #52525b;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="banner-container">
          <img src="cid:welcome_banner" alt="Bem-vindo ao NEXDASH" class="banner-img" />
        </div>
        <div class="content">
          <h2 class="greeting">Olá, <span class="accent-text">${name}</span>!</h2>
          <p class="desc">
            Sua conta corporativa no <strong>NEXDASH CRM</strong> acaba de ser criada pelo nosso departamento administrativo e está pronta para uso! 🚀
          </p>
          <p class="desc">
            A partir de agora, você tem acesso às ferramentas mais avançadas do mercado para impulsionar suas vendas, organizar leads, automatizar conversas via WhatsApp e gerar propostas comerciais inteligentes com o poder da Inteligência Artificial.
          </p>
          
          <div class="credentials-card">
            <h4 class="credentials-title">🔑 Seus Dados de Acesso</h4>
            <div class="credential-field">
              <span class="label">Login:</span>
              <span class="value">${email}</span>
            </div>
            <div class="credential-field">
              <span class="label">Senha:</span>
              <span class="value">${password}</span>
            </div>
          </div>
          
          <p class="desc" style="font-size: 12px; color: #71717a; font-style: italic;">
            * Nota de segurança: Para sua facilidade, sua senha inicial foi definida como seu próprio e-mail corporativo. Recomendamos alterá-la na aba de Configurações do seu perfil após o primeiro acesso.
          </p>

          <div class="btn-container">
            <a href="http://localhost:5173/login" target="_blank" class="btn">Acessar Meu Painel</a>
          </div>
        </div>
        <div class="footer">
          <strong>NEXDASH CRM</strong> &bull; Inteligência & Automação de Vendas<br>
          Este é um e-mail com informações confidenciais de credenciais de acesso, guarde-o com segurança.
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Olá, ${name}!

Sua conta corporativa no NEXDASH CRM acaba de ser criada pelo nosso painel administrativo! 🚀

A partir de agora, você tem acesso às ferramentas de automação mais avançadas do mercado para impulsionar suas vendas.

🔑 SEUS DADOS DE ACESSO:
----------------------------------------
LOGIN: ${email}
SENHA: ${password}
----------------------------------------

Acesse o sistema no endereço: http://localhost:5173/login

Recomendamos alterar sua senha inicial na aba de Configurações após o primeiro acesso.

Seja bem-vindo a bordo!
Equipe NEXDASH
  `;

  const welcomeBannerPath = path.join(__dirname, '..', '..', 'uploads', 'welcome_banner.png');

  const mailOptions = {
    from: fromAddress,
    to: email,
    subject: 'Sua conta corporativa está pronta! — NEXDASH CRM',
    text: textContent,
    html: htmlContent,
    attachments: []
  };

  // Embed the welcome banner inline if the file exists on the server
  if (fs.existsSync(welcomeBannerPath)) {
    mailOptions.attachments.push({
      filename: 'welcome_banner.png',
      path: welcomeBannerPath,
      cid: 'welcome_banner'
    });
  }

  await transporter.sendMail(mailOptions);
};

