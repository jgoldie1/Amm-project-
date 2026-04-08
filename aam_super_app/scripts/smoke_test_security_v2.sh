#!/usr/bin/env bash
set -e
BASE="${1:-http://127.0.0.1:4000}"
STAMP="$(date +%s)"
EMAIL1="secure_a_${STAMP}@aam.local"
EMAIL2="secure_b_${STAMP}@aam.local"

REG1=$(curl -s -X POST "$BASE/auth/register" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL1\",\"password\":\"secret123\",\"age\":30,\"role\":\"creator\"}")
USER1=$(echo "$REG1" | sed -n 's/.*"userId":"\([^"]*\)".*/\1/p')

REG2=$(curl -s -X POST "$BASE/auth/register" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL2\",\"password\":\"secret123\",\"age\":30,\"role\":\"creator\"}")
USER2=$(echo "$REG2" | sed -n 's/.*"userId":"\([^"]*\)".*/\1/p')

LOGIN1=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL1\",\"password\":\"secret123\"}")
TOKEN1=$(echo "$LOGIN1" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

echo "== self profile ok =="
curl -s "$BASE/identity/$USER1" -H "Authorization: Bearer $TOKEN1"; echo

echo "== other profile forbidden =="
curl -s "$BASE/identity/$USER2" -H "Authorization: Bearer $TOKEN1"; echo

echo "== self wallet ok =="
curl -s "$BASE/wallet/$USER1" -H "Authorization: Bearer $TOKEN1"; echo

echo "== other wallet forbidden =="
curl -s "$BASE/wallet/$USER2" -H "Authorization: Bearer $TOKEN1"; echo

echo "== empty note rejected =="
curl -s -X POST "$BASE/intelligence/save-note" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{"note":""}'; echo

echo "== done =="
