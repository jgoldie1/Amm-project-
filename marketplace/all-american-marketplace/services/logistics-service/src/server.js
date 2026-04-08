require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const { makeApp, readJson, writeJson, nextId, authMiddleware, requireRole, recordAudit } = require("@aam/shared");

const PORT = process.env.LOGISTICS_SERVICE_PORT || 5600;

const app = makeApp("logistics-service", PORT, (app) => {
  app.get("/loads", (_req, res) => {
    const loads = readJson("loads.json", []);
    res.json({ ok: true, loads });
  });

  app.post("/loads", authMiddleware, requireRole("admin"), (req, res) => {
    const {
      origin,
      destination,
      cargoType = "general",
      rate = 0,
      equipmentNeeded = "",
      notes = ""
    } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ ok: false, error: "origin, destination required" });
    }

    const loads = readJson("loads.json", []);
    const load = {
      id: nextId(loads),
      origin,
      destination,
      cargoType,
      rate: Number(rate),
      equipmentNeeded,
      notes,
      status: "open",
      createdAt: new Date().toISOString()
    };

    loads.push(load);
    writeJson("loads.json", loads);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "load_created",
      entityType: "load",
      entityId: load.id,
      payload: load
    });

    res.status(201).json({ ok: true, load });
  });

  app.post("/carriers", authMiddleware, (req, res) => {
    const { companyName, mcNumber = "", equipmentType = "", notes = "" } = req.body;
    if (!companyName) return res.status(400).json({ ok: false, error: "companyName required" });

    const carriers = readJson("carriers.json", []);
    const carrier = {
      id: nextId(carriers),
      userId: Number(req.user.sub),
      companyName,
      mcNumber,
      equipmentType,
      notes,
      createdAt: new Date().toISOString()
    };

    carriers.push(carrier);
    writeJson("carriers.json", carriers);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "carrier_registered",
      entityType: "carrier",
      entityId: carrier.id,
      payload: carrier
    });

    res.status(201).json({ ok: true, carrier });
  });
});

app.listen(PORT, () => {
  console.log(`Logistics Service running on http://127.0.0.1:${PORT}`);
});
