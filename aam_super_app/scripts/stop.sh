#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete aam-gateway >/dev/null 2>&1 || true
else
  pkill -f "node gateway/index.js" >/dev/null 2>&1 || true
fi
echo "Stopped AAM gateway"
