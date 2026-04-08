const http = require('http');
const { execFileSync } = require('child_process');

const PORT = 5090;
const HOME = process.env.HOME;
const DB_FILE = `${HOME}/aam_full_system/db/aam.db`;
const clients = new Map();

function dbQuery(sql) {
  const out = execFileSync('sqlite3', ['-json', DB_FILE, sql], { encoding: 'utf8' });
  return out.trim() ? JSON.parse(out) : [];
}

function q(text) {
  return String(text || '').replace(/'/g, "''");
}


function sendSSE(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function broadcastScene(sceneId, payload) {
  const key = String(sceneId);
  if (!clients.has(key)) return;
  for (const res of clients.get(key)) {
    try {
      sendSSE(res, payload);
    } catch (e) {}
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const pathname = url.pathname;

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, service: 'world-socket-foundation', port: PORT }, null, 2));
  }

  if (pathname.startsWith('/stream/')) {
    const sceneId = Number(pathname.split('/')[2]);
    const key = String(sceneId);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    if (!clients.has(key)) clients.set(key, new Set());
    clients.get(key).add(res);

    sendSSE(res, {
      ok: true,
      type: 'connected',
      scene_id: sceneId,
      timestamp: new Date().toISOString()
    });

    req.on('close', () => {
      if (clients.has(key)) {
        clients.get(key).delete(res);
        if (clients.get(key).size === 0) clients.delete(key);
      }
    });
    return;
  }

  if (pathname.startsWith('/sync/')) {
    const sceneId = Number(pathname.split('/')[2]);
    const connections = dbQuery(`SELECT id, socket_key, avatar_id, connection_status, created_at FROM socket_connections WHERE scene_id=${sceneId} ORDER BY id DESC`);
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
      scene_commands: dbQuery(`SELECT id, command_type, command_payload, command_status, created_at FROM scene_command_queue WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      avatar_actions: dbQuery(`SELECT id, avatar_id, action_type, action_payload, action_status, created_at FROM avatar_action_queue WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      object_commands: dbQuery(`SELECT id, object_id, command_type, command_payload, command_status, created_at FROM object_command_queue WHERE scene_id=${sceneId} ORDER BY id DESC LIMIT 20`),
      recent_events: events,
      timestamp: new Date().toISOString()
    }, null, 2));
  }



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

  if (pathname === '/emit') {
    const sceneId = Number(url.searchParams.get('sceneId') || 0);
    const avatarId = Number(url.searchParams.get('avatarId') || 1);
    const socketKey = q(url.searchParams.get('socketKey') || `sock-scene-${sceneId}-admin`);
    const eventType = q(url.searchParams.get('eventType') || 'manual_emit');
    const payload = q(url.searchParams.get('payload') || '{}');

    execFileSync('sqlite3', [DB_FILE, `INSERT INTO socket_event_log (socket_key, scene_id, avatar_id, event_type, event_payload, event_status)
      VALUES ('${socketKey}', ${sceneId}, ${avatarId}, '${eventType}', '${payload}', 'processed')`], { encoding: 'utf8' });

    broadcastScene(sceneId, {
      ok: true,
      type: 'event',
      scene_id: sceneId,
      avatar_id: avatarId,
      event_type: eventType,
      payload,
      timestamp: new Date().toISOString()
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, emitted: true, scene_id: sceneId, event_type: eventType }, null, 2));
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`World socket foundation running on ${PORT}`);
});
