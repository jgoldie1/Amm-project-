#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
PORT=8080
[ -f config/active_port.txt ] && PORT="$(cat config/active_port.txt)"
BASE="http://127.0.0.1:$PORT"

echo "BASE=$BASE"
echo

for u in \
  /aame-ecosystem-directory \
  /aame-alton-kevon-hub \
  /streaming-ecosystem-map \
  /api/ecosystem-divisions \
  /api/streaming-ecosystem-links
do
  printf "%-45s" "$u"
  curl -I -s "$BASE$u" | head -n 1
done

echo
echo "=== SAMPLE JSON ==="
curl -s "$BASE/api/ecosystem-divisions"
echo
echo
curl -s "$BASE/api/streaming-ecosystem-links"
echo
