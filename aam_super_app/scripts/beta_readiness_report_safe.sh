#!/usr/bin/env bash
cd "$HOME/aam_super_app" || exit 1

echo "== BETA READINESS REPORT =="

echo
echo "[1] API HEALTH"
curl -s http://127.0.0.1:4000/health ; echo
curl -s http://127.0.0.1:4000/health/detail ; echo

echo
echo "[2] PLATFORM HEALTH"
curl -s http://127.0.0.1:4900/login >/dev/null && echo "dashboard_web: reachable" || echo "dashboard_web: down"
curl -s http://127.0.0.1:5000/health ; echo || true
curl -s http://127.0.0.1:4902/health ; echo || true
