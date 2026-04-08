require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const axios = require("axios");

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 4000;

const services = {
  auth: `http://127.0.0.1:${process.env.AUTH_SERVICE_PORT || 4100}`,
  booking: `http://127.0.0.1:${process.env.BOOKING_SERVICE_PORT || 4200}`,
  payment: `http://127.0.0.1:${process.env.PAYMENT_SERVICE_PORT || 4300}`,
  dispatch: `http://127.0.0.1:${process.env.DISPATCH_SERVICE_PORT || 4400}`,
  rewards: `http://127.0.0.1:${process.env.REWARDS_SERVICE_PORT || 4500}`,
  marketplace: `http://127.0.0.1:${process.env.MARKETPLACE_SERVICE_PORT || 4600}`,
  driver: `http://127.0.0.1:${process.env.DRIVER_SERVICE_PORT || 4700}`,
  admin: `http://127.0.0.1:${process.env.ADMIN_SERVICE_PORT || 4800}`,
  frontend: `http://127.0.0.1:${process.env.FRONTEND_SERVICE_PORT || 4900}`,
  storehouse: `http://127.0.0.1:${process.env.STOREHOUSE_SERVICE_PORT || 5000}`,
  finbank: `http://127.0.0.1:${process.env.FINBANK_SERVICE_PORT || 5100}`,
  crossborder: `http://127.0.0.1:${process.env.CROSSBORDER_SERVICE_PORT || 5200}`,
  university: `http://127.0.0.1:${process.env.UNIVERSITY_SERVICE_PORT || 5300}`,
  creator: `http://127.0.0.1:${process.env.CREATOR_SERVICE_PORT || 5400}`,
  staffing: `http://127.0.0.1:${process.env.STAFFING_SERVICE_PORT || 5500}`,
  logistics: `http://127.0.0.1:${process.env.LOGISTICS_SERVICE_PORT || 5600}`
};

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "api-gateway",
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    name: "All American Marketplace Gateway",
    services
  });
});

app.get("/features", (_req, res) => {
  res.json({
    marketplace: true,
    rideshare: true,
    delivery: true,
    freight: true,
    rewards: true,
    auth: true,
    booking: true,
    payments: true,
    dispatch: true,
    driverOnboarding: true,
    adminAnalytics: true,
    frontend: true,
    storehouse: true,
    grocery: true,
    bookstore: true,
    finbank: true,
    crossborder: true,
    university: true,
    creatorStreaming: true,
    staffing: true,
    logisticsLoads: true
  });
});

app.get("/system/health", async (_req, res) => {
  const checks = {};
  for (const [name, url] of Object.entries(services)) {
    try {
      const r = await axios.get(`${url}/health`, { timeout: 3000 });
      checks[name] = r.data;
    } catch (err) {
      checks[name] = { ok: false, error: err.message };
    }
  }
  res.json({ ok: true, checks });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on http://127.0.0.1:${PORT}`);
});
