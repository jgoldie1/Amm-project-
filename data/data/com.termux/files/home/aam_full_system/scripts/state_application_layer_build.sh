#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== STATE APPLICATION LAYER BUILD START ==="

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
CREATE TABLE IF NOT EXISTS state_application_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    source_type TEXT NOT NULL,
    source_id INTEGER,
    applied_key TEXT NOT NULL,
    applied_value TEXT,
    apply_status TEXT NOT NULL DEFAULT 'applied',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("SELECT count(*) FROM state_application_log")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO state_application_log (scene_id, source_type, source_id, applied_key, applied_value, apply_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        (1, "seed", 1, "commerce_boot", "ready", "applied"),
        (2, "seed", 2, "ops_boot", "ready", "applied"),
        (3, "seed", 3, "creator_boot", "ready", "applied"),
    ])

conn.commit()
conn.close()
print("[OK] state application DB additions ready")
PYEOF

########################################
# 2) PATCH WORLD SOCKET
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "world_socket.js"
text = p.read_text()

old_scene = """    execFileSync('sqlite3', [DB_FILE, `INSERT INTO scene_command_queue (scene_id, command_type, command_payload, command_status)
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
    return res.end(JSON.stringify({ ok: true, scene_command: true, scene_id: sceneId, command_type: commandType }, null, 2));"""

new_scene = """    execFileSync('sqlite3', [DB_FILE, `INSERT INTO scene_command_queue (scene_id, command_type, command_payload, command_status)
      VALUES (${sceneId}, '${commandType}', '${payload}', 'processed')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO shared_world_state (scene_id, state_key, state_value, state_status)
      VALUES (${sceneId}, 'scene_command_${commandType}', '${payload}', 'active')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO state_application_log (scene_id, source_type, source_id, applied_key, applied_value, apply_status)
      VALUES (${sceneId}, 'scene_command', (SELECT id FROM scene_command_queue ORDER BY id DESC LIMIT 1), 'scene_command_${commandType}', '${payload}', 'applied')`], { encoding: 'utf8' });

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
    return res.end(JSON.stringify({ ok: true, scene_command: true, scene_id: sceneId, command_type: commandType }, null, 2));"""

if "INSERT INTO state_application_log (scene_id, source_type, source_id, applied_key, applied_value, apply_status)" not in text:
    text = text.replace(old_scene, new_scene, 1)

old_avatar = """    execFileSync('sqlite3', [DB_FILE, `INSERT INTO avatar_action_queue (avatar_id, scene_id, action_type, action_payload, action_status)
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
    return res.end(JSON.stringify({ ok: true, avatar_action: true, scene_id: sceneId, avatar_id: avatarId, action_type: actionType }, null, 2));"""

new_avatar = """    execFileSync('sqlite3', [DB_FILE, `INSERT INTO avatar_action_queue (avatar_id, scene_id, action_type, action_payload, action_status)
      VALUES (${avatarId}, ${sceneId}, '${actionType}', '${payload}', 'processed')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `UPDATE avatar_positions
      SET movement_status='${actionType}', updated_at=CURRENT_TIMESTAMP
      WHERE avatar_id=${avatarId} AND scene_id=${sceneId}`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO state_application_log (scene_id, source_type, source_id, applied_key, applied_value, apply_status)
      VALUES (${sceneId}, 'avatar_action', (SELECT id FROM avatar_action_queue ORDER BY id DESC LIMIT 1), 'avatar_action_${actionType}', '${payload}', 'applied')`], { encoding: 'utf8' });

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
    return res.end(JSON.stringify({ ok: true, avatar_action: true, scene_id: sceneId, avatar_id: avatarId, action_type: actionType }, null, 2));"""

if "VALUES (${sceneId}, 'avatar_action', (SELECT id FROM avatar_action_queue ORDER BY id DESC LIMIT 1), 'avatar_action_${actionType}'" not in text:
    text = text.replace(old_avatar, new_avatar, 1)

old_object = """    execFileSync('sqlite3', [DB_FILE, `INSERT INTO object_command_queue (object_id, scene_id, command_type, command_payload, command_status)
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
    return res.end(JSON.stringify({ ok: true, object_command: true, scene_id: sceneId, object_id: objectId, command_type: commandType }, null, 2));"""

new_object = """    execFileSync('sqlite3', [DB_FILE, `INSERT INTO object_command_queue (object_id, scene_id, command_type, command_payload, command_status)
      VALUES (${objectId}, ${sceneId}, '${commandType}', '${payload}', 'processed')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `UPDATE shared_world_objects
      SET object_state='${commandType}', updated_at=CURRENT_TIMESTAMP
      WHERE id=${objectId} AND scene_id=${sceneId}`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO state_application_log (scene_id, source_type, source_id, applied_key, applied_value, apply_status)
      VALUES (${sceneId}, 'object_command', (SELECT id FROM object_command_queue ORDER BY id DESC LIMIT 1), 'object_command_${commandType}', '${payload}', 'applied')`], { encoding: 'utf8' });

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
    return res.end(JSON.stringify({ ok: true, object_command: true, scene_id: sceneId, object_id: objectId, command_type: commandType }, null, 2));"""

if "VALUES (${sceneId}, 'object_command', (SELECT id FROM object_command_queue ORDER BY id DESC LIMIT 1), 'object_command_${commandType}'" not in text:
    text = text.replace(old_object, new_object, 1)

p.write_text(text)
print("[OK] world_socket.js state application patch applied")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

if '<a href="/world-execution">World Execution</a>' not in text and '<a href="/world-control">World Control</a>' in text:
    text = text.replace(
        '<a href="/world-control">World Control</a>',
        '<a href="/world-control">World Control</a>\n      <a href="/world-execution">World Execution</a>'
    )

helper = r'''
function renderWorldExecutionPage(user = null) {
  const rows = dbQuery(`
    SELECT sal.id, s.scene_name, sal.source_type, sal.source_id, sal.applied_key, sal.applied_value, sal.apply_status, sal.created_at
    FROM state_application_log sal
    LEFT JOIN scene_registry s ON s.id = sal.scene_id
    ORDER BY sal.id DESC
    LIMIT 200
  `);

  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.scene_name || ''}</td>
      <td>${r.source_type}</td>
      <td>${r.source_id || ''}</td>
      <td>${r.applied_key}</td>
      <td><code>${r.applied_value || ''}</code></td>
      <td>${r.apply_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('World Execution', `
    <div class="section"><div class="card">
      <h2>World Execution Layer</h2>
      <p>This page shows which commands and actions were actually applied into live shared world state.</p>
    </div></div>

    <div class="section"><div class="card">
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Source Type</th><th>Source ID</th><th>Applied Key</th><th>Applied Value</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${tableRows || '<tr><td colspan="8">No applied state yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function renderWorldExecutionPage(user = null)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

anchor = "    if (req.method === 'GET' && pathname === '/world-control') {"
if "pathname === '/world-execution'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/world-execution') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWorldExecutionPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/world-control') {"""
    text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] dashboard.js world execution patch applied")
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

cp apps/dashboard.js "backups/dashboard_world_execution_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_world_execution_${STAMP}.js"
cp db/aam.db "backups/aam_world_execution_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as state_application_log from state_application_log;" > "snapshots/state_application_log_${STAMP}.json"

echo "STATE APPLICATION CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/world-execution"
echo "  curl -s 'http://127.0.0.1:5090/scene-command?sceneId=1&commandType=world_refresh&payload=%7B%22mode%22%3A%22fast%22%7D'"
echo "  curl -s 'http://127.0.0.1:5090/avatar-action?sceneId=1&avatarId=1&actionType=jump&payload=%7B%22height%22%3A2%7D'"
echo "  curl -s 'http://127.0.0.1:5090/object-command?sceneId=1&objectId=1&commandType=pulse&payload=%7B%22color%22%3A%22blue%22%7D'"
