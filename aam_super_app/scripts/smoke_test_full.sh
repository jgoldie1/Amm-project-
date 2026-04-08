#!/usr/bin/env bash
set -e
BASE="${1:-http://127.0.0.1:4000}"

echo "== health =="
curl -s "$BASE/health"; echo
curl -s "$BASE/health/detail"; echo

echo "== signup creator =="
CREATOR=$(curl -s -X POST "$BASE/identity/signup" -H "Content-Type: application/json" \
  -d '{"email":"creator2@aam.local","age":25,"role":"creator"}')
echo "$CREATOR"
CREATOR_ID=$(echo "$CREATOR" | sed -n 's/.*"userId":"\([^"]*\)".*/\1/p')

echo "== verify creator =="
curl -s -X POST "$BASE/identity/verify" -H "Content-Type: application/json" \
  -d "{\"userId\":\"$CREATOR_ID\"}"; echo

echo "== get creator =="
curl -s "$BASE/identity/$CREATOR_ID"; echo

echo "== wallet deposit =="
curl -s -X POST "$BASE/wallet/deposit" -H "Content-Type: application/json" \
  -d "{\"userId\":\"$CREATOR_ID\",\"amount\":125}"; echo

echo "== music upload =="
TRACK=$(curl -s -X POST "$BASE/music/upload" -H "Content-Type: application/json" \
  -d "{\"artistId\":\"$CREATOR_ID\",\"title\":\"Stabilized Song\",\"genre\":\"rap\",\"rate\":0.04,\"remix\":\"open\"}")
echo "$TRACK"
TRACK_ID=$(echo "$TRACK" | sed -n 's/.*"trackId":"\([^"]*\)".*/\1/p')

echo "== qualified stream =="
curl -s -X POST "$BASE/music/stream" -H "Content-Type: application/json" \
  -d "{\"trackId\":\"$TRACK_ID\",\"seconds\":40,\"verified\":true,\"repeatCount\":1}"; echo

echo "== unqualified stream =="
curl -s -X POST "$BASE/music/stream" -H "Content-Type: application/json" \
  -d "{\"trackId\":\"$TRACK_ID\",\"seconds\":10,\"verified\":false,\"repeatCount\":9}"; echo

echo "== platform split =="
curl -s -X POST "$BASE/wallet/platform-split" -H "Content-Type: application/json" \
  -d "{\"creatorId\":\"$CREATOR_ID\",\"gross\":20,\"platformPct\":30}"; echo

echo "== ad impression =="
curl -s -X POST "$BASE/ads/impression" -H "Content-Type: application/json" \
  -d '{"adId":"holo-002","placement":"holo-overlay","viewerId":"viewer-456","revenue":2.50}'; echo

echo "== moderation report =="
curl -s -X POST "$BASE/moderation/report" -H "Content-Type: application/json" \
  -d '{"contentId":"stream-001","reason":"nudity","reporter":"viewer-123"}'; echo

echo "== dmca notice =="
curl -s -X POST "$BASE/moderation/dmca" -H "Content-Type: application/json" \
  -d '{"claimant":"label@example.com","contentId":"track-001","statement":"copyright owned"}'; echo

echo "== appeal =="
curl -s -X POST "$BASE/moderation/appeal" -H "Content-Type: application/json" \
  -d '{"contentId":"track-001","appellant":"artist@example.com","reason":"I own this content"}'; echo

echo "== ai evaluate stream =="
curl -s -X POST "$BASE/ai/evaluate-stream" -H "Content-Type: application/json" \
  -d '{"nudity":0.2,"hate":0.1,"copyright":0.0}'; echo

echo "== admin summaries =="
curl -s "$BASE/admin/users"; echo
curl -s "$BASE/admin/wallet-summary"; echo
curl -s "$BASE/admin/tracks"; echo
curl -s "$BASE/admin/stream-summary"; echo
curl -s "$BASE/admin/mod-summary"; echo
curl -s "$BASE/admin/reports"; echo
curl -s "$BASE/admin/ads-summary"; echo

echo "== full smoke test done =="
