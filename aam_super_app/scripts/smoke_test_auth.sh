#!/usr/bin/env bash
set -e
BASE="${1:-http://127.0.0.1:4000}"
ADMIN_TOKEN="${ADMIN_TOKEN:-CHANGE_ME_ADMIN_123}"

echo "== register =="
REG=$(curl -s -X POST "$BASE/auth/register" -H "Content-Type: application/json" \
  -d '{"email":"creator_auth@aam.local","password":"secret123","age":27,"role":"creator"}')
echo "$REG"
USER_ID=$(echo "$REG" | sed -n 's/.*"userId":"\([^"]*\)".*/\1/p')

echo "== login =="
LOGIN=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"creator_auth@aam.local","password":"secret123"}')
echo "$LOGIN"
TOKEN=$(echo "$LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

echo "== admin verify =="
curl -s -X POST "$BASE/identity/verify" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d "{\"userId\":\"$USER_ID\"}"; echo

echo "== get user =="
curl -s "$BASE/identity/$USER_ID" \
  -H "Authorization: Bearer $TOKEN"; echo

echo "== admin deposit =="
curl -s -X POST "$BASE/wallet/deposit" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d "{\"userId\":\"$USER_ID\",\"amount\":200}"; echo

echo "== wallet view =="
curl -s "$BASE/wallet/$USER_ID" \
  -H "Authorization: Bearer $TOKEN"; echo

echo "== done =="
