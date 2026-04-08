#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== WORLD ERA + MOBILITY BRIDGE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_world_era_mobility_${STAMP}.js"
cp db/aam.db "backups/aam_world_era_mobility_${STAMP}.db"

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
CREATE TABLE IF NOT EXISTS world_era_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  era_name TEXT NOT NULL,
  era_type TEXT DEFAULT 'present',
  era_status TEXT DEFAULT 'active',
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS world_snapshot_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_name TEXT NOT NULL,
  linked_era TEXT NOT NULL,
  territory_name TEXT,
  snapshot_status TEXT DEFAULT 'saved',
  snapshot_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS mobility_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mobility_name TEXT NOT NULL,
  mobility_type TEXT NOT NULL,
  era_scope TEXT DEFAULT 'present',
  territory_scope TEXT DEFAULT 'global',
  mobility_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS route_network_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_name TEXT NOT NULL,
  route_type TEXT NOT NULL,
  start_point TEXT,
  end_point TEXT,
  linked_mobility_type TEXT,
  era_scope TEXT DEFAULT 'present',
  route_status TEXT DEFAULT 'planned',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS world_era_activation_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  era_name TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  activation_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed eras
if cur.execute("SELECT count(*) FROM world_era_registry").fetchone()[0] == 0:
    rows = [
        ("Past World", "past", "active", "Historical replay and archived territory states"),
        ("Present World", "present", "active", "Live world operations, current cities, property, creators"),
        ("Future World", "future", "active", "Forecast scenarios, planned builds, premium future districts"),
    ]
    cur.executemany("""
        INSERT INTO world_era_registry (era_name, era_type, era_status, description)
        VALUES (?, ?, ?, ?)
    """, rows)

# seed snapshots
if cur.execute("SELECT count(*) FROM world_snapshot_registry").fetchone()[0] == 0:
    rows = [
        ("Georgia Launch Prep Snapshot", "future", "Georgia", "saved", "Georgia launch preparation view"),
        ("Nigeria Creator Growth Snapshot", "future", "Nigeria", "saved", "Mobile creator expansion model"),
        ("Japan Premium World Snapshot", "future", "Japan", "saved", "Premium future-world launch model"),
        ("Current USA Territory Snapshot", "present", "USA", "saved", "Current active territory registry state"),
    ]
    cur.executemany("""
        INSERT INTO world_snapshot_registry
        (snapshot_name, linked_era, territory_name, snapshot_status, snapshot_notes)
        VALUES (?, ?, ?, ?, ?)
    """, rows)

# seed mobility
if cur.execute("SELECT count(*) FROM mobility_registry").fetchone()[0] == 0:
    rows = [
        ("City Car Network", "land_vehicle", "present", "global", "active"),
        ("Luxury Flying Car Fleet", "flying_vehicle", "future", "global", "active"),
        ("Harbor Boat System", "boat", "present", "global", "active"),
        ("Historical Horse Travel", "horse", "past", "global", "active"),
        ("Explorer Jet Link", "plane", "future", "global", "active"),
    ]
    cur.executemany("""
        INSERT INTO mobility_registry
        (mobility_name, mobility_type, era_scope, territory_scope, mobility_status)
        VALUES (?, ?, ?, ?, ?)
    """, rows)

# seed routes
if cur.execute("SELECT count(*) FROM route_network_registry").fetchone()[0] == 0:
    rows = [
        ("Georgia Creator Corridor", "city_route", "Atlanta", "Savannah", "land_vehicle", "present", "planned"),
        ("Nigeria Mobile Growth Route", "creator_route", "Lagos", "Abuja", "land_vehicle", "future", "planned"),
        ("Japan Premium Sky Route", "premium_route", "Tokyo", "Osaka", "flying_vehicle", "future", "planned"),
        ("Canada Harbor Trade Route", "water_route", "Toronto", "Vancouver", "boat", "present", "planned"),
        ("Historical Frontier Trail", "historical_route", "Territory A", "Territory B", "horse", "past", "planned"),
    ]
    cur.executemany("""
        INSERT INTO route_network_registry
        (route_name, route_type, start_point, end_point, linked_mobility_type, era_scope, route_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, rows)

conn.commit()
conn.close()
print("[OK] world era + mobility tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderWorldEraMobilityPage(req, user = null, message = '') {
  const eras = dbQuery(`
    SELECT id, era_name, era_type, era_status, description, created_at
    FROM world_era_registry
    ORDER BY id DESC
    LIMIT 100
  `);

  const snapshots = dbQuery(`
    SELECT id, snapshot_name, linked_era, territory_name, snapshot_status, snapshot_notes, created_at
    FROM world_snapshot_registry
    ORDER BY id DESC
    LIMIT 200
  `);

  const mobility = dbQuery(`
    SELECT id, mobility_name, mobility_type, era_scope, territory_scope, mobility_status, created_at
    FROM mobility_registry
    ORDER BY id DESC
    LIMIT 200
  `);

  const routes = dbQuery(`
    SELECT id, route_name, route_type, start_point, end_point, linked_mobility_type, era_scope, route_status, created_at
    FROM route_network_registry
    ORDER BY id DESC
    LIMIT 200
  `);

  const eraRows = eras.map(r => `<tr><td>${r.id}</td><td>${r.era_name}</td><td>${r.era_type}</td><td>${r.era_status}</td><td>${r.description || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const snapshotRows = snapshots.map(r => `<tr><td>${r.id}</td><td>${r.snapshot_name}</td><td>${r.linked_era}</td><td>${r.territory_name || ''}</td><td>${r.snapshot_status}</td><td>${r.snapshot_notes || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const mobilityRows = mobility.map(r => `<tr><td>${r.id}</td><td>${r.mobility_name}</td><td>${r.mobility_type}</td><td>${r.era_scope}</td><td>${r.territory_scope}</td><td>${r.mobility_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const routeRows = routes.map(r => `<tr><td>${r.id}</td><td>${r.route_name}</td><td>${r.route_type}</td><td>${r.start_point || ''}</td><td>${r.end_point || ''}</td><td>${r.linked_mobility_type || ''}</td><td>${r.era_scope}</td><td>${r.route_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('World Era + Mobility', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="world-era-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Time Machine World Layer</div>
            <h1 id="world-era-title">World Era + Mobility Control</h1>
            <p>Manage past, present, and future worlds, saved world snapshots, and movement systems like cars, boats, planes, flying vehicles, and horses.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/world-era-mobility" class="hero-primary-btn">World Era + Mobility</a>
              <a href="/territory-bridge" class="hero-secondary-btn">Territory Bridge</a>
              <a href="/realworld" class="hero-secondary-btn">Realworld</a>
              <a href="/world3d" class="hero-secondary-btn">World3D</a>
            </div>
          </div>
        </section>

        <section><table aria-label="World Eras"><thead><tr><th>ID</th><th>Era</th><th>Type</th><th>Status</th><th>Description</th><th>Created</th></tr></thead><tbody>${eraRows || '<tr><td colspan="6">No eras yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="World Snapshots"><thead><tr><th>ID</th><th>Snapshot</th><th>Era</th><th>Territory</th><th>Status</th><th>Notes</th><th>Created</th></tr></thead><tbody>${snapshotRows || '<tr><td colspan="7">No snapshots yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Mobility Registry"><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Era</th><th>Territory</th><th>Status</th><th>Created</th></tr></thead><tbody>${mobilityRows || '<tr><td colspan="7">No mobility rows yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Route Network Registry"><thead><tr><th>ID</th><th>Route</th><th>Type</th><th>Start</th><th>End</th><th>Mobility</th><th>Era</th><th>Status</th><th>Created</th></tr></thead><tbody>${routeRows || '<tr><td colspan="9">No routes yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

if "function renderWorldEraMobilityPage(req, user = null, message = '')" not in text:
    text = text.replace("const server = http.createServer(async (req, res) => {", helper + "\nconst server = http.createServer(async (req, res) => {", 1)

if '<a href="/world-era-mobility">World Era</a>' not in text and '<a href="/territory-bridge">Territory Bridge</a>' in text:
    text = text.replace(
        '<a href="/territory-bridge">Territory Bridge</a>',
        '<a href="/territory-bridge">Territory Bridge</a>\n          <a href="/world-era-mobility">World Era</a>',
        1
    )

get_route = """
    if (req.method === 'GET' && pathname === '/world-era-mobility') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWorldEraMobilityPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/world-era-mobility'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/territory-bridge') {"
    if anchor in text:
        text = text.replace(anchor, get_route + "\n" + anchor, 1)

p.write_text(text)
print("[OK] world era + mobility routes ready")
PYEOF

########################################
# 4) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true

########################################
# 5) SMOKE TEST
########################################
for route in \
  / \
  /world-era-mobility \
  /territory-bridge \
  /territory-activation \
  /international-expansion \
  /world-selector \
  /realworld \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as world_era_registry from world_era_registry;" > "snapshots/world_era_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_snapshot_registry from world_snapshot_registry;" > "snapshots/world_snapshot_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as mobility_registry from mobility_registry;" > "snapshots/mobility_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as route_network_registry from route_network_registry;" > "snapshots/route_network_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select id, era_name, era_type, era_status, description, created_at from world_era_registry order by id desc limit 20;" > "snapshots/world_era_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, snapshot_name, linked_era, territory_name, snapshot_status, snapshot_notes, created_at from world_snapshot_registry order by id desc limit 20;" > "snapshots/world_snapshot_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, mobility_name, mobility_type, era_scope, territory_scope, mobility_status, created_at from mobility_registry order by id desc limit 20;" > "snapshots/mobility_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, route_name, route_type, start_point, end_point, linked_mobility_type, era_scope, route_status, created_at from route_network_registry order by id desc limit 20;" > "snapshots/route_network_registry_tail_${STAMP}.json"

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
    if "no such table" in lower:
        issues.append({"file": f.name, "problem": "missing_table"})
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "world_era_mobility_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] world era mobility scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/world_era_mobility_bridge_and_stabilize_${STAMP}.txt" <<REPORT
WORLD ERA + MOBILITY BRIDGE + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- world_era_registry
- world_snapshot_registry
- mobility_registry
- route_network_registry
- world_era_activation_log
- world-era-mobility route

Purpose:
- support past, present, and future worlds
- organize boats, land vehicles, air vehicles, and horses
- connect the time-machine concept to real world-state and movement scaffolding
REPORT

echo "WORLD ERA + MOBILITY BRIDGE + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/world_era_mobility_scan_latest.json"
echo "  cat snapshots/mobility_registry_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/world-era-mobility"
echo "  termux-open-url http://127.0.0.1:4900/territory-bridge"
echo "  termux-open-url http://127.0.0.1:4900/world3d"
