#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

PROJECT_ROOT="$HOME/marketplace/all-american-marketplace"
cd "$PROJECT_ROOT"

AUTH="http://127.0.0.1:4100"
BOOKING="http://127.0.0.1:4200"
PAYMENT="http://127.0.0.1:4300"
DISPATCH="http://127.0.0.1:4400"
REWARDS="http://127.0.0.1:4500"
MARKETPLACE="http://127.0.0.1:4600"
DRIVER="http://127.0.0.1:4700"
ADMIN="http://127.0.0.1:4800"

PASSWORD="Pass123!"
STAMP=$(date +%s)

RIDER_EMAIL="rider_${STAMP}@example.com"
DRIVER_EMAIL="driver_${STAMP}@example.com"
ADMIN_EMAIL="admin_${STAMP}@example.com"

echo "### 1) Register rider"
RIDER_REGISTER=$(curl -s -X POST "$AUTH/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Flow Rider\",\"email\":\"$RIDER_EMAIL\",\"phone\":\"1112223333\",\"password\":\"$PASSWORD\",\"role\":\"rider\"}")
echo "$RIDER_REGISTER"
echo

echo "### 2) Login rider"
RIDER_LOGIN=$(curl -s -X POST "$AUTH/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RIDER_EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$RIDER_LOGIN"
echo
RIDER_TOKEN=$(echo "$RIDER_LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
if [ -z "$RIDER_TOKEN" ]; then
  echo "Rider login failed"
  exit 1
fi

echo "### 3) Register driver user"
DRIVER_REGISTER=$(curl -s -X POST "$AUTH/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Flow Driver\",\"email\":\"$DRIVER_EMAIL\",\"phone\":\"2223334444\",\"password\":\"$PASSWORD\",\"role\":\"driver\"}")
echo "$DRIVER_REGISTER"
echo

echo "### 4) Login driver user"
DRIVER_LOGIN=$(curl -s -X POST "$AUTH/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$DRIVER_EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$DRIVER_LOGIN"
echo
DRIVER_TOKEN=$(echo "$DRIVER_LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
if [ -z "$DRIVER_TOKEN" ]; then
  echo "Driver login failed"
  exit 1
fi

echo "### 5) Driver applies"
DRIVER_APPLY=$(curl -s -X POST "$DRIVER/drivers/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -d '{"vehicleType":"premium","carModel":"Tesla Model S","licenseNumber":"LIC12345","notes":"premium flow test"}')
echo "$DRIVER_APPLY"
echo
APPLICATION_ID=$(echo "$DRIVER_APPLY" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

echo "### 6) Register admin"
ADMIN_REGISTER=$(curl -s -X POST "$AUTH/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Flow Admin\",\"email\":\"$ADMIN_EMAIL\",\"phone\":\"9998887777\",\"password\":\"$PASSWORD\",\"role\":\"admin\"}")
echo "$ADMIN_REGISTER"
echo

echo "### 7) Login admin"
ADMIN_LOGIN=$(curl -s -X POST "$AUTH/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$ADMIN_LOGIN"
echo
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
if [ -z "$ADMIN_TOKEN" ]; then
  echo "Admin login failed"
  exit 1
fi

echo "### 8) Admin views applications"
curl -s "$DRIVER/drivers/applications" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo
echo

echo "### 9) Admin approves application"
APPROVE_RESULT=$(curl -s -X POST "$DRIVER/drivers/applications/$APPLICATION_ID/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$APPROVE_RESULT"
echo

echo "### 10) Rider creates booking"
BOOKING_CREATE=$(curl -s -X POST "$BOOKING/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RIDER_TOKEN" \
  -d '{
    "type":"ride",
    "serviceLevel":"premium",
    "pickup":"Downtown",
    "dropoff":"Airport",
    "distanceKm":15,
    "notes":"premium dispatch test"
  }')
echo "$BOOKING_CREATE"
echo
BOOKING_ID=$(echo "$BOOKING_CREATE" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

echo "### 11) Admin dispatches booking"
ASSIGN_RESULT=$(curl -s -X POST "$DISPATCH/assign/$BOOKING_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "$ASSIGN_RESULT"
echo

echo "### 12) Rider pays"
PAYMENT_RESULT=$(curl -s -X POST "$PAYMENT/payments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RIDER_TOKEN" \
  -d "{\"bookingId\":$BOOKING_ID,\"amount\":49.99,\"method\":\"card\",\"currency\":\"USD\"}")
echo "$PAYMENT_RESULT"
echo

echo "### 13) Add rewards"
REWARD_RESULT=$(curl -s -X POST "$REWARDS/rewards/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RIDER_TOKEN" \
  -d '{"points":25,"reason":"completed_flow"}')
echo "$REWARD_RESULT"
echo

echo "### 14) Rider applies as seller"
SELLER_APPLY=$(curl -s -X POST "$MARKETPLACE/seller/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RIDER_TOKEN" \
  -d '{"storeName":"Flow Store","subscriptionTier":"premium"}')
echo "$SELLER_APPLY"
echo
SELLER_ID=$(echo "$SELLER_APPLY" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

echo "### 15) Create product"
PRODUCT_CREATE=$(curl -s -X POST "$MARKETPLACE/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RIDER_TOKEN" \
  -d "{\"sellerId\":$SELLER_ID,\"name\":\"Flow Product\",\"price\":19.99,\"category\":\"general\",\"inventory\":10}")
echo "$PRODUCT_CREATE"
echo

echo "### 16) Admin analytics"
curl -s "$ADMIN/analytics" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo
echo

echo "DEEP FLOW COMPLETE"
echo "Rider: $RIDER_EMAIL"
echo "Driver: $DRIVER_EMAIL"
echo "Admin: $ADMIN_EMAIL"
echo "Booking ID: ${BOOKING_ID:-unknown}"
echo "Application ID: ${APPLICATION_ID:-unknown}"
