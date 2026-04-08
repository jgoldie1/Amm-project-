#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== MULTIPLAYER CONTROL LAYER BUILD START ==="

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
CREATE TABLE IF NOT EXISTS scene_command_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    command_type TEXT NOT NULL,
    command_payload TEXT,
    command_status TEXT NOT NULL DEFAULT 'queued',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS avatar_action_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    avatar_id INTEGER NOT NULL,
    scene_id INTEGER NOT NULL,
    action_type TEXT NOT NULL,
    action_payload TEXT,
    action_status TEXT NOT NULL DEFAULT 'queued',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS object_command_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    object_id INTEGER NOT NULL,
    scene_id INTEGER NOT NULL,
    command_type TEXT NOT NULL,
    command_payload TEXT,
    command_status TEXT NOT NULL DEFAULT 'queued',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("SELECT count(*) FROM scene_command_queue")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO scene_command_queue (scene_id, command_type, command_payload, command_status)
        VALUES (?, ?, ?, ?)
    """, [
        (1, "scene_boot", '{"scene":"commerce"}', "processed"),
        (2, "scene_sync", '{"scene":"ops"}', "processed"),
        (3, "scene_ready", '{"scene":"creator"}', "processed"),
    ])

cur.execute("SELECT count(*) FROM avatar_action_queue")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO avatar_action_queue (avatar_id, scene_id, action_type, action_payload, action_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        (1, 1, "spawn", '{"x":12,"y":0,"z":8}', "processed"),
        (2, 2, "spawn", '{"x":20,"y":0,"z":14}', "processed"),
        (3, 3, "spawn", '{"x":6,"y":0,"z":18}', "processed"),
    ])

cur.execute("SELECT count(*) FROM object_command_queue")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO object_command_queue (object_id, scene_id, command_type, command_payload, command_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        (1, 1, "set_glow", '{"state":"glowing"}', "processed"),
        (3, 2, "activate", '{"node":"iot"}', "processed"),
        (6, 3, "enable", '{"node":"game_console"}', "processed"),
    ])

conn.commit()
conn.close()
print("[OK] multiplayer control DB additions ready")
PYEOF

########################################
# 2) PATCH WORLD SOCKET
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "world_socket.js"
text = p.read_text()

control_block = r"""
  if (pathname === '/scene-command') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const commandType = q(url.searchParams.get('commandType') || 'scene_command');
    const payload = q(url.searchParams.get('payload') || '{}');

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO scene_command_queue (scene_id, command_type, command_payload, command_status)
      VALUES (${sceneId}, '${commandType}', '${payload}', 'processed')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO socket_event_log (socket_key, scene_id, avatar_id, event_type, event_payload, event_status)
      VALUES ('sock-scene-${sceneId}-control', ${sceneId}, 1, 'scene_command', '${payload}', 'processed')`], { encoding: 'utf8' });

    broadcastScene(sceneId, {
      ok: true,
      type: 'scene_command',
      scene_id: sceneId,
      command_type: commandType,
      payload,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, scene_command: true, scene_id: sceneId, command_type: commandType }, null, 2));
  }

  if (pathname === '/avatar-action') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const avatarId = Number(url.searchParams.get('avatarId') || 1);
    const actionType = q(url.searchParams.get('actionType') || 'action');
    const payload = q(url.searchParams.get('payload') || '{}');

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO avatar_action_queue (avatar_id, scene_id, action_type, action_payload, action_status)
      VALUES (${avatarId}, ${sceneId}, '${actionType}', '${payload}', 'processed')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO socket_event_log (socket_key, scene_id, avatar_id, event_type, event_payload, event_status)
      VALUES ('sock-scene-${sceneId}-avatar-${avatarId}', ${sceneId}, ${avatarId}, 'avatar_action', '${payload}', 'processed')`], { encoding: 'utf8' });

    broadcastScene(sceneId, {
      ok: true,
      type: 'avatar_action',
      scene_id: sceneId,
      avatar_id: avatarId,
      action_type: actionType,
      payload,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, avatar_action: true, scene_id: sceneId, avatar_id: avatarId, action_type: actionType }, null, 2));
  }

  if (pathname === '/object-command') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const objectId = Number(url.searchParams.get('objectId') || 0);
    const commandType = q(url.searchParams.get('commandType') || 'object_command');
    const payload = q(url.searchParams.get('payload') || '{}');

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO object_command_queue (object_id, scene_id, command_type, command_payload, command_status)
      VALUES (${objectId}, ${sceneId}, '${commandType}', '${payload}', 'processed')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO socket_event_log (socket_key, scene_id, avatar_id, event_type, event_payload, event_status)
      VALUES ('sock-scene-${sceneId}-object-${objectId}', ${sceneId}, 1, 'object_command', '${payload}', 'processed')`], { encoding: 'utf8' });

    broadcastScene(sceneId, {
      ok: true,
      type: 'object_command',
      scene_id: sceneId,
      object_id: objectId,
      command_type: commandType,
      payload,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, object_command: true, scene_id: sceneId, object_id: objectId, command_type: commandType }, null, 2));
  }
"""

marker = "  if (pathname === '/move') {"
if "/scene-command" not in text and marker in text:
    text = text.replace(marker, control_block + "\n" + marker, 1)

sync_old = """      avatars,
      objects,
      recent_events: events,
      timestamp: new Date().toISOString()
    }, null, 2));"""
sync_new = """      avatars,
      objects,
      scene_commands: dbQuery(`SELECT id, command_type, command_payload, command_status, created_at FROM scene_command_queue WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      avatar_actions: dbQuery(`SELECT id, avatar_id, action_type, action_payload, action_status, created_at FROM avatar_action_queue WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      object_commands: dbQuery(`SELECT id, object_id, command_type, command_payload, command_status, created_at FROM object_command_queue WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      recent_events: events,
      timestamp: new Date().toISOString()
    }, null, 2));"""
if "scene_commands: dbQuery(" not in text:
    text = text.replace(sync_old, sync_new, 1)

p.write_text(text)
print("[OK] world_socket.js multiplayer control patch applied")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

if '<a href="/world-control">World Control</a>' not in text and '<a href="/world-state">World State</a>' in text:
    text = text.replace(
        '<a href="/world-state">World State</a>',
        '<a href="/world-state">World State</a>\n      <a href="/world-control">World Control</a>'
    )

helper = r'''
function renderWorldControlPage(user = null) {
  const sceneCommands = dbQuery(`
    SELECT sc.id, s.scene_name, sc.command_type, sc.command_payload, sc.command_status, sc.created_at
    FROM scene_command_queue sc
    LEFT JOIN scene_registry s ON s.id = sc.scene_id
    ORDER BY sc.id DESC
    LIMIT 100
  `);

  const avatarActions = dbQuery(`
    SELECT aa.id, s.scene_name, a.avatar_name, aa.action_type, aa.action_payload, aa.action_status, aa.created_at
    FROM avatar_action_queue aa
    LEFT JOIN scene_registry s ON s.id = aa.scene_id
    LEFT JOIN avatar_profiles a ON a.id = aa.avatar_id
    ORDER BY aa.id DESC
    LIMIT 100
  `);

  const objectCommands = dbQuery(`
    SELECT oc.id, s.scene_name, o.object_name, oc.command_type, oc.command_payload, oc.command_status, oc.created_at
    FROM object_command_queue oc
    LEFT JOIN scene_registry s ON s.id = oc.scene_id
    LEFT JOIN shared_world_objects o ON o.id = oc.object_id
    ORDER BY oc.id DESC
    LIMIT 100
  `);

  const sceneRows = sceneCommands.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.command_type}</td><td><code>${r.command_payload || ''}</code></td><td>${r.command_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const avatarRows = avatarActions.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.avatar_name || ''}</td><td>${r.action_type}</td><td><code>${r.action_payload || ''}</code></td><td>${r.action_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const objectRows = objectCommands.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.object_name || ''}</td><td>${r.command_type}</td><td><code>${r.command_payload || ''}</code></td><td>${r.command_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('World Control', `
    <div class="section"><div class="card"><h2>Multiplayer Control Layer</h2><p>This is the admin orchestration layer for scene commands, avatar actions, and object commands.</p></div></div>

    <div class="section"><div class="card">
      <h3>Scene Commands</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Type</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${sceneRows || '<tr><td colspan="6">No scene commands yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Avatar Actions</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Avatar</th><th>Type</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${avatarRows || '<tr><td colspan="7">No avatar actions yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Object Commands</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Object</th><th>Type</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${objectRows || '<tr><td colspan="7">No object commands yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function renderWorldControlPage(user = null)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

anchor = "    if (req.method === 'GET' && pathname === '/world-state') {"
if "pathname === '/world-control'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/world-control') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWorldControlPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/world-state') {"""
    text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] dashboard.js world control patch applied")
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

cp apps/dashboard.js "backups/dashboard_world_control_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_world_control_${STAMP}.js"
cp db/aam.db "backups/aam_world_control_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as scene_command_queue from scene_command_queue;" > "snapshots/scene_command_queue_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as avatar_action_queue from avatar_action_queue;" > "snapshots/avatar_action_queue_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as object_command_queue from object_command_queue;" > "snapshots/object_command_queue_${STAMP}.json"

echo "MULTIPLAYER CONTROL CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/world-control"
echo "  curl -s http://127.0.0.1:5090/sync/1"
echo "  curl -s 'http://127.0.0.1:5090/scene-command?sceneId=1&commandType=world_refresh&payload=%7B%22mode%22%3A%22fast%22%7D'"
echo "  curl -s 'http://127.0.0.1:5090/avatar-action?sceneId=1&avatarId=1&actionType=jump&payload=%7B%22height%22%3A2%7D'"
echo "  curl -s 'http://127.0.0.1:5090/object-command?sceneId=1&objectId=1&commandType=pulse&payload=%7B%22color%22%3A%22blue%22%7D'"
