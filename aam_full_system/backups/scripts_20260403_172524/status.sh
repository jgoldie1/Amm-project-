#!/data/data/com.termux/files/usr/bin/bash
ROOT="$HOME/aam_full_system"
cd "$ROOT"

echo "=== AAM STATUS ==="
echo

printf "Dashboard health: "
curl -s http://127.0.0.1:4900/health || echo "DOWN"
echo

printf "Jarvis health:    "
curl -s http://127.0.0.1:5000/health || echo "DOWN"
echo

echo "=== PID FILES ==="
[ -f tmp/dashboard.pid ] && echo "dashboard.pid: $(cat tmp/dashboard.pid)" || echo "dashboard.pid: missing"
[ -f tmp/jarvis.pid ] && echo "jarvis.pid:    $(cat tmp/jarvis.pid)" || echo "jarvis.pid:    missing"

echo
echo "=== RECENT LOGS ==="
echo "--- dashboard.log ---"
tail -n 10 logs/dashboard.log 2>/dev/null || true
echo
echo "--- jarvis.log ---"
tail -n 10 logs/jarvis.log 2>/dev/null || true
