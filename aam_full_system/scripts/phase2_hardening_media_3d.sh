#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== PHASE 2 HARDENING + MEDIA + 3D START ==="

########################################
# 1) DIRECTORIES
########################################
mkdir -p uploads/books uploads/audio uploads/docs uploads/covers public/audio public/scenes

########################################
# 2) DATABASE HARDENING / NEW TABLES
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

def cols(table):
    return [r[1] for r in cur.execute(f"PRAGMA table_info({table})").fetchall()]

def ensure_column(table, col_name, ddl):
    if col_name not in cols(table):
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {ddl}")
        print(f"[OK] Added column {table}.{col_name}")

# user/session persistence
cur.execute("""
CREATE TABLE IF NOT EXISTS user_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    display_name TEXT,
    account_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    email TEXT,
    phone TEXT,
    branch_person_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES user_accounts(id)
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS persistent_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TEXT,
    session_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES user_accounts(id)
)
""")

# upload policy
cur.execute("""
CREATE TABLE IF NOT EXISTS upload_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    policy_name TEXT NOT NULL UNIQUE,
    max_bytes INTEGER NOT NULL,
    allowed_extensions TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# reader / audio / paywall
ensure_column("books", "sample_chapter", "sample_chapter TEXT")
ensure_column("books", "audio_sample_url", "audio_sample_url TEXT")
ensure_column("books", "cover_url", "cover_url TEXT")

cur.execute("""
CREATE TABLE IF NOT EXISTS book_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    asset_type TEXT NOT NULL,
    asset_url TEXT,
    asset_label TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(book_id) REFERENCES books(id)
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS book_entitlements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_type TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    access_type TEXT NOT NULL DEFAULT 'full',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_type, user_id, book_id),
    FOREIGN KEY(book_id) REFERENCES books(id)
)
""")

# media stack foundation
cur.execute("""
CREATE TABLE IF NOT EXISTS live_stream_channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_name TEXT NOT NULL,
    host_name TEXT NOT NULL,
    channel_type TEXT NOT NULL DEFAULT 'audio_room',
    stream_status TEXT NOT NULL DEFAULT 'offline',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS live_room_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    event_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(room_id) REFERENCES podcast_rooms(id)
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS media_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_name TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    asset_url TEXT,
    linked_entity_type TEXT,
    linked_entity_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# 3D frontends / scenes
cur.execute("""
CREATE TABLE IF NOT EXISTS scene_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_name TEXT NOT NULL,
    scene_type TEXT NOT NULL,
    scene_url TEXT,
    linked_world_id INTEGER,
    scene_status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(linked_world_id) REFERENCES immersive_worlds(id)
)
""")

# seed admin account safely
cur.execute("SELECT 1 FROM user_accounts WHERE username = 'admin'")
if not cur.fetchone():
    cur.execute("""
        INSERT INTO user_accounts (username, password_hash, role, display_name, account_status)
        VALUES ('admin', 'CHANGE_ME_HASH', 'root', 'System Admin', 'active')
    """)

# seed upload policies
policies = [
    ("credit_documents", 10 * 1024 * 1024, ".pdf,.png,.jpg,.jpeg,.txt"),
    ("book_uploads", 25 * 1024 * 1024, ".pdf,.epub,.txt,.html"),
    ("audio_uploads", 50 * 1024 * 1024, ".mp3,.m4a,.wav,.ogg"),
]
for name, max_bytes, exts in policies:
    cur.execute("SELECT 1 FROM upload_policies WHERE policy_name = ?", (name,))
    if not cur.fetchone():
        cur.execute("INSERT INTO upload_policies (policy_name, max_bytes, allowed_extensions) VALUES (?, ?, ?)", (name, max_bytes, exts))

# seed stream channels
channels = [
    ("AAM Main Audio Channel", "James Stubbs", "audio_room", "offline"),
    ("Credit Strategy Live", "AAM Credit Team", "audio_room", "offline"),
    ("Holographic Creator Live", "HSE Studio", "hybrid_room", "offline"),
]
for n,h,t,s in channels:
    cur.execute("SELECT 1 FROM live_stream_channels WHERE channel_name = ?", (n,))
    if not cur.fetchone():
        cur.execute("INSERT INTO live_stream_channels (channel_name, host_name, channel_type, stream_status) VALUES (?, ?, ?, ?)", (n,h,t,s))

# seed scenes
scenes = [
    ("AAM Commerce Plaza", "metaverse_scene", "/public/scenes/commerce_plaza.json", 1, "draft"),
    ("Middleverse Ops Map", "middleverse_scene", "/public/scenes/ops_map.json", 2, "draft"),
    ("Multiverse Creator Hall", "multiverse_scene", "/public/scenes/creator_hall.json", 3, "draft"),
]
for n,t,u,w,s in scenes:
    cur.execute("SELECT 1 FROM scene_registry WHERE scene_name = ?", (n,))
    if not cur.fetchone():
        cur.execute("INSERT INTO scene_registry (scene_name, scene_type, scene_url, linked_world_id, scene_status) VALUES (?, ?, ?, ?, ?)", (n,t,u,w,s))

# seed simple book assets and entitlements
book_rows = cur.execute("SELECT id, title FROM books ORDER BY id").fetchall()
for book_id, title in book_rows:
    cur.execute("SELECT 1 FROM book_assets WHERE book_id = ? AND asset_type = 'sample_audio'", (book_id,))
    if not cur.fetchone():
        cur.execute("INSERT INTO book_assets (book_id, asset_type, asset_url, asset_label) VALUES (?, 'sample_audio', '/public/audio/sample.mp3', ?)", (book_id, f"{title} Sample Audio"))
    cur.execute("SELECT 1 FROM book_entitlements WHERE user_type='admin' AND user_id=1 AND book_id=?", (book_id,))
    if not cur.fetchone():
        cur.execute("INSERT INTO book_entitlements (user_type, user_id, book_id, access_type) VALUES ('admin', 1, ?, 'full')", (book_id,))

conn.commit()
conn.close()
print("[OK] DB/media/3D hardening complete")
PYEOF

########################################
# 3) CREATE SAMPLE SCENE FILES
########################################
cat > public/scenes/commerce_plaza.json << 'SCENE'
{
  "scene": "AAM Commerce Plaza",
  "objects": [
    {"type": "billboard", "label": "Holographic Ad Wall"},
    {"type": "storefront", "label": "Book Store"},
    {"type": "portal", "label": "Podcast Rooms"}
  ]
}
SCENE

cat > public/scenes/ops_map.json << 'SCENE'
{
  "scene": "Middleverse Ops Map",
  "objects": [
    {"type": "hub", "label": "Chicago Main Hub"},
    {"type": "route", "label": "Active Logistics Routes"},
    {"type": "panel", "label": "IoT Telemetry"}
  ]
}
SCENE

cat > public/scenes/creator_hall.json << 'SCENE'
{
  "scene": "Multiverse Creator Hall",
  "objects": [
    {"type": "stage", "label": "Creator Showcase"},
    {"type": "audio_room", "label": "Live Podcast Hall"},
    {"type": "screen", "label": "Streaming Network"}
  ]
}
SCENE

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

# nav
if '<a href="/accounts">Accounts</a>' not in text and '<a href="/robotics">Robotics</a>' in text:
    text = text.replace(
        '<a href="/robotics">Robotics</a>',
        '<a href="/robotics">Robotics</a>\n      <a href="/accounts">Accounts</a>\n      <a href="/upload-policies">Upload Policies</a>\n      <a href="/streams">Streams</a>\n      <a href="/scenes">Scenes</a>'
    )

pages = r'''
function renderAccountsPage(user = null) {
  const rows = dbQuery("SELECT id, username, role, display_name, account_status, created_at FROM user_accounts ORDER BY id DESC");
  const tableRows = rows.map(a => `<tr><td>${a.id}</td><td>${a.username}</td><td>${a.role}</td><td>${a.display_name || ''}</td><td>${a.account_status}</td><td>${a.created_at || ''}</td></tr>`).join('');
  return htmlPage('User Accounts', `
    <div class="section"><div class="card"><h2>User Accounts</h2><p>Persistent account registry and session foundation for branch, content, commerce, and admin access.</p></div></div>
    <div class="section"><div class="card">
      <table>
        <thead><tr><th>ID</th><th>Username</th><th>Role</th><th>Name</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${tableRows || '<tr><td colspan="6">No accounts yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}

function renderUploadPoliciesPage(user = null) {
  const rows = dbQuery("SELECT id, policy_name, max_bytes, allowed_extensions, created_at FROM upload_policies ORDER BY id DESC");
  const tableRows = rows.map(r => `<tr><td>${r.id}</td><td>${r.policy_name}</td><td>${r.max_bytes}</td><td>${r.allowed_extensions}</td><td>${r.created_at || ''}</td></tr>`).join('');
  return htmlPage('Upload Policies', `
    <div class="section"><div class="card"><h2>Upload Policies</h2><p>File size limits and allowed file types for documents, books, audio, and future media uploads.</p></div></div>
    <div class="section"><div class="card">
      <table>
        <thead><tr><th>ID</th><th>Policy</th><th>Max Bytes</th><th>Allowed Extensions</th><th>Created</th></tr></thead>
        <tbody>${tableRows || '<tr><td colspan="5">No policies yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}

function renderStreamsPage(user = null) {
  const channels = dbQuery("SELECT id, channel_name, host_name, channel_type, stream_status, created_at FROM live_stream_channels ORDER BY id DESC");
  const events = dbQuery("SELECT id, room_id, event_type, event_notes, created_at FROM live_room_events ORDER BY id DESC LIMIT 50");

  const channelRows = channels.map(c => `<tr><td>${c.id}</td><td>${c.channel_name}</td><td>${c.host_name}</td><td>${c.channel_type}</td><td>${c.stream_status}</td><td>${c.created_at || ''}</td></tr>`).join('');
  const eventRows = events.map(e => `<tr><td>${e.id}</td><td>${e.room_id}</td><td>${e.event_type}</td><td>${e.event_notes || ''}</td><td>${e.created_at || ''}</td></tr>`).join('');

  return htmlPage('Live Streams / Rooms', `
    <div class="section"><div class="card"><h2>Real-Time Media Stack Foundation</h2><p>Channel registry and event timeline for podcast rooms, hybrid rooms, holographic streaming, and future live media control.</p></div></div>
    <div class="section"><div class="grid">
      <div class="card">
        <h3>Channels</h3>
        <table>
          <thead><tr><th>ID</th><th>Channel</th><th>Host</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${channelRows || '<tr><td colspan="6">No channels yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div></div>
    <div class="section"><div class="grid">
      <div class="card">
        <h3>Room Events</h3>
        <table>
          <thead><tr><th>ID</th><th>Room ID</th><th>Event</th><th>Notes</th><th>Created</th></tr></thead>
          <tbody>${eventRows || '<tr><td colspan="5">No room events yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div></div>
  `, user);
}

function renderScenesPage(user = null) {
  const rows = dbQuery("SELECT id, scene_name, scene_type, scene_url, linked_world_id, scene_status, created_at FROM scene_registry ORDER BY id DESC");
  const cards = rows.map(s => `
    <div class="card">
      <h3>${s.scene_name}</h3>
      <p><strong>Type:</strong> ${s.scene_type}</p>
      <p><strong>World:</strong> ${s.linked_world_id || ''}</p>
      <p><strong>Status:</strong> ${s.scene_status}</p>
      <p><strong>Scene File:</strong> <code>${s.scene_url || ''}</code></p>
      <p class="muted">${s.created_at || ''}</p>
    </div>
  `).join('');

  return htmlPage('3D Scenes', `
    <div class="section"><div class="card"><h2>3D Frontend Scene Registry</h2><p>Scene registry for metaverse, middleverse, multiverse, logistics overlays, robotics dashboards, and creator halls.</p></div></div>
    <div class="section"><div class="grid">${cards || '<div class="card"><p>No scenes yet.</p></div>'}</div></div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", pages)

# routes
anchor = "    if (req.method === 'GET' && pathname === '/document-intelligence') {"
if "pathname === '/accounts'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/accounts') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderAccountsPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/upload-policies') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderUploadPoliciesPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/streams') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderStreamsPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/scenes') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderScenesPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/document-intelligence') {"""
    text = text.replace(anchor, routes)

p.write_text(text)
print("[OK] phase 2 UI patch applied")
PYEOF

########################################
# 5) RESTART / VERIFY
########################################
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh

########################################
# 6) CHECKPOINT
########################################
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots

cp apps/dashboard.js "backups/dashboard_phase2_${STAMP}.js"
cp db/aam.db "backups/aam_phase2_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as user_accounts from user_accounts;" > "snapshots/user_accounts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as upload_policies from upload_policies;" > "snapshots/upload_policies_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as live_stream_channels from live_stream_channels;" > "snapshots/live_stream_channels_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scene_registry from scene_registry;" > "snapshots/scene_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as persistent_sessions from persistent_sessions;" > "snapshots/persistent_sessions_${STAMP}.json"

echo "PHASE 2 HARDENING + MEDIA + 3D CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/accounts"
echo "  termux-open-url http://127.0.0.1:4900/upload-policies"
echo "  termux-open-url http://127.0.0.1:4900/document-intelligence"
echo "  termux-open-url http://127.0.0.1:4900/wallet-transactions"
echo "  termux-open-url http://127.0.0.1:4900/books"
echo "  termux-open-url http://127.0.0.1:4900/streams"
echo "  termux-open-url http://127.0.0.1:4900/scenes"
echo "  termux-open-url http://127.0.0.1:4900/metaverse"
echo "  termux-open-url http://127.0.0.1:4900/robotics"
echo "  curl -i http://127.0.0.1:4900/sitemap.xml"
