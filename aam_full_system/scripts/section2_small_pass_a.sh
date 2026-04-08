#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== SECTION 2 SMALL PASS A START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_section2_small_a_${STAMP}.js"
cp db/aam.db "backups/aam_section2_small_a_${STAMP}.db"

########################################
# 1) TABLES
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS operator_handoff_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handoff_name TEXT NOT NULL,
  request_name TEXT,
  service_name TEXT,
  source_agent TEXT,
  target_operator TEXT,
  handoff_reason TEXT,
  handoff_status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS dispatch_console_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  console_name TEXT NOT NULL,
  service_group TEXT,
  priority_mode TEXT,
  queue_mode TEXT,
  escalation_mode TEXT,
  console_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS dispatch_resolution_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_name TEXT NOT NULL,
  service_name TEXT,
  resolution_type TEXT,
  resolution_notes TEXT,
  resolution_status TEXT DEFAULT 'resolved',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS service_sla_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_name TEXT NOT NULL,
  response_target_minutes INTEGER DEFAULT 15,
  resolution_target_minutes INTEGER DEFAULT 60,
  escalation_trigger_minutes INTEGER DEFAULT 20,
  sla_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS operator_availability_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  operator_name TEXT NOT NULL,
  support_channel TEXT,
  skill_group TEXT,
  availability_mode TEXT,
  availability_status TEXT DEFAULT 'available',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

if cur.execute("SELECT count(*) FROM dispatch_console_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO dispatch_console_registry
        (console_name, service_group, priority_mode, queue_mode, escalation_mode, console_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("Rideshare Dispatch Console", "rideshare", "rush_priority", "nearest_available", "lead_dispatcher", "active"),
        ("Freight Dispatch Console", "freight", "cargo_priority", "capacity_based", "freight_supervisor", "active"),
        ("Pharmacy Dispatch Console", "pharmacy", "compliance_priority", "secure_queue", "compliance_lead", "active"),
    ])

if cur.execute("SELECT count(*) FROM service_sla_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO service_sla_registry
        (service_name, response_target_minutes, resolution_target_minutes, escalation_trigger_minutes, sla_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("rideshare", 3, 20, 5, "active"),
        ("freight", 15, 180, 30, "active"),
        ("pharmacy", 5, 45, 10, "active"),
    ])

if cur.execute("SELECT count(*) FROM operator_availability_registry").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO operator_availability_registry
        (operator_name, support_channel, skill_group, availability_mode, availability_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Dispatch Lead One", "voice+chat", "rideshare", "live", "available"),
        ("Freight Desk Alpha", "voice+email", "freight", "live", "available"),
        ("Pharmacy Support Agent", "voice", "pharmacy", "live", "available"),
    ])

conn.commit()
conn.close()
print("[OK] section 2 small tables ready")
PYEOF

########################################
# 2) PATCH DASHBOARD LIGHTLY
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function esc(v) {
  return String(v || '').replace(/[&<>"']/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[s]));
}
async function readFormBody(req) {
  return await new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const obj = {};
      for (const [k, v] of params.entries()) obj[k] = v;
      resolve(obj);
    });
  });
}
function redirectWithMessage(res, path, msg) {
  res.writeHead(302, { Location: `${path}?msg=${encodeURIComponent(msg)}` });
  return res.end();
}
function renderDispatchActionsPage(req, user = null, message = '') {
  const requests = dbQuery(`SELECT id, requester_name, service_name, request_type, assigned_program, request_status, created_at FROM service_request_log ORDER BY id DESC LIMIT 50`);
  const handoffs = dbQuery(`SELECT id, handoff_name, request_name, service_name, source_agent, target_operator, handoff_reason, handoff_status, created_at FROM operator_handoff_registry ORDER BY id DESC LIMIT 50`);
  const consoles = dbQuery(`SELECT id, console_name, service_group, priority_mode, queue_mode, escalation_mode, console_status, created_at FROM dispatch_console_registry ORDER BY id DESC LIMIT 50`);
  const slas = dbQuery(`SELECT id, service_name, response_target_minutes, resolution_target_minutes, escalation_trigger_minutes, sla_status, created_at FROM service_sla_registry ORDER BY id DESC LIMIT 50`);
  const operators = dbQuery(`SELECT id, operator_name, support_channel, skill_group, availability_mode, availability_status, created_at FROM operator_availability_registry ORDER BY id DESC LIMIT 50`);

  const requestRows = requests.map(r => `<tr><td>${r.id}</td><td>${esc(r.requester_name)}</td><td>${esc(r.service_name)}</td><td>${esc(r.request_type)}</td><td>${esc(r.assigned_program)}</td><td>${esc(r.request_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const handoffRows = handoffs.map(r => `<tr><td>${r.id}</td><td>${esc(r.handoff_name)}</td><td>${esc(r.request_name)}</td><td>${esc(r.service_name)}</td><td>${esc(r.source_agent)}</td><td>${esc(r.target_operator)}</td><td>${esc(r.handoff_reason)}</td><td>${esc(r.handoff_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const consoleRows = consoles.map(r => `<tr><td>${r.id}</td><td>${esc(r.console_name)}</td><td>${esc(r.service_group)}</td><td>${esc(r.priority_mode)}</td><td>${esc(r.queue_mode)}</td><td>${esc(r.escalation_mode)}</td><td>${esc(r.console_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const slaRows = slas.map(r => `<tr><td>${r.id}</td><td>${esc(r.service_name)}</td><td>${esc(r.response_target_minutes)}</td><td>${esc(r.resolution_target_minutes)}</td><td>${esc(r.escalation_trigger_minutes)}</td><td>${esc(r.sla_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');
  const operatorRows = operators.map(r => `<tr><td>${r.id}</td><td>${esc(r.operator_name)}</td><td>${esc(r.support_channel)}</td><td>${esc(r.skill_group)}</td><td>${esc(r.availability_mode)}</td><td>${esc(r.availability_status)}</td><td>${esc(r.created_at)}</td></tr>`).join('');

  return htmlPage('Dispatch Actions', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Dispatch Actions</h1><p>${esc(message || 'Section 2 small pass is live.')}</p></section>

      <section>
        <h2>Create Service Request</h2>
        <form method="POST" action="/dispatch-actions/request-create">
          <input name="requester_name" placeholder="Requester name" required />
          <input name="service_name" placeholder="Service name" required />
          <input name="request_type" placeholder="Request type" required />
          <input name="assigned_program" placeholder="Assigned program" />
          <button type="submit">Create Request</button>
        </form>
      </section>

      <section>
        <h2>AI to Live Operator Handoff</h2>
        <form method="POST" action="/dispatch-actions/handoff">
          <input name="handoff_name" placeholder="Handoff name" required />
          <input name="request_name" placeholder="Request name" required />
          <input name="service_name" placeholder="Service name" required />
          <input name="source_agent" placeholder="Source agent" value="Stubbs AI" />
          <input name="target_operator" placeholder="Target operator" required />
          <input name="handoff_reason" placeholder="Handoff reason" required />
          <button type="submit">Create Handoff</button>
        </form>
      </section>

      <section><h2>Requests</h2><table><thead><tr><th>ID</th><th>Requester</th><th>Service</th><th>Type</th><th>Program</th><th>Status</th><th>Created</th></tr></thead><tbody>${requestRows || '<tr><td colspan="7">No requests</td></tr>'}</tbody></table></section>
      <section><h2>Operator Handoffs</h2><table><thead><tr><th>ID</th><th>Handoff</th><th>Request</th><th>Service</th><th>AI</th><th>Operator</th><th>Reason</th><th>Status</th><th>Created</th></tr></thead><tbody>${handoffRows || '<tr><td colspan="9">No handoffs</td></tr>'}</tbody></table></section>
      <section><h2>Dispatch Consoles</h2><table><thead><tr><th>ID</th><th>Console</th><th>Group</th><th>Priority</th><th>Queue</th><th>Escalation</th><th>Status</th><th>Created</th></tr></thead><tbody>${consoleRows || '<tr><td colspan="8">No consoles</td></tr>'}</tbody></table></section>
      <section><h2>Service SLAs</h2><table><thead><tr><th>ID</th><th>Service</th><th>Response</th><th>Resolution</th><th>Escalation</th><th>Status</th><th>Created</th></tr></thead><tbody>${slaRows || '<tr><td colspan="7">No SLAs</td></tr>'}</tbody></table></section>
      <section><h2>Operator Availability</h2><table><thead><tr><th>ID</th><th>Operator</th><th>Channel</th><th>Skill</th><th>Mode</th><th>Status</th><th>Created</th></tr></thead><tbody>${operatorRows || '<tr><td colspan="7">No operators</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

if "function renderDispatchActionsPage(req, user = null, message = '')" not in text:
    text = text.replace("const server = http.createServer(async (req, res) => {", helper + "\nconst server = http.createServer(async (req, res) => {", 1)

routes = r"""
    if (req.method === 'POST' && pathname === '/dispatch-actions/request-create') {
      const body = await readFormBody(req);
      dbRun(`INSERT INTO service_request_log (requester_name, service_name, request_type, assigned_program, request_status) VALUES (?, ?, ?, ?, 'open')`,
        [body.requester_name || 'Requester', body.service_name || '', body.request_type || '', body.assigned_program || '']);
      return redirectWithMessage(res, '/dispatch-actions', 'Service request created');
    }

    if (req.method === 'POST' && pathname === '/dispatch-actions/handoff') {
      const body = await readFormBody(req);
      dbRun(`INSERT INTO operator_handoff_registry (handoff_name, request_name, service_name, source_agent, target_operator, handoff_reason, handoff_status) VALUES (?, ?, ?, ?, ?, ?, 'completed')`,
        [body.handoff_name || '', body.request_name || '', body.service_name || '', body.source_agent || 'Stubbs AI', body.target_operator || '', body.handoff_reason || '']);
      return redirectWithMessage(res, '/dispatch-actions', 'Operator handoff created');
    }
"""

if "pathname === '/dispatch-actions/request-create'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/dispatch-actions') {"
    if anchor in text:
        text = text.replace(anchor, routes + "\n" + anchor, 1)

p.write_text(text)
print("[OK] section 2 small dispatch patch ready")
PYEOF

########################################
# 3) JS CHECK + RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 4
bash scripts/status.sh || true

########################################
# 4) HEALTH + SMOKE TEST
########################################
curl -s -i http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.txt" || true
curl -s -i http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.txt" || true

for route in \
  /dispatch-actions \
  /ai-call-center \
  /competitive-contact-center \
  /multiservice-dispatch \
  /quantum-mail \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

curl -s -i -X POST -d "requester_name=Smoke Rider&service_name=rideshare&request_type=pickup&assigned_program=Rideshare Dispatch Console" \
  http://127.0.0.1:4900/dispatch-actions/request-create > "test_results/section2_small_post_request_${STAMP}.txt" || true

curl -s -i -X POST -d "handoff_name=AI to Human Smoke Handoff&request_name=Smoke Rider - pickup&service_name=rideshare&source_agent=Stubbs AI&target_operator=Dispatch Lead One&handoff_reason=customer requested live support" \
  http://127.0.0.1:4900/dispatch-actions/handoff > "test_results/section2_small_post_handoff_${STAMP}.txt" || true

########################################
# 5) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as operator_handoff_registry from operator_handoff_registry;" > "snapshots/operator_handoff_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as dispatch_console_registry from dispatch_console_registry;" > "snapshots/dispatch_console_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as dispatch_resolution_registry from dispatch_resolution_registry;" > "snapshots/dispatch_resolution_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as service_sla_registry from service_sla_registry;" > "snapshots/service_sla_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as operator_availability_registry from operator_availability_registry;" > "snapshots/operator_availability_registry_${STAMP}.json"

sqlite3 -json db/aam.db "select id, handoff_name, request_name, service_name, source_agent, target_operator, handoff_reason, handoff_status, created_at from operator_handoff_registry order by id desc limit 20;" > "snapshots/operator_handoff_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, console_name, service_group, priority_mode, queue_mode, escalation_mode, console_status, created_at from dispatch_console_registry order by id desc limit 20;" > "snapshots/dispatch_console_registry_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, operator_name, support_channel, skill_group, availability_mode, availability_status, created_at from operator_availability_registry order by id desc limit 20;" > "snapshots/operator_availability_registry_tail_${STAMP}.json"

########################################
# 6) ERROR SCAN
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "cannot get" in txt or "not found" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
    if "dashboard_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "dashboard_health_unexpected"})
    if "jarvis_health" in f.name and '"ok": true' not in txt:
        issues.append({"file": f.name, "problem": "jarvis_health_unexpected"})

latest = Path.home() / "aam_full_system" / "snapshots" / "section2_small_pass_a_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] section 2 small pass A scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) REPORT
########################################
cat > "reports/section2_small_pass_a_${STAMP}.txt" <<REPORT
SECTION 2 SMALL PASS A REPORT
Timestamp: ${STAMP}

Added:
- operator handoff registry
- dispatch console registry
- dispatch resolution registry
- service SLA registry
- operator availability registry

Upgraded:
- Dispatch Actions page
- request create action
- AI to live operator handoff action

Purpose:
- create a smaller stable section 2 base
- avoid cut-off patch failures
- stabilize and smoke test before section 2 pass B
REPORT

echo "SECTION 2 SMALL PASS A COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/section2_small_pass_a_scan_latest.json"
echo "  cat snapshots/operator_handoff_registry_tail_${STAMP}.json"
echo "  cat reports/section2_small_pass_a_${STAMP}.txt"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/dispatch-actions"
echo "  termux-open-url http://127.0.0.1:4900/ai-call-center"
echo "  termux-open-url http://127.0.0.1:4900/competitive-contact-center"
