#!/usr/bin/env bash
set -e
BASE="${1:-http://127.0.0.1:4000}"
ADMIN_TOKEN="${ADMIN_TOKEN:-CHANGE_ME_ADMIN_123}"
STAMP="$(date +%s)"
EMAIL="creator_full_${STAMP}@aam.local"

echo "== health =="
curl -s "$BASE/health"; echo
curl -s "$BASE/health/detail"; echo

echo "== register =="
REG=$(curl -s -X POST "$BASE/auth/register" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"secret123\",\"age\":29,\"role\":\"creator\"}")
echo "$REG"
USER_ID=$(echo "$REG" | sed -n 's/.*"userId":"\([^"]*\)".*/\1/p')

echo "== login =="
LOGIN=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"secret123\"}")
echo "$LOGIN"
TOKEN=$(echo "$LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

echo "== verify =="
curl -s -X POST "$BASE/identity/verify" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d "{\"userId\":\"$USER_ID\"}"; echo

echo "== deposit =="
curl -s -X POST "$BASE/wallet/deposit" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d "{\"userId\":\"$USER_ID\",\"amount\":300}"; echo

echo "== upload track =="
TRACK=$(curl -s -X POST "$BASE/music/upload" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"artistId\":\"$USER_ID\",\"title\":\"Full Test Song\",\"genre\":\"rap\",\"rate\":0.04,\"remix\":\"open\"}")
echo "$TRACK"
TRACK_ID=$(echo "$TRACK" | sed -n 's/.*"trackId":"\([^"]*\)".*/\1/p')

echo "== stream qualified =="
curl -s -X POST "$BASE/music/stream" \
  -H "Content-Type: application/json" \
  -d "{\"trackId\":\"$TRACK_ID\",\"seconds\":45,\"verified\":true,\"repeatCount\":1}"; echo

echo "== stream unqualified =="
curl -s -X POST "$BASE/music/stream" \
  -H "Content-Type: application/json" \
  -d "{\"trackId\":\"$TRACK_ID\",\"seconds\":5,\"verified\":false,\"repeatCount\":99}"; echo

echo "== platform split =="
curl -s -X POST "$BASE/wallet/platform-split" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d "{\"creatorId\":\"$USER_ID\",\"gross\":50,\"platformPct\":30}"; echo

echo "== approve payout =="
curl -s -X POST "$BASE/wallet/approve-payout" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d "{\"userId\":\"$USER_ID\",\"amount\":35}"; echo

echo "== ad impression =="
curl -s -X POST "$BASE/ads/impression" \
  -H "Content-Type: application/json" \
  -d '{"adId":"holo-test-003","placement":"holo-overlay","viewerId":"viewer-test","revenue":3.75}'; echo

echo "== moderation report =="
REPORT=$(curl -s -X POST "$BASE/moderation/report" \
  -H "Content-Type: application/json" \
  -d '{"contentId":"stream-full-001","reason":"nudity","reporter":"viewer-test"}')
echo "$REPORT"
REPORT_ID=$(echo "$REPORT" | sed -n 's/.*"reportId":"\([^"]*\)".*/\1/p')

echo "== report status reviewed =="
curl -s -X POST "$BASE/admin/report-status" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d "{\"id\":\"$REPORT_ID\",\"status\":\"reviewed\"}"; echo

echo "== dmca =="
curl -s -X POST "$BASE/moderation/dmca" \
  -H "Content-Type: application/json" \
  -d '{"claimant":"rights@example.com","contentId":"track-full-001","statement":"copyright owned"}'; echo

echo "== appeal =="
curl -s -X POST "$BASE/moderation/appeal" \
  -H "Content-Type: application/json" \
  -d '{"contentId":"track-full-001","appellant":"artist@example.com","reason":"I own this content"}'; echo

echo "== ai evaluate =="
curl -s -X POST "$BASE/ai/evaluate-stream" \
  -H "Content-Type: application/json" \
  -d '{"nudity":0.4,"hate":0.1,"copyright":0.2}'; echo

echo "== user profile =="
curl -s "$BASE/identity/$USER_ID" \
  -H "Authorization: Bearer $TOKEN"; echo

echo "== wallet =="
curl -s "$BASE/wallet/$USER_ID" \
  -H "Authorization: Bearer $TOKEN"; echo

echo "== admin summaries =="
curl -s "$BASE/admin/users" -H "x-admin-token: $ADMIN_TOKEN"; echo
curl -s "$BASE/admin/wallet-summary" -H "x-admin-token: $ADMIN_TOKEN"; echo
curl -s "$BASE/admin/tracks" -H "x-admin-token: $ADMIN_TOKEN"; echo
curl -s "$BASE/admin/stream-summary" -H "x-admin-token: $ADMIN_TOKEN"; echo
curl -s "$BASE/admin/mod-summary" -H "x-admin-token: $ADMIN_TOKEN"; echo
curl -s "$BASE/admin/reports" -H "x-admin-token: $ADMIN_TOKEN"; echo
curl -s "$BASE/admin/ads-summary" -H "x-admin-token: $ADMIN_TOKEN"; echo

echo "== done =="
