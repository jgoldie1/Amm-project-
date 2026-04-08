#!/data/data/com.termux/files/usr/bin/bash
set -e
cd ~/aam_full_system

bash scripts/check_js.sh
bash scripts/restart.sh


if [ -f life_world.pid ]; then
  kill "$(cat life_world.pid)" 2>/dev/null || true
  rm -f life_world.pid
fi

nohup node apps/life_world.js > life_world.log 2>&1 & echo $! > life_world.pid
