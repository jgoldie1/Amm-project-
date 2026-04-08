const jwt = require('jsonwebtoken');
const { getConfig } = require('./config');

function requireAdmin(req, res, next) {
  const cfg = getConfig();
  const token = req.headers['x-admin-token'];
  if (token !== cfg.adminToken) {
    return res.status(403).json({ ok: false, error: 'admin_forbidden' });
  }
  next();
}

function requireUser(req, res, next) {
  const cfg = getConfig();
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, error: 'auth_required' });
  }

  try {
    const payload = jwt.verify(token, cfg.jwtSecret);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: 'invalid_token' });
  }
}

function requireSelfParam(paramName) {
  return (req, res, next) => {
    const value = String(req.params[paramName] || '').trim();
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ ok: false, error: 'auth_required' });
    }
    if (req.user.userId !== value) {
      return res.status(403).json({ ok: false, error: 'self_only_forbidden' });
    }
    next();
  };
}

module.exports = { requireAdmin, requireUser, requireSelfParam };
