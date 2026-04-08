#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== VISUAL MOTION LAYER BUILD START ==="

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
CREATE TABLE IF NOT EXISTS world_state_sync (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    sync_key TEXT NOT NULL,
    sync_value TEXT,
    sync_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS world_hud_panels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    hud_name TEXT NOT NULL,
    hud_value TEXT,
    hud_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed sync rows
cur.execute("SELECT count(*) FROM world_state_sync")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO world_state_sync (scene_id, sync_key, sync_value, sync_status)
        VALUES (?, ?, ?, ?)
    """, [
        (1, "active_users", "1", "active"),
        (1, "portal_status", "stable", "active"),
        (2, "ops_nodes", "4", "active"),
        (3, "creator_rooms", "2", "active"),
    ])

# seed hud panels
cur.execute("SELECT count(*) FROM world_hud_panels")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO world_hud_panels (scene_id, hud_name, hud_value, hud_status)
        VALUES (?, ?, ?, ?)
    """, [
        (1, "Commerce Traffic", "Normal", "active"),
        (1, "Books Live", "3", "active"),
        (2, "IoT Telemetry", "Healthy", "active"),
        (2, "Logistics Routes", "3 Active", "active"),
        (3, "Creator Rooms", "2 Live", "active"),
        (3, "Hybrid Worlds", "Ready", "active"),
    ])

conn.commit()
conn.close()
print("[OK] visual motion DB additions ready")
PYEOF

########################################
# 2) PATCH DASHBOARD
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

def insert_before(marker: str, block: str):
    global text
    if block.strip() not in text and marker in text:
        text = text.replace(marker, block + "\n" + marker)

if '<a href="/motion-worlds">Motion Worlds</a>' not in text and '<a href="/live-3d">Live 3D</a>' in text:
    text = text.replace(
        '<a href="/live-3d">Live 3D</a>',
        '<a href="/live-3d">Live 3D</a>\n      <a href="/motion-worlds">Motion Worlds</a>'
    )

pages = r'''
function renderMotionWorldsIndex(user = null) {
  const scenes = dbQuery("SELECT id, scene_name, scene_type, scene_status FROM scene_registry ORDER BY id ASC");

  const cards = scenes.map(s => `
    <div class="card">
      <h3><a href="/motion-worlds/${s.id}">${s.scene_name}</a></h3>
      <p><strong>Type:</strong> ${s.scene_type}</p>
      <p><strong>Status:</strong> ${s.scene_status}</p>
      <a href="/motion-worlds/${s.id}">Launch Motion World</a>
    </div>
  `).join('');

  return htmlPage('Motion Worlds', `
    <div class="section">
      <div class="card">
        <h2>Motion Worlds</h2>
        <p>This adds animated visual motion, a world HUD, portal glow cues, and the first world-state sync foundation.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards || '<div class="card"><p>No scenes available.</p></div>'}</div>
    </div>
  `, user);
}

function renderMotionWorldDetail(sceneId, user = null) {
  const sceneRows = dbQuery(`SELECT id, scene_name, scene_type, scene_status FROM scene_registry WHERE id=${Number(sceneId)} LIMIT 1`);
  if (!sceneRows.length) return htmlPage('Not Found', `<div class="card"><h2>Scene not found</h2></div>`, user);

  const s = sceneRows[0];

  const hud = dbQuery(`
    SELECT hud_name, hud_value, hud_status
    FROM world_hud_panels
    WHERE scene_id=${Number(sceneId)}
    ORDER BY id ASC
  `);

  const sync = dbQuery(`
    SELECT sync_key, sync_value, sync_status
    FROM world_state_sync
    WHERE scene_id=${Number(sceneId)}
    ORDER BY id ASC
  `);

  const portals = dbQuery(`
    SELECT p.portal_name, p.target_scene_id, sr.scene_name as target_scene_name
    FROM scene_portals p
    LEFT JOIN scene_registry sr ON sr.id = p.target_scene_id
    WHERE p.source_scene_id=${Number(sceneId)}
    ORDER BY p.id ASC
  `);

  const panelButtons = dbQuery(`
    SELECT panel_title, target_path
    FROM scene_media_panels
    WHERE scene_id=${Number(sceneId)}
    ORDER BY id ASC
  `).map(p => `<a href="${p.target_path || '#'}" class="secondary" style="margin:6px;">${p.panel_title}</a>`).join('');

  const hudHtml = hud.map(h => `<div class="pill">${h.hud_name}: ${h.hud_value}</div>`).join('');
  const syncRows = sync.map(r => `<tr><td>${r.sync_key}</td><td>${r.sync_value || ''}</td><td>${r.sync_status}</td></tr>`).join('');
  const portalButtons = portals.map(p => `<a href="/motion-worlds/${p.target_scene_id}" style="margin:6px;">${p.portal_name} → ${p.target_scene_name || ('Scene ' + p.target_scene_id)}</a>`).join('');

  return htmlPage('Motion World Detail', `
    <div class="section">
      <div class="card">
        <h2>${s.scene_name}</h2>
        <p><strong>Type:</strong> ${s.scene_type}</p>
        <p><strong>Status:</strong> ${s.scene_status}</p>
        <div>${hudHtml || ''}</div>
      </div>
    </div>

    <div class="section">
      <div class="card" style="padding:0; overflow:hidden;">
        <div style="
          position:relative;
          width:100%;
          min-height:560px;
          background:
            radial-gradient(circle at center, rgba(56,189,248,0.18), rgba(2,6,23,0.96) 55%),
            linear-gradient(180deg, #020617 0%, #0f172a 100%);
          overflow:hidden;
        ">
          <style>
            @keyframes floatNode {
              0% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-16px) scale(1.04); }
              100% { transform: translateY(0px) scale(1); }
            }
            @keyframes pulsePortal {
              0% { box-shadow: 0 0 12px rgba(96,165,250,0.25); }
              50% { box-shadow: 0 0 36px rgba(96,165,250,0.65); }
              100% { box-shadow: 0 0 12px rgba(96,165,250,0.25); }
            }
            @keyframes driftGrid {
              0% { background-position: 0 0, 0 0; }
              100% { background-position: 40px 40px, 40px 40px; }
            }
          </style>

          <div style="
            position:absolute;
            inset:0;
            background-image:
              linear-gradient(rgba(96,165,250,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(96,165,250,0.08) 1px, transparent 1px);
            background-size:40px 40px;
            animation:driftGrid 8s linear infinite;
          "></div>

          <div style="position:absolute; left:8%; top:16%; width:120px; height:120px; border-radius:24px; border:1px solid #60a5fa; background:rgba(37,99,235,0.16); display:flex; align-items:center; justify-content:center; text-align:center; animation:floatNode 4s ease-in-out infinite;">
            <div>World Node</div>
          </div>

          <div style="position:absolute; left:38%; top:28%; width:150px; height:150px; border-radius:999px; border:1px solid #7dd3fc; background:rgba(14,165,233,0.14); display:flex; align-items:center; justify-content:center; text-align:center; animation:pulsePortal 2.5s ease-in-out infinite;">
            <div>Portal Core</div>
          </div>

          <div style="position:absolute; left:70%; top:20%; width:130px; height:130px; border-radius:24px; border:1px solid #60a5fa; background:rgba(37,99,235,0.16); display:flex; align-items:center; justify-content:center; text-align:center; animation:floatNode 5s ease-in-out infinite;">
            <div>Media Node</div>
          </div>

          <div style="position:absolute; left:22%; top:68%; width:130px; height:130px; border-radius:24px; border:1px solid #38bdf8; background:rgba(8,145,178,0.16); display:flex; align-items:center; justify-content:center; text-align:center; animation:floatNode 4.5s ease-in-out infinite;">
            <div>Commerce Node</div>
          </div>

          <div style="position:absolute; left:66%; top:66%; width:140px; height:140px; border-radius:24px; border:1px solid #22d3ee; background:rgba(6,182,212,0.16); display:flex; align-items:center; justify-content:center; text-align:center; animation:floatNode 3.8s ease-in-out infinite;">
            <div>Quantum Layer</div>
          </div>

          <div style="position:absolute; right:20px; top:20px; width:260px; background:rgba(2,6,23,0.76); border:1px solid #334155; border-radius:18px; padding:14px;">
            <h3 style="margin-top:0;">World HUD</h3>
            <div>${hudHtml || '<span class="pill">No HUD panels</span>'}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Portal Travel</h3>
          <div>${portalButtons || '<p>No portals configured.</p>'}</div>
        </div>
        <div class="card">
          <h3>Embedded Panels</h3>
          <div>${panelButtons || '<p>No embedded panels configured.</p>'}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>World State Sync</h3>
        <table>
          <thead><tr><th>Key</th><th>Value</th><th>Status</th></tr></thead>
          <tbody>${syncRows || '<tr><td colspan="3">No sync rows found.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", pages)

anchor = "    if (req.method === 'GET' && pathname === '/live-3d') {"
if "pathname === '/motion-worlds'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/motion-worlds') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderMotionWorldsIndex(authUser));
    }

    if (req.method === 'GET' && pathname.startsWith('/motion-worlds/')) {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      const sceneId = Number(pathname.split('/')[2]);
      dbRun(`INSERT INTO scene_visit_log (scene_id, avatar_id, visit_type, visit_notes)
             VALUES (${Number(sceneId)}, 1, 'motion_world_open', 'Motion world page opened from admin shell')`);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderMotionWorldDetail(sceneId, authUser));
    }

    if (req.method === 'GET' && pathname === '/live-3d') {"""
    text = text.replace(anchor, routes)

p.write_text(text)
print("[OK] visual motion layer patch applied")
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

cp apps/dashboard.js "backups/dashboard_visual_motion_${STAMP}.js"
cp db/aam.db "backups/aam_visual_motion_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as world_state_sync from world_state_sync;" > "snapshots/world_state_sync_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_hud_panels from world_hud_panels;" > "snapshots/world_hud_panels_${STAMP}.json"

echo "VISUAL MOTION LAYER CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/motion-worlds"
echo "  termux-open-url http://127.0.0.1:4900/motion-worlds/1"
