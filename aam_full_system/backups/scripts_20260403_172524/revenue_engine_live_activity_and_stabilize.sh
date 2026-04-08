#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== REVENUE ENGINE + LIVE ACTIVITY + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUP
########################################
cp db/aam.db "backups/aam_revenue_engine_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_revenue_engine_${STAMP}.js"

########################################
# 2) DATABASE: REVENUE + ACTIVITY
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path
import random

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS revenue_event_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT,
  actor_name TEXT,
  item_name TEXT,
  amount_cents INTEGER,
  event_status TEXT DEFAULT 'completed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS live_activity_feed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activity_text TEXT,
  activity_type TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# simulate activity if empty
if cur.execute("SELECT count(*) FROM live_activity_feed").fetchone()[0] == 0:
    activities = [
        "Jacobie just bought a flying car",
        "Aniyah listed a premium penthouse kit",
        "Isaiah sold a hyper car",
        "New player joined the Explorer World",
        "Premium world unlocked in Japan",
    ]
    for a in activities:
        cur.execute("INSERT INTO live_activity_feed (activity_text, activity_type) VALUES (?, 'system')", (a,))

conn.commit()
conn.close()
print("[OK] revenue + activity tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD (LIVE FEED)
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderRevenueEnginePage(req, user = null) {
  const activity = dbQuery(`
    SELECT activity_text, created_at
    FROM live_activity_feed
    ORDER BY id DESC
    LIMIT 50
  `);

  const rows = activity.map(r =>
    `<tr><td>${r.activity_text}</td><td>${r.created_at || ''}</td></tr>`
  ).join('');

  return htmlPage('Revenue Engine', `
    <main class="portal-main">
      <h1>Live Revenue Engine</h1>
      <p>Real-time activity + monetization simulation layer</p>

      <table>
        <tr><th>Activity</th><th>Time</th></tr>
        ${rows || '<tr><td colspan="2">No activity yet</td></tr>'}
      </table>
    </main>
  `, user);
}
"""

if "renderRevenueEnginePage" not in text:
    text = text.replace("const server = http.createServer", helper + "\nconst server = http.createServer")

route = """
    if (req.method === 'GET' && pathname === '/revenue-engine') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderRevenueEnginePage(req, session));
    }
"""

if "/revenue-engine" not in text:
    anchor = "pathname === '/world-selector'"
    text = text.replace(anchor, "pathname === '/revenue-engine' || " + anchor)

p.write_text(text)
print("[OK] revenue engine route ready")
PYEOF

########################################
# 4) AUTO ACTIVITY LOOP (SIMULATE USERS)
########################################
python3 << 'PYEOF'
import sqlite3, random
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

players = ["Jacobie","Aniyah","Isaiah","Guest Explorer"]
actions = [
    "bought a vehicle",
    "sold an item",
    "listed a new asset",
    "entered a premium world",
]

for _ in range(10):
    text = f"{random.choice(players)} {random.choice(actions)}"
    cur.execute("INSERT INTO live_activity_feed (activity_text, activity_type) VALUES (?, 'auto')", (text,))

conn.commit()
conn.close()
print("[OK] activity simulation added")
PYEOF

########################################
# 5) RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

########################################
# 6) HEALTH
########################################
curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true

########################################
# 7) REPORT
########################################
cat > "reports/revenue_engine_live_activity_${STAMP}.txt" <<REPORT
REVENUE ENGINE + LIVE ACTIVITY REPORT
Timestamp: ${STAMP}

Added:
- revenue_event_log
- live_activity_feed
- revenue-engine route

Purpose:
- simulate live users
- create visible system activity
- prepare real monetization loop
REPORT

echo "REVENUE ENGINE + LIVE ACTIVITY COMPLETE: $STAMP"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/revenue-engine"
