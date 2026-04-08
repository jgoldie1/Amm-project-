#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== RESTORE BEST DASHBOARD WITH REQUIRED ROUTES START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) SAVE CURRENT STATE
########################################
cp apps/dashboard.js "backups/dashboard_before_best_restore_${STAMP}.js"
cp db/aam.db "backups/aam_before_best_restore_${STAMP}.db"

########################################
# 2) FIND BEST BACKUP
########################################
BEST="$(python3 << 'PYEOF'
from pathlib import Path
import subprocess

root = Path.home() / "aam_full_system" / "backups"
required = [
    "/quantum-mail",
    "/quantum-mail-admin",
    "/holo-search",
    "/platform-analytics",
]

files = sorted(root.glob("dashboard_*.js"), key=lambda p: p.stat().st_mtime, reverse=True)

for f in files:
    try:
        text = f.read_text(errors="ignore")
    except Exception:
        continue

    if not all(x in text for x in required):
        continue

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

if [ -z "$BEST" ]; then
  echo "No valid backup found with all required routes"
  exit 1
fi

echo "[OK] restoring best backup: $BEST"
cp "$BEST" apps/dashboard.js

########################################
# 3) HARD RESTART
########################################
pkill -f "node apps/dashboard.js" || true
pkill -f "node apps/jarvis.js" || true
pkill -f "node" || true
sleep 2

fuser -k 4900/tcp 2>/dev/null || true
fuser -k 5000/tcp 2>/dev/null || true
sleep 2

rm -f dashboard.pid jarvis.pid

node --check apps/dashboard.js
node --check apps/jarvis.js

nohup node apps/dashboard.js > dashboard.log 2>&1 &
echo $! > dashboard.pid

nohup node apps/jarvis.js > jarvis.log 2>&1 &
echo $! > jarvis.pid

sleep 6

########################################
# 4) HEALTH
########################################
curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true

########################################
# 5) ROUTE TESTS
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
# 6) SCAN
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "cannot get" in txt or "not found" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "best_dashboard_restore_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] best dashboard restore scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) REPORT
########################################
cat > "reports/restore_best_dashboard_with_required_routes_${STAMP}.txt" <<REPORT
RESTORE BEST DASHBOARD WITH REQUIRED ROUTES REPORT
Timestamp: ${STAMP}

Recovered:
- restored newest valid dashboard backup that includes:
  - /quantum-mail
  - /quantum-mail-admin
  - /holo-search
  - /platform-analytics
- restarted dashboard + jarvis
- rechecked route availability

Purpose:
- recover from restoring an older/incomplete dashboard
- return missing advanced routes
- preserve stable runtime
REPORT

echo "RESTORE BEST DASHBOARD WITH REQUIRED ROUTES COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/best_dashboard_restore_scan_latest.json"
echo "  cat reports/restore_best_dashboard_with_required_routes_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/quantum-mail"
echo "  termux-open-url http://127.0.0.1:4900/quantum-mail-admin"
echo "  termux-open-url http://127.0.0.1:4900/holo-search"
echo "  termux-open-url http://127.0.0.1:4900/platform-analytics"
