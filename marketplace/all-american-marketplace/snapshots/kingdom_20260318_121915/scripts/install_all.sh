#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."

for svc in \
  packages/shared \
  services/api-gateway \
  services/auth-service \
  services/booking-service \
  services/payment-service \
  services/dispatch-service \
  services/rewards-service \
  services/marketplace-service \
  services/driver-service \
  services/admin-service \
  services/frontend-service \
  services/storehouse-service \
  services/finbank-service \
  services/crossborder-service \
  services/university-service \
  services/creator-service
do
  echo "Installing $svc"
  (cd "$svc" && npm install)
done

echo "All services installed."
