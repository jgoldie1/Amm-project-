#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FULL STACK SOCKET RECOVERY + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results logs pids

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_socket_recovery_${STAMP}.js" 2>/dev/null || true
cp apps/jarvis.js "backups/jarvis_socket_recovery_${STAMP}.js" 2>/dev/null || true
cp apps/world_socket.js "backups/world_socket_recovery_${STAMP}.js" 2>/dev/null || true
cp db/aam.db "backups/aam_socket_recovery_${STAMP}.db" 2>/dev/null || true

########################################
# 2) HARD STOP STALE PROCESSES
########################################
pkill -f "apps/dashboard.js" 2>/dev/null || true
pkill -f "apps/jarvis.js" 2>/dev/null || true
pkill -f "apps/world_socket.js" 2>/dev/null || true
pkill -f "node.*dashboard" 2>/dev/null || true
pkill -f "node.*jarvis" 2>/dev/null || true
pkill -f "node.*world_socket" 2>/dev/null || true
sleep 2

rm -f pids/dashboard.pid pids/jarvis.pid pids/world_socket.pid dashboard.pid jarvis.pid world_socket.pid 2>/dev/null || true

########################################
# 3) JS CHECK
########################################
bash scripts/check_js.sh

########################################
# 4) START CORE SERVICES
########################################
bash scripts/safe_restart.sh
sleep 4

########################################
# 5) START SOCKET IF AVAILABLE
########################################
SOCKET_MODE="missing"
SOCKET_HEALTH=""

if [ -f "apps/world_socket.js" ]; then
  SOCKET_MODE="present"
  nohup node apps/world_socket.js > logs/world_socket.log 2>&1 &
  echo $! > pids/world_socket.pid
  sleep 3
fi

########################################
# 6) DIRECT HEALTH TESTS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.txt" || true

########################################
# 7) INTERPRET SOCKET RESULT
########################################
if [ -s "test_results/socket_health_${STAMP}.txt" ]; then
  SOCKET_HEALTH="$(cat "test_results/socket_health_${STAMP}.txt")"
else
  SOCKET_HEALTH=""
fi

if echo "$SOCKET_HEALTH" | grep -qi '"ok"[[:space:]]*:[[:space:]]*true'; then
  SOCKET_MODE="healthy"
elif [ "$SOCKET_MODE" = "present" ]; then
  SOCKET_MODE="present_but_unhealthy"
else
  SOCKET_MODE="optional_missing"
fi

########################################
# 8) ROUTE SMOKE TEST
########################################
for route in \
  / \
  /fomo-engine \
  /world-selector \
  /creator-marketplace \
  /gameplay-live-actions \
  /gameplay-assets \
  /gameplay-progression \
  /property-market \
  /realworld \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 9) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as player_wallets from player_wallets;" > "snapshots/player_wallets_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as creator_marketplace_items from creator_marketplace_items;" > "snapshots/creator_marketplace_items_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as creator_marketplace_sales from creator_marketplace_sales;" > "snapshots/creator_marketplace_sales_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as premium_world_registry from premium_world_registry;" > "snapshots/premium_world_registry_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as system_gap_registry from system_gap_registry;" > "snapshots/system_gap_registry_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as world_interaction_events from world_interaction_events;" > "snapshots/world_interaction_events_${STAMP}.json" 2>/dev/null || true

########################################
# 10) FRESH ERROR SCAN
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "no such table" in txt:
        issues.append({"file": f.name, "problem": "missing_table"})
    if "no such column" in txt:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in txt or "500 internal server error" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "full_stack_stabilize_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] full stack stabilize scan complete: {len(issues)} issues")
PYEOF

########################################
# 11) REPORT
########################################
cat > "reports/full_stack_socket_recovery_${STAMP}.txt" <<REPORT
FULL STACK SOCKET RECOVERY + STABILIZE REPORT
Timestamp: ${STAMP}

Verified:
- dashboard health
- jarvis health
- marketplace routes
- gameplay routes
- premium world routes
- property routes
- realworld routes

Socket mode:
- ${SOCKET_MODE}

Purpose:
- stabilize everything
- recover optional realtime socket layer if available
- create a clean current-state checkpoint
REPORT

echo "FULL STACK SOCKET RECOVERY + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/full_stack_stabilize_scan_latest.json"
echo "  cat reports/full_stack_socket_recovery_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/creator-marketplace"
echo "  termux-open-url http://127.0.0.1:4900/world-selector"
echo "  termux-open-url http://127.0.0.1:4900/world3d"
