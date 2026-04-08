#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== MULTIUSER WORLD SYNC BUILD START ==="

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
CREATE TABLE IF NOT EXISTS world_presence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    avatar_id INTEGER,
    scene_id INTEGER NOT NULL,
    presence_status TEXT NOT NULL DEFAULT 'online',
    presence_note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS world_room_membership (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    avatar_id INTEGER,
    room_type TEXT NOT NULL,
    room_ref_id INTEGER,
    membership_status TEXT NOT NULL DEFAULT 'joined',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS world_event_bus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER,
    avatar_id INTEGER,
    event_type TEXT NOT NULL,
    event_payload TEXT,
    event_status TEXT NOT NULL DEFAULT 'queued',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS sync_channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_name TEXT NOT NULL,
    channel_type TEXT NOT NULL,
    scene_id INTEGER,
    sync_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed presence
cur.execute("SELECT count(*) FROM world_presence")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO world_presence (avatar_id, scene_id, presence_status, presence_note)
        VALUES (?, ?, ?, ?)
    """, [
        (1, 1, "online", "Founder avatar present in commerce world"),
        (2, 2, "online", "Operations avatar present in ops world"),
        (3, 3, "online", "Creator avatar present in creator world"),
    ])

# seed memberships
cur.execute("SELECT count(*) FROM world_room_membership")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO world_room_membership (avatar_id, room_type, room_ref_id, membership_status)
        VALUES (?, ?, ?, ?)
    """, [
        (1, "podcast_room", 1, "joined"),
        (2, "ops_room", 2, "joined"),
        (3, "creator_room", 3, "joined"),
    ])

# seed event bus
cur.execute("SELECT count(*) FROM world_event_bus")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO world_event_bus (scene_id, avatar_id, event_type, event_payload, event_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        (1, 1, "scene_enter", '{"message":"Commerce world entered"}', "processed"),
        (2, 2, "panel_open", '{"panel":"IoT Ops Panel"}', "processed"),
        (3, 3, "portal_travel", '{"from":3,"to":1}', "processed"),
    ])

# seed sync channels
cur.execute("SELECT count(*) FROM sync_channels")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO sync_channels (channel_name, channel_type, scene_id, sync_status)
        VALUES (?, ?, ?, ?)
    """, [
        ("Commerce World Sync", "scene_sync", 1, "active"),
        ("Ops World Sync", "scene_sync", 2, "active"),
        ("Creator World Sync", "scene_sync", 3, "active"),
    ])

conn.commit()
conn.close()
print("[OK] multiuser sync DB additions ready")
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

if '<a href="/world-sync">World Sync</a>' not in text and '<a href="/motion-worlds">Motion Worlds</a>' in text:
    text = text.replace(
        '<a href="/motion-worlds">Motion Worlds</a>',
        '<a href="/motion-worlds">Motion Worlds</a>\n      <a href="/world-sync">World Sync</a>'
    )

pages = r'''
function renderWorldSyncPage(user = null) {
  const presence = dbQuery(`
    SELECT p.id, a.avatar_name, s.scene_name, p.presence_status, p.presence_note, p.created_at
    FROM world_presence p
    LEFT JOIN avatar_profiles a ON a.id = p.avatar_id
    LEFT JOIN scene_registry s ON s.id = p.scene_id
    ORDER BY p.id DESC
    LIMIT 100
  `);

  const memberships = dbQuery(`
    SELECT m.id, a.avatar_name, m.room_type, m.room_ref_id, m.membership_status, m.created_at
    FROM world_room_membership m
    LEFT JOIN avatar_profiles a ON a.id = m.avatar_id
    ORDER BY m.id DESC
    LIMIT 100
  `);

  const events = dbQuery(`
    SELECT e.id, s.scene_name, a.avatar_name, e.event_type, e.event_payload, e.event_status, e.created_at
    FROM world_event_bus e
    LEFT JOIN scene_registry s ON s.id = e.scene_id
    LEFT JOIN avatar_profiles a ON a.id = e.avatar_id
    ORDER BY e.id DESC
    LIMIT 100
  `);

  const channels = dbQuery(`
    SELECT id, channel_name, channel_type, scene_id, sync_status, created_at
    FROM sync_channels
    ORDER BY id DESC
    LIMIT 100
  `);

  const presenceRows = presence.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.avatar_name || ''}</td>
      <td>${r.scene_name || ''}</td>
      <td>${r.presence_status}</td>
      <td>${r.presence_note || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const membershipRows = memberships.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.avatar_name || ''}</td>
      <td>${r.room_type}</td>
      <td>${r.room_ref_id || ''}</td>
      <td>${r.membership_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const eventRows = events.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.scene_name || ''}</td>
      <td>${r.avatar_name || ''}</td>
      <td>${r.event_type}</td>
      <td><code>${r.event_payload || ''}</code></td>
      <td>${r.event_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const channelRows = channels.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.channel_name}</td>
      <td>${r.channel_type}</td>
      <td>${r.scene_id || ''}</td>
      <td>${r.sync_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('World Sync', `
    <div class="section">
      <div class="card">
        <h2>Multi-User World Sync Foundation</h2>
        <p>This is the backbone for future real-time immersive worlds: presence, membership, event bus activity, and scene sync channels.</p>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Presence</h3>
        <table>
          <thead><tr><th>ID</th><th>Avatar</th><th>Scene</th><th>Status</th><th>Note</th><th>Created</th></tr></thead>
          <tbody>${presenceRows || '<tr><td colspan="6">No presence rows yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Room Memberships</h3>
        <table>
          <thead><tr><th>ID</th><th>Avatar</th><th>Room Type</th><th>Room Ref</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${membershipRows || '<tr><td colspan="6">No memberships yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>World Event Bus</h3>
        <table>
          <thead><tr><th>ID</th><th>Scene</th><th>Avatar</th><th>Event</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${eventRows || '<tr><td colspan="7">No events yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Sync Channels</h3>
        <table>
          <thead><tr><th>ID</th><th>Channel</th><th>Type</th><th>Scene</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${channelRows || '<tr><td colspan="6">No sync channels yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", pages)

anchor = "    if (req.method === 'GET' && pathname === '/motion-worlds') {"
if "pathname === '/world-sync'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/world-sync') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWorldSyncPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/motion-worlds') {"""
    text = text.replace(anchor, routes)

# add event bus logging for motion worlds
old_motion = """      dbRun(`INSERT INTO scene_visit_log (scene_id, avatar_id, visit_type, visit_notes)
             VALUES (${Number(sceneId)}, 1, 'motion_world_open', 'Motion world page opened from admin shell')`);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderMotionWorldDetail(sceneId, authUser));"""
new_motion = """      dbRun(`INSERT INTO scene_visit_log (scene_id, avatar_id, visit_type, visit_notes)
             VALUES (${Number(sceneId)}, 1, 'motion_world_open', 'Motion world page opened from admin shell')`);
      dbRun(`INSERT INTO world_event_bus (scene_id, avatar_id, event_type, event_payload, event_status)
             VALUES (${Number(sceneId)}, 1, 'motion_world_open', '{"sceneId":${Number(sceneId)}}', 'processed')`);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderMotionWorldDetail(sceneId, authUser));"""
text = text.replace(old_motion, new_motion, 1)

p.write_text(text)
print("[OK] multiuser world sync patch applied")
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

cp apps/dashboard.js "backups/dashboard_world_sync_${STAMP}.js"
cp db/aam.db "backups/aam_world_sync_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as world_presence from world_presence;" > "snapshots/world_presence_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_room_membership from world_room_membership;" > "snapshots/world_room_membership_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_event_bus from world_event_bus;" > "snapshots/world_event_bus_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as sync_channels from sync_channels;" > "snapshots/sync_channels_${STAMP}.json"

echo "MULTIUSER WORLD SYNC CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/world-sync"
echo "  termux-open-url http://127.0.0.1:4900/motion-worlds/1"
