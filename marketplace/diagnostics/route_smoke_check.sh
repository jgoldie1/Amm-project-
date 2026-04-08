#!/data/data/com.termux/files/usr/bin/bash
set +e

BASE="http://127.0.0.1:8080"
REPORT="reports/route_smoke_report.txt"

ROUTES=(
  /
  /platform-home
  /customer-home
  /creator-home
  /operator-home
  /master-dashboard
  /visual-preview
  /route-map
  /platform-verify
  /auth/login
  /profile
  /profile-center
  /profile-db-center
  /db-role-preferences
  /db-favorites
  /payments-center
  /payment-health
  /checkout-preview/holo-product
  /checkout-preview/premium-event
  /checkout-preview/room-booking
  /checkout-payloads
  /live-checkout/holo-product
  /live-checkout/premium-event
  /live-checkout/room-booking
  /live-checkout-attempts
  /boot-status
  /boot-logs
  /system-registry
  /completion-board
  /platform-summary
  /clickable-map
  /living-city-center
  /property-center
  /safety-center
  /oasis-center
  /holoverse-center
  /holoverse-viewer
  /payments-center
)

{
  echo "Route Smoke Report"
  echo "Generated: $(date)"
  echo
  for route in "${ROUTES[@]}"; do
    code="$(curl -I -s "${BASE}${route}" | head -1 | awk '{print $2}')"
    printf "%-38s %s\n" "$route" "${code:-NO_RESPONSE}"
  done
} > "$REPORT"

cat "$REPORT"
