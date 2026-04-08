#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
PORT=8080
[ -f config/active_port.txt ] && PORT="$(cat config/active_port.txt)"
BASE="http://127.0.0.1:$PORT"

echo "BASE=$BASE"
echo

for u in \
  /alton-kevon-stubbs-heir \
  /alton-stubbs-heir \
  /session-login \
  /session-profile \
  /service-booking-center \
  /upload-project-linking \
  /artist-release-dashboard \
  /creator-featured-shelves \
  /api/service-bookings \
  /api/upload-project-links \
  /api/artist-releases \
  /api/creator-collections-featured
do
  printf "%-45s" "$u"
  curl -I -s "$BASE$u" | head -n 1
done

echo
echo "=== AUTH TEST ==="
curl -I -s "$BASE/alton-compliance" | head -n 1
echo
echo "=== SAMPLE JSON ==="
curl -s "$BASE/api/service-bookings"
echo
