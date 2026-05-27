import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserByEmail, createUser, getUserById, updateUserPlan, updateUserTrialEndsAt, updateUserAdminDetails } from '../db/master.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'millalipe-crm-super-secret-key-saas';

// POST /api/auth/register - Register a new client account
router.post('/register', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
  }

  try {
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    // Secure password hashing
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    let newUser = createUser(email, passwordHash, name);

    // Auto-promote administrators
    const isGleison = newUser.email.toLowerCase() === 'gleison@nexdash.com';
    const hasAdminWord = newUser.email.toLowerCase().includes('admin');
    if (isGleison || hasAdminWord) {
      newUser = updateUserAdminDetails(newUser.id, { role: 'admin' });
    }

    // Generate JWT token
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
      { expiresIn: '7d' }
    );

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
    res.status(500).json({ error: 'Erro ao criar conta. Tente novamente.' });
  }
});

// POST /api/auth/login - Login client
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    let user = getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    // Auto-promote administrators dynamically on login
    const isGleison = user.email.toLowerCase() === 'gleison@nexdash.com';
    const hasAdminWord = user.email.toLowerCase().includes('admin');
    if ((isGleison || hasAdminWord) && user.role !== 'admin') {
      user = updateUserAdminDetails(user.id, { role: 'admin' });
    }

    // Generate JWT token
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
      { expiresIn: '7d' }
    );

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

// POST /api/auth/testing/manipulate-trial - Alter trial end date for SAAS simulation testing (JWT protected)
router.post('/testing/manipulate-trial', authenticateToken, (req, res) => {
  const { days } = req.body; // e.g. -8 to expire, +7 to reset
  if (days === undefined) {
    return res.status(400).json({ error: 'Parâmetro days é obrigatório.' });
  }

  try {
    // Calculate new date relative to now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + Number(days));
    const targetDateString = targetDate.toISOString().replace('T', ' ').substring(0, 19); // sqlite friendly string format: YYYY-MM-DD HH:MM:SS
    
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
