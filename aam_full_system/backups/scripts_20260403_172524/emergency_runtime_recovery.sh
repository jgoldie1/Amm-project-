#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== EMERGENCY RUNTIME RECOVERY START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p reports snapshots test_results backups pids

cp apps/dashboard.js "backups/dashboard_emergency_${STAMP}.js" 2>/dev/null || true
cp apps/jarvis.js "backups/jarvis_emergency_${STAMP}.js" 2>/dev/null || true
cp db/aam.db "backups/aam_emergency_${STAMP}.db" 2>/dev/null || true

pkill -f "apps/dashboard.js" 2>/dev/null || true
pkill -f "apps/jarvis.js" 2>/dev/null || true
pkill -f "node.*dashboard" 2>/dev/null || true
pkill -f "node.*jarvis" 2>/dev/null || true
sleep 2

rm -f pids/dashboard.pid pids/jarvis.pid dashboard.pid jarvis.pid 2>/dev/null || true

echo "=== PORT CHECK BEFORE RESTART ===" | tee "reports/emergency_runtime_recovery_${STAMP}.txt"
ss -ltnp 2>/dev/null | grep -E ':4900|:5000|:5090' | tee -a "reports/emergency_runtime_recovery_${STAMP}.txt" || true

echo "=== JS CHECK ===" | tee -a "reports/emergency_runtime_recovery_${STAMP}.txt"
bash scripts/check_js.sh | tee -a "reports/emergency_runtime_recovery_${STAMP}.txt"

echo "=== SAFE RESTART ===" | tee -a "reports/emergency_runtime_recovery_${STAMP}.txt"
bash scripts/safe_restart.sh | tee -a "reports/emergency_runtime_recovery_${STAMP}.txt"
sleep 5

echo "=== DIRECT HEALTH TESTS ===" | tee -a "reports/emergency_runtime_recovery_${STAMP}.txt"
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_direct_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_direct_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5090/health > "test_results/socket_health_direct_${STAMP}.txt" || true

echo "--- dashboard /health ---" | tee -a "reports/emergency_runtime_recovery_${STAMP}.txt"
cat "test_results/dashboard_health_direct_${STAMP}.txt" | tee -a "reports/emergency_runtime_recovery_${STAMP}.txt" || true

echo "--- jarvis /health ---" | tee -a "reports/emergency_runtime_recovery_${STAMP}.txt"
cat "test_results/jarvis_health_direct_${STAMP}.txt" | tee -a "reports/emergency_runtime_recovery_${STAMP}.txt" || true

echo "--- socket /health ---" | tee -a "reports/emergency_runtime_recovery_${STAMP}.txt"
cat "test_results/socket_health_direct_${STAMP}.txt" | tee -a "reports/emergency_runtime_recovery_${STAMP}.txt" || true

echo "=== STATUS AFTER RESTART ===" | tee -a "reports/emergency_runtime_recovery_${STAMP}.txt"
bash scripts/status.sh | tee -a "reports/emergency_runtime_recovery_${STAMP}.txt" || true

echo "=== DASHBOARD LOG TAIL ===" | tee -a "reports/emergency_runtime_recovery_${STAMP}.txt"
tail -n 80 dashboard.log 2>/dev/null | tee -a "reports/emergency_runtime_recovery_${STAMP}.txt" || true

echo "=== JARVIS LOG TAIL ===" | tee -a "reports/emergency_runtime_recovery_${STAMP}.txt"
tail -n 80 jarvis.log 2>/dev/null | tee -a "reports/emergency_runtime_recovery_${STAMP}.txt" || true

python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
files = [
    Path.home() / "aam_full_system" / "test_results" / f"dashboard_health_direct_{stamp}.txt",
    Path.home() / "aam_full_system" / "test_results" / f"jarvis_health_direct_{stamp}.txt",
    Path.home() / "aam_full_system" / "test_results" / f"socket_health_direct_{stamp}.txt",
]
issues = []
for f in files:
    if not f.exists():
        issues.append({"file": f.name, "problem": "missing_health_output"})
        continue
    txt = f.read_text(errors="ignore").lower()
    if "500 internal server error" in txt or "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "404" in txt:
        issues.append({"file": f.name, "problem": "http_404"})
    if txt.strip() == "":
        issues.append({"file": f.name, "problem": "empty_response"})
latest = Path.home() / "aam_full_system" / "snapshots" / "emergency_runtime_recovery_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] emergency runtime recovery scan complete: {len(issues)} issues")
PYEOF

echo "EMERGENCY RUNTIME RECOVERY COMPLETE: $STAMP"
echo "Check:"
echo "  cat reports/emergency_runtime_recovery_${STAMP}.txt"
echo "  cat snapshots/emergency_runtime_recovery_scan_latest.json"
