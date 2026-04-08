#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1

PORT=8080
[ -f config/active_port.txt ] && PORT="$(cat config/active_port.txt)"
BASE="http://127.0.0.1:$PORT"

echo "ACTIVE_PORT=$PORT"
echo

if curl -I -s "$BASE/app-home" | head -n 1 | grep -q "200\|302"; then
  echo "APP_RESPONDING=YES"
else
  echo "APP_RESPONDING=NO"
fi

echo
for u in \
  /app-home \
  /heirs-app \
  /full-app-showcase \
  /holoverse-lobby-v2 \
  /holo-commerce-home \
  /founder-command-center
do
  printf "%-28s" "$u"
  curl -I -s "$BASE$u" | head -n 1
done

echo
echo "--- LAST LOG ---"
tail -n 40 logs/app.log 2>/dev/null || true
