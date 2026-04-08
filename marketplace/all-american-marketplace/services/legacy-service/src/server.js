require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const { makeApp, readJson, writeJson, nextId, authMiddleware, requireRole, recordAudit } = require("@aam/shared");

const PORT = process.env.LEGACY_SERVICE_PORT || 5800;

const app = makeApp("legacy-service", PORT, (app) => {
  app.get("/heirs", (_req, res) => {
    const heirs = readJson("heirs.json", []);
    res.json({ ok: true, heirs });
  });

  app.post("/heirs", authMiddleware, requireRole("admin"), (req, res) => {
    const {
      name,
      title = "heir",
      branch = "main",
      notes = "",
      linkedUserId = null,
      project = "",
      generation = ""
    } = req.body;

    if (!name) return res.status(400).json({ ok: false, error: "name required" });

    const heirs = readJson("heirs.json", []);
    const heir = {
      id: nextId(heirs),
      name,
      title,
      branch,
      notes,
      linkedUserId,
      project,
      generation,
      createdAt: new Date().toISOString()
    };
    heirs.push(heir);
    writeJson("heirs.json", heirs);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "heir_created",
      entityType: "heir",
      entityId: heir.id,
      payload: heir
    });

    res.status(201).json({ ok: true, heir });
  });

  app.get("/branches", (_req, res) => {
    const branches = readJson("family_branches.json", []);
    res.json({ ok: true, branches });
  });

  app.post("/branches", authMiddleware, requireRole("admin"), (req, res) => {
    const { name, description = "", leadHeirId = null } = req.body;
    if (!name) return res.status(400).json({ ok: false, error: "name required" });

    const branches = readJson("family_branches.json", []);
    const branch = {
      id: nextId(branches),
      name,
      description,
      leadHeirId,
      createdAt: new Date().toISOString()
    };
    branches.push(branch);
    writeJson("family_branches.json", branches);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "branch_created",
      entityType: "branch",
      entityId: branch.id,
      payload: branch
    });

    res.status(201).json({ ok: true, branch });
  });

  app.get("/mentors", (_req, res) => {
    const mentors = readJson("mentors.json", []);
    res.json({ ok: true, mentors });
  });

  app.post("/mentors", authMiddleware, requireRole("admin"), (req, res) => {
    const { heirId, mentorName, role = "", notes = "" } = req.body;
    if (!heirId || !mentorName) {
      return res.status(400).json({ ok: false, error: "heirId, mentorName required" });
    }

    const mentors = readJson("mentors.json", []);
    const mentor = {
      id: nextId(mentors),
      heirId: Number(heirId),
      mentorName,
      role,
      notes,
      createdAt: new Date().toISOString()
    };
    mentors.push(mentor);
    writeJson("mentors.json", mentors);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "mentor_assigned",
      entityType: "mentor",
      entityId: mentor.id,
      payload: mentor
    });

    res.status(201).json({ ok: true, mentor });
  });
});

app.listen(PORT, () => {
  console.log(`Legacy Service running on http://127.0.0.1:${PORT}`);
});
