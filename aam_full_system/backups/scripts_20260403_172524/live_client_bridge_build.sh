#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== LIVE CLIENT BRIDGE BUILD START ==="

python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "world_socket.js"
text = p.read_text()

if "const clients = new Map();" not in text:
    text = text.replace(
        "const DB_FILE = `${HOME}/aam_full_system/db/aam.db`;\n",
        "const DB_FILE = `${HOME}/aam_full_system/db/aam.db`;\nconst clients = new Map();\n"
    )

if "function sendSSE(res, payload)" not in text:
    helper = r'''
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
'''
    text = text.replace(
        "const server = http.createServer((req, res) => {",
        helper + "\nconst server = http.createServer((req, res) => {"
    )

if "pathname.startsWith('/stream/')" not in text:
    marker = "  if (pathname.startsWith('/sync/')) {"
    block = r"""  if (pathname.startsWith('/stream/')) {
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

"""
    if marker in text:
        text = text.replace(marker, block + marker, 1)

old_emit = """    execFileSync('sqlite3', [DB_FILE, `INSERT INTO socket_event_log (socket_key, scene_id, avatar_id, event_type, event_payload, event_status)
      VALUES ('${socketKey}', ${sceneId}, ${avatarId}, '${eventType}', '${payload}', 'processed')`], { encoding: 'utf8' });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, emitted: true, scene_id: sceneId, event_type: eventType }, null, 2));"""

new_emit = """    execFileSync('sqlite3', [DB_FILE, `INSERT INTO socket_event_log (socket_key, scene_id, avatar_id, event_type, event_payload, event_status)
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
    return res.end(JSON.stringify({ ok: true, emitted: true, scene_id: sceneId, event_type: eventType }, null, 2));"""

if old_emit in text:
    text = text.replace(old_emit, new_emit, 1)

p.write_text(text)
print("[OK] world_socket.js patched")
PYEOF

python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

marker = '<p id="livePushStatus" class="muted" style="margin-top:8px;">Live Push — waiting for notifications...</p>'
replace = '''<p id="livePushStatus" class="muted" style="margin-top:8px;">Live Push — waiting for notifications...</p>
        <p id="liveSocketStatus" class="muted" style="margin-top:8px;">Live Socket — waiting for stream...</p>
        <div id="liveEventFeed" style="margin-top:12px; max-height:180px; overflow:auto; border:1px solid #334155; border-radius:12px; padding:10px; background:#020617;">
          <div class="muted">No live events yet.</div>
        </div>'''
if marker in text and 'id="liveSocketStatus"' not in text:
    text = text.replace(marker, replace, 1)

old = """      setInterval(async () => {
        try {
          if (!sceneId) return;
          const res = await fetch('/api/world-sync/' + sceneId);
          const data = await res.json();
          const el = document.getElementById('liveSyncStatus');
          if (el) {
            el.textContent = 'Live Sync — Presence: ' + data.online_presence + ' | Events: ' + data.event_count + ' | Updated: ' + new Date().toLocaleTimeString();
          }

          const pushRes = await fetch('/api/live-push/' + sceneId);
          const pushData = await pushRes.json();
          const pushEl = document.getElementById('livePushStatus');
          if (pushEl) {
            pushEl.textContent = 'Live Push — Alerts: ' + (pushData.alerts ? pushData.alerts.length : 0) + ' | Notifications: ' + (pushData.notifications ? pushData.notifications.length : 0) + ' | Updated: ' + new Date().toLocaleTimeString();
          }
        } catch (e) {}
      }, 5000);"""

new = """      if (sceneId && !window.__aamLiveSocketBound) {
        window.__aamLiveSocketBound = true;
        const evt = new EventSource('http://127.0.0.1:5090/stream/' + sceneId);
        evt.onmessage = function(ev) {
          try {
            const data = JSON.parse(ev.data);
            const socketEl = document.getElementById('liveSocketStatus');
            if (socketEl) {
              socketEl.textContent = 'Live Socket — ' + (data.type || 'event') + ' | Updated: ' + new Date().toLocaleTimeString();
            }

            const feed = document.getElementById('liveEventFeed');
            if (feed) {
              const row = document.createElement('div');
              row.style.borderBottom = '1px solid #1e293b';
              row.style.padding = '6px 0';
              row.innerHTML = '<strong>' + (data.event_type || data.type || 'update') + '</strong>' +
                ' <span class="muted">' + new Date().toLocaleTimeString() + '</span>' +
                '<div class="muted">' + (typeof data.payload === 'string' ? data.payload : JSON.stringify(data.payload || {})) + '</div>';
              if (feed.firstElementChild && feed.firstElementChild.textContent === 'No live events yet.') {
                feed.innerHTML = '';
              }
              feed.prepend(row);
            }
          } catch (e) {}
        };
      }

      setInterval(async () => {
        try {
          if (!sceneId) return;
          const res = await fetch('/api/world-sync/' + sceneId);
          const data = await res.json();
          const el = document.getElementById('liveSyncStatus');
          if (el) {
            el.textContent = 'Live Sync — Presence: ' + data.online_presence + ' | Events: ' + data.event_count + ' | Updated: ' + new Date().toLocaleTimeString();
          }

          const pushRes = await fetch('/api/live-push/' + sceneId);
          const pushData = await pushRes.json();
          const pushEl = document.getElementById('livePushStatus');
          if (pushEl) {
            pushEl.textContent = 'Live Push — Alerts: ' + (pushData.alerts ? pushData.alerts.length : 0) + ' | Notifications: ' + (pushData.notifications ? pushData.notifications.length : 0) + ' | Updated: ' + new Date().toLocaleTimeString();
          }
        } catch (e) {}
      }, 5000);"""

if old in text:
    text = text.replace(old, new, 1)

p.write_text(text)
print("[OK] dashboard.js patched")
PYEOF

bash scripts/restart_world_socket.sh
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh
curl -s http://127.0.0.1:5090/health || true

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots
cp apps/dashboard.js "backups/dashboard_live_client_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_live_client_${STAMP}.js"
cp db/aam.db "backups/aam_live_client_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as socket_event_log from socket_event_log;" > "snapshots/live_client_socket_event_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as notification_queue from notification_queue;" > "snapshots/live_client_notification_queue_${STAMP}.json"

echo "LIVE CLIENT BRIDGE CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/motion-worlds/1"
echo "  curl -s http://127.0.0.1:5090/health"
echo "  curl -s 'http://127.0.0.1:5090/emit?sceneId=1&avatarId=1&eventType=manual_test&payload=%7B%22from%22%3A%22live_client%22%7D'"
