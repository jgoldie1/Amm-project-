#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== EMERGENCY RESTORE BEFORE MIDDLEVERSE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_emergency_before_middleverse_${STAMP}.js" || true
cp apps/jarvis.js "backups/jarvis_emergency_before_middleverse_${STAMP}.js" || true
cp db/aam.db "backups/aam_emergency_before_middleverse_${STAMP}.db" || true

########################################
# 1) FIND LATEST KNOWN-GOOD DASHBOARD BACKUP
########################################
python3 << 'PYEOF'
from pathlib import Path
import shutil
import sys

root = Path.home() / "aam_full_system"
backups = root / "backups"
target = root / "apps" / "dashboard.js"

preferred = []
for p in backups.glob("dashboard_*.js"):
    name = p.name
    if any(tag in name for tag in [
        "fix_missing_section3_tables",
        "repair_section3",
        "pre_section3",
        "section2_master_lock",
        "section2_safe_pass_b",
        "section2_smoke_safe_bypass",
        "section2_safe_endpoints",
        "section2_post_notnull_fix",
        "post_section1",
        "section1_stability_lock",
        "master_post_fix",
        "final_zero_issue",
    ]):
        preferred.append(p)

preferred = sorted(preferred, key=lambda p: p.stat().st_mtime, reverse=True)

if not preferred:
    print("No preferred dashboard backup found")
    sys.exit(1)

src = preferred[0]
shutil.copy2(src, target)
print(f"[OK] restored dashboard from: {src}")
PYEOF

########################################
# 2) HARD STOP OLD PROCESSES
########################################
pkill -f "node .*apps/dashboard.js" >/dev/null 2>&1 || true
pkill -f "node .*apps/jarvis.js" >/dev/null 2>&1 || true
rm -f run/dashboard.pid run/jarvis.pid dashboard.pid jarvis.pid >/dev/null 2>&1 || true

########################################
# 3) JS CHECK + SAFE RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5
bash scripts/status.sh || true

########################################
# 4) BASELINE SMOKE TEST
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

for route in \
  / \
  /dispatch-actions \
  /studio-lab \
  /episode-movie-pipeline \
  /creator-tv \
  /metaverse-control \
  /quantum-mail \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 5) ERROR SCAN
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
    if "syntaxerror" in txt or "referenceerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

latest = Path.home() / "aam_full_system" / "snapshots" / "emergency_restore_before_middleverse_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] emergency restore scan complete: {len(issues)} issues")
PYEOF

########################################
# 6) REPORT
########################################
cat > "reports/emergency_restore_before_middleverse_and_stabilize_${STAMP}.txt" <<REPORT
EMERGENCY RESTORE BEFORE MIDDLEVERSE + STABILIZE REPORT
Timestamp: ${STAMP}

Recovered:
- restored latest known-good dashboard backup
- hard-stopped stuck node processes
- restarted dashboard + jarvis
- reran baseline smoke tests

Purpose:
- recover from interrupted middleverse patch
- restore a clean stable baseline
- prepare for a smaller middleverse pass
REPORT

echo "EMERGENCY RESTORE BEFORE MIDDLEVERSE + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/emergency_restore_before_middleverse_scan_latest.json"
echo "  cat reports/emergency_restore_before_middleverse_and_stabilize_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900"
echo "  termux-open-url http://127.0.0.1:4900/studio-lab"
echo "  termux-open-url http://127.0.0.1:4900/metaverse-control"
