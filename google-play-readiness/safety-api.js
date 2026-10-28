'use strict';

const express = require('express');
const { requireFeature } = require('./age-policy');

function createSafetyRouter({ db, requireAuth, requireModerator }) {
  const router = express.Router();

  router.use(requireAuth);

  router.post('/reports', async (req, res) => {
    const { targetType, targetId, reason, details } = req.body || {};
    if (!targetType || !targetId || !reason) return res.status(400).json({ error: 'MISSING_REPORT_FIELDS' });
    const report = await db.createReport({ reporterId: req.user.id, targetType, targetId, reason, details: details || null });
    res.status(201).json({ report });
  });

  router.post('/blocks/:userId', async (req, res) => {
    if (req.params.userId === req.user.id) return res.status(400).json({ error: 'CANNOT_BLOCK_SELF' });
    await db.blockUser({ blockerId: req.user.id, blockedId: req.params.userId });
    res.status(204).end();
  });

  router.delete('/blocks/:userId', async (req, res) => {
    await db.unblockUser({ blockerId: req.user.id, blockedId: req.params.userId });
    res.status(204).end();
  });

  router.post('/mutes/:userId', async (req, res) => {
    await db.muteUser({ muterId: req.user.id, mutedId: req.params.userId });
    res.status(204).end();
  });

  router.post('/account-deletion-request', async (req, res) => {
    const request = await db.createDeletionRequest({ userId: req.user.id, requestedAt: new Date().toISOString() });
    res.status(202).json({ request, message: 'Deletion request received' });
  });

  router.post('/live/:roomId/join', requireFeature('child_safe_live'), async (req, res) => {
    const room = await db.getLiveRoom(req.params.roomId);
    if (!room) return res.status(404).json({ error: 'ROOM_NOT_FOUND' });
    const required = room.min_age >= 18 ? 'adult_live' : room.min_age >= 13 ? 'teen_live' : 'child_safe_live';
    return requireFeature(required)(req, res, async () => {
      const token = await db.issueLiveToken({ user: req.user, room });
      res.json({ token, room });
    });
  });

  router.post('/moderation/:targetType/:targetId/action', requireModerator, async (req, res) => {
    const { action, durationMinutes, reason } = req.body || {};
    const allowed = ['WARN', 'MUTE', 'KICK', 'SUSPEND', 'BAN', 'TERMINATE_LIVE', 'REMOVE_CONTENT'];
    if (!allowed.includes(action)) return res.status(400).json({ error: 'INVALID_ACTION' });
    const result = await db.createModerationAction({
      moderatorId: req.user.id,
      targetType: req.params.targetType,
      targetId: req.params.targetId,
      action,
      durationMinutes: durationMinutes || null,
      reason: reason || null
    });
    res.status(201).json({ result });
  });

  return router;
}

module.exports = { createSafetyRouter };
