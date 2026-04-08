#!/data/data/com.termux/files/usr/bin/bash
set +e

cd ~/aam_full_system

echo "=== CURRENT PHASE STATUS ==="
echo
echo "--- HEALTH ---"
curl -s http://127.0.0.1:4900/health || echo "dashboard health unavailable"
echo
curl -s http://127.0.0.1:5000/health || echo "jarvis health unavailable"
echo
curl -s http://127.0.0.1:5090/health || echo "socket health unavailable"
echo
echo "--- PID FILES ---"
[ -f dashboard.pid ] && echo "dashboard.pid: $(cat dashboard.pid)" || echo "dashboard.pid missing"
[ -f jarvis.pid ] && echo "jarvis.pid: $(cat jarvis.pid)" || echo "jarvis.pid missing"
echo
echo "--- LOG FILES ---"
ls -l logs/dashboard.log logs/jarvis.log 2>/dev/null || true
echo
echo "--- RECENT DASHBOARD LOG ---"
tail -n 40 logs/dashboard.log 2>/dev/null || echo "no dashboard log yet"
echo
echo "--- RECENT JARVIS LOG ---"
tail -n 40 logs/jarvis.log 2>/dev/null || echo "no jarvis log yet"
