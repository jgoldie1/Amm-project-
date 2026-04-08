#!/usr/bin/env bash
set -e

echo "== BETA READINESS REPORT =="

echo
echo "[1] API HEALTH"
curl -s http://127.0.0.1:4000/health ; echo
curl -s http://127.0.0.1:4000/health/detail ; echo

echo
echo "[2] PLATFORM HEALTH"
curl -s http://127.0.0.1:4900/login >/dev/null && echo "dashboard_web: reachable" || echo "dashboard_web: down"
curl -s http://127.0.0.1:5000/health ; echo
curl -s http://127.0.0.1:4902/health ; echo

echo
echo "[3] PUBLIC ENTRYPOINTS"
for url in \
  "http://127.0.0.1:4900/" \
  "http://127.0.0.1:4900/feed" \
  "http://127.0.0.1:4900/streams" \
  "http://127.0.0.1:4000/" \
  "http://127.0.0.1:4000/creator" \
  "http://127.0.0.1:4000/admin"
do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || true)
  echo "$url -> $code"
done

echo
echo "[4] API CREATOR JOURNEY"
STAMP="$(date +%s)"
EMAIL="beta_${STAMP}@aam.local"

REG=$(curl -s -X POST http://127.0.0.1:4000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"secret123\",\"age\":30,\"role\":\"creator\"}")
echo "$REG"

LOGIN=$(curl -s -X POST http://127.0.0.1:4000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"secret123\"}")
echo "$LOGIN"

TOKEN=$(echo "$LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

echo
echo "upload_track:"
curl -s -X POST http://127.0.0.1:4000/music/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Beta Test Track","genre":"rap","rate":0.04,"remix":"open"}'
echo

echo "my_tracks:"
curl -s http://127.0.0.1:4000/my-tracks \
  -H "Authorization: Bearer $TOKEN"
echo

echo "my_insights:"
curl -s http://127.0.0.1:4000/intelligence/my-insights \
  -H "Authorization: Bearer $TOKEN"
echo

echo "my_wallet:"
curl -s http://127.0.0.1:4000/my-wallet \
  -H "Authorization: Bearer $TOKEN"
echo

echo
echo "[5] ADMIN READINESS"
curl -s http://127.0.0.1:4000/metrics \
  -H "x-admin-token: AAM_ADMIN_2026_PRIVATE_LONG_RANDOM_VALUE"
echo
curl -s http://127.0.0.1:4000/admin/audit-tail \
  -H "x-admin-token: AAM_ADMIN_2026_PRIVATE_LONG_RANDOM_VALUE"
echo

echo
echo "[6] JARVIS ACTIONS"
curl -s "http://127.0.0.1:5000/action?action=system_check" ; echo
curl -s "http://127.0.0.1:5000/action?action=stubbs_ai_status" ; echo
curl -s "http://127.0.0.1:5000/action?action=lyons_tech_ai_status" ; echo

echo
echo "[7] BETA DECISION"
echo "If all sections above return valid JSON/HTML and no crashes:"
echo "STATUS = WORKING BETA READY FOR TESTERS"
