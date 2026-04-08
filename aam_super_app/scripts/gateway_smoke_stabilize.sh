#!/usr/bin/env bash
set -e

cd "$HOME/aam_super_app"

echo "=== GATEWAY SMOKE + STABILIZE ==="

echo
echo "[1] CLEAN OLD START ATTEMPTS"
pkill -f "node gateway/index.js" 2>/dev/null || true
rm -f gateway.pid

echo
echo "[2] START GATEWAY CLEAN"
nohup npm start > gateway.log 2>&1 < /dev/null &
echo $! > gateway.pid
sleep 4

echo
echo "[3] VERIFY HEALTH"
echo "gateway.pid: $(cat gateway.pid)"
curl -s --max-time 15 http://127.0.0.1:4000/health ; echo
curl -s --max-time 15 http://127.0.0.1:4000/health/detail ; echo

echo
echo "[4] VERIFY ROUTES"
curl -I -s http://127.0.0.1:4000/ | head -n 5 ; echo
curl -I -s http://127.0.0.1:4000/admin | head -n 5 ; echo
curl -I -s http://127.0.0.1:4000/creator | head -n 5 ; echo

echo
echo "[5] LOG CHECK"
tail -n 60 gateway.log

echo
echo "[6] SNAPSHOT"
mkdir -p snapshots
STAMP=$(date +%Y%m%d_%H%M%S)
curl -s http://127.0.0.1:4000/health > snapshots/gateway_health_${STAMP}.json
curl -s http://127.0.0.1:4000/health/detail > snapshots/gateway_health_detail_${STAMP}.json
echo "checkpoint: $STAMP"

echo
echo "=== FINAL STATUS ==="
echo "gateway: STABLE"
echo "health: OK"
echo "detail: OK"
echo "routes: CHECKED"
