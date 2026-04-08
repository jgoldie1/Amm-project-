#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system
pkill -f "node apps/life_world.js" 2>/dev/null || true
nohup node apps/life_world.js > logs/life_world.log 2>&1 &
echo $! > tmp/life_world.pid
sleep 2
echo "LIFE WORLD STARTED"
echo "http://127.0.0.1:4902"
