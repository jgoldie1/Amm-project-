#!/data/data/com.termux/files/usr/bin/bash
set -e

PROJECT_ROOT="$HOME/marketplace/all-american-marketplace"

echo "Creating project at: $PROJECT_ROOT"
mkdir -p "$PROJECT_ROOT"
cd "$PROJECT_ROOT"

mkdir -p services/api-gateway/src
mkdir -p scripts

cat > .env <<'ENVEOF'
NODE_ENV=development
PORT=4000
JWT_SECRET=change_me_now
ENVEOF

cat > services/api-gateway/package.json <<'PKGEOF'
{
  "name": "api-gateway",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "dev": "node src/server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0"
  }
}
PKGEOF

cat > services/api-gateway/src/server.js <<'JSEOF'
require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "api-gateway",
    timestamp: new Date().toISOString()
  });
});

app.get("/features", (_req, res) => {
  res.json({
    marketplace: true,
    rideshare: true,
    delivery: true,
    freight: true,
    drones: true,
    rewards: true
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
});
JSEOF

cat > scripts/start_gateway.sh <<'SHEOF'
#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/../services/api-gateway"
npm install
npm run dev
SHEOF

chmod +x scripts/start_gateway.sh

echo "Build complete."
echo "Run:"
echo "cd $PROJECT_ROOT"
echo "bash scripts/start_gateway.sh"
