#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== REALWORLD ANCHOR EXPANSION + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results public/realworld

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_realworld_anchor_${STAMP}.js"
cp db/aam.db "backups/aam_realworld_anchor_${STAMP}.db"
cp public/realworld/index.html "backups/realworld_index_${STAMP}.html"

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
CREATE TABLE IF NOT EXISTS realworld_jump_targets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location_name TEXT NOT NULL,
  jump_label TEXT NOT NULL,
  destination_route TEXT NOT NULL,
  jump_type TEXT NOT NULL DEFAULT 'route_jump',
  target_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

anchors = [
    ("Chicago Anchor", -87.6298, 41.8781, 1800, "city_anchor"),
    ("Los Angeles Anchor", -118.2437, 34.0522, 1800, "city_anchor"),
    ("Nashville Anchor", -86.7816, 36.1627, 1800, "city_anchor"),
    ("San Diego Anchor", -117.1611, 32.7157, 1800, "city_anchor"),
    ("Detroit Anchor", -83.0458, 42.3314, 1800, "city_anchor"),
    ("Herrin Illinois Anchor", -89.0276, 37.8031, 1800, "city_anchor"),
    ("Indiana Anchor", -86.1260, 39.7684, 1800, "state_anchor")
]

for row in anchors:
    cur.execute("""
    INSERT INTO realworld_locations
    (location_name, longitude, latitude, height, location_type, location_status)
    VALUES (?, ?, ?, ?, ?, 'active')
    """, row)

jump_targets = [
    ("Chicago Anchor", "Open Role Hub", "/role-hub"),
    ("Los Angeles Anchor", "Open Watch / Creator Layer", "/watch"),
    ("Nashville Anchor", "Open World Experience", "/world-experience-control"),
    ("San Diego Anchor", "Open Connect System", "/connect-system"),
    ("Detroit Anchor", "Open Engine Bridge", "/engine-bridge"),
    ("Herrin Illinois Anchor", "Open Accessibility Layer", "/accessibility"),
    ("Indiana Anchor", "Open Avatar Rig Layer", "/avatar-rig-control")
]

for row in jump_targets:
    cur.execute("""
    INSERT INTO realworld_jump_targets
    (location_name, jump_label, destination_route, jump_type, target_status)
    VALUES (?, ?, ?, 'route_jump', 'active')
    """, row)

conn.commit()
conn.close()
print("[OK] realworld anchors + jump targets ready")
PYEOF

########################################
# 3) PATCH REALWORLD HTML
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
      max-width: 460px;
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
    .interaction-panel {
      position: absolute;
      right: 12px;
      bottom: 12px;
      z-index: 10;
      width: min(380px, calc(100vw - 24px));
      background: rgba(2, 6, 23, 0.86);
      color: #fff;
      border: 1px solid #334155;
      border-radius: 18px;
      padding: 14px 16px;
      box-shadow: 0 10px 28px rgba(0,0,0,.28);
      backdrop-filter: blur(10px);
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
      <p>This is the geospatial foundation layer for the world. It now includes expanded city and regional anchors.</p>
      <div id="controls" class="row">
        <button id="btnChicago">Chicago</button>
        <button id="btnLA">Los Angeles</button>
        <button id="btnNashville">Nashville</button>
        <button id="btnSanDiego">San Diego</button>
        <button id="btnDetroit">Detroit</button>
        <button id="btnHerrin">Herrin IL</button>
        <button id="btnIndiana">Indiana</button>
      </div>
      <div class="row">
        <a class="action" href="/world3d">Open Web 3D</a>
        <a class="action" href="/engine-bridge">Engine Bridge</a>
        <a class="action" href="/world-experience-control">World Experience</a>
      </div>
      <div class="status" id="statusText">Waiting for Cesium to load...</div>
    </div>

    <div class="interaction-panel" aria-live="polite">
      <h2 style="margin:0 0 8px 0;">Anchor Interaction</h2>
      <p id="interactionText">Choose a city anchor to jump to a linked ecosystem surface.</p>
      <div class="row">
        <a id="interactionLink" class="action" href="/realworld-client">Open Target</a>
      </div>
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

      const anchors = [
        { name: 'Chicago', lon: -87.6298, lat: 41.8781, height: 1800, route: '/role-hub', desc: 'Central platform routing and operations.' },
        { name: 'Los Angeles', lon: -118.2437, lat: 34.0522, height: 1800, route: '/watch', desc: 'Creator and streaming surfaces.' },
        { name: 'Nashville', lon: -86.7816, lat: 36.1627, height: 1800, route: '/world-experience-control', desc: 'World experience and immersion layer.' },
        { name: 'San Diego', lon: -117.1611, lat: 32.7157, height: 1800, route: '/connect-system', desc: 'Brand, domain, store, and wallet connections.' },
        { name: 'Detroit', lon: -83.0458, lat: 42.3314, height: 1800, route: '/engine-bridge', desc: 'Engine and systems bridge layer.' },
        { name: 'Herrin IL', lon: -89.0276, lat: 37.8031, height: 1800, route: '/accessibility', desc: 'Accessibility and disability-friendly control layer.' },
        { name: 'Indiana', lon: -86.1260, lat: 39.7684, height: 1800, route: '/avatar-rig-control', desc: 'Avatar rig and holographic character control.' }
      ];

      anchors.forEach(anchor => {
        const entity = viewer.entities.add({
          name: anchor.name,
          position: Cesium.Cartesian3.fromDegrees(anchor.lon, anchor.lat),
          point: {
            pixelSize: 12,
            color: Cesium.Color.CYAN,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2
          },
          label: {
            text: anchor.name,
            font: '14px sans-serif',
            fillColor: Cesium.Color.WHITE,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -14)
          },
          properties: {
            route: anchor.route,
            desc: anchor.desc
          }
        });
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

      document.getElementById('btnChicago').addEventListener('click', () => { flyToLocation(viewer, -87.6298, 41.8781, 1800); setInteraction('Chicago', 'Central platform routing and operations.', '/role-hub'); });
      document.getElementById('btnLA').addEventListener('click', () => { flyToLocation(viewer, -118.2437, 34.0522, 1800); setInteraction('Los Angeles', 'Creator and streaming surfaces.', '/watch'); });
      document.getElementById('btnNashville').addEventListener('click', () => { flyToLocation(viewer, -86.7816, 36.1627, 1800); setInteraction('Nashville', 'World experience and immersion layer.', '/world-experience-control'); });
      document.getElementById('btnSanDiego').addEventListener('click', () => { flyToLocation(viewer, -117.1611, 32.7157, 1800); setInteraction('San Diego', 'Brand, domain, store, and wallet connections.', '/connect-system'); });
      document.getElementById('btnDetroit').addEventListener('click', () => { flyToLocation(viewer, -83.0458, 42.3314, 1800); setInteraction('Detroit', 'Engine and systems bridge layer.', '/engine-bridge'); });
      document.getElementById('btnHerrin').addEventListener('click', () => { flyToLocation(viewer, -89.0276, 37.8031, 1800); setInteraction('Herrin IL', 'Accessibility and disability-friendly control layer.', '/accessibility'); });
      document.getElementById('btnIndiana').addEventListener('click', () => { flyToLocation(viewer, -86.1260, 39.7684, 1800); setInteraction('Indiana', 'Avatar rig and holographic character control.', '/avatar-rig-control'); });

      setStatus('Cesium loaded. Expanded anchor network active.');
      flyToLocation(viewer, -87.6298, 41.8781, 1800);
      setInteraction('Chicago', 'Central platform routing and operations.', '/role-hub');
    })();
  </script>
</body>
</html>
HTML

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
  /realworld-client \
  /realworld \
  /world3d \
  /web3d-client \
  /world-experience-control \
  /engine-bridge \
  /connect-system \
  /accessibility \
  /avatar-rig-control
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as realworld_locations from realworld_locations;" > "snapshots/realworld_locations_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as realworld_jump_targets from realworld_jump_targets;" > "snapshots/realworld_jump_targets_${STAMP}.json"
sqlite3 -json db/aam.db "select id, location_name, longitude, latitude, height, location_type, location_status, created_at from realworld_locations order by id desc limit 100;" > "snapshots/realworld_locations_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, location_name, jump_label, destination_route, jump_type, target_status, created_at from realworld_jump_targets order by id desc limit 100;" > "snapshots/realworld_jump_targets_tail_${STAMP}.json"

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
    if "real world engine not found" in lower:
        issues.append({"file": f.name, "problem": "realworld_missing"})

latest = Path.home() / "aam_full_system" / "snapshots" / "realworld_anchor_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] realworld anchor scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/realworld_anchor_expansion_and_stabilize_${STAMP}.txt" <<REPORT
REALWORLD ANCHOR EXPANSION + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- San Diego anchor
- Detroit anchor
- Herrin Illinois anchor
- Indiana anchor
- realworld_jump_targets
- clickable geospatial anchor routing

Purpose:
- expand the real-world engine city network
- connect more locations into the ecosystem
- stabilize everything around broader world coverage
REPORT

echo "REALWORLD ANCHOR EXPANSION + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/realworld_anchor_scan_latest.json"
echo "  cat snapshots/realworld_locations_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/realworld-client"
echo "  termux-open-url http://127.0.0.1:4900/realworld"
echo "  termux-open-url http://127.0.0.1:4900/world3d"
