#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1

ROUTES=(
  /
  /platform-home
  /customer-home
  /creator-home
  /operator-home
  /master-dashboard
  /visual-preview
  /clickable-map
  /living-city-center
  /property-center
  /safety-center
  /oasis-center
  /holoverse-center
  /holoverse-viewer
  /holo-commerce-center
  /performance-center
  /profile-center
  /continuity-center
  /system-registry
  /completion-board
  /platform-summary
  /boot-status
  /boot-logs
  /auth/login
  /auth-login-fallback
)

echo "=== full smoke check ==="
for route in "${ROUTES[@]}"; do
  code="$(curl -I -s "http://127.0.0.1:8080${route}" | head -1 | awk '{print $2}')"
  printf "%-35s %s\n" "$route" "${code:-NO_RESPONSE}"
done
