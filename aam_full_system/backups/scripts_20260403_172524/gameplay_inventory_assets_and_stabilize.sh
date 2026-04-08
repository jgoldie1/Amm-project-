#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== GAMEPLAY INVENTORY + ASSETS + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_gameplay_inventory_${STAMP}.js"
cp db/aam.db "backups/aam_gameplay_inventory_${STAMP}.db"

########################################
# 2) DATABASE SUPPORT
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS player_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_type TEXT DEFAULT 'unlock_item',
  quantity INTEGER DEFAULT 1,
  item_status TEXT DEFAULT 'owned',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS player_owned_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  asset_type TEXT DEFAULT 'digital_asset',
  linked_route TEXT DEFAULT '/gameplay-progression',
  asset_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS player_property_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  parcel_name TEXT,
  building_name TEXT,
  claim_type TEXT DEFAULT 'reserved',
  claim_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS city_progress_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  city_name TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_type TEXT DEFAULT 'explorer',
  badge_status TEXT DEFAULT 'earned',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

inventory = [
    ("Jacobie", "Marketplace Key", "unlock_item", 1, "owned"),
    ("Jacobie", "Property Access Pass", "property_item", 1, "owned"),
    ("Isaiah", "Engine Token", "unlock_item", 1, "owned"),
    ("Aniyah", "Avatar Rig Pass", "avatar_item", 1, "owned"),
    ("Guest Explorer", "Starter Badge", "badge_item", 1, "owned"),
]
for row in inventory:
    cur.execute("""
    INSERT INTO player_inventory
    (player_name, item_name, item_type, quantity, item_status)
    VALUES (?, ?, ?, ?, ?)
    """, row)

assets = [
    ("Jacobie", "Chicago Commerce Suite", "property_asset", "/property-market", "active"),
    ("Jacobie", "Marketplace Founder Access", "platform_asset", "/connect-system", "active"),
    ("Isaiah", "Engine Control Pass", "engine_asset", "/engine-bridge", "active"),
    ("Aniyah", "Avatar Creator License", "avatar_asset", "/avatar-rig-control", "active"),
]
for row in assets:
    cur.execute("""
    INSERT INTO player_owned_assets
    (player_name, asset_name, asset_type, linked_route, asset_status)
    VALUES (?, ?, ?, ?, ?)
    """, row)

claims = [
    ("Jacobie", "Chicago Commerce Parcel", "Chicago Tower One", "reserved", "active"),
    ("Aniyah", "Atlanta Creator Parcel", "Atlanta Creator Center", "reserved", "active"),
]
for row in claims:
    cur.execute("""
    INSERT INTO player_property_claims
    (player_name, parcel_name, building_name, claim_type, claim_status)
    VALUES (?, ?, ?, ?, ?)
    """, row)

badges = [
    ("Jacobie", "Chicago", "Chicago Explorer", "explorer", "earned"),
    ("Isaiah", "Detroit", "Detroit Engine Runner", "engine", "earned"),
    ("Aniyah", "Atlanta", "Atlanta Creator Badge", "creator", "earned"),
    ("Guest Explorer", "Nashville", "Nashville Visitor", "explorer", "earned"),
]
for row in badges:
    cur.execute("""
    INSERT INTO city_progress_badges
    (player_name, city_name, badge_name, badge_type, badge_status)
    VALUES (?, ?, ?, ?, ?)
    """, row)

conn.commit()
conn.close()
print("[OK] gameplay inventory/asset tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function renderGameplayAssetsPage(req, user = null, message = '') {
  const inventory = dbQuery(`
    SELECT id, player_name, item_name, item_type, quantity, item_status, created_at
    FROM player_inventory
    ORDER BY id DESC
    LIMIT 200
  `);

  const assets = dbQuery(`
    SELECT id, player_name, asset_name, asset_type, linked_route, asset_status, created_at
    FROM player_owned_assets
    ORDER BY id DESC
    LIMIT 200
  `);

  const claims = dbQuery(`
    SELECT id, player_name, parcel_name, building_name, claim_type, claim_status, created_at
    FROM player_property_claims
    ORDER BY id DESC
    LIMIT 200
  `);

  const badges = dbQuery(`
    SELECT id, player_name, city_name, badge_name, badge_type, badge_status, created_at
    FROM city_progress_badges
    ORDER BY id DESC
    LIMIT 200
  `);

  const inventoryRows = inventory.map(r => `<tr><td>${r.id}</td><td>${r.player_name}</td><td>${r.item_name}</td><td>${r.item_type}</td><td>${r.quantity}</td><td>${r.item_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const assetRows = assets.map(r => `<tr><td>${r.id}</td><td>${r.player_name}</td><td>${r.asset_name}</td><td>${r.asset_type}</td><td>${r.linked_route}</td><td>${r.asset_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const claimRows = claims.map(r => `<tr><td>${r.id}</td><td>${r.player_name}</td><td>${r.parcel_name || ''}</td><td>${r.building_name || ''}</td><td>${r.claim_type}</td><td>${r.claim_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const badgeRows = badges.map(r => `<tr><td>${r.id}</td><td>${r.player_name}</td><td>${r.city_name}</td><td>${r.badge_name}</td><td>${r.badge_type}</td><td>${r.badge_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Gameplay Assets', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="assets-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Ownership + Progress Layer</div>
            <h1 id="assets-title">Gameplay Assets</h1>
            <p>This page adds inventory, owned assets, property claims, and city badges to strengthen the world progression loop.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/gameplay-assets" class="hero-primary-btn">Gameplay Assets</a>
              <a href="/gameplay-progression" class="hero-secondary-btn">Progression</a>
              <a href="/property-market" class="hero-secondary-btn">Property</a>
              <a href="/realworld-city-registry" class="hero-secondary-btn">Cities</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Player Inventory', `<table aria-label="Player Inventory"><thead><tr><th>ID</th><th>Player</th><th>Item</th><th>Type</th><th>Qty</th><th>Status</th><th>Created</th></tr></thead><tbody>${inventoryRows || '<tr><td colspan="7">No inventory yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Owned Assets', `<table aria-label="Owned Assets"><thead><tr><th>ID</th><th>Player</th><th>Asset</th><th>Type</th><th>Route</th><th>Status</th><th>Created</th></tr></thead><tbody>${assetRows || '<tr><td colspan="7">No assets yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Property Claims', `<table aria-label="Property Claims"><thead><tr><th>ID</th><th>Player</th><th>Parcel</th><th>Building</th><th>Claim</th><th>Status</th><th>Created</th></tr></thead><tbody>${claimRows || '<tr><td colspan="7">No property claims yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('City Progress Badges', `<table aria-label="City Progress Badges"><thead><tr><th>ID</th><th>Player</th><th>City</th><th>Badge</th><th>Type</th><th>Status</th><th>Created</th></tr></thead><tbody>${badgeRows || '<tr><td colspan="7">No city badges yet.</td></tr>'}</tbody></table>`) : ''}
      </main>
    </div>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
if "function renderGameplayAssetsPage(req, user = null, message = '')" not in text:
    text = text.replace(server_marker, helper + "\n" + server_marker, 1)

if '<a href="/gameplay-assets">Assets</a>' not in text and '<a href="/gameplay-progression">Progression</a>' in text:
    text = text.replace(
        '<a href="/gameplay-progression">Progression</a>',
        '<a href="/gameplay-progression">Progression</a>\n          <a href="/gameplay-assets">Assets</a>',
        1
    )

route_block = """
    if (req.method === 'GET' && pathname === '/gameplay-assets') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderGameplayAssetsPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/gameplay-assets'" not in text:
    route_anchor = "    if (req.method === 'GET' && pathname === '/gameplay-progression') {"
    if route_anchor in text:
        text = text.replace(route_anchor, route_block + "\n" + route_anchor, 1)

p.write_text(text)
print("[OK] gameplay assets route patch applied")
PYEOF

########################################
# 4) RESTART / VERIFY
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
  /gameplay-assets \
  /gameplay-progression \
  /gameplay-control \
  /property-market \
  /realworld \
  /realworld-city-registry \
  /world3d \
  /watch \
  /connect-system
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as player_inventory from player_inventory;" > "snapshots/player_inventory_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as player_owned_assets from player_owned_assets;" > "snapshots/player_owned_assets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as player_property_claims from player_property_claims;" > "snapshots/player_property_claims_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as city_progress_badges from city_progress_badges;" > "snapshots/city_progress_badges_${STAMP}.json"

########################################
# 7) FRESH-ONLY ERROR SCAN
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "gameplay_assets_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] gameplay assets scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/gameplay_inventory_assets_and_stabilize_${STAMP}.txt" <<REPORT
GAMEPLAY INVENTORY + ASSETS + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- player_inventory
- player_owned_assets
- player_property_claims
- city_progress_badges
- gameplay-assets route

Purpose:
- strengthen player ownership loops
- connect property and cities into gameplay
- move the world shell toward real asset progression
REPORT

echo "GAMEPLAY INVENTORY + ASSETS + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/gameplay_assets_scan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/gameplay-assets"
echo "  termux-open-url http://127.0.0.1:4900/gameplay-progression"
echo "  termux-open-url http://127.0.0.1:4900/world3d"
