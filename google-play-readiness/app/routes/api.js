import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { deriveAgeBand, canInteract } from '../lib/policy.js';
import { store } from '../lib/store.js';
import { auth, requireFeature, requireModerator } from '../middleware/auth.js';

export const api = Router();

api.post('/onboarding', (req, res) => {
  const parsed = z.object({ userId: z.string().min(1), dateOfBirth: z.string().min(8), role: z.enum(['USER','MODERATOR','ADMIN']).default('USER') }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const ageBand = deriveAgeBand(parsed.data.dateOfBirth);
    const user = store.upsertUser({ id: parsed.data.userId, dateOfBirth: parsed.data.dateOfBirth, ageBand, role: parsed.data.role, createdAt: new Date().toISOString() });
    const token = jwt.sign({ sub: user.id, ageBand, role: user.role }, process.env.JWT_SECRET || 'dev-only-change-me', { expiresIn: '12h' });
    res.json({ user: { id: user.id, ageBand, role: user.role }, token });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

api.get('/me', auth, (req, res) => res.json(req.user));

api.post('/interactions/check', auth, (req, res) => {
  const target = store.getUser(req.body.targetUserId);
  if (!target) return res.status(404).json({ error: 'Target user not found' });
  res.json({ allowed: canInteract(req.user.ageBand, target.ageBand) });
});

api.post('/reports', auth, (req, res) => {
  const parsed = z.object({ targetType: z.enum(['USER','POST','COMMENT','LIVE','MESSAGE','MARKETPLACE']), targetId: z.string().min(1), reason: z.string().min(3).max(500) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const report = store.addReport({ id: randomUUID(), reporterId: req.user.sub, ...parsed.data, status: 'OPEN', createdAt: new Date().toISOString() });
  res.status(201).json(report);
});

api.post('/blocks/:targetUserId', auth, (req, res) => res.status(201).json({ actorId: req.user.sub, targetUserId: req.params.targetUserId, blocked: true }));
api.post('/mutes/:targetUserId', auth, requireFeature('mute'), (req, res) => res.status(201).json({ actorId: req.user.sub, targetUserId: req.params.targetUserId, muted: true }));

api.post('/lives', auth, requireFeature('create_live'), (req, res) => res.status(201).json({ id: randomUUID(), hostId: req.user.sub, audience: req.body.audience || 'ADULT', status: 'ACTIVE' }));
api.post('/marketplace/checkout', auth, requireFeature('marketplace'), (req, res) => res.json({ allowed: true, note: 'Route digital goods through the Play-compliant billing path; physical goods/services may use approved external payment flows.' }));
api.post('/gifts/send', auth, requireFeature('virtual_gifts'), (req, res) => res.json({ allowed: true, senderId: req.user.sub, recipientId: req.body.recipientId }));

api.post('/account-deletion', auth, (req, res) => {
  const item = store.addDeletionRequest({ id: randomUUID(), userId: req.user.sub, status: 'REQUESTED', requestedAt: new Date().toISOString() });
  res.status(202).json(item);
});

api.post('/moderation/actions', auth, requireModerator, (req, res) => {
  const parsed = z.object({ targetId: z.string().min(1), action: z.enum(['WARN','MUTE','KICK','SUSPEND','BAN','TERMINATE_LIVE','REMOVE_CONTENT']), reason: z.string().min(3) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  res.status(201).json(store.addModerationAction({ id: randomUUID(), moderatorId: req.user.sub, ...parsed.data, createdAt: new Date().toISOString() }));
});

api.get('/admin/snapshot', auth, requireModerator, (_req, res) => res.json(store.snapshot()));
