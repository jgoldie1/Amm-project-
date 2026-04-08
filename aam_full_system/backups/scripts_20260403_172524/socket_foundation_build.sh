#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== SOCKET FOUNDATION BUILD START ==="

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
CREATE TABLE IF NOT EXISTS socket_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    socket_key TEXT NOT NULL,
    avatar_id INTEGER,
    scene_id INTEGER,
    connection_status TEXT NOT NULL DEFAULT 'connected',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS socket_event_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    socket_key TEXT,
    scene_id INTEGER,
    avatar_id INTEGER,
    event_type TEXT NOT NULL,
    event_payload TEXT,
    event_status TEXT NOT NULL DEFAULT 'processed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS shared_world_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    state_key TEXT NOT NULL,
    state_value TEXT,
    state_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("SELECT count(*) FROM socket_connections")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO socket_connections (socket_key, avatar_id, scene_id, connection_status)
        VALUES (?, ?, ?, ?)
    """, [
        ("sock-commerce-1", 1, 1, "connected"),
        ("sock-ops-1", 2, 2, "connected"),
        ("sock-creator-1", 3, 3, "connected"),
    ])

cur.execute("SELECT count(*) FROM socket_event_log")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO socket_event_log (socket_key, scene_id, avatar_id, event_type, event_payload, event_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("sock-commerce-1", 1, 1, "presence_sync", '{"presence":"online"}', "processed"),
        ("sock-ops-1", 2, 2, "hud_refresh", '{"panel":"IoT Telemetry"}', "processed"),
        ("sock-creator-1", 3, 3, "portal_ready", '{"portal":"Creator Portal"}', "processed"),
    ])

cur.execute("SELECT count(*) FROM shared_world_state")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO shared_world_state (scene_id, state_key, state_value, state_status)
        VALUES (?, ?, ?, ?)
    """, [
        (1, "commerce_presence", "1", "active"),
        (1, "commerce_portals", "stable", "active"),
        (2, "ops_telemetry", "healthy", "active"),
        (2, "ops_routes", "3 active", "active"),
        (3, "creator_rooms", "2", "active"),
        (3, "creator_world_status", "ready", "active"),
    ])

conn.commit()
conn.close()
print("[OK] socket foundation DB additions ready")
PYEOF

########################################
# 2) SOCKET SIDE-CAR
########################################
cat > apps/world_socket.js << 'JSEOF'
const http = require('http');
const { execFileSync } = require('child_process');

const PORT = 5090;
const HOME = process.env.HOME;
const DB_FILE = `${HOME}/aam_full_system/db/aam.db`;

function dbQuery(sql) {
  const out = execFileSync('sqlite3', ['-json', DB_FILE, sql], { encoding: 'utf8' });
  return out.trim() ? JSON.parse(out) : [];
}

function q(text) {
  return String(text || '').replace(/'/g, "''");
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const pathname = url.pathname;

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, service: 'world-socket-foundation', port: PORT }, null, 2));
  }

  if (pathname.startsWith('/sync/')) {
    const sceneId = Number(pathname.split('/')[2]);
    const connections = dbQuery(`SELECT id, socket_key, avatar_id, connection_status, created_at FROM socket_connections WHERE scene_id=${sceneId} ORDER BY id DESC`);
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
    }, null, 2));
  }

  if (pathname === '/emit') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const avatarId = Number(url.searchParams.get('avatarId') || 1);
    const socketKey = q(url.searchParams.get('socketKey') || `sock-scene-${sceneId}-admin`);
    const eventType = q(url.searchParams.get('eventType') || 'manual_emit');
    const payload = q(url.searchParams.get('payload') || '{}');

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO socket_event_log (socket_key, scene_id, avatar_id, event_type, event_payload, event_status)
      VALUES ('${socketKey}', ${sceneId}, ${avatarId}, '${eventType}', '${payload}', 'processed')`], { encoding: 'utf8' });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, emitted: true, scene_id: sceneId, event_type: eventType }, null, 2));
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`World socket foundation running on ${PORT}`);
});
JSEOF

########################################
# 3) CONTROL SCRIPTS
########################################
cat > scripts/start_world_socket.sh << 'EOF2'
#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system
nohup node apps/world_socket.js > logs/world_socket.log 2>&1 &
echo $! > pids/world_socket.pid
echo "World socket started on 5090"
EOF2

cat > scripts/stop_world_socket.sh << 'EOF2'
#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system
if [ -f pids/world_socket.pid ]; then
  PID="$(cat pids/world_socket.pid)"
  kill "$PID" 2>/dev/null || true
  rm -f pids/world_socket.pid
fi
pkill -f "node apps/world_socket.js" 2>/dev/null || true
echo "World socket stopped"
EOF2

cat > scripts/restart_world_socket.sh << 'EOF2'
#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system
bash scripts/stop_world_socket.sh
bash scripts/start_world_socket.sh
EOF2

chmod +x scripts/start_world_socket.sh scripts/stop_world_socket.sh scripts/restart_world_socket.sh
mkdir -p logs pids
bash scripts/restart_world_socket.sh

########################################
# 4) PATCH DASHBOARD
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

def insert_before(marker: str, block: str):
    global text
    if block.strip() not in text and marker in text:
        text = text.replace(marker, block + "\n" + marker)

if '<a href="/socket-sync">Socket Sync</a>' not in text and '<a href="/live-push">Live Push</a>' in text:
    text = text.replace(
        '<a href="/live-push">Live Push</a>',
        '<a href="/live-push">Live Push</a>\n      <a href="/socket-sync">Socket Sync</a>'
    )

pages = r'''
function renderSocketSyncPage(user = null) {
  const connections = dbQuery(`
    SELECT c.id, c.socket_key, a.avatar_name, s.scene_name, c.connection_status, c.created_at
    FROM socket_connections c
    LEFT JOIN avatar_profiles a ON a.id = c.avatar_id
    LEFT JOIN scene_registry s ON s.id = c.scene_id
    ORDER BY c.id DESC
    LIMIT 100
  `);

  const events = dbQuery(`
    SELECT e.id, e.socket_key, s.scene_name, a.avatar_name, e.event_type, e.event_payload, e.event_status, e.created_at
    FROM socket_event_log e
    LEFT JOIN avatar_profiles a ON a.id = e.avatar_id
    LEFT JOIN scene_registry s ON s.id = e.scene_id
    ORDER BY e.id DESC
    LIMIT 100
  `);

  const states = dbQuery(`
    SELECT sws.id, s.scene_name, sws.state_key, sws.state_value, sws.state_status, sws.created_at
    FROM shared_world_state sws
    LEFT JOIN scene_registry s ON s.id = sws.scene_id
    ORDER BY sws.id DESC
    LIMIT 100
  `);

  const connRows = connections.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.socket_key}</td>
      <td>${r.avatar_name || ''}</td>
      <td>${r.scene_name || ''}</td>
      <td>${r.connection_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const eventRows = events.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.socket_key || ''}</td>
      <td>${r.scene_name || ''}</td>
      <td>${r.avatar_name || ''}</td>
      <td>${r.event_type}</td>
      <td><code>${r.event_payload || ''}</code></td>
      <td>${r.event_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const stateRows = states.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.scene_name || ''}</td>
      <td>${r.state_key}</td>
      <td>${r.state_value || ''}</td>
      <td>${r.state_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Socket Sync', `
    <div class="section">
      <div class="card">
        <h2>Socket Sync Foundation</h2>
        <p>This is the true live-state backbone: connection registry, socket events, and shared world state.</p>
        <a href="http://127.0.0.1:5090/health">World Socket Health</a>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Socket Connections</h3>
        <table>
          <thead><tr><th>ID</th><th>Socket</th><th>Avatar</th><th>Scene</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${connRows || '<tr><td colspan="6">No socket connections yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Socket Event Log</h3>
        <table>
          <thead><tr><th>ID</th><th>Socket</th><th>Scene</th><th>Avatar</th><th>Event</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${eventRows || '<tr><td colspan="8">No socket events yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Shared World State</h3>
        <table>
          <thead><tr><th>ID</th><th>Scene</th><th>Key</th><th>Value</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${stateRows || '<tr><td colspan="6">No shared state yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", pages)

anchor = "    if (req.method === 'GET' && pathname === '/live-push') {"
if "pathname === '/socket-sync'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/socket-sync') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderSocketSyncPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/live-push') {"""
    text = text.replace(anchor, routes)

p.write_text(text)
print("[OK] socket sync patch applied")
PYEOF

########################################
# 5) VERIFY
########################################
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh
curl -s http://127.0.0.1:5090/health || true

########################################
# 6) CHECKPOINT
########################################
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots

cp apps/dashboard.js "backups/dashboard_socket_sync_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_${STAMP}.js"
cp db/aam.db "backups/aam_socket_sync_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as socket_connections from socket_connections;" > "snapshots/socket_connections_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as socket_event_log from socket_event_log;" > "snapshots/socket_event_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as shared_world_state from shared_world_state;" > "snapshots/shared_world_state_${STAMP}.json"

echo "SOCKET FOUNDATION CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/socket-sync"
echo "  curl -s http://127.0.0.1:5090/health"
echo "  curl -s http://127.0.0.1:5090/sync/1"
echo "  curl -s 'http://127.0.0.1:5090/emit?sceneId=1&avatarId=1&eventType=manual_test&payload=%7B%22test%22%3Atrue%7D'"
