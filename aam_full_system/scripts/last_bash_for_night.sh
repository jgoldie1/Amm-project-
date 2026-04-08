#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== LAST BASH FOR NIGHT START ==="

########################################
# 1) DB HARDENING / GAP FIXES
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

def cols(table):
    return [r[1] for r in cur.execute(f"PRAGMA table_info({table})").fetchall()]

def ensure_column(table, col_name, ddl):
    if col_name not in cols(table):
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {ddl}")
        print(f"[OK] Added column {table}.{col_name}")

# Existing / earlier gaps
ensure_column("credit_letters", "recipient", "recipient TEXT")
ensure_column("credit_letters", "letter_body", "letter_body TEXT")
ensure_column("credit_letters", "sent_status", "sent_status TEXT DEFAULT 'draft'")

# Compliance / legal copilot layer
cur.execute("""
CREATE TABLE IF NOT EXISTS compliance_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL,
    template_body TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS escalation_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type TEXT NOT NULL,
    source_id INTEGER NOT NULL,
    escalation_reason TEXT NOT NULL,
    escalation_status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS compliance_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    subject_type TEXT NOT NULL,
    subject_id INTEGER NOT NULL,
    event_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# Seed templates safely
templates = [
    (
        "Credit Repair Disclosure",
        "credit_repair",
        "We assist with dispute preparation, workflow tracking, documentation support, and education. Results are not guaranteed. Accurate and timely negative information may remain."
    ),
    (
        "Marketplace Service Disclaimer",
        "marketplace",
        "Services are provided subject to platform policies, verification, and availability. Payments, refunds, and disputes follow recorded service workflows."
    ),
    (
        "AI Legal Compliance Copilot Notice",
        "compliance",
        "This system assists with issue spotting, templates, workflow, and compliance operations. It is not a substitute for a licensed attorney where legal advice or representation is required."
    )
]

for name, ttype, body in templates:
    cur.execute("SELECT 1 FROM compliance_templates WHERE template_name = ?", (name,))
    if not cur.fetchone():
        cur.execute(
            "INSERT INTO compliance_templates (template_name, template_type, template_body) VALUES (?, ?, ?)",
            (name, ttype, body)
        )

conn.commit()
conn.close()
print("[OK] DB hardening complete")
PYEOF

########################################
# 2) PATCH DASHBOARD.JS
########################################
python << 'PYEOF'
from pathlib import Path
import re

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

def insert_before(marker: str, block: str):
    global text
    if block.strip() not in text and marker in text:
        text = text.replace(marker, block + "\n" + marker)

def replace_once(old: str, new: str):
    global text
    if old in text:
        text = text.replace(old, new, 1)
        return True
    return False

# -------------------------------------------------
# NAV LINKS
# -------------------------------------------------
if '<a href="/audit-logs">Audit Logs</a>' not in text and '<a href="/credit-repair">Credit Repair</a>' in text:
    text = text.replace(
        '<a href="/credit-repair">Credit Repair</a>',
        '<a href="/credit-repair">Credit Repair</a>\n      <a href="/audit-logs">Audit Logs</a>\n      <a href="/letters">Letters</a>\n      <a href="/compliance">Compliance</a>'
    )

# -------------------------------------------------
# CORE HELPERS / VIEW PAGES
# -------------------------------------------------
helpers_block = r'''
function renderAuditLogsPage(user = null) {
  const rows = dbQuery("SELECT id, action, entity_type, entity_id, meta, created_at FROM audit_logs ORDER BY id DESC LIMIT 100");

  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.action || ''}</td>
      <td>${r.entity_type || ''}</td>
      <td>${r.entity_id || ''}</td>
      <td>${r.meta || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Audit Logs', `
    <div class="section">
      <div class="card">
        <h2>Audit Logs</h2>
        <p>System activity ledger for letters, cases, payments, uploads, and workflow actions.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Action</th><th>Entity</th><th>Entity ID</th><th>Meta</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="6">No audit logs yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderLettersPage(user = null) {
  const rows = dbQuery(`
    SELECT id, case_id, letter_type, recipient, sent_status, created_at
    FROM credit_letters
    ORDER BY id DESC
    LIMIT 100
  `);

  const tableRows = rows.map(r => `
    <tr>
      <td><a href="/letters/${r.id}">${r.id}</a></td>
      <td>${r.case_id || ''}</td>
      <td>${r.letter_type || ''}</td>
      <td>${r.recipient || ''}</td>
      <td>${r.sent_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Letters', `
    <div class="section">
      <div class="card">
        <h2>Generated Letters</h2>
        <p>AI-generated and manually managed dispute / compliance letters.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Case</th><th>Type</th><th>Recipient</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="6">No letters yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderLetterDetail(letterId, user = null) {
  const rows = dbQuery(`
    SELECT id, case_id, letter_type, recipient, letter_body, sent_status, created_at
    FROM credit_letters
    WHERE id = ${Number(letterId)}
    LIMIT 1
  `);

  if (!rows.length) {
    return htmlPage('Not Found', `<div class="card"><h2>Letter not found</h2></div>`, user);
  }

  const l = rows[0];

  return htmlPage('Letter Viewer', `
    <div class="section">
      <div class="card">
        <h2>Letter #${l.id}</h2>
        <p><strong>Case:</strong> ${l.case_id || ''}</p>
        <p><strong>Type:</strong> ${l.letter_type || ''}</p>
        <p><strong>Recipient:</strong> ${l.recipient || ''}</p>
        <p><strong>Status:</strong> ${l.sent_status || ''}</p>
        <p class="muted"><strong>Created:</strong> ${l.created_at || ''}</p>
        <pre>${l.letter_body || ''}</pre>
      </div>
    </div>
  `, user);
}

function renderCompliancePage(user = null, message = '') {
  const templates = dbQuery("SELECT id, template_name, template_type, created_at FROM compliance_templates ORDER BY id DESC");
  const escalations = dbQuery("SELECT id, source_type, source_id, escalation_reason, escalation_status, created_at FROM escalation_queue ORDER BY id DESC LIMIT 50");
  const events = dbQuery("SELECT id, event_type, subject_type, subject_id, event_notes, created_at FROM compliance_events ORDER BY id DESC LIMIT 50");

  const templateRows = templates.map(t => `
    <tr>
      <td><a href="/compliance/templates/${t.id}">${t.id}</a></td>
      <td>${t.template_name}</td>
      <td>${t.template_type}</td>
      <td>${t.created_at}</td>
    </tr>
  `).join('');

  const escalationRows = escalations.map(e => `
    <tr>
      <td>${e.id}</td>
      <td>${e.source_type}</td>
      <td>${e.source_id}</td>
      <td>${e.escalation_reason}</td>
      <td>${e.escalation_status}</td>
      <td>${e.created_at}</td>
    </tr>
  `).join('');

  const eventRows = events.map(e => `
    <tr>
      <td>${e.id}</td>
      <td>${e.event_type}</td>
      <td>${e.subject_type}</td>
      <td>${e.subject_id}</td>
      <td>${e.event_notes || ''}</td>
      <td>${e.created_at}</td>
    </tr>
  `).join('');

  return htmlPage('Compliance Copilot', `
    <div class="section">
      <div class="card">
        <h2>AI Legal + Compliance Copilot</h2>
        ${message ? `<p class="ok">${message}</p>` : ''}
        <p>This module supports issue spotting, templates, escalation, disclosures, and compliance workflow tracking across the ecosystem.</p>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Templates</h3>
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Created</th></tr></thead>
            <tbody>${templateRows || '<tr><td colspan="4">No templates yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Escalation Queue</h3>
          <table>
            <thead><tr><th>ID</th><th>Source</th><th>Source ID</th><th>Reason</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${escalationRows || '<tr><td colspan="6">No escalations yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Compliance Events</h3>
          <table>
            <thead><tr><th>ID</th><th>Event</th><th>Subject</th><th>Subject ID</th><th>Notes</th><th>Created</th></tr></thead>
            <tbody>${eventRows || '<tr><td colspan="6">No events yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>
  `, user);
}

function renderComplianceTemplate(templateId, user = null) {
  const rows = dbQuery(`
    SELECT id, template_name, template_type, template_body, created_at
    FROM compliance_templates
    WHERE id = ${Number(templateId)}
    LIMIT 1
  `);

  if (!rows.length) {
    return htmlPage('Not Found', `<div class="card"><h2>Template not found</h2></div>`, user);
  }

  const t = rows[0];

  return htmlPage('Compliance Template', `
    <div class="section">
      <div class="card">
        <h2>${t.template_name}</h2>
        <p><strong>Type:</strong> ${t.template_type}</p>
        <p class="muted"><strong>Created:</strong> ${t.created_at}</p>
        <pre>${t.template_body}</pre>
      </div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", helpers_block)

# -------------------------------------------------
# FIX CREDIT LETTER GENERATOR TO MATCH REAL SCHEMA
# -------------------------------------------------
new_generator = r'''
function generateDisputeLetter(caseId) {
  const c = dbQuery(`SELECT * FROM credit_cases WHERE id=${Number(caseId)} LIMIT 1`)[0];
  if (!c) return "Case not found";

  const body = `
RE: Credit Dispute

Bureau: ${c.bureau}
Disputed Item: ${c.disputed_item}

I am formally disputing the above item and requesting investigation of any inaccurate, incomplete, or unverifiable information under applicable credit reporting law.

Reason:
${c.dispute_reason || ''}

Please investigate and provide the results of your reinvestigation.

Sincerely,
Client
`.trim();

  dbRun(`INSERT INTO credit_letters (case_id, letter_type, recipient, letter_body, sent_status)
         VALUES (${Number(caseId)}, 'AI_DISPUTE', '${q(c.bureau || "Credit Bureau")}', '${q(body)}', 'draft')`);

  logAudit('GENERATE_LETTER', 'credit_case', Number(caseId), 'AI dispute letter generated');
  dbRun(`INSERT INTO compliance_events (event_type, subject_type, subject_id, event_notes)
         VALUES ('LETTER_GENERATED', 'credit_case', ${Number(caseId)}, 'AI dispute letter generated')`);

  return body;
}
'''
text = re.sub(r"function generateDisputeLetter\(caseId\) \{.*?\n\}\n", new_generator + "\n", text, flags=re.S)

# -------------------------------------------------
# IMPROVE CASE PAGE LETTERS / TASKS / DOC LINKS
# -------------------------------------------------
if "Open Letter Viewer" not in text:
    text = text.replace(
        "<ul>${letters.map(l=>`<li>${l.letter_type}</li>`).join('')}</ul>",
        "<ul>${letters.map(l=>`<li><a href=\"/letters/${l.id}\">${l.letter_type}</a> — Open Letter Viewer</li>`).join('')}</ul>"
    )

if "Review Document" not in text:
    text = text.replace(
        "<ul>${docs.map(d=>`<li>${d.doc_name} — ${d.analysis_status}</li>`).join('')}</ul>",
        "<ul>${docs.map(d=>`<li><a href=\"/credit-repair/documents/${d.id}\">${d.doc_name}</a> — ${d.analysis_status} — Review Document</li>`).join('')}</ul>"
    )

# -------------------------------------------------
# ROUTES
# -------------------------------------------------
route_anchor = "    if (req.method === 'GET' && pathname === '/search') {"
if "pathname === '/audit-logs'" not in text and route_anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/audit-logs') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderAuditLogsPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/letters') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderLettersPage(authUser));
    }

    if (req.method === 'GET' && pathname.startsWith('/letters/')) {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      const letterId = Number(pathname.split('/')[2]);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderLetterDetail(letterId, authUser));
    }

    if (req.method === 'GET' && pathname === '/compliance') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderCompliancePage(authUser, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'GET' && pathname.startsWith('/compliance/templates/')) {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      const templateId = Number(pathname.split('/')[3]);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderComplianceTemplate(templateId, authUser));
    }

    if (req.method === 'POST' && pathname.startsWith('/compliance/escalate/')) {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      const parts = pathname.split('/');
      const sourceType = parts[3] || 'unknown';
      const sourceId = Number(parts[4] || 0);
      const body = await parseBody(req);
      const reason = (body.escalation_reason || 'Manual escalation').trim();

      dbRun(`INSERT INTO escalation_queue (source_type, source_id, escalation_reason, escalation_status)
             VALUES ('${q(sourceType)}', ${Number(sourceId)}, '${q(reason)}', 'open')`);

      dbRun(`INSERT INTO compliance_events (event_type, subject_type, subject_id, event_notes)
             VALUES ('ESCALATED', '${q(sourceType)}', ${Number(sourceId)}, '${q(reason)}')`);

      logAudit('ESCALATE', sourceType, Number(sourceId), reason);

      return redirect(res, '/compliance?msg=Escalation%20created');
    }

    if (req.method === 'GET' && pathname === '/search') {"""
    text = text.replace(route_anchor, routes)

p.write_text(text)
print("[OK] dashboard compliance patch applied")
PYEOF

########################################
# 3) RESTART / VERIFY
########################################
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh

########################################
# 4) FINAL CHECKPOINT
########################################
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots

cp apps/dashboard.js "backups/dashboard_compliance_stable_${STAMP}.js"
cp apps/jarvis.js "backups/jarvis_compliance_stable_${STAMP}.js"
cp db/aam.db "backups/aam_compliance_stable_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as audit_logs from audit_logs;" > "snapshots/audit_logs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as credit_letters from credit_letters;" > "snapshots/credit_letters_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as compliance_templates from compliance_templates;" > "snapshots/compliance_templates_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as escalation_queue from escalation_queue;" > "snapshots/escalation_queue_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as compliance_events from compliance_events;" > "snapshots/compliance_events_${STAMP}.json"

echo "LAST BASH FOR NIGHT COMPLETE: $STAMP"
