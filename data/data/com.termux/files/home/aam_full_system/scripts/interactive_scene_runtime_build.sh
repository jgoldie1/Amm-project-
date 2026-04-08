#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== INTERACTIVE SCENE RUNTIME BUILD START ==="

########################################
# 1) DB ADDITIONS
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS scene_portals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_scene_id INTEGER NOT NULL,
    target_scene_id INTEGER NOT NULL,
    portal_name TEXT NOT NULL,
    portal_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS scene_media_panels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    panel_title TEXT NOT NULL,
    panel_type TEXT NOT NULL,
    target_path TEXT,
    panel_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed portals
cur.execute("SELECT count(*) FROM scene_portals")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO scene_portals (source_scene_id, target_scene_id, portal_name, portal_status)
        VALUES (?, ?, ?, ?)
    """, [
        (1, 2, "Operations Portal", "active"),
        (2, 3, "Creator Portal", "active"),
        (3, 1, "Commerce Portal", "active"),
    ])

# seed media panels
cur.execute("SELECT count(*) FROM scene_media_panels")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO scene_media_panels (scene_id, panel_title, panel_type, target_path, panel_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        (1, "Book Store Panel", "books", "/books", "active"),
        (1, "Podcast Rooms Panel", "rooms", "/rooms", "active"),
        (2, "IoT Ops Panel", "iot", "/iot", "active"),
        (2, "Logistics Panel", "logistics", "/logistics", "active"),
        (3, "Hybrid Games Panel", "games", "/hybrid-games", "active"),
        (3, "Quantum Holo Panel", "holo", "/quantum-holo", "active"),
    ])

conn.commit()
conn.close()
print("[OK] interactive runtime DB additions ready")
PYEOF

########################################
# 2) PATCH DASHBOARD
########################################
python << 'PYEOF'
from pathlib import Path
import re

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

def insert_before(marker: str, block: str):
    global text
    if block.strip() not in text and marker in text:
        text = text.replace(marker, block + "\n" + marker)

if '<a href="/scene-runtime">Scene Runtime</a>' not in text and '<a href="/scene-viewer">Scene Viewer</a>' in text:
    text = text.replace(
        '<a href="/scene-viewer">Scene Viewer</a>',
        '<a href="/scene-viewer">Scene Viewer</a>\n      <a href="/scene-runtime">Scene Runtime</a>'
    )

pages = r'''
function renderSceneRuntimeIndex(user = null) {
  const scenes = dbQuery("SELECT id, scene_name, scene_type, scene_status FROM scene_registry ORDER BY id ASC");

  const cards = scenes.map(s => `
    <div class="card">
      <h3><a href="/scene-runtime/${s.id}">${s.scene_name}</a></h3>
      <p><strong>Type:</strong> ${s.scene_type}</p>
      <p><strong>Status:</strong> ${s.scene_status}</p>
      <a href="/scene-runtime/${s.id}">Open Runtime</a>
    </div>
  `).join('');

  return htmlPage('Scene Runtime', `
    <div class="section">
      <div class="card">
        <h2>Interactive Scene Runtime</h2>
        <p>This is the first live immersive runtime layer. It connects scene previews, portals, media panels, and optimization profiles into a navigable world shell.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards || '<div class="card"><p>No scenes available.</p></div>'}</div>
    </div>
  `, user);
}

function renderSceneRuntimeDetail(sceneId, user = null) {
  const sceneRows = dbQuery(`SELECT id, scene_name, scene_type, scene_url, scene_status FROM scene_registry WHERE id=${Number(sceneId)} LIMIT 1`);
  if (!sceneRows.length) return htmlPage('Not Found', `<div class="card"><h2>Scene not found</h2></div>`, user);

  const s = sceneRows[0];

  const portals = dbQuery(`
    SELECT p.id, p.portal_name, p.target_scene_id, sr.scene_name as target_scene_name, p.portal_status
    FROM scene_portals p
    LEFT JOIN scene_registry sr ON sr.id = p.target_scene_id
    WHERE p.source_scene_id=${Number(sceneId)}
    ORDER BY p.id ASC
  `);

  const panels = dbQuery(`
    SELECT id, panel_title, panel_type, target_path, panel_status
    FROM scene_media_panels
    WHERE scene_id=${Number(sceneId)}
    ORDER BY id ASC
  `);

  const perf = dbQuery("SELECT profile_name, profile_type, optimization_target, profile_status FROM performance_profiles ORDER BY id ASC");
  const links = dbQuery(`
    SELECT g.generator_name, g.dimension_mode, i.engine_name, h.engine_name as game_engine
    FROM engine_scene_links l
    LEFT JOIN holographic_generators g ON g.id = l.generator_id
    LEFT JOIN immersive_engines i ON i.id = l.immersive_engine_id
    LEFT JOIN hybrid_game_engines h ON h.id = l.game_engine_id
    WHERE l.scene_id=${Number(sceneId)}
    LIMIT 1
  `);

  const runtime = links.length ? links[0] : {};

  const portalCards = portals.map(p => `
    <div class="card">
      <h3>${p.portal_name}</h3>
      <p><strong>Status:</strong> ${p.portal_status}</p>
      <p><strong>Target:</strong> ${p.target_scene_name || ('Scene ' + p.target_scene_id)}</p>
      <a href="/scene-runtime/${p.target_scene_id}">Enter Portal</a>
    </div>
  `).join('');

  const panelCards = panels.map(m => `
    <div class="card">
      <h3>${m.panel_title}</h3>
      <p><strong>Type:</strong> ${m.panel_type}</p>
      <p><strong>Status:</strong> ${m.panel_status}</p>
      <a href="${m.target_path || '#'}">Open Panel</a>
    </div>
  `).join('');

  const perfRows = perf.map(r => `
    <tr>
      <td>${r.profile_name}</td>
      <td>${r.profile_type}</td>
      <td>${r.optimization_target || ''}</td>
      <td>${r.profile_status}</td>
    </tr>
  `).join('');

  return htmlPage('Scene Runtime Detail', `
    <div class="section">
      <div class="card">
        <h2>${s.scene_name}</h2>
        <p><strong>Type:</strong> ${s.scene_type}</p>
        <p><strong>Status:</strong> ${s.scene_status}</p>
        <p><strong>Scene File:</strong> <code>${s.scene_url || ''}</code></p>
        <p><strong>Holo Generator:</strong> ${runtime.generator_name || ''}</p>
        <p><strong>Dimension Mode:</strong> ${runtime.dimension_mode || ''}</p>
        <p><strong>Immersive Engine:</strong> ${runtime.engine_name || ''}</p>
        <p><strong>Game Engine:</strong> ${runtime.game_engine || ''}</p>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        ${portalCards || '<div class="card"><p>No portals configured.</p></div>'}
      </div>
    </div>

    <div class="section">
      <div class="grid">
        ${panelCards || '<div class="card"><p>No media panels configured.</p></div>'}
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Quantum Performance Layer</h3>
        <table>
          <thead><tr><th>Profile</th><th>Type</th><th>Target</th><th>Status</th></tr></thead>
          <tbody>${perfRows || '<tr><td colspan="4">No performance profiles found.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", pages)

anchor = "    if (req.method === 'GET' && pathname === '/scene-viewer') {"
if "pathname === '/scene-runtime'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/scene-runtime') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderSceneRuntimeIndex(authUser));
    }

    if (req.method === 'GET' && pathname.startsWith('/scene-runtime/')) {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      const sceneId = Number(pathname.split('/')[2]);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderSceneRuntimeDetail(sceneId, authUser));
    }

    if (req.method === 'GET' && pathname === '/scene-viewer') {"""
    text = text.replace(anchor, routes)

p.write_text(text)
print("[OK] interactive scene runtime patch applied")
PYEOF

########################################
# 3) RESTART / VERIFY
########################################
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh

########################################
# 4) CHECKPOINT
########################################
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots

cp apps/dashboard.js "backups/dashboard_scene_runtime_${STAMP}.js"
cp db/aam.db "backups/aam_scene_runtime_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as scene_portals from scene_portals;" > "snapshots/scene_portals_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scene_media_panels from scene_media_panels;" > "snapshots/scene_media_panels_${STAMP}.json"

echo "INTERACTIVE SCENE RUNTIME CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/scene-runtime"
echo "  termux-open-url http://127.0.0.1:4900/scene-runtime/1"
