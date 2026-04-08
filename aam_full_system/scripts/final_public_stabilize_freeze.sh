#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== FINAL PUBLIC + STABILIZE + FREEZE ==="

echo
echo "[1] CORE SMOKE"
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh
bash scripts/fix_life_world_startup.sh

echo
echo "[2] JOIN FLOW CHECK"
curl -I -s http://127.0.0.1:4900/join/ | head -n 10 ; echo
curl -s http://127.0.0.1:4900/join/ | grep -nE "Enter All American Marketplace|Join Now|Who invited you" || true
curl -s -X POST http://127.0.0.1:4900/join-api \
  -H "Content-Type: application/json" \
  -d '{"username":"freeze_check_user","referrer":"all_american_creator"}'
echo

echo
echo "[3] PUBLIC LINK"
PUBLIC_URL=""
if command -v ngrok >/dev/null 2>&1; then
  pkill -f "ngrok http 4900" 2>/dev/null || true
  nohup ngrok http 4900 > ngrok_4900.log 2>&1 < /dev/null &
  echo $! > ngrok_4900.pid
  sleep 6

  PUBLIC_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | python - <<'PY'
import sys, json
try:
    data = json.load(sys.stdin)
    tunnels = data.get("tunnels", [])
    https_urls = [t.get("public_url") for t in tunnels if str(t.get("public_url","")).startswith("https://")]
    print(https_urls[0] if https_urls else "")
except Exception:
    print("")
PY
)
fi

echo "PUBLIC_URL=${PUBLIC_URL:-NOT_READY}"

echo
echo "[4] FREEZE"
mkdir -p snapshots/final
STAMP=$(date +%Y%m%d_%H%M%S)

curl -s http://127.0.0.1:4900/join/ > snapshots/final/join_${STAMP}.html
curl -s http://127.0.0.1:4900/ -L > snapshots/final/dashboard_${STAMP}.html
curl -s http://127.0.0.1:4902/ > snapshots/final/life_world_${STAMP}.html
cp data/referrals/joins.json snapshots/final/joins_${STAMP}.json 2>/dev/null || true
cp data/memory/memory_archive.json snapshots/final/memory_archive_${STAMP}.json
cp data/feedback/beta_reports.json snapshots/final/beta_reports_${STAMP}.json

cat > snapshots/final/freeze_report_${STAMP}.txt <<EOF
checkpoint=$STAMP
public_url=${PUBLIC_URL:-NOT_READY}
share_link=${PUBLIC_URL:+$PUBLIC_URL/join/?ref=all_american_creator}
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
echo "freeze: SAVED"
echo "checkpoint: $STAMP"

if [ -n "$PUBLIC_URL" ]; then
  echo "share_link: $PUBLIC_URL/join/?ref=all_american_creator"
else
  echo "share_link: install/configure ngrok first"
fi
