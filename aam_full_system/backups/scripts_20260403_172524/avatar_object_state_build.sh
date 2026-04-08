#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== AVATAR OBJECT STATE BUILD START ==="

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
CREATE TABLE IF NOT EXISTS avatar_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    avatar_id INTEGER NOT NULL,
    scene_id INTEGER NOT NULL,
    pos_x REAL NOT NULL DEFAULT 0,
    pos_y REAL NOT NULL DEFAULT 0,
    pos_z REAL NOT NULL DEFAULT 0,
    facing TEXT DEFAULT 'north',
    movement_status TEXT NOT NULL DEFAULT 'idle',
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS shared_world_objects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    object_name TEXT NOT NULL,
    object_type TEXT NOT NULL,
    pos_x REAL NOT NULL DEFAULT 0,
    pos_y REAL NOT NULL DEFAULT 0,
    pos_z REAL NOT NULL DEFAULT 0,
    object_state TEXT DEFAULT 'idle',
    interaction_status TEXT NOT NULL DEFAULT 'ready',
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS object_interaction_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    avatar_id INTEGER,
    object_id INTEGER,
    interaction_type TEXT NOT NULL,
    interaction_payload TEXT,
    interaction_status TEXT NOT NULL DEFAULT 'processed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("SELECT count(*) FROM avatar_positions")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO avatar_positions (avatar_id, scene_id, pos_x, pos_y, pos_z, facing, movement_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, [
        (1, 1, 12, 0, 8, "north", "idle"),
        (2, 2, 20, 0, 14, "east", "idle"),
        (3, 3, 6, 0, 18, "west", "idle"),
    ])

cur.execute("SELECT count(*) FROM shared_world_objects")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO shared_world_objects (scene_id, object_name, object_type, pos_x, pos_y, pos_z, object_state, interaction_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, [
        (1, "Commerce Portal Crystal", "portal", 30, 0, 22, "glowing", "ready"),
        (1, "Book Display Node", "display", 18, 0, 10, "active", "ready"),
        (2, "IoT Control Beacon", "control_node", 25, 0, 12, "active", "ready"),
        (2, "Logistics Route Map", "ops_map", 10, 0, 30, "active", "ready"),
        (3, "Creator Stage Ring", "stage", 28, 0, 8, "active", "ready"),
        (3, "Hybrid Game Console", "game_node", 14, 0, 24, "active", "ready"),
    ])

cur.execute("SELECT count(*) FROM object_interaction_log")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO object_interaction_log (scene_id, avatar_id, object_id, interaction_type, interaction_payload, interaction_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        (1, 1, 1, "inspect", '{"object":"Commerce Portal Crystal"}', "processed"),
        (2, 2, 3, "activate", '{"object":"IoT Control Beacon"}', "processed"),
        (3, 3, 6, "open", '{"object":"Hybrid Game Console"}', "processed"),
    ])

conn.commit()
conn.close()
print("[OK] avatar/object DB additions ready")
PYEOF

########################################
# 2) PATCH WORLD SOCKET
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "world_socket.js"
text = p.read_text()

move_block = r"""
  if (pathname === '/move') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const avatarId = Number(url.searchParams.get('avatarId') || 1);
    const x = Number(url.searchParams.get('x') || 0);
    const y = Number(url.searchParams.get('y') || 0);
    const z = Number(url.searchParams.get('z') || 0);
    const facing = q(url.searchParams.get('facing') || 'north');

    execFileSync('sqlite3', [DB_FILE, `UPDATE avatar_positions
      SET pos_x=${x}, pos_y=${y}, pos_z=${z}, facing='${facing}', movement_status='moving', updated_at=CURRENT_TIMESTAMP
      WHERE avatar_id=${avatarId} AND scene_id=${sceneId}`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO socket_event_log (socket_key, scene_id, avatar_id, event_type, event_payload, event_status)
      VALUES ('sock-scene-${sceneId}-avatar-${avatarId}', ${sceneId}, ${avatarId}, 'avatar_move', '{"x":${x},"y":${y},"z":${z},"facing":"${facing}"}', 'processed')`], { encoding: 'utf8' });

    broadcastScene(sceneId, {
      ok: true,
      type: 'avatar_move',
      scene_id: sceneId,
      avatar_id: avatarId,
      position: { x, y, z, facing },
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, moved: true, scene_id: sceneId, avatar_id: avatarId, x, y, z, facing }, null, 2));
  }

  if (pathname === '/interact') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const avatarId = Number(url.searchParams.get('avatarId') || 1);
    const objectId = Number(url.searchParams.get('objectId') || 0);
    const interactionType = q(url.searchParams.get('interactionType') || 'inspect');
    const payload = q(url.searchParams.get('payload') || '{}');

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO object_interaction_log (scene_id, avatar_id, object_id, interaction_type, interaction_payload, interaction_status)
      VALUES (${sceneId}, ${avatarId}, ${objectId}, '${interactionType}', '${payload}', 'processed')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `UPDATE shared_world_objects
      SET object_state='${interactionType}', updated_at=CURRENT_TIMESTAMP
      WHERE id=${objectId} AND scene_id=${sceneId}`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO socket_event_log (socket_key, scene_id, avatar_id, event_type, event_payload, event_status)
      VALUES ('sock-scene-${sceneId}-avatar-${avatarId}', ${sceneId}, ${avatarId}, 'object_interaction', '${payload}', 'processed')`], { encoding: 'utf8' });

    broadcastScene(sceneId, {
      ok: true,
      type: 'object_interaction',
      scene_id: sceneId,
      avatar_id: avatarId,
      object_id: objectId,
      interaction_type: interactionType,
      payload,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, interacted: true, scene_id: sceneId, avatar_id: avatarId, object_id: objectId, interaction_type: interactionType }, null, 2));
  }
"""

marker = "  if (pathname === '/emit') {"
if "/move" not in text and marker in text:
    text = text.replace(marker, move_block + "\n" + marker, 1)

sync_old = """    const connections = dbQuery(`SELECT id, socket_key, avatar_id, connection_status, created_at FROM socket_connections WHERE scene_id=${sceneId} ORDER BY id DESC`);
    const state = dbQuery(`SELECT state_key, state_value, state_status, created_at FROM shared_world_state WHERE scene_id=${sceneId} ORDER BY id ASC`);
    const events = dbQuery(`SELECT id, event_type, event_payload, event_status, created_at FROM socket_event_log WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      ok: true,
      scene_id: sceneId,
      connections,
      shared_state: state,
      recent_events: events,
      timestamp: new Date().toISOString()
    }, null, 2));"""

sync_new = """    const connections = dbQuery(`SELECT id, socket_key, avatar_id, connection_status, created_at FROM socket_connections WHERE scene_id=${sceneId} ORDER BY id DESC`);
    const state = dbQuery(`SELECT state_key, state_value, state_status, created_at FROM shared_world_state WHERE scene_id=${sceneId} ORDER BY id ASC`);
    const events = dbQuery(`SELECT id, event_type, event_payload, event_status, created_at FROM socket_event_log WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`);
    const avatars = dbQuery(`SELECT avatar_id, pos_x, pos_y, pos_z, facing, movement_status, updated_at FROM avatar_positions WHERE scene_id=${sceneId} ORDER BY avatar_id ASC`);
    const objects = dbQuery(`SELECT id, object_name, object_type, pos_x, pos_y, pos_z, object_state, interaction_status, updated_at FROM shared_world_objects WHERE scene_id=${sceneId} ORDER BY id ASC`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      ok: true,
      scene_id: sceneId,
      connections,
      shared_state: state,
      avatars,
      objects,
      recent_events: events,
      timestamp: new Date().toISOString()
    }, null, 2));"""

if "const avatars = dbQuery(`SELECT avatar_id" not in text:
    text = text.replace(sync_old, sync_new, 1)

p.write_text(text)
print("[OK] world_socket.js movement/object patch applied")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

if '<a href="/world-state">World State</a>' not in text and '<a href="/socket-sync">Socket Sync</a>' in text:
    text = text.replace(
        '<a href="/socket-sync">Socket Sync</a>',
        '<a href="/socket-sync">Socket Sync</a>\n      <a href="/world-state">World State</a>'
    )

helper = r'''
function renderWorldStatePage(user = null) {
  const avatars = dbQuery(`
    SELECT ap.id, ap.avatar_id, a.avatar_name, s.scene_name, ap.pos_x, ap.pos_y, ap.pos_z, ap.facing, ap.movement_status, ap.updated_at
    FROM avatar_positions ap
    LEFT JOIN avatar_profiles a ON a.id = ap.avatar_id
    LEFT JOIN scene_registry s ON s.id = ap.scene_id
    ORDER BY ap.id DESC
  `);

  const objects = dbQuery(`
    SELECT o.id, s.scene_name, o.object_name, o.object_type, o.pos_x, o.pos_y, o.pos_z, o.object_state, o.interaction_status, o.updated_at
    FROM shared_world_objects o
    LEFT JOIN scene_registry s ON s.id = o.scene_id
    ORDER BY o.id DESC
  `);

  const interactions = dbQuery(`
    SELECT i.id, s.scene_name, a.avatar_name, o.object_name, i.interaction_type, i.interaction_payload, i.interaction_status, i.created_at
    FROM object_interaction_log i
    LEFT JOIN scene_registry s ON s.id = i.scene_id
    LEFT JOIN avatar_profiles a ON a.id = i.avatar_id
    LEFT JOIN shared_world_objects o ON o.id = i.object_id
    ORDER BY i.id DESC
    LIMIT 100
  `);

  const avatarRows = avatars.map(r => `
    <tr>
      <td>${r.id}</td><td>${r.avatar_name || ''}</td><td>${r.scene_name || ''}</td>
      <td>${r.pos_x}</td><td>${r.pos_y}</td><td>${r.pos_z}</td>
      <td>${r.facing || ''}</td><td>${r.movement_status}</td><td>${r.updated_at || ''}</td>
    </tr>
  `).join('');

  const objectRows = objects.map(r => `
    <tr>
      <td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.object_name}</td><td>${r.object_type}</td>
      <td>${r.pos_x}</td><td>${r.pos_y}</td><td>${r.pos_z}</td>
      <td>${r.object_state || ''}</td><td>${r.interaction_status}</td><td>${r.updated_at || ''}</td>
    </tr>
  `).join('');

  const interactionRows = interactions.map(r => `
    <tr>
      <td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.avatar_name || ''}</td><td>${r.object_name || ''}</td>
      <td>${r.interaction_type}</td><td><code>${r.interaction_payload || ''}</code></td>
      <td>${r.interaction_status}</td><td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('World State', `
    <div class="section"><div class="card"><h2>Avatar Movement + Shared Object State</h2><p>This is the shared interactive world layer: avatar positions, object states, and interaction history.</p></div></div>

    <div class="section"><div class="card">
      <h3>Avatar Positions</h3>
      <table>
        <thead><tr><th>ID</th><th>Avatar</th><th>Scene</th><th>X</th><th>Y</th><th>Z</th><th>Facing</th><th>Status</th><th>Updated</th></tr></thead>
        <tbody>${avatarRows || '<tr><td colspan="9">No avatar rows yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Shared World Objects</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Name</th><th>Type</th><th>X</th><th>Y</th><th>Z</th><th>State</th><th>Status</th><th>Updated</th></tr></thead>
        <tbody>${objectRows || '<tr><td colspan="10">No object rows yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Object Interactions</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Avatar</th><th>Object</th><th>Type</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${interactionRows || '<tr><td colspan="8">No interactions yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function renderWorldStatePage(user = null)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

anchor = "    if (req.method === 'GET' && pathname === '/socket-sync') {"
if "pathname === '/world-state'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/world-state') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWorldStatePage(authUser));
    }

    if (req.method === 'GET' && pathname === '/socket-sync') {"""
    text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] dashboard.js world state patch applied")
PYEOF

########################################
# 4) RESTART / VERIFY
########################################
bash scripts/restart_world_socket.sh
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh
curl -s http://127.0.0.1:5090/health || true

########################################
# 5) CHECKPOINT
########################################
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots

cp apps/dashboard.js "backups/dashboard_world_state_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_world_state_${STAMP}.js"
cp db/aam.db "backups/aam_world_state_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as avatar_positions from avatar_positions;" > "snapshots/avatar_positions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as shared_world_objects from shared_world_objects;" > "snapshots/shared_world_objects_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as object_interaction_log from object_interaction_log;" > "snapshots/object_interaction_log_${STAMP}.json"

echo "AVATAR OBJECT STATE CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/world-state"
echo "  curl -s http://127.0.0.1:5090/sync/1"
echo "  curl -s 'http://127.0.0.1:5090/move?sceneId=1&avatarId=1&x=15&y=0&z=11&facing=east'"
echo "  curl -s 'http://127.0.0.1:5090/interact?sceneId=1&avatarId=1&objectId=1&interactionType=activate&payload=%7B%22target%22%3A%22portal%22%7D'"
