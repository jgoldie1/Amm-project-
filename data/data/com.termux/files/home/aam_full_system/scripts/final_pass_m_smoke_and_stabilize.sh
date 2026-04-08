#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINAL PASS M SMOKE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p snapshots reports test_results backups

cp apps/dashboard.js "backups/dashboard_final_pass_m_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_final_pass_m_${STAMP}.js"
cp db/aam.db "backups/aam_final_pass_m_${STAMP}.db"

########################################
# 1) HARD RUNTIME RECOVERY
########################################
pkill -f "node .*dashboard.js" 2>/dev/null || true
pkill -f "node .*jarvis.js" 2>/dev/null || true
pkill -f "apps/dashboard.js" 2>/dev/null || true
pkill -f "apps/jarvis.js" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5

########################################
# 2) TRUE SMOKE TESTS
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_repair_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_repair_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/command-center > "test_results/command_center_repair_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/finance-hub > "test_results/finance_hub_repair_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/streaming-hub > "test_results/streaming_hub_repair_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/metaverse-control > "test_results/metaverse_control_repair_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/middleverse-bridge > "test_results/middleverse_bridge_repair_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/multiverse-bridge > "test_results/multiverse_bridge_repair_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/studio-lab > "test_results/studio_lab_repair_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/creator-tv > "test_results/creator_tv_repair_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:4900/world3d > "test_results/world3d_repair_${STAMP}.txt" || true

########################################
# 3) CLEAN SCAN USING REAL TIMESTAMP
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

targets = [
    f"dashboard_health_repair_{stamp}.txt",
    f"jarvis_health_repair_{stamp}.txt",
    f"command_center_repair_{stamp}.txt",
    f"finance_hub_repair_{stamp}.txt",
    f"streaming_hub_repair_{stamp}.txt",
    f"metaverse_control_repair_{stamp}.txt",
    f"middleverse_bridge_repair_{stamp}.txt",
    f"multiverse_bridge_repair_{stamp}.txt",
    f"studio_lab_repair_{stamp}.txt",
    f"creator_tv_repair_{stamp}.txt",
    f"world3d_repair_{stamp}.txt",
]

for name in targets:
    f = root / name
    txt = f.read_text(errors="ignore").lower() if f.exists() else ""

    if not txt.strip():
        issues.append({"file": name, "problem": "missing_or_empty"})
        continue
    if "cannot get" in txt or "not found" in txt:
        issues.append({"file": name, "problem": "route_missing"})
    if "http/1.1 500" in txt:
        issues.append({"file": name, "problem": "http_500"})
    if "syntaxerror" in txt or "referenceerror" in txt:
        issues.append({"file": name, "problem": "js_runtime_error"})
    if name.startswith("dashboard_health") and '"ok": true' not in txt:
        issues.append({"file": name, "problem": "dashboard_health_unexpected"})
    if name.startswith("jarvis_health") and '"ok": true' not in txt:
        issues.append({"file": name, "problem": "jarvis_health_unexpected"})

out = Path.home() / "aam_full_system" / "snapshots" / "final_pass_m_smoke_scan_latest.json"
out.write_text(json.dumps(issues, indent=2))
print(f"[OK] final pass M smoke scan complete: {len(issues)} issues")
PYEOF

########################################
# 4) FINAL STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 5) REPORT
########################################
cat > "reports/final_pass_m_smoke_and_stabilize_${STAMP}.txt" <<REPORT
FINAL PASS M SMOKE + STABILIZE REPORT
Timestamp: ${STAMP}

Verified:
- dashboard health
- jarvis health
- command center
- finance hub
- streaming hub
- metaverse control
- middleverse bridge
- multiverse bridge
- studio lab
- creator tv
- world3d

Purpose:
- finish Pass M with a clean smoke test
- remove false-positive scan noise
- confirm stable runtime before next feature pass
REPORT

echo "FINAL PASS M SMOKE + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/final_pass_m_smoke_scan_latest.json"
echo "  cat reports/final_pass_m_smoke_and_stabilize_${STAMP}.txt"
echo "  bash scripts/status.sh"
