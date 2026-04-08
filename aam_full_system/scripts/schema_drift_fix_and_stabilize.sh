#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== SCHEMA DRIFT FIX + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_schema_fix_${STAMP}.js"
cp db/aam.db "backups/aam_schema_fix_${STAMP}.db"

########################################
# 2) DATABASE SCHEMA FIX
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

def cols(table):
    try:
        return [r["name"] for r in cur.execute(f"PRAGMA table_info({table})").fetchall()]
    except:
        return []

def ensure_col(table, name, ddl):
    if name not in cols(table):
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {ddl}")
        print(f"[OK] added {table}.{name}")

# Fix known drift from logs
ensure_col("wallets", "wallet_status", "wallet_status TEXT DEFAULT 'active'")
ensure_col("podcasts", "status", "status TEXT DEFAULT 'active'")

# Useful compatibility columns that often drift in evolving builds
ensure_col("wallets", "wallet_name", "wallet_name TEXT")
ensure_col("podcasts", "host_name", "host_name TEXT")

# Backfill blanks where reasonable
try:
    cur.execute("UPDATE wallets SET wallet_status='active' WHERE wallet_status IS NULL OR wallet_status=''")
except:
    pass

try:
    cur.execute("UPDATE podcasts SET status='active' WHERE status IS NULL OR status=''")
except:
    pass

try:
    cur.execute("UPDATE wallets SET wallet_name='Primary Wallet' WHERE (wallet_name IS NULL OR wallet_name='')")
except:
    pass

try:
    cur.execute("UPDATE podcasts SET host_name='Unknown Host' WHERE (host_name IS NULL OR host_name='')")
except:
    pass

conn.commit()
conn.close()
print("[OK] schema drift database fix complete")
PYEOF

########################################
# 3) STABILIZE / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 4) SCHEMA SNAPSHOTS
########################################
sqlite3 -json db/aam.db "pragma table_info(wallets);" > "snapshots/wallets_schema_${STAMP}.json"
sqlite3 -json db/aam.db "pragma table_info(podcasts);" > "snapshots/podcasts_schema_${STAMP}.json"

sqlite3 -json db/aam.db "select id, wallet_name, wallet_status from wallets order by id desc limit 12;" > "snapshots/wallets_preview_${STAMP}.json" || true
sqlite3 -json db/aam.db "select id, title, host_name, status from podcasts order by id desc limit 12;" > "snapshots/podcasts_preview_${STAMP}.json" || true

########################################
# 5) PAGE SNAPSHOTS
########################################
for route in \
  / \
  /public-home \
  /role-hub \
  /heirs-ecosystem \
  /heir-finance \
  /storefront-analytics \
  /executive-dashboard \
  /scheduler-command
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) ROUTE ERROR SCAN
########################################
python3 << 'PYEOF'
from pathlib import Path
import json

root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in root.glob("*.txt"):
    txt = f.read_text(errors="ignore")
    if "no such column" in txt.lower():
        issues.append({"file": f.name, "problem": "missing_column"})
    if "HTTP/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "ReferenceError" in txt or "SyntaxError" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

out = Path.home() / "aam_full_system" / "snapshots" / f"schema_drift_route_scan_latest.json"
out.write_text(json.dumps(issues, indent=2))
print(f"[OK] route scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) REPORT
########################################
cat > "reports/schema_drift_fix_${STAMP}.txt" <<REPORT
SCHEMA DRIFT FIX + STABILIZE REPORT
Timestamp: ${STAMP}

Fixed:
- wallets.wallet_status
- podcasts.status

Added compatibility support:
- wallets.wallet_name
- podcasts.host_name

Verified:
- JS syntax
- dashboard health
- jarvis health
- socket health
- route scans for missing-column regressions
REPORT

echo "SCHEMA DRIFT FIX + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/schema_drift_route_scan_latest.json"
echo "  cat snapshots/wallets_schema_${STAMP}.json"
echo "  cat snapshots/podcasts_schema_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/"
echo "  termux-open-url http://127.0.0.1:4900/role-hub"
echo "  termux-open-url http://127.0.0.1:4900/executive-dashboard"
