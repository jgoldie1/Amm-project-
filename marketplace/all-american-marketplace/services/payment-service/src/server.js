require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const { makeApp, readJson, writeJson, nextId, authMiddleware, requireRole, sqlite, recordAudit } = require("@aam/shared");

const PORT = process.env.PAYMENT_SERVICE_PORT || 4300;

const app = makeApp("payment-service", PORT, (app) => {
  app.post("/payments", authMiddleware, (req, res) => {
    const { bookingId, amount, method = "card", currency = "USD" } = req.body;
    if (!bookingId || !amount) {
      return res.status(400).json({ ok: false, error: "bookingId, amount required" });
    }

    const payments = readJson("payments.json", []);
    const existing = payments.find(p => Number(p.bookingId) === Number(bookingId) && p.status === "paid");
    if (existing) {
      return res.status(409).json({ ok: false, error: "payment already exists for booking", payment: existing });
    }

    const payment = {
      id: nextId(payments),
      userId: Number(req.user.sub),
      bookingId: Number(bookingId),
      amount: Number(amount),
      method,
      currency,
      status: "paid",
      createdAt: new Date().toISOString()
    };
    payments.push(payment);
    writeJson("payments.json", payments);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "payment_created",
      entityType: "payment",
      entityId: payment.id,
      payload: payment
    });

    res.status(201).json({ ok: true, payment });
  });

  app.get("/payments", (_req, res) => {
    const payments = readJson("payments.json", []);
    res.json({ ok: true, payments });
  });

  app.post("/payouts", authMiddleware, requireRole("admin"), (req, res) => {
    const { driverId, amount, note = "", bookingId = null } = req.body;
    if (!driverId || !amount) {
      return res.status(400).json({ ok: false, error: "driverId, amount required" });
    }

    const payouts = readJson("payouts.json", []);
    if (bookingId) {
      const exists = payouts.find(p => Number(p.bookingId) === Number(bookingId));
      if (exists) {
        return res.status(409).json({ ok: false, error: "payout already exists for booking", payout: exists });
      }
    }

    const payout = {
      id: nextId(payouts),
      driverId: Number(driverId),
      bookingId: bookingId ? Number(bookingId) : null,
      amount: Number(amount),
      note,
      createdBy: Number(req.user.sub),
      createdAt: new Date().toISOString()
    };
    payouts.push(payout);
    writeJson("payouts.json", payouts);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "manual_payout_created",
      entityType: "payout",
      entityId: payout.id,
      payload: payout
    });

    res.status(201).json({ ok: true, payout });
  });

  app.get("/payouts", authMiddleware, requireRole("admin"), (_req, res) => {
    const payouts = readJson("payouts.json", []);
    res.json({ ok: true, payouts });
  });

  app.get("/audit-events", authMiddleware, requireRole("admin"), (_req, res) => {
    const db = sqlite();
    const events = db.prepare("SELECT * FROM audit_events ORDER BY id DESC LIMIT 200").all();
    res.json({ ok: true, events });
  });
});

app.listen(PORT, () => {
  console.log(`Payment Service running on http://127.0.0.1:${PORT}`);
});
