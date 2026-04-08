#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS T FULL PLATFORM STABILIZE + SMOKE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p snapshots reports test_results backups

cp apps/dashboard.js "backups/dashboard_pass_t_${STAMP}.js"
cp db/aam.db "backups/aam_pass_t_${STAMP}.db"

########################################
# 1) CLEAN RESTART
########################################
pkill -f "dashboard.js" 2>/dev/null || true
pkill -f "jarvis" 2>/dev/null || true
sleep 2
rm -f dashboard.pid jarvis.pid

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 6

########################################
# 2) HEALTH
########################################
curl -s http://127.0.0.1:4900/health > test_results/pass_t_dashboard_health_${STAMP}.txt || true
curl -s http://127.0.0.1:5000/health > test_results/pass_t_jarvis_health_${STAMP}.txt || true

########################################
# 3) CORE ROUTE SMOKE
########################################
for route in \
  command-center \
  finance-hub \
  streaming-hub \
  publishing-hub \
  studio-lab \
  creator-tv \
  world3d \
  archive-memory \
  intelligence-hub \
  account-center \
  homepage-showcase
do
  curl -s -i http://127.0.0.1:4900/$route > test_results/pass_t_${route}_${STAMP}.txt || true
done

########################################
# 4) SAFE ACTION SMOKE
########################################
curl -s -i -X POST http://127.0.0.1:4900/account/create-safe > test_results/pass_t_account_create_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/archive/create-safe > test_results/pass_t_archive_create_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/intelligence/provider-safe > test_results/pass_t_intelligence_provider_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/music/royalty-ledger-safe > test_results/pass_t_royalty_ledger_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/creator/star-safe > test_results/pass_t_star_creator_${STAMP}.txt || true

########################################
# 5) SCAN
########################################
python3 <<PY2EOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in root.glob(f"pass_t_*_{stamp}.txt"):
    txt = f.read_text(errors="ignore").lower()
    if "not found" in txt or "cannot get" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt or " 500 " in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

Path.home().joinpath("aam_full_system","snapshots","pass_t_full_platform_smoke_scan_latest.json").write_text(
    json.dumps(issues, indent=2)
)
print("issues:", len(issues))
PY2EOF

########################################
# 6) STATUS
########################################
bash scripts/status.sh || true

########################################
# 7) REPORT
########################################
cat > "reports/pass_t_full_platform_stabilize_smoke_${STAMP}.txt" <<REPORT
PASS T FULL PLATFORM STABILIZE SMOKE REPORT
Timestamp: ${STAMP}

Checked:
- dashboard
- jarvis
- command center
- finance hub
- streaming hub
- publishing hub
- studio lab
- creator tv
- world3d
- archive memory
- intelligence hub
- account center
- homepage showcase

Safe actions:
- account create
- archive create
- intelligence provider create
- royalty ledger create
- star creator create

Purpose:
- confirm broad platform stability
- confirm clean beta-core runtime
REPORT

echo "=== PASS T COMPLETE ==="
echo "Check:"
echo "  cat snapshots/pass_t_full_platform_smoke_scan_latest.json"
echo "  cat reports/pass_t_full_platform_stabilize_smoke_${STAMP}.txt"
echo "  bash scripts/status.sh"
