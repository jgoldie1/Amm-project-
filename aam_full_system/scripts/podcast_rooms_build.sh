#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== PODCAST + ROOMS BUILD START ==="

########################################
# 1) DB TABLES
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS podcasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    host_name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS podcast_episodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    podcast_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    audio_url TEXT,
    is_premium INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(podcast_id) REFERENCES podcasts(id)
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS podcast_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_name TEXT NOT NULL,
    host_name TEXT NOT NULL,
    topic TEXT,
    room_status TEXT NOT NULL DEFAULT 'scheduled',
    is_private INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS podcast_room_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    member_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'listener',
    joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(room_id) REFERENCES podcast_rooms(id)
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS holographic_ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad_title TEXT NOT NULL,
    ad_body TEXT,
    placement TEXT NOT NULL,
    target_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed sample data safely
seed_podcasts = [
    ("All American Marketplace Live", "James Stubbs", "Marketplace, branch growth, fintech, and ecosystem updates.", "Business"),
    ("Credit Recovery Room", "AAM Credit Team", "Credit repair, financial recovery, and case education.", "Finance"),
    ("Holo Creator Network", "HSE Studio", "Streaming, holographic content, creators, and audience growth.", "Media"),
]

for title, host, desc, cat in seed_podcasts:
    cur.execute("SELECT 1 FROM podcasts WHERE title = ?", (title,))
    if not cur.fetchone():
        cur.execute(
            "INSERT INTO podcasts (title, host_name, description, category) VALUES (?, ?, ?, ?)",
            (title, host, desc, cat)
        )

seed_rooms = [
    ("AAM Founder Room", "James Stubbs", "Platform strategy and branch growth", "live", 0),
    ("Credit Dispute Group Room", "AAM Credit Team", "Dispute education and next steps", "scheduled", 0),
    ("Holographic Creator Roundtable", "HSE Studio", "Streaming, ads, clips, and monetization", "scheduled", 0),
]

for room_name, host_name, topic, status, is_private in seed_rooms:
    cur.execute("SELECT 1 FROM podcast_rooms WHERE room_name = ?", (room_name,))
    if not cur.fetchone():
        cur.execute(
            "INSERT INTO podcast_rooms (room_name, host_name, topic, room_status, is_private) VALUES (?, ?, ?, ?, ?)",
            (room_name, host_name, topic, status, is_private)
        )

seed_ads = [
    ("Start Your Branch", "Launch your family branch and business dashboard.", "podcast", "/branches"),
    ("Fix Your Credit Workflow", "Open your credit recovery workspace and upload documents.", "credit", "/credit-repair"),
    ("Search the Ecosystem", "Use HoloGPT Search to find businesses, branches, and content.", "search", "/search-engine"),
]

for title, body, placement, url in seed_ads:
    cur.execute("SELECT 1 FROM holographic_ads WHERE ad_title = ?", (title,))
    if not cur.fetchone():
        cur.execute(
            "INSERT INTO holographic_ads (ad_title, ad_body, placement, target_url) VALUES (?, ?, ?, ?)",
            (title, body, placement, url)
        )

conn.commit()
conn.close()
print("[OK] podcast + room tables ready")
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

# nav
if '<a href="/podcasts">Podcasts</a>' not in text and '<a href="/blog">Blog</a>' in text:
    text = text.replace(
        '<a href="/blog">Blog</a>',
        '<a href="/blog">Blog</a>\n      <a href="/podcasts">Podcasts</a>\n      <a href="/rooms">Group Rooms</a>'
    )

helpers = r'''
function renderPodcastsPage(user = null) {
  const podcasts = dbQuery("SELECT id, title, host_name, description, category, created_at FROM podcasts ORDER BY id DESC");
  const ads = dbQuery("SELECT id, ad_title, ad_body, target_url FROM holographic_ads WHERE placement='podcast' ORDER BY id DESC LIMIT 3");

  const cards = podcasts.map(p => `
    <div class="card">
      <h3>${p.title}</h3>
      <p><strong>Host:</strong> ${p.host_name}</p>
      <p><strong>Category:</strong> ${p.category || ''}</p>
      <p>${p.description || ''}</p>
      <p class="muted">${p.created_at || ''}</p>
    </div>
  `).join('');

  const adCards = ads.map(a => `
    <div class="card">
      <h3>${a.ad_title}</h3>
      <p>${a.ad_body || ''}</p>
      <a href="${a.target_url || '#'}">Open</a>
    </div>
  `).join('');

  return htmlPage('Podcasts', `
    <div class="section">
      <div class="card">
        <h2>Podcast Network</h2>
        <p>Podcasts connected to branches, business growth, credit recovery, streaming, and the holographic ad system.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards || '<div class="card"><p>No podcasts yet.</p></div>'}</div>
    </div>
    <div class="section">
      <div class="grid">${adCards || ''}</div>
    </div>
  `, user);
}

function renderRoomsPage(user = null) {
  const rooms = dbQuery("SELECT id, room_name, host_name, topic, room_status, is_private, created_at FROM podcast_rooms ORDER BY id DESC");
  const ads = dbQuery("SELECT id, ad_title, ad_body, target_url FROM holographic_ads WHERE placement IN ('podcast','search','credit') ORDER BY id DESC LIMIT 4");

  const cards = rooms.map(r => `
    <div class="card">
      <h3>${r.room_name}</h3>
      <p><strong>Host:</strong> ${r.host_name}</p>
      <p><strong>Topic:</strong> ${r.topic || ''}</p>
      <p><strong>Status:</strong> ${r.room_status}</p>
      <p><strong>Private:</strong> ${Number(r.is_private) ? 'Yes' : 'No'}</p>
      <p class="muted">${r.created_at || ''}</p>
    </div>
  `).join('');

  const adCards = ads.map(a => `
    <div class="card">
      <h3>${a.ad_title}</h3>
      <p>${a.ad_body || ''}</p>
      <a href="${a.target_url || '#'}">Open</a>
    </div>
  `).join('');

  return htmlPage('Group Rooms', `
    <div class="section">
      <div class="card">
        <h2>Podcast + Group Rooms</h2>
        <p>Live and scheduled audio rooms for creators, branches, business meetings, education, and community traffic.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards || '<div class="card"><p>No rooms yet.</p></div>'}</div>
    </div>
    <div class="section">
      <div class="grid">${adCards || ''}</div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", helpers)

anchor = "    if (req.method === 'GET' && pathname === '/search-engine') {"
if "pathname === '/podcasts'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/podcasts') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPodcastsPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/rooms') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderRoomsPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/search-engine') {"""
    text = text.replace(anchor, routes)

p.write_text(text)
print("[OK] podcast + rooms patch applied")
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

cp apps/dashboard.js "backups/dashboard_podcast_rooms_stable_${STAMP}.js"
cp db/aam.db "backups/aam_podcast_rooms_stable_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as podcasts from podcasts;" > "snapshots/podcasts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as podcast_rooms from podcast_rooms;" > "snapshots/podcast_rooms_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as holographic_ads from holographic_ads;" > "snapshots/holographic_ads_${STAMP}.json"

echo "PODCAST + ROOMS STABLE CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/podcasts"
echo "  termux-open-url http://127.0.0.1:4900/rooms"
