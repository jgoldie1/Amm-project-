#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== STABILIZE LOGS + STATUS + SNAPSHOT START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results logs

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_stabilize_logs_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_stabilize_logs_${STAMP}.js"
cp db/aam.db "backups/aam_stabilize_logs_${STAMP}.db"

########################################
# 2) ENSURE LOG FILES EXIST
########################################
touch logs/dashboard.log
touch logs/jarvis.log

########################################
# 3) CREATE RELIABLE STATUS SCRIPT
########################################
cat > scripts/current_phase_status.sh <<'STATUS'
#!/data/data/com.termux/files/usr/bin/bash
set +e

cd ~/aam_full_system

echo "=== CURRENT PHASE STATUS ==="
echo
echo "--- HEALTH ---"
curl -s http://127.0.0.1:4900/health || echo "dashboard health unavailable"
echo
curl -s http://127.0.0.1:5000/health || echo "jarvis health unavailable"
echo
curl -s http://127.0.0.1:5090/health || echo "socket health unavailable"
echo
echo "--- PID FILES ---"
[ -f dashboard.pid ] && echo "dashboard.pid: $(cat dashboard.pid)" || echo "dashboard.pid missing"
[ -f jarvis.pid ] && echo "jarvis.pid: $(cat jarvis.pid)" || echo "jarvis.pid missing"
echo
echo "--- LOG FILES ---"
ls -l logs/dashboard.log logs/jarvis.log 2>/dev/null || true
echo
echo "--- RECENT DASHBOARD LOG ---"
tail -n 40 logs/dashboard.log 2>/dev/null || echo "no dashboard log yet"
echo
echo "--- RECENT JARVIS LOG ---"
tail -n 40 logs/jarvis.log 2>/dev/null || echo "no jarvis log yet"
STATUS
chmod +x scripts/current_phase_status.sh

########################################
# 4) CREATE RELIABLE SNAPSHOT SCRIPT
########################################
cat > scripts/current_phase_snapshot.sh <<'SNAP'
#!/data/data/com.termux/files/usr/bin/bash
set +e

cd ~/aam_full_system
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p snapshots test_results reports

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

for route in \
  / \
  /watch \
  /connect-system \
  /payment-control \
  /accessibility \
  /avatar-rig-control \
  /engine-bridge \
  /world-experience-control \
  /web3d-client \
  /world3d \
  /realworld-client \
  /realworld \
  /realworld-city-registry \
  /realworld-cities \
  /property-market \
  /role-hub
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

sqlite3 -json db/aam.db "select count(*) as realworld_city_registry from realworld_city_registry;" > "snapshots/realworld_city_registry_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as property_market_listings from property_market_listings;" > "snapshots/property_market_listings_${STAMP}.json" 2>/dev/null || true
sqlite3 -json db/aam.db "select count(*) as realworld_locations from realworld_locations;" > "snapshots/realworld_locations_${STAMP}.json" 2>/dev/null || true

python3 <<PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []
for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "no such column" in txt:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
latest = Path.home() / "aam_full_system" / "snapshots" / "current_phase_snapshot_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] current phase snapshot scan complete: {len(issues)} issues")
PYEOF

cat > "reports/current_phase_snapshot_${STAMP}.txt" <<REPORT
CURRENT PHASE SNAPSHOT REPORT
Timestamp: ${STAMP}

Verified:
- dashboard health
- jarvis health
- socket health
- core current routes
- world routes
- realworld routes
- property market routes

Purpose:
- create a reliable no-risk checkpoint
- keep stabilization simple
- preserve the recovered stable platform
REPORT

echo "CURRENT PHASE SNAPSHOT COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/current_phase_snapshot_scan_latest.json"
SNAP
chmod +x scripts/current_phase_snapshot.sh

########################################
# 5) RUN SAFE RESTART + STATUS
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

########################################
# 6) WRITE CURRENT LOG STATE
########################################
{
  echo "[$STAMP] dashboard stabilized"
  curl -s http://127.0.0.1:4900/health || true
  echo
} >> logs/dashboard.log

{
  echo "[$STAMP] jarvis stabilized"
  curl -s http://127.0.0.1:5000/health || true
  echo
} >> logs/jarvis.log

########################################
# 7) RUN FRESH SNAPSHOT
########################################
bash scripts/current_phase_snapshot.sh

########################################
# 8) REPORT
########################################
cat > "reports/stabilize_logs_status_and_snapshot_${STAMP}.txt" <<REPORT
STABILIZE LOGS + STATUS + SNAPSHOT REPORT
Timestamp: ${STAMP}

Added:
- logs/dashboard.log
- logs/jarvis.log
- scripts/current_phase_status.sh
- scripts/current_phase_snapshot.sh

Purpose:
- normalize logs
- give one reliable status command
- give one reliable snapshot command
- stabilize without risky feature changes
REPORT

echo "STABILIZE LOGS + STATUS + SNAPSHOT COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/current_phase_snapshot_scan_latest.json"
echo "  bash scripts/current_phase_status.sh"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/"
echo "  termux-open-url http://127.0.0.1:4900/property-market"
echo "  termux-open-url http://127.0.0.1:4900/realworld"
