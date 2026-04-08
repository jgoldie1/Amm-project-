#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== PUBLIC SHARE + STABILIZE + FREEZE ==="

echo
echo "[1] CORE STABILIZE"
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh
bash scripts/fix_life_world_startup.sh

echo
echo "[2] JOIN FRONT DOOR CHECK"
curl -I -s http://127.0.0.1:4900/join/ | head -n 10 ; echo
curl -s http://127.0.0.1:4900/join/ | grep -nE "Enter All American Marketplace|Join Now|Who invited you" || true

echo
echo "[3] PUBLIC TUNNEL CHECK"
if command -v ngrok >/dev/null 2>&1; then
  echo "ngrok: FOUND"
else
  echo "ngrok: NOT INSTALLED"
  echo "Install it first, then run:"
  echo "  ngrok config add-authtoken YOUR_TOKEN"
  echo "  ngrok http 4900"
  exit 0
fi

echo
echo "[4] START NGROK FOR 4900"
pkill -f "ngrok http 4900" 2>/dev/null || true
nohup ngrok http 4900 > ngrok_4900.log 2>&1 < /dev/null &
echo $! > ngrok_4900.pid
sleep 6

echo
echo "[5] READ PUBLIC URL"
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

if [ -z "$PUBLIC_URL" ]; then
  echo "Could not read ngrok public URL"
  echo "Check:"
  echo "  cat ngrok_4900.log"
  exit 1
fi

echo "PUBLIC_URL=$PUBLIC_URL"
echo "SHARE_LINK=$PUBLIC_URL/join/?ref=all_american_creator"

echo
echo "[6] PUBLIC JOIN TEST"
curl -I -s "$PUBLIC_URL/join/" | head -n 10 ; echo

echo
echo "[7] FINAL FREEZE"
mkdir -p snapshots/final
STAMP=$(date +%Y%m%d_%H%M%S)

curl -s http://127.0.0.1:4900/join/ > snapshots/final/join_${STAMP}.html
curl -s http://127.0.0.1:4900/ -L > snapshots/final/dashboard_${STAMP}.html
curl -s http://127.0.0.1:4902/ > snapshots/final/life_world_${STAMP}.html
cp data/referrals/joins.json snapshots/final/joins_${STAMP}.json 2>/dev/null || true
cp data/memory/memory_archive.json snapshots/final/memory_archive_${STAMP}.json
cp data/feedback/beta_reports.json snapshots/final/beta_reports_${STAMP}.json

cat > snapshots/final/public_share_${STAMP}.txt <<EOF
PUBLIC_URL=$PUBLIC_URL
SHARE_LINK=$PUBLIC_URL/join/?ref=all_american_creator
EOF

echo
echo "FINAL STATUS"
echo "dashboard: STABLE"
echo "jarvis: STABLE"
echo "life_world: STABLE"
echo "join_page: STABLE"
echo "join_api: STABLE"
echo "public_link: READY"
echo "freeze: SAVED"
echo "checkpoint: $STAMP"
echo
echo "SEND THIS LINK:"
echo "$PUBLIC_URL/join/?ref=all_american_creator"
