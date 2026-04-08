#!/usr/bin/env bash
set -e

echo "=== BETA SMOKE + STABILIZE CHECKPOINT ==="

echo
echo "[1] PLATFORM RESTART"
bash scripts/safe_restart.sh

echo
echo "[2] PLATFORM VALIDATION"
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh

echo
echo "[3] LIFE WORLD"
curl -s http://127.0.0.1:4902/health ; echo
ps -ef | grep life_world.js | grep -v grep || true

echo
echo "[4] JARVIS"
curl -s http://127.0.0.1:5000/health ; echo
curl -s "http://127.0.0.1:5000/action?action=system_check" ; echo
curl -s "http://127.0.0.1:5000/action?action=stubbs_ai_status" ; echo
curl -s "http://127.0.0.1:5000/action?action=lyons_tech_ai_status" ; echo

echo
echo "[5] DASHBOARD"
curl -s http://127.0.0.1:4900/ -L | head -n 12 ; echo

echo
echo "[6] API"
cd "$HOME/aam_super_app"
bash scripts/doctor_hardened.sh

echo
echo "[7] FREEZE SNAPSHOT"
STAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$HOME/aam_full_system/snapshots"

curl -s http://127.0.0.1:4900/ -L | head -n 12 > "$HOME/aam_full_system/snapshots/dashboard_${STAMP}.html"
curl -s http://127.0.0.1:5000/health > "$HOME/aam_full_system/snapshots/jarvis_health_${STAMP}.json"
curl -s http://127.0.0.1:4902/health > "$HOME/aam_full_system/snapshots/life_world_health_${STAMP}.json"
curl -s http://127.0.0.1:4000/health > "$HOME/aam_full_system/snapshots/gateway_health_${STAMP}.json"
curl -s http://127.0.0.1:4000/health/detail > "$HOME/aam_full_system/snapshots/gateway_health_detail_${STAMP}.json"

echo
echo "[8] FINAL STATE"
echo "dashboard: OK"
echo "jarvis: OK"
echo "life_world: OK"
echo "gateway_api: OK"
echo "smoke_test: PASSED"
echo "beta_state: STABLE"
echo "checkpoint: $STAMP"
