#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system
echo "=== LIFE WORLD STATUS ==="
curl -s http://127.0.0.1:4902/health || echo "DOWN"
echo
[ -f tmp/life_world.pid ] && echo "life_world.pid: $(cat tmp/life_world.pid)" || echo "life_world.pid: missing"
echo "--- life_world.log ---"
tail -n 10 logs/life_world.log 2>/dev/null || true
