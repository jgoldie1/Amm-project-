#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
PORT=8080
[ -f config/active_port.txt ] && PORT="$(cat config/active_port.txt)"
BASE="http://127.0.0.1:$PORT"

echo "BASE=$BASE"
echo

for u in \
  /alton-stubbs-heir \
  /alton-security-command \
  /alton-security-live?role=operator \
  /alton-compliance?role=operator \
  /alton-records \
  /kevon-shotit-studio \
  /kevon-shotit-live \
  /kevon-film-studio \
  /kevon-forex-stock-ai \
  /business-intake-center \
  /api/heir-profiles \
  /api/alton-compliance-records \
  /api/alton-records-artists \
  /api/kevon-film-projects \
  /api/kevon-trading-assets \
  /api/business-intake-requests
do
  printf "%-45s" "$u"
  curl -I -s "$BASE$u" | head -n 1
done

echo
echo "=== SAMPLE JSON ==="
curl -s "$BASE/api/heir-profiles"
echo
echo
curl -s "$BASE/api/kevon-trading-assets"
echo
