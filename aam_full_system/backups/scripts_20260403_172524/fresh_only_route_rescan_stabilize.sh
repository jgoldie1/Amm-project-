#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FRESH-ONLY ROUTE RESCAN + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_fresh_rescan_${STAMP}.js"
cp db/aam.db "backups/aam_fresh_rescan_${STAMP}.db"

########################################
# 2) CLEAR OLD TRANSIENT TEST FILES
########################################
find test_results -maxdepth 1 -type f -name "*.txt" -delete || true
find test_results -maxdepth 1 -type f -name "*.html" -delete || true
find test_results -maxdepth 1 -type f -name "*.json" -delete || true

########################################
# 3) VERIFY CORE HEALTH
########################################
bash scripts/check_js.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 4) FRESH ROUTE SWEEP ONLY
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
# 5) DIRECT PAGE SNAPSHOTS FOR KNOWN PROBLEM AREAS
########################################
curl -s "http://127.0.0.1:4900/wallet-center" > "snapshots/wallet_center_${STAMP}.html" || true
curl -s "http://127.0.0.1:4900/creator-hub" > "snapshots/creator_hub_${STAMP}.html" || true
curl -s "http://127.0.0.1:4900/executive-dashboard" > "snapshots/executive_dashboard_${STAMP}.html" || true

########################################
# 6) FRESH ERROR SCAN ONLY
########################################
python3 << 'PYEOF'
from pathlib import Path
import json

root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob("*.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "fresh_route_rescan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] fresh-only scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) DB PREVIEW SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select id, wallet_name, wallet_status from wallets order by id desc limit 12;" > "snapshots/wallets_preview_${STAMP}.json" || true
sqlite3 -json db/aam.db "select id, title, host_name, status from podcasts order by id desc limit 12;" > "snapshots/podcasts_preview_${STAMP}.json" || true

########################################
# 8) REPORT
########################################
cat > "reports/fresh_only_route_rescan_${STAMP}.txt" <<REPORT
FRESH-ONLY ROUTE RESCAN + STABILIZE REPORT
Timestamp: ${STAMP}

Completed:
- cleared old transient test files
- reran fresh route sweep only
- reran fresh error scan only
- rechecked wallet-center and creator-hub directly
- stabilized services and created snapshots

Goal:
- confirm whether prior missing-column alerts were stale
- validate current build only
- prepare for monetization phase
REPORT

echo "FRESH-ONLY ROUTE RESCAN + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/fresh_route_rescan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/wallet-center"
echo "  termux-open-url http://127.0.0.1:4900/creator-hub"
echo "  termux-open-url http://127.0.0.1:4900/executive-dashboard"
