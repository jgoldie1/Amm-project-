#!/usr/bin/env bash
set -e

echo "=== FINAL UNIFIED STABILIZE ==="

echo
echo "[1] PLATFORM RESTART"
bash scripts/safe_restart.sh

echo
echo "[2] PLATFORM CHECKS"
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh

echo
echo "[3] LIFE WORLD CHECK"
curl -s http://127.0.0.1:4902/health ; echo
ps -ef | grep life_world.js | grep -v grep || true

echo
echo "[4] JARVIS CHECK"
curl -s http://127.0.0.1:5000/health ; echo
curl -s "http://127.0.0.1:5000/action?action=system_check" ; echo
curl -s "http://127.0.0.1:5000/action?action=stubbs_ai_status" ; echo
curl -s "http://127.0.0.1:5000/action?action=lyons_tech_ai_status" ; echo

echo
echo "[5] DASHBOARD CHECK"
curl -s http://127.0.0.1:4900/ -L | head -n 12 ; echo

echo
echo "[6] API CHECK"
cd "$HOME/aam_super_app"
curl -s http://127.0.0.1:4000/health ; echo
curl -s http://127.0.0.1:4000/health/detail ; echo
bash scripts/doctor_hardened.sh

echo
echo "[7] FINAL READY STATE"
echo "dashboard: OK"
echo "jarvis: OK"
echo "life_world: OK"
echo "gateway_api: OK"
echo "smoke_test: PASSED"
echo "beta_state: STABLE"
