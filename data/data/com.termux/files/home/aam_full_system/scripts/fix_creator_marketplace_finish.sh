#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FIX CREATOR MARKETPLACE FINISH START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_creator_market_finish_${STAMP}.js"
cp db/aam.db "backups/aam_creator_market_finish_${STAMP}.db"

python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

required = [
    "player_wallets",
    "creator_marketplace_items",
    "creator_listing_fees",
    "creator_marketplace_sales",
    "seller_payout_ledger",
    "owned_marketplace_items",
    "platform_fee_rules",
    "purchase_activity_log",
]

missing = []
for t in required:
    row = cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (t,)).fetchone()
    if not row:
        missing.append(t)

if missing:
    raise SystemExit("Missing tables: " + ", ".join(missing))

conn.close()
print("[OK] creator marketplace tables verified")
PYEOF

python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

checks = [
    "renderCreatorMarketplacePage",
    "pathname === '/creator-marketplace'",
    "pathname === '/creator-marketplace/buy'",
]

missing = [c for c in checks if c not in text]
if missing:
    raise SystemExit("Missing dashboard marketplace patch parts: " + ", ".join(missing))

print("[OK] creator marketplace route patch verified")
PYEOF

bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true

curl -s -i -X POST "http://127.0.0.1:4900/creator-marketplace/buy" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "buyer_name=Jacobie&item_id=2" \
  > "test_results/creator_market_buy_${STAMP}.txt" || true

for route in \
  / \
  /creator-marketplace \
  /fomo-engine \
  /world-selector \
  /gameplay-live-actions \
  /gameplay-assets \
  /property-market \
  /realworld \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

sqlite3 -json db/aam.db "select count(*) as player_wallets from player_wallets;" > "snapshots/player_wallets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as creator_marketplace_items from creator_marketplace_items;" > "snapshots/creator_marketplace_items_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as creator_marketplace_sales from creator_marketplace_sales;" > "snapshots/creator_marketplace_sales_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as seller_payout_ledger from seller_payout_ledger;" > "snapshots/seller_payout_ledger_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as owned_marketplace_items from owned_marketplace_items;" > "snapshots/owned_marketplace_items_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as purchase_activity_log from purchase_activity_log;" > "snapshots/purchase_activity_log_${STAMP}.json"

python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such table" in lower:
        issues.append({"file": f.name, "problem": "missing_table"})
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "insufficient balance" in lower:
        issues.append({"file": f.name, "problem": "insufficient_balance"})

latest = Path.home() / "aam_full_system" / "snapshots" / "creator_marketplace_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] creator marketplace scan complete: {len(issues)} issues")
PYEOF

echo "FIX CREATOR MARKETPLACE FINISH COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/creator_marketplace_scan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/creator-marketplace"
echo "  termux-open-url http://127.0.0.1:4900/fomo-engine"
echo "  termux-open-url http://127.0.0.1:4900/world-selector"
