#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
PORT=8080
[ -f config/active_port.txt ] && PORT="$(cat config/active_port.txt)"
BASE="http://127.0.0.1:$PORT"

{
  echo "=== VERIFY FULL SHOWCASE ==="
  echo "BASE=$BASE"
  echo
  for u in \
    /full-app-showcase \
    /heirs-app \
    /holoverse-lobby-v2 \
    /holo-commerce-home \
    /launch-ops-center-v2 \
    /founder-command-center
  do
    printf "%-35s" "$u"
    curl -I -s "$BASE$u" | head -n 1
  done
  echo
  echo "--- LAST LOG ---"
  tail -n 60 logs/app.log 2>/dev/null || true
} | tee "snapshots/verify_full_showcase_${PORT}.txt"
