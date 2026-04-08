#!/data/data/com.termux/files/usr/bin/bash

cd ~/aam_full_system

echo "=== NEXT LEVEL BUILD START ==="

########################################
# 1. ADD AUDIT LOG TABLE
########################################
sqlite3 db/aam.db "
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT,
  entity_type TEXT,
  entity_id INTEGER,
  meta TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
"

echo "[OK] audit_logs table ready"

########################################
# 2. PATCH DASHBOARD (CORE FEATURES)
########################################

python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

def insert_block(marker, block):
    global text
    if block.strip() not in text and marker in text:
        text = text.replace(marker, block + "\n" + marker)

########################################
# AUDIT LOGGER FUNCTION
########################################
audit_fn = r'''
function logAudit(action, entityType, entityId, meta = '') {
  dbRun(`INSERT INTO audit_logs (action, entity_type, entity_id, meta)
         VALUES ('${q(action)}','${q(entityType)}',${Number(entityId)||0},'${q(meta)}')`);
}
'''

insert_block("const server = http.createServer", audit_fn)

########################################
# CREDIT CASE DETAIL PAGE
########################################
case_page = r'''
function renderCreditCaseDetail(caseId, user=null) {
  const c = dbQuery(`SELECT * FROM credit_cases WHERE id=${Number(caseId)} LIMIT 1`)[0];
  if (!c) return htmlPage('Not Found', '<div class="card">Case not found</div>', user);

  const docs = dbQuery(`SELECT id,doc_name,analysis_status FROM credit_documents WHERE case_id=${caseId}`);
  const tasks = dbQuery(`SELECT id,task_title,task_status FROM credit_tasks WHERE case_id=${caseId}`);
  const letters = dbQuery(`SELECT id,letter_type FROM credit_letters WHERE case_id=${caseId}`);

  return htmlPage('Credit Case', `
    <div class="section">
      <div class="card">
        <h2>Case #${c.id}</h2>
        <p><strong>Bureau:</strong> ${c.bureau}</p>
        <p><strong>Item:</strong> ${c.disputed_item}</p>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Documents</h3>
        <ul>${docs.map(d=>`<li>${d.doc_name} — ${d.analysis_status}</li>`).join('')}</ul>
      </div>

      <div class="card">
        <h3>Tasks</h3>
        <ul>${tasks.map(t=>`<li>${t.task_title} — ${t.task_status}</li>`).join('')}</ul>
      </div>

      <div class="card">
        <h3>Letters</h3>
        <ul>${letters.map(l=>`<li>${l.letter_type}</li>`).join('')}</ul>
        <form method="POST" action="/credit-repair/generate-letter/${c.id}">
          <button type="submit">Generate AI Dispute Letter</button>
        </form>
      </div>
    </div>
  `, user);
}
'''

insert_block("const server = http.createServer", case_page)

########################################
# AI LETTER GENERATOR
########################################
ai_letter = r'''
function generateDisputeLetter(caseId) {
  const c = dbQuery(`SELECT * FROM credit_cases WHERE id=${caseId}`)[0];
  if (!c) return "Case not found";

  const text = `
RE: Credit Dispute

Bureau: ${c.bureau}
Item: ${c.disputed_item}

I am formally disputing the above item under FCRA.
Please investigate and remove any inaccurate or unverifiable information.

Sincerely,
Client
`;

  dbRun(`INSERT INTO credit_letters (case_id, letter_type, content)
         VALUES (${caseId}, 'AI_DISPUTE', '${q(text)}')`);

  logAudit('GENERATE_LETTER','credit_case',caseId,'AI letter generated');

  return text;
}
'''

insert_block("const server = http.createServer", ai_letter)

########################################
# BRANCH DASHBOARD
########################################
branch_dash = r'''
function renderBranchDashboard(personId) {
  const p = dbQuery(`SELECT * FROM people WHERE id=${personId}`)[0];
  const biz = dbQuery(`SELECT name FROM businesses WHERE person_id=${personId}`);

  return htmlPage('Branch Dashboard', `
    <div class="section">
      <div class="card">
        <h2>${p.name}</h2>
        <p>${p.role}</p>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Businesses</h3>
        <ul>${biz.map(b=>`<li>${b.name}</li>`).join('')}</ul>
      </div>
    </div>
  `);
}
'''

insert_block("const server = http.createServer", branch_dash)

########################################
# ROUTES
########################################
routes = r'''
    if (req.method === 'GET' && pathname.startsWith('/credit-case/')) {
      const id = Number(pathname.split('/')[2]);
      res.writeHead(200, {'Content-Type':'text/html'});
      return res.end(renderCreditCaseDetail(id));
    }

    if (req.method === 'POST' && pathname.startsWith('/credit-repair/generate-letter/')) {
      const id = Number(pathname.split('/')[3]);
      generateDisputeLetter(id);
      return redirect(res, `/credit-case/${id}`);
    }

    if (req.method === 'GET' && pathname.startsWith('/branch/')) {
      const id = Number(pathname.split('/')[2]);
      res.writeHead(200, {'Content-Type':'text/html'});
      return res.end(renderBranchDashboard(id));
    }
'''

insert_block("if (req.method === 'GET' && pathname === '/'", routes)

p.write_text(text)
print("[OK] dashboard upgraded")

PYEOF

########################################
# 3. RESTART SYSTEM
########################################
bash scripts/safe_restart.sh
bash scripts/check_js.sh

echo "=== NEXT LEVEL BUILD COMPLETE ==="
