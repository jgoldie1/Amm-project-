#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system
if [ -f pids/world_socket.pid ]; then
  PID="$(cat pids/world_socket.pid)"
  kill "$PID" 2>/dev/null || true
  rm -f pids/world_socket.pid
fi
pkill -f "node apps/world_socket.js" 2>/dev/null || true
echo "World socket stopped"
