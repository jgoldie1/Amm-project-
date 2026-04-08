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
    const driverApplications = readJson("driver_applications.json", []);
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
        driverApplications: driverApplications.length,
        payouts: payouts.length,
        grossRevenue,
        payoutTotal,
        netPlatformFlow: Number((grossRevenue - payoutTotal).toFixed(2))
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`Admin Service running on http://127.0.0.1:${PORT}`);
});
