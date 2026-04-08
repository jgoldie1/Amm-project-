#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== REBUILD MISSING ADVANCED ROUTES + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_before_rebuild_missing_routes_${STAMP}.js"
cp db/aam.db "backups/aam_before_rebuild_missing_routes_${STAMP}.db"

########################################
# 1) ENSURE TABLES EXIST
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
CREATE TABLE IF NOT EXISTS quantum_mail_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT NOT NULL,
  metric_value INTEGER DEFAULT 0,
  metric_scope TEXT DEFAULT 'global',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS holo_search_index (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_type TEXT,
  source_name TEXT,
  source_route TEXT,
  source_group TEXT,
  search_keywords TEXT,
  search_summary TEXT,
  index_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS holo_search_queries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query_text TEXT,
  username TEXT,
  query_scope TEXT,
  result_count INTEGER DEFAULT 0,
  query_status TEXT DEFAULT 'complete',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS platform_usage_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT NOT NULL,
  metric_value INTEGER DEFAULT 0,
  metric_scope TEXT DEFAULT 'global',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

if cur.execute("SELECT count(*) FROM quantum_mail_accounts").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO quantum_mail_accounts
        (display_name, mail_address, account_type, account_status)
        VALUES (?, ?, ?, ?)
    """, [
        ("Jacobie", "jacobie@omnimail.local", "admin", "active"),
        ("Aniyah", "aniyah@omnimail.local", "creator", "active"),
        ("Isaiah", "isaiah@omnimail.local", "operator", "active"),
    ])

if cur.execute("SELECT count(*) FROM quantum_mail_messages").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO quantum_mail_messages
        (mailbox_owner, folder_name, sender_address, recipient_address, subject_line, message_body, message_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, [
        ("Jacobie", "inbox", "system@omnimail.local", "jacobie@omnimail.local", "Welcome", "OmniMail OS is active.", "unread"),
        ("Isaiah", "inbox", "studio@omnimail.local", "isaiah@omnimail.local", "AI TV Update", "Creator broadcasting layer is being prepared.", "unread"),
    ])

if cur.execute("SELECT count(*) FROM quantum_mail_drafts").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO quantum_mail_drafts
        (mailbox_owner, recipient_address, subject_line, message_body, draft_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Jacobie", "team@omnimail.local", "Platform Update", "Draft platform update.", "saved"),
    ])

if cur.execute("SELECT count(*) FROM quantum_mail_folders").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO quantum_mail_folders
        (mailbox_owner, folder_name, folder_type, folder_status)
        VALUES (?, ?, ?, ?)
    """, [
        ("Jacobie", "inbox", "system", "active"),
        ("Jacobie", "drafts", "system", "active"),
        ("Isaiah", "inbox", "system", "active"),
    ])

cur.execute("DELETE FROM quantum_mail_metrics")
mail_counts = [
    ("mail_accounts", cur.execute("SELECT count(*) FROM quantum_mail_accounts").fetchone()[0], "global"),
    ("mail_messages", cur.execute("SELECT count(*) FROM quantum_mail_messages").fetchone()[0], "global"),
    ("mail_drafts", cur.execute("SELECT count(*) FROM quantum_mail_drafts").fetchone()[0], "global"),
]
cur.executemany("""
    INSERT INTO quantum_mail_metrics (metric_name, metric_value, metric_scope)
    VALUES (?, ?, ?)
""", mail_counts)

if cur.execute("SELECT count(*) FROM holo_search_index").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO holo_search_index
        (source_type, source_name, source_route, source_group, search_keywords, search_summary, index_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, [
        ("route", "OmniMail OS", "/quantum-mail", "communication", "mail inbox messages drafts", "Mail system", "active"),
        ("route", "Holo Search", "/holo-search", "search", "search discovery routes", "Platform search system", "active"),
        ("route", "Platform Analytics", "/platform-analytics", "analytics", "analytics usage metrics", "Usage metrics", "active"),
    ])

cur.execute("DELETE FROM platform_usage_metrics")
cur.executemany("""
    INSERT INTO platform_usage_metrics (metric_name, metric_value, metric_scope)
    VALUES (?, ?, ?)
""", [
    ("active_routes", 4, "platform"),
    ("mail_layer_enabled", 1, "communication"),
    ("search_layer_enabled", 1, "search"),
    ("analytics_layer_enabled", 1, "analytics"),
])

conn.commit()
conn.close()
print("[OK] required advanced tables ready")
PYEOF

########################################
# 2) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper_mail = r"""
function renderQuantumMailPage(req, user = null, message = '') {
  const accounts = dbQuery(`
    SELECT id, display_name, mail_address, account_type, account_status, created_at
    FROM quantum_mail_accounts
    ORDER BY id DESC LIMIT 100
  `);
  const messages = dbQuery(`
    SELECT id, mailbox_owner, folder_name, sender_address, recipient_address, subject_line, message_status, created_at
    FROM quantum_mail_messages
    ORDER BY id DESC LIMIT 200
  `);
  const drafts = dbQuery(`
    SELECT id, mailbox_owner, recipient_address, subject_line, draft_status, created_at
    FROM quantum_mail_drafts
    ORDER BY id DESC LIMIT 100
  `);

  const accountRows = accounts.map(r => `<tr><td>${r.id}</td><td>${r.display_name}</td><td>${r.mail_address}</td><td>${r.account_type}</td><td>${r.account_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const messageRows = messages.map(r => `<tr><td>${r.id}</td><td>${r.mailbox_owner}</td><td>${r.folder_name}</td><td>${r.sender_address || ''}</td><td>${r.recipient_address || ''}</td><td>${r.subject_line || ''}</td><td>${r.message_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const draftRows = drafts.map(r => `<tr><td>${r.id}</td><td>${r.mailbox_owner}</td><td>${r.recipient_address || ''}</td><td>${r.subject_line || ''}</td><td>${r.draft_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('OmniMail OS', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>OmniMail OS</h1><p>${message || 'Mail accounts, inbox, and drafts.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Name</th><th>Address</th><th>Type</th><th>Status</th><th>Created</th></tr></thead><tbody>${accountRows || '<tr><td colspan="6">No accounts</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Owner</th><th>Folder</th><th>Sender</th><th>Recipient</th><th>Subject</th><th>Status</th><th>Created</th></tr></thead><tbody>${messageRows || '<tr><td colspan="8">No messages</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Owner</th><th>Recipient</th><th>Subject</th><th>Status</th><th>Created</th></tr></thead><tbody>${draftRows || '<tr><td colspan="6">No drafts</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

helper_mail_admin = r"""
function renderQuantumMailAdminPage(req, user = null, message = '') {
  const folders = dbQuery(`
    SELECT id, mailbox_owner, folder_name, folder_type, folder_status, created_at
    FROM quantum_mail_folders
    ORDER BY id DESC LIMIT 200
  `);
  const metrics = dbQuery(`
    SELECT id, metric_name, metric_value, metric_scope, created_at
    FROM quantum_mail_metrics
    ORDER BY id DESC LIMIT 100
  `);

  const folderRows = folders.map(r => `<tr><td>${r.id}</td><td>${r.mailbox_owner}</td><td>${r.folder_name}</td><td>${r.folder_type}</td><td>${r.folder_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const metricRows = metrics.map(r => `<tr><td>${r.id}</td><td>${r.metric_name}</td><td>${r.metric_value}</td><td>${r.metric_scope}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('OmniMail Admin', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>OmniMail Admin</h1><p>${message || 'Mail folders and metrics.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Owner</th><th>Folder</th><th>Type</th><th>Status</th><th>Created</th></tr></thead><tbody>${folderRows || '<tr><td colspan="6">No folders</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Metric</th><th>Value</th><th>Scope</th><th>Created</th></tr></thead><tbody>${metricRows || '<tr><td colspan="5">No metrics</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

helper_search = r"""
function renderHoloSearchPage(req, user = null, message = '') {
  const idx = dbQuery(`
    SELECT id, source_type, source_name, source_route, source_group, search_keywords, search_summary, index_status, created_at
    FROM holo_search_index
    ORDER BY id DESC LIMIT 200
  `);

  const rows = idx.map(r => `<tr><td>${r.id}</td><td>${r.source_name || ''}</td><td>${r.source_route || ''}</td><td>${r.source_group || ''}</td><td>${r.search_keywords || ''}</td><td>${r.index_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Holo Search', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Holo Search</h1><p>${message || 'Search index across platform systems.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Name</th><th>Route</th><th>Group</th><th>Keywords</th><th>Status</th><th>Created</th></tr></thead><tbody>${rows || '<tr><td colspan="7">No search index records</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

helper_analytics = r"""
function renderPlatformAnalyticsPage(req, user = null, message = '') {
  const metrics = dbQuery(`
    SELECT id, metric_name, metric_value, metric_scope, created_at
    FROM platform_usage_metrics
    ORDER BY id DESC LIMIT 200
  `);

  const rows = metrics.map(r => `<tr><td>${r.id}</td><td>${r.metric_name}</td><td>${r.metric_value}</td><td>${r.metric_scope}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Platform Analytics', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Platform Analytics</h1><p>${message || 'Usage and system metrics.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Metric</th><th>Value</th><th>Scope</th><th>Created</th></tr></thead><tbody>${rows || '<tr><td colspan="5">No analytics metrics</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
helpers = []
if "function renderQuantumMailPage(req, user = null, message = '')" not in text:
    helpers.append(helper_mail)
if "function renderQuantumMailAdminPage(req, user = null, message = '')" not in text:
    helpers.append(helper_mail_admin)
if "function renderHoloSearchPage(req, user = null, message = '')" not in text:
    helpers.append(helper_search)
if "function renderPlatformAnalyticsPage(req, user = null, message = '')" not in text:
    helpers.append(helper_analytics)
if helpers:
    text = text.replace(server_marker, "\n".join(helpers) + "\n" + server_marker, 1)

route_blocks = [
("""
    if (req.method === 'GET' && pathname === '/quantum-mail') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderQuantumMailPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
""", "pathname === '/quantum-mail'"),
("""
    if (req.method === 'GET' && pathname === '/quantum-mail-admin') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderQuantumMailAdminPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
""", "pathname === '/quantum-mail-admin'"),
("""
    if (req.method === 'GET' && pathname === '/holo-search') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHoloSearchPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
""", "pathname === '/holo-search'"),
("""
    if (req.method === 'GET' && pathname === '/platform-analytics') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPlatformAnalyticsPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
""", "pathname === '/platform-analytics'"),
]

anchor = "    if (req.method === 'GET' && pathname === '/world3d') {"
blocks_to_add = [block for block, needle in route_blocks if needle not in text]
if blocks_to_add and anchor in text:
    text = text.replace(anchor, "\n".join(blocks_to_add) + "\n" + anchor, 1)

p.write_text(text)
print("[OK] missing advanced routes rebuilt")
PYEOF

########################################
# 3) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true

########################################
# 4) ROUTE TESTS
########################################
for route in \
  / \
  /quantum-mail \
  /quantum-mail-admin \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 5) SCAN
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

latest = Path.home() / "aam_full_system" / "snapshots" / "rebuild_missing_advanced_routes_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] rebuild missing routes scan complete: {len(issues)} issues")
PYEOF

########################################
# 6) REPORT
########################################
cat > "reports/rebuild_missing_advanced_routes_and_stabilize_${STAMP}.txt" <<REPORT
REBUILD MISSING ADVANCED ROUTES + STABILIZE REPORT
Timestamp: ${STAMP}

Recovered:
- /quantum-mail
- /quantum-mail-admin
- /holo-search
- /platform-analytics

Purpose:
- rebuild missing advanced routes directly into current dashboard
- preserve stable runtime
- restore advanced platform surface
REPORT

echo "REBUILD MISSING ADVANCED ROUTES + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/rebuild_missing_advanced_routes_scan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/quantum-mail"
echo "  termux-open-url http://127.0.0.1:4900/quantum-mail-admin"
echo "  termux-open-url http://127.0.0.1:4900/holo-search"
echo "  termux-open-url http://127.0.0.1:4900/platform-analytics"
