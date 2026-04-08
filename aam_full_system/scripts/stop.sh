#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT="$HOME/aam_full_system"
cd "$ROOT"

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

echo "SYSTEM STOPPED"
