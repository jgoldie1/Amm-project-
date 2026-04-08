#!/usr/bin/env bash
set -e
BASE="${1:-http://127.0.0.1:4000}"
STAMP="$(date +%s)"
EMAIL="creator_intel_${STAMP}@aam.local"

echo "== register =="
REG=$(curl -s -X POST "$BASE/auth/register" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"secret123\",\"age\":32,\"role\":\"creator\"}")
echo "$REG"

echo "== login =="
LOGIN=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"secret123\"}")
echo "$LOGIN"
TOKEN=$(echo "$LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
USER_ID=$(echo "$LOGIN" | sed -n 's/.*"userId":"\([^"]*\)".*/\1/p')

echo "== upload track =="
curl -s -X POST "$BASE/music/upload" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"artistId\":\"$USER_ID\",\"title\":\"Intel Song\",\"genre\":\"rap\",\"rate\":0.04,\"remix\":\"open\"}"; echo

echo "== my transactions =="
curl -s "$BASE/my-transactions" -H "Authorization: Bearer $TOKEN"; echo

echo "== insights =="
curl -s "$BASE/intelligence/my-insights" -H "Authorization: Bearer $TOKEN"; echo

echo "== save note =="
curl -s -X POST "$BASE/intelligence/save-note" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"note":"Push short clips and improve verified listens."}'; echo

echo "== my notes =="
curl -s "$BASE/intelligence/my-notes" -H "Authorization: Bearer $TOKEN"; echo

echo "== done =="
