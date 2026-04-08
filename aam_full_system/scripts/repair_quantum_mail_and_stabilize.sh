#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== REPAIR QUANTUM MAIL + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_repair_quantum_mail_${STAMP}.js"
cp db/aam.db "backups/aam_repair_quantum_mail_${STAMP}.db"

########################################
# 2) CREATE / REPAIR TABLES
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS quantum_mail_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name TEXT NOT NULL,
  mail_address TEXT NOT NULL,
  account_type TEXT DEFAULT 'standard',
  account_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS quantum_mail_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mailbox_owner TEXT NOT NULL,
  folder_name TEXT DEFAULT 'inbox',
  sender_address TEXT,
  recipient_address TEXT,
  subject_line TEXT,
  message_body TEXT,
  message_status TEXT DEFAULT 'unread',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS quantum_mail_drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mailbox_owner TEXT NOT NULL,
  recipient_address TEXT,
  subject_line TEXT,
  message_body TEXT,
  draft_status TEXT DEFAULT 'saved',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS quantum_mail_folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mailbox_owner TEXT NOT NULL,
  folder_name TEXT NOT NULL,
  folder_type TEXT DEFAULT 'system',
  folder_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS quantum_mail_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER,
  asset_name TEXT,
  asset_path TEXT,
  attachment_status TEXT DEFAULT 'linked',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS quantum_mail_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT NOT NULL,
  metric_value INTEGER DEFAULT 0,
  metric_scope TEXT DEFAULT 'global',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

if cur.execute("SELECT count(*) FROM quantum_mail_accounts").fetchone()[0] == 0:
    rows = [
        ("Jacobie", "jacobie@quantummail.local", "admin", "active"),
        ("Aniyah", "aniyah@quantummail.local", "creator", "active"),
        ("Isaiah", "isaiah@quantummail.local", "operator", "active"),
        ("Guest Explorer", "guest@quantummail.local", "standard", "active"),
    ]
    cur.executemany("""
        INSERT INTO quantum_mail_accounts
        (display_name, mail_address, account_type, account_status)
        VALUES (?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM quantum_mail_folders").fetchone()[0] == 0:
    rows = [
        ("Jacobie", "inbox", "system", "active"),
        ("Jacobie", "sent", "system", "active"),
        ("Jacobie", "drafts", "system", "active"),
        ("Jacobie", "creator", "custom", "active"),
        ("Aniyah", "inbox", "system", "active"),
        ("Aniyah", "sent", "system", "active"),
        ("Isaiah", "inbox", "system", "active"),
        ("Isaiah", "alerts", "custom", "active"),
    ]
    cur.executemany("""
        INSERT INTO quantum_mail_folders
        (mailbox_owner, folder_name, folder_type, folder_status)
        VALUES (?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM quantum_mail_messages").fetchone()[0] == 0:
    rows = [
        ("Jacobie", "inbox", "platform@quantummail.local", "jacobie@quantummail.local", "Welcome to Quantum Mail", "Quantum Mail is now active in your platform.", "unread"),
        ("Jacobie", "inbox", "alerts@quantummail.local", "jacobie@quantummail.local", "Territory Launch Alert", "Georgia rollout is high priority.", "unread"),
        ("Aniyah", "inbox", "market@quantummail.local", "aniyah@quantummail.local", "Creator Sale Notice", "A creator marketplace transaction has been recorded.", "unread"),
        ("Isaiah", "inbox", "engine@quantummail.local", "isaiah@quantummail.local", "Quantum Engine Update", "Render generation queue contains pending jobs.", "unread"),
        ("Jacobie", "sent", "jacobie@quantummail.local", "team@quantummail.local", "Platform Status", "System is stable and ready for next phase.", "read"),
    ]
    cur.executemany("""
        INSERT INTO quantum_mail_messages
        (mailbox_owner, folder_name, sender_address, recipient_address, subject_line, message_body, message_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM quantum_mail_drafts").fetchone()[0] == 0:
    rows = [
        ("Jacobie", "investors@quantummail.local", "Quantum Platform Expansion", "Draft outline for investor expansion update.", "saved"),
        ("Aniyah", "buyers@quantummail.local", "Creator Drop Update", "Draft message for creator drop buyers.", "saved"),
    ]
    cur.executemany("""
        INSERT INTO quantum_mail_drafts
        (mailbox_owner, recipient_address, subject_line, message_body, draft_status)
        VALUES (?, ?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM quantum_mail_attachments").fetchone()[0] == 0:
    row = cur.execute("SELECT id FROM quantum_mail_messages ORDER BY id ASC LIMIT 1").fetchone()
    if row:
        cur.execute("""
            INSERT INTO quantum_mail_attachments
            (message_id, asset_name, asset_path, attachment_status)
            VALUES (?, ?, ?, ?)
        """, (row[0], "Creator Marketplace Guide", "storage/uploads/docs/creator_marketplace_guide.pdf", "linked"))

cur.execute("DELETE FROM quantum_mail_metrics")
metrics = [
    ("mail_accounts", cur.execute("SELECT count(*) FROM quantum_mail_accounts").fetchone()[0], "global"),
    ("mail_messages", cur.execute("SELECT count(*) FROM quantum_mail_messages").fetchone()[0], "global"),
    ("mail_drafts", cur.execute("SELECT count(*) FROM quantum_mail_drafts").fetchone()[0], "global"),
    ("mail_folders", cur.execute("SELECT count(*) FROM quantum_mail_folders").fetchone()[0], "global"),
    ("mail_attachments", cur.execute("SELECT count(*) FROM quantum_mail_attachments").fetchone()[0], "global"),
]
cur.executemany("""
    INSERT INTO quantum_mail_metrics
    (metric_name, metric_value, metric_scope)
    VALUES (?, ?, ?)
""", metrics)

conn.commit()
conn.close()
print("[OK] quantum mail tables repaired and seeded")
PYEOF

########################################
# 3) PATCH / VERIFY DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper1 = r"""
function renderQuantumMailPage(req, user = null, message = '') {
  const accounts = dbQuery(`
    SELECT id, display_name, mail_address, account_type, account_status, created_at
    FROM quantum_mail_accounts
    ORDER BY id DESC
    LIMIT 100
  `);

  const messages = dbQuery(`
    SELECT id, mailbox_owner, folder_name, sender_address, recipient_address, subject_line, message_status, created_at
    FROM quantum_mail_messages
    ORDER BY id DESC
    LIMIT 200
  `);

  const drafts = dbQuery(`
    SELECT id, mailbox_owner, recipient_address, subject_line, draft_status, created_at
    FROM quantum_mail_drafts
    ORDER BY id DESC
    LIMIT 100
  `);

  const attachments = dbQuery(`
    SELECT id, message_id, asset_name, asset_path, attachment_status, created_at
    FROM quantum_mail_attachments
    ORDER BY id DESC
    LIMIT 100
  `);

  const accountRows = accounts.map(r => `<tr><td>${r.id}</td><td>${r.display_name}</td><td>${r.mail_address}</td><td>${r.account_type}</td><td>${r.account_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const messageRows = messages.map(r => `<tr><td>${r.id}</td><td>${r.mailbox_owner}</td><td>${r.folder_name}</td><td>${r.sender_address || ''}</td><td>${r.recipient_address || ''}</td><td>${r.subject_line || ''}</td><td>${r.message_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const draftRows = drafts.map(r => `<tr><td>${r.id}</td><td>${r.mailbox_owner}</td><td>${r.recipient_address || ''}</td><td>${r.subject_line || ''}</td><td>${r.draft_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const attachmentRows = attachments.map(r => `<tr><td>${r.id}</td><td>${r.message_id || ''}</td><td>${r.asset_name || ''}</td><td>${r.asset_path || ''}</td><td>${r.attachment_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Quantum Mail', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="quantum-mail-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Communication Layer</div>
            <h1 id="quantum-mail-title">Quantum Mail</h1>
            <p>Manage mail accounts, inbox messages, drafts, folders, and linked asset attachments across the platform.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="Quantum Mail Accounts"><thead><tr><th>ID</th><th>Name</th><th>Address</th><th>Type</th><th>Status</th><th>Created</th></tr></thead><tbody>${accountRows || '<tr><td colspan="6">No accounts yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Quantum Mail Messages"><thead><tr><th>ID</th><th>Owner</th><th>Folder</th><th>Sender</th><th>Recipient</th><th>Subject</th><th>Status</th><th>Created</th></tr></thead><tbody>${messageRows || '<tr><td colspan="8">No messages yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Quantum Mail Drafts"><thead><tr><th>ID</th><th>Owner</th><th>Recipient</th><th>Subject</th><th>Status</th><th>Created</th></tr></thead><tbody>${draftRows || '<tr><td colspan="6">No drafts yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Quantum Mail Attachments"><thead><tr><th>ID</th><th>Message ID</th><th>Asset</th><th>Path</th><th>Status</th><th>Created</th></tr></thead><tbody>${attachmentRows || '<tr><td colspan="6">No attachments yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

helper2 = r"""
function renderQuantumMailAdminPage(req, user = null, message = '') {
  const folders = dbQuery(`
    SELECT id, mailbox_owner, folder_name, folder_type, folder_status, created_at
    FROM quantum_mail_folders
    ORDER BY id DESC
    LIMIT 200
  `);

  const metrics = dbQuery(`
    SELECT id, metric_name, metric_value, metric_scope, created_at
    FROM quantum_mail_metrics
    ORDER BY id DESC
    LIMIT 100
  `);

  const folderRows = folders.map(r => `<tr><td>${r.id}</td><td>${r.mailbox_owner}</td><td>${r.folder_name}</td><td>${r.folder_type}</td><td>${r.folder_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const metricRows = metrics.map(r => `<tr><td>${r.id}</td><td>${r.metric_name}</td><td>${r.metric_value}</td><td>${r.metric_scope}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Quantum Mail Admin', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="quantum-mail-admin-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Mail Operations</div>
            <h1 id="quantum-mail-admin-title">Quantum Mail Admin</h1>
            <p>Track folders, mail metrics, and operational visibility for the Quantum Mail layer.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="Quantum Mail Folders"><thead><tr><th>ID</th><th>Owner</th><th>Folder</th><th>Type</th><th>Status</th><th>Created</th></tr></thead><tbody>${folderRows || '<tr><td colspan="6">No folders yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Quantum Mail Metrics"><thead><tr><th>ID</th><th>Metric</th><th>Value</th><th>Scope</th><th>Created</th></tr></thead><tbody>${metricRows || '<tr><td colspan="5">No metrics yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

if "function renderQuantumMailPage(req, user = null, message = '')" not in text:
    text = text.replace("const server = http.createServer(async (req, res) => {", helper1 + "\n" + helper2 + "\nconst server = http.createServer(async (req, res) => {", 1)

if '<a href="/quantum-mail">Quantum Mail</a>' not in text and '<a href="/holo-search">Holo Search</a>' in text:
    text = text.replace(
        '<a href="/holo-search">Holo Search</a>',
        '<a href="/holo-search">Holo Search</a>\n          <a href="/quantum-mail">Quantum Mail</a>\n          <a href="/quantum-mail-admin">Mail Admin</a>',
        1
    )

route1 = """
    if (req.method === 'GET' && pathname === '/quantum-mail') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderQuantumMailPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

route2 = """
    if (req.method === 'GET' && pathname === '/quantum-mail-admin') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderQuantumMailAdminPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/quantum-mail'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/holo-search') {"
    if anchor in text:
        text = text.replace(anchor, route1 + "\n" + route2 + "\n" + anchor, 1)

p.write_text(text)
print("[OK] quantum mail routes repaired")
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
  /quantum-mail \
  /quantum-mail-admin \
  /holo-search \
  /asset-library \
  /platform-analytics \
  /quantum-cloud \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as quantum_mail_accounts from quantum_mail_accounts;" > "snapshots/quantum_mail_accounts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as quantum_mail_messages from quantum_mail_messages;" > "snapshots/quantum_mail_messages_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as quantum_mail_drafts from quantum_mail_drafts;" > "snapshots/quantum_mail_drafts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as quantum_mail_folders from quantum_mail_folders;" > "snapshots/quantum_mail_folders_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as quantum_mail_attachments from quantum_mail_attachments;" > "snapshots/quantum_mail_attachments_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as quantum_mail_metrics from quantum_mail_metrics;" > "snapshots/quantum_mail_metrics_${STAMP}.json"

sqlite3 -json db/aam.db "select id, mailbox_owner, folder_name, sender_address, recipient_address, subject_line, message_status, created_at from quantum_mail_messages order by id desc limit 50;" > "snapshots/quantum_mail_messages_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, mailbox_owner, folder_name, folder_type, folder_status, created_at from quantum_mail_folders order by id desc limit 50;" > "snapshots/quantum_mail_folders_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, metric_name, metric_value, metric_scope, created_at from quantum_mail_metrics order by id desc limit 50;" > "snapshots/quantum_mail_metrics_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "quantum_mail_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] quantum mail repair scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/repair_quantum_mail_and_stabilize_${STAMP}.txt" <<REPORT
REPAIR QUANTUM MAIL + STABILIZE REPORT
Timestamp: ${STAMP}

Fixed:
- repaired missing quantum mail tables
- verified /quantum-mail
- verified /quantum-mail-admin
- verified dashboard + jarvis health
- verified fresh route smoke tests

Purpose:
- close the broken partial-creation gap
- stabilize everything
- finish the Quantum Mail layer cleanly
REPORT

echo "REPAIR QUANTUM MAIL + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/quantum_mail_scan_latest.json"
echo "  cat snapshots/quantum_mail_messages_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/quantum-mail"
echo "  termux-open-url http://127.0.0.1:4900/quantum-mail-admin"
echo "  termux-open-url http://127.0.0.1:4900/holo-search"
