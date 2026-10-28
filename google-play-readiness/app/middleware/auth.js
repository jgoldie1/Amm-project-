import jwt from 'jsonwebtoken';
import { canUse } from '../lib/policy.js';

export function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-only-change-me');
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireFeature(feature) {
  return (req, res, next) => {
    if (!req.user?.ageBand || !canUse(req.user.ageBand, feature)) {
      return res.status(403).json({ error: 'Feature not available for this account age band', feature });
    }
    next();
  };
}

export function requireModerator(req, res, next) {
  if (!['MODERATOR','ADMIN'].includes(req.user?.role)) return res.status(403).json({ error: 'Moderator access required' });
  next();
}
