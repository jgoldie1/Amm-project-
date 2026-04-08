#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT="$HOME/aam_full_system"
cd "$ROOT"
mkdir -p logs tmp

# Stop old processes safely
if [ -f tmp/dashboard.pid ]; then
  kill "$(cat tmp/dashboard.pid)" 2>/dev/null || true
  rm -f tmp/dashboard.pid
fi

if [ -f tmp/jarvis.pid ]; then
  kill "$(cat tmp/jarvis.pid)" 2>/dev/null || true
  rm -f tmp/jarvis.pid
fi

pkill -f "node apps/dashboard.js" 2>/dev/null || true
pkill -f "node apps/jarvis.js" 2>/dev/null || true

# Start services
nohup node apps/dashboard.js > logs/dashboard.log 2>&1 &
echo $! > tmp/dashboard.pid

nohup node apps/jarvis.js > logs/jarvis.log 2>&1 &
echo $! > tmp/jarvis.pid

sleep 2

echo "SYSTEM STARTED"
echo "Dashboard PID: $(cat tmp/dashboard.pid)"
echo "Jarvis PID:    $(cat tmp/jarvis.pid)"
echo "Dashboard:     http://127.0.0.1:4900"
echo "Jarvis:        http://127.0.0.1:5000"
