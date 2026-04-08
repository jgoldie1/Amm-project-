#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== NEXT PART SCENE VIEWER START ==="

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
CREATE TABLE IF NOT EXISTS robotics_command_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    command_name TEXT NOT NULL,
    command_status TEXT NOT NULL DEFAULT 'queued',
    command_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(asset_id) REFERENCES robotics_assets(id)
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS manufacturing_job_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    event_name TEXT NOT NULL,
    event_status TEXT NOT NULL DEFAULT 'logged',
    event_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(job_id) REFERENCES manufacturing_jobs(id)
)
""")

# seed starter command log
count = cur.execute("SELECT count(*) FROM robotics_command_log").fetchone()[0]
if count == 0:
    cur.executemany("""
        INSERT INTO robotics_command_log (asset_id, command_name, command_status, command_notes)
        VALUES (?, ?, ?, ?)
    """, [
        (1, "boot_system", "completed", "Initial robotics boot sequence logged."),
        (2, "standby_mode", "completed", "Drone system placed in standby."),
        (3, "maintenance_check", "queued", "Nano printer diagnostic pending.")
    ])

count = cur.execute("SELECT count(*) FROM manufacturing_job_log").fetchone()[0]
if count == 0:
    cur.executemany("""
        INSERT INTO manufacturing_job_log (job_id, event_name, event_status, event_notes)
        VALUES (?, ?, ?, ?)
    """, [
        (1, "job_created", "logged", "Initial print workflow created."),
        (2, "materials_staged", "logged", "Nano materials staged."),
        (3, "queue_confirmed", "logged", "12D job confirmed in queue.")
    ])

conn.commit()
conn.close()
print("[OK] scene viewer DB additions ready")
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

if '<a href="/scene-viewer">Scene Viewer</a>' not in text and '<a href="/scenes">Scenes</a>' in text:
    text = text.replace(
        '<a href="/scenes">Scenes</a>',
        '<a href="/scenes">Scenes</a>\n      <a href="/scene-viewer">Scene Viewer</a>'
    )

pages = r'''
const fs = require('fs');

function renderSceneViewerPage(user = null) {
  const rows = dbQuery("SELECT id, scene_name, scene_type, scene_url, scene_status FROM scene_registry ORDER BY id DESC");

  const cards = rows.map(s => `
    <div class="card">
      <h3><a href="/scene-viewer/${s.id}">${s.scene_name}</a></h3>
      <p><strong>Type:</strong> ${s.scene_type}</p>
      <p><strong>Status:</strong> ${s.scene_status}</p>
      <p><code>${s.scene_url || ''}</code></p>
    </div>
  `).join('');

  return htmlPage('Scene Viewer', `
    <div class="section">
      <div class="card">
        <h2>Scene Viewer</h2>
        <p>This is the first immersive bridge layer. It previews scene definitions and prepares the platform for real 3D rendering and holographic UI overlays.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards || '<div class="card"><p>No scenes yet.</p></div>'}</div>
    </div>
  `, user);
}

function renderSceneViewerDetail(sceneId, user = null) {
  const rows = dbQuery(`SELECT id, scene_name, scene_type, scene_url, linked_world_id, scene_status, created_at FROM scene_registry WHERE id=${Number(sceneId)} LIMIT 1`);
  if (!rows.length) return htmlPage('Not Found', `<div class="card"><h2>Scene not found</h2></div>`, user);

  const s = rows[0];
  let sceneJson = 'Scene file not found.';
  try {
    if (s.scene_url) {
      const rel = String(s.scene_url).replace(/^\/+/, '');
      sceneJson = fs.readFileSync(rel, 'utf8');
    }
  } catch (err) {
    sceneJson = `Scene file read error: ${err.message}`;
  }

  return htmlPage('Scene Preview', `
    <div class="section">
      <div class="card">
        <h2>${s.scene_name}</h2>
        <p><strong>Type:</strong> ${s.scene_type}</p>
        <p><strong>World:</strong> ${s.linked_world_id || ''}</p>
        <p><strong>Status:</strong> ${s.scene_status}</p>
        <p><strong>Scene URL:</strong> <code>${s.scene_url || ''}</code></p>
        <p class="muted">${s.created_at || ''}</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <h3>Scene JSON Preview</h3>
        <pre>${sceneJson}</pre>
      </div>
    </div>
  `, user);
}

function renderRoboticsCommandsPage(user = null) {
  const rows = dbQuery(`
    SELECT l.id, a.asset_name, l.command_name, l.command_status, l.command_notes, l.created_at
    FROM robotics_command_log l
    JOIN robotics_assets a ON a.id = l.asset_id
    ORDER BY l.id DESC
    LIMIT 100
  `);

  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.asset_name}</td>
      <td>${r.command_name}</td>
      <td>${r.command_status}</td>
      <td>${r.command_notes || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Robotics Commands', `
    <div class="section">
      <div class="card">
        <h2>Robotics Command Log</h2>
        <p>Tracks robot, drone, printer, and future manufacturing control commands.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Asset</th><th>Command</th><th>Status</th><th>Notes</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="6">No commands yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderManufacturingLogPage(user = null) {
  const rows = dbQuery(`
    SELECT l.id, j.job_name, l.event_name, l.event_status, l.event_notes, l.created_at
    FROM manufacturing_job_log l
    JOIN manufacturing_jobs j ON j.id = l.job_id
    ORDER BY l.id DESC
    LIMIT 100
  `);

  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.job_name}</td>
      <td>${r.event_name}</td>
      <td>${r.event_status}</td>
      <td>${r.event_notes || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Manufacturing Log', `
    <div class="section">
      <div class="card">
        <h2>Manufacturing Job Log</h2>
        <p>Tracks print, nano fabrication, and 12D manufacturing workflow events.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Job</th><th>Event</th><th>Status</th><th>Notes</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="6">No manufacturing events yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", pages)

if '<a href="/robotics-commands">Robot Cmd</a>' not in text and '<a href="/robotics">Robotics</a>' in text:
    text = text.replace(
        '<a href="/robotics">Robotics</a>',
        '<a href="/robotics">Robotics</a>\n      <a href="/robotics-commands">Robot Cmd</a>\n      <a href="/manufacturing-log">Mfg Log</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/scenes') {"
if "pathname === '/scene-viewer'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/scene-viewer') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderSceneViewerPage(authUser));
    }

    if (req.method === 'GET' && pathname.startsWith('/scene-viewer/')) {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      const sceneId = Number(pathname.split('/')[2]);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderSceneViewerDetail(sceneId, authUser));
    }

    if (req.method === 'GET' && pathname === '/robotics-commands') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderRoboticsCommandsPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/manufacturing-log') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderManufacturingLogPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/scenes') {"""
    text = text.replace(anchor, routes)

p.write_text(text)
print("[OK] next part scene viewer patch applied")
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

cp apps/dashboard.js "backups/dashboard_scene_viewer_${STAMP}.js"
cp db/aam.db "backups/aam_scene_viewer_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as robotics_command_log from robotics_command_log;" > "snapshots/robotics_command_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as manufacturing_job_log from manufacturing_job_log;" > "snapshots/manufacturing_job_log_${STAMP}.json"

echo "NEXT PART SCENE VIEWER CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/scene-viewer"
echo "  termux-open-url http://127.0.0.1:4900/robotics-commands"
echo "  termux-open-url http://127.0.0.1:4900/manufacturing-log"
