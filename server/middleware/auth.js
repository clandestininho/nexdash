import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'millalipe-crm-super-secret-key-saas';

/**
 * Express Middleware to authenticate API requests via JWT.
 * Expects header: Authorization: Bearer <token>
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
}

export default authenticateToken;
