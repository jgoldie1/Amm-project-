#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== REVENUE SPLIT + PAYOUT EXECUTION START ==="

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
CREATE TABLE IF NOT EXISTS heir_payout_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payout_name TEXT NOT NULL,
  source_revenue_cents INTEGER NOT NULL DEFAULT 0,
  payout_status TEXT NOT NULL DEFAULT 'processed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS heir_payout_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payout_run_id INTEGER NOT NULL,
  heir_id INTEGER NOT NULL,
  revenue_rule_id INTEGER,
  source_type TEXT NOT NULL,
  source_amount_cents INTEGER NOT NULL DEFAULT 0,
  split_percent REAL NOT NULL DEFAULT 0,
  payout_amount_cents INTEGER NOT NULL DEFAULT 0,
  payout_status TEXT NOT NULL DEFAULT 'posted',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS heir_wallet_mirror_tx (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER NOT NULL,
  heir_wallet_id INTEGER,
  payout_item_id INTEGER,
  tx_type TEXT NOT NULL DEFAULT 'heir_payout',
  amount_cents INTEGER NOT NULL DEFAULT 0,
  tx_status TEXT NOT NULL DEFAULT 'posted',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()
conn.close()
print("[OK] payout DB ready")
PYEOF

########################################
# 2) EXECUTE A SEEDED PAYOUT RUN
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# Seeded source revenue pool for demonstration
source_revenue_cents = 1000000  # $10,000.00

# create a payout run only if an identical latest run does not already exist
latest = cur.execute("""
SELECT id, source_revenue_cents
FROM heir_payout_runs
ORDER BY id DESC
LIMIT 1
""").fetchone()

create_run = True
if latest and int(latest["source_revenue_cents"]) == source_revenue_cents:
    payout_run_id = int(latest["id"])
    items_exist = cur.execute("SELECT count(*) as c FROM heir_payout_items WHERE payout_run_id=?", (payout_run_id,)).fetchone()["c"]
    if items_exist > 0:
        create_run = False

if create_run:
    cur.execute("""
    INSERT INTO heir_payout_runs (payout_name, source_revenue_cents, payout_status)
    VALUES (?, ?, 'processed')
    """, ("Heir Revenue Split Run", source_revenue_cents))
    payout_run_id = cur.lastrowid

    rules = cur.execute("""
    SELECT hrr.id as revenue_rule_id, hrr.heir_id, hrr.rule_name, hrr.revenue_type, hrr.split_percent,
           hr.name
    FROM heir_revenue_rules hrr
    LEFT JOIN heirs_registry hr ON hr.id = hrr.heir_id
    WHERE hrr.rule_status='active'
    ORDER BY hrr.id ASC
    """).fetchall()

    for r in rules:
        split_percent = float(r["split_percent"] or 0)
        payout_amount_cents = int(round(source_revenue_cents * (split_percent / 100.0)))

        cur.execute("""
        INSERT INTO heir_payout_items
        (payout_run_id, heir_id, revenue_rule_id, source_type, source_amount_cents, split_percent, payout_amount_cents, payout_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'posted')
        """, (
            payout_run_id,
            int(r["heir_id"]),
            int(r["revenue_rule_id"]),
            str(r["revenue_type"] or "general_revenue"),
            source_revenue_cents,
            split_percent,
            payout_amount_cents
        ))
        payout_item_id = cur.lastrowid

        # Post into heir earnings
        exists = cur.execute("""
        SELECT 1 FROM heir_earnings
        WHERE heir_id=? AND earning_type=? AND amount_cents=? AND source_type=? AND source_id=?
        LIMIT 1
        """, (
            int(r["heir_id"]),
            "payout_distribution",
            payout_amount_cents,
            "heir_payout_run",
            payout_run_id
        )).fetchone()

        if not exists:
            cur.execute("""
            INSERT INTO heir_earnings
            (heir_id, earning_type, amount_cents, source_type, source_id, earning_status)
            VALUES (?, 'payout_distribution', ?, 'heir_payout_run', ?, 'posted')
            """, (int(r["heir_id"]), payout_amount_cents, payout_run_id))

        # Mirror into heir wallet mirror tx
        wallet_row = cur.execute("""
        SELECT id FROM heir_wallets WHERE heir_id=? ORDER BY id ASC LIMIT 1
        """, (int(r["heir_id"]),)).fetchone()
        heir_wallet_id = int(wallet_row["id"]) if wallet_row else None

        mirror_exists = cur.execute("""
        SELECT 1 FROM heir_wallet_mirror_tx
        WHERE heir_id=? AND payout_item_id=?
        LIMIT 1
        """, (int(r["heir_id"]), payout_item_id)).fetchone()

        if not mirror_exists:
            cur.execute("""
            INSERT INTO heir_wallet_mirror_tx
            (heir_id, heir_wallet_id, payout_item_id, tx_type, amount_cents, tx_status)
            VALUES (?, ?, ?, 'heir_payout', ?, 'posted')
            """, (int(r["heir_id"]), heir_wallet_id, payout_item_id, payout_amount_cents))

conn.commit()
conn.close()
print("[OK] payout execution complete")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r'''
function renderHeirPayoutsPage(user = null) {
  const runs = dbQuery(`
    SELECT id, payout_name, source_revenue_cents, payout_status, created_at
    FROM heir_payout_runs
    ORDER BY id DESC
    LIMIT 50
  `);

  const items = dbQuery(`
    SELECT hpi.id, hpi.payout_run_id, hr.name, hpi.source_type, hpi.source_amount_cents,
           hpi.split_percent, hpi.payout_amount_cents, hpi.payout_status, hpi.created_at
    FROM heir_payout_items hpi
    LEFT JOIN heirs_registry hr ON hr.id = hpi.heir_id
    ORDER BY hpi.id DESC
    LIMIT 200
  `);

  const mirror = dbQuery(`
    SELECT hwm.id, hr.name, hwm.heir_wallet_id, hwm.tx_type, hwm.amount_cents, hwm.tx_status, hwm.created_at
    FROM heir_wallet_mirror_tx hwm
    LEFT JOIN heirs_registry hr ON hr.id = hwm.heir_id
    ORDER BY hwm.id DESC
    LIMIT 200
  `);

  const runRows = runs.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.payout_name || ''}</td>
      <td>$${((Number(r.source_revenue_cents || 0))/100).toFixed(2)}</td>
      <td>${r.payout_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const itemRows = items.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.payout_run_id}</td>
      <td>${r.name || ''}</td>
      <td>${r.source_type || ''}</td>
      <td>$${((Number(r.source_amount_cents || 0))/100).toFixed(2)}</td>
      <td>${r.split_percent || 0}%</td>
      <td>$${((Number(r.payout_amount_cents || 0))/100).toFixed(2)}</td>
      <td>${r.payout_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const mirrorRows = mirror.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.name || ''}</td>
      <td>${r.heir_wallet_id || ''}</td>
      <td>${r.tx_type || ''}</td>
      <td>$${((Number(r.amount_cents || 0))/100).toFixed(2)}</td>
      <td>${r.tx_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Heir Payouts', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Revenue Split Execution</div>
          <h1>Heir Payouts</h1>
          <p>Revenue split runs, payout items, and wallet mirror records for heirs.</p>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Payout Runs</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Source Revenue</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${runRows || '<tr><td colspan="5">No payout runs yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Payout Items</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Run</th><th>Heir</th><th>Type</th><th>Source</th><th>Split</th><th>Payout</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${itemRows || '<tr><td colspan="9">No payout items yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Wallet Mirror Transactions</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Heir</th><th>Wallet</th><th>Type</th><th>Amount</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${mirrorRows || '<tr><td colspan="7">No wallet mirror transactions yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `, user);
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function renderHeirPayoutsPage(user = null)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

if '<a href="/heir-payouts">Payouts</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/heir-login">Heir Login</a>',
        '<a href="/heir-login">Heir Login</a>\n          <a href="/heir-payouts">Payouts</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/heir-login') {"
if "pathname === '/heir-payouts'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/heir-payouts') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHeirPayoutsPage(session));
    }

    if (req.method === 'GET' && pathname === '/heir-login') {"""
    text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] heir payouts UI added")
PYEOF

########################################
# 4) RESTART / VERIFY
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
# 5) CHECKPOINT
########################################
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports

cp apps/dashboard.js "backups/dashboard_heir_payouts_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_heir_payouts_${STAMP}.js"
cp db/aam.db "backups/aam_heir_payouts_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as heir_payout_runs from heir_payout_runs;" > "snapshots/heir_payout_runs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_payout_items from heir_payout_items;" > "snapshots/heir_payout_items_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_wallet_mirror_tx from heir_wallet_mirror_tx;" > "snapshots/heir_wallet_mirror_tx_${STAMP}.json"

cat > "reports/revenue_split_payout_${STAMP}.txt" <<REPORT
REVENUE SPLIT + PAYOUT EXECUTION REPORT
Timestamp: ${STAMP}

Added:
- heir_payout_runs
- heir_payout_items
- heir_wallet_mirror_tx

Route:
- /heir-payouts

Goal:
- execute revenue split logic
- post payouts to heirs
- mirror payouts into heir wallet activity
REPORT

echo "REVENUE SPLIT + PAYOUT EXECUTION COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/heir-payouts"
echo "  termux-open-url http://127.0.0.1:4900/heir-dashboard/1"
