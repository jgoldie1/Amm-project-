#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
PORT=8080
[ -f config/active_port.txt ] && PORT="$(cat config/active_port.txt)"
BASE="http://127.0.0.1:$PORT"

echo "BASE=$BASE"
echo

for u in \
  /operations-center-v2 \
  /live-connections-check \
  /session-login-v2 \
  /session-profile-v2 \
  /service-booking-center \
  /upload-project-linking \
  /artist-release-dashboard \
  /creator-featured-shelves \
  /upload-gallery \
  /search-pro \
  /workflow-runner \
  /finance-sandbox-guard \
  /aame-ecosystem-directory \
  /aame-alton-kevon-hub \
  /alton-kevon-stubbs-heir
do
  CODE="$(curl -s -o /dev/null -w "%{http_code}" "$BASE$u")"
  echo "$CODE  $u"
done

echo
echo "=== LAST LOG ==="
tail -n 60 logs/app.log 2>/dev/null || true
