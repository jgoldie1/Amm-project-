#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS P2 SMOKE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p snapshots test_results reports

pkill -f "dashboard.js" 2>/dev/null || true
pkill -f "jarvis" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5

curl -s http://127.0.0.1:4900/health > test_results/health_${STAMP}.txt || true
curl -s http://127.0.0.1:5000/health > test_results/jarvis_${STAMP}.txt || true

for route in command-center publishing-hub studio-lab creator-tv
do
  curl -s -i http://127.0.0.1:4900/$route > test_results/${route}_${STAMP}.txt || true
done

python3 <<PY2EOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in root.glob(f"*_{stamp}.txt"):
    txt = f.read_text(errors="ignore").lower()
    if "not found" in txt or "cannot get" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt or " 500 " in txt:
        issues.append({"file": f.name, "problem": "http_500"})

Path.home().joinpath("aam_full_system", "snapshots", "pass_p2_scan.json").write_text(
    json.dumps(issues, indent=2)
)
print("issues:", len(issues))
PY2EOF

echo "=== STATUS ==="
bash scripts/status.sh || true

cat > reports/pass_p2_smoke_${STAMP}.txt <<REPORT
PASS P2 SMOKE REPORT
Timestamp: ${STAMP}

Checked:
- dashboard
- jarvis
- command-center
- publishing-hub
- studio-lab
- creator-tv

Purpose:
- confirm full system stability
- confirm beta readiness
REPORT

echo "=== PASS P2 COMPLETE ==="
echo "Check:"
echo "  cat snapshots/pass_p2_scan.json"
echo "  cat reports/pass_p2_smoke_${STAMP}.txt"
echo "  bash scripts/status.sh"
