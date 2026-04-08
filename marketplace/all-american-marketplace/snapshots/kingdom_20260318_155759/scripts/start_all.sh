#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."

mkdir -p .pids logs

start_service() {
  local dir="$1"
  local name="$2"
  echo "Starting $name..."
  (
    cd "$dir"
    nohup npm run dev > "../../logs/${name}.log" 2>&1 &
    echo $! > "../../.pids/${name}.pid"
  )
}

start_service "services/auth-service" "auth-service"
start_service "services/booking-service" "booking-service"
start_service "services/payment-service" "payment-service"
start_service "services/dispatch-service" "dispatch-service"
start_service "services/rewards-service" "rewards-service"
start_service "services/marketplace-service" "marketplace-service"
start_service "services/driver-service" "driver-service"
start_service "services/admin-service" "admin-service"
start_service "services/storehouse-service" "storehouse-service"
start_service "services/finbank-service" "finbank-service"
start_service "services/crossborder-service" "crossborder-service"
start_service "services/university-service" "university-service"
start_service "services/creator-service" "creator-service"

sleep 5

start_service "services/frontend-service" "frontend-service"
start_service "services/api-gateway" "api-gateway"

echo "Core + storehouse + finbank + crossborder + university + creator started."
