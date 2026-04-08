#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system || exit 1

echo "=== FINAL PLATFORM VERIFY ==="
echo

echo "[1] Restart"
bash scripts/safe_restart.sh || exit 1
echo

echo "[2] Status"
bash scripts/status.sh || exit 1
echo

echo "[3] JS syntax"
bash scripts/check_js.sh || exit 1
echo

echo "[4] Smoke test"
bash scripts/smoke_test.sh || exit 1
echo

echo "[5] Life World"
curl -s http://127.0.0.1:4902/health || echo "life world down"
echo
echo

echo "[6] Jarvis"
curl -s http://127.0.0.1:5000/health || echo "jarvis down"
echo
curl -s "http://127.0.0.1:5000/action?action=system_check" || echo "jarvis action failed"
echo
echo

echo "[7] Login + authenticated page checks"
LOGIN_HEADERS=$(mktemp)

curl -s -D "$LOGIN_HEADERS" -o /dev/null -X POST http://127.0.0.1:4900/login \
  -d "username=root&password=root123"

SID=$(grep -i '^Set-Cookie: sid=' "$LOGIN_HEADERS" | head -n 1 | sed 's/Set-Cookie: //I' | cut -d';' -f1)

echo "NFT page:"
curl -s -H "Cookie: $SID" http://127.0.0.1:4900/nft-launchpad | grep -nE "Omnisea Holo NFT Launchpad|Create Collection|Create Holographic NFT|Collections|NFT Assets" || true
echo
echo "Payout page:"
curl -s -H "Cookie: $SID" http://127.0.0.1:4900/creator-payouts | grep -nE "Creator Payout Control|Create / Update Payout Rule|Execute Payout Run|Payout Rules|Payout Runs" || true
echo
echo "Dashboard holo:"
curl -s -H "Cookie: $SID" http://127.0.0.1:4900/ | grep -nE "Holo Command Center|Live Holographic System Grid|Launch Life World|NFT Launchpad|Creator Payouts" || true

rm -f "$LOGIN_HEADERS"
echo

echo "[8] Streaming foundation search"
grep -RniE "streams|streaming|live_stream_channels|stream_status|stream_tip_events|stream_subscriptions|royalty|payout|creator" apps scripts data 2>/dev/null | head -n 120
echo

echo "[9] Dashboard route checks"
grep -nE "pathname === '/streams'|pathname === '/nft-launchpad'|pathname === '/creator-payouts'" apps/dashboard.js || true
echo

echo "FINAL PLATFORM VERIFY COMPLETE"
