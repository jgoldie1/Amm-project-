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
