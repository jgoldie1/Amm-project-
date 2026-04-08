#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== EXECUTIVE FINANCE COMMAND BASH START ==="

########################################
# 1) DATABASE SAFETY / CATCH-UP
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS heir_balance_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER NOT NULL,
  total_earnings_cents INTEGER NOT NULL DEFAULT 0,
  total_wallet_mirror_cents INTEGER NOT NULL DEFAULT 0,
  total_payout_cents INTEGER NOT NULL DEFAULT 0,
  balance_cents INTEGER NOT NULL DEFAULT 0,
  snapshot_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS storefront_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER,
  storefront_name TEXT NOT NULL,
  views_count INTEGER NOT NULL DEFAULT 0,
  orders_count INTEGER NOT NULL DEFAULT 0,
  revenue_cents INTEGER NOT NULL DEFAULT 0,
  analytics_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS scheduled_payout_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_name TEXT NOT NULL,
  cycle_type TEXT NOT NULL DEFAULT 'weekly',
  target_type TEXT NOT NULL DEFAULT 'all_heirs',
  target_id INTEGER,
  next_run_label TEXT,
  job_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS scheduled_payout_job_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL,
  payout_run_id INTEGER,
  run_notes TEXT,
  run_status TEXT NOT NULL DEFAULT 'processed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed scheduled jobs
jobs = [
    ("Weekly Heirs Scheduled Payout", "weekly", "all_heirs", None, "next_week"),
    ("Monthly Heirs Scheduled Payout", "monthly", "all_heirs", None, "next_month"),
]
for job_name, cycle_type, target_type, target_id, next_run_label in jobs:
    exists = cur.execute("""
        SELECT 1 FROM scheduled_payout_jobs
        WHERE job_name=? LIMIT 1
    """, (job_name,)).fetchone()
    if not exists:
        cur.execute("""
        INSERT INTO scheduled_payout_jobs
        (job_name, cycle_type, target_type, target_id, next_run_label, job_status)
        VALUES (?, ?, ?, ?, ?, 'active')
        """, (job_name, cycle_type, target_type, target_id, next_run_label))

# seed storefront analytics if missing
ownership_rows = cur.execute("""
SELECT heir_id, storefront_name
FROM heir_storefront_ownership
ORDER BY id ASC
""").fetchall()

seed_metrics = {
    "Anyone Can Be a Star": (4200, 38, 325000),
    "Aniyah Singing Coach": (3100, 24, 215000),
    "Jacobie Vision": (1800, 11, 450000),
    "Alton Security": (1600, 9, 390000),
}

for heir_id, storefront_name in ownership_rows:
    exists = cur.execute("""
        SELECT 1 FROM storefront_analytics
        WHERE heir_id=? AND storefront_name=?
        LIMIT 1
    """, (heir_id, storefront_name)).fetchone()
    if not exists:
        views, orders, revenue = seed_metrics.get(storefront_name, (900, 4, 75000))
        cur.execute("""
        INSERT INTO storefront_analytics
        (heir_id, storefront_name, views_count, orders_count, revenue_cents, analytics_status)
        VALUES (?, ?, ?, ?, ?, 'active')
        """, (heir_id, storefront_name, views, orders, revenue))

# refresh one new balance snapshot per heir
heirs = cur.execute("SELECT id FROM heirs_registry ORDER BY id").fetchall()
for (heir_id,) in heirs:
    total_earnings = cur.execute("""
        SELECT IFNULL(SUM(amount_cents),0) FROM heir_earnings WHERE heir_id=?
    """, (heir_id,)).fetchone()[0] or 0

    total_wallet_mirror = cur.execute("""
        SELECT IFNULL(SUM(amount_cents),0) FROM heir_wallet_mirror_tx WHERE heir_id=?
    """, (heir_id,)).fetchone()[0] or 0

    total_payout = cur.execute("""
        SELECT IFNULL(SUM(payout_amount_cents),0) FROM heir_payout_items WHERE heir_id=?
    """, (heir_id,)).fetchone()[0] or 0

    balance = int(total_earnings) + int(total_wallet_mirror)

    cur.execute("""
    INSERT INTO heir_balance_snapshots
    (heir_id, total_earnings_cents, total_wallet_mirror_cents, total_payout_cents, balance_cents, snapshot_status)
    VALUES (?, ?, ?, ?, ?, 'active')
    """, (heir_id, total_earnings, total_wallet_mirror, total_payout, balance))

conn.commit()
conn.close()
print("[OK] finance analytics DB verified and refreshed")
PYEOF

########################################
# 2) PATCH DASHBOARD WITH EXECUTIVE LAYER
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r'''
function renderExecutiveDashboardPage(user = null, message = '') {
  const heirCount = dbQuery(`SELECT count(*) as c FROM heirs_registry`)[0]?.c || 0;
  const payoutRuns = dbQuery(`SELECT count(*) as c FROM heir_payout_runs`)[0]?.c || 0;
  const payoutItems = dbQuery(`SELECT count(*) as c FROM heir_payout_items`)[0]?.c || 0;
  const analyticsCount = dbQuery(`SELECT count(*) as c FROM storefront_analytics`)[0]?.c || 0;
  const scheduleJobs = dbQuery(`SELECT count(*) as c FROM scheduled_payout_jobs`)[0]?.c || 0;
  const scheduleRuns = dbQuery(`SELECT count(*) as c FROM scheduled_payout_job_runs`)[0]?.c || 0;

  const totals = dbQuery(`
    SELECT
      IFNULL(SUM(total_earnings_cents),0) as earnings,
      IFNULL(SUM(total_wallet_mirror_cents),0) as wallet_mirror,
      IFNULL(SUM(total_payout_cents),0) as payouts,
      IFNULL(SUM(balance_cents),0) as balances
    FROM (
      SELECT *
      FROM heir_balance_snapshots
      WHERE id IN (SELECT MAX(id) FROM heir_balance_snapshots GROUP BY heir_id)
    )
  `)[0] || {};

  const topStorefronts = dbQuery(`
    SELECT storefront_name, views_count, orders_count, revenue_cents
    FROM storefront_analytics
    ORDER BY revenue_cents DESC, orders_count DESC
    LIMIT 8
  `);

  const topHeirs = dbQuery(`
    SELECT hr.id, hr.name, hbs.balance_cents
    FROM heir_balance_snapshots hbs
    LEFT JOIN heirs_registry hr ON hr.id = hbs.heir_id
    WHERE hbs.id IN (SELECT MAX(id) FROM heir_balance_snapshots GROUP BY heir_id)
    ORDER BY hbs.balance_cents DESC
    LIMIT 8
  `);

  const storefrontRows = topStorefronts.map(r => `
    <tr>
      <td>${r.storefront_name || ''}</td>
      <td>${r.views_count || 0}</td>
      <td>${r.orders_count || 0}</td>
      <td>$${((Number(r.revenue_cents || 0))/100).toFixed(2)}</td>
    </tr>
  `).join('');

  const heirRows = topHeirs.map(r => `
    <tr>
      <td><a href="/heir-finance/${r.id}">${r.name || ''}</a></td>
      <td>$${((Number(r.balance_cents || 0))/100).toFixed(2)}</td>
    </tr>
  `).join('');

  return htmlPage('Executive Dashboard', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Executive Command</div>
          <h1>Executive Dashboard</h1>
          <p>High-level financial, payout, heir, and storefront intelligence across the platform.</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>

        <div class="stats-grid">
          ${typeof statCard === 'function' ? statCard('Heirs', heirCount) : ''}
          ${typeof statCard === 'function' ? statCard('Payout Runs', payoutRuns) : ''}
          ${typeof statCard === 'function' ? statCard('Payout Items', payoutItems) : ''}
          ${typeof statCard === 'function' ? statCard('Analytics Rows', analyticsCount) : ''}
          ${typeof statCard === 'function' ? statCard('Schedule Jobs', scheduleJobs) : ''}
          ${typeof statCard === 'function' ? statCard('Schedule Runs', scheduleRuns) : ''}
          ${typeof statCard === 'function' ? statCard('Total Earnings', '$' + ((Number(totals.earnings || 0))/100).toFixed(2)) : ''}
          ${typeof statCard === 'function' ? statCard('Total Balances', '$' + ((Number(totals.balances || 0))/100).toFixed(2)) : ''}
        </div>

        <section class="clean-section">
          <div class="section-body">
            <div class="feature-grid">
              <div class="feature-card">
                <h3>Refresh Balance Snapshots</h3>
                <p>Create fresh heir balance snapshots from earnings, payouts, and wallet mirror activity.</p>
                <form method="POST" action="/executive/refresh-balances">
                  <button type="submit">Refresh Balances</button>
                </form>
              </div>

              <div class="feature-card">
                <h3>Open Heir Finance</h3>
                <p>Review the finance layer and per-heir balance details.</p>
                <a href="/heir-finance" class="feature-link">Open Heir Finance</a>
              </div>

              <div class="feature-card">
                <h3>Open Analytics</h3>
                <p>Review storefront performance visibility.</p>
                <a href="/storefront-analytics" class="feature-link">Open Analytics</a>
              </div>

              <div class="feature-card">
                <h3>Open Scheduled Jobs</h3>
                <p>Review scheduled payout job records and runs.</p>
                <a href="/scheduled-payout-jobs" class="feature-link">Open Scheduled Jobs</a>
              </div>
            </div>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Top Storefronts</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>Storefront</th><th>Views</th><th>Orders</th><th>Revenue</th></tr></thead>
              <tbody>${storefrontRows || '<tr><td colspan="4">No storefront analytics yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Top Heir Balances</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>Heir</th><th>Balance</th></tr></thead>
              <tbody>${heirRows || '<tr><td colspan="2">No heir balances yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `, user);
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function renderExecutiveDashboardPage(user = null, message = '')" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

if '<a href="/executive-dashboard">Executive</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/heir-payouts">Payouts</a>',
        '<a href="/heir-payouts">Payouts</a>\n          <a href="/executive-dashboard">Executive</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/heir-finance') {"
if "pathname === '/executive-dashboard'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/executive-dashboard') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderExecutiveDashboardPage(session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'POST' && pathname === '/executive/refresh-balances') {
      const heirs = dbQuery(`SELECT id FROM heirs_registry ORDER BY id`);

      for (const h of heirs) {
        const heirId = Number(h.id);

        const earnings = dbQuery(`SELECT IFNULL(SUM(amount_cents),0) as c FROM heir_earnings WHERE heir_id=${heirId}`)[0]?.c || 0;
        const mirrors = dbQuery(`SELECT IFNULL(SUM(amount_cents),0) as c FROM heir_wallet_mirror_tx WHERE heir_id=${heirId}`)[0]?.c || 0;
        const payouts = dbQuery(`SELECT IFNULL(SUM(payout_amount_cents),0) as c FROM heir_payout_items WHERE heir_id=${heirId}`)[0]?.c || 0;
        const balance = Number(earnings) + Number(mirrors);

        dbRun(`INSERT INTO heir_balance_snapshots
          (heir_id, total_earnings_cents, total_wallet_mirror_cents, total_payout_cents, balance_cents, snapshot_status)
          VALUES (${heirId}, ${Number(earnings)}, ${Number(mirrors)}, ${Number(payouts)}, ${Number(balance)}, 'active')`);
      }

      return redirect(res, '/executive-dashboard?msg=Balances%20refreshed');
    }

    if (req.method === 'GET' && pathname === '/heir-finance') {"""
    text = text.replace(anchor, routes, 1)

p.write_text(text)
print("[OK] executive dashboard patch applied")
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

cp apps/dashboard.js "backups/dashboard_executive_finance_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_executive_finance_${STAMP}.js"
cp db/aam.db "backups/aam_executive_finance_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as heir_balance_snapshots from heir_balance_snapshots;" > "snapshots/heir_balance_snapshots_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as storefront_analytics from storefront_analytics;" > "snapshots/storefront_analytics_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scheduled_payout_jobs from scheduled_payout_jobs;" > "snapshots/scheduled_payout_jobs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scheduled_payout_job_runs from scheduled_payout_job_runs;" > "snapshots/scheduled_payout_job_runs_${STAMP}.json"

cat > "reports/executive_finance_command_${STAMP}.txt" <<REPORT
EXECUTIVE FINANCE COMMAND BASH REPORT
Timestamp: ${STAMP}

Added or verified:
- heir_balance_snapshots
- storefront_analytics
- scheduled_payout_jobs
- scheduled_payout_job_runs
- /executive-dashboard
- balance refresh action

Finance routes:
- /heir-finance
- /heir-finance/:id
- /storefront-analytics
- /scheduled-payout-jobs
- /executive-dashboard
REPORT

echo "EXECUTIVE FINANCE COMMAND BASH COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/executive-dashboard"
echo "  termux-open-url http://127.0.0.1:4900/heir-finance"
echo "  termux-open-url http://127.0.0.1:4900/storefront-analytics"
echo "  termux-open-url http://127.0.0.1:4900/scheduled-payout-jobs"
