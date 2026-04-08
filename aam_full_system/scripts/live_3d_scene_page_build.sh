#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== LIVE 3D SCENE PAGE BUILD START ==="

########################################
# 1) PATCH DASHBOARD
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

def insert_before(marker: str, block: str):
    global text
    if block.strip() not in text and marker in text:
        text = text.replace(marker, block + "\n" + marker)

if '<a href="/live-3d">Live 3D</a>' not in text and '<a href="/scene-runtime">Scene Runtime</a>' in text:
    text = text.replace(
        '<a href="/scene-runtime">Scene Runtime</a>',
        '<a href="/scene-runtime">Scene Runtime</a>\n      <a href="/live-3d">Live 3D</a>'
    )

pages = r'''
function renderLive3DIndex(user = null) {
  const scenes = dbQuery("SELECT id, scene_name, scene_type, scene_status FROM scene_registry ORDER BY id ASC");

  const cards = scenes.map(s => `
    <div class="card">
      <h3><a href="/live-3d/${s.id}">${s.scene_name}</a></h3>
      <p><strong>Type:</strong> ${s.scene_type}</p>
      <p><strong>Status:</strong> ${s.scene_status}</p>
      <a href="/live-3d/${s.id}">Launch Scene</a>
    </div>
  `).join('');

  return htmlPage('Live 3D Worlds', `
    <div class="section">
      <div class="card">
        <h2>Live 3D World Launcher</h2>
        <p>This is the first visual immersive layer. It presents scenes as a live rendered world shell with portals, control panels, and quantum optimization summaries.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards || '<div class="card"><p>No scenes available.</p></div>'}</div>
    </div>
  `, user);
}

function renderLive3DScene(sceneId, user = null) {
  const sceneRows = dbQuery(`SELECT id, scene_name, scene_type, scene_status FROM scene_registry WHERE id=${Number(sceneId)} LIMIT 1`);
  if (!sceneRows.length) return htmlPage('Not Found', `<div class="card"><h2>Scene not found</h2></div>`, user);

  const s = sceneRows[0];

  const portals = dbQuery(`
    SELECT p.id, p.portal_name, p.target_scene_id, sr.scene_name as target_scene_name
    FROM scene_portals p
    LEFT JOIN scene_registry sr ON sr.id = p.target_scene_id
    WHERE p.source_scene_id=${Number(sceneId)}
    ORDER BY p.id ASC
  `);

  const panels = dbQuery(`
    SELECT id, panel_title, panel_type, target_path
    FROM scene_media_panels
    WHERE scene_id=${Number(sceneId)}
    ORDER BY id ASC
  `);

  const perf = dbQuery("SELECT profile_name, profile_type FROM performance_profiles ORDER BY id ASC");
  const engineRows = dbQuery(`
    SELECT g.generator_name, g.dimension_mode, i.engine_name, h.engine_name as game_engine
    FROM engine_scene_links l
    LEFT JOIN holographic_generators g ON g.id = l.generator_id
    LEFT JOIN immersive_engines i ON i.id = l.immersive_engine_id
    LEFT JOIN hybrid_game_engines h ON h.id = l.game_engine_id
    WHERE l.scene_id=${Number(sceneId)}
    LIMIT 1
  `);
  const engine = engineRows.length ? engineRows[0] : {};

  const portalButtons = portals.map(p => `
    <a href="/live-3d/${p.target_scene_id}" style="margin:6px;">${p.portal_name} → ${p.target_scene_name || ('Scene ' + p.target_scene_id)}</a>
  `).join('');

  const panelButtons = panels.map(m => `
    <a href="${m.target_path || '#'}" class="secondary" style="margin:6px;">${m.panel_title}</a>
  `).join('');

  const perfPills = perf.map(r => `<span class="pill">${r.profile_name}</span>`).join('');

  const sceneObjects = [
    { left: '8%', top: '18%', label: 'Portal Node' },
    { left: '38%', top: '34%', label: 'Media Panel' },
    { left: '67%', top: '22%', label: 'Commerce Node' },
    { left: '24%', top: '68%', label: 'Holo Display' },
    { left: '72%', top: '66%', label: 'Quantum Engine' }
  ].map(o => `
    <div style="
      position:absolute;
      left:${o.left};
      top:${o.top};
      width:120px;
      height:120px;
      border-radius:24px;
      border:1px solid #60a5fa;
      background:rgba(37,99,235,0.14);
      display:flex;
      align-items:center;
      justify-content:center;
      text-align:center;
      padding:8px;
      box-shadow:0 0 24px rgba(96,165,250,0.25);
      backdrop-filter:blur(2px);
    ">
      <div>
        <div style="font-size:13px; font-weight:bold;">${o.label}</div>
      </div>
    </div>
  `).join('');

  return htmlPage('Live 3D Scene', `
    <div class="section">
      <div class="card">
        <h2>${s.scene_name}</h2>
        <p><strong>Type:</strong> ${s.scene_type}</p>
        <p><strong>Status:</strong> ${s.scene_status}</p>
        <p><strong>Generator:</strong> ${engine.generator_name || ''}</p>
        <p><strong>Dimension:</strong> ${engine.dimension_mode || ''}</p>
        <p><strong>Immersive Engine:</strong> ${engine.engine_name || ''}</p>
        <p><strong>Game Engine:</strong> ${engine.game_engine || ''}</p>
        <div>${perfPills || ''}</div>
      </div>
    </div>

    <div class="section">
      <div class="card" style="padding:0; overflow:hidden;">
        <div style="
          position:relative;
          width:100%;
          min-height:520px;
          background:
            radial-gradient(circle at center, rgba(59,130,246,0.20), rgba(2,6,23,0.95) 55%),
            linear-gradient(180deg, #020617 0%, #0f172a 100%);
        ">
          <div style="
            position:absolute;
            inset:0;
            background-image:
              linear-gradient(rgba(96,165,250,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(96,165,250,0.08) 1px, transparent 1px);
            background-size: 40px 40px;
          "></div>

          <div style="
            position:absolute;
            left:50%;
            top:50%;
            transform:translate(-50%,-50%);
            width:260px;
            height:260px;
            border-radius:50%;
            border:1px solid rgba(125,211,252,0.45);
            box-shadow:0 0 80px rgba(56,189,248,0.22);
          "></div>

          ${sceneObjects}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Portals</h3>
          <div>${portalButtons || '<p>No portals configured.</p>'}</div>
        </div>
        <div class="card">
          <h3>Embedded Panels</h3>
          <div>${panelButtons || '<p>No media panels configured.</p>'}</div>
        </div>
      </div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", pages)

anchor = "    if (req.method === 'GET' && pathname === '/scene-runtime') {"
if "pathname === '/live-3d'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/live-3d') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderLive3DIndex(authUser));
    }

    if (req.method === 'GET' && pathname.startsWith('/live-3d/')) {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      const sceneId = Number(pathname.split('/')[2]);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderLive3DScene(sceneId, authUser));
    }

    if (req.method === 'GET' && pathname === '/scene-runtime') {"""
    text = text.replace(anchor, routes)

p.write_text(text)
print("[OK] live 3D scene page patch applied")
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

cp apps/dashboard.js "backups/dashboard_live_3d_${STAMP}.js"
cp db/aam.db "backups/aam_live_3d_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as scene_registry from scene_registry;" > "snapshots/live3d_scene_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scene_portals from scene_portals;" > "snapshots/live3d_scene_portals_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scene_media_panels from scene_media_panels;" > "snapshots/live3d_scene_media_panels_${STAMP}.json"

echo "LIVE 3D SCENE PAGE CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/live-3d"
echo "  termux-open-url http://127.0.0.1:4900/live-3d/1"
