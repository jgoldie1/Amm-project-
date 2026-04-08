#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MEDICAL GRADE SECURITY LAYER START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports

########################################
# BACKUP
########################################
cp apps/dashboard.js "backups/dashboard_security_layer_${STAMP}.js"
cp db/aam.db "backups/aam_security_layer_${STAMP}.db"

########################################
# DATABASE SECURITY TABLES
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS request_fingerprints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  fingerprint_hash TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS anomaly_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT,
  risk_level TEXT,
  subject_id INTEGER,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS payout_authorization_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER,
  payout_id INTEGER,
  approval_status TEXT,
  approved_by TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS ip_activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_address TEXT,
  action_type TEXT,
  username TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()
conn.close()
print("[OK] advanced security tables ready")
PYEOF

########################################
# DASHBOARD SECURITY PATCH
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function getRequestMeta(req) {
  return {
    ip: String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'local'),
    ua: String(req.headers['user-agent'] || 'unknown')
  };
}

function fingerprintRequest(meta) {
  const base = meta.ip + "|" + meta.ua;
  return sha256Hex(base);
}

function logRequestFingerprint(sessionId, meta) {
  const hash = fingerprintRequest(meta);
  dbRun(`INSERT INTO request_fingerprints (session_id, ip_address, user_agent, fingerprint_hash)
         VALUES (${Number(sessionId||0)}, '${q(meta.ip)}', '${q(meta.ua)}', '${q(hash)}')`);
}

function detectAnomaly(meta, username) {
  const rows = dbQuery(`
    SELECT count(*) as c
    FROM ip_activity_log
    WHERE ip_address='${q(meta.ip)}'
      AND created_at >= datetime('now','-5 minutes')
  `);
  const count = rows.length ? Number(rows[0].c||0) : 0;

  if (count > 20) {
    dbRun(`INSERT INTO anomaly_events (event_type, risk_level, subject_id, notes)
           VALUES ('high_frequency', 'high', 0, 'IP flood detected')`);
    return true;
  }
  return false;
}

function logIPActivity(meta, action, username='') {
  dbRun(`INSERT INTO ip_activity_log (ip_address, action_type, username)
         VALUES ('${q(meta.ip)}', '${q(action)}', '${q(username)}')`);
}
"""

marker = "const server = http.createServer(async (req, res) => {"
if "function getRequestMeta" not in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

p.write_text(text)
print("[OK] dashboard advanced security patch applied")
PYEOF

########################################
# RESTART + VERIFY
########################################
bash scripts/check_js.sh
bash scripts/status.sh || true

echo "=== MEDICAL GRADE SECURITY LAYER COMPLETE: $STAMP ==="
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/security-audit (future)"
