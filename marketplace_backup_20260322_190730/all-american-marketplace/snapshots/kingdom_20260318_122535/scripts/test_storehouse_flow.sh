#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

AUTH="http://127.0.0.1:4100"
STOREHOUSE="http://127.0.0.1:5000"

STAMP=$(date +%s)
ADMIN_EMAIL="storeadmin_${STAMP}@example.com"
PASSWORD="Pass123!"

echo "### Register admin"
ADMIN_REGISTER=$(curl -s -X POST "$AUTH/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Store Admin\",\"email\":\"$ADMIN_EMAIL\",\"phone\":\"9998887777\",\"password\":\"$PASSWORD\",\"role\":\"admin\"}")
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
  echo "Admin token missing"
  exit 1
fi

echo "### Create store item"
curl -s -X POST "$STOREHOUSE/storehouse/items" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"kind":"store","name":"Yahavah Oil","price":12.99,"inventory":25,"format":"physical","description":"store item","category":"anointing"}'
echo
echo

echo "### Create grocery item"
curl -s -X POST "$STOREHOUSE/storehouse/items" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"kind":"grocery","name":"Kingdom Rice","price":6.49,"inventory":40,"format":"physical","description":"grocery item","category":"food"}'
echo
echo

echo "### Create book item"
curl -s -X POST "$STOREHOUSE/storehouse/items" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"kind":"book","name":"Kingdom Book Volume 1","price":19.99,"inventory":10,"format":"paperback","description":"book item","author":"James Stubbs","category":"book"}'
echo
echo

echo "### Load storehouse"
curl -s "$STOREHOUSE/storehouse/items"
echo
