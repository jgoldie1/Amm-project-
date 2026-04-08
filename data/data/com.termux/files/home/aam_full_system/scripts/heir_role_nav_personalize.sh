#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== HEIR ROLE NAV + PERSONALIZATION START ==="

########################################
# 1) DB
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS heir_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER NOT NULL,
  theme_name TEXT DEFAULT 'portal_blue',
  home_route TEXT DEFAULT '/heir-dashboard/1',
  preference_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

rows = cur.execute("SELECT id FROM heirs_registry ORDER BY id").fetchall()
for (heir_id,) in rows:
    exists = cur.execute("SELECT 1 FROM heir_preferences WHERE heir_id=? LIMIT 1", (heir_id,)).fetchone()
    if not exists:
        cur.execute("""
        INSERT INTO heir_preferences (heir_id, theme_name, home_route, preference_status)
        VALUES (?, 'portal_blue', ?, 'active')
        """, (heir_id, f"/heir-dashboard/{heir_id}"))

conn.commit()
conn.close()
print("[OK] heir preferences ready")
PYEOF

########################################
# 2) PATCH DASHBOARD
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r'''
function heirRoleActions(role = '', division = '', heirId = 0) {
  const r = String(role || '').toLowerCase();
  const d = String(division || '').toLowerCase();
  let cards = [];

  cards.push(`
    <div class="feature-card">
      <h3>My Earnings</h3>
      <p>Review posted earnings, totals, and revenue rules for this heir account.</p>
      <a href="/heir-dashboard/${heirId}" class="feature-link">Open Earnings View</a>
    </div>
  `);

  if (r.includes('security') || d.includes('jacobie vision') || d.includes('alton security')) {
    cards.push(`
      <div class="feature-card">
        <h3>Security Console</h3>
        <p>Access cybersecurity, audit, and security-related operating surfaces.</p>
        <a href="/command-core" class="feature-link">Open Command Core</a>
      </div>
    `);
  }

  if (r.includes('entertainment') || d.includes('anyone can be a star')) {
    cards.push(`
      <div class="feature-card">
        <h3>Creator Stage</h3>
        <p>Use creator tools, stage systems, and media-related flows tied to your division.</p>
        <a href="/creator-hub" class="feature-link">Open Creator Hub</a>
      </div>
    `);
  }

  if (r.includes('voice') || d.includes('aniyah app')) {
    cards.push(`
      <div class="feature-card">
        <h3>Voice + Coaching Tools</h3>
        <p>Open coaching, recording, and voice-centered experiences for the Aniyah system.</p>
        <a href="/creator-hub" class="feature-link">Open Voice Tools</a>
      </div>
    `);
  }

  if (r.includes('family node') || r.includes('network node') || r.includes('next gen') || d.includes('heirs network')) {
    cards.push(`
      <div class="feature-card">
        <h3>Heirs Network</h3>
        <p>View the broader family network, branch structure, and inherited platform pathways.</p>
        <a href="/heirs-ecosystem" class="feature-link">Open Heirs Network</a>
      </div>
    `);
  }

  cards.push(`
    <div class="feature-card">
      <h3>Wallet Center</h3>
      <p>Review wallet activity, balances, and related financial system visibility.</p>
      <a href="/wallet-center" class="feature-link">Open Wallet Center</a>
    </div>
  `);

  cards.push(`
    <div class="feature-card">
      <h3>Update PIN</h3>
      <p>Change the default PIN for this heir account and improve account safety.</p>
      <a href="/heir-pin/${heirId}" class="feature-link">Update PIN</a>
    </div>
  `);

  return cards.join('');
}

function renderHeirPinPage(heirId, user = null, message = '') {
  const rows = dbQuery(`SELECT id, name FROM heirs_registry WHERE id=${Number(heirId)} LIMIT 1`);
  if (!rows.length) {
    return htmlPage('Not Found', `<div class="card"><h2>Heir not found</h2></div>`, user);
  }
  const h = rows[0];

  return htmlPage('Heir PIN Update', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Account Safety</div>
          <h1>${h.name} PIN Update</h1>
          <p>Replace the default PIN with a new one for this heir account.</p>
        </section>

        <section class="clean-section">
          <div class="section-body">
            <div class="feature-card" style="max-width:560px;">
              ${message ? `<p class="ok">${message}</p>` : ''}
              <form method="POST" action="/heir-pin/${h.id}">
                <label>New PIN</label>
                <input name="new_pin" placeholder="4321" type="password" />
                <button type="submit">Save New PIN</button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  `, user);
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function heirRoleActions(role = '', division = '', heirId = 0)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

old_block = """        <section class="clean-section">
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
}"""

new_block = """        <section class="clean-section">
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

        <section class="clean-section">
          <div class="section-head"><h2>Quick Actions</h2></div>
          <div class="section-body">
            <div class="feature-grid">
              ${heirRoleActions(h.role || '', h.division || '', h.id)}
            </div>
          </div>
        </section>
      </main>
    </div>
  `, user);
}"""

if old_block in text and "Quick Actions" not in text:
    text = text.replace(old_block, new_block, 1)

if '<a href="/heir-login">Heir Login</a>' in text and '<a href="/heirs-ecosystem">Heirs</a>' not in text:
    text = text.replace(
        '<a href="/heir-login">Heir Login</a>',
        '<a href="/heir-login">Heir Login</a>\n          <a href="/heirs-ecosystem">Heirs</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/heirs-ecosystem') {"
if "pathname.startsWith('/heir-pin/')" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname.startsWith('/heir-pin/')) {
      const session = hardenPublicSession(req);
      const heirId = Number(pathname.split('/')[2]);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHeirPinPage(heirId, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'POST' && pathname.startsWith('/heir-pin/')) {
      const heirId = Number(pathname.split('/')[2]);
      const body = await parseBody(req);
      const newPin = String(body.new_pin || '').trim();

      if (!/^\\d{4,8}$/.test(newPin)) {
        return redirect(res, `/heir-pin/${heirId}?msg=PIN%20must%20be%204-8%20digits`);
      }

      dbRun(`UPDATE heir_accounts SET pin_code='${q(newPin)}' WHERE heir_id=${heirId}`);
      return redirect(res, `/heir-pin/${heirId}?msg=PIN%20updated`);
    }

    if (req.method === 'GET' && pathname === '/heirs-ecosystem') {"""
    text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] heir role personalization patch applied")
PYEOF

########################################
# 3) RESTART / VERIFY
########################################
bash scripts/restart_world_socket.sh || true
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh

echo "--- DASHBOARD HEALTH ---"
curl -s http://127.0.0.1:4900/health || true
echo "--- JARVIS HEALTH ---"
curl -s http://127.0.0.1:5000/health || true
echo "--- SOCKET HEALTH ---"
curl -s http://127.0.0.1:5090/health || true

########################################
# 4) CHECKPOINT
########################################
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports

cp apps/dashboard.js "backups/dashboard_heir_role_nav_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_heir_role_nav_${STAMP}.js"
cp db/aam.db "backups/aam_heir_role_nav_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as heir_preferences from heir_preferences;" > "snapshots/heir_preferences_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_accounts from heir_accounts;" > "snapshots/heir_accounts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_dashboards from heir_dashboards;" > "snapshots/heir_dashboards_${STAMP}.json"

cat > "reports/heir_role_nav_${STAMP}.txt" <<REPORT
HEIR ROLE NAV + PERSONALIZATION REPORT
Timestamp: ${STAMP}

Added:
- heir_preferences
- role-based quick actions on heir dashboards
- PIN update page

Routes:
- /heir-login
- /heir-dashboard/:id
- /heir-pin/:id

Goal:
- personalize heir experience
- reduce generic dashboard feel
- prepare for safer heir account usage
REPORT

echo "HEIR ROLE NAV + PERSONALIZATION COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/heir-login"
echo "  termux-open-url http://127.0.0.1:4900/heir-dashboard/1"
echo "  termux-open-url http://127.0.0.1:4900/heir-pin/1"
