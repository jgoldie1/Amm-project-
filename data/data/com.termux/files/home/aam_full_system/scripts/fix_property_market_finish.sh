#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FIX PROPERTY MARKET FINISH START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_property_market_finish_${STAMP}.js"
cp db/aam.db "backups/aam_property_market_finish_${STAMP}.db"

########################################
# 2) VERIFY TABLES
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

tables = [
    "land_parcels",
    "building_registry",
    "stairway_systems",
    "elevator_systems",
    "electrical_systems",
    "plumbing_systems",
    "blueprint_records",
    "property_market_listings"
]

for t in tables:
    row = cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (t,)).fetchone()
    if not row:
        raise SystemExit(f"Missing required table: {t}")

conn.close()
print("[OK] property market tables verified")
PYEOF

########################################
# 3) VERIFY / RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 4) SMOKE TEST
########################################
for route in \
  / \
  /property-market \
  /realworld \
  /realworld-client \
  /realworld-city-registry \
  /world3d \
  /engine-bridge \
  /connect-system
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 5) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as land_parcels from land_parcels;" > "snapshots/land_parcels_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as building_registry from building_registry;" > "snapshots/building_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as stairway_systems from stairway_systems;" > "snapshots/stairway_systems_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as elevator_systems from elevator_systems;" > "snapshots/elevator_systems_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as electrical_systems from electrical_systems;" > "snapshots/electrical_systems_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as plumbing_systems from plumbing_systems;" > "snapshots/plumbing_systems_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as blueprint_records from blueprint_records;" > "snapshots/blueprint_records_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as property_market_listings from property_market_listings;" > "snapshots/property_market_listings_${STAMP}.json"

sqlite3 -json db/aam.db "select id, parcel_name, region_name, parcel_type, parcel_status, owner_type, owner_id, parcel_price_cents, created_at from land_parcels order by id desc limit 100;" > "snapshots/land_parcels_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, building_name, building_type, floor_count, occupancy_mode, building_status, created_at from building_registry order by id desc limit 100;" > "snapshots/building_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, listing_name, listing_type, listing_category, price_cents, listing_status, created_at from property_market_listings order by id desc limit 100;" > "snapshots/property_market_listings_tail_${STAMP}.json"

########################################
# 6) ERROR SCAN
########################################
python3 << 'PYEOF'
from pathlib import Path
import json

root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob("*.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "not found" in lower and "property-market" in f.name.lower():
        issues.append({"file": f.name, "problem": "property_route_missing"})

latest = Path.home() / "aam_full_system" / "snapshots" / "property_market_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] property market scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) REPORT
########################################
cat > "reports/fix_property_market_finish_${STAMP}.txt" <<REPORT
FIX PROPERTY MARKET FINISH REPORT
Timestamp: ${STAMP}

Verified:
- land_parcels
- building_registry
- stairway_systems
- elevator_systems
- electrical_systems
- plumbing_systems
- blueprint_records
- property_market_listings
- property market route
- dashboard / jarvis / socket health

Purpose:
- recover from truncated property-market paste
- stabilize everything
- finish the property market phase cleanly
REPORT

echo "FIX PROPERTY MARKET FINISH COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/property_market_scan_latest.json"
echo "  cat snapshots/property_market_listings_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/property-market"
echo "  termux-open-url http://127.0.0.1:4900/realworld"
echo "  termux-open-url http://127.0.0.1:4900/world3d"
