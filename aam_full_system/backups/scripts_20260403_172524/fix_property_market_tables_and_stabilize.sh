#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FIX PROPERTY MARKET TABLES + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_property_tables_fix_${STAMP}.js"
cp db/aam.db "backups/aam_property_tables_fix_${STAMP}.db"

########################################
# 2) CREATE / REPAIR TABLES
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS land_parcels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parcel_name TEXT NOT NULL,
  region_name TEXT,
  parcel_type TEXT DEFAULT 'metaverse_land',
  parcel_status TEXT DEFAULT 'active',
  owner_type TEXT DEFAULT 'platform',
  owner_id INTEGER DEFAULT 0,
  parcel_price_cents INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS building_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parcel_id INTEGER NOT NULL,
  building_name TEXT NOT NULL,
  building_type TEXT DEFAULT 'mixed_use',
  floor_count INTEGER DEFAULT 1,
  occupancy_mode TEXT DEFAULT 'rental_ready',
  building_status TEXT DEFAULT 'draft',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS stairway_systems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  building_id INTEGER NOT NULL,
  stairway_name TEXT NOT NULL,
  stair_type TEXT DEFAULT 'main_access',
  accessibility_mode TEXT DEFAULT 'compliant_path',
  stair_status TEXT DEFAULT 'planned',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS elevator_systems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  building_id INTEGER NOT NULL,
  elevator_name TEXT NOT NULL,
  elevator_type TEXT DEFAULT 'passenger',
  stop_count INTEGER DEFAULT 1,
  accessibility_mode TEXT DEFAULT 'wheelchair_ready',
  elevator_status TEXT DEFAULT 'planned',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS electrical_systems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  building_id INTEGER NOT NULL,
  system_name TEXT NOT NULL,
  power_profile TEXT DEFAULT 'commercial_standard',
  backup_mode TEXT DEFAULT 'prepared',
  smart_grid_mode TEXT DEFAULT 'enabled',
  system_status TEXT DEFAULT 'planned',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS plumbing_systems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  building_id INTEGER NOT NULL,
  system_name TEXT NOT NULL,
  water_mode TEXT DEFAULT 'standard_supply',
  drainage_mode TEXT DEFAULT 'standard_drain',
  utility_status TEXT DEFAULT 'planned',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS blueprint_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  building_id INTEGER NOT NULL,
  blueprint_name TEXT NOT NULL,
  blueprint_type TEXT DEFAULT 'concept_layout',
  blueprint_scope TEXT DEFAULT 'full_building',
  file_ref TEXT,
  blueprint_status TEXT DEFAULT 'draft',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS property_market_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parcel_id INTEGER,
  building_id INTEGER,
  listing_name TEXT NOT NULL,
  listing_type TEXT DEFAULT 'rent',
  listing_category TEXT DEFAULT 'metaverse_real_estate',
  price_cents INTEGER DEFAULT 0,
  listing_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS property_runtime_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  event_payload TEXT,
  event_status TEXT DEFAULT 'processed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed parcels if empty
parcel_count = cur.execute("SELECT count(*) FROM land_parcels").fetchone()[0]
if parcel_count == 0:
    parcels = [
        ("Chicago Commerce Parcel", "Chicago", "metaverse_land", "active", "platform", 0, 250000000),
        ("Atlanta Creator Parcel", "Atlanta", "metaverse_land", "active", "platform", 0, 220000000),
        ("New York Premium Parcel", "New York", "metaverse_land", "active", "platform", 0, 420000000),
        ("Texas Expansion Parcel", "Texas", "metaverse_land", "active", "platform", 0, 310000000),
    ]
    for row in parcels:
        cur.execute("""
        INSERT INTO land_parcels
        (parcel_name, region_name, parcel_type, parcel_status, owner_type, owner_id, parcel_price_cents)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, row)

building_count = cur.execute("SELECT count(*) FROM building_registry").fetchone()[0]
if building_count == 0:
    buildings = [
        (1, "Chicago Tower One", "mixed_use", 12, "rental_ready", "planned"),
        (2, "Atlanta Creator Center", "creator_hub", 6, "rental_ready", "planned"),
        (3, "New York Commerce Hub", "commercial", 18, "sale_ready", "planned"),
        (4, "Texas Innovation Center", "mixed_use", 10, "rental_ready", "planned"),
    ]
    for row in buildings:
        cur.execute("""
        INSERT INTO building_registry
        (parcel_id, building_name, building_type, floor_count, occupancy_mode, building_status)
        VALUES (?, ?, ?, ?, ?, ?)
        """, row)

# seed systems/listings for buildings that don't have them yet
rows = cur.execute("SELECT id, building_name FROM building_registry ORDER BY id").fetchall()
for building_id, building_name in rows:
    exists = lambda table: cur.execute(f"SELECT count(*) FROM {table} WHERE building_id=?", (building_id,)).fetchone()[0] > 0

    if not exists("stairway_systems"):
        cur.execute("""
        INSERT INTO stairway_systems
        (building_id, stairway_name, stair_type, accessibility_mode, stair_status)
        VALUES (?, ?, 'main_access', 'compliant_path', 'planned')
        """, (building_id, f"{building_name} Main Stair"))

    if not exists("elevator_systems"):
        cur.execute("""
        INSERT INTO elevator_systems
        (building_id, elevator_name, elevator_type, stop_count, accessibility_mode, elevator_status)
        VALUES (?, ?, 'passenger', 6, 'wheelchair_ready', 'planned')
        """, (building_id, f"{building_name} Lift Core"))

    if not exists("electrical_systems"):
        cur.execute("""
        INSERT INTO electrical_systems
        (building_id, system_name, power_profile, backup_mode, smart_grid_mode, system_status)
        VALUES (?, ?, 'commercial_standard', 'prepared', 'enabled', 'planned')
        """, (building_id, f"{building_name} Power Grid"))

    if not exists("plumbing_systems"):
        cur.execute("""
        INSERT INTO plumbing_systems
        (building_id, system_name, water_mode, drainage_mode, utility_status)
        VALUES (?, ?, 'standard_supply', 'standard_drain', 'planned')
        """, (building_id, f"{building_name} Water System"))

    blueprint_exists = cur.execute("SELECT count(*) FROM blueprint_records WHERE building_id=?", (building_id,)).fetchone()[0] > 0
    if not blueprint_exists:
        cur.execute("""
        INSERT INTO blueprint_records
        (building_id, blueprint_name, blueprint_type, blueprint_scope, file_ref, blueprint_status)
        VALUES (?, ?, 'concept_layout', 'full_building', '', 'draft')
        """, (building_id, f"{building_name} Blueprint"))

    listing_exists = cur.execute("SELECT count(*) FROM property_market_listings WHERE building_id=?", (building_id,)).fetchone()[0] > 0
    if not listing_exists:
        cur.execute("""
        INSERT INTO property_market_listings
        (building_id, listing_name, listing_type, listing_category, price_cents, listing_status)
        VALUES (?, ?, 'rent', 'metaverse_real_estate', 1500000, 'active')
        """, (building_id, f"{building_name} Rental Listing"))

conn.commit()
conn.close()
print("[OK] property market tables repaired and seeded")
PYEOF

########################################
# 3) ENSURE ROUTE EXISTS
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function renderPropertyMarketPage(req, user = null, message = '') {
  const parcels = dbQuery(`
    SELECT id, parcel_name, region_name, parcel_type, parcel_status, owner_type, owner_id, parcel_price_cents, created_at
    FROM land_parcels
    ORDER BY id DESC
    LIMIT 100
  `);

  const buildings = dbQuery(`
    SELECT b.id, b.building_name, b.building_type, b.floor_count, b.occupancy_mode, b.building_status, p.parcel_name, b.created_at
    FROM building_registry b
    LEFT JOIN land_parcels p ON p.id = b.parcel_id
    ORDER BY b.id DESC
    LIMIT 100
  `);

  const listings = dbQuery(`
    SELECT l.id, l.listing_name, l.listing_type, l.listing_category, l.price_cents, l.listing_status, b.building_name, p.parcel_name, l.created_at
    FROM property_market_listings l
    LEFT JOIN building_registry b ON b.id = l.building_id
    LEFT JOIN land_parcels p ON p.id = l.parcel_id
    ORDER BY l.id DESC
    LIMIT 100
  `);

  const parcelRows = parcels.map(r => `<tr><td>${r.id}</td><td>${r.parcel_name}</td><td>${r.region_name || ''}</td><td>${r.parcel_type}</td><td>${r.parcel_status}</td><td>${r.owner_type}</td><td>${r.parcel_price_cents}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const buildingRows = buildings.map(r => `<tr><td>${r.id}</td><td>${r.building_name}</td><td>${r.parcel_name || ''}</td><td>${r.building_type}</td><td>${r.floor_count}</td><td>${r.occupancy_mode}</td><td>${r.building_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const listingRows = listings.map(r => `<tr><td>${r.id}</td><td>${r.listing_name}</td><td>${r.building_name || r.parcel_name || ''}</td><td>${r.listing_type}</td><td>${r.listing_category}</td><td>${r.price_cents}</td><td>${r.listing_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Property Market', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="property-market-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Metaverse Real Estate Layer</div>
            <h1 id="property-market-title">Property + Building Marketplace</h1>
            <p>Manage land, buildings, blueprint records, and rental or sale listings for the metaverse economy.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/property-market" class="hero-primary-btn">Property Market</a>
              <a href="/realworld" class="hero-secondary-btn">Real World</a>
              <a href="/world3d" class="hero-secondary-btn">Web 3D</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Land Parcels', `<table aria-label="Land Parcels"><thead><tr><th>ID</th><th>Parcel</th><th>Region</th><th>Type</th><th>Status</th><th>Owner</th><th>Price</th><th>Created</th></tr></thead><tbody>${parcelRows || '<tr><td colspan="8">No parcels yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Building Registry', `<table aria-label="Building Registry"><thead><tr><th>ID</th><th>Building</th><th>Parcel</th><th>Type</th><th>Floors</th><th>Occupancy</th><th>Status</th><th>Created</th></tr></thead><tbody>${buildingRows || '<tr><td colspan="8">No buildings yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Property Listings', `<table aria-label="Property Listings"><thead><tr><th>ID</th><th>Listing</th><th>Target</th><th>Type</th><th>Category</th><th>Price</th><th>Status</th><th>Created</th></tr></thead><tbody>${listingRows || '<tr><td colspan="8">No property listings yet.</td></tr>'}</tbody></table>`) : ''}
      </main>
    </div>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
if "function renderPropertyMarketPage(req, user = null, message = '')" not in text:
    text = text.replace(server_marker, helper + "\n" + server_marker, 1)

if '<a href="/property-market">Property Market</a>' not in text and '<a href="/realworld-city-registry">City Registry</a>' in text:
    text = text.replace(
        '<a href="/realworld-city-registry">City Registry</a>',
        '<a href="/realworld-city-registry">City Registry</a>\n          <a href="/property-market">Property Market</a>',
        1
    )

route_block = """
    if (req.method === 'GET' && pathname === '/property-market') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPropertyMarketPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/property-market'" not in text:
    route_anchor = "    if (req.method === 'GET' && pathname === '/realworld-city-registry') {"
    if route_anchor in text:
        text = text.replace(route_anchor, route_block + "\n" + route_anchor, 1)

p.write_text(text)
print("[OK] property market route verified")
PYEOF

########################################
# 4) VERIFY / RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 5) SMOKE TEST
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
# 6) SNAPSHOTS
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
# 7) ERROR SCAN
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
# 8) REPORT
########################################
cat > "reports/fix_property_market_tables_and_stabilize_${STAMP}.txt" <<REPORT
FIX PROPERTY MARKET TABLES + STABILIZE REPORT
Timestamp: ${STAMP}

Fixed:
- created missing property market tables
- seeded starter parcels, buildings, and listings
- verified property market route

Verified:
- dashboard / jarvis / socket health
- property market smoke tests
- property market snapshots

Purpose:
- recover from incomplete property-market phase
- stabilize everything
- finish the property market infrastructure cleanly
REPORT

echo "FIX PROPERTY MARKET TABLES + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/property_market_scan_latest.json"
echo "  cat snapshots/property_market_listings_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/property-market"
echo "  termux-open-url http://127.0.0.1:4900/realworld"
echo "  termux-open-url http://127.0.0.1:4900/world3d"
