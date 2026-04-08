#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== FIX PUBLIC TUNNEL + RECHECK ==="

echo
echo "[1] LOCAL CHECK"
curl -I -s http://127.0.0.1:4900/join/ | head -n 10 ; echo
curl -s http://127.0.0.1:4000/health ; echo

echo
echo "[2] STOP OLD TUNNEL IF ANY"
pkill -f cloudflared 2>/dev/null || true
sleep 2

echo
echo "[3] START NEW TUNNEL"
mkdir -p logs
nohup cloudflared tunnel --url http://127.0.0.1:4900 > logs/cloudflared.log 2>&1 &
sleep 8

echo
echo "[4] EXTRACT NEW PUBLIC URL"
NEW_URL=$(grep -Eo 'https://[-a-z0-9]+\.trycloudflare\.com' logs/cloudflared.log | tail -n 1 || true)
echo "new_url=$NEW_URL"

echo
echo "[5] RECHECK NEW PUBLIC LINK"
if [ -n "$NEW_URL" ]; then
  curl -I -s "$NEW_URL/join/" | head -n 10 ; echo || true
  echo "LIVE LINK:"
  echo "$NEW_URL/join/?ref=all_american_creator"
else
  echo "No new tunnel URL found in logs/cloudflared.log"
fi

echo
echo "[6] FREEZE"
mkdir -p snapshots/final
STAMP=$(date +%Y%m%d_%H%M%S)
cp logs/cloudflared.log snapshots/final/cloudflared_${STAMP}.log 2>/dev/null || true

cat > snapshots/final/public_tunnel_status_${STAMP}.txt <<EOF
checkpoint=$STAMP
new_url=$NEW_URL
local_join=http://127.0.0.1:4900/join/
gateway=http://127.0.0.1:4000/health
EOF

echo
echo "DONE"
echo "checkpoint: $STAMP"
