#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== WORLD PERSISTENCE + REPLAY BUILD START ==="

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
CREATE TABLE IF NOT EXISTS world_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    session_name TEXT NOT NULL,
    session_status TEXT NOT NULL DEFAULT 'active',
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    ended_at TEXT
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS scene_checkpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    session_id INTEGER,
    checkpoint_name TEXT NOT NULL,
    checkpoint_payload TEXT,
    checkpoint_status TEXT NOT NULL DEFAULT 'saved',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS replay_timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    session_id INTEGER,
    event_source TEXT NOT NULL,
    event_ref_id INTEGER,
    replay_payload TEXT,
    replay_status TEXT NOT NULL DEFAULT 'recorded',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS recovery_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    snapshot_name TEXT NOT NULL,
    snapshot_payload TEXT,
    snapshot_status TEXT NOT NULL DEFAULT 'ready',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed sessions
cur.execute("SELECT count(*) FROM world_sessions")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO world_sessions (scene_id, session_name, session_status)
        VALUES (?, ?, ?)
    """, [
        (1, "Commerce World Session", "active"),
        (2, "Ops World Session", "active"),
        (3, "Creator World Session", "active"),
    ])

# seed checkpoints
cur.execute("SELECT count(*) FROM scene_checkpoints")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO scene_checkpoints (scene_id, session_id, checkpoint_name, checkpoint_payload, checkpoint_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        (1, 1, "Commerce Initial Checkpoint", '{"presence":1,"objects":2,"state":"stable"}', "saved"),
        (2, 2, "Ops Initial Checkpoint", '{"telemetry":"healthy","routes":"3"}', "saved"),
        (3, 3, "Creator Initial Checkpoint", '{"rooms":"2","games":"ready"}', "saved"),
    ])

# seed replay
cur.execute("SELECT count(*) FROM replay_timeline")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO replay_timeline (scene_id, session_id, event_source, event_ref_id, replay_payload, replay_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        (1, 1, "socket_event_log", 1, '{"event":"presence_sync"}', "recorded"),
        (1, 1, "socket_event_log", 5, '{"event":"avatar_move"}', "recorded"),
        (1, 1, "socket_event_log", 6, '{"event":"object_interaction"}', "recorded"),
    ])

# seed recovery
cur.execute("SELECT count(*) FROM recovery_snapshots")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO recovery_snapshots (scene_id, snapshot_name, snapshot_payload, snapshot_status)
        VALUES (?, ?, ?, ?)
    """, [
        (1, "Commerce Recovery Snapshot", '{"avatar":"east","portal":"activate"}', "ready"),
        (2, "Ops Recovery Snapshot", '{"ops":"healthy","routes":"3 active"}', "ready"),
        (3, "Creator Recovery Snapshot", '{"rooms":"2","world":"ready"}', "ready"),
    ])

conn.commit()
conn.close()
print("[OK] persistence/replay DB additions ready")
PYEOF

########################################
# 2) PATCH WORLD SOCKET
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "world_socket.js"
text = p.read_text()

block = r"""
  if (pathname === '/checkpoint') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const sessionId = Number(url.searchParams.get('sessionId') || 1);
    const name = q(url.searchParams.get('name') || `Checkpoint Scene ${sceneId}`);
    const payload = q(url.searchParams.get('payload') || '{}');

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO scene_checkpoints (scene_id, session_id, checkpoint_name, checkpoint_payload, checkpoint_status)
      VALUES (${sceneId}, ${sessionId}, '${name}', '${payload}', 'saved')`], { encoding: 'utf8' });

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO replay_timeline (scene_id, session_id, event_source, event_ref_id, replay_payload, replay_status)
      VALUES (${sceneId}, ${sessionId}, 'checkpoint', (SELECT id FROM scene_checkpoints ORDER BY id DESC LIMIT 1), '${payload}', 'recorded')`], { encoding: 'utf8' });

    broadcastScene(sceneId, {
      ok: true,
      type: 'checkpoint',
      scene_id: sceneId,
      checkpoint_name: name,
      payload,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, checkpoint: true, scene_id: sceneId, session_id: sessionId, checkpoint_name: name }, null, 2));
  }

  if (pathname === '/recover') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);

    const rows = dbQuery(`SELECT id, snapshot_name, snapshot_payload FROM recovery_snapshots WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 1`);
    const snapshot = rows.length ? rows[0] : null;

    broadcastScene(sceneId, {
      ok: true,
      type: 'recover',
      scene_id: sceneId,
      snapshot,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, recovered: true, scene_id: sceneId, snapshot }, null, 2));
  }
"""

marker = "  if (pathname === '/scene-command') {"
if "pathname === '/checkpoint'" not in text and marker in text:
    text = text.replace(marker, block + "\n" + marker, 1)

sync_old = """      object_commands: dbQuery(`SELECT id, object_id, command_type, command_payload, command_status, created_at FROM object_command_queue WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      recent_events: events,
      timestamp: new Date().toISOString()
    }, null, 2));"""
sync_new = """      object_commands: dbQuery(`SELECT id, object_id, command_type, command_payload, command_status, created_at FROM object_command_queue WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      sessions: dbQuery(`SELECT id, session_name, session_status, started_at, ended_at FROM world_sessions WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 10`),
      checkpoints: dbQuery(`SELECT id, checkpoint_name, checkpoint_status, created_at FROM scene_checkpoints WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      recovery_snapshots: dbQuery(`SELECT id, snapshot_name, snapshot_status, created_at FROM recovery_snapshots WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      recent_events: events,
      timestamp: new Date().toISOString()
    }, null, 2));"""
if "sessions: dbQuery(`SELECT id, session_name" not in text:
    text = text.replace(sync_old, sync_new, 1)

p.write_text(text)
print("[OK] world_socket.js persistence/replay patch applied")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

if '<a href="/world-persistence">World Persistence</a>' not in text and '<a href="/world-execution">World Execution</a>' in text:
    text = text.replace(
        '<a href="/world-execution">World Execution</a>',
        '<a href="/world-execution">World Execution</a>\n      <a href="/world-persistence">World Persistence</a>'
    )

helper = r'''
function renderWorldPersistencePage(user = null) {
  const sessions = dbQuery(`
    SELECT ws.id, sr.scene_name, ws.session_name, ws.session_status, ws.started_at, ws.ended_at
    FROM world_sessions ws
    LEFT JOIN scene_registry sr ON sr.id = ws.scene_id
    ORDER BY ws.id DESC
    LIMIT 100
  `);

  const checkpoints = dbQuery(`
    SELECT sc.id, sr.scene_name, sc.checkpoint_name, sc.checkpoint_payload, sc.checkpoint_status, sc.created_at
    FROM scene_checkpoints sc
    LEFT JOIN scene_registry sr ON sr.id = sc.scene_id
    ORDER BY sc.id DESC
    LIMIT 100
  `);

  const replay = dbQuery(`
    SELECT rt.id, sr.scene_name, rt.event_source, rt.event_ref_id, rt.replay_payload, rt.replay_status, rt.created_at
    FROM replay_timeline rt
    LEFT JOIN scene_registry sr ON sr.id = rt.scene_id
    ORDER BY rt.id DESC
    LIMIT 100
  `);

  const recovery = dbQuery(`
    SELECT rs.id, sr.scene_name, rs.snapshot_name, rs.snapshot_payload, rs.snapshot_status, rs.created_at
    FROM recovery_snapshots rs
    LEFT JOIN scene_registry sr ON sr.id = rs.scene_id
    ORDER BY rs.id DESC
    LIMIT 100
  `);

  const sRows = sessions.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.session_name}</td><td>${r.session_status}</td><td>${r.started_at || ''}</td><td>${r.ended_at || ''}</td></tr>
  `).join('');

  const cRows = checkpoints.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.checkpoint_name}</td><td><code>${r.checkpoint_payload || ''}</code></td><td>${r.checkpoint_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const rRows = replay.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.event_source}</td><td>${r.event_ref_id || ''}</td><td><code>${r.replay_payload || ''}</code></td><td>${r.replay_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const recRows = recovery.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.snapshot_name}</td><td><code>${r.snapshot_payload || ''}</code></td><td>${r.snapshot_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('World Persistence', `
    <div class="section"><div class="card">
      <h2>World Persistence + Replay Layer</h2>
      <p>This layer records sessions, stores checkpoints, tracks replay history, and keeps recovery snapshots for each world.</p>
    </div></div>

    <div class="section"><div class="card">
      <h3>World Sessions</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Session</th><th>Status</th><th>Started</th><th>Ended</th></tr></thead>
        <tbody>${sRows || '<tr><td colspan="6">No sessions yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Scene Checkpoints</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Name</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${cRows || '<tr><td colspan="6">No checkpoints yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Replay Timeline</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Source</th><th>Ref</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${rRows || '<tr><td colspan="7">No replay rows yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Recovery Snapshots</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Name</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${recRows || '<tr><td colspan="6">No recovery snapshots yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function renderWorldPersistencePage(user = null)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

anchor = "    if (req.method === 'GET' && pathname === '/world-execution') {"
if "pathname === '/world-persistence'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/world-persistence') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWorldPersistencePage(authUser));
    }

    if (req.method === 'GET' && pathname === '/world-execution') {"""
    text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] dashboard.js persistence/replay patch applied")
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

cp apps/dashboard.js "backups/dashboard_world_persistence_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_world_persistence_${STAMP}.js"
cp db/aam.db "backups/aam_world_persistence_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as world_sessions from world_sessions;" > "snapshots/world_sessions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scene_checkpoints from scene_checkpoints;" > "snapshots/scene_checkpoints_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as replay_timeline from replay_timeline;" > "snapshots/replay_timeline_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as recovery_snapshots from recovery_snapshots;" > "snapshots/recovery_snapshots_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as state_application_log from state_application_log;" > "snapshots/state_application_log_${STAMP}.json"

echo "WORLD PERSISTENCE CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/world-persistence"
echo "  curl -s http://127.0.0.1:5090/sync/1"
echo "  curl -s 'http://127.0.0.1:5090/checkpoint?sceneId=1&sessionId=1&name=Commerce%20Quick%20Save&payload=%7B%22mode%22%3A%22stable%22%7D'"
echo "  curl -s 'http://127.0.0.1:5090/recover?sceneId=1'"
