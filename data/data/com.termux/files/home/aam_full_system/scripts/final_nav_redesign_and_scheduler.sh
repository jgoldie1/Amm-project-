#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINAL NAV REDESIGN + SCHEDULER START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_nav_scheduler_${STAMP}.js"
cp db/aam.db "backups/aam_nav_scheduler_${STAMP}.db"

########################################
# 2) DATABASE CATCH-UP
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS scheduled_payout_execution_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL,
  payout_run_id INTEGER,
  execution_mode TEXT NOT NULL DEFAULT 'manual_trigger',
  execution_notes TEXT,
  execution_status TEXT NOT NULL DEFAULT 'processed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()
conn.close()
print("[OK] scheduler DB catch-up complete")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function compactFeatureCard(title, desc, href, cta = 'Open') {
  return `
    <div class="feature-card compact-card">
      <div class="compact-card-head">
        <h3>${title}</h3>
      </div>
      <p>${desc}</p>
      <a href="${href}" class="feature-link">${cta}</a>
    </div>
  `;
}

function renderSchedulerCommandPage(req, user = null, message = '') {
  const jobs = dbQuery(`
    SELECT id, job_name, cycle_type, target_type, next_run_label, job_status, created_at
    FROM scheduled_payout_jobs
    ORDER BY id DESC
  `);

  const runs = dbQuery(`
    SELECT sel.id, spj.job_name, sel.payout_run_id, sel.execution_mode, sel.execution_notes, sel.execution_status, sel.created_at
    FROM scheduled_payout_execution_log sel
    LEFT JOIN scheduled_payout_jobs spj ON spj.id = sel.job_id
    ORDER BY sel.id DESC
    LIMIT 100
  `);

  const jobRows = jobs.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.job_name || ''}</td>
      <td>${r.cycle_type || ''}</td>
      <td>${r.target_type || ''}</td>
      <td>${r.next_run_label || ''}</td>
      <td>${r.job_status || ''}</td>
      <td>${r.created_at || ''}</td>
      <td>
        <form method="POST" action="/scheduler/run/${r.id}">
          <button type="submit">Run</button>
        </form>
      </td>
    </tr>
  `).join('');

  const runRows = runs.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.job_name || ''}</td>
      <td>${r.payout_run_id || ''}</td>
      <td>${r.execution_mode || ''}</td>
      <td>${r.execution_notes || ''}</td>
      <td>${r.execution_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Scheduler Command', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main cleaner-main">
        <section class="portal-subhero clean-hero">
          <div class="portal-kicker">Automation Operations</div>
          <h1>Scheduler Command</h1>
          <p>Run scheduled payout jobs and review execution history.</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>

        <div class="feature-grid compact-grid">
          ${compactFeatureCard('Executive Dashboard', 'Open high-level platform intelligence and finance command.', '/executive-dashboard')}
          ${compactFeatureCard('Heir Finance', 'Review heir balances and payout-linked finance detail.', '/heir-finance')}
          ${compactFeatureCard('Storefront Analytics', 'Review storefront revenue, orders, and visibility.', '/storefront-analytics')}
          ${compactFeatureCard('Payout Automation', 'Review automation rules and automation runs.', '/payout-automation')}
        </div>

        <section class="clean-section">
          <div class="section-head"><h2>Scheduled Jobs</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Cycle</th><th>Target</th><th>Next Run</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
              <tbody>${jobRows || '<tr><td colspan="8">No jobs yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Execution History</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Job</th><th>Payout Run</th><th>Mode</th><th>Notes</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${runRows || '<tr><td colspan="7">No execution history yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `, user);
}
"""

marker = "const server = http.createServer(async (req, res) => {"
if "function compactFeatureCard(" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

# add scheduler nav link
if '<a href="/scheduler-command">Scheduler</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/scheduled-payout-jobs">Schedules</a>',
        '<a href="/scheduled-payout-jobs">Schedules</a>\n          <a href="/scheduler-command">Scheduler</a>'
    )

# route add
anchor = "    if (req.method === 'GET' && pathname === '/scheduled-payout-jobs') {"
if "pathname === '/scheduler-command'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/scheduler-command') {
      const session = requireHeirRole(req, res, ['security_admin','systems_admin']);
      if (!session) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderSchedulerCommandPage(req, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'POST' && pathname.startsWith('/scheduler/run/')) {
      const session = requireHeirRole(req, res, ['security_admin','systems_admin']);
      if (!session) return;
      const jobId = Number(pathname.split('/')[3]);

      dbRun(`INSERT INTO heir_payout_runs (payout_name, source_revenue_cents, payout_status)
             VALUES ('Scheduled Execution Run', 900000, 'processed')`);
      const latestRun = dbQuery(`SELECT id FROM heir_payout_runs ORDER BY id DESC LIMIT 1`);
      const payoutRunId = latestRun.length ? Number(latestRun[0].id) : 0;

      dbRun(`INSERT INTO scheduled_payout_job_runs (job_id, payout_run_id, run_notes, run_status)
             VALUES (${jobId}, ${payoutRunId}, 'Scheduler command execution', 'processed')`);

      dbRun(`INSERT INTO scheduled_payout_execution_log (job_id, payout_run_id, execution_mode, execution_notes, execution_status)
             VALUES (${jobId}, ${payoutRunId}, 'manual_trigger', 'Scheduler command execution', 'processed')`);

      if (typeof logSecurityEvent === 'function') {
        logSecurityEvent('SCHEDULER_RUN', 'heir_account', Number(session.heir_id), String(jobId));
      }

      return redirect(res, '/scheduler-command?msg=Scheduled%20job%20executed');
    }

    if (req.method === 'GET' && pathname === '/scheduled-payout-jobs') {"""
    text = text.replace(anchor, route, 1)

# small style cleanup hooks
if ".compact-card" not in text and "body {" in text:
    text = text.replace(
        "body {",
        """body {
"""
    )
    css_block = """
.compact-grid { gap: 14px; }
.compact-card { min-height: 160px; border-radius: 18px; }
.compact-card-head { margin-bottom: 8px; }
.cleaner-main { gap: 20px; }
.clean-hero { padding-bottom: 10px; }
.role-nav a { white-space: nowrap; }
"""
    # append css block near style section by inserting before closing </style> if present in template strings
    if "</style>" in text:
        text = text.replace("</style>", css_block + "\n</style>", 1)

p.write_text(text)
print("[OK] final nav redesign + scheduler patch applied")
PYEOF

########################################
# 4) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "snapshots/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "snapshots/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "snapshots/socket_health_${STAMP}.json" || true

curl -s http://127.0.0.1:4900/role-hub > "snapshots/role_hub_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/public-home > "snapshots/public_home_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/scheduler-command > "snapshots/scheduler_command_${STAMP}.html" || true

sqlite3 -json db/aam.db "select count(*) as scheduled_payout_execution_log from scheduled_payout_execution_log;" > "snapshots/scheduled_payout_execution_log_${STAMP}.json"

########################################
# 5) REPORT
########################################
cat > "reports/final_nav_redesign_and_scheduler_${STAMP}.txt" <<REPORT
FINAL NAV REDESIGN + SCHEDULER REPORT
Timestamp: ${STAMP}

Added:
- compact card helper
- scheduler command page
- scheduler execution route
- scheduled_payout_execution_log

Improved:
- cleaner operator navigation
- cleaner dashboard card structure
- more intentional automation workflow

Routes:
- /scheduler-command
- /scheduler/run/:id
REPORT

echo "FINAL NAV REDESIGN + SCHEDULER COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/"
echo "  termux-open-url http://127.0.0.1:4900/role-hub"
echo "  termux-open-url http://127.0.0.1:4900/public-home"
echo "  termux-open-url http://127.0.0.1:4900/scheduler-command"
