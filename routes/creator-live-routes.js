"use strict";

function registerCreatorLiveRoutes({ app, service, requireAuth }) {
  app.post("/api/live/start", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const roomName = req.body?.roomName || `creator-${userId}-${Date.now()}`;
      const result = await service.start({ userId, roomName, displayName: req.body?.displayName });
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/live/:sessionId/tick", requireAuth, async (req, res) => {
    try {
      res.json(await service.addActiveSeconds({ sessionId: req.params.sessionId, seconds: req.body?.seconds }));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/live/:sessionId/break", requireAuth, async (req, res) => {
    try {
      res.json(await service.pause({
        sessionId: req.params.sessionId,
        userId: req.user.id,
        breakType: req.body?.breakType || "bathroom",
        requestedSeconds: req.body?.requestedSeconds || 0
      }));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/live/:sessionId/resume", requireAuth, async (req, res) => {
    try {
      res.json(await service.resume({ sessionId: req.params.sessionId }));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/live/:sessionId/end", requireAuth, async (req, res) => {
    try {
      res.json(await service.end({ sessionId: req.params.sessionId, roomName: req.body?.roomName }));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/creator/progress", requireAuth, async (req, res) => {
    try {
      res.json(await service.getProgress(req.user.id));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
}

module.exports = { registerCreatorLiveRoutes };
