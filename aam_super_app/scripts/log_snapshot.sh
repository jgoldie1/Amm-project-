#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"
mkdir -p snapshots
STAMP="$(date +%Y%m%d_%H%M%S)"
{
  echo "=== HEALTH ==="
  curl -s http://127.0.0.1:4000/health || true
  echo
  curl -s http://127.0.0.1:4000/health/detail || true
  echo
  echo "=== PROCESS ==="
  ps aux | grep "node gateway/index.js" | grep -v grep || true
  echo
  echo "=== LOG TAIL ==="
  tail -n 100 logs/gateway.log 2>/dev/null || true
  echo
  echo "=== DATA FILES ==="
  ls -lah data 2>/dev/null || true
} > "snapshots/system_snapshot_$STAMP.txt"
echo "Created snapshots/system_snapshot_$STAMP.txt"
