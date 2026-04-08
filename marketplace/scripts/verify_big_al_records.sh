#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
PORT=8080
[ -f config/active_port.txt ] && PORT="$(cat config/active_port.txt)"
BASE="http://127.0.0.1:$PORT"

echo "BASE=$BASE"
echo

for u in \
  /alton-stubbs-heir \
  /big-al-records \
  /big-al-records-command \
  /alton-records \
  /api/big-al-records-artists \
  /api/alton-records-artists \
  /aame-ecosystem-directory \
  /aame-alton-kevon-hub \
  /streaming-ecosystem-map
do
  printf "%-45s" "$u"
  curl -I -s "$BASE$u" | head -n 1
done

echo
echo "=== SAMPLE JSON ==="
curl -s "$BASE/api/big-al-records-artists"
echo
