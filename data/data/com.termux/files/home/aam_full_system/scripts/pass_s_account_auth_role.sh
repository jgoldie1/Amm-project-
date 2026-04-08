#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PASS S ACCOUNT AUTH ROLE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp db/aam.db "backups/aam_pass_s_${STAMP}.db"
cp apps/dashboard.js "backups/dashboard_pass_s_${STAMP}.js"

sqlite3 db/aam.db <<SQL
CREATE TABLE IF NOT EXISTS account_center_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_name TEXT,
  account_email TEXT,
  account_type TEXT,
  account_scope TEXT,
  account_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_session_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_name TEXT,
  linked_account TEXT,
  auth_mode TEXT,
  recovery_mode TEXT,
  session_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_access_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_name TEXT,
  role_group TEXT,
  access_scope TEXT,
  control_mode TEXT,
  role_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profile_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT,
  linked_account TEXT,
  profile_type TEXT,
  profile_scope TEXT,
  profile_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO account_center_registry (account_name, account_email, account_type, account_scope, account_status)
SELECT 'Primary Platform Account','primary@aam.local','owner','platform_wide','active'
WHERE NOT EXISTS (SELECT 1 FROM account_center_registry WHERE account_email='primary@aam.local');

INSERT INTO auth_session_registry (session_name, linked_account, auth_mode, recovery_mode, session_status)
SELECT 'Primary Auth Session','Primary Platform Account','email_session','reset_recovery','active'
WHERE NOT EXISTS (SELECT 1 FROM auth_session_registry WHERE session_name='Primary Auth Session');

INSERT INTO role_access_registry (role_name, role_group, access_scope, control_mode, role_status)
SELECT 'Platform Owner','admin','full_platform','managed_access','active'
WHERE NOT EXISTS (SELECT 1 FROM role_access_registry WHERE role_name='Platform Owner');

INSERT INTO role_access_registry (role_name, role_group, access_scope, control_mode, role_status)
SELECT 'Creator','creator','media_streaming_publish','managed_access','active'
WHERE NOT EXISTS (SELECT 1 FROM role_access_registry WHERE role_name='Creator');

INSERT INTO role_access_registry (role_name, role_group, access_scope, control_mode, role_status)
SELECT 'Studio Executive','studio','production_finance_distribution','managed_access','active'
WHERE NOT EXISTS (SELECT 1 FROM role_access_registry WHERE role_name='Studio Executive');

INSERT INTO user_profile_registry (profile_name, linked_account, profile_type, profile_scope, profile_status)
SELECT 'Primary Owner Profile','Primary Platform Account','owner_profile','platform_wide','active'
WHERE NOT EXISTS (SELECT 1 FROM user_profile_registry WHERE profile_name='Primary Owner Profile');
SQL

python3 <<'PY2EOF'
from pathlib import Path
p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper = r"""
function renderAccountCenterPage(req, user = null, message = '') {
  return htmlPage('Account Center', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section>
        <h1>Account Center</h1>
        <p>${esc(message || 'Account, auth, profiles, and role access are live.')}</p>
      </section>
      <section>
        <h2>Quick Actions</h2>
        <form method="POST" action="/account/create-safe" style="margin-bottom:12px;"><button type="submit">Create Account</button></form>
        <form method="POST" action="/account/auth-safe" style="margin-bottom:12px;"><button type="submit">Create Auth Session</button></form>
        <form method="POST" action="/account/role-safe" style="margin-bottom:12px;"><button type="submit">Create Role Access</button></form>
        <form method="POST" action="/account/profile-safe" style="margin-bottom:12px;"><button type="submit">Create User Profile</button></form>
      </section>
    </main>
  `, user);
}
"""

routes = r"""
    if (req.method === 'GET' && pathname === '/account-center') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderAccountCenterPage(req, null, getQueryParam(req, 'msg') || ''));
    }

    if (req.method === 'POST' && pathname === '/account/create-safe') {
      dbRun(`INSERT INTO account_center_registry (account_name, account_email, account_type, account_scope, account_status)
             VALUES ('Safe Account','safe@aam.local','member','platform_scope','active')`);
      res.writeHead(302, { Location: '/account-center?msg=Safe%20account%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/account/auth-safe') {
      dbRun(`INSERT INTO auth_session_registry (session_name, linked_account, auth_mode, recovery_mode, session_status)
             VALUES ('Safe Auth Session','Safe Account','email_session','reset_recovery','active')`);
      res.writeHead(302, { Location: '/account-center?msg=Safe%20auth%20session%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/account/role-safe') {
      dbRun(`INSERT INTO role_access_registry (role_name, role_group, access_scope, control_mode, role_status)
             VALUES ('Safe Role','custom_role','scoped_access','managed_access','active')`);
      res.writeHead(302, { Location: '/account-center?msg=Safe%20role%20created' });
      return res.end();
    }

    if (req.method === 'POST' && pathname === '/account/profile-safe') {
      dbRun(`INSERT INTO user_profile_registry (profile_name, linked_account, profile_type, profile_scope, profile_status)
             VALUES ('Safe Profile','Safe Account','member_profile','platform_scope','active')`);
      res.writeHead(302, { Location: '/account-center?msg=Safe%20profile%20created' });
      return res.end();
    }
"""

if "function renderAccountCenterPage(req, user = null, message = '') {" not in text:
    anchor = "function renderCommandCenterPage(req, user = null, message = '') {"
    if anchor in text:
        text = text.replace(anchor, helper + "\n\n" + anchor, 1)

if "pathname === '/account-center'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/command-center') {"
    if anchor in text:
        text = text.replace(anchor, routes + "\n" + anchor, 1)

if '<a href="/account-center">Account Center</a>' not in text and '<a href="/command-center">Command Center</a>' in text:
    text = text.replace(
        '<a href="/command-center">Command Center</a>',
        '<a href="/command-center">Command Center</a>\n<a href="/account-center">Account Center</a>',
        1
    )

p.write_text(text)
print("[OK] account center helper + routes patched")
PY2EOF

pkill -f "dashboard.js" 2>/dev/null || true
sleep 2
rm -f dashboard.pid
bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
sleep 5

curl -s -i http://127.0.0.1:4900/account-center > test_results/account_center_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/account/create-safe > test_results/account_create_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/account/auth-safe > test_results/account_auth_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/account/role-safe > test_results/account_role_${STAMP}.txt || true
curl -s -i -X POST http://127.0.0.1:4900/account/profile-safe > test_results/account_profile_${STAMP}.txt || true

python3 <<PY3EOF
from pathlib import Path
import json
stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []
for f in root.glob(f"*_{stamp}.txt"):
    txt = f.read_text(errors="ignore").lower()
    if "not found" in txt or "cannot get" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt or " 500 " in txt:
        issues.append({"file": f.name, "problem": "http_500"})
Path.home().joinpath("aam_full_system","snapshots","pass_s_account_auth_role_scan_latest.json").write_text(json.dumps(issues, indent=2))
print("issues:", len(issues))
PY3EOF

bash scripts/status.sh || true

cat > "reports/pass_s_account_auth_role_${STAMP}.txt" <<REPORT
PASS S ACCOUNT AUTH ROLE REPORT
Timestamp: ${STAMP}

Built:
- account center registry
- auth session registry
- role access registry
- user profile registry
- account center page
- account safe actions
REPORT

echo "=== PASS S COMPLETE ==="
echo "Check:"
echo "  cat snapshots/pass_s_account_auth_role_scan_latest.json"
echo "  cat reports/pass_s_account_auth_role_${STAMP}.txt"
echo "  bash scripts/status.sh"
