#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== FINAL 3 PART BUILD 2 START ==="

python << 'PYEOF'
import sqlite3
from pathlib import Path
import secrets

db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

def cols(table):
    return [r[1] for r in cur.execute(f"PRAGMA table_info({table})").fetchall()]

def ensure_column(table, col_name, ddl):
    if col_name not in cols(table):
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {ddl}")
        print(f"[OK] Added column {table}.{col_name}")

ensure_column("user_accounts", "password_algo", "password_algo TEXT DEFAULT 'sha256_placeholder'")
ensure_column("persistent_sessions", "ip_address", "ip_address TEXT")
ensure_column("persistent_sessions", "user_agent", "user_agent TEXT")

conn.commit()
conn.close()
print("[OK] build 2 DB prep complete")
PYEOF

python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

def insert_before(marker: str, block: str):
    global text
    if block.strip() not in text and marker in text:
        text = text.replace(marker, block + "\n" + marker)

helpers = r'''
const crypto = require('crypto');

function hashPassword(raw) {
  return crypto.createHash('sha256').update(String(raw || '')).digest('hex');
}

function makeSessionToken() {
  return crypto.randomBytes(24).toString('hex');
}

function validateUploadPolicy(policyName, filename, fileSizeBytes) {
  const rows = dbQuery(`SELECT policy_name, max_bytes, allowed_extensions FROM upload_policies WHERE policy_name='${q(policyName)}' LIMIT 1`);
  if (!rows.length) return { ok: false, reason: 'Missing upload policy' };

  const policy = rows[0];
  const ext = filename.includes('.') ? '.' + filename.split('.').pop().toLowerCase() : '';
  const allowed = String(policy.allowed_extensions || '').split(',').map(x => x.trim().toLowerCase());

  if (!allowed.includes(ext)) {
    return { ok: false, reason: `File type not allowed: ${ext}` };
  }

  if (Number(fileSizeBytes || 0) > Number(policy.max_bytes || 0)) {
    return { ok: false, reason: 'File exceeds size limit' };
  }

  return { ok: true, reason: 'ok' };
}

function renderSecurityPage(user = null) {
  const accounts = dbQuery("SELECT id, username, role, account_status, created_at FROM user_accounts ORDER BY id DESC");
  const sessions = dbQuery("SELECT id, user_id, session_token, session_status, created_at FROM persistent_sessions ORDER BY id DESC LIMIT 50");

  const accountRows = accounts.map(a => `<tr><td>${a.id}</td><td>${a.username}</td><td>${a.role}</td><td>${a.account_status}</td><td>${a.created_at || ''}</td></tr>`).join('');
  const sessionRows = sessions.map(s => `<tr><td>${s.id}</td><td>${s.user_id}</td><td><code>${s.session_token}</code></td><td>${s.session_status}</td><td>${s.created_at || ''}</td></tr>`).join('');

  return htmlPage('Security Center', `
    <div class="section">
      <div class="card">
        <h2>Security + Session Foundation</h2>
        <p>Password hashing helper, session tokens, upload validation policy, and admin visibility for account security.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Accounts</h3>
          <table>
            <thead><tr><th>ID</th><th>User</th><th>Role</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${accountRows || '<tr><td colspan="5">No accounts yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Sessions</h3>
          <table>
            <thead><tr><th>ID</th><th>User ID</th><th>Token</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${sessionRows || '<tr><td colspan="5">No sessions yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", helpers)

if '<a href="/security">Security</a>' not in text and '<a href="/accounts">Accounts</a>' in text:
    text = text.replace(
        '<a href="/accounts">Accounts</a>',
        '<a href="/accounts">Accounts</a>\n      <a href="/security">Security</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/accounts') {"
if "pathname === '/security'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/security') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderSecurityPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/accounts') {"""
    text = text.replace(anchor, routes)

p.write_text(text)
print("[OK] build 2 UI patch applied")
PYEOF

bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots
cp apps/dashboard.js "backups/dashboard_build2_${STAMP}.js"
cp db/aam.db "backups/aam_build2_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as user_accounts from user_accounts;" > "snapshots/build2_user_accounts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as persistent_sessions from persistent_sessions;" > "snapshots/build2_sessions_${STAMP}.json"

echo "FINAL 3 PART BUILD 2 COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/security"
echo "  termux-open-url http://127.0.0.1:4900/accounts"
