#!/data/data/com.termux/files/usr/bin/bash
set +e

BASE="http://127.0.0.1:8080"

ROUTES=(
  /
  /platform-home
  /master-dashboard
  /route-map
  /platform-verify
  /profile-safe
  /profile-db-center
  /db-role-preferences
  /db-favorites
  /clickable-map
  /payments-center
  /payment-health
  /jarvis
  /jarvis-plus
  /jarvis-access
  /jarvis-history
  /jarvis-favorites
  /jarvis-home
)

echo "Final Health Check"
echo "Generated: $(date)"
echo

for route in "${ROUTES[@]}"; do
  code="$(curl -I -s "${BASE}${route}" | head -1 | awk '{print $2}')"
  printf "%-32s %s\n" "$route" "${code:-NO_RESPONSE}"
done
