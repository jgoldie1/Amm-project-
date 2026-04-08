#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== HEIR LOGIN + DASHBOARD + REVENUE SPLIT START ==="

########################################
# 1) DATABASE
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path
import secrets

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS heir_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER NOT NULL,
  username TEXT NOT NULL UNIQUE,
  pin_code TEXT NOT NULL,
  account_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS heir_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER NOT NULL,
  session_token TEXT NOT NULL,
  session_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS heir_revenue_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER NOT NULL,
  rule_name TEXT NOT NULL,
  revenue_type TEXT NOT NULL,
  split_percent REAL NOT NULL DEFAULT 0,
  rule_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS heir_dashboards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER NOT NULL,
  dashboard_name TEXT NOT NULL,
  dashboard_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

rows = cur.execute("SELECT id, name FROM heirs_registry ORDER BY id").fetchall()
for heir_id, name in rows:
    username = name.lower().replace(" ", "_").replace("+", "plus").replace("/", "_")
    exists = cur.execute("SELECT 1 FROM heir_accounts WHERE heir_id=?", (heir_id,)).fetchone()
    if not exists:
        cur.execute("""
        INSERT INTO heir_accounts (heir_id, username, pin_code, account_status)
        VALUES (?, ?, ?, 'active')
        """, (heir_id, username, "1234"))

    dash_exists = cur.execute("SELECT 1 FROM heir_dashboards WHERE heir_id=?", (heir_id,)).fetchone()
    if not dash_exists:
        cur.execute("""
        INSERT INTO heir_dashboards (heir_id, dashboard_name, dashboard_status)
        VALUES (?, ?, 'active')
        """, (heir_id, f"{name} Dashboard"))

# seed revenue rules for key heirs
rules = [
    ("Isaiah", "Anyone Can Be a Star Split", "creator_revenue", 35.0),
    ("Aniyah", "Aniyah Coaching Split", "coaching_revenue", 40.0),
    ("Jacobie", "Jacobie Vision Split", "security_revenue", 45.0),
    ("Alton", "Alton Security Split", "security_revenue", 40.0),
    ("Alton Kevon", "Advanced Systems Split", "systems_revenue", 30.0),
]
for heir_name, rule_name, revenue_type, split_percent in rules:
    row = cur.execute("SELECT id FROM heirs_registry WHERE name=? LIMIT 1", (heir_name,)).fetchone()
    if row:
        heir_id = row[0]
        exists = cur.execute("""
          SELECT 1 FROM heir_revenue_rules
          WHERE heir_id=? AND rule_name=? AND revenue_type=?
        """, (heir_id, rule_name, revenue_type)).fetchone()
        if not exists:
            cur.execute("""
            INSERT INTO heir_revenue_rules (heir_id, rule_name, revenue_type, split_percent, rule_status)
            VALUES (?, ?, ?, ?, 'active')
            """, (heir_id, rule_name, revenue_type, split_percent))

conn.commit()
conn.close()
print("[OK] heir login/dashboard/revenue DB ready")
PYEOF

########################################
# 2) PATCH DASHBOARD UI + ROUTES
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r'''
function renderHeirLoginPage(user = null, message = '') {
  return htmlPage('Heir Login', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Heirs Network Access</div>
          <h1>Heir Login</h1>
          <p>Enter your heir username and PIN to open your member dashboard.</p>
        </section>

        <section class="clean-section">
          <div class="section-body">
            <div class="feature-card" style="max-width:560px;">
              ${message ? `<p class="ok">${message}</p>` : ''}
              <form method="POST" action="/heir-login">
                <label>Username</label>
                <input name="username" placeholder="jacobie" />
                <label>PIN</label>
                <input name="pin_code" placeholder="1234" type="password" />
                <button type="submit">Open Dashboard</button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  `, user);
}

function renderHeirMemberPage(heirId, user = null) {
  const heirRows = dbQuery(`SELECT id, name, role, division, access_level, created_at FROM heirs_registry WHERE id=${Number(heirId)} LIMIT 1`);
  if (!heirRows.length) {
    return htmlPage('Not Found', `<div class="card"><h2>Heir not found</h2></div>`, user);
  }

  const h = heirRows[0];
  const wallets = dbQuery(`SELECT id, wallet_name, wallet_status, created_at FROM heir_wallets WHERE heir_id=${Number(heirId)} ORDER BY id DESC`);
  const earnings = dbQuery(`SELECT id, earning_type, amount_cents, source_type, earning_status, created_at FROM heir_earnings WHERE heir_id=${Number(heirId)} ORDER BY id DESC LIMIT 50`);
  const creators = dbQuery(`SELECT id, creator_name, creator_type, creator_status, created_at FROM heir_creator_profiles WHERE heir_id=${Number(heirId)} ORDER BY id DESC`);
  const storefronts = dbQuery(`SELECT id, storefront_name, storefront_type, link_status, created_at FROM heir_storefront_links WHERE heir_id=${Number(heirId)} ORDER BY id DESC`);
  const perms = dbQuery(`SELECT id, permission_name, permission_scope, permission_status, created_at FROM heir_permissions_matrix WHERE heir_id=${Number(heirId)} ORDER BY id DESC`);
  const rules = dbQuery(`SELECT id, rule_name, revenue_type, split_percent, rule_status, created_at FROM heir_revenue_rules WHERE heir_id=${Number(heirId)} ORDER BY id DESC`);

  const totalEarnings = earnings.reduce((sum, row) => sum + Number(row.amount_cents || 0), 0);

  return htmlPage(`${h.name} Dashboard`, `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Heir Member Dashboard</div>
          <h1>${h.name}</h1>
          <p>${h.role || ''} · ${h.division || ''} · Access: ${h.access_level || ''}</p>
        </section>

        <div class="stats-grid">
          ${typeof statCard === 'function' ? statCard('Wallets', wallets.length) : ''}
          ${typeof statCard === 'function' ? statCard('Creator Profiles', creators.length) : ''}
          ${typeof statCard === 'function' ? statCard('Storefront Links', storefronts.length) : ''}
          ${typeof statCard === 'function' ? statCard('Total Earnings', '$' + (totalEarnings / 100).toFixed(2)) : ''}
        </div>

        <section class="clean-section">
          <div class="section-head"><h2>Wallets</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                ${wallets.map(r => `<tr><td>${r.id}</td><td>${r.wallet_name || ''}</td><td>${r.wallet_status || ''}</td><td>${r.created_at || ''}</td></tr>`).join('') || '<tr><td colspan="4">No wallets yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Earnings</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Type</th><th>Amount</th><th>Source</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                ${earnings.map(r => `<tr><td>${r.id}</td><td>${r.earning_type || ''}</td><td>$${((Number(r.amount_cents || 0))/100).toFixed(2)}</td><td>${r.source_type || ''}</td><td>${r.earning_status || ''}</td><td>${r.created_at || ''}</td></tr>`).join('') || '<tr><td colspan="6">No earnings yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Revenue Split Rules</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Revenue Type</th><th>Split %</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                ${rules.map(r => `<tr><td>${r.id}</td><td>${r.rule_name || ''}</td><td>${r.revenue_type || ''}</td><td>${r.split_percent || 0}</td><td>${r.rule_status || ''}</td><td>${r.created_at || ''}</td></tr>`).join('') || '<tr><td colspan="6">No rules yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Creator Profiles</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                ${creators.map(r => `<tr><td>${r.id}</td><td>${r.creator_name || ''}</td><td>${r.creator_type || ''}</td><td>${r.creator_status || ''}</td><td>${r.created_at || ''}</td></tr>`).join('') || '<tr><td colspan="5">No creator profiles yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Storefront Links</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Storefront</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                ${storefronts.map(r => `<tr><td>${r.id}</td><td>${r.storefront_name || ''}</td><td>${r.storefront_type || ''}</td><td>${r.link_status || ''}</td><td>${r.created_at || ''}</td></tr>`).join('') || '<tr><td colspan="5">No storefront links yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Permissions</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Permission</th><th>Scope</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                ${perms.map(r => `<tr><td>${r.id}</td><td>${r.permission_name || ''}</td><td>${r.permission_scope || ''}</td><td>${r.permission_status || ''}</td><td>${r.created_at || ''}</td></tr>`).join('') || '<tr><td colspan="5">No permissions yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `, user);
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function renderHeirLoginPage(user = null, message = '')" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

if '<a href="/heir-login">Heir Login</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/progress">Progress</a>',
        '<a href="/progress">Progress</a>\n          <a href="/heir-login">Heir Login</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/heirs-ecosystem') {"
if "pathname === '/heir-login'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/heir-login') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHeirLoginPage(session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'POST' && pathname === '/heir-login') {
      const body = await parseBody(req);
      const username = String(body.username || '').trim().toLowerCase();
      const pinCode = String(body.pin_code || '').trim();

      const rows = dbQuery(`SELECT ha.id, ha.heir_id, hr.name
                            FROM heir_accounts ha
                            LEFT JOIN heirs_registry hr ON hr.id = ha.heir_id
                            WHERE lower(ha.username)='${q(username)}'
                              AND ha.pin_code='${q(pinCode)}'
                              AND ha.account_status='active'
                            LIMIT 1`);
      if (!rows.length) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(renderHeirLoginPage(null, 'Login failed'));
      }

      const heirId = Number(rows[0].heir_id);
      const token = 'heir_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);

      dbRun(`INSERT INTO heir_sessions (heir_id, session_token, session_status)
             VALUES (${heirId}, '${q(token)}', 'active')`);

      return redirect(res, `/heir-dashboard/${heirId}?msg=Welcome`);
    }

    if (req.method === 'GET' && pathname.startsWith('/heir-dashboard/')) {
      const session = hardenPublicSession(req);
      const heirId = Number(pathname.split('/')[2]);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHeirMemberPage(heirId, session));
    }

    if (req.method === 'GET' && pathname === '/heirs-ecosystem') {"""
    text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] heir login/member dashboard UI added")
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

cp apps/dashboard.js "backups/dashboard_heir_login_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_heir_login_${STAMP}.js"
cp db/aam.db "backups/aam_heir_login_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as heir_accounts from heir_accounts;" > "snapshots/heir_accounts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_sessions from heir_sessions;" > "snapshots/heir_sessions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_revenue_rules from heir_revenue_rules;" > "snapshots/heir_revenue_rules_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_dashboards from heir_dashboards;" > "snapshots/heir_dashboards_${STAMP}.json"

cat > "reports/heir_login_dashboard_${STAMP}.txt" <<REPORT
HEIR LOGIN + DASHBOARD + REVENUE SPLIT REPORT
Timestamp: ${STAMP}

Added:
- heir_accounts
- heir_sessions
- heir_revenue_rules
- heir_dashboards

Routes:
- /heir-login
- /heir-dashboard/:id

Goal:
- allow heir login flow
- create personal dashboard
- expose revenue split rules
- prepare for real member mode
REPORT

echo "HEIR LOGIN + DASHBOARD + REVENUE SPLIT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/heir-login"
echo "  termux-open-url http://127.0.0.1:4900/heir-dashboard/1"
