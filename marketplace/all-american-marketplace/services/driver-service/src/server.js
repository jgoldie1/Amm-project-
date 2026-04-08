require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const { makeApp, readJson, writeJson, nextId, authMiddleware, requireRole } = require("@aam/shared");

const PORT = process.env.DRIVER_SERVICE_PORT || 4700;

const app = makeApp("driver-service", PORT, (app) => {
  app.post("/drivers/apply", authMiddleware, (req, res) => {
    const { vehicleType = "standard", carModel = "", licenseNumber = "", notes = "" } = req.body;
    const applications = readJson("driver_applications.json", []);

    const alreadyPending = applications.find(
      a => Number(a.userId) === Number(req.user.sub) && a.status === "pending"
    );
    if (alreadyPending) {
      return res.status(409).json({ ok: false, error: "pending application already exists" });
    }

    const entry = {
      id: nextId(applications),
      userId: Number(req.user.sub),
      name: req.user.name,
      email: req.user.email,
      vehicleType,
      carModel,
      licenseNumber,
      notes,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    applications.push(entry);
    writeJson("driver_applications.json", applications);
    res.status(201).json({ ok: true, application: entry });
  });

  app.get("/drivers/applications", authMiddleware, requireRole("admin"), (_req, res) => {
    const applications = readJson("driver_applications.json", []);
    res.json({ ok: true, applications });
  });

  app.post("/drivers/applications/:id/approve", authMiddleware, requireRole("admin"), (req, res) => {
    const applications = readJson("driver_applications.json", []);
    const drivers = readJson("drivers.json", []);
    const appRow = applications.find((a) => a.id === Number(req.params.id));

    if (!appRow) return res.status(404).json({ ok: false, error: "application not found" });
    if (appRow.status === "approved") {
      return res.status(409).json({ ok: false, error: "application already approved" });
    }

    const existingDriver = drivers.find(d => Number(d.userId) === Number(appRow.userId));
    if (existingDriver) {
      appRow.status = "approved";
      appRow.approvedAt = appRow.approvedAt || new Date().toISOString();
      writeJson("driver_applications.json", applications);
      return res.json({ ok: true, application: appRow, driver: existingDriver, reused: true });
    }

    appRow.status = "approved";
    appRow.approvedAt = new Date().toISOString();

    const driver = {
      id: nextId(drivers),
      userId: appRow.userId,
      name: appRow.name,
      email: appRow.email,
      vehicleType: appRow.vehicleType,
      carModel: appRow.carModel,
      licenseNumber: appRow.licenseNumber,
      premiumEligible: appRow.vehicleType === "premium",
      status: "available",
      rating: 5.0
    };

    drivers.push(driver);
    writeJson("driver_applications.json", applications);
    writeJson("drivers.json", drivers);

    res.json({ ok: true, application: appRow, driver });
  });

  app.get("/drivers", (_req, res) => {
    const drivers = readJson("drivers.json", []);
    res.json({ ok: true, drivers });
  });
});

app.listen(PORT, () => {
  console.log(`Driver Service running on http://127.0.0.1:${PORT}`);
});
