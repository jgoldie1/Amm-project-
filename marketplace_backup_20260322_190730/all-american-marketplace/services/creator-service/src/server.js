require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const { makeApp, readJson, writeJson, nextId, authMiddleware, recordAudit } = require("@aam/shared");

const PORT = process.env.CREATOR_SERVICE_PORT || 5400;

const app = makeApp("creator-service", PORT, (app) => {
  app.post("/creators/profile", authMiddleware, (req, res) => {
    const { stageName, genre = "", bio = "", project = "isaiah" } = req.body;

    const creators = readJson("creators.json", []);
    let creator = creators.find(c => Number(c.userId) === Number(req.user.sub));

    if (!creator) {
      creator = {
        id: nextId(creators),
        userId: Number(req.user.sub),
        stageName: stageName || req.user.name,
        genre,
        bio,
        project,
        createdAt: new Date().toISOString()
      };
      creators.push(creator);
    } else {
      creator.stageName = stageName || creator.stageName;
      creator.genre = genre;
      creator.bio = bio;
      creator.project = project;
      creator.updatedAt = new Date().toISOString();
    }

    writeJson("creators.json", creators);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "creator_profile_saved",
      entityType: "creator",
      entityId: creator.id,
      payload: creator
    });

    res.json({ ok: true, creator });
  });

  app.post("/media", authMiddleware, (req, res) => {
    const { title, mediaType = "music", genre = "", description = "", monetizationType = "subscription" } = req.body;
    if (!title) return res.status(400).json({ ok: false, error: "title required" });

    const items = readJson("media_items.json", []);
    const item = {
      id: nextId(items),
      userId: Number(req.user.sub),
      title,
      mediaType,
      genre,
      description,
      monetizationType,
      createdAt: new Date().toISOString()
    };
    items.push(item);
    writeJson("media_items.json", items);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "media_item_created",
      entityType: "media",
      entityId: item.id,
      payload: item
    });

    res.status(201).json({ ok: true, item });
  });

  app.get("/media", (_req, res) => {
    res.json({ ok: true, items: readJson("media_items.json", []) });
  });
});

app.listen(PORT, () => {
  console.log(`Creator Service running on http://127.0.0.1:${PORT}`);
});
