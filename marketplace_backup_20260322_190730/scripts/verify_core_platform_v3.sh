#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
PORT=8080
[ -f config/active_port.txt ] && PORT="$(cat config/active_port.txt)"
BASE="http://127.0.0.1:$PORT"

echo "BASE=$BASE"
echo

for u in \
  /session-login-v3 \
  /session-profile-v3 \
  /finance-operations-center-v3 \
  /files-operations-center-v3 \
  /workflows-center-v3 \
  /stabilize-hub-v3 \
  /api/sandbox-accounts \
  /api/sandbox-transactions \
  /api/workflow-jobs-v2 \
  /api/app-health-registry
do
  printf "%-45s" "$u"
  curl -I -s "$BASE$u" | head -n 1
done

echo
echo "=== LOGIN TEST ==="
curl -s -c /tmp/aamev3.cookies -b /tmp/aamev3.cookies -L \
  -d "email=admin@aame.local&password=admin123" \
  "$BASE/session-login-v3" >/tmp/aamev3_login.html
curl -I -s -b /tmp/aamev3.cookies "$BASE/session-profile-v3" | head -n 1
curl -I -s -b /tmp/aamev3.cookies "$BASE/stabilize-hub-v3" | head -n 1
curl -I -s -b /tmp/aamev3.cookies "$BASE/finance-operations-center-v3" | head -n 1

echo
echo "=== LAST LOG ==="
tail -n 60 logs/app.log 2>/dev/null || true
