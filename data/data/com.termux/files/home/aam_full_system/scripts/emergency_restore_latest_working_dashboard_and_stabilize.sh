#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== EMERGENCY RESTORE LATEST WORKING DASHBOARD + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) SAVE CURRENT BROKEN STATE
########################################
if [ -f apps/dashboard.js ]; then
  cp apps/dashboard.js "backups/dashboard_broken_emergency_${STAMP}.js"
fi
if [ -f db/aam.db ]; then
  cp db/aam.db "backups/aam_emergency_${STAMP}.db"
fi

########################################
# 2) FIND LATEST VALID DASHBOARD BACKUP
########################################
CANDIDATE="$(python3 << 'PYEOF'
from pathlib import Path
import subprocess

root = Path.home() / "aam_full_system" / "backups"
files = sorted(root.glob("dashboard_*.js"), key=lambda p: p.stat().st_mtime, reverse=True)

for f in files:
    try:
        r = subprocess.run(["node", "--check", str(f)], capture_output=True, text=True)
        if r.returncode == 0:
            print(str(f))
            raise SystemExit(0)
    except Exception:
        pass

print("")
PYEOF
)"

if [ -z "$CANDIDATE" ]; then
  echo "No valid dashboard backup found"
  exit 1
fi

echo "[OK] restoring from: $CANDIDATE"
cp "$CANDIDATE" apps/dashboard.js

########################################
# 3) HARD STOP EVERYTHING
########################################
pkill -f "node apps/dashboard.js" || true
pkill -f "node apps/jarvis.js" || true
pkill -f "node" || true
sleep 2

fuser -k 4900/tcp 2>/dev/null || true
fuser -k 5000/tcp 2>/dev/null || true
sleep 2

rm -f dashboard.pid jarvis.pid

########################################
# 4) VERIFY JS
########################################
node --check apps/dashboard.js
node --check apps/jarvis.js

########################################
# 5) RESTART CLEAN
########################################
nohup node apps/dashboard.js > dashboard.log 2>&1 &
echo $! > dashboard.pid

nohup node apps/jarvis.js > jarvis.log 2>&1 &
echo $! > jarvis.pid

sleep 6

########################################
# 6) HEALTH
########################################
curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true

########################################
# 7) BASIC ROUTE TEST
########################################
for route in \
  / \
  /quantum-mail \
  /quantum-mail-admin \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 8) ERROR SCAN
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "cannot get" in txt or "not found" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})

latest = Path.home() / "aam_full_system" / "snapshots" / "emergency_restore_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] emergency restore scan complete: {len(issues)} issues")
PYEOF

########################################
# 9) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 10) REPORT
########################################
cat > "reports/emergency_restore_latest_working_dashboard_${STAMP}.txt" <<REPORT
EMERGENCY RESTORE LATEST WORKING DASHBOARD REPORT
Timestamp: ${STAMP}

Recovered:
- restored latest valid dashboard backup
- hard stopped stuck runtime
- restarted dashboard + jarvis clean
- ran health checks
- ran basic route smoke tests

Purpose:
- recover from interrupted patch run
- restore stable baseline
- preserve progress without guessing at broken partial edits
REPORT

echo "EMERGENCY RESTORE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/emergency_restore_scan_latest.json"
echo "  cat reports/emergency_restore_latest_working_dashboard_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900"
echo "  termux-open-url http://127.0.0.1:4900/quantum-mail"
echo "  termux-open-url http://127.0.0.1:4900/holo-search"
