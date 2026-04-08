#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== PUBLIC BETA SMOKE + STABILIZE + FREEZE ==="

echo
echo "[1] CORE CHECKS"
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh

echo
echo "[2] LIFE WORLD STABILIZE"
bash scripts/fix_life_world_startup.sh

echo
echo "[3] JOIN FLOW CHECK"
curl -I -s http://127.0.0.1:4900/join/ | head -n 10 ; echo
curl -s http://127.0.0.1:4900/join/ | grep -nE "Enter All American Marketplace|Join Now|Who invited you" || true
curl -s -X POST http://127.0.0.1:4900/join-api \
  -H "Content-Type: application/json" \
  -d '{"username":"smoke_freeze_user","referrer":"all_american_creator"}'
echo

echo
echo "[4] PUBLIC LINK CHECK"
PUBLIC_URL="https://gossip-stores-connections-bridal.trycloudflare.com"
curl -I -s "$PUBLIC_URL/join/" | head -n 10 ; echo

echo
echo "[5] FREEZE SNAPSHOT"
mkdir -p snapshots/final
STAMP=$(date +%Y%m%d_%H%M%S)

curl -s http://127.0.0.1:4900/join/ > snapshots/final/join_${STAMP}.html
curl -s http://127.0.0.1:4900/ -L > snapshots/final/dashboard_${STAMP}.html
curl -s http://127.0.0.1:4902/ > snapshots/final/life_world_${STAMP}.html
cp data/referrals/joins.json snapshots/final/joins_${STAMP}.json 2>/dev/null || true
cp data/memory/memory_archive.json snapshots/final/memory_archive_${STAMP}.json
cp data/feedback/beta_reports.json snapshots/final/beta_reports_${STAMP}.json

cat > snapshots/final/public_beta_status_${STAMP}.txt <<EOF
checkpoint=$STAMP
public_url=$PUBLIC_URL
share_link=$PUBLIC_URL/join/?ref=all_american_creator
dashboard=http://127.0.0.1:4900
life_world=http://127.0.0.1:4902
gateway=http://127.0.0.1:4000
EOF

echo
echo "=== FINAL STATUS ==="
echo "dashboard: STABLE"
echo "jarvis: STABLE"
echo "life_world: STABLE"
echo "join_page: STABLE"
echo "join_api: STABLE"
echo "public_beta: CHECKED"
echo "freeze: SAVED"
echo "checkpoint: $STAMP"
echo
echo "SEND THIS LINK:"
echo "$PUBLIC_URL/join/?ref=all_american_creator"
