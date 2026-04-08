#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."

mkdir -p data

cat > data/users.json <<'J'
[]
J
cat > data/bookings.json <<'J'
[]
J
cat > data/payments.json <<'J'
[]
J
cat > data/rewards.json <<'J'
[]
J
cat > data/products.json <<'J'
[]
J
cat > data/sellers.json <<'J'
[]
J
cat > data/driver_applications.json <<'J'
[]
J
cat > data/payouts.json <<'J'
[]
J
cat > data/admin_events.json <<'J'
[]
J
cat > data/drivers.json <<'J'
[
  {
    "id": 1,
    "name": "Demo Driver One",
    "email": "driver1@example.com",
    "vehicleType": "standard",
    "status": "available",
    "rating": 4.9
  },
  {
    "id": 2,
    "name": "Demo Driver Black",
    "email": "driverblack@example.com",
    "vehicleType": "premium",
    "status": "available",
    "rating": 5.0
  }
]
J

echo "Data reset complete."
