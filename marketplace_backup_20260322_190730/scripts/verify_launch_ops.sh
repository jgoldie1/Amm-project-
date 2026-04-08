#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
PORT=8080
[ -f config/active_port.txt ] && PORT="$(cat config/active_port.txt)"
BASE="http://127.0.0.1:$PORT"

{
  echo "=== VERIFY LAUNCH OPS ==="
  echo "BASE=$BASE"
  echo
  for u in \
    /heirs-app \
    /heirs-launchpad \
    /launch-ops-center \
    /activity-feed-center \
    /moderation-center \
    /profiles-center \
    /launch-readiness-center \
    /api/invite-tracking-v1 \
    /api/join-tracking-v1 \
    /api/activity-feed-v1 \
    /api/notifications-v1 \
    /api/moderation-queue-v1 \
    /api/profile-cards-v1 \
    /api/launch-readiness-v1
  do
    printf "%-35s" "$u"
    curl -I -s "$BASE$u" | head -n 1
  done
  echo
  echo "--- LAST LOG ---"
  tail -n 60 logs/app.log 2>/dev/null || true
} | tee "snapshots/verify_launch_ops_${PORT}.txt"
