require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const { makeApp, readJson, writeJson, nextId, authMiddleware } = require("@aam/shared");

const PORT = process.env.REWARDS_SERVICE_PORT || 4500;

const app = makeApp("rewards-service", PORT, (app) => {
  app.post("/rewards/add", authMiddleware, (req, res) => {
    const { userId, points = 0, reason = "activity" } = req.body;
    const targetUserId = userId ? Number(userId) : Number(req.user.sub);

    const rewards = readJson("rewards.json", []);
    const entry = {
      id: nextId(rewards),
      userId: targetUserId,
      points: Number(points),
      reason,
      createdAt: new Date().toISOString()
    };
    rewards.push(entry);
    writeJson("rewards.json", rewards);

    res.status(201).json({ ok: true, entry });
  });

  app.get("/rewards/:userId", (_req, res) => {
    const rewards = readJson("rewards.json", []);
    const userId = Number(_req.params.userId);
    const entries = rewards.filter((r) => Number(r.userId) === userId);
    const total = entries.reduce((sum, x) => sum + Number(x.points || 0), 0);
    res.json({ ok: true, total, entries });
  });
});

app.listen(PORT, () => {
  console.log(`Rewards Service running on http://127.0.0.1:${PORT}`);
});
