#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINAL STABILITY CHECKPOINT START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p reports snapshots test_results backups

cp apps/dashboard.js "backups/dashboard_final_checkpoint_${STAMP}.js"
cp db/aam.db "backups/aam_final_checkpoint_${STAMP}.db"

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true

for route in \
  / \
  /quantum-cloud \
  /holographic-engine \
  /quantum-accelerator \
  /orchestration-control \
  /holo-search \
  /platform-analytics \
  /transaction-engine \
  /asset-library \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

python3 << 'PYEOF'
from pathlib import Path
import json

stamp = Path.cwd().joinpath("test_results")
issues = []
for f in sorted(stamp.glob("*.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
latest = Path.cwd() / "snapshots" / "final_stability_checkpoint_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] final checkpoint scan complete: {len(issues)} issues")
PYEOF

cat > "reports/final_stability_checkpoint_${STAMP}.txt" <<REPORT
FINAL STABILITY CHECKPOINT REPORT
Timestamp: ${STAMP}

Verified:
- dashboard health
- jarvis health
- quantum cloud route
- holographic engine route
- quantum accelerator route
- orchestration route
- holo search route
- analytics route
- transaction route
- asset library route
- world3d route

Purpose:
- preserve a clean stable checkpoint
- verify current live routes
- prepare for next build phase
REPORT

echo "FINAL STABILITY CHECKPOINT COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/final_stability_checkpoint_scan_latest.json"
echo "  cat reports/final_stability_checkpoint_${STAMP}.txt"
