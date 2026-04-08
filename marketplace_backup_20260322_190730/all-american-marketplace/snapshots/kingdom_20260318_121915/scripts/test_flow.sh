#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

AUTH="http://127.0.0.1:4100"
BOOKING="http://127.0.0.1:4200"
ADMIN="http://127.0.0.1:4800"

RIDER_EMAIL="rider_$(date +%s)@example.com"
ADMIN_EMAIL="admin_$(date +%s)@example.com"
PASSWORD="Pass123!"

echo "### Register rider"
RIDER_REGISTER=$(curl -s -X POST "$AUTH/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Rider\",\"email\":\"$RIDER_EMAIL\",\"phone\":\"1112223333\",\"password\":\"$PASSWORD\",\"role\":\"rider\"}")
echo "$RIDER_REGISTER"
echo

echo "### Login rider"
RIDER_LOGIN=$(curl -s -X POST "$AUTH/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RIDER_EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$RIDER_LOGIN"
echo

RIDER_TOKEN=$(echo "$RIDER_LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

if [ -z "$RIDER_TOKEN" ]; then
  echo "Rider token missing. Login failed."
  exit 1
fi

echo "### Rider profile"
curl -s "$AUTH/me" \
  -H "Authorization: Bearer $RIDER_TOKEN"
echo
echo

echo "### Create booking"
BOOKING_CREATE=$(curl -s -X POST "$BOOKING/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RIDER_TOKEN" \
  -d '{
    "type":"ride",
    "serviceLevel":"standard",
    "pickup":"Downtown",
    "dropoff":"Airport",
    "distanceKm":12,
    "notes":"test ride"
  }')
echo "$BOOKING_CREATE"
echo

BOOKING_ID=$(echo "$BOOKING_CREATE" | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

echo "### Register admin"
ADMIN_REGISTER=$(curl -s -X POST "$AUTH/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Admin\",\"email\":\"$ADMIN_EMAIL\",\"phone\":\"9998887777\",\"password\":\"$PASSWORD\",\"role\":\"admin\"}")
echo "$ADMIN_REGISTER"
echo

echo "### Login admin"
ADMIN_LOGIN=$(curl -s -X POST "$AUTH/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$ADMIN_LOGIN"
echo

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

if [ -z "$ADMIN_TOKEN" ]; then
  echo "Admin token missing. Login failed."
  exit 1
fi

echo "### Admin analytics"
curl -s "$ADMIN/analytics" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo
echo

echo "### Summary"
echo "Rider email: $RIDER_EMAIL"
echo "Admin email: $ADMIN_EMAIL"
echo "Booking ID: ${BOOKING_ID:-unknown}"
