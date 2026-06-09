import express from 'express'; // Force All OAuth Env Reload
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { 
  getUserByEmail, 
  createUser, 
  getUserById, 
  updateUserPlan, 
  updateUserTrialEndsAt, 
  updateUserAdminDetails,
  updateUserPassword
} from '../db/master.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendResetPasswordEmail } from '../lib/mailer.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'millalipe-crm-super-secret-key-saas';

// Helper for security logging (stores log event to security_audit.log and prints to console)
const logSecurityEvent = (eventType, email, ip, details = '') => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [SECURITY AUDIT] Event: ${eventType} | User: ${email || 'N/A'} | IP: ${ip || 'N/A'} | Details: ${details}\n`;
  console.log(logMessage.trim());
  try {
    const logFilePath = path.join(process.cwd(), 'security_audit.log');
    fs.appendFileSync(logFilePath, logMessage);
  } catch (err) {
    console.error('Failed to write to security audit log:', err);
  }
};

// Strong password validation regex: minimum 8 chars, at least one uppercase letter, one lowercase letter, and one number
const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  return hasUpperCase && hasLowerCase && hasNumbers;
};

// POST /api/auth/register - Register a new client account
router.post('/register', (req, res) => {
  const { email, password, name } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!email || !password || !name) {
    logSecurityEvent('REGISTER_FAILED', email, ip, 'Missing required signup fields');
    return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
  }

  try {
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      logSecurityEvent('REGISTER_FAILED', email, ip, 'Email already registered');
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    // Enforce password strength on registration
    if (!validatePasswordStrength(password)) {
      logSecurityEvent('REGISTER_FAILED', email, ip, 'Password strength validation failed');
      return res.status(400).json({ 
        error: 'A senha deve conter no mínimo 8 caracteres, com pelo menos uma letra maiúscula, uma minúscula e um número.' 
      });
    }

    // Secure password hashing
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    let newUser = createUser(email, passwordHash, name);

    // Auto-promote administrators
    const isGleison = newUser.email.toLowerCase() === 'gleison@nexdash.com' || newUser.email.toLowerCase() === 'gleisonsax@gmail.com' || newUser.email.toLowerCase() === 'isabelaluisag@gmail.com';
    const hasAdminWord = newUser.email.toLowerCase().includes('admin');
    if (isGleison || hasAdminWord) {
      newUser = updateUserAdminDetails(newUser.id, { role: 'admin', plan: 'next' });
    }

    // Generate JWT token expirable in 12 hours for security compliance
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        name: newUser.name, 
        plan: newUser.plan || 'trial', 
        trial_ends_at: newUser.trial_ends_at,
        role: newUser.role || 'user',
        phone: newUser.phone || '',
        amount_paid: newUser.amount_paid || 0,
        billing_cycle: newUser.billing_cycle || 'monthly'
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    logSecurityEvent('REGISTER_SUCCESS', newUser.email, ip, `User created with role: ${newUser.role}`);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        plan: newUser.plan || 'trial',
        trial_ends_at: newUser.trial_ends_at,
        role: newUser.role || 'user',
        phone: newUser.phone || '',
        amount_paid: newUser.amount_paid || 0,
        billing_cycle: newUser.billing_cycle || 'monthly',
        created_at: newUser.created_at
      },
    });
  } catch (err) {
    console.error('[AuthRoute] Registration error:', err);
    logSecurityEvent('REGISTER_ERROR', email, ip, err.message);
    res.status(500).json({ error: 'Erro ao criar conta. Tente novamente.' });
  }
});

// POST /api/auth/login - Login client
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!email || !password) {
    logSecurityEvent('LOGIN_FAILED', email, ip, 'Missing email or password');
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    let user = getUserByEmail(email);
    if (!user) {
      logSecurityEvent('LOGIN_FAILED', email, ip, 'Non-existent email lookup');
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    if (!isValidPassword) {
      logSecurityEvent('LOGIN_FAILED', email, ip, 'Invalid password attempt');
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    // Auto-promote administrators dynamically on login
    const isGleison = user.email.toLowerCase() === 'gleison@nexdash.com' || user.email.toLowerCase() === 'gleisonsax@gmail.com' || user.email.toLowerCase() === 'isabelaluisag@gmail.com';
    const hasAdminWord = user.email.toLowerCase().includes('admin');
    if ((isGleison || hasAdminWord) && (user.role !== 'admin' || user.plan !== 'next')) {
      user = updateUserAdminDetails(user.id, { role: 'admin', plan: 'next' });
    }

    // Generate JWT token expirable in 12 hours for strict security
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        plan: user.plan || 'trial', 
        trial_ends_at: user.trial_ends_at,
        role: user.role || 'user',
        phone: user.phone || '',
        amount_paid: user.amount_paid || 0,
        billing_cycle: user.billing_cycle || 'monthly'
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    logSecurityEvent('LOGIN_SUCCESS', user.email, ip, `User logged in with role: ${user.role}`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan || 'trial',
        trial_ends_at: user.trial_ends_at,
        role: user.role || 'user',
        phone: user.phone || '',
        amount_paid: user.amount_paid || 0,
        billing_cycle: user.billing_cycle || 'monthly',
        created_at: user.created_at
      },
    });
  } catch (err) {
    console.error('[AuthRoute] Login error:', err);
    logSecurityEvent('LOGIN_ERROR', email, ip, err.message);
    res.status(500).json({ error: 'Erro ao entrar. Tente novamente.' });
  }
});

// GET /api/auth/me - Get current user profile fresh from database (JWT protected)
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan || 'trial',
        trial_ends_at: user.trial_ends_at,
        role: user.role || 'user',
        phone: user.phone || '',
        amount_paid: user.amount_paid || 0,
        billing_cycle: user.billing_cycle || 'monthly',
        created_at: user.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar dados do usuário.' });
  }
});

// POST /api/auth/subscribe - Update active subscription plan (JWT protected)
router.post('/subscribe', authenticateToken, (req, res) => {
  const { plan } = req.body;
  if (!plan) {
    return res.status(400).json({ error: 'Plano é obrigatório.' });
  }

  try {
    const updated = updateUserPlan(req.user.id, plan);
    res.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        plan: updated.plan,
        trial_ends_at: updated.trial_ends_at,
        created_at: updated.created_at
      }
    });
  } catch (err) {
    console.error('[AuthRoute] Subscribe error:', err);
    res.status(500).json({ error: 'Erro ao atualizar assinatura.' });
  }
});

// Active reset codes memory map
const resetCodes = new Map();

// POST /api/auth/forgot-password - Generate password reset 6-digit code
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório.' });
  }

  try {
    const user = getUserByEmail(email);
    if (!user) {
      // Return 200 standard message for privacy protection against user enumeration
      logSecurityEvent('PASSWORD_RESET_REQUEST_UNREGISTERED', email, ip, 'Reset code requested for non-existing email');
      return res.json({
        success: true,
        message: 'Se o e-mail informado estiver cadastrado, o código de recuperação foi enviado.'
      });
    }

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in memory map for 15 minutes
    resetCodes.set(email.toLowerCase().trim(), {
      code,
      expiresAt: Date.now() + 15 * 60 * 1000,
      userId: user.id
    });

    // Send the email with the code!
    try {
      await sendResetPasswordEmail(user.email, user.name, code);
      logSecurityEvent('PASSWORD_RESET_REQUEST_SUCCESS', email, ip, `Reset code ${code} generated and sent`);
    } catch (mailErr) {
      console.warn('⚠️ [SMTP ERROR] Failed to send email, falling back to console logging:', mailErr.message);
      console.log('========================================================');
      console.log('📬 [EMAIL FALLBACK] SMTP TRANSMISSION FAILED');
      console.log(`To: ${user.email}`);
      console.log(`Reset Code: ${code}`);
      console.log('========================================================');
      logSecurityEvent('PASSWORD_RESET_REQUEST_SMTP_FALLBACK', email, ip, `SMTP failed (${mailErr.message}), fallback code logged: ${code}`);
    }

    res.json({
      success: true,
      message: 'Se o e-mail informado estiver cadastrado, o código de recuperação foi enviado.'
    });
  } catch (err) {
    console.error('[AuthRoute] Forgot password error:', err);
    logSecurityEvent('PASSWORD_RESET_REQUEST_ERROR', email, ip, err.message);
    res.status(500).json({ error: 'Erro ao processar solicitação de recuperação.' });
  }
});

// POST /api/auth/reset-password - Verify 6-digit code and update user password safely
router.post('/reset-password', (req, res) => {
  const { email, code, password } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!email || !code || !password) {
    return res.status(400).json({ error: 'E-mail, código e nova senha são obrigatórios.' });
  }

  // Validate password complexity
  if (!validatePasswordStrength(password)) {
    return res.status(400).json({ 
      error: 'A senha deve conter no mínimo 8 caracteres, com pelo menos uma letra maiúscula, uma minúscula e um número.' 
    });
  }

  try {
    const activeReset = resetCodes.get(email.toLowerCase().trim());
    if (!activeReset) {
      logSecurityEvent('PASSWORD_RESET_FAILED_NO_CODE', email, ip, 'No active reset code found');
      return res.status(400).json({ error: 'Nenhuma solicitação de recuperação ativa para este e-mail.' });
    }

    if (Date.now() > activeReset.expiresAt) {
      resetCodes.delete(email.toLowerCase().trim());
      logSecurityEvent('PASSWORD_RESET_FAILED_EXPIRED', email, ip, 'Reset code expired');
      return res.status(400).json({ error: 'O código de recuperação expirou. Solicite um novo código.' });
    }

    if (activeReset.code !== code.trim()) {
      logSecurityEvent('PASSWORD_RESET_FAILED_WRONG_CODE', email, ip, `Invalid code entered: ${code}`);
      return res.status(400).json({ error: 'Código de recuperação inválido.' });
    }

    const user = getUserById(activeReset.userId);
    if (!user) {
      logSecurityEvent('PASSWORD_RESET_FAILED_USER_NOT_FOUND', email, ip, 'User not found');
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Secure password hashing
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    updateUserPassword(user.id, passwordHash);
    
    // Clear code from memory
    resetCodes.delete(email.toLowerCase().trim());
    logSecurityEvent('PASSWORD_RESET_SUCCESS', user.email, ip, 'Password updated successfully via verification code');

    res.json({
      success: true,
      message: 'Senha alterada com sucesso! Você já pode realizar o login.'
    });
  } catch (err) {
    console.error('[AuthRoute] Reset password error:', err);
    logSecurityEvent('PASSWORD_RESET_FAILED_ERROR', email, ip, err.message);
    res.status(500).json({ error: 'Erro ao redefinir senha. Tente novamente.' });
  }
});

// GET /api/auth/:provider - Redirect to OAuth provider
router.get('/:provider(google|github|apple)', (req, res) => {
  const { provider } = req.params;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  // Real or mock credentials check
  const hasCreds = provider === 'google' 
    ? (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    : provider === 'github'
      ? (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
      : false;

  let origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
  // Force HTTPS for production domain in VPS to avoid redirect_uri_mismatch on reverse proxies
  if (origin.includes('legattoorg.com.br') && !origin.startsWith('https://')) {
    origin = origin.replace('http://', 'https://');
  }
  
  if (hasCreds) {
    logSecurityEvent('OAUTH_REDIRECT_PRODUCTION', '', ip, `Redirecting to production ${provider} OAuth`);
    let authUrl = '';
    if (provider === 'google') {
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(origin + '/api/auth/callback/google')}&response_type=code&scope=email%20profile`;
    } else if (provider === 'github') {
      authUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(origin + '/api/auth/callback/github')}&scope=user:email`;
    }
    return res.redirect(authUrl);
  } else {
    // In development or missing credentials, render a premium glassmorphic mock consent form
    logSecurityEvent('OAUTH_REDIRECT_MOCK', '', ip, `Rendering interactive simulated ${provider} OAuth consent form`);
    
    const capitalizedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
    
    // Choose simulated defaults
    const simulatedEmail = provider === 'google' ? 'gleisonsax@gmail.com' : `admin_${provider}@nexdash.com`;
    const simulatedName = provider === 'google' ? 'Gleison Sax' : `Admin ${capitalizedProvider}`;

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Simulador de Conexão OAuth NEXDASH</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800;900&display=swap" rel="stylesheet">
        <style>
          body {
            background-color: #060608;
            color: #f3f4f6;
            font-family: 'Montserrat', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            overflow: hidden;
            background-image: radial-gradient(circle at 50% 50%, #1e1112 0%, #060608 80%);
          }
          .glass-panel {
            background: rgba(12, 12, 14, 0.7);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 24px;
            padding: 40px;
            width: 100%;
            max-width: 440px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
            text-align: center;
            box-sizing: border-box;
            position: relative;
          }
          .glass-panel::before {
            content: '';
            position: absolute;
            top: 0; left: 10%; right: 10%; height: 2px;
            background: linear-gradient(90deg, transparent, #e13a40, transparent);
          }
          .logo-container {
            margin-bottom: 24px;
          }
          .logo-icon {
            width: 48px;
            height: 48px;
            background: rgba(225, 58, 64, 0.1);
            border: 1px solid rgba(225, 58, 64, 0.3);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            color: #e13a40;
            font-size: 24px;
            font-weight: 900;
            box-shadow: 0 0 20px rgba(225, 58, 64, 0.2);
          }
          h2 {
            font-size: 20px;
            font-weight: 900;
            margin: 0 0 8px 0;
            letter-spacing: -0.5px;
            text-transform: uppercase;
            background: linear-gradient(135deg, #ffffff 0%, #a3a3a3 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .badge {
            display: inline-block;
            background: rgba(225, 58, 64, 0.1);
            border: 1px solid rgba(225, 58, 64, 0.2);
            color: #e13a40;
            font-size: 8px;
            font-weight: 900;
            text-transform: uppercase;
            padding: 4px 10px;
            border-radius: 6px;
            letter-spacing: 1px;
            margin-bottom: 20px;
          }
          p.description {
            font-size: 11px;
            color: #9ca3af;
            line-height: 1.6;
            margin: 0 0 28px 0;
          }
          .form-group {
            text-align: left;
            margin-bottom: 20px;
          }
          label {
            display: block;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            color: #6b7280;
            letter-spacing: 0.8px;
            margin-bottom: 8px;
          }
          input {
            width: 100%;
            background: #09090b;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 12px 16px;
            font-size: 13px;
            color: #ffffff;
            font-family: inherit;
            box-sizing: border-box;
            outline: none;
            transition: all 0.2s ease;
          }
          input:focus {
            border-color: #e13a40;
            box-shadow: 0 0 15px rgba(225, 58, 64, 0.15);
            background: #0c0c0e;
          }
          .btn-submit {
            width: 100%;
            background: #e13a40;
            color: #ffffff;
            border: none;
            border-radius: 12px;
            padding: 14px;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 15px rgba(225, 58, 64, 0.3);
            margin-top: 10px;
          }
          .btn-submit:hover {
            background: #c52f34;
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(225, 58, 64, 0.4);
          }
          .btn-submit:active {
            transform: translateY(0);
          }
          .footer-note {
            font-size: 9px;
            color: #4b5563;
            margin-top: 24px;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="glass-panel">
          <div class="logo-container">
            <div class="logo-icon">N</div>
          </div>
          <h2>Conexão OAuth Simulado</h2>
          <div class="badge">Ambiente de Demonstração</div>
          <p class="description">
            Insira suas informações abaixo para simular uma conexão segura de cadastro e login de terceiros via <strong>${capitalizedProvider}</strong>.
          </p>
          <form action="/api/auth/callback/${provider}" method="GET">
            <div class="form-group">
              <label>Nome Completo</label>
              <input type="text" name="name" value="${simulatedName}" required placeholder="Ex: João Silva">
            </div>
            <div class="form-group">
              <label>Endereço de E-mail</label>
              <input type="email" name="email" value="${simulatedEmail}" required placeholder="Ex: joao@empresa.com">
            </div>
            <button type="submit" class="btn-submit">Autorizar e Conectar</button>
          </form>
          <div class="footer-note">
            Este simulador garante que cada usuário em teste utilize seu próprio banco de dados SQLite isolado e visualize a jornada de Onboarding.
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

// GET /api/auth/callback/:provider - OAuth callback returning HTML script to save user variables dynamically
router.get('/callback/:provider(google|github|apple)', async (req, res) => {
  const { provider } = req.params;
  const { code } = req.query;
  let { email, name } = req.query;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  try {
    // 1. Google OAuth Token Exchange and Profile Retrieval
    if (provider === 'google' && code && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      logSecurityEvent('OAUTH_EXCHANGE_START', 'google', ip, 'Exchanging Google auth code for token');
      let origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
      if (origin.includes('legattoorg.com.br') && !origin.startsWith('https://')) {
        origin = origin.replace('http://', 'https://');
      }
      const redirectUri = origin + '/api/auth/callback/google';

      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const bodyParams = new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      });

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyParams.toString()
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('[GoogleOAuth] Token exchange failed:', errorText);
        throw new Error(`Google token exchange failed: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Fetch user profile info
      const userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
      const userInfoResponse = await fetch(userInfoUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!userInfoResponse.ok) {
        throw new Error('Google userinfo fetch failed');
      }

      const userInfo = await userInfoResponse.json();
      email = userInfo.email;
      name = userInfo.name || userInfo.email;
      logSecurityEvent('OAUTH_EXCHANGE_SUCCESS', email, ip, `Successfully fetched Google profile for ${name}`);
    }

    // 2. GitHub OAuth Token Exchange and Profile Retrieval
    if (provider === 'github' && code && process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
      logSecurityEvent('OAUTH_EXCHANGE_START', 'github', ip, 'Exchanging GitHub auth code for token');
      let origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
      if (origin.includes('legattoorg.com.br') && !origin.startsWith('https://')) {
        origin = origin.replace('http://', 'https://');
      }
      const redirectUri = origin + '/api/auth/callback/github';

      const tokenUrl = 'https://github.com/login/oauth/access_token';
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri
        })
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('[GitHubOAuth] Token exchange failed:', errorText);
        throw new Error(`GitHub token exchange failed: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Fetch user profile info
      const userInfoUrl = 'https://api.github.com/user';
      const userInfoResponse = await fetch(userInfoUrl, {
        headers: { 
          'Authorization': `token ${accessToken}`,
          'User-Agent': 'NEXDASH-App'
        }
      });

      if (!userInfoResponse.ok) {
        throw new Error('GitHub userinfo fetch failed');
      }

      const userInfo = await userInfoResponse.json();
      name = userInfo.name || userInfo.login;

      // Fetch user email if not public in profile
      if (userInfo.email) {
        email = userInfo.email;
      } else {
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
          headers: { 
            'Authorization': `token ${accessToken}`,
            'User-Agent': 'NEXDASH-App'
          }
        });
        if (emailsResponse.ok) {
          const emails = await emailsResponse.json();
          const primaryEmail = emails.find(e => e.primary) || emails[0];
          if (primaryEmail) email = primaryEmail.email;
        }
      }

      if (!email) {
        email = `${userInfo.login}@github.com`;
      }
      logSecurityEvent('OAUTH_EXCHANGE_SUCCESS', email, ip, `Successfully fetched GitHub profile for ${name}`);
    }

    // Fallbacks
    email = email || `user_${provider}@nexdash.com`;
    name = name || `Usuário ${provider.charAt(0).toUpperCase() + provider.slice(1)}`;

    let user = getUserByEmail(email);
    if (!user) {
      // Create user automatically in trial plan
      const mockPasswordHash = bcrypt.hashSync('SocialSecuredDummyPass123!', bcrypt.genSaltSync(10));
      user = createUser(email, mockPasswordHash, name);
      logSecurityEvent('OAUTH_SIGNUP_SUCCESS', email, ip, `Auto-registered user via ${provider}`);
    } else {
      logSecurityEvent('OAUTH_LOGIN_SUCCESS', email, ip, `Logged in user via ${provider}`);
    }

    // Auto-promote administrators dynamically on social login/signup
    const isGleison = user.email.toLowerCase() === 'gleison@nexdash.com' || user.email.toLowerCase() === 'gleisonsax@gmail.com' || user.email.toLowerCase() === 'isabelaluisag@gmail.com';
    const hasAdminWord = user.email.toLowerCase().includes('admin');
    if ((isGleison || hasAdminWord) && (user.role !== 'admin' || user.plan !== 'next')) {
      user = updateUserAdminDetails(user.id, { role: 'admin', plan: 'next' });
    }

    // Generate JWT token (12h expiration)
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        plan: user.plan || 'trial', 
        trial_ends_at: user.trial_ends_at,
        role: user.role || 'user',
        phone: user.phone || '',
        amount_paid: user.amount_paid || 0,
        billing_cycle: user.billing_cycle || 'monthly'
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Return HTML to update localStorage and redirect
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>NEXDASH Social Login Success</title>
        <style>
          body { background-color: #050505; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .loader { border: 4px solid #1f1f1f; border-top: 4px solid #e13a40; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .container { text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="loader"></div>
          <h2>Conectando com segurança ao NEXDASH...</h2>
          <p style="color: #666; font-size: 14px;">Você será redirecionado em instantes.</p>
        </div>
        <script>
          try {
            localStorage.setItem('token', ${JSON.stringify(token)});
            localStorage.setItem('user', ${JSON.stringify(JSON.stringify(user))});
            window.location.href = '/';
          } catch(e) {
            console.error('Failed to authenticate:', e);
            document.body.innerHTML = '<h2>Erro na autenticação. Por favor, feche esta guia e tente novamente.</h2>';
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(`[SocialCallback] Error for ${provider}:`, err);
    res.status(500).send('<h2>Erro interno durante a autenticação social.</h2>');
  }
});

// POST /api/auth/testing/manipulate-trial - Alter trial end date for SAAS simulation testing (JWT protected)
router.post('/testing/manipulate-trial', authenticateToken, (req, res) => {
  const { days } = req.body;
  if (days === undefined) {
    return res.status(400).json({ error: 'Parâmetro days é obrigatório.' });
  }

  try {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + Number(days));
    const targetDateString = targetDate.toISOString().replace('T', ' ').substring(0, 19);
    
    const updated = updateUserTrialEndsAt(req.user.id, targetDateString);
    res.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        plan: updated.plan,
        trial_ends_at: updated.trial_ends_at,
        created_at: updated.created_at
      }
    });
  } catch (err) {
    console.error('[AuthRoute] Trial manipulation error:', err);
    res.status(500).json({ error: 'Erro ao manipular período de testes.' });
  }
});

export default router;
