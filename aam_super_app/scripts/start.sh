#!/usr/bin/env bash
set -e
cd "$HOME/aam_super_app"
mkdir -p logs
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete aam-gateway >/dev/null 2>&1 || true
  pm2 start gateway/index.js --name aam-gateway
  pm2 save
  pm2 status
else
  pkill -f "node gateway/index.js" >/dev/null 2>&1 || true
  nohup node gateway/index.js > logs/gateway.log 2>&1 &
  sleep 2
  echo "Started with nohup. Log: $HOME/aam_super_app/logs/gateway.log"
fi
