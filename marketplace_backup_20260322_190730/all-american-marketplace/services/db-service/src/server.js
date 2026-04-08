require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const path = require("path");
const Database = require("better-sqlite3");
const { makeApp } = require("@aam/shared");

const PORT = process.env.DB_SERVICE_PORT || 4950;
const dbPath = path.resolve(__dirname, "../../../data/aam.sqlite");
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS audit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_user_id INTEGER,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  payload_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS seller_approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id INTEGER NOT NULL,
  admin_user_id INTEGER NOT NULL,
  approved_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payout_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL UNIQUE,
  driver_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  created_at TEXT NOT NULL
);
`);

const app = makeApp("db-service", PORT, (app) => {
  app.get("/db/health", (_req, res) => {
    const row = db.prepare("SELECT datetime('now') AS now").get();
    res.json({ ok: true, service: "db-service", dbPath, now: row.now });
  });

  app.get("/audit-events", (_req, res) => {
    const rows = db.prepare("SELECT * FROM audit_events ORDER BY id DESC LIMIT 200").all();
    res.json({ ok: true, events: rows });
  });
});

app.listen(PORT, () => {
  console.log(`DB Service running on http://127.0.0.1:${PORT}`);
});
