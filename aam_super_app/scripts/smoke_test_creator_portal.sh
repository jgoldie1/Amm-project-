#!/usr/bin/env bash
set -e
BASE="${1:-http://127.0.0.1:4000}"
STAMP="$(date +%s)"
EMAIL="creator_portal_${STAMP}@aam.local"

echo "== register =="
REG=$(curl -s -X POST "$BASE/auth/register" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"secret123\",\"age\":31,\"role\":\"creator\"}")
echo "$REG"
USER_ID=$(echo "$REG" | sed -n 's/.*"userId":"\([^"]*\)".*/\1/p')

echo "== login =="
LOGIN=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"secret123\"}")
echo "$LOGIN"
TOKEN=$(echo "$LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

echo "== me =="
curl -s "$BASE/me" -H "Authorization: Bearer $TOKEN"; echo

echo "== my wallet =="
curl -s "$BASE/my-wallet" -H "Authorization: Bearer $TOKEN"; echo

echo "== upload track =="
curl -s -X POST "$BASE/music/upload" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"artistId\":\"$USER_ID\",\"title\":\"Creator Portal Song\",\"genre\":\"jazz\",\"rate\":0.05,\"remix\":\"open\"}"; echo

echo "== my tracks =="
curl -s "$BASE/my-tracks" -H "Authorization: Bearer $TOKEN"; echo

echo "== done =="
