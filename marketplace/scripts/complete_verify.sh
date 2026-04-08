#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1

PORT=8080
[ -f config/active_port.txt ] && PORT="$(cat config/active_port.txt)"
BASE="http://127.0.0.1:$PORT"

echo "BASE=$BASE"
echo

echo "=== NEW ROUTE CHECKS ==="
for u in \
  /route-guard-center \
  /upload-gallery \
  /search-pro \
  /workflow-runner \
  /finance-trust-center?role=admin \
  /api/protected-routes \
  /api/finance-guardrails \
  /api/upload-collections \
  /api/workflow-execution-log
do
  printf "%-45s" "$u"
  curl -I -s "$BASE$u" | head -n 1
done

echo
echo "=== SENSITIVE ROUTE CHECKS ==="
for u in \
  /finbank-international \
  /uploads-admin \
  /action-workflow-center \
  /security-compliance-center
do
  GUEST="$(curl -s -o /dev/null -w "%{http_code}" "$BASE$u")"
  ADMIN="$(curl -s -o /dev/null -w "%{http_code}" "$BASE$u?role=admin")"
  echo "$u  guest=$GUEST  admin=$ADMIN"
done

echo
echo "=== LAST LOG ==="
tail -n 60 logs/app.log 2>/dev/null || true
