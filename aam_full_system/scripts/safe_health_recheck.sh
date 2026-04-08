#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== SAFE HEALTH RECHECK START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p snapshots reports test_results

bash scripts/check_js.sh
bash scripts/safe_restart.sh || true
sleep 3
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true

for route in \
  / \
  /world3d \
  /realworld \
  /realworld-client \
  /property-market \
  /player-progress \
  /gameplay-control
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

python3 << PYEOF
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

Path.home().joinpath("aam_full_system","snapshots","safe_health_recheck_latest.json").write_text(json.dumps(issues, indent=2))
print(f"[OK] safe recheck scan complete: {len(issues)} issues")
PYEOF

cat > "reports/safe_health_recheck_${STAMP}.txt" <<REPORT
SAFE HEALTH RECHECK REPORT
Timestamp: ${STAMP}

Purpose:
- confirm current platform health
- avoid risky feature changes
- stop corrupted pasted script damage
REPORT

echo "SAFE HEALTH RECHECK COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/safe_health_recheck_latest.json"
echo "  bash scripts/status.sh"
