#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FULL COMPATIBILITY SWEEP + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_full_compat_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_full_compat_${STAMP}.js"
cp db/aam.db "backups/aam_full_compat_${STAMP}.db"

########################################
# 2) DB COMPATIBILITY CATCH-UP
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

# wallets compatibility
ensure_col("wallets", "wallet_name", "wallet_name TEXT")
ensure_col("wallets", "wallet_status", "wallet_status TEXT DEFAULT 'active'")

# podcasts compatibility
ensure_col("podcasts", "host_name", "host_name TEXT")
ensure_col("podcasts", "status", "status TEXT DEFAULT 'active'")

# backfill
try:
    cur.execute("UPDATE wallets SET wallet_name='Primary Wallet' WHERE wallet_name IS NULL OR wallet_name=''")
except:
    pass
try:
    cur.execute("UPDATE wallets SET wallet_status='active' WHERE wallet_status IS NULL OR wallet_status=''")
except:
    pass
try:
    cur.execute("UPDATE podcasts SET host_name='Unknown Host' WHERE host_name IS NULL OR host_name=''")
except:
    pass
try:
    cur.execute("UPDATE podcasts SET status='active' WHERE status IS NULL OR status=''")
except:
    pass

conn.commit()
conn.close()
print("[OK] DB compatibility catch-up complete")
PYEOF

########################################
# 3) PATCH DASHBOARD QUERY COMPATIBILITY
########################################
python3 << 'PYEOF'
from pathlib import Path
import re

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

# safer wallets query
patterns = [
    (r"SELECT id, wallet_name, wallet_status FROM wallets ORDER BY id DESC LIMIT 12",
     "SELECT id, COALESCE(wallet_name, 'Primary Wallet') AS wallet_name, COALESCE(wallet_status, 'active') AS wallet_status FROM wallets ORDER BY id DESC LIMIT 12"),
    (r"SELECT id, title, host_name, status FROM podcasts ORDER BY id DESC LIMIT 12",
     "SELECT id, title, COALESCE(host_name, 'Unknown Host') AS host_name, COALESCE(status, 'active') AS status FROM podcasts ORDER BY id DESC LIMIT 12"),
]

for old, new in patterns:
    text = re.sub(old, new, text)

# add safe query helpers once
marker = "const server = http.createServer(async (req, res) => {"
helper = r"""
function safeWalletPreviewRows() {
  try {
    return dbQuery("SELECT id, COALESCE(wallet_name, 'Primary Wallet') AS wallet_name, COALESCE(wallet_status, 'active') AS wallet_status FROM wallets ORDER BY id DESC LIMIT 12");
  } catch (e) {
    return [];
  }
}

function safePodcastPreviewRows() {
  try {
    return dbQuery("SELECT id, title, COALESCE(host_name, 'Unknown Host') AS host_name, COALESCE(status, 'active') AS status FROM podcasts ORDER BY id DESC LIMIT 12");
  } catch (e) {
    return [];
  }
}
"""
if "function safeWalletPreviewRows()" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

# replace common raw dbQuery uses if present
text = text.replace(
    "const walletRows = dbQuery(`SELECT id, wallet_name, wallet_status FROM wallets ORDER BY id DESC LIMIT 12`);",
    "const walletRows = safeWalletPreviewRows();"
)
text = text.replace(
    "const podcastRows = dbQuery(`SELECT id, title, host_name, status FROM podcasts ORDER BY id DESC LIMIT 12`);",
    "const podcastRows = safePodcastPreviewRows();"
)
text = text.replace(
    'const walletRows = dbQuery("SELECT id, wallet_name, wallet_status FROM wallets ORDER BY id DESC LIMIT 12");',
    "const walletRows = safeWalletPreviewRows();"
)
text = text.replace(
    'const podcastRows = dbQuery("SELECT id, title, host_name, status FROM podcasts ORDER BY id DESC LIMIT 12");',
    "const podcastRows = safePodcastPreviewRows();"
)

p.write_text(text)
print("[OK] dashboard compatibility patch applied")
PYEOF

########################################
# 4) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 5) FRESH ROUTE SWEEP
########################################
for route in \
  / \
  /public-home \
  /member-home \
  /role-hub \
  /heir-login \
  /progress \
  /command-core \
  /heirs \
  /heirs-ecosystem \
  /heir-operations \
  /wallet-center \
  /creator-hub \
  /heir-payouts \
  /heir-storefronts \
  /payout-cycles \
  /payout-automation \
  /heir-finance \
  /storefront-analytics \
  /scheduled-payout-jobs \
  /executive-dashboard \
  /scheduler-command
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) ERROR SCAN
########################################
python3 << 'PYEOF'
from pathlib import Path
import json

root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in root.glob("*.txt"):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

out = Path.home() / "aam_full_system" / "snapshots" / f"full_compat_route_scan_{Path(root).name}.json"
out.write_text(json.dumps(issues, indent=2))
latest = Path.home() / "aam_full_system" / "snapshots" / "full_compat_route_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] fresh route scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) SCHEMA / PREVIEW SNAPSHOTS
########################################
sqlite3 -json db/aam.db "pragma table_info(wallets);" > "snapshots/wallets_schema_${STAMP}.json"
sqlite3 -json db/aam.db "pragma table_info(podcasts);" > "snapshots/podcasts_schema_${STAMP}.json"
sqlite3 -json db/aam.db "select id, wallet_name, wallet_status from wallets order by id desc limit 12;" > "snapshots/wallets_preview_${STAMP}.json" || true
sqlite3 -json db/aam.db "select id, title, host_name, status from podcasts order by id desc limit 12;" > "snapshots/podcasts_preview_${STAMP}.json" || true

########################################
# 8) REPORT
########################################
cat > "reports/full_compatibility_sweep_${STAMP}.txt" <<REPORT
FULL COMPATIBILITY SWEEP + STABILIZE REPORT
Timestamp: ${STAMP}

Completed:
- wallets compatibility columns
- podcasts compatibility columns
- dashboard compatibility query sweep
- fresh restart and health verify
- fresh route sweep
- fresh route error scan

Goal:
- remove schema/query drift
- stabilize wallet and creator surfaces
- prepare cleanly for buy-in and monetization phase
REPORT

echo "FULL COMPATIBILITY SWEEP + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/full_compat_route_scan_latest.json"
echo "  cat snapshots/wallets_schema_${STAMP}.json"
echo "  cat snapshots/podcasts_schema_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/wallet-center"
echo "  termux-open-url http://127.0.0.1:4900/creator-hub"
echo "  termux-open-url http://127.0.0.1:4900/executive-dashboard"
