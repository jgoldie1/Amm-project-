#!/usr/bin/env bash
set -e
BASE="${1:-http://127.0.0.1:4000}"
ADMIN_TOKEN="${ADMIN_TOKEN:-CHANGE_ME_ADMIN_123}"
STAMP="$(date +%s)"
EMAIL="creator_auth_${STAMP}@aam.local"

echo "== register =="
REG=$(curl -s -X POST "$BASE/auth/register" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"secret123\",\"age\":27,\"role\":\"creator\"}")
echo "$REG"
USER_ID=$(echo "$REG" | sed -n 's/.*"userId":"\([^"]*\)".*/\1/p')

echo "== login =="
LOGIN=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"secret123\"}")
echo "$LOGIN"
TOKEN=$(echo "$LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

echo "== admin verify =="
curl -s -X POST "$BASE/identity/verify" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d "{\"userId\":\"$USER_ID\"}"; echo

echo "== admin deposit =="
curl -s -X POST "$BASE/wallet/deposit" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d "{\"userId\":\"$USER_ID\",\"amount\":200}"; echo

echo "== platform split =="
curl -s -X POST "$BASE/wallet/platform-split" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d "{\"creatorId\":\"$USER_ID\",\"gross\":20,\"platformPct\":30}"; echo

echo "== approve payout =="
curl -s -X POST "$BASE/wallet/approve-payout" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d "{\"userId\":\"$USER_ID\",\"amount\":14}"; echo

echo "== moderation report =="
REPORT=$(curl -s -X POST "$BASE/moderation/report" -H "Content-Type: application/json" \
  -d '{"contentId":"stream-auth-001","reason":"nudity","reporter":"viewer-auth"}')
echo "$REPORT"
REPORT_ID=$(echo "$REPORT" | sed -n 's/.*"reportId":"\([^"]*\)".*/\1/p')

echo "== admin report status =="
curl -s -X POST "$BASE/admin/report-status" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d "{\"id\":\"$REPORT_ID\",\"status\":\"reviewed\"}"; echo

echo "== get user =="
curl -s "$BASE/identity/$USER_ID" \
  -H "Authorization: Bearer $TOKEN"; echo

echo "== wallet view =="
curl -s "$BASE/wallet/$USER_ID" \
  -H "Authorization: Bearer $TOKEN"; echo

echo "== admin summaries =="
curl -s "$BASE/admin/users" -H "x-admin-token: $ADMIN_TOKEN"; echo
curl -s "$BASE/admin/wallet-summary" -H "x-admin-token: $ADMIN_TOKEN"; echo
curl -s "$BASE/admin/mod-summary" -H "x-admin-token: $ADMIN_TOKEN"; echo
curl -s "$BASE/admin/reports" -H "x-admin-token: $ADMIN_TOKEN"; echo

echo "== done =="
