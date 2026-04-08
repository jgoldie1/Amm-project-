#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== IMMERSIVE INTERACTION LAYER BUILD START ==="

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
CREATE TABLE IF NOT EXISTS avatar_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    avatar_name TEXT NOT NULL,
    avatar_role TEXT NOT NULL,
    style_profile TEXT,
    linked_user_type TEXT NOT NULL DEFAULT 'admin',
    linked_user_id INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS scene_visit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    avatar_id INTEGER,
    visit_type TEXT NOT NULL DEFAULT 'enter',
    visit_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS portal_travel_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    portal_id INTEGER NOT NULL,
    avatar_id INTEGER,
    source_scene_id INTEGER,
    target_scene_id INTEGER,
    travel_status TEXT NOT NULL DEFAULT 'completed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS immersive_activity_feed (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER,
    activity_type TEXT NOT NULL,
    activity_title TEXT NOT NULL,
    activity_path TEXT,
    activity_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed avatar
cur.execute("SELECT count(*) FROM avatar_profiles")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO avatar_profiles (avatar_name, avatar_role, style_profile, linked_user_type, linked_user_id)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("AAM Founder Avatar", "founder", "executive_holo", "admin", 1),
        ("Operations Avatar", "operations", "command_center", "admin", 1),
        ("Creator Avatar", "creator", "media_holo", "admin", 1),
    ])

# seed activities
cur.execute("SELECT count(*) FROM immersive_activity_feed")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO immersive_activity_feed (scene_id, activity_type, activity_title, activity_path, activity_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        (1, "commerce", "Open Book Store", "/books", "active"),
        (1, "media", "Open Podcast Rooms", "/rooms", "active"),
        (2, "ops", "Open Logistics Dashboard", "/logistics", "active"),
        (2, "ops", "Open IoT Command Panel", "/iot", "active"),
        (3, "games", "Open Hybrid Games", "/hybrid-games", "active"),
        (3, "holo", "Open Quantum Holo Layer", "/quantum-holo", "active"),
    ])

# seed visit log
cur.execute("SELECT count(*) FROM scene_visit_log")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO scene_visit_log (scene_id, avatar_id, visit_type, visit_notes)
        VALUES (?, ?, ?, ?)
    """, [
        (1, 1, "enter", "Initial commerce world visit."),
        (2, 2, "enter", "Operations world opened."),
        (3, 3, "enter", "Creator world opened."),
    ])

# seed portal log
cur.execute("SELECT count(*) FROM portal_travel_log")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO portal_travel_log (portal_id, avatar_id, source_scene_id, target_scene_id, travel_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        (1, 1, 1, 2, "completed"),
        (2, 2, 2, 3, "completed"),
        (3, 3, 3, 1, "completed"),
    ])

conn.commit()
conn.close()
print("[OK] immersive interaction DB additions ready")
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

if '<a href="/avatars">Avatars</a>' not in text and '<a href="/live-3d">Live 3D</a>' in text:
    text = text.replace(
        '<a href="/live-3d">Live 3D</a>',
        '<a href="/live-3d">Live 3D</a>\n      <a href="/avatars">Avatars</a>\n      <a href="/immersive-feed">Immersive Feed</a>'
    )

pages = r'''
function renderAvatarsPage(user = null) {
  const rows = dbQuery("SELECT id, avatar_name, avatar_role, style_profile, linked_user_type, linked_user_id, created_at FROM avatar_profiles ORDER BY id DESC");

  const cards = rows.map(a => `
    <div class="card">
      <h3>${a.avatar_name}</h3>
      <p><strong>Role:</strong> ${a.avatar_role}</p>
      <p><strong>Style:</strong> ${a.style_profile || ''}</p>
      <p><strong>Linked User:</strong> ${a.linked_user_type} ${a.linked_user_id}</p>
      <p class="muted">${a.created_at || ''}</p>
    </div>
  `).join('');

  return htmlPage('Avatar Profiles', `
    <div class="section">
      <div class="card">
        <h2>Avatar Profiles</h2>
        <p>Avatar registry for immersive identity, role-based world presence, creator view, and future holographic interaction.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards || '<div class="card"><p>No avatars yet.</p></div>'}</div>
    </div>
  `, user);
}

function renderImmersiveFeedPage(user = null) {
  const feed = dbQuery(`
    SELECT f.id, s.scene_name, f.activity_type, f.activity_title, f.activity_path, f.activity_status, f.created_at
    FROM immersive_activity_feed f
    LEFT JOIN scene_registry s ON s.id = f.scene_id
    ORDER BY f.id DESC
  `);

  const visits = dbQuery(`
    SELECT v.id, s.scene_name, a.avatar_name, v.visit_type, v.visit_notes, v.created_at
    FROM scene_visit_log v
    LEFT JOIN scene_registry s ON s.id = v.scene_id
    LEFT JOIN avatar_profiles a ON a.id = v.avatar_id
    ORDER BY v.id DESC
    LIMIT 50
  `);

  const travel = dbQuery(`
    SELECT t.id, p.portal_name, a.avatar_name, t.source_scene_id, t.target_scene_id, t.travel_status, t.created_at
    FROM portal_travel_log t
    LEFT JOIN scene_portals p ON p.id = t.portal_id
    LEFT JOIN avatar_profiles a ON a.id = t.avatar_id
    ORDER BY t.id DESC
    LIMIT 50
  `);

  const feedRows = feed.map(f => `
    <tr>
      <td>${f.id}</td>
      <td>${f.scene_name || ''}</td>
      <td>${f.activity_type}</td>
      <td>${f.activity_title}</td>
      <td>${f.activity_path ? `<a href="${f.activity_path}">Open</a>` : ''}</td>
      <td>${f.activity_status}</td>
      <td>${f.created_at || ''}</td>
    </tr>
  `).join('');

  const visitRows = visits.map(v => `
    <tr>
      <td>${v.id}</td>
      <td>${v.scene_name || ''}</td>
      <td>${v.avatar_name || ''}</td>
      <td>${v.visit_type}</td>
      <td>${v.visit_notes || ''}</td>
      <td>${v.created_at || ''}</td>
    </tr>
  `).join('');

  const travelRows = travel.map(t => `
    <tr>
      <td>${t.id}</td>
      <td>${t.portal_name || ''}</td>
      <td>${t.avatar_name || ''}</td>
      <td>${t.source_scene_id || ''}</td>
      <td>${t.target_scene_id || ''}</td>
      <td>${t.travel_status}</td>
      <td>${t.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Immersive Feed', `
    <div class="section">
      <div class="card">
        <h2>Immersive Activity Feed</h2>
        <p>This tracks what can happen in the worlds now: panels, entries, portal travel, and future avatar-driven activity.</p>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>World Activities</h3>
        <table>
          <thead><tr><th>ID</th><th>Scene</th><th>Type</th><th>Title</th><th>Path</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${feedRows || '<tr><td colspan="7">No activities yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Scene Visits</h3>
        <table>
          <thead><tr><th>ID</th><th>Scene</th><th>Avatar</th><th>Visit Type</th><th>Notes</th><th>Created</th></tr></thead>
          <tbody>${visitRows || '<tr><td colspan="6">No visits yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Portal Travel</h3>
        <table>
          <thead><tr><th>ID</th><th>Portal</th><th>Avatar</th><th>From</th><th>To</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${travelRows || '<tr><td colspan="7">No portal travel yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", pages)

anchor = "    if (req.method === 'GET' && pathname === '/live-3d') {"
if "pathname === '/avatars'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/avatars') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderAvatarsPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/immersive-feed') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderImmersiveFeedPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/live-3d') {"""
    text = text.replace(anchor, routes)

# add visit logging when scene runtime opens
old_runtime = "return res.end(renderSceneRuntimeDetail(sceneId, authUser));"
new_runtime = """      dbRun(`INSERT INTO scene_visit_log (scene_id, avatar_id, visit_type, visit_notes)
             VALUES (${Number(sceneId)}, 1, 'runtime_open', 'Scene runtime opened from admin shell')`);
      return res.end(renderSceneRuntimeDetail(sceneId, authUser));"""
text = text.replace(old_runtime, new_runtime, 1)

# add visit logging when live 3d opens
old_live3d = "return res.end(renderLive3DScene(sceneId, authUser));"
new_live3d = """      dbRun(`INSERT INTO scene_visit_log (scene_id, avatar_id, visit_type, visit_notes)
             VALUES (${Number(sceneId)}, 1, 'live_3d_open', 'Live 3D scene opened from admin shell')`);
      return res.end(renderLive3DScene(sceneId, authUser));"""
text = text.replace(old_live3d, new_live3d, 1)

p.write_text(text)
print("[OK] immersive interaction patch applied")
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

cp apps/dashboard.js "backups/dashboard_immersive_interaction_${STAMP}.js"
cp db/aam.db "backups/aam_immersive_interaction_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as avatar_profiles from avatar_profiles;" > "snapshots/avatar_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scene_visit_log from scene_visit_log;" > "snapshots/scene_visit_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as portal_travel_log from portal_travel_log;" > "snapshots/portal_travel_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as immersive_activity_feed from immersive_activity_feed;" > "snapshots/immersive_activity_feed_${STAMP}.json"

echo "IMMERSIVE INTERACTION CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/avatars"
echo "  termux-open-url http://127.0.0.1:4900/immersive-feed"
echo "  termux-open-url http://127.0.0.1:4900/live-3d/1"
