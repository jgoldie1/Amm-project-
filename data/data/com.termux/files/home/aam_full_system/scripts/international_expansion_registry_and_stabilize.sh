#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== INTERNATIONAL EXPANSION REGISTRY + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_international_expansion_${STAMP}.js"
cp db/aam.db "backups/aam_international_expansion_${STAMP}.db"

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
CREATE TABLE IF NOT EXISTS global_country_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  country_name TEXT NOT NULL,
  region_name TEXT,
  expansion_priority TEXT DEFAULT 'growth',
  linked_route TEXT DEFAULT '/realworld',
  country_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS usa_state_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state_name TEXT NOT NULL,
  region_name TEXT,
  expansion_priority TEXT DEFAULT 'growth',
  linked_route TEXT DEFAULT '/realworld-city-registry',
  state_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS region_expansion_strategy (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  territory_name TEXT NOT NULL,
  territory_type TEXT DEFAULT 'country',
  strategy_name TEXT,
  revenue_focus TEXT,
  priority_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

countries = [
    ("Philippines", "Asia", "growth", "/realworld", "active"),
    ("Ghana", "Africa", "growth", "/realworld", "active"),
    ("Burkina Faso", "Africa", "future", "/realworld", "active"),
    ("Kenya", "Africa", "growth", "/realworld", "active"),
    ("Ethiopia", "Africa", "growth", "/realworld", "active"),
    ("Nigeria", "Africa", "launch", "/realworld", "active"),
    ("Taiwan", "Asia", "growth", "/realworld", "active"),
    ("Thailand", "Asia", "growth", "/realworld", "active"),
    ("Japan", "Asia", "launch", "/realworld", "active"),
    ("Canada", "North America", "launch", "/realworld", "active"),
    ("India", "Asia", "launch", "/realworld", "active"),
    ("China", "Asia", "growth", "/realworld", "active"),
]

states = [
    ("Georgia", "South", "launch", "/realworld-city-registry", "active"),
    ("Texas", "South", "launch", "/realworld-city-registry", "active"),
    ("California", "West", "launch", "/realworld-city-registry", "active"),
    ("New York", "Northeast", "launch", "/realworld-city-registry", "active"),
    ("Florida", "South", "launch", "/realworld-city-registry", "active"),
    ("Illinois", "Midwest", "launch", "/realworld-city-registry", "active"),
    ("Tennessee", "South", "growth", "/realworld-city-registry", "active"),
    ("Indiana", "Midwest", "growth", "/realworld-city-registry", "active"),
    ("Michigan", "Midwest", "growth", "/realworld-city-registry", "active"),
    ("Ohio", "Midwest", "growth", "/realworld-city-registry", "active"),
    ("North Carolina", "South", "growth", "/realworld-city-registry", "active"),
    ("Virginia", "South", "growth", "/realworld-city-registry", "active"),
    ("Pennsylvania", "Northeast", "growth", "/realworld-city-registry", "active"),
    ("Arizona", "West", "growth", "/realworld-city-registry", "active"),
    ("Nevada", "West", "growth", "/realworld-city-registry", "active"),
]

strategies = [
    ("Nigeria", "country", "African Creator Launch", "creator_marketplace", "active"),
    ("Japan", "country", "Premium World Expansion", "premium_world_access", "active"),
    ("India", "country", "Scale + Creator Economy", "creator_marketplace", "active"),
    ("Canada", "country", "North America Property Expansion", "property_market", "active"),
    ("Georgia", "state", "Southeast Launch Cluster", "city_property_creator", "active"),
    ("Texas", "state", "Large Scale Property + Action World", "property_action_world", "active"),
    ("California", "state", "Creator + Tech Premium Cluster", "creator_premium", "active"),
    ("New York", "state", "Commerce + Brand Expansion", "brand_commerce", "active"),
]

for row in countries:
    cur.execute("""
    INSERT INTO global_country_registry
    (country_name, region_name, expansion_priority, linked_route, country_status)
    VALUES (?, ?, ?, ?, ?)
    """, row)

for row in states:
    cur.execute("""
    INSERT INTO usa_state_registry
    (state_name, region_name, expansion_priority, linked_route, state_status)
    VALUES (?, ?, ?, ?, ?)
    """, row)

for row in strategies:
    cur.execute("""
    INSERT INTO region_expansion_strategy
    (territory_name, territory_type, strategy_name, revenue_focus, priority_status)
    VALUES (?, ?, ?, ?, ?)
    """, row)

conn.commit()
conn.close()
print("[OK] international expansion tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function renderInternationalExpansionPage(req, user = null, message = '') {
  const countries = dbQuery(`
    SELECT id, country_name, region_name, expansion_priority, linked_route, country_status, created_at
    FROM global_country_registry
    ORDER BY region_name, country_name
    LIMIT 300
  `);

  const states = dbQuery(`
    SELECT id, state_name, region_name, expansion_priority, linked_route, state_status, created_at
    FROM usa_state_registry
    ORDER BY region_name, state_name
    LIMIT 300
  `);

  const strategies = dbQuery(`
    SELECT id, territory_name, territory_type, strategy_name, revenue_focus, priority_status, created_at
    FROM region_expansion_strategy
    ORDER BY id DESC
    LIMIT 300
  `);

  const countryRows = countries.map(r => `<tr><td>${r.id}</td><td>${r.country_name}</td><td>${r.region_name || ''}</td><td>${r.expansion_priority}</td><td>${r.linked_route || ''}</td><td>${r.country_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const stateRows = states.map(r => `<tr><td>${r.id}</td><td>${r.state_name}</td><td>${r.region_name || ''}</td><td>${r.expansion_priority}</td><td>${r.linked_route || ''}</td><td>${r.state_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const strategyRows = strategies.map(r => `<tr><td>${r.id}</td><td>${r.territory_name}</td><td>${r.territory_type}</td><td>${r.strategy_name || ''}</td><td>${r.revenue_focus || ''}</td><td>${r.priority_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('International Expansion', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="international-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Global Expansion Layer</div>
            <h1 id="international-title">International Expansion Registry</h1>
            <p>Add and manage countries, US states, and region revenue strategies for metaverse, middleverse, and multiverse growth.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/international-expansion" class="hero-primary-btn">International Expansion</a>
              <a href="/realworld" class="hero-secondary-btn">Real World</a>
              <a href="/realworld-city-registry" class="hero-secondary-btn">City Registry</a>
              <a href="/world-selector" class="hero-secondary-btn">World Selector</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Countries', `<table aria-label="Countries"><thead><tr><th>ID</th><th>Country</th><th>Region</th><th>Priority</th><th>Route</th><th>Status</th><th>Created</th></tr></thead><tbody>${countryRows || '<tr><td colspan="7">No countries yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('US States', `<table aria-label="US States"><thead><tr><th>ID</th><th>State</th><th>Region</th><th>Priority</th><th>Route</th><th>Status</th><th>Created</th></tr></thead><tbody>${stateRows || '<tr><td colspan="7">No states yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Expansion Strategies', `<table aria-label="Expansion Strategies"><thead><tr><th>ID</th><th>Territory</th><th>Type</th><th>Strategy</th><th>Revenue Focus</th><th>Status</th><th>Created</th></tr></thead><tbody>${strategyRows || '<tr><td colspan="7">No strategies yet.</td></tr>'}</tbody></table>`) : ''}
      </main>
    </div>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
if "function renderInternationalExpansionPage(req, user = null, message = '')" not in text:
    text = text.replace(server_marker, helper + "\n" + server_marker, 1)

if '<a href="/international-expansion">International</a>' not in text and '<a href="/world-selector">World Selector</a>' in text:
    text = text.replace(
        '<a href="/world-selector">World Selector</a>',
        '<a href="/world-selector">World Selector</a>\n          <a href="/international-expansion">International</a>',
        1
    )

route_block = """
    if (req.method === 'GET' && pathname === '/international-expansion') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderInternationalExpansionPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/international-expansion'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/world-selector') {"
    if anchor in text:
        text = text.replace(anchor, route_block + "\n" + anchor, 1)

p.write_text(text)
print("[OK] international expansion route patch applied")
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
  /international-expansion \
  /realworld \
  /realworld-city-registry \
  /world-selector \
  /property-market \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as global_country_registry from global_country_registry;" > "snapshots/global_country_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as usa_state_registry from usa_state_registry;" > "snapshots/usa_state_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as region_expansion_strategy from region_expansion_strategy;" > "snapshots/region_expansion_strategy_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "international_expansion_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] international expansion scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/international_expansion_registry_and_stabilize_${STAMP}.txt" <<REPORT
INTERNATIONAL EXPANSION REGISTRY + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- global_country_registry
- usa_state_registry
- region_expansion_strategy
- international-expansion route

Purpose:
- expand the platform into more countries and US states
- prepare regional rollout strategies
- support country/state-based monetization and growth planning
REPORT

echo "INTERNATIONAL EXPANSION REGISTRY + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/international_expansion_scan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/international-expansion"
echo "  termux-open-url http://127.0.0.1:4900/realworld"
echo "  termux-open-url http://127.0.0.1:4900/world-selector"
