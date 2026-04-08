#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== FRONTEND + AUTH + CONSOLIDATION + STABILIZE START ==="

########################################
# 1) DB CATCH-UP
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

def table_exists(name):
    r = cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (name,)).fetchone()
    return bool(r)

def cols(table):
    return [r[1] for r in cur.execute(f"PRAGMA table_info({table})").fetchall()]

def ensure_col(table, col, ddl):
    if table_exists(table) and col not in cols(table):
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {ddl}")
        print(f"[OK] Added {table}.{col}")

cur.execute("""
CREATE TABLE IF NOT EXISTS user_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    display_name TEXT NOT NULL,
    email TEXT,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'member',
    account_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS persistent_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_account_id INTEGER NOT NULL,
    session_token TEXT NOT NULL,
    session_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS upload_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    policy_name TEXT NOT NULL,
    allowed_extensions TEXT,
    max_size_mb INTEGER NOT NULL DEFAULT 10,
    policy_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS frontend_modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_name TEXT NOT NULL,
    module_group TEXT NOT NULL,
    route_path TEXT NOT NULL,
    module_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

ensure_col("books", "sample_chapter", "sample_chapter TEXT")
ensure_col("books", "audio_sample_url", "audio_sample_url TEXT")
ensure_col("books", "cover_url", "cover_url TEXT")

cur.execute("SELECT count(*) FROM user_accounts")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO user_accounts (display_name, email, password_hash, role, account_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Admin One", "admin@aam.local", "devhash_admin", "admin", "active"),
        ("Creator One", "creator@aam.local", "devhash_creator", "creator", "active"),
        ("Member One", "member@aam.local", "devhash_member", "member", "active"),
    ])

cur.execute("SELECT count(*) FROM upload_policies")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO upload_policies (policy_name, allowed_extensions, max_size_mb, policy_status)
        VALUES (?, ?, ?, ?)
    """, [
        ("Documents Basic", "pdf,doc,docx,txt,png,jpg,jpeg", 25, "active"),
        ("Media Basic", "mp3,wav,mp4,webm,png,jpg,jpeg", 100, "active"),
        ("Scene Assets", "json,gltf,glb,png,jpg,jpeg,mp3,wav", 150, "active"),
    ])

cur.execute("SELECT count(*) FROM frontend_modules")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO frontend_modules (module_name, module_group, route_path, module_status)
        VALUES (?, ?, ?, ?)
    """, [
        ("Public Home", "public", "/", "active"),
        ("World Explorer", "public", "/world-explorer", "active"),
        ("Storefront Explorer", "commerce", "/storefront-explorer", "active"),
        ("Wallet Center", "finance", "/wallet-center", "active"),
        ("Access Center", "identity", "/access-center", "active"),
        ("Creator Hub", "creator", "/creator-hub", "active"),
    ])

conn.commit()
conn.close()
print("[OK] DB catch-up complete")
PYEOF

########################################
# 2) PATCH DASHBOARD.JS
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

def insert_before(marker, block):
    global text
    if block.strip() not in text and marker in text:
        text = text.replace(marker, block + "\n" + marker, 1)

helpers = r'''
function safeRowsHtml(rows, fallback, renderer) {
  if (!rows || !rows.length) return fallback;
  return rows.map(renderer).join('');
}

function publicNav() {
  return `
    <div class="section">
      <div class="card">
        <a href="/">Home</a>
        <a href="/world-explorer">World Explorer</a>
        <a href="/storefront-explorer">Storefront Explorer</a>
        <a href="/wallet-center">Wallet Center</a>
        <a href="/access-center">Access Center</a>
        <a href="/creator-hub">Creator Hub</a>
        <a href="/blog">Blog</a>
        <a href="/books">Books</a>
      </div>
    </div>
  `;
}

function renderPublicHomePage(user = null) {
  const worlds = dbQuery(`SELECT id, scene_name, scene_type, scene_status, created_at FROM scene_registry ORDER BY id DESC LIMIT 12`);
  const storefronts = dbQuery(`SELECT id, storefront_name, storefront_type, storefront_status, created_at FROM world_storefronts ORDER BY id DESC LIMIT 12`);
  const books = dbQuery(`SELECT id, title, price_cents, cover_url, created_at FROM books ORDER BY id DESC LIMIT 12`);
  const blogs = dbQuery(`SELECT id, title, slug, created_at FROM blog_posts ORDER BY id DESC LIMIT 12`);

  return htmlPage('All American Marketplace Holographic Ecosystem', `
    ${publicNav()}
    <div class="section"><div class="card">
      <h1>All American Marketplace Holographic Ecosystem</h1>
      <p>Live worlds, storefronts, books, wallet rails, access layers, creator systems, and immersive commerce controls.</p>
    </div></div>

    <div class="section"><div class="card">
      <h2>Featured Worlds</h2>
      <div class="grid">
        ${safeRowsHtml(worlds, '<div class="muted">No worlds yet.</div>', w => `
          <div class="card">
            <h3>${w.scene_name || 'World'}</h3>
            <p><strong>Type:</strong> ${w.scene_type || ''}</p>
            <p><strong>Status:</strong> ${w.scene_status || ''}</p>
            <a href="/motion-worlds/${w.id}">Open World</a>
          </div>
        `)}
      </div>
    </div></div>

    <div class="section"><div class="card">
      <h2>Featured Storefronts</h2>
      <div class="grid">
        ${safeRowsHtml(storefronts, '<div class="muted">No storefronts yet.</div>', s => `
          <div class="card">
            <h3>${s.storefront_name || 'Storefront'}</h3>
            <p><strong>Type:</strong> ${s.storefront_type || ''}</p>
            <p><strong>Status:</strong> ${s.storefront_status || ''}</p>
            <a href="/world-storefronts">Browse Storefronts</a>
          </div>
        `)}
      </div>
    </div></div>

    <div class="section"><div class="card">
      <h2>Books + Knowledge</h2>
      <div class="grid">
        ${safeRowsHtml(books, '<div class="muted">No books yet.</div>', b => `
          <div class="card">
            <h3>${b.title || 'Book'}</h3>
            <p><strong>Price:</strong> ${Number(b.price_cents || 0) / 100}</p>
            <a href="/books/read/${b.id}">Read</a>
          </div>
        `)}
      </div>
    </div></div>

    <div class="section"><div class="card">
      <h2>Latest Articles</h2>
      <ul>
        ${safeRowsHtml(blogs, '<li>No blog posts yet.</li>', b => `<li><a href="/blog/${b.slug}">${b.title || 'Article'}</a></li>`)}
      </ul>
    </div></div>
  `, user);
}

function renderWorldExplorerPage(user = null) {
  const worlds = dbQuery(`
    SELECT sr.id, sr.scene_name, sr.scene_type, sr.scene_status, sr.created_at,
           (SELECT count(*) FROM avatar_positions ap WHERE ap.scene_id = sr.id) as avatar_count,
           (SELECT count(*) FROM shared_world_objects so WHERE so.scene_id = sr.id) as object_count
    FROM scene_registry sr
    ORDER BY sr.id DESC
  `);

  return htmlPage('World Explorer', `
    ${publicNav()}
    <div class="section"><div class="card">
      <h2>World Explorer</h2>
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Status</th><th>Avatars</th><th>Objects</th><th>Open</th></tr></thead>
        <tbody>
          ${safeRowsHtml(worlds, '<tr><td colspan="7">No worlds yet.</td></tr>', w => `
            <tr>
              <td>${w.id}</td>
              <td>${w.scene_name || ''}</td>
              <td>${w.scene_type || ''}</td>
              <td>${w.scene_status || ''}</td>
              <td>${w.avatar_count || 0}</td>
              <td>${w.object_count || 0}</td>
              <td><a href="/motion-worlds/${w.id}">Open</a></td>
            </tr>
          `)}
        </tbody>
      </table>
    </div></div>
  `, user);
}

function renderStorefrontExplorerPage(user = null) {
  const rows = dbQuery(`
    SELECT ws.id, ws.storefront_name, ws.storefront_type, ws.storefront_status,
           (SELECT count(*) FROM storefront_products sp WHERE sp.storefront_id = ws.id) as product_count
    FROM world_storefronts ws
    ORDER BY ws.id DESC
  `);

  return htmlPage('Storefront Explorer', `
    ${publicNav()}
    <div class="section"><div class="card">
      <h2>Storefront Explorer</h2>
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Status</th><th>Products</th></tr></thead>
        <tbody>
          ${safeRowsHtml(rows, '<tr><td colspan="5">No storefronts yet.</td></tr>', r => `
            <tr>
              <td>${r.id}</td>
              <td>${r.storefront_name || ''}</td>
              <td>${r.storefront_type || ''}</td>
              <td>${r.storefront_status || ''}</td>
              <td>${r.product_count || 0}</td>
            </tr>
          `)}
        </tbody>
      </table>
    </div></div>
  `, user);
}

function renderWalletCenterPage(user = null) {
  const wallets = dbQuery(`SELECT id, wallet_name, wallet_status, created_at FROM wallets ORDER BY id DESC`);
  const tx = dbQuery(`SELECT id, wallet_id, tx_type, amount_cents, reference_type, reference_id, note, created_at FROM wallet_transactions ORDER BY id DESC LIMIT 100`);

  return htmlPage('Wallet Center', `
    ${publicNav()}
    <div class="section"><div class="card">
      <h2>Wallet Center</h2>
      <h3>Wallets</h3>
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>
          ${safeRowsHtml(wallets, '<tr><td colspan="4">No wallets yet.</td></tr>', w => `
            <tr><td>${w.id}</td><td>${w.wallet_name || ''}</td><td>${w.wallet_status || ''}</td><td>${w.created_at || ''}</td></tr>
          `)}
        </tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Recent Transactions</h3>
      <table>
        <thead><tr><th>ID</th><th>Wallet</th><th>Type</th><th>Amount</th><th>Reference</th><th>Note</th><th>Created</th></tr></thead>
        <tbody>
          ${safeRowsHtml(tx, '<tr><td colspan="7">No transactions yet.</td></tr>', r => `
            <tr>
              <td>${r.id}</td>
              <td>${r.wallet_id || ''}</td>
              <td>${r.tx_type || ''}</td>
              <td>${r.amount_cents || 0}</td>
              <td>${r.reference_type || ''} #${r.reference_id || ''}</td>
              <td>${r.note || ''}</td>
              <td>${r.created_at || ''}</td>
            </tr>
          `)}
        </tbody>
      </table>
    </div></div>
  `, user);
}

function renderAccessCenterPage(user = null) {
  const entitlements = dbQuery(`SELECT id, entitlement_name, entitlement_type, entitlement_status, created_at FROM world_entitlements ORDER BY id DESC LIMIT 100`);
  const passes = dbQuery(`SELECT id, scene_id, owner_type, owner_id, entitlement_id, pass_status, created_at FROM world_access_passes ORDER BY id DESC LIMIT 100`);

  return htmlPage('Access Center', `
    ${publicNav()}
    <div class="section"><div class="card">
      <h2>Access Center</h2>
      <h3>Entitlements</h3>
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>
          ${safeRowsHtml(entitlements, '<tr><td colspan="5">No entitlements yet.</td></tr>', e => `
            <tr><td>${e.id}</td><td>${e.entitlement_name || ''}</td><td>${e.entitlement_type || ''}</td><td>${e.entitlement_status || ''}</td><td>${e.created_at || ''}</td></tr>
          `)}
        </tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Access Passes</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Owner</th><th>Entitlement</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>
          ${safeRowsHtml(passes, '<tr><td colspan="6">No access passes yet.</td></tr>', p => `
            <tr><td>${p.id}</td><td>${p.scene_id || ''}</td><td>${p.owner_type || ''} #${p.owner_id || ''}</td><td>${p.entitlement_id || ''}</td><td>${p.pass_status || ''}</td><td>${p.created_at || ''}</td></tr>
          `)}
        </tbody>
      </table>
    </div></div>
  `, user);
}

function renderCreatorHubPage(user = null) {
  const podcasts = dbQuery(`SELECT id, title, host_name, status, created_at FROM podcasts ORDER BY id DESC LIMIT 100`);
  const rooms = dbQuery(`SELECT id, room_name, room_status, created_at FROM podcast_rooms ORDER BY id DESC LIMIT 100`);
  const beatProfiles = dbQuery(`SELECT id, beat_name, beat_mode, bpm, beat_status, created_at FROM quantum_beat_profiles ORDER BY id DESC LIMIT 100`);

  return htmlPage('Creator Hub', `
    ${publicNav()}
    <div class="section"><div class="card">
      <h2>Creator Hub</h2>
      <p>Creator systems, stage foundations, rooms, and Quantum Beat TM profiles.</p>
    </div></div>

    <div class="section"><div class="card">
      <h3>Podcasts</h3>
      <table>
        <thead><tr><th>ID</th><th>Title</th><th>Host</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>
          ${safeRowsHtml(podcasts, '<tr><td colspan="5">No podcasts yet.</td></tr>', p => `
            <tr><td>${p.id}</td><td>${p.title || ''}</td><td>${p.host_name || ''}</td><td>${p.status || ''}</td><td>${p.created_at || ''}</td></tr>
          `)}
        </tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Rooms</h3>
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>
          ${safeRowsHtml(rooms, '<tr><td colspan="4">No rooms yet.</td></tr>', r => `
            <tr><td>${r.id}</td><td>${r.room_name || ''}</td><td>${r.room_status || ''}</td><td>${r.created_at || ''}</td></tr>
          `)}
        </tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Quantum Beat TM</h3>
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Mode</th><th>BPM</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>
          ${safeRowsHtml(beatProfiles, '<tr><td colspan="6">No beat profiles yet.</td></tr>', b => `
            <tr><td>${b.id}</td><td>${b.beat_name || ''}</td><td>${b.beat_mode || ''}</td><td>${b.bpm || ''}</td><td>${b.beat_status || ''}</td><td>${b.created_at || ''}</td></tr>
          `)}
        </tbody>
      </table>
    </div></div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", helpers)

if "function hardenPublicSession(req)" not in text:
    harden = r'''
function hardenPublicSession(req) {
  return {
    is_public: true,
    session_mode: 'public_view',
    safe_time: new Date().toISOString()
  };
}
'''
    insert_before("const server = http.createServer(async (req, res) => {", harden)

anchor = "    if (req.method === 'GET' && pathname === '/health') {"
if "pathname === '/world-explorer'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPublicHomePage(session));
    }

    if (req.method === 'GET' && pathname === '/world-explorer') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWorldExplorerPage(session));
    }

    if (req.method === 'GET' && pathname === '/storefront-explorer') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderStorefrontExplorerPage(session));
    }

    if (req.method === 'GET' && pathname === '/wallet-center') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWalletCenterPage(session));
    }

    if (req.method === 'GET' && pathname === '/access-center') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderAccessCenterPage(session));
    }

    if (req.method === 'GET' && pathname === '/creator-hub') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderCreatorHubPage(session));
    }

    if (req.method === 'GET' && pathname === '/health') {"""
    text = text.replace(anchor, routes, 1)

p.write_text(text)
print("[OK] dashboard frontend + consolidation patch applied")
PYEOF

########################################
# 3) RESTART / VERIFY
########################################
bash scripts/restart_world_socket.sh || true
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh

echo "--- SOCKET HEALTH ---"
curl -s http://127.0.0.1:5090/health || true

########################################
# 4) CHECKPOINT
########################################
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports

cp apps/dashboard.js "backups/dashboard_frontend_auth_stable_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_frontend_auth_stable_${STAMP}.js"
cp db/aam.db "backups/aam_frontend_auth_stable_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as user_accounts from user_accounts;" > "snapshots/user_accounts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as persistent_sessions from persistent_sessions;" > "snapshots/persistent_sessions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as upload_policies from upload_policies;" > "snapshots/upload_policies_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as frontend_modules from frontend_modules;" > "snapshots/frontend_modules_${STAMP}.json"

cat > "reports/frontend_auth_stabilize_${STAMP}.txt" <<REPORT
FRONTEND + AUTH + CONSOLIDATION STABILIZE REPORT
Timestamp: ${STAMP}

Added / verified:
- user_accounts
- persistent_sessions
- upload_policies
- frontend_modules

Added public/user-facing pages:
- /
- /world-explorer
- /storefront-explorer
- /wallet-center
- /access-center
- /creator-hub

Goal:
- catch up missing public UX
- reduce admin-only bias
- create safer base for real user flows
- stabilize restart + backups
REPORT

echo "FRONTEND + AUTH + CONSOLIDATION STABILIZE COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/"
echo "  termux-open-url http://127.0.0.1:4900/world-explorer"
echo "  termux-open-url http://127.0.0.1:4900/storefront-explorer"
echo "  termux-open-url http://127.0.0.1:4900/wallet-center"
echo "  termux-open-url http://127.0.0.1:4900/access-center"
echo "  termux-open-url http://127.0.0.1:4900/creator-hub"
