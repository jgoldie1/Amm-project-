require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const { makeApp, readJson, writeJson, nextId, authMiddleware, requireRole, recordAudit } = require("@aam/shared");

const PORT = process.env.UNIVERSITY_SERVICE_PORT || 5300;

const app = makeApp("university-service", PORT, (app) => {
  app.get("/courses", (_req, res) => {
    res.json({ ok: true, courses: readJson("courses.json", []) });
  });

  app.post("/courses", authMiddleware, requireRole("admin"), (req, res) => {
    const { title, category = "general", instructor = "", price = 0, description = "" } = req.body;
    if (!title) return res.status(400).json({ ok: false, error: "title required" });

    const courses = readJson("courses.json", []);
    const course = {
      id: nextId(courses),
      title,
      category,
      instructor,
      price: Number(price),
      description,
      createdAt: new Date().toISOString()
    };
    courses.push(course);
    writeJson("courses.json", courses);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "course_created",
      entityType: "course",
      entityId: course.id,
      payload: course
    });

    res.status(201).json({ ok: true, course });
  });

  app.post("/enrollments", authMiddleware, (req, res) => {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ ok: false, error: "courseId required" });

    const enrollments = readJson("enrollments.json", []);
    const existing = enrollments.find(e => Number(e.userId) === Number(req.user.sub) && Number(e.courseId) === Number(courseId));
    if (existing) return res.status(409).json({ ok: false, error: "already enrolled" });

    const enrollment = {
      id: nextId(enrollments),
      userId: Number(req.user.sub),
      courseId: Number(courseId),
      status: "active",
      createdAt: new Date().toISOString()
    };
    enrollments.push(enrollment);
    writeJson("enrollments.json", enrollments);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "course_enrolled",
      entityType: "enrollment",
      entityId: enrollment.id,
      payload: enrollment
    });

    res.status(201).json({ ok: true, enrollment });
  });

  app.post("/certificates", authMiddleware, requireRole("admin"), (req, res) => {
    const { userId, courseId, title = "Certificate of Completion" } = req.body;
    if (!userId || !courseId) return res.status(400).json({ ok: false, error: "userId, courseId required" });

    const certificates = readJson("certificates.json", []);
    const cert = {
      id: nextId(certificates),
      userId: Number(userId),
      courseId: Number(courseId),
      title,
      issuedAt: new Date().toISOString()
    };
    certificates.push(cert);
    writeJson("certificates.json", certificates);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "certificate_issued",
      entityType: "certificate",
      entityId: cert.id,
      payload: cert
    });

    res.status(201).json({ ok: true, certificate: cert });
  });
});

app.listen(PORT, () => {
  console.log(`University Service running on http://127.0.0.1:${PORT}`);
});
