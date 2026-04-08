#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."
if [ -f logs/game.pid ]; then
  PID="$(cat logs/game.pid)"
  kill "$PID" 2>/dev/null || true
  rm -f logs/game.pid
  echo "[ok] game stopped"
else
  echo "[info] no pid file found"
fi
