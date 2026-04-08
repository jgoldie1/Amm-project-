#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."
mkdir -p logs
if [ ! -d node_modules ]; then
  echo "[setup] installing dependencies..."
  npm install
fi
PORT_VALUE="${PORT:-5090}"
HOST_VALUE="${HOST:-0.0.0.0}"
PORT="${PORT_VALUE}" HOST="${HOST_VALUE}" nohup npm start > logs/game.log 2>&1 &
echo $! > logs/game.pid
echo "[ok] game started on port ${PORT_VALUE}"
echo "[ok] logs: $(pwd)/logs/game.log"
