#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== TRANSACTION ENGINE + AUTO PAYOUTS + SCALING + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_transaction_engine_${STAMP}.js"
cp db/aam.db "backups/aam_transaction_engine_${STAMP}.db"

########################################
# 2) DATABASE SUPPORT
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS transaction_engine (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_ref TEXT,
  username TEXT,
  creator_name TEXT,
  item_name TEXT,
  gross_amount_cents INTEGER DEFAULT 0,
  platform_fee_cents INTEGER DEFAULT 0,
  seller_net_cents INTEGER DEFAULT 0,
  transaction_status TEXT DEFAULT 'completed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS payout_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_name TEXT,
  source_transaction_id INTEGER,
  payout_amount_cents INTEGER DEFAULT 0,
  payout_method TEXT DEFAULT 'platform_wallet',
  payout_status TEXT DEFAULT 'queued',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS payout_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payout_run_name TEXT,
  total_payouts INTEGER DEFAULT 0,
  total_amount_cents INTEGER DEFAULT 0,
  run_status TEXT DEFAULT 'completed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS scaling_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT,
  metric_value INTEGER DEFAULT 0,
  metric_scope TEXT DEFAULT 'global',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

if cur.execute("SELECT count(*) FROM transaction_engine").fetchone()[0] == 0:
    rows = [
        ("tx_demo_001", "Jacobie", "Aniyah", "Avatar Creator Neon Set", 4200, 840, 3360, "completed"),
        ("tx_demo_002", "Isaiah", "Jacobie", "Luxury Sky Condo Furnishing Pack", 8500, 1700, 6800, "completed"),
        ("tx_demo_003", "Guest Explorer", "Isaiah", "City Billboard Branding Pack", 12000, 2400, 9600, "completed"),
    ]
    cur.executemany("""
        INSERT INTO transaction_engine
        (transaction_ref, username, creator_name, item_name, gross_amount_cents, platform_fee_cents, seller_net_cents, transaction_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM payout_queue").fetchone()[0] == 0:
    tx_rows = cur.execute("""
        SELECT id, creator_name, seller_net_cents
        FROM transaction_engine
        ORDER BY id
    """).fetchall()
    for tx_id, creator_name, seller_net_cents in tx_rows:
        cur.execute("""
            INSERT INTO payout_queue
            (creator_name, source_transaction_id, payout_amount_cents, payout_method, payout_status)
            VALUES (?, ?, ?, 'platform_wallet', 'queued')
        """, (creator_name, tx_id, seller_net_cents))

if cur.execute("SELECT count(*) FROM payout_runs").fetchone()[0] == 0:
    total_payouts = cur.execute("SELECT count(*) FROM payout_queue").fetchone()[0]
    total_amount = cur.execute("SELECT COALESCE(sum(payout_amount_cents),0) FROM payout_queue").fetchone()[0]
    cur.execute("""
        INSERT INTO payout_runs
        (payout_run_name, total_payouts, total_amount_cents, run_status)
        VALUES (?, ?, ?, 'completed')
    """, ("initial_auto_payout_run", total_payouts, total_amount))

cur.execute("DELETE FROM scaling_metrics")

metrics = [
    ("total_transactions", cur.execute("SELECT count(*) FROM transaction_engine").fetchone()[0], "global"),
    ("total_payout_queue", cur.execute("SELECT count(*) FROM payout_queue").fetchone()[0], "global"),
    ("total_payout_runs", cur.execute("SELECT count(*) FROM payout_runs").fetchone()[0], "global"),
    ("total_platform_fee_cents", cur.execute("SELECT COALESCE(sum(platform_fee_cents),0) FROM transaction_engine").fetchone()[0], "global"),
    ("total_creator_payout_cents", cur.execute("SELECT COALESCE(sum(seller_net_cents),0) FROM transaction_engine").fetchone()[0], "global"),
]
cur.executemany("""
    INSERT INTO scaling_metrics
    (metric_name, metric_value, metric_scope)
    VALUES (?, ?, ?)
""", metrics)

conn.commit()
conn.close()
print("[OK] transaction engine + payout + scaling tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper1 = r"""
function renderTransactionEnginePage(req, user = null, message = '') {
  const txs = dbQuery(`
    SELECT id, transaction_ref, username, creator_name, item_name, gross_amount_cents, platform_fee_cents, seller_net_cents, transaction_status, created_at
    FROM transaction_engine
    ORDER BY id DESC
    LIMIT 200
  `);

  const payouts = dbQuery(`
    SELECT id, creator_name, source_transaction_id, payout_amount_cents, payout_method, payout_status, created_at
    FROM payout_queue
    ORDER BY id DESC
    LIMIT 200
  `);

  const runs = dbQuery(`
    SELECT id, payout_run_name, total_payouts, total_amount_cents, run_status, created_at
    FROM payout_runs
    ORDER BY id DESC
    LIMIT 100
  `);

  const txRows = txs.map(r => `<tr><td>${r.id}</td><td>${r.transaction_ref || ''}</td><td>${r.username || ''}</td><td>${r.creator_name || ''}</td><td>${r.item_name || ''}</td><td>${r.gross_amount_cents}</td><td>${r.platform_fee_cents}</td><td>${r.seller_net_cents}</td><td>${r.transaction_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const payoutRows = payouts.map(r => `<tr><td>${r.id}</td><td>${r.creator_name || ''}</td><td>${r.source_transaction_id || ''}</td><td>${r.payout_amount_cents}</td><td>${r.payout_method}</td><td>${r.payout_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const runRows = runs.map(r => `<tr><td>${r.id}</td><td>${r.payout_run_name || ''}</td><td>${r.total_payouts}</td><td>${r.total_amount_cents}</td><td>${r.run_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Transaction Engine', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="transaction-engine-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Money Flow Core</div>
            <h1 id="transaction-engine-title">Transaction Engine</h1>
            <p>Track transactions, payouts, platform fees, and payout runs across the platform.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="Transactions"><thead><tr><th>ID</th><th>Ref</th><th>User</th><th>Creator</th><th>Item</th><th>Gross</th><th>Fee</th><th>Net</th><th>Status</th><th>Created</th></tr></thead><tbody>${txRows || '<tr><td colspan="10">No transactions yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Payout Queue"><thead><tr><th>ID</th><th>Creator</th><th>Tx ID</th><th>Amount</th><th>Method</th><th>Status</th><th>Created</th></tr></thead><tbody>${payoutRows || '<tr><td colspan="7">No payouts yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Payout Runs"><thead><tr><th>ID</th><th>Run</th><th>Total Payouts</th><th>Total Amount</th><th>Status</th><th>Created</th></tr></thead><tbody>${runRows || '<tr><td colspan="6">No payout runs yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

helper2 = r"""
function renderScalingControlPage(req, user = null, message = '') {
  const metrics = dbQuery(`
    SELECT id, metric_name, metric_value, metric_scope, created_at
    FROM scaling_metrics
    ORDER BY id DESC
    LIMIT 200
  `);

  const metricRows = metrics.map(r => `<tr><td>${r.id}</td><td>${r.metric_name}</td><td>${r.metric_value}</td><td>${r.metric_scope}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Scaling Control', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="scaling-control-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Growth Loop Metrics</div>
            <h1 id="scaling-control-title">Scaling Control</h1>
            <p>Track transaction volume, payout volume, fee capture, and system monetization growth signals.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="Scaling Metrics"><thead><tr><th>ID</th><th>Metric</th><th>Value</th><th>Scope</th><th>Created</th></tr></thead><tbody>${metricRows || '<tr><td colspan="5">No scaling metrics yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

if "function renderTransactionEnginePage(req, user = null, message = '')" not in text:
    text = text.replace("const server = http.createServer(async (req, res) => {", helper1 + "\n" + helper2 + "\nconst server = http.createServer(async (req, res) => {", 1)

if '<a href="/transaction-engine">Transactions</a>' not in text and '<a href="/platform-analytics">Analytics</a>' in text:
    text = text.replace(
        '<a href="/platform-analytics">Analytics</a>',
        '<a href="/platform-analytics">Analytics</a>\n          <a href="/transaction-engine">Transactions</a>\n          <a href="/scaling-control">Scaling</a>',
        1
    )

route1 = """
    if (req.method === 'GET' && pathname === '/transaction-engine') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderTransactionEnginePage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

route2 = """
    if (req.method === 'GET' && pathname === '/scaling-control') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderScalingControlPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/transaction-engine'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/platform-analytics') {"
    if anchor in text:
        text = text.replace(anchor, route1 + "\n" + route2 + "\n" + anchor, 1)

p.write_text(text)
print("[OK] transaction engine + scaling routes ready")
PYEOF

########################################
# 4) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true

########################################
# 5) SMOKE TEST
########################################
for route in \
  / \
  /transaction-engine \
  /scaling-control \
  /platform-analytics \
  /holo-gpt-control \
  /revenue-engine \
  /world-selector \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as transaction_engine from transaction_engine;" > "snapshots/transaction_engine_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as payout_queue from payout_queue;" > "snapshots/payout_queue_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as payout_runs from payout_runs;" > "snapshots/payout_runs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as scaling_metrics from scaling_metrics;" > "snapshots/scaling_metrics_${STAMP}.json"

sqlite3 -json db/aam.db "select id, transaction_ref, username, creator_name, item_name, gross_amount_cents, platform_fee_cents, seller_net_cents, transaction_status, created_at from transaction_engine order by id desc limit 20;" > "snapshots/transaction_engine_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, creator_name, source_transaction_id, payout_amount_cents, payout_method, payout_status, created_at from payout_queue order by id desc limit 20;" > "snapshots/payout_queue_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, payout_run_name, total_payouts, total_amount_cents, run_status, created_at from payout_runs order by id desc limit 20;" > "snapshots/payout_runs_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, metric_name, metric_value, metric_scope, created_at from scaling_metrics order by id desc limit 20;" > "snapshots/scaling_metrics_tail_${STAMP}.json"

########################################
# 7) FRESH-ONLY ERROR SCAN
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such table" in lower:
        issues.append({"file": f.name, "problem": "missing_table"})
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "transaction_engine_scaling_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] transaction engine + scaling scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/transaction_engine_auto_payouts_scaling_and_stabilize_${STAMP}.txt" <<REPORT
TRANSACTION ENGINE + AUTO PAYOUTS + SCALING + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- transaction_engine
- payout_queue
- payout_runs
- scaling_metrics
- transaction-engine route
- scaling-control route

Purpose:
- create a real transaction engine
- queue and track creator payouts
- measure monetization growth and scaling signals
- stabilize the money engine foundation
REPORT

echo "TRANSACTION ENGINE + AUTO PAYOUTS + SCALING + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/transaction_engine_scaling_scan_latest.json"
echo "  cat snapshots/scaling_metrics_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/transaction-engine"
echo "  termux-open-url http://127.0.0.1:4900/scaling-control"
echo "  termux-open-url http://127.0.0.1:4900/revenue-engine"
