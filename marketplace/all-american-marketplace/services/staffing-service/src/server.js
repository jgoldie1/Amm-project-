require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const { makeApp, readJson, writeJson, nextId, authMiddleware, requireRole, recordAudit } = require("@aam/shared");

const PORT = process.env.STAFFING_SERVICE_PORT || 5500;

const app = makeApp("staffing-service", PORT, (app) => {
  app.get("/jobs", (_req, res) => {
    const jobs = readJson("jobs.json", []);
    res.json({ ok: true, jobs });
  });

  app.post("/jobs", authMiddleware, requireRole("admin"), (req, res) => {
    const {
      title,
      department = "general",
      company = "March and Lewis Staffing",
      description = "",
      location = "",
      payRange = ""
    } = req.body;

    if (!title) return res.status(400).json({ ok: false, error: "title required" });

    const jobs = readJson("jobs.json", []);
    const job = {
      id: nextId(jobs),
      title,
      department,
      company,
      description,
      location,
      payRange,
      status: "open",
      createdAt: new Date().toISOString()
    };

    jobs.push(job);
    writeJson("jobs.json", jobs);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "job_created",
      entityType: "job",
      entityId: job.id,
      payload: job
    });

    res.status(201).json({ ok: true, job });
  });

  app.post("/candidates", authMiddleware, (req, res) => {
    const { jobId, resumeText = "", notes = "" } = req.body;
    if (!jobId) return res.status(400).json({ ok: false, error: "jobId required" });

    const candidates = readJson("candidates.json", []);
    const existing = candidates.find(c => Number(c.userId) === Number(req.user.sub) && Number(c.jobId) === Number(jobId));
    if (existing) return res.status(409).json({ ok: false, error: "already applied" });

    const candidate = {
      id: nextId(candidates),
      userId: Number(req.user.sub),
      jobId: Number(jobId),
      resumeText,
      notes,
      status: "applied",
      createdAt: new Date().toISOString()
    };

    candidates.push(candidate);
    writeJson("candidates.json", candidates);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "candidate_applied",
      entityType: "candidate",
      entityId: candidate.id,
      payload: candidate
    });

    res.status(201).json({ ok: true, candidate });
  });
});

app.listen(PORT, () => {
  console.log(`Staffing Service running on http://127.0.0.1:${PORT}`);
});
