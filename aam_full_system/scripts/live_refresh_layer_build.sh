#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== LIVE REFRESH LAYER BUILD START ==="

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
CREATE TABLE IF NOT EXISTS refresh_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER,
    snapshot_type TEXT NOT NULL,
    snapshot_payload TEXT,
    snapshot_status TEXT NOT NULL DEFAULT 'ready',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("SELECT count(*) FROM refresh_snapshots")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO refresh_snapshots (scene_id, snapshot_type, snapshot_payload, snapshot_status)
        VALUES (?, ?, ?, ?)
    """, [
        (1, "world_status", '{"traffic":"normal","users":"1","portals":"stable"}', "ready"),
        (2, "world_status", '{"iot":"healthy","routes":"3 active","ops":"normal"}', "ready"),
        (3, "world_status", '{"rooms":"2","games":"ready","creator":"live"}', "ready"),
    ])

conn.commit()
conn.close()
print("[OK] live refresh DB additions ready")
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

if '<a href="/live-sync">Live Sync</a>' not in text and '<a href="/world-sync">World Sync</a>' in text:
    text = text.replace(
        '<a href="/world-sync">World Sync</a>',
        '<a href="/world-sync">World Sync</a>\n      <a href="/live-sync">Live Sync</a>'
    )

pages = r'''
function renderLiveSyncPage(user = null) {
  const channels = dbQuery(`
    SELECT id, channel_name, channel_type, scene_id, sync_status, created_at
    FROM sync_channels
    ORDER BY id DESC
  `);

  const snapshots = dbQuery(`
    SELECT rs.id, rs.scene_id, s.scene_name, rs.snapshot_type, rs.snapshot_payload, rs.snapshot_status, rs.created_at
    FROM refresh_snapshots rs
    LEFT JOIN scene_registry s ON s.id = rs.scene_id
    ORDER BY rs.id DESC
    LIMIT 100
  `);

  const channelRows = channels.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.channel_name}</td>
      <td>${c.channel_type}</td>
      <td>${c.scene_id || ''}</td>
      <td>${c.sync_status}</td>
      <td>${c.created_at || ''}</td>
    </tr>
  `).join('');

  const snapshotRows = snapshots.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${s.scene_name || ('Scene ' + (s.scene_id || ''))}</td>
      <td>${s.snapshot_type}</td>
      <td><code>${s.snapshot_payload || ''}</code></td>
      <td>${s.snapshot_status}</td>
      <td>${s.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Live Sync', `
    <div class="section">
      <div class="card">
        <h2>Live Refresh + Sync Layer</h2>
        <p>This is the first near-real-time layer. It adds refresh snapshots, sync visibility, and polling-ready world status data.</p>
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

    <div class="section">
      <div class="card">
        <h3>Refresh Snapshots</h3>
        <table>
          <thead><tr><th>ID</th><th>Scene</th><th>Type</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${snapshotRows || '<tr><td colspan="6">No snapshots yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", pages)

anchor = "    if (req.method === 'GET' && pathname === '/world-sync') {"
if "pathname === '/live-sync'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/live-sync') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderLiveSyncPage(authUser));
    }

    if (req.method === 'GET' && pathname.startsWith('/api/world-sync/')) {
      const sceneId = Number(pathname.split('/')[3]);
      const presence = dbQuery(`SELECT count(*) as c FROM world_presence WHERE scene_id=${Number(sceneId)} AND presence_status='online'`)[0]?.c || 0;
      const events = dbQuery(`SELECT count(*) as c FROM world_event_bus WHERE scene_id=${Number(sceneId)}`)[0]?.c || 0;
      const hud = dbQuery(`SELECT hud_name, hud_value FROM world_hud_panels WHERE scene_id=${Number(sceneId)} ORDER BY id ASC`);
      const syncRows = dbQuery(`SELECT sync_key, sync_value, sync_status FROM world_state_sync WHERE scene_id=${Number(sceneId)} ORDER BY id ASC`);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({
        ok: true,
        scene_id: sceneId,
        online_presence: presence,
        event_count: events,
        hud,
        world_state: syncRows,
        timestamp: new Date().toISOString()
      }, null, 2));
    }

    if (req.method === 'GET' && pathname === '/world-sync') {"""
    text = text.replace(anchor, routes)

# upgrade motion world page with live polling footer
needle = "</div>\n  `, user);\n}"
replacement = """    <script>
      setInterval(async () => {
        try {
          const path = window.location.pathname;
          const parts = path.split('/');
          const sceneId = parts[2];
          if (!sceneId) return;
          const res = await fetch('/api/world-sync/' + sceneId);
          const data = await res.json();
          const el = document.getElementById('liveSyncStatus');
          if (el) {
            el.textContent = 'Live Sync — Presence: ' + data.online_presence + ' | Events: ' + data.event_count + ' | Updated: ' + new Date().toLocaleTimeString();
          }
        } catch (e) {}
      }, 5000);
    </script>
  </div>
  `, user);
}"""

motion_marker = """        <table>
          <thead><tr><th>Key</th><th>Value</th><th>Status</th></tr></thead>
          <tbody>${syncRows || '<tr><td colspan="3">No sync rows found.</td></tr>'}</tbody>
        </table>
      </div>
    </div>"""
motion_replace = """        <table>
          <thead><tr><th>Key</th><th>Value</th><th>Status</th></tr></thead>
          <tbody>${syncRows || '<tr><td colspan="3">No sync rows found.</td></tr>'}</tbody>
        </table>
        <p id="liveSyncStatus" class="muted" style="margin-top:12px;">Live Sync — waiting for refresh...</p>
      </div>
    </div>"""
text = text.replace(motion_marker, motion_replace, 1)

# append script only once
if "id=\"liveSyncStatus\"" in text and "fetch('/api/world-sync/'" not in text:
    text = text.replace(needle, replacement, 1)

p.write_text(text)
print("[OK] live refresh layer patch applied")
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

cp apps/dashboard.js "backups/dashboard_live_refresh_${STAMP}.js"
cp db/aam.db "backups/aam_live_refresh_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as refresh_snapshots from refresh_snapshots;" > "snapshots/refresh_snapshots_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as world_event_bus from world_event_bus;" > "snapshots/live_refresh_world_event_bus_${STAMP}.json"

echo "LIVE REFRESH LAYER CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/live-sync"
echo "  termux-open-url http://127.0.0.1:4900/motion-worlds/1"
echo "  curl -s http://127.0.0.1:4900/api/world-sync/1"
