#!/usr/bin/env bash
set -e

cd "$HOME/aam_super_app"

echo "=== GATEWAY STATUS ==="
pwd
ls -la
echo
cat gateway.pid 2>/dev/null || echo "gateway.pid missing"

echo
echo "=== PROCESS CHECK ==="
ps -fp "$(cat gateway.pid 2>/dev/null)" 2>/dev/null || echo "gateway process not running"

echo
echo "=== LOG CHECK ==="
tail -n 120 gateway.log 2>/dev/null || echo "gateway.log missing"

echo
echo "=== HEALTH CHECK DIRECT ==="
curl -s --max-time 10 http://127.0.0.1:4000/health || echo "gateway health down"
echo
curl -s --max-time 10 http://127.0.0.1:4000/health/detail || echo "gateway detail down"
echo

echo "=== PACKAGE CHECK ==="
test -f package.json && echo "package.json: OK" || echo "package.json: MISSING"

echo
echo "=== RESTART GATEWAY CLEAN ==="
if [ -f gateway.pid ]; then
  kill "$(cat gateway.pid)" 2>/dev/null || true
  rm -f gateway.pid
fi

nohup npm start > gateway.log 2>&1 < /dev/null &
echo $! > gateway.pid
sleep 5

echo
echo "=== RECHECK ==="
cat gateway.pid
curl -s --max-time 15 http://127.0.0.1:4000/health || echo "gateway health still down"
echo
curl -s --max-time 15 http://127.0.0.1:4000/health/detail || echo "gateway detail still down"
echo

echo "=== FINAL LOGS ==="
tail -n 120 gateway.log 2>/dev/null || true
