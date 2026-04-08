#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== DYNAMIC CITY REGISTRY + EXPANSION START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results public/realworld

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_city_registry_${STAMP}.js"
cp db/aam.db "backups/aam_city_registry_${STAMP}.db"
cp public/realworld/index.html "backups/realworld_index_city_registry_${STAMP}.html"

########################################
# 2) DATABASE EXPANSION
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS realworld_city_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city_name TEXT NOT NULL,
  state_name TEXT,
  region_name TEXT,
  longitude REAL NOT NULL,
  latitude REAL NOT NULL,
  height REAL DEFAULT 1800,
  destination_route TEXT NOT NULL DEFAULT '/world-experience-control',
  city_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cities = [
    ("Chicago", "Illinois", "Midwest", -87.6298, 41.8781, 1800, "/role-hub"),
    ("Los Angeles", "California", "West", -118.2437, 34.0522, 1800, "/watch"),
    ("Nashville", "Tennessee", "South", -86.7816, 36.1627, 1800, "/world-experience-control"),
    ("San Diego", "California", "West", -117.1611, 32.7157, 1800, "/connect-system"),
    ("Detroit", "Michigan", "Midwest", -83.0458, 42.3314, 1800, "/engine-bridge"),
    ("Herrin", "Illinois", "Midwest", -89.0276, 37.8031, 1800, "/accessibility"),
    ("Indianapolis", "Indiana", "Midwest", -86.1581, 39.7684, 1800, "/avatar-rig-control"),
    ("Las Vegas", "Nevada", "West", -115.1398, 36.1699, 1800, "/watch"),
    ("Atlanta", "Georgia", "South", -84.3880, 33.7490, 1800, "/connect-system"),
    ("Dallas", "Texas", "South", -96.7970, 32.7767, 1800, "/engine-bridge"),
    ("Houston", "Texas", "South", -95.3698, 29.7604, 1800, "/connect-system"),
    ("Austin", "Texas", "South", -97.7431, 30.2672, 1800, "/watch"),
    ("Memphis", "Tennessee", "South", -90.0490, 35.1495, 1800, "/world-experience-control"),
    ("Milwaukee", "Wisconsin", "Midwest", -87.9065, 43.0389, 1800, "/role-hub"),
    ("New York City", "New York", "Northeast", -74.0060, 40.7128, 1800, "/watch"),
    ("Boise", "Idaho", "West", -116.2023, 43.6150, 1800, "/avatar-rig-control")
]

for row in cities:
    cur.execute("""
    INSERT INTO realworld_city_registry
    (city_name, state_name, region_name, longitude, latitude, height, destination_route, city_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    """, row)

conn.commit()
conn.close()
print("[OK] dynamic city registry ready")
PYEOF

########################################
# 3) PATCH REALWORLD HTML TO USE CITY API
########################################
cat > public/realworld/index.html <<'HTML'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>AAM Real World Engine</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="https://cesium.com/downloads/cesiumjs/releases/1.115/Build/Cesium/Widgets/widgets.css" rel="stylesheet">
  <style>
    html, body, #app, #cesiumContainer {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #020617;
      font-family: Arial, sans-serif;
    }
    .hud {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 10;
      max-width: 520px;
      background: rgba(2, 6, 23, 0.86);
      color: #fff;
      border: 1px solid #334155;
      border-radius: 18px;
      padding: 14px 16px;
      box-shadow: 0 10px 28px rgba(0,0,0,.28);
      backdrop-filter: blur(10px);
    }
    .hud h1 { margin: 0 0 8px 0; font-size: 1.25rem; }
    .hud p { margin: 0 0 10px 0; line-height: 1.5; }
    .row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 10px;
    }
    button, a.action, select {
      min-height: 46px;
      border-radius: 12px;
      border: 1px solid #475569;
      background: #0f172a;
      color: #fff;
      padding: 10px 14px;
      font-size: 0.95rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .status {
      margin-top: 8px;
      font-size: 0.92rem;
      color: #cbd5e1;
    }
    .interaction-panel {
      position: absolute;
      right: 12px;
      bottom: 12px;
      z-index: 10;
      width: min(420px, calc(100vw - 24px));
      background: rgba(2, 6, 23, 0.86);
      color: #fff;
      border: 1px solid #334155;
      border-radius: 18px;
      padding: 14px 16px;
      box-shadow: 0 10px 28px rgba(0,0,0,.28);
      backdrop-filter: blur(10px);
    }
  </style>
</head>
<body>
  <div id="app">
    <div class="hud">
      <h1>AAM Real World Engine</h1>
      <p>This geospatial layer now uses a dynamic city registry so you can keep adding more cities later.</p>
      <div class="row">
        <select id="citySelect" aria-label="Choose city"></select>
        <button id="btnFly">Fly To City</button>
      </div>
      <div class="row">
        <a class="action" href="/realworld-client">Real World Client</a>
        <a class="action" href="/world3d">Web 3D</a>
        <a class="action" href="/engine-bridge">Engine Bridge</a>
      </div>
      <div class="status" id="statusText">Waiting for Cesium to load...</div>
    </div>

    <div class="interaction-panel" aria-live="polite">
      <h2 style="margin:0 0 8px 0;">City Interaction</h2>
      <p id="interactionText">Choose a city and jump to a linked ecosystem surface.</p>
      <div class="row">
        <a id="interactionLink" class="action" href="/realworld-client">Open Target</a>
      </div>
    </div>

    <div id="cesiumContainer"></div>
  </div>

  <script src="https://cesium.com/downloads/cesiumjs/releases/1.115/Build/Cesium/Cesium.js"></script>
  <script>
    async function loadJson(url) {
      const res = await fetch(url);
      return await res.json();
    }

    async function loadToken() {
      try {
        const res = await fetch('/realworld-token');
        const data = await res.json();
        return data.token || '';
      } catch (e) {
        return '';
      }
    }

    function setStatus(msg) {
      document.getElementById('statusText').textContent = msg;
    }

    function setInteraction(label, desc, href) {
      document.getElementById('interactionText').textContent = `${label}: ${desc}`;
      const link = document.getElementById('interactionLink');
      link.href = href;
      link.textContent = `Open ${label}`;
    }

    function flyToLocation(viewer, lon, lat, height) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, height)
      });
    }

    (async () => {
      const token = await loadToken();
      if (!token || token === 'PASTE_YOUR_CESIUM_ION_TOKEN_HERE') {
        setStatus('Cesium token not set yet. Add your token to config/cesium.env, then reload.');
        return;
      }

      Cesium.Ion.defaultAccessToken = token;
      const cities = await loadJson('/realworld-cities');

      const viewer = new Cesium.Viewer('cesiumContainer', {
        terrain: Cesium.Terrain.fromWorldTerrain(),
        animation: false,
        timeline: false,
        homeButton: true,
        geocoder: false,
        sceneModePicker: true,
        baseLayerPicker: true,
        navigationHelpButton: false,
        infoBox: false,
        selectionIndicator: false
      });

      const citySelect = document.getElementById('citySelect');
      cities.forEach(city => {
        const opt = document.createElement('option');
        opt.value = city.id;
        opt.textContent = `${city.city_name}, ${city.state_name}`;
        citySelect.appendChild(opt);

        viewer.entities.add({
          name: `${city.city_name}, ${city.state_name}`,
          position: Cesium.Cartesian3.fromDegrees(city.longitude, city.latitude),
          point: {
            pixelSize: 12,
            color: Cesium.Color.CYAN,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2
          },
          label: {
            text: city.city_name,
            font: '14px sans-serif',
            fillColor: Cesium.Color.WHITE,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -14)
          },
          properties: {
            route: city.destination_route,
            desc: `${city.region_name} region anchor`
          }
        });
      });

      function selectCity(city) {
        flyToLocation(viewer, city.longitude, city.latitude, city.height || 1800);
        setInteraction(`${city.city_name}, ${city.state_name}`, `${city.region_name} region anchor`, city.destination_route);
      }

      document.getElementById('btnFly').addEventListener('click', () => {
        const city = cities.find(c => String(c.id) === String(citySelect.value));
        if (city) selectCity(city);
      });

      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(function(click) {
        const picked = viewer.scene.pick(click.position);
        if (Cesium.defined(picked) && picked.id && picked.id.properties) {
          const label = picked.id.name || 'Anchor';
          const desc = picked.id.properties.desc.getValue();
          const route = picked.id.properties.route.getValue();
          setInteraction(label, desc, route);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      if (cities.length) {
        citySelect.value = cities[0].id;
        selectCity(cities[0]);
      }

      setStatus('Cesium loaded. Dynamic city registry active.');
    })();
  </script>
</body>
</html>
HTML

########################################
# 4) PATCH DASHBOARD FOR CITY API
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

route_block = """
    if (req.method === 'GET' && pathname === '/realworld-cities') {
      const rows = dbQuery(`
        SELECT id, city_name, state_name, region_name, longitude, latitude, height, destination_route, city_status, created_at
        FROM realworld_city_registry
        WHERE city_status='active'
        ORDER BY region_name, state_name, city_name
      `);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(rows));
    }
"""

if "pathname === '/realworld-cities'" not in text:
    route_anchor = "    if (req.method === 'GET' && pathname === '/realworld-token') {"
    text = text.replace(route_anchor, route_block + "\n" + route_anchor, 1)

helper = r"""
function renderRealWorldCityRegistryPage(req, user = null, message = '') {
  const rows = dbQuery(`
    SELECT id, city_name, state_name, region_name, longitude, latitude, height, destination_route, city_status, created_at
    FROM realworld_city_registry
    ORDER BY region_name, state_name, city_name
    LIMIT 300
  `);

  const cityRows = rows.map(r => `
    <tr><td>${r.id}</td><td>${r.city_name}</td><td>${r.state_name || ''}</td><td>${r.region_name || ''}</td><td>${r.longitude}</td><td>${r.latitude}</td><td>${r.height}</td><td>${r.destination_route}</td><td>${r.city_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Real World City Registry', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="city-registry-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Dynamic City Expansion</div>
            <h1 id="city-registry-title">Real World City Registry</h1>
            <p>This registry lets the platform grow into a broader Earth-scale location network and makes it easier to add cities later.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/realworld" class="hero-primary-btn">Open Real World Engine</a>
              <a href="/realworld-client" class="hero-secondary-btn">Real World Client</a>
              <a href="/world3d" class="hero-secondary-btn">Web 3D</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('City Registry', `
          <table aria-label="Real World City Registry">
            <thead><tr><th>ID</th><th>City</th><th>State</th><th>Region</th><th>Lon</th><th>Lat</th><th>Height</th><th>Route</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${cityRows || '<tr><td colspan="10">No city rows yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
if "function renderRealWorldCityRegistryPage(req, user = null, message = '')" not in text:
    text = text.replace(server_marker, helper + "\n" + server_marker, 1)

if '<a href="/realworld-city-registry">City Registry</a>' not in text and '<a href="/realworld-client">Real World</a>' in text:
    text = text.replace(
        '<a href="/realworld-client">Real World</a>',
        '<a href="/realworld-client">Real World</a>\n          <a href="/realworld-city-registry">City Registry</a>',
        1
    )

registry_route = """
    if (req.method === 'GET' && pathname === '/realworld-city-registry') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderRealWorldCityRegistryPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/realworld-city-registry'" not in text:
    route_anchor = "    if (req.method === 'GET' && pathname === '/realworld-client') {"
    text = text.replace(route_anchor, registry_route + "\n" + route_anchor, 1)

p.write_text(text)
print("[OK] city registry route patch applied")
PYEOF

########################################
# 5) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 6) SMOKE TEST
########################################
for route in \
  / \
  /realworld-client \
  /realworld-city-registry \
  /realworld-cities \
  /realworld \
  /world3d \
  /engine-bridge \
  /connect-system \
  /watch \
  /avatar-rig-control
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 7) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as realworld_city_registry from realworld_city_registry;" > "snapshots/realworld_city_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select id, city_name, state_name, region_name, longitude, latitude, height, destination_route, city_status, created_at from realworld_city_registry order by region_name, state_name, city_name limit 300;" > "snapshots/realworld_city_registry_tail_${STAMP}.json"

########################################
# 8) ERROR SCAN
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
    if "real world engine not found" in lower:
        issues.append({"file": f.name, "problem": "realworld_missing"})

latest = Path.home() / "aam_full_system" / "snapshots" / "realworld_city_registry_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] realworld city registry scan complete: {len(issues)} issues")
PYEOF

########################################
# 9) REPORT
########################################
cat > "reports/dynamic_city_registry_and_expansion_${STAMP}.txt" <<REPORT
DYNAMIC CITY REGISTRY + EXPANSION REPORT
Timestamp: ${STAMP}

Added:
- Las Vegas
- Atlanta
- Texas city anchors
- Tennessee city anchors
- Wisconsin anchor
- New York anchor
- Idaho anchor
- realworld_city_registry
- /realworld-cities
- /realworld-city-registry

Purpose:
- make city expansion dynamic
- support adding more cities later
- strengthen the Earth-scale city network
- stabilize everything around future city growth
REPORT

echo "DYNAMIC CITY REGISTRY + EXPANSION COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/realworld_city_registry_scan_latest.json"
echo "  cat snapshots/realworld_city_registry_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/realworld-city-registry"
echo "  termux-open-url http://127.0.0.1:4900/realworld"
echo "  termux-open-url http://127.0.0.1:4900/world3d"
