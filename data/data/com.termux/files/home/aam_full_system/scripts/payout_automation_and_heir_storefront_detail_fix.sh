#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== PAYOUT AUTOMATION + HEIR STOREFRONT DETAIL FIX START ==="

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
CREATE TABLE IF NOT EXISTS payout_automation_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_name TEXT NOT NULL,
  cycle_type TEXT NOT NULL DEFAULT 'weekly',
  target_type TEXT NOT NULL DEFAULT 'all_heirs',
  target_id INTEGER,
  rule_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS payout_automation_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  automation_rule_id INTEGER NOT NULL,
  payout_run_id INTEGER,
  run_status TEXT NOT NULL DEFAULT 'processed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

seed_rules = [
    ("Weekly All Heirs Payout", "weekly", "all_heirs", None),
    ("Monthly All Heirs Payout", "monthly", "all_heirs", None),
]

for rule_name, cycle_type, target_type, target_id in seed_rules:
    exists = cur.execute("""
        SELECT 1 FROM payout_automation_rules
        WHERE rule_name=? LIMIT 1
    """, (rule_name,)).fetchone()
    if not exists:
        cur.execute("""
            INSERT INTO payout_automation_rules
            (rule_name, cycle_type, target_type, target_id, rule_status)
            VALUES (?, ?, ?, ?, 'active')
        """, (rule_name, cycle_type, target_type, target_id))

conn.commit()
conn.close()
print("[OK] payout automation DB verified")
PYEOF

########################################
# 2) PATCH DASHBOARD SAFELY
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r'''
function renderHeirStorefrontDetailPage(heirId, user = null, message = '') {
  const heirRows = dbQuery(`SELECT id, name, role, division FROM heirs_registry WHERE id=${Number(heirId)} LIMIT 1`);
  if (!heirRows.length) {
    return htmlPage('Not Found', `<div class="card"><h2>Heir not found</h2></div>`, user);
  }
  const h = heirRows[0];

  const ownership = dbQuery(`
    SELECT id, storefront_name, ownership_percent, ownership_status, created_at
    FROM heir_storefront_ownership
    WHERE heir_id=${Number(heirId)}
    ORDER BY id DESC
  `);

  const linked = dbQuery(`
    SELECT id, storefront_name, storefront_type, link_status, created_at
    FROM heir_storefront_links
    WHERE heir_id=${Number(heirId)}
    ORDER BY id DESC
  `);

  const ownRows = ownership.map(r => `
    <tr><td>${r.id}</td><td>${r.storefront_name || ''}</td><td>${r.ownership_percent || 0}%</td><td>${r.ownership_status || ''}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const linkRows = linked.map(r => `
    <tr><td>${r.id}</td><td>${r.storefront_name || ''}</td><td>${r.storefront_type || ''}</td><td>${r.link_status || ''}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage(`${h.name} Storefront Detail`, `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Heir Commercial Detail</div>
          <h1>${h.name}</h1>
          <p>${h.role || ''} · ${h.division || ''}</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Storefront Ownership</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Storefront</th><th>Ownership</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${ownRows || '<tr><td colspan="5">No ownership yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Storefront Links</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Storefront</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${linkRows || '<tr><td colspan="5">No linked storefronts yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-body">
            <div class="feature-grid">
              <div class="feature-card">
                <h3>Run Payout For This Heir</h3>
                <p>Trigger a manual payout record using active split rules for this heir.</p>
                <form method="POST" action="/heir-payout-run/${h.id}">
                  <button type="submit">Run Heir Payout</button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `, user);
}

function renderPayoutAutomationPage(user = null, message = '') {
  const rules = dbQuery(`
    SELECT id, rule_name, cycle_type, target_type, target_id, rule_status, created_at
    FROM payout_automation_rules
    ORDER BY id DESC
  `);

  const runs = dbQuery(`
    SELECT par.id, parule.rule_name, par.payout_run_id, par.run_status, par.created_at
    FROM payout_automation_runs par
    LEFT JOIN payout_automation_rules parule ON parule.id = par.automation_rule_id
    ORDER BY par.id DESC
    LIMIT 100
  `);

  const ruleRows = rules.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.rule_name || ''}</td>
      <td>${r.cycle_type || ''}</td>
      <td>${r.target_type || ''}</td>
      <td>${r.rule_status || ''}</td>
      <td>${r.created_at || ''}</td>
      <td>
        <form method="POST" action="/payout-automation/run/${r.id}">
          <button type="submit">Run Automation</button>
        </form>
      </td>
    </tr>
  `).join('');

  const runRows = runs.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.rule_name || ''}</td>
      <td>${r.payout_run_id || ''}</td>
      <td>${r.run_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Payout Automation', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Automation + Scheduling</div>
          <h1>Payout Automation</h1>
          <p>Run and review automated payout operations.</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Automation Rules</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Cycle</th><th>Target</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
              <tbody>${ruleRows || '<tr><td colspan="7">No automation rules yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Automation Runs</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Rule</th><th>Payout Run</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${runRows || '<tr><td colspan="5">No automation runs yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `, user);
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function renderHeirStorefrontDetailPage(heirId, user = null, message = '')" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

if '<a href="/payout-automation">Automation</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/heir-payouts">Payouts</a>',
        '<a href="/heir-payouts">Payouts</a>\n          <a href="/payout-automation">Automation</a>'
    )

if '<a href="/heir-storefronts">Ownership</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/heir-payouts">Payouts</a>',
        '<a href="/heir-payouts">Payouts</a>\n          <a href="/heir-storefronts">Ownership</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/heir-storefronts') {"
if "pathname.startsWith('/heir-storefronts/')" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname.startsWith('/heir-storefronts/')) {
      const session = hardenPublicSession(req);
      const heirId = Number(pathname.split('/')[2]);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHeirStorefrontDetailPage(heirId, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'POST' && pathname.startsWith('/heir-payout-run/')) {
      const heirId = Number(pathname.split('/')[2]);
      const activeRules = dbQuery(`
        SELECT id, revenue_type, split_percent
        FROM heir_revenue_rules
        WHERE heir_id=${heirId} AND rule_status='active'
      `);

      if (!activeRules.length) {
        return redirect(res, `/heir-storefronts/${heirId}?msg=No%20active%20rules`);
      }

      const sourceRevenueCents = 250000;
      dbRun(`INSERT INTO heir_payout_runs (payout_name, source_revenue_cents, payout_status)
             VALUES ('Manual Heir Payout', ${sourceRevenueCents}, 'processed')`);

      const latestRun = dbQuery(`SELECT id FROM heir_payout_runs ORDER BY id DESC LIMIT 1`);
      const payoutRunId = latestRun.length ? Number(latestRun[0].id) : 0;

      for (const r of activeRules) {
        const splitPercent = Number(r.split_percent || 0);
        const payoutAmount = Math.round(sourceRevenueCents * (splitPercent / 100));

        dbRun(`INSERT INTO heir_payout_items
          (payout_run_id, heir_id, revenue_rule_id, source_type, source_amount_cents, split_percent, payout_amount_cents, payout_status)
          VALUES (${payoutRunId}, ${heirId}, ${Number(r.id)}, '${q(r.revenue_type || 'manual_revenue')}', ${sourceRevenueCents}, ${splitPercent}, ${payoutAmount}, 'posted')`);

        dbRun(`INSERT INTO heir_earnings
          (heir_id, earning_type, amount_cents, source_type, source_id, earning_status)
          VALUES (${heirId}, 'manual_payout_distribution', ${payoutAmount}, 'manual_heir_payout', ${payoutRunId}, 'posted')`);

        const walletRow = dbQuery(`SELECT id FROM heir_wallets WHERE heir_id=${heirId} ORDER BY id ASC LIMIT 1`);
        const walletId = walletRow.length ? Number(walletRow[0].id) : 0;

        dbRun(`INSERT INTO heir_wallet_mirror_tx
          (heir_id, heir_wallet_id, payout_item_id, tx_type, amount_cents, tx_status)
          VALUES (${heirId}, ${walletId}, (SELECT id FROM heir_payout_items ORDER BY id DESC LIMIT 1), 'manual_heir_payout', ${payoutAmount}, 'posted')`);
      }

      return redirect(res, `/heir-storefronts/${heirId}?msg=Manual%20heir%20payout%20posted`);
    }

    if (req.method === 'GET' && pathname === '/payout-automation') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPayoutAutomationPage(session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'POST' && pathname.startsWith('/payout-automation/run/')) {
      const ruleId = Number(pathname.split('/')[3]);

      dbRun(`INSERT INTO heir_payout_runs (payout_name, source_revenue_cents, payout_status)
             VALUES ('Automation Payout Run', 500000, 'processed')`);
      const latestRun = dbQuery(`SELECT id FROM heir_payout_runs ORDER BY id DESC LIMIT 1`);
      const payoutRunId = latestRun.length ? Number(latestRun[0].id) : 0;

      dbRun(`INSERT INTO payout_automation_runs (automation_rule_id, payout_run_id, run_status)
             VALUES (${ruleId}, ${payoutRunId}, 'processed')`);

      return redirect(res, `/payout-automation?msg=Automation%20run%20recorded`);
    }

    if (req.method === 'GET' && pathname === '/heir-storefronts') {"""
    text = text.replace(anchor, routes, 1)

old_name_cell = "<td>${r.name || ''}</td>"
new_name_cell = "<td><a href=\"/heir-storefronts/${r.heir_id || ''}\">${r.name || ''}</a></td>"
if old_name_cell in text and new_name_cell not in text:
    text = text.replace(old_name_cell, new_name_cell, 1)

p.write_text(text)
print("[OK] payout automation + storefront detail patch applied")
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

cp apps/dashboard.js "backups/dashboard_payout_automation_fix_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_payout_automation_fix_${STAMP}.js"
cp db/aam.db "backups/aam_payout_automation_fix_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as payout_automation_rules from payout_automation_rules;" > "snapshots/payout_automation_rules_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as payout_automation_runs from payout_automation_runs;" > "snapshots/payout_automation_runs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as heir_storefront_ownership from heir_storefront_ownership;" > "snapshots/heir_storefront_ownership_${STAMP}.json"

cat > "reports/payout_automation_storefront_detail_fix_${STAMP}.txt" <<REPORT
PAYOUT AUTOMATION + HEIR STOREFRONT DETAIL FIX REPORT
Timestamp: ${STAMP}

Added or fixed:
- payout_automation_rules
- payout_automation_runs
- /payout-automation
- /heir-storefronts/:id
- manual heir payout posting
- automation run posting
REPORT

echo "PAYOUT AUTOMATION + HEIR STOREFRONT DETAIL FIX COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/payout-automation"
echo "  termux-open-url http://127.0.0.1:4900/heir-storefronts"
echo "  termux-open-url http://127.0.0.1:4900/heir-storefronts/1"
