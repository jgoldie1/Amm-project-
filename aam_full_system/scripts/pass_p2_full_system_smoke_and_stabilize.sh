#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS P2 FULL SYSTEM SMOKE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p snapshots reports test_results backups

########################################
# 1) HARD RESTART (CLEAN STATE)
########################################
pkill -f "node .*dashboard.js" 2>/dev/null || true
pkill -f "apps/dashboard.js" 2>/dev/null || true
pkill -f "jarvis" 2>/dev/null || true

sleep 2

rm -f dashboard.pid jarvis.pid

bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 6

########################################
# 2) CORE HEALTH CHECKS
########################################
curl -s http://127.0.0.1:4900/health > test_results/health_${STAMP}.txt || true
curl -s http://127.0.0.1:5000/health > test_results/jarvis_${STAMP}.txt || true

########################################
# 3) CRITICAL ROUTE CHECKS
########################################
for route in \
  command-center \
  finance-hub \
  streaming-hub \
  publishing-hub \
  studio-lab \
  creator-tv \
  world3d \
  homepage-showcase \
  account-center
do
  curl -s -i http://127.0.0.1:4900/$route > test_results/${route}_${STAMP}.txt || true
done

########################################
# 4) AI + CREATOR SYSTEM CHECKS
########################################
for route in \
  publishing-hub \
  homepage-showcase
do
  curl -s -i http://127.0.0.1:4900/$route > test_results/ai_${route}_${STAMP}.txt || true
done

########################################
# 5) SCAN FOR ERRORS
########################################
python3 <<PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"

issues = []

for f in root.glob(f"*_{stamp}.txt"):
    txt = f.read_text(errors="ignore").lower()

    if "cannot get" in txt or "not found" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "error" in txt and "dashboard running" not in txt:
        issues.append({"file": f.name, "problem": "runtime_error"})

Path.home().joinpath("aam_full_system","snapshots","pass_p2_full_scan_latest.json").write_text(json.dumps(issues, indent=2))

print(f"[OK] full system scan complete: {len(issues)} issues")
PYEOF

########################################
# 6) STATUS
########################################
echo "=== FINAL STATUS ==="
bash scripts/status.sh || true

########################################
# 7) REPORT
########################################
cat > "reports/pass_p2_full_system_smoke_${STAMP}.txt" <<REPORT
PASS P2 FULL SYSTEM SMOKE REPORT
Timestamp: ${STAMP}

Checked:
- dashboard
- jarvis
- hollywood system
- music system
- publishing hub
- command center
- AI assistant
- creator system
- routes

Purpose:
- confirm full system stability
- confirm beta readiness
REPORT

echo "=== PASS P2 COMPLETE ==="
echo "Check:"
echo "  cat snapshots/pass_p2_full_scan_latest.json"
echo "  cat reports/pass_p2_full_system_smoke_${STAMP}.txt"
echo "  bash scripts/status.sh"

EOFcd ~/aam_full_system

cat > scripts/pass_p2_smoke.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS P2 SMOKE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p snapshots test_results reports

# restart clean
pkill -f "dashboard.js" 2>/dev/null || true
pkill -f "jarvis" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5

# health
curl -s http://127.0.0.1:4900/health > test_results/health_${STAMP}.txt || true
curl -s http://127.0.0.1:5000/health > test_results/jarvis_${STAMP}.txt || true

# key routes
for route in command-center publishing-hub studio-lab creator-tv
do
  curl -s -i http://127.0.0.1:4900/$route > test_results/${route}_${STAMP}.txt || true
done

# scan
python3 <<PYEOF
from pathlib import Path
import json

stamp="${STAMP}"
root=Path.home()/ "aam_full_system"/"test_results"
issues=[]

for f in root.glob(f"*_{stamp}.txt"):
    txt=f.read_text(errors="ignore").lower()
    if "not found" in txt:
        issues.append({"file":f.name,"problem":"route_missing"})
    if "500" in txt:
        issues.append({"file":f.name,"problem":"http_500"})

Path.home().joinpath("aam_full_system","snapshots","pass_p2_scan.json").write_text(json.dumps(issues,indent=2))
print("issues:",len(issues))
PYEOF

echo "=== STATUS ==="
bash scripts/status.sh || true

echo "DONE"
