#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== CLEAN LIFE WORLD ==="
pkill -f "node apps/life_world.js" 2>/dev/null || true
rm -f life_world.pid

echo
echo "=== START LIFE WORLD CLEAN ==="
nohup node apps/life_world.js > life_world.log 2>&1 < /dev/null &
echo $! > life_world.pid
sleep 3

echo
echo "=== VERIFY ==="
echo "life_world.pid: $(cat life_world.pid)"
curl -s --max-time 10 http://127.0.0.1:4902/health ; echo
tail -n 40 life_world.log

echo
echo "=== FULL STACK ==="
bash scripts/status.sh
bash scripts/smoke_test.sh
