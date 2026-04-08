#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== HEIRS WALLET + EARNINGS + CREATOR STABILIZE START ==="

########################################
# 1) DATABASE
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

def safe(sql):
    cur.execute(sql)

safe("""
CREATE TABLE IF NOT EXISTS heir_wallets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER NOT NULL,
  wallet_name TEXT NOT NULL,
  wallet_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

safe("""
CREATE TABLE IF NOT EXISTS heir_earnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER NOT NULL,
  earning_type TEXT NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  source_type TEXT,
  source_id INTEGER,
  earning_status TEXT NOT NULL DEFAULT 'posted',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

safe("""
CREATE TABLE IF NOT EXISTS heir_creator_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER NOT NULL,
  creator_name TEXT NOT NULL,
  creator_type TEXT NOT NULL,
  creator_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

safe("""
CREATE TABLE IF NOT EXISTS heir_storefront_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER NOT NULL,
  storefront_name TEXT NOT NULL,
  storefront_type TEXT NOT NULL,
  link_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

safe("""
CREATE TABLE IF NOT EXISTS heir_permissions_matrix (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER NOT NULL,
  permission_name TEXT NOT NULL,
  permission_scope TEXT NOT NULL,
  permission_status TEXT NOT NULL DEFAULT 'granted',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed wallets
rows = cur.execute("SELECT id, name FROM heirs_registry ORDER BY id").fetchall()
for heir_id, name in rows:
    exists = cur.execute("SELECT 1 FROM heir_wallets WHERE heir_id=?", (heir_id,)).fetchone()
    if not exists:
        cur.execute("""
        INSERT INTO heir_wallets (heir_id, wallet_name, wallet_status)
        VALUES (?, ?, 'active')
        """, (heir_id, f"{name} Wallet"))

# seed creator profiles for key heirs
creator_map = [
    ("Isaiah", "Anyone Can Be a Star"),
    ("Aniyah", "Singing Coach + Recorder"),
    ("Jacobie", "Jacobie Vision"),
    ("Alton", "Security Systems"),
    ("Alton Kevon", "Advanced Systems"),
]
for heir_name, creator_type in creator_map:
    row = cur.execute("SELECT id FROM heirs_registry WHERE name=? LIMIT 1", (heir_name,)).fetchone()
    if row:
        heir_id = row[0]
        exists = cur.execute("SELECT 1 FROM heir_creator_profiles WHERE heir_id=?", (heir_id,)).fetchone()
        if not exists:
            cur.execute("""
            INSERT INTO heir_creator_profiles (heir_id, creator_name, creator_type, creator_status)
            VALUES (?, ?, ?, 'active')
            """, (heir_id, heir_name, creator_type))

# seed storefront links
store_map = [
    ("Isaiah", "Anyone Can Be a Star", "creator_storefront"),
    ("Aniyah", "Aniyah Singing Coach", "education_storefront"),
    ("Jacobie", "Jacobie Vision", "cybersecurity_storefront"),
    ("Alton", "Alton Security", "security_storefront"),
]
for heir_name, storefront_name, storefront_type in store_map:
    row = cur.execute("SELECT id FROM heirs_registry WHERE name=? LIMIT 1", (heir_name,)).fetchone()
    if row:
        heir_id = row[0]
        exists = cur.execute("SELECT 1 FROM heir_storefront_links WHERE heir_id=? AND storefront_name=?", (heir_id, storefront_name)).fetchone()
        if not exists:
            cur.execute("""
            INSERT INTO heir_storefront_links (heir_id, storefront_name, storefront_type, link_status)
            VALUES (?, ?, ?, 'active')
            """, (heir_id, storefront_name, storefront_type))

# seed permissions
perm_map = {
    "Jacobie": [
        ("cybersecurity_console", "security"),
        ("system_audit", "ops"),
        ("heirs_network", "family"),
    ],
    "Isaiah": [
        ("creator_stage", "creator"),
        ("music_brand", "creator"),
        ("heirs_network", "family"),
    ],
    "Aniyah": [
        ("creator_stage", "creator"),
        ("voice_coach_tools", "education"),
        ("heirs_network", "family"),
    ],
    "Alton": [
        ("security_console", "security"),
        ("heirs_network", "family"),
    ],
    "Alton Kevon": [
        ("advanced_ops", "systems"),
        ("heirs_network", "family"),
    ],
}
for heir_name, perms in perm_map.items():
    row = cur.execute("SELECT id FROM heirs_registry WHERE name=? LIMIT 1", (heir_name,)).fetchone()
    if row:
        heir_id = row[0]
        for pname, pscope in perms:
            exists = cur.execute("""
                SELECT 1 FROM heir_permissions_matrix
                WHERE heir_id=? AND permission_name=? AND permission_scope=?
            """, (heir_id, pname, pscope)).fetchone()
            if not exists:
                cur.execute("""
                INSERT INTO heir_permissions_matrix (heir_id, permission_name, permission_scope, permission_status)
                VALUES (?, ?, ?, 'granted')
                """, (heir_id, pname, pscope))

# seed sample earnings
earnings_seed = [
    ("Isaiah", "creator_revenue", 250000, "creator_storefront", 1),
    ("Aniyah", "coaching_revenue", 175000, "education_storefront", 1),
    ("Jacobie", "security_revenue", 300000, "cybersecurity_storefront", 1),
    ("Alton", "security_revenue", 225000, "security_storefront", 1),
]
for heir_name, etype, amount, stype, sid in earnings_seed:
    row = cur.execute("SELECT id FROM heirs_registry WHERE name=? LIMIT 1", (heir_name,)).fetchone()
    if row:
        heir_id = row[0]
        exists = cur.execute("""
            SELECT 1 FROM heir_earnings
            WHERE heir_id=? AND earning_type=? AND amount_cents=? AND source_type=?
        """, (heir_id, etype, amount, stype)).fetchone()
        if not exists:
            cur.execute("""
            INSERT INTO heir_earnings (heir_id, earning_type, amount_cents, source_type, source_id, earning_status)
            VALUES (?, ?, ?, ?, ?, 'posted')
            """, (heir_id, etype, amount, stype, sid))

conn.commit()
conn.close()
print("[OK] heirs wallet/earnings/creator DB ready")
PYEOF

########################################
# 2) UI
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r'''
function renderHeirsEcosystemPage(user = null) {
  const heirs = dbQuery(`
    SELECT hr.id, hr.name, hr.role, hr.division, hr.access_level,
           (SELECT count(*) FROM heir_wallets hw WHERE hw.heir_id=hr.id) as wallet_count,
           (SELECT count(*) FROM heir_creator_profiles hcp WHERE hcp.heir_id=hr.id) as creator_count,
           (SELECT count(*) FROM heir_storefront_links hsl WHERE hsl.heir_id=hr.id) as storefront_count,
           (SELECT IFNULL(sum(amount_cents),0) FROM heir_earnings he WHERE he.heir_id=hr.id) as total_earnings
    FROM heirs_registry hr
    ORDER BY hr.id DESC
  `);

  const cards = heirs.map(h => `
    <div class="feature-card">
      <h3>${h.name}</h3>
      <p><strong>Role:</strong> ${h.role || ''}</p>
      <p><strong>Division:</strong> ${h.division || ''}</p>
      <p><strong>Access:</strong> ${h.access_level || ''}</p>
      <p><strong>Wallets:</strong> ${h.wallet_count || 0}</p>
      <p><strong>Creator Profiles:</strong> ${h.creator_count || 0}</p>
      <p><strong>Storefront Links:</strong> ${h.storefront_count || 0}</p>
      <p><strong>Total Earnings:</strong> $${((Number(h.total_earnings || 0))/100).toFixed(2)}</p>
    </div>
  `).join('');

  return htmlPage('Heirs Ecosystem', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Family • Ownership • Roles • Earnings</div>
          <h1>Heirs Ecosystem</h1>
          <p>All heirs connected to wallets, creator systems, storefront pathways, and earnings structure.</p>
        </section>
        <div class="feature-grid">${cards || '<div class="muted">No heirs found.</div>'}</div>
      </main>
    </div>
  `, user);
}

function renderHeirOperationsPage(user = null) {
  const earnings = dbQuery(`
    SELECT he.id, hr.name, he.earning_type, he.amount_cents, he.source_type, he.earning_status, he.created_at
    FROM heir_earnings he
    LEFT JOIN heirs_registry hr ON hr.id = he.heir_id
    ORDER BY he.id DESC
    LIMIT 200
  `);

  const perms = dbQuery(`
    SELECT hpm.id, hr.name, hpm.permission_name, hpm.permission_scope, hpm.permission_status, hpm.created_at
    FROM heir_permissions_matrix hpm
    LEFT JOIN heirs_registry hr ON hr.id = hpm.heir_id
    ORDER BY hpm.id DESC
    LIMIT 200
  `);

  const creators = dbQuery(`
    SELECT hcp.id, hr.name, hcp.creator_type, hcp.creator_status, hcp.created_at
    FROM heir_creator_profiles hcp
    LEFT JOIN heirs_registry hr ON hr.id = hcp.heir_id
    ORDER BY hcp.id DESC
    LIMIT 200
  `);

  const storefronts = dbQuery(`
    SELECT hsl.id, hr.name, hsl.storefront_name, hsl.storefront_type, hsl.link_status, hsl.created_at
    FROM heir_storefront_links hsl
    LEFT JOIN heirs_registry hr ON hr.id = hsl.heir_id
    ORDER BY hsl.id DESC
    LIMIT 200
  `);

  const earningsRows = earnings.map(r => `
    <tr><td>${r.id}</td><td>${r.name || ''}</td><td>${r.earning_type || ''}</td><td>$${((Number(r.amount_cents || 0))/100).toFixed(2)}</td><td>${r.source_type || ''}</td><td>${r.earning_status || ''}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const permRows = perms.map(r => `
    <tr><td>${r.id}</td><td>${r.name || ''}</td><td>${r.permission_name || ''}</td><td>${r.permission_scope || ''}</td><td>${r.permission_status || ''}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const creatorRows = creators.map(r => `
    <tr><td>${r.id}</td><td>${r.name || ''}</td><td>${r.creator_type || ''}</td><td>${r.creator_status || ''}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const storefrontRows = storefronts.map(r => `
    <tr><td>${r.id}</td><td>${r.name || ''}</td><td>${r.storefront_name || ''}</td><td>${r.storefront_type || ''}</td><td>${r.link_status || ''}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Heir Operations', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Operations • Earnings • Permissions • Creator Systems</div>
          <h1>Heir Operations</h1>
          <p>Operational view of revenue, permissions, creator profiles, and storefront links for the heirs network.</p>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Earnings</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Amount</th><th>Source</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${earningsRows || '<tr><td colspan="7">No earnings yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Permissions</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Permission</th><th>Scope</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${permRows || '<tr><td colspan="6">No permissions yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Creator Profiles</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Creator Type</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${creatorRows || '<tr><td colspan="5">No creator profiles yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Storefront Links</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Storefront</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${storefrontRows || '<tr><td colspan="6">No storefront links yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `, user);
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function renderHeirsEcosystemPage(user = null)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

if '<a href="/heirs-ecosystem">Heirs</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/creator-hub">Creators</a>',
        '<a href="/creator-hub">Creators</a>\n          <a href="/heirs-ecosystem">Heirs</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/command-core') {"
if "pathname === '/heirs-ecosystem'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/heirs-ecosystem') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHeirsEcosystemPage(session));
    }

    if (req.method === 'GET' && pathname === '/heir-operations') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHeirOperationsPage(session));
    }

    if (req.method === 'GET' && pathname === '/command-core') {"""
    text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] heirs ecosystem UI added")
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

cp apps/dashboard.js "backups/dashboard_heirs_wallet_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_heirs_wallet_${STAMP}.js"
cp db/aam.db "backups/aam_heirs_wallet_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as heirs_registry from heirs_registry;" > "snapshots/heirs_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_wallets from heir_wallets;" > "snapshots/heir_wallets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_earnings from heir_earnings;" > "snapshots/heir_earnings_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_creator_profiles from heir_creator_profiles;" > "snapshots/heir_creator_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_storefront_links from heir_storefront_links;" > "snapshots/heir_storefront_links_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_permissions_matrix from heir_permissions_matrix;" > "snapshots/heir_permissions_matrix_${STAMP}.json"

cat > "reports/heirs_wallet_earnings_${STAMP}.txt" <<REPORT
HEIRS WALLET + EARNINGS + CREATOR STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- heir_wallets
- heir_earnings
- heir_creator_profiles
- heir_storefront_links
- heir_permissions_matrix

Routes:
- /heirs
- /heirs-ecosystem
- /heir-operations

Goal:
- connect heirs to wallets
- connect heirs to creator systems
- connect heirs to storefronts
- connect heirs to permissions
- make heir progress visible
REPORT

echo "HEIRS WALLET + EARNINGS + CREATOR STABILIZE COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/heirs"
echo "  termux-open-url http://127.0.0.1:4900/heirs-ecosystem"
echo "  termux-open-url http://127.0.0.1:4900/heir-operations"
