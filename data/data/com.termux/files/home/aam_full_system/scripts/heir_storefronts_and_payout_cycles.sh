#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== HEIR STOREFRONTS + PAYOUT CYCLES START ==="

########################################
# 1) DATABASE
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS heir_storefront_ownership (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER NOT NULL,
  storefront_name TEXT NOT NULL,
  ownership_percent REAL NOT NULL DEFAULT 100,
  ownership_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS payout_cycles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cycle_name TEXT NOT NULL,
  cycle_type TEXT NOT NULL DEFAULT 'manual',
  cycle_status TEXT NOT NULL DEFAULT 'ready',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS payout_cycle_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cycle_id INTEGER NOT NULL,
  payout_run_id INTEGER,
  run_status TEXT NOT NULL DEFAULT 'processed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed storefront ownership
seed = [
    ("Isaiah", "Anyone Can Be a Star", 100.0),
    ("Aniyah", "Aniyah Singing Coach", 100.0),
    ("Jacobie", "Jacobie Vision", 100.0),
    ("Alton", "Alton Security", 100.0),
]
for heir_name, storefront_name, pct in seed:
    row = cur.execute("SELECT id FROM heirs_registry WHERE name=? LIMIT 1", (heir_name,)).fetchone()
    if row:
        heir_id = int(row[0])
        exists = cur.execute("""
            SELECT 1 FROM heir_storefront_ownership
            WHERE heir_id=? AND storefront_name=?
            LIMIT 1
        """, (heir_id, storefront_name)).fetchone()
        if not exists:
            cur.execute("""
            INSERT INTO heir_storefront_ownership (heir_id, storefront_name, ownership_percent, ownership_status)
            VALUES (?, ?, ?, 'active')
            """, (heir_id, storefront_name, pct))

# seed a cycle
exists = cur.execute("SELECT 1 FROM payout_cycles WHERE cycle_name='Weekly Heir Cycle' LIMIT 1").fetchone()
if not exists:
    cur.execute("""
    INSERT INTO payout_cycles (cycle_name, cycle_type, cycle_status)
    VALUES ('Weekly Heir Cycle', 'manual', 'ready')
    """)

conn.commit()
conn.close()
print("[OK] storefront ownership + payout cycle DB ready")
PYEOF

########################################
# 2) PATCH DASHBOARD
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r'''
function renderHeirStorefrontsPage(user = null) {
  const rows = dbQuery(`
    SELECT hso.id, hr.name, hso.storefront_name, hso.ownership_percent, hso.ownership_status, hso.created_at
    FROM heir_storefront_ownership hso
    LEFT JOIN heirs_registry hr ON hr.id = hso.heir_id
    ORDER BY hso.id DESC
    LIMIT 200
  `);

  const body = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.name || ''}</td>
      <td>${r.storefront_name || ''}</td>
      <td>${r.ownership_percent || 0}%</td>
      <td>${r.ownership_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Heir Storefront Ownership', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Ownership Layer</div>
          <h1>Heir Storefront Ownership</h1>
          <p>Visible ownership assignments for heir-linked storefronts.</p>
        </section>

        <section class="clean-section">
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Heir</th><th>Storefront</th><th>Ownership</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${body || '<tr><td colspan="6">No ownership records yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `, user);
}

function renderPayoutCyclesPage(user = null, message = '') {
  const cycles = dbQuery(`
    SELECT id, cycle_name, cycle_type, cycle_status, created_at
    FROM payout_cycles
    ORDER BY id DESC
    LIMIT 100
  `);

  const runs = dbQuery(`
    SELECT pcr.id, pc.cycle_name, pcr.payout_run_id, pcr.run_status, pcr.created_at
    FROM payout_cycle_runs pcr
    LEFT JOIN payout_cycles pc ON pc.id = pcr.cycle_id
    ORDER BY pcr.id DESC
    LIMIT 100
  `);

  const cycleRows = cycles.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.cycle_name || ''}</td>
      <td>${r.cycle_type || ''}</td>
      <td>${r.cycle_status || ''}</td>
      <td>${r.created_at || ''}</td>
      <td>
        <form method="POST" action="/payout-cycles/run/${r.id}">
          <button type="submit">Run Cycle</button>
        </form>
      </td>
    </tr>
  `).join('');

  const runRows = runs.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.cycle_name || ''}</td>
      <td>${r.payout_run_id || ''}</td>
      <td>${r.run_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Payout Cycles', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Payout Operations</div>
          <h1>Payout Cycles</h1>
          <p>Run and track payout cycles for heirs.</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Cycles</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
              <tbody>${cycleRows || '<tr><td colspan="6">No cycles yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Cycle Runs</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Cycle</th><th>Payout Run</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${runRows || '<tr><td colspan="5">No cycle runs yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `, user);
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function renderHeirStorefrontsPage(user = null)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

if '<a href="/heir-storefronts">Ownership</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/heir-payouts">Payouts</a>',
        '<a href="/heir-payouts">Payouts</a>\n          <a href="/heir-storefronts">Ownership</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/heir-payouts') {"
if "pathname === '/heir-storefronts'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/heir-storefronts') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHeirStorefrontsPage(session));
    }

    if (req.method === 'GET' && pathname === '/payout-cycles') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPayoutCyclesPage(session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'POST' && pathname.startsWith('/payout-cycles/run/')) {
      const cycleId = Number(pathname.split('/')[3]);
      const latestRun = dbQuery(`SELECT id FROM heir_payout_runs ORDER BY id DESC LIMIT 1`);
      const payoutRunId = latestRun.length ? Number(latestRun[0].id) : 0;

      dbRun(`INSERT INTO payout_cycle_runs (cycle_id, payout_run_id, run_status)
             VALUES (${cycleId}, ${payoutRunId}, 'processed')`);

      dbRun(`UPDATE payout_cycles SET cycle_status='processed' WHERE id=${cycleId}`);

      return redirect(res, `/payout-cycles?msg=Cycle%20run%20recorded`);
    }

    if (req.method === 'GET' && pathname === '/heir-payouts') {"""
    text = text.replace(anchor, route, 1)

# Add quick action links on heir dashboard if not present
if 'Open Ownership View' not in text and 'Update PIN' in text:
    text = text.replace(
        """  cards.push(`
    <div class="feature-card">
      <h3>Update PIN</h3>
      <p>Change the default PIN for this heir account and improve account safety.</p>
      <a href="/heir-pin/${heirId}" class="feature-link">Update PIN</a>
    </div>
  `);""",
        """  cards.push(`
    <div class="feature-card">
      <h3>Update PIN</h3>
      <p>Change the default PIN for this heir account and improve account safety.</p>
      <a href="/heir-pin/${heirId}" class="feature-link">Update PIN</a>
    </div>
  `);

  cards.push(`
    <div class="feature-card">
      <h3>Ownership View</h3>
      <p>Review heir storefront ownership and assigned commercial surfaces.</p>
      <a href="/heir-storefronts" class="feature-link">Open Ownership View</a>
    </div>
  `);

  cards.push(`
    <div class="feature-card">
      <h3>Payout Cycles</h3>
      <p>Review payout cycles and payout operations for the heirs network.</p>
      <a href="/payout-cycles" class="feature-link">Open Payout Cycles</a>
    </div>
  `);"""
    )

p.write_text(text)
print("[OK] storefront ownership + payout cycles UI added")
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

cp apps/dashboard.js "backups/dashboard_heir_storefronts_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_heir_storefronts_${STAMP}.js"
cp db/aam.db "backups/aam_heir_storefronts_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as heir_storefront_ownership from heir_storefront_ownership;" > "snapshots/heir_storefront_ownership_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as payout_cycles from payout_cycles;" > "snapshots/payout_cycles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as payout_cycle_runs from payout_cycle_runs;" > "snapshots/payout_cycle_runs_${STAMP}.json"

cat > "reports/heir_storefronts_payout_cycles_${STAMP}.txt" <<REPORT
HEIR STOREFRONTS + PAYOUT CYCLES REPORT
Timestamp: ${STAMP}

Added:
- heir_storefront_ownership
- payout_cycles
- payout_cycle_runs

Routes:
- /heir-storefronts
- /payout-cycles

Goal:
- show heir commercial ownership
- add visible payout-cycle operations
- improve operator workflow
REPORT

echo "HEIR STOREFRONTS + PAYOUT CYCLES COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/heir-storefronts"
echo "  termux-open-url http://127.0.0.1:4900/payout-cycles"
echo "  termux-open-url http://127.0.0.1:4900/heir-dashboard/1"
