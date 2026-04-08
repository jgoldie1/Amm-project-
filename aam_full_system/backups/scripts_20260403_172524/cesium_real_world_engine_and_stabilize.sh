#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== CESIUM REAL WORLD ENGINE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results public/realworld config

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_cesium_${STAMP}.js"
cp db/aam.db "backups/aam_cesium_${STAMP}.db"

########################################
# 2) CONFIG
########################################
if [ ! -f config/cesium.env ]; then
  cat > config/cesium.env <<CFG
CESIUM_ION_TOKEN=PASTE_YOUR_CESIUM_ION_TOKEN_HERE
CFG
  echo "[OK] created config/cesium.env"
else
  echo "[OK] config/cesium.env already exists"
fi

########################################
# 3) DATABASE SUPPORT
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS realworld_engine_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT NOT NULL,
  engine_name TEXT NOT NULL DEFAULT 'cesiumjs',
  terrain_mode TEXT DEFAULT 'global_terrain',
  imagery_mode TEXT DEFAULT 'world_imagery',
  streaming_mode TEXT DEFAULT 'geospatial_stream',
  profile_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS realworld_locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location_name TEXT NOT NULL,
  longitude REAL NOT NULL,
  latitude REAL NOT NULL,
  height REAL DEFAULT 1500,
  location_type TEXT DEFAULT 'city_anchor',
  location_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS realworld_runtime_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  event_payload TEXT,
  event_status TEXT DEFAULT 'processed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
INSERT INTO realworld_engine_profiles
(profile_name, engine_name, terrain_mode, imagery_mode, streaming_mode, profile_status)
VALUES ('Earth Clone Foundation', 'cesiumjs', 'global_terrain', 'world_imagery', 'geospatial_stream', 'active')
""")

anchors = [
    ("Chicago Anchor", -87.6298, 41.8781, 1800, "city_anchor"),
    ("Los Angeles Anchor", -118.2437, 34.0522, 1800, "city_anchor"),
    ("Nashville Anchor", -86.7816, 36.1627, 1800, "city_anchor"),
]
for row in anchors:
    cur.execute("""
    INSERT INTO realworld_locations
    (location_name, longitude, latitude, height, location_type, location_status)
    VALUES (?, ?, ?, ?, ?, 'active')
    """, row)

conn.commit()
conn.close()
print("[OK] real world engine tables ready")
PYEOF

########################################
# 4) WRITE CESIUM PAGE
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
      max-width: 420px;
      background: rgba(2, 6, 23, 0.86);
      color: #fff;
      border: 1px solid #334155;
      border-radius: 18px;
      padding: 14px 16px;
      box-shadow: 0 10px 28px rgba(0,0,0,.28);
      backdrop-filter: blur(10px);
    }
    .hud h1 {
      margin: 0 0 8px 0;
      font-size: 1.25rem;
    }
    .hud p {
      margin: 0 0 10px 0;
      line-height: 1.5;
    }
    .row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 10px;
    }
    button, a.action {
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
    button:focus, a.action:focus {
      outline: 3px solid #60a5fa;
      outline-offset: 2px;
    }
    .status {
      margin-top: 8px;
      font-size: 0.92rem;
      color: #cbd5e1;
    }
    .skip-link {
      position: absolute;
      left: -9999px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
      z-index: 20;
    }
    .skip-link:focus {
      left: 16px;
      top: 16px;
      width: auto;
      height: auto;
      background: #111827;
      color: white;
      padding: 12px 16px;
      border-radius: 12px;
    }
  </style>
</head>
<body>
  <a class="skip-link" href="#controls">Skip to controls</a>
  <div id="app">
    <div class="hud">
      <h1>AAM Real World Engine</h1>
      <p>This is the geospatial foundation layer for the world. It is meant to move the platform from a simple 3D scene toward real Earth-scale rendering.</p>
      <div id="controls" class="row">
        <button id="btnChicago">Chicago</button>
        <button id="btnLA">Los Angeles</button>
        <button id="btnNashville">Nashville</button>
      </div>
      <div class="row">
        <a class="action" href="/world3d">Open Web 3D</a>
        <a class="action" href="/engine-bridge">Engine Bridge</a>
        <a class="action" href="/world-experience-control">World Experience</a>
      </div>
      <div class="status" id="statusText">Waiting for Cesium to load...</div>
    </div>
    <div id="cesiumContainer" aria-label="Real world geospatial engine"></div>
  </div>

  <script src="https://cesium.com/downloads/cesiumjs/releases/1.115/Build/Cesium/Cesium.js"></script>
  <script>
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

      setStatus('Cesium loaded. Earth-scale world foundation active.');

      document.getElementById('btnChicago').addEventListener('click', () => flyToLocation(viewer, -87.6298, 41.8781, 1800));
      document.getElementById('btnLA').addEventListener('click', () => flyToLocation(viewer, -118.2437, 34.0522, 1800));
      document.getElementById('btnNashville').addEventListener('click', () => flyToLocation(viewer, -86.7816, 36.1627, 1800));

      flyToLocation(viewer, -87.6298, 41.8781, 1800);
    })();
  </script>
</body>
</html>
HTML

########################################
# 5) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function readCesiumToken() {
  try {
    const fs = require('fs');
    const envPath = 'config/cesium.env';
    if (!fs.existsSync(envPath)) return '';
    const raw = fs.readFileSync(envPath, 'utf8');
    const line = raw.split('\n').find(x => x.trim().startsWith('CESIUM_ION_TOKEN='));
    if (!line) return '';
    return line.split('=').slice(1).join('=').trim();
  } catch (e) {
    return '';
  }
}

function renderRealWorldClientPage(req, user = null, message = '') {
  const profiles = dbQuery(`
    SELECT id, profile_name, engine_name, terrain_mode, imagery_mode, streaming_mode, profile_status, created_at
    FROM realworld_engine_profiles
    ORDER BY id DESC
    LIMIT 50
  `);

  const locations = dbQuery(`
    SELECT id, location_name, longitude, latitude, height, location_type, location_status, created_at
    FROM realworld_locations
    ORDER BY id DESC
    LIMIT 100
  `);

  const profileRows = profiles.map(r => `
    <tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.engine_name}</td><td>${r.terrain_mode}</td><td>${r.imagery_mode}</td><td>${r.streaming_mode}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const locationRows = locations.map(r => `
    <tr><td>${r.id}</td><td>${r.location_name}</td><td>${r.longitude}</td><td>${r.latitude}</td><td>${r.height}</td><td>${r.location_type}</td><td>${r.location_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Real World Engine', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="realworld-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Geospatial Engine Layer</div>
            <h1 id="realworld-title">Real World Engine</h1>
            <p>This route controls the Earth-scale rendering foundation. It complements your Web 3D world by adding real geospatial terrain and world positioning.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/realworld" class="hero-primary-btn">Open Real World Engine</a>
              <a href="/world3d" class="hero-secondary-btn">Open Web 3D</a>
              <a href="/engine-bridge" class="hero-secondary-btn">Engine Bridge</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Engine Profiles', `
          <table aria-label="Real World Engine Profiles">
            <thead><tr><th>ID</th><th>Name</th><th>Engine</th><th>Terrain</th><th>Imagery</th><th>Streaming</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${profileRows || '<tr><td colspan="8">No real world engine profiles yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Anchor Locations', `
          <table aria-label="Real World Locations">
            <thead><tr><th>ID</th><th>Name</th><th>Lon</th><th>Lat</th><th>Height</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${locationRows || '<tr><td colspan="8">No real world locations yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
if "function renderRealWorldClientPage(req, user = null, message = '')" not in text:
    text = text.replace(server_marker, helper + "\n" + server_marker, 1)

if '<a href="/realworld-client">Real World</a>' not in text and '<a href="/web3d-client">Web 3D</a>' in text:
    text = text.replace(
        '<a href="/web3d-client">Web 3D</a>',
        '<a href="/web3d-client">Web 3D</a>\n          <a href="/realworld-client">Real World</a>',
        1
    )

route_block = """
    if (req.method === 'GET' && pathname === '/realworld-token') {
      const token = readCesiumToken();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ token }));
    }

    if (req.method === 'GET' && pathname === '/realworld') {
      try {
        const html = require('fs').readFileSync('public/realworld/index.html', 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(html);
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Real world engine not found');
      }
    }

    if (req.method === 'GET' && pathname === '/realworld-client') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderRealWorldClientPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/realworld'" not in text or "pathname === '/realworld-client'" not in text:
    route_anchor = "    if (req.method === 'GET' && pathname === '/'"
    if route_anchor not in text:
        route_anchor = "    if (pathname === '/'"
    text = text.replace(route_anchor, route_block + "\n" + route_anchor, 1)

p.write_text(text)
print("[OK] real world engine route patch applied")
PYEOF

########################################
# 6) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 7) SMOKE TEST
########################################
for route in \
  / \
  /realworld-client \
  /realworld \
  /world3d \
  /web3d-client \
  /world-experience-control \
  /engine-bridge
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 8) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as realworld_engine_profiles from realworld_engine_profiles;" > "snapshots/realworld_engine_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as realworld_locations from realworld_locations;" > "snapshots/realworld_locations_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as realworld_runtime_events from realworld_runtime_events;" > "snapshots/realworld_runtime_events_${STAMP}.json"

########################################
# 9) ERROR SCAN
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

latest = Path.home() / "aam_full_system" / "snapshots" / "realworld_engine_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] real world engine scan complete: {len(issues)} issues")
PYEOF

########################################
# 10) REPORT
########################################
cat > "reports/cesium_real_world_engine_and_stabilize_${STAMP}.txt" <<REPORT
CESIUM REAL WORLD ENGINE + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- config/cesium.env
- realworld_engine_profiles
- realworld_locations
- realworld_runtime_events
- /realworld-token
- /realworld
- /realworld-client
- public/realworld/index.html

Purpose:
- add a real geospatial world foundation
- move beyond a custom 3d scene into Earth-scale rendering
- stabilize everything around a true world-engine direction
REPORT

echo "CESIUM REAL WORLD ENGINE + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/realworld_engine_scan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/realworld-client"
echo "  termux-open-url http://127.0.0.1:4900/realworld"
echo "  termux-open-url http://127.0.0.1:4900/world3d"
