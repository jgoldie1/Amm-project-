require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const { makeApp, readJson, writeJson, authMiddleware, requireRole, sqlite, recordAudit } = require("@aam/shared");

const PORT = process.env.DISPATCH_SERVICE_PORT || 4400;

function chooseDriver(drivers, booking) {
  const available = drivers.filter((d) => d.status === "available");
  if (booking.serviceLevel === "premium") {
    return available.find((d) => d.vehicleType === "premium") || available[0];
  }
  return available[0];
}

const app = makeApp("dispatch-service", PORT, (app) => {
  app.post("/assign/:bookingId", authMiddleware, requireRole("admin"), (req, res) => {
    const bookingId = Number(req.params.bookingId);
    const bookings = readJson("bookings.json", []);
    const drivers = readJson("drivers.json", []);
    const booking = bookings.find((b) => b.id === bookingId);

    if (!booking) return res.status(404).json({ ok: false, error: "booking not found" });
    if (booking.status !== "pending") return res.status(409).json({ ok: false, error: "booking is not pending" });

    const chosen = chooseDriver(drivers, booking);
    if (!chosen) return res.status(409).json({ ok: false, error: "no available drivers" });

    booking.assignedDriverId = chosen.id;
    booking.status = "assigned";
    booking.updatedAt = new Date().toISOString();

    chosen.status = "busy";
    chosen.lastAssignedBookingId = booking.id;

    writeJson("bookings.json", bookings);
    writeJson("drivers.json", drivers);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "booking_assigned",
      entityType: "booking",
      entityId: booking.id,
      payload: { bookingId: booking.id, driverId: chosen.id }
    });

    res.json({ ok: true, booking, driver: chosen });
  });

  app.post("/booking/:id/advance", authMiddleware, requireRole("admin", "driver"), (req, res) => {
    const bookingId = Number(req.params.id);
    const { nextStatus } = req.body;

    const transitions = {
      assigned: ["en_route", "cancelled"],
      en_route: ["in_progress", "cancelled"],
      in_progress: ["completed", "cancelled"]
    };

    const bookings = readJson("bookings.json", []);
    const drivers = readJson("drivers.json", []);
    const payouts = readJson("payouts.json", []);
    const booking = bookings.find((b) => b.id === bookingId);

    if (!booking) return res.status(404).json({ ok: false, error: "booking not found" });

    const allowed = transitions[booking.status] || [];
    if (!allowed.includes(nextStatus)) {
      return res.status(400).json({ ok: false, error: `cannot move from ${booking.status} to ${nextStatus}` });
    }

    booking.status = nextStatus;
    booking.updatedAt = new Date().toISOString();

    if (nextStatus === "completed" && booking.assignedDriverId) {
      const driver = drivers.find((d) => d.id === booking.assignedDriverId);
      if (driver) {
        driver.status = "available";

        const existingPayout = payouts.find(p => Number(p.bookingId) === Number(booking.id));
        if (!existingPayout) {
          const driverPayout = Number((Number(booking.estimatedFare || 0) * 0.8).toFixed(2));
          const payout = {
            id: payouts.length ? Math.max(...payouts.map(p => p.id || 0)) + 1 : 1,
            driverId: driver.id,
            bookingId: booking.id,
            amount: driverPayout,
            note: "auto payout on completed booking",
            createdBy: 0,
            createdAt: new Date().toISOString()
          };
          payouts.push(payout);
          writeJson("payouts.json", payouts);

          const db = sqlite();
          db.prepare(`
            INSERT OR IGNORE INTO payout_events (booking_id, driver_id, amount, created_at)
            VALUES (?, ?, ?, ?)
          `).run(booking.id, driver.id, driverPayout, new Date().toISOString());

          recordAudit({
            actorUserId: Number(req.user.sub),
            actorRole: req.user.role,
            action: "auto_payout_created",
            entityType: "payout",
            entityId: payout.id,
            payload: payout
          });
        }
      }
    }

    if (nextStatus === "cancelled" && booking.assignedDriverId) {
      const driver = drivers.find((d) => d.id === booking.assignedDriverId);
      if (driver) driver.status = "available";
    }

    writeJson("bookings.json", bookings);
    writeJson("drivers.json", drivers);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "booking_status_advanced",
      entityType: "booking",
      entityId: booking.id,
      payload: { bookingId: booking.id, nextStatus }
    });

    res.json({ ok: true, booking });
  });

  app.get("/drivers", (_req, res) => {
    const drivers = readJson("drivers.json", []);
    res.json({ ok: true, drivers });
  });
});

app.listen(PORT, () => {
  console.log(`Dispatch Service running on http://127.0.0.1:${PORT}`);
});
