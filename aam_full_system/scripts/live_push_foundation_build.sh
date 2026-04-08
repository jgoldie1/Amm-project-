#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== LIVE PUSH FOUNDATION BUILD START ==="

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
CREATE TABLE IF NOT EXISTS push_channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_name TEXT NOT NULL,
    channel_scope TEXT NOT NULL,
    scene_id INTEGER,
    push_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS notification_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id INTEGER,
    avatar_id INTEGER,
    notification_type TEXT NOT NULL,
    notification_title TEXT NOT NULL,
    notification_body TEXT,
    delivery_status TEXT NOT NULL DEFAULT 'queued',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS scene_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER,
    alert_type TEXT NOT NULL,
    alert_title TEXT NOT NULL,
    alert_body TEXT,
    alert_status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed push channels
cur.execute("SELECT count(*) FROM push_channels")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO push_channels (channel_name, channel_scope, scene_id, push_status)
        VALUES (?, ?, ?, ?)
    """, [
        ("Commerce Push Channel", "scene", 1, "active"),
        ("Ops Push Channel", "scene", 2, "active"),
        ("Creator Push Channel", "scene", 3, "active"),
        ("Global Admin Push", "global", None, "active"),
    ])

# seed queue
cur.execute("SELECT count(*) FROM notification_queue")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO notification_queue (channel_id, avatar_id, notification_type, notification_title, notification_body, delivery_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        (1, 1, "world_event", "Commerce World Ready", "Commerce scene is live and synchronized.", "queued"),
        (2, 2, "ops_event", "Ops Sync Healthy", "IoT and logistics dashboards are synchronized.", "queued"),
        (3, 3, "creator_event", "Creator World Active", "Hybrid games and holo systems are available.", "queued"),
    ])

# seed alerts
cur.execute("SELECT count(*) FROM scene_alerts")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO scene_alerts (scene_id, alert_type, alert_title, alert_body, alert_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        (1, "status", "Commerce Stable", "Books, wallet, and payment panels are stable.", "open"),
        (2, "status", "Ops Stable", "Logistics, IoT, and sync channels are stable.", "open"),
        (3, "status", "Creator Stable", "Hybrid games and quantum holo profiles are ready.", "open"),
    ])

conn.commit()
conn.close()
print("[OK] live push DB additions ready")
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

if '<a href="/live-push">Live Push</a>' not in text and '<a href="/world-comms">World Comms</a>' in text:
    text = text.replace(
        '<a href="/world-comms">World Comms</a>',
        '<a href="/world-comms">World Comms</a>\n      <a href="/live-push">Live Push</a>'
    )

pages = r'''
function renderLivePushPage(user = null) {
  const channels = dbQuery(`
    SELECT id, channel_name, channel_scope, scene_id, push_status, created_at
    FROM push_channels
    ORDER BY id DESC
  `);

  const queue = dbQuery(`
    SELECT q.id, p.channel_name, a.avatar_name, q.notification_type, q.notification_title, q.notification_body, q.delivery_status, q.created_at
    FROM notification_queue q
    LEFT JOIN push_channels p ON p.id = q.channel_id
    LEFT JOIN avatar_profiles a ON a.id = q.avatar_id
    ORDER BY q.id DESC
    LIMIT 100
  `);

  const alerts = dbQuery(`
    SELECT sa.id, s.scene_name, sa.alert_type, sa.alert_title, sa.alert_body, sa.alert_status, sa.created_at
    FROM scene_alerts sa
    LEFT JOIN scene_registry s ON s.id = sa.scene_id
    ORDER BY sa.id DESC
    LIMIT 100
  `);

  const channelRows = channels.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.channel_name}</td>
      <td>${r.channel_scope}</td>
      <td>${r.scene_id || ''}</td>
      <td>${r.push_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const queueRows = queue.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.channel_name || ''}</td>
      <td>${r.avatar_name || ''}</td>
      <td>${r.notification_type}</td>
      <td>${r.notification_title}</td>
      <td>${r.notification_body || ''}</td>
      <td>${r.delivery_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const alertRows = alerts.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.scene_name || ''}</td>
      <td>${r.alert_type}</td>
      <td>${r.alert_title}</td>
      <td>${r.alert_body || ''}</td>
      <td>${r.alert_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Live Push', `
    <div class="section">
      <div class="card">
        <h2>Live Push Foundation</h2>
        <p>This is the bridge from polling to event delivery: push channels, queued notifications, and scene alerts.</p>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Push Channels</h3>
        <table>
          <thead><tr><th>ID</th><th>Channel</th><th>Scope</th><th>Scene</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${channelRows || '<tr><td colspan="6">No push channels yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Notification Queue</h3>
        <table>
          <thead><tr><th>ID</th><th>Channel</th><th>Avatar</th><th>Type</th><th>Title</th><th>Body</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${queueRows || '<tr><td colspan="8">No notifications yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Scene Alerts</h3>
        <table>
          <thead><tr><th>ID</th><th>Scene</th><th>Type</th><th>Title</th><th>Body</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${alertRows || '<tr><td colspan="7">No alerts yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", pages)

anchor = "    if (req.method === 'GET' && pathname === '/world-comms') {"
if "pathname === '/live-push'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/live-push') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderLivePushPage(authUser));
    }

    if (req.method === 'GET' && pathname.startsWith('/api/live-push/')) {
      const sceneId = Number(pathname.split('/')[3]);
      const alerts = dbQuery(`SELECT id, alert_type, alert_title, alert_body, alert_status, created_at FROM scene_alerts WHERE scene_id=${Number(sceneId)} ORDER BY id DESC LIMIT 20`);
      const queue = dbQuery(`SELECT id, notification_type, notification_title, delivery_status, created_at FROM notification_queue WHERE channel_id IN (SELECT id FROM push_channels WHERE scene_id=${Number(sceneId)}) ORDER BY id DESC LIMIT 20`);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({
        ok: true,
        scene_id: sceneId,
        alerts,
        notifications: queue,
        timestamp: new Date().toISOString()
      }, null, 2));
    }

    if (req.method === 'GET' && pathname === '/world-comms') {"""
    text = text.replace(anchor, routes)

# add live push footer to motion world page if live sync footer already exists
marker = '<p id="liveSyncStatus" class="muted" style="margin-top:12px;">Live Sync — waiting for refresh...</p>'
replace = '''<p id="liveSyncStatus" class="muted" style="margin-top:12px;">Live Sync — waiting for refresh...</p>
        <p id="livePushStatus" class="muted" style="margin-top:8px;">Live Push — waiting for notifications...</p>'''
text = text.replace(marker, replace, 1)

# extend polling script
old = """            el.textContent = 'Live Sync — Presence: ' + data.online_presence + ' | Events: ' + data.event_count + ' | Updated: ' + new Date().toLocaleTimeString();
          }
        } catch (e) {}
      }, 5000);"""
new = """            el.textContent = 'Live Sync — Presence: ' + data.online_presence + ' | Events: ' + data.event_count + ' | Updated: ' + new Date().toLocaleTimeString();
          }

          const pushRes = await fetch('/api/live-push/' + sceneId);
          const pushData = await pushRes.json();
          const pushEl = document.getElementById('livePushStatus');
          if (pushEl) {
            pushEl.textContent = 'Live Push — Alerts: ' + (pushData.alerts ? pushData.alerts.length : 0) + ' | Notifications: ' + (pushData.notifications ? pushData.notifications.length : 0) + ' | Updated: ' + new Date().toLocaleTimeString();
          }
        } catch (e) {}
      }, 5000);"""
text = text.replace(old, new, 1)

# log queue entry when motion world opens
old_motion = """      dbRun(`INSERT INTO world_messages (scene_id, avatar_id, message_type, message_text, message_status)
             VALUES (${Number(sceneId)}, 1, 'system', 'Motion world opened and synced from admin shell.', 'active')`);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderMotionWorldDetail(sceneId, authUser));"""
new_motion = """      dbRun(`INSERT INTO world_messages (scene_id, avatar_id, message_type, message_text, message_status)
             VALUES (${Number(sceneId)}, 1, 'system', 'Motion world opened and synced from admin shell.', 'active')`);
      dbRun(`INSERT INTO notification_queue (channel_id, avatar_id, notification_type, notification_title, notification_body, delivery_status)
             VALUES ((SELECT id FROM push_channels WHERE scene_id=${Number(sceneId)} LIMIT 1), 1, 'scene_open', 'Motion World Opened', 'Motion world opened from admin shell.', 'queued')`);
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

cp apps/dashboard.js "backups/dashboard_live_push_${STAMP}.js"
cp db/aam.db "backups/aam_live_push_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as push_channels from push_channels;" > "snapshots/push_channels_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as notification_queue from notification_queue;" > "snapshots/notification_queue_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scene_alerts from scene_alerts;" > "snapshots/scene_alerts_${STAMP}.json"

echo "LIVE PUSH FOUNDATION CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/live-push"
echo "  termux-open-url http://127.0.0.1:4900/motion-worlds/1"
echo "  curl -s http://127.0.0.1:4900/api/live-push/1"
