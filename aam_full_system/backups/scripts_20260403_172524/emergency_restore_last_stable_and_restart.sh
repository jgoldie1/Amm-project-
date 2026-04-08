#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== EMERGENCY RESTORE LAST STABLE + RESTART START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) SAVE CURRENT BROKEN STATE
########################################
cp apps/dashboard.js "backups/dashboard_broken_state_${STAMP}.js" 2>/dev/null || true
cp apps/jarvis.js "backups/jarvis_broken_state_${STAMP}.js" 2>/dev/null || true
cp db/aam.db "backups/aam_broken_state_${STAMP}.db" 2>/dev/null || true
cp public/world3d/index.html "backups/world3d_broken_state_${STAMP}.html" 2>/dev/null || true
cp public/realworld/index.html "backups/realworld_broken_state_${STAMP}.html" 2>/dev/null || true

########################################
# 2) STOP ANY STALE PROCESSES / PID FILES
########################################
pkill -f "node .*dashboard" 2>/dev/null || true
pkill -f "node .*jarvis" 2>/dev/null || true
pkill -f "node apps/dashboard.js" 2>/dev/null || true
pkill -f "node apps/jarvis.js" 2>/dev/null || true
rm -f dashboard.pid jarvis.pid 2>/dev/null || true

########################################
# 3) RESTORE LAST KNOWN STABLE FILES
########################################
LATEST_DASH="$(ls -t backups/dashboard_master_fresh_lock_*.js backups/dashboard_master_phase_lock_*.js backups/dashboard_property_tables_fix_*.js 2>/dev/null | head -n 1)"
LATEST_JARVIS="$(ls -t backups/jarvis_master_fresh_lock_*.js backups/jarvis_master_phase_lock_*.js backups/jarvis_final_huge_*.js 2>/dev/null | head -n 1)"
LATEST_DB="$(ls -t backups/aam_master_fresh_lock_*.db backups/aam_master_phase_lock_*.db backups/aam_property_tables_fix_*.db 2>/dev/null | head -n 1)"
LATEST_WORLD3D="$(ls -t backups/world3d_master_fresh_lock_*.html backups/world3d_master_phase_lock_*.html backups/world3d_final_huge_*.html backups/world3d_player_progress_*.html 2>/dev/null | head -n 1)"
LATEST_REALWORLD="$(ls -t backups/realworld_master_fresh_lock_*.html backups/realworld_master_phase_lock_*.html backups/realworld_final_huge_*.html 2>/dev/null | head -n 1)"

if [ -n "$LATEST_DASH" ]; then
  cp "$LATEST_DASH" apps/dashboard.js
  echo "[OK] restored dashboard from $LATEST_DASH"
else
  echo "[WARN] no stable dashboard backup found"
fi

if [ -n "$LATEST_JARVIS" ]; then
  cp "$LATEST_JARVIS" apps/jarvis.js
  echo "[OK] restored jarvis from $LATEST_JARVIS"
else
  echo "[WARN] no stable jarvis backup found"
fi

if [ -n "$LATEST_DB" ]; then
  cp "$LATEST_DB" db/aam.db
  echo "[OK] restored DB from $LATEST_DB"
else
  echo "[WARN] no stable DB backup found"
fi

if [ -n "$LATEST_WORLD3D" ]; then
  cp "$LATEST_WORLD3D" public/world3d/index.html
  echo "[OK] restored world3d from $LATEST_WORLD3D"
else
  echo "[WARN] no stable world3d backup found"
fi

if [ -n "$LATEST_REALWORLD" ]; then
  cp "$LATEST_REALWORLD" public/realworld/index.html
  echo "[OK] restored realworld from $LATEST_REALWORLD"
else
  echo "[WARN] no stable realworld backup found"
fi

########################################
# 4) VERIFY SYNTAX
########################################
bash scripts/check_js.sh

########################################
# 5) CLEAN RESTART
########################################
bash scripts/safe_restart.sh || true
sleep 3
bash scripts/status.sh || true

########################################
# 6) HEALTH CHECKS
########################################
curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 7) TARGETED ROUTE TESTS
########################################
for route in \
  / \
  /world3d \
  /realworld \
  /realworld-client \
  /realworld-city-registry \
  /property-market \
  /gameplay-control \
  /player-progress
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 8) FRESH ERROR SCAN
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "emergency_restore_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] emergency restore scan complete: {len(issues)} issues")
PYEOF

########################################
# 9) REPORT
########################################
cat > "reports/emergency_restore_last_stable_${STAMP}.txt" <<REPORT
EMERGENCY RESTORE LAST STABLE REPORT
Timestamp: ${STAMP}

Action:
- saved broken state
- cleared stale PIDs/processes
- restored latest stable dashboard/jarvis/db/world files
- restarted platform
- ran fresh targeted tests

Purpose:
- recover from interrupted paste/run
- restore last known stable platform state
- stabilize everything
REPORT

echo "EMERGENCY RESTORE LAST STABLE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/emergency_restore_scan_latest.json"
echo "  bash scripts/status.sh"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/"
echo "  termux-open-url http://127.0.0.1:4900/property-market"
echo "  termux-open-url http://127.0.0.1:4900/realworld"
