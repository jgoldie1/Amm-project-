#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== VISUAL WORLD + STREAMING ACTIVATION START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_visual_stream_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_visual_stream_${STAMP}.js"
cp db/aam.db "backups/aam_visual_stream_${STAMP}.db"

########################################
# 2) DATABASE LAYER
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS visual_world_scenes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scene_name TEXT NOT NULL,
  scene_code TEXT NOT NULL UNIQUE,
  scene_type TEXT NOT NULL,
  visual_mode TEXT,
  access_tier TEXT DEFAULT 'basic_access',
  scene_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS creator_stream_channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER,
  channel_name TEXT NOT NULL,
  channel_code TEXT NOT NULL UNIQUE,
  channel_type TEXT NOT NULL DEFAULT 'live_stream',
  access_tier TEXT DEFAULT 'basic_access',
  channel_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS creator_live_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id INTEGER NOT NULL,
  session_title TEXT NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'live_event',
  scene_id INTEGER,
  session_status TEXT NOT NULL DEFAULT 'scheduled',
  started_at TEXT,
  ended_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS stream_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER NOT NULL,
  channel_id INTEGER NOT NULL,
  tier_code TEXT NOT NULL DEFAULT 'basic_access',
  subscription_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS stream_tip_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_heir_id INTEGER,
  to_heir_id INTEGER,
  channel_id INTEGER,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  tip_status TEXT NOT NULL DEFAULT 'posted',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

scenes = [
    ("Commerce World", "commerce_world", "metaverse", "interactive_3d", "basic_access"),
    ("Creator Arena", "creator_arena", "metaverse", "live_stage_3d", "creator_access"),
    ("Heirs Citadel", "heirs_citadel", "middleverse", "identity_governance", "founder_heir"),
    ("Multiverse Gateway", "multiverse_gateway", "multiverse", "expansion_portal", "storefront_access"),
]
for scene_name, scene_code, scene_type, visual_mode, access_tier in scenes:
    cur.execute("""
    INSERT OR IGNORE INTO visual_world_scenes
    (scene_name, scene_code, scene_type, visual_mode, access_tier, scene_status)
    VALUES (?, ?, ?, ?, ?, 'active')
    """, (scene_name, scene_code, scene_type, visual_mode, access_tier))

channels = [
    (1, "Jacobie Vision Live", "jacobie_vision_live", "live_stream", "basic_access"),
    (2, "Anyone Can Be a Star Live", "isaiah_star_live", "performance_stream", "storefront_access"),
    (3, "Aniyah Singing Coach Live", "aniyah_coach_live", "coaching_stream", "creator_access"),
]
for heir_id, channel_name, channel_code, channel_type, access_tier in channels:
    cur.execute("""
    INSERT OR IGNORE INTO creator_stream_channels
    (heir_id, channel_name, channel_code, channel_type, access_tier, channel_status)
    VALUES (?, ?, ?, ?, ?, 'active')
    """, (heir_id, channel_name, channel_code, channel_type, access_tier))

sessions = [
    (1, "Commerce World Opening Session", "live_event", 1, "scheduled"),
    (2, "Anyone Can Be a Star Showcase", "live_event", 2, "scheduled"),
    (3, "Aniyah Vocal Training Session", "coaching", 2, "scheduled"),
]
for channel_id, session_title, session_type, scene_id, session_status in sessions:
    cur.execute("""
    INSERT INTO creator_live_sessions
    (channel_id, session_title, session_type, scene_id, session_status)
    VALUES (?, ?, ?, ?, ?)
    """, (channel_id, session_title, session_type, scene_id, session_status))

tips = [
    (1, 2, 2, 500),
    (1, 3, 3, 750),
]
for from_heir_id, to_heir_id, channel_id, amount_cents in tips:
    cur.execute("""
    INSERT INTO stream_tip_events
    (from_heir_id, to_heir_id, channel_id, amount_cents, tip_status)
    VALUES (?, ?, ?, ?, 'posted')
    """, (from_heir_id, to_heir_id, channel_id, amount_cents))

conn.commit()
conn.close()
print("[OK] visual world + streaming tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function renderVisualStreamingPage(req, user = null, message = '') {
  const scenes = dbQuery(`
    SELECT id, scene_name, scene_code, scene_type, visual_mode, access_tier, scene_status, created_at
    FROM visual_world_scenes
    ORDER BY id ASC
  `);

  const channels = dbQuery(`
    SELECT c.id, h.name as heir_name, c.channel_name, c.channel_code, c.channel_type, c.access_tier, c.channel_status, c.created_at
    FROM creator_stream_channels c
    LEFT JOIN heirs_registry h ON h.id = c.heir_id
    ORDER BY c.id ASC
  `);

  const sessions = dbQuery(`
    SELECT s.id, c.channel_name, s.session_title, s.session_type, s.scene_id, s.session_status, s.created_at
    FROM creator_live_sessions s
    LEFT JOIN creator_stream_channels c ON c.id = s.channel_id
    ORDER BY s.id DESC
    LIMIT 100
  `);

  const tips = dbQuery(`
    SELECT t.id, hf.name as from_name, ht.name as to_name, c.channel_name, t.amount_cents, t.tip_status, t.created_at
    FROM stream_tip_events t
    LEFT JOIN heirs_registry hf ON hf.id = t.from_heir_id
    LEFT JOIN heirs_registry ht ON ht.id = t.to_heir_id
    LEFT JOIN creator_stream_channels c ON c.id = t.channel_id
    ORDER BY t.id DESC
    LIMIT 100
  `);

  const sceneRows = scenes.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name}</td><td>${r.scene_code}</td><td>${r.scene_type}</td><td>${r.visual_mode || ''}</td><td>${r.access_tier || ''}</td><td>${r.scene_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const channelRows = channels.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.channel_name}</td><td>${r.channel_code}</td><td>${r.channel_type}</td><td>${r.access_tier || ''}</td><td>${r.channel_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const sessionRows = sessions.map(r => `
    <tr><td>${r.id}</td><td>${r.channel_name || ''}</td><td>${r.session_title}</td><td>${r.session_type}</td><td>${r.scene_id || ''}</td><td>${r.session_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const tipRows = tips.map(r => `
    <tr><td>${r.id}</td><td>${r.from_name || ''}</td><td>${r.to_name || ''}</td><td>${r.channel_name || ''}</td><td>$${((Number(r.amount_cents || 0))/100).toFixed(2)}</td><td>${r.tip_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Visual World + Streaming', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main cleaner-main">
        <section class="portal-subhero clean-hero">
          <div class="portal-kicker">Visual + Streaming Activation</div>
          <h1>Visual World + Streaming</h1>
          <p>Control the visual world layer, creator channels, live sessions, and streaming monetization scaffolds.</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>

        <div class="feature-grid compact-grid">
          ${typeof compactFeatureCard === 'function' ? compactFeatureCard('Engine Bridge', 'Control Unity, Unreal, Web, and holo orchestration.', '/engine-bridge') : ''}
          ${typeof compactFeatureCard === 'function' ? compactFeatureCard('Join', 'Drive access tier conversion and monetization.', '/join') : ''}
          ${typeof compactFeatureCard === 'function' ? compactFeatureCard('Watch', 'Open streaming and attention surfaces.', '/watch') : ''}
          ${typeof compactFeatureCard === 'function' ? compactFeatureCard('Build', 'Creator and storefront participation layer.', '/build') : ''}
        </div>

        <section class="clean-section"><div class="section-head"><h2>Visual World Scenes</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Name</th><th>Code</th><th>Type</th><th>Visual Mode</th><th>Access Tier</th><th>Status</th><th>Created</th></tr></thead><tbody>${sceneRows || '<tr><td colspan="8">No scenes yet.</td></tr>'}</tbody></table></div></section>

        <section class="clean-section"><div class="section-head"><h2>Creator Stream Channels</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Heir</th><th>Name</th><th>Code</th><th>Type</th><th>Access Tier</th><th>Status</th><th>Created</th></tr></thead><tbody>${channelRows || '<tr><td colspan="8">No channels yet.</td></tr>'}</tbody></table></div></section>

        <section class="clean-section"><div class="section-head"><h2>Live Sessions</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Channel</th><th>Title</th><th>Type</th><th>Scene</th><th>Status</th><th>Created</th></tr></thead><tbody>${sessionRows || '<tr><td colspan="7">No live sessions yet.</td></tr>'}</tbody></table></div></section>

        <section class="clean-section"><div class="section-head"><h2>Stream Tip Events</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>From</th><th>To</th><th>Channel</th><th>Amount</th><th>Status</th><th>Created</th></tr></thead><tbody>${tipRows || '<tr><td colspan="7">No tips yet.</td></tr>'}</tbody></table></div></section>
      </main>
    </div>
  `, user);
}
"""

marker = "const server = http.createServer(async (req, res) => {"
if "function renderVisualStreamingPage(req, user = null, message = '')" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

if '<a href="/visual-streaming">Visual Streaming</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/engine-bridge">Engine Bridge</a>',
        '<a href="/engine-bridge">Engine Bridge</a>\n          <a href="/visual-streaming">Visual Streaming</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/engine-bridge') {"
if "pathname === '/visual-streaming'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/visual-streaming') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderVisualStreamingPage(req, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'GET' && pathname === '/engine-bridge') {"""
    text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] visual world + streaming UI applied")
PYEOF

########################################
# 4) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 5) ROUTE CHECKS
########################################
for route in \
  /visual-streaming \
  /engine-bridge \
  /watch \
  /join \
  /build \
  /learn \
  /role-hub
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as visual_world_scenes from visual_world_scenes;" > "snapshots/visual_world_scenes_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as creator_stream_channels from creator_stream_channels;" > "snapshots/creator_stream_channels_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as creator_live_sessions from creator_live_sessions;" > "snapshots/creator_live_sessions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as stream_subscriptions from stream_subscriptions;" > "snapshots/stream_subscriptions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as stream_tip_events from stream_tip_events;" > "snapshots/stream_tip_events_${STAMP}.json"

########################################
# 7) REPORT
########################################
cat > "reports/visual_world_and_streaming_activation_${STAMP}.txt" <<REPORT
VISUAL WORLD + STREAMING ACTIVATION REPORT
Timestamp: ${STAMP}

Added:
- visual_world_scenes
- creator_stream_channels
- creator_live_sessions
- stream_subscriptions
- stream_tip_events
- /visual-streaming

Purpose:
- activate the visual world and streaming monetization scaffold
- connect creator live sessions to world scenes
- prepare the platform for a richer public-facing experience
REPORT

echo "VISUAL WORLD + STREAMING ACTIVATION COMPLETE: $STAMP"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/visual-streaming"
echo "  termux-open-url http://127.0.0.1:4900/engine-bridge"
echo "  termux-open-url http://127.0.0.1:4900/watch"
