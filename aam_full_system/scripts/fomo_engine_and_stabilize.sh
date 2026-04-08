#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FOMO ENGINE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_fomo_${STAMP}.js"
cp db/aam.db "backups/aam_fomo_${STAMP}.db"

########################################
# 2) DATABASE
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS fomo_drop_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  drop_name TEXT,
  drop_type TEXT,
  start_time TEXT,
  end_time TEXT,
  drop_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS limited_item_supply (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_name TEXT,
  total_supply INTEGER,
  remaining_supply INTEGER,
  price_cents INTEGER,
  supply_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS flash_sale_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT,
  discount_percent INTEGER,
  start_time TEXT,
  end_time TEXT,
  event_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS purchase_activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_name TEXT,
  action_type TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# Seed example drops
cur.execute("INSERT INTO fomo_drop_registry (drop_name, drop_type) VALUES ('Founders Drop', 'limited')")
cur.execute("INSERT INTO fomo_drop_registry (drop_name, drop_type) VALUES ('City Expansion Drop', 'event')")

# Seed limited items
cur.execute("INSERT INTO limited_item_supply (item_name, total_supply, remaining_supply, price_cents) VALUES ('Luxury Sky Condo', 50, 50, 250000)")
cur.execute("INSERT INTO limited_item_supply (item_name, total_supply, remaining_supply, price_cents) VALUES ('Flying Car Prototype', 25, 25, 500000)")

conn.commit()
conn.close()
print("[OK] fomo tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function renderFomoEnginePage(req, user = null) {
  const drops = dbQuery(`SELECT * FROM fomo_drop_registry ORDER BY id DESC LIMIT 50`);
  const items = dbQuery(`SELECT * FROM limited_item_supply ORDER BY id DESC LIMIT 50`);
  const sales = dbQuery(`SELECT * FROM flash_sale_events ORDER BY id DESC LIMIT 50`);
  const activity = dbQuery(`SELECT * FROM purchase_activity_log ORDER BY id DESC LIMIT 100`);

  const dropRows = drops.map(r => `<tr><td>${r.id}</td><td>${r.drop_name}</td><td>${r.drop_type}</td><td>${r.drop_status}</td></tr>`).join('');
  const itemRows = items.map(r => `<tr><td>${r.id}</td><td>${r.item_name}</td><td>${r.remaining_supply}/${r.total_supply}</td><td>${r.price_cents}</td></tr>`).join('');
  const saleRows = sales.map(r => `<tr><td>${r.id}</td><td>${r.event_name}</td><td>${r.discount_percent}%</td></tr>`).join('');
  const activityRows = activity.map(r => `<tr><td>${r.item_name}</td><td>${r.action_type}</td><td>${r.created_at}</td></tr>`).join('');

  return htmlPage('FOMO Engine', `
    <main class="portal-main">
      <h1>FOMO Engine</h1>

      <h2>Drops</h2>
      <table><tr><th>ID</th><th>Name</th><th>Type</th><th>Status</th></tr>${dropRows}</table>

      <h2>Limited Items</h2>
      <table><tr><th>ID</th><th>Name</th><th>Supply</th><th>Price</th></tr>${itemRows}</table>

      <h2>Flash Sales</h2>
      <table><tr><th>ID</th><th>Name</th><th>Discount</th></tr>${saleRows}</table>

      <h2>Live Activity</h2>
      <table><tr><th>Item</th><th>Action</th><th>Time</th></tr>${activityRows}</table>
    </main>
  `, user);
}
"""

if "renderFomoEnginePage" not in text:
    text = text.replace("const server = http.createServer", helper + "\nconst server = http.createServer")

if "/fomo-engine" not in text:
    text = text.replace(
        "pathname === '/world-selector'",
        "pathname === '/fomo-engine' || pathname === '/world-selector'"
    )

p.write_text(text)
print("[OK] fomo route patched")
PYEOF

########################################
# 4) RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

########################################
# 5) SNAPSHOT
########################################
sqlite3 -json db/aam.db "select count(*) from fomo_drop_registry;" > "snapshots/fomo_${STAMP}.json"

########################################
# 6) REPORT
########################################
echo "FOMO ENGINE COMPLETE: $STAMP"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/fomo-engine"

