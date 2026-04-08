require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const PORT = process.env.FRONTEND_SERVICE_PORT || 4900;
const publicDir = path.resolve(__dirname, "../public");

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan("dev"));
app.use(express.static(publicDir));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "frontend-service",
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Frontend Service running on http://127.0.0.1:${PORT}`);
});
