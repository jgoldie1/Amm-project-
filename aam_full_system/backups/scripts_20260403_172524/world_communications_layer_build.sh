#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== WORLD COMMUNICATIONS LAYER BUILD START ==="

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
CREATE TABLE IF NOT EXISTS world_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER,
    avatar_id INTEGER,
    message_type TEXT NOT NULL DEFAULT 'chat',
    message_text TEXT NOT NULL,
    message_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS scene_announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    announcement_status TEXT NOT NULL DEFAULT 'live',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS room_world_bridge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_type TEXT NOT NULL,
    room_ref_id INTEGER,
    scene_id INTEGER,
    bridge_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed messages
cur.execute("SELECT count(*) FROM world_messages")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO world_messages (scene_id, avatar_id, message_type, message_text, message_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        (1, 1, "chat", "Founder avatar entered the commerce world.", "active"),
        (2, 2, "system", "Operations panel synchronized with IoT layer.", "active"),
        (3, 3, "chat", "Creator avatar opened the hybrid games panel.", "active"),
    ])

# seed announcements
cur.execute("SELECT count(*) FROM scene_announcements")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO scene_announcements (scene_id, title, body, announcement_status)
        VALUES (?, ?, ?, ?)
    """, [
        (1, "Commerce World Live", "Books, payments, and marketplace panels are active.", "live"),
        (2, "Ops World Ready", "IoT telemetry and logistics panels are connected.", "live"),
        (3, "Creator World Ready", "Hybrid games and quantum holo layer are available.", "live"),
    ])

# seed bridges
cur.execute("SELECT count(*) FROM room_world_bridge")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO room_world_bridge (room_type, room_ref_id, scene_id, bridge_status)
        VALUES (?, ?, ?, ?)
    """, [
        ("podcast_room", 1, 1, "active"),
        ("ops_room", 2, 2, "active"),
        ("creator_room", 3, 3, "active"),
    ])

conn.commit()
conn.close()
print("[OK] world communications DB additions ready")
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

if '<a href="/world-comms">World Comms</a>' not in text and '<a href="/live-sync">Live Sync</a>' in text:
    text = text.replace(
        '<a href="/live-sync">Live Sync</a>',
        '<a href="/live-sync">Live Sync</a>\n      <a href="/world-comms">World Comms</a>'
    )

pages = r'''
function renderWorldCommsPage(user = null) {
  const messages = dbQuery(`
    SELECT m.id, s.scene_name, a.avatar_name, m.message_type, m.message_text, m.message_status, m.created_at
    FROM world_messages m
    LEFT JOIN scene_registry s ON s.id = m.scene_id
    LEFT JOIN avatar_profiles a ON a.id = m.avatar_id
    ORDER BY m.id DESC
    LIMIT 100
  `);

  const announcements = dbQuery(`
    SELECT sa.id, s.scene_name, sa.title, sa.body, sa.announcement_status, sa.created_at
    FROM scene_announcements sa
    LEFT JOIN scene_registry s ON s.id = sa.scene_id
    ORDER BY sa.id DESC
    LIMIT 100
  `);

  const bridges = dbQuery(`
    SELECT id, room_type, room_ref_id, scene_id, bridge_status, created_at
    FROM room_world_bridge
    ORDER BY id DESC
    LIMIT 100
  `);

  const msgRows = messages.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.scene_name || ''}</td>
      <td>${r.avatar_name || ''}</td>
      <td>${r.message_type}</td>
      <td>${r.message_text}</td>
      <td>${r.message_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const annRows = announcements.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.scene_name || ''}</td>
      <td>${r.title}</td>
      <td>${r.body}</td>
      <td>${r.announcement_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const bridgeRows = bridges.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.room_type}</td>
      <td>${r.room_ref_id || ''}</td>
      <td>${r.scene_id || ''}</td>
      <td>${r.bridge_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('World Communications', `
    <div class="section">
      <div class="card">
        <h2>World Communications Layer</h2>
        <p>This is the social and coordination layer for immersive worlds: messages, announcements, and room-to-world bridging.</p>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>World Messages</h3>
        <table>
          <thead><tr><th>ID</th><th>Scene</th><th>Avatar</th><th>Type</th><th>Message</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${msgRows || '<tr><td colspan="7">No world messages yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Scene Announcements</h3>
        <table>
          <thead><tr><th>ID</th><th>Scene</th><th>Title</th><th>Body</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${annRows || '<tr><td colspan="6">No announcements yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Room ↔ World Bridge</h3>
        <table>
          <thead><tr><th>ID</th><th>Room Type</th><th>Room Ref</th><th>Scene</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${bridgeRows || '<tr><td colspan="6">No bridges yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", pages)

anchor = "    if (req.method === 'GET' && pathname === '/live-sync') {"
if "pathname === '/world-comms'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/world-comms') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWorldCommsPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/live-sync') {"""
    text = text.replace(anchor, routes)

# add event bus + world message logging on motion world opens
old_motion = """      dbRun(`INSERT INTO world_event_bus (scene_id, avatar_id, event_type, event_payload, event_status)
             VALUES (${Number(sceneId)}, 1, 'motion_world_open', '{"sceneId":${Number(sceneId)}}', 'processed')`);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderMotionWorldDetail(sceneId, authUser));"""
new_motion = """      dbRun(`INSERT INTO world_event_bus (scene_id, avatar_id, event_type, event_payload, event_status)
             VALUES (${Number(sceneId)}, 1, 'motion_world_open', '{"sceneId":${Number(sceneId)}}', 'processed')`);
      dbRun(`INSERT INTO world_messages (scene_id, avatar_id, message_type, message_text, message_status)
             VALUES (${Number(sceneId)}, 1, 'system', 'Motion world opened and synced from admin shell.', 'active')`);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderMotionWorldDetail(sceneId, authUser));"""
text = text.replace(old_motion, new_motion, 1)

p.write_text(text)
print("[OK] world communications patch applied")
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

cp apps/dashboard.js "backups/dashboard_world_comms_${STAMP}.js"
cp db/aam.db "backups/aam_world_comms_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as world_messages from world_messages;" > "snapshots/world_messages_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scene_announcements from scene_announcements;" > "snapshots/scene_announcements_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as room_world_bridge from room_world_bridge;" > "snapshots/room_world_bridge_${STAMP}.json"

echo "WORLD COMMUNICATIONS CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/world-comms"
echo "  termux-open-url http://127.0.0.1:4900/motion-worlds/1"
