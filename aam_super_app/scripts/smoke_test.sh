#!/usr/bin/env bash
set -e
BASE="${1:-http://127.0.0.1:4000}"

echo "== health =="
curl -s "$BASE/health"; echo

echo "== signup creator =="
CREATOR=$(curl -s -X POST "$BASE/identity/signup" -H "Content-Type: application/json" \
  -d '{"email":"creator@aam.local","age":25,"role":"creator"}')
echo "$CREATOR"
CREATOR_ID=$(echo "$CREATOR" | sed -n 's/.*"userId":"\([^"]*\)".*/\1/p')

echo "== verify creator =="
curl -s -X POST "$BASE/identity/verify" -H "Content-Type: application/json" \
  -d "{\"userId\":\"$CREATOR_ID\"}"; echo

echo "== wallet deposit =="
curl -s -X POST "$BASE/wallet/deposit" -H "Content-Type: application/json" \
  -d "{\"userId\":\"$CREATOR_ID\",\"amount\":100}"; echo

echo "== music upload =="
TRACK=$(curl -s -X POST "$BASE/music/upload" -H "Content-Type: application/json" \
  -d "{\"artistId\":\"$CREATOR_ID\",\"title\":\"Test Song\",\"genre\":\"rnb\",\"rate\":0.05,\"remix\":\"open\"}")
echo "$TRACK"
TRACK_ID=$(echo "$TRACK" | sed -n 's/.*"trackId":"\([^"]*\)".*/\1/p')

echo "== qualified stream =="
curl -s -X POST "$BASE/music/stream" -H "Content-Type: application/json" \
  -d "{\"trackId\":\"$TRACK_ID\",\"seconds\":45,\"verified\":true,\"repeatCount\":1}"; echo

echo "== platform split =="
curl -s -X POST "$BASE/wallet/platform-split" -H "Content-Type: application/json" \
  -d "{\"creatorId\":\"$CREATOR_ID\",\"gross\":10,\"platformPct\":30}"; echo

echo "== ad impression =="
curl -s -X POST "$BASE/ads/impression" -H "Content-Type: application/json" \
  -d '{"adId":"holo-001","placement":"holo-overlay","viewerId":"viewer-123","revenue":1.25}'; echo

echo "== moderation report =="
curl -s -X POST "$BASE/moderation/report" -H "Content-Type: application/json" \
  -d '{"contentId":"stream-001","reason":"nudity","reporter":"viewer-123"}'; echo

echo "== ai evaluate stream =="
curl -s -X POST "$BASE/ai/evaluate-stream" -H "Content-Type: application/json" \
  -d '{"nudity":0.2,"hate":0.1,"copyright":0.0}'; echo

echo "== done =="
