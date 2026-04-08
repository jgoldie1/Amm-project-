require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const { makeApp, readJson, authMiddleware, requireRole } = require("@aam/shared");

const PORT = process.env.ADMIN_SERVICE_PORT || 4800;

const app = makeApp("admin-service", PORT, (app) => {
  app.get("/analytics", authMiddleware, requireRole("admin"), (_req, res) => {
    const users = readJson("users.json", []);
    const bookings = readJson("bookings.json", []);
    const payments = readJson("payments.json", []);
    const rewards = readJson("rewards.json", []);
    const products = readJson("products.json", []);
    const sellers = readJson("sellers.json", []);
    const drivers = readJson("drivers.json", []);
    const apps = readJson("driver_applications.json", []);
    const payouts = readJson("payouts.json", []);

    const grossRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const payoutTotal = payouts.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    res.json({
      ok: true,
      totals: {
        users: users.length,
        bookings: bookings.length,
        payments: payments.length,
        rewards: rewards.length,
        products: products.length,
        sellers: sellers.length,
        drivers: drivers.length,
        driverApplications: apps.length,
        payouts: payouts.length,
        grossRevenue,
        payoutTotal,
        netPlatformFlow: Number((grossRevenue - payoutTotal).toFixed(2))
      },
      bookingBreakdown: {
        ride: bookings.filter(b => b.type === "ride").length,
        food: bookings.filter(b => b.type === "food").length,
        grocery: bookings.filter(b => b.type === "grocery").length,
        courier: bookings.filter(b => b.type === "courier").length,
        medical: bookings.filter(b => b.type === "medical").length,
        freight: bookings.filter(b => b.type === "freight").length
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`Admin Service running on http://127.0.0.1:${PORT}`);
});
EOFcat > scripts/stop_all.sh <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."

if [ -d .pids ]; then
  for pidfile in .pids/*.pid; do
    [ -e "$pidfile" ] || continue
    pid=$(cat "$pidfile")
    kill "$pid" 2>/dev/null || true
    rm -f "$pidfile"
  done
fi

pkill -f "services/api-gateway/src/server.js" 2>/dev/null || true
pkill -f "services/auth-service/src/server.js" 2>/dev/null || true
pkill -f "services/booking-service/src/server.js" 2>/dev/null || true
pkill -f "services/payment-service/src/server.js" 2>/dev/null || true
pkill -f "services/dispatch-service/src/server.js" 2>/dev/null || true
pkill -f "services/rewards-service/src/server.js" 2>/dev/null || true
pkill -f "services/marketplace-service/src/server.js" 2>/dev/null || true
pkill -f "services/driver-service/src/server.js" 2>/dev/null || true
pkill -f "services/admin-service/src/server.js" 2>/dev/null || true

echo "All services stopped."
