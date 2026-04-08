require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const { makeApp, readJson, writeJson, nextId, authMiddleware } = require("@aam/shared");

const PORT = process.env.BOOKING_SERVICE_PORT || 4200;

function estimateFare(type, serviceLevel, distanceKm = 5) {
  const baseMap = {
    ride: 10,
    food: 7,
    grocery: 9,
    courier: 11,
    medical: 13,
    freight: 45
  };
  const multiplierMap = {
    standard: 1,
    premium: 2.25,
    shared: 0.72,
    express: 1.8
  };
  const base = baseMap[type] || 10;
  const mult = multiplierMap[serviceLevel] || 1;
  return Number((base * mult + distanceKm * 2.5).toFixed(2));
}

const app = makeApp("booking-service", PORT, (app) => {
  app.post("/bookings", authMiddleware, (req, res) => {
    const {
      type = "ride",
      serviceLevel = "standard",
      pickup,
      dropoff,
      distanceKm = 5,
      notes = "",
      items = []
    } = req.body;

    if (!pickup || !dropoff) {
      return res.status(400).json({ ok: false, error: "pickup, dropoff required" });
    }

    const allowedTypes = ["ride", "food", "grocery", "courier", "medical", "freight"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ ok: false, error: "invalid booking type" });
    }

    const bookings = readJson("bookings.json", []);
    const booking = {
      id: nextId(bookings),
      userId: Number(req.user.sub),
      type,
      serviceLevel,
      pickup,
      dropoff,
      distanceKm: Number(distanceKm),
      notes,
      items,
      estimatedFare: estimateFare(type, serviceLevel, Number(distanceKm)),
      status: "pending",
      assignedDriverId: null,
      createdAt: new Date().toISOString()
    };

    bookings.push(booking);
    writeJson("bookings.json", bookings);
    res.status(201).json({ ok: true, booking });
  });

  app.get("/bookings", (_req, res) => {
    const bookings = readJson("bookings.json", []);
    res.json({ ok: true, bookings });
  });

  app.get("/bookings/my", authMiddleware, (req, res) => {
    const bookings = readJson("bookings.json", []);
    const mine = bookings.filter((b) => Number(b.userId) === Number(req.user.sub));
    res.json({ ok: true, bookings: mine });
  });

  app.get("/bookings/:id", (req, res) => {
    const bookings = readJson("bookings.json", []);
    const booking = bookings.find((b) => b.id === Number(req.params.id));
    if (!booking) {
      return res.status(404).json({ ok: false, error: "booking not found" });
    }
    res.json({ ok: true, booking });
  });

  app.patch("/bookings/:id/status", (req, res) => {
    const { status } = req.body;
    const bookings = readJson("bookings.json", []);
    const booking = bookings.find((b) => b.id === Number(req.params.id));
    if (!booking) {
      return res.status(404).json({ ok: false, error: "booking not found" });
    }
    booking.status = status || booking.status;
    booking.updatedAt = new Date().toISOString();
    writeJson("bookings.json", bookings);
    res.json({ ok: true, booking });
  });
});

app.listen(PORT, () => {
  console.log(`Booking Service running on http://127.0.0.1:${PORT}`);
});
