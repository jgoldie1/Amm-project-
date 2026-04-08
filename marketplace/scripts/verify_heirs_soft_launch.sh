#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
PORT=8080
[ -f config/active_port.txt ] && PORT="$(cat config/active_port.txt)"
BASE="http://127.0.0.1:$PORT"

{
  echo "=== VERIFY HEIRS SOFT LAUNCH ==="
  echo "BASE=$BASE"
  echo
  for u in \
    /heirs-app \
    /heirs-launchpad \
    /heirs-access-info \
    /session-login-v4 \
    /session-profile-v4 \
    /files-center-v4 \
    /bookings-center-v4 \
    /creator-market \
    /api/heirs-directory-v1 \
    /api/announcements-v1 \
    /api/soft-launch-checklist-v1
  do
    printf "%-35s" "$u"
    curl -I -s "$BASE$u" | head -n 1
  done
  echo
  echo "--- LOGIN TEST ---"
  curl -s -c /tmp/heirs_launch.cookies -b /tmp/heirs_launch.cookies -L \
    -d "email=admin@aame.local&password=admin123" \
    "$BASE/session-login-v4" >/tmp/heirs_login.html
  curl -I -s -b /tmp/heirs_launch.cookies "$BASE/session-profile-v4" | head -n 1
  curl -I -s -b /tmp/heirs_launch.cookies "$BASE/heirs-admin-console" | head -n 1
  echo
  echo "--- LAST LOG ---"
  tail -n 60 logs/app.log 2>/dev/null || true
} | tee "snapshots/verify_heirs_soft_launch_${PORT}.txt"
