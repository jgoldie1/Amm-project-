#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== SECURITY HARDENING SAFE FIX START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports config

########################################
# 1) SECRET FILE
########################################
if [ ! -f config/security.env ]; then
  SECRET_VALUE="$(python3 - <<'PY'
import secrets
print(secrets.token_hex(32))
PY
)"
  cat > config/security.env <<SEC
APP_SESSION_SECRET=${SECRET_VALUE}
SEC
  echo "[OK] config/security.env created"
else
  echo "[OK] config/security.env already exists"
fi

########################################
# 2) DATABASE HARDENING
########################################
python3 << 'PYEOF'
import sqlite3, hashlib, secrets
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

def cols(table):
    try:
        return [r["name"] for r in cur.execute(f"PRAGMA table_info({table})").fetchall()]
    except:
        return []

def ensure_col(table, name, ddl):
    if name not in cols(table):
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {ddl}")

cur.execute("""
CREATE TABLE IF NOT EXISTS security_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  subject_type TEXT,
  subject_id INTEGER,
  event_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  attempt_status TEXT NOT NULL,
  ip_address TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

ensure_col("heir_accounts", "pin_salt", "pin_salt TEXT")
ensure_col("heir_accounts", "pin_hash", "pin_hash TEXT")
ensure_col("heir_accounts", "role_name", "role_name TEXT DEFAULT 'heir'")
ensure_col("heir_accounts", "failed_login_count", "failed_login_count INTEGER DEFAULT 0")
ensure_col("heir_accounts", "last_login_at", "last_login_at TEXT")

ensure_col("heir_sessions", "session_secret", "session_secret TEXT")
ensure_col("heir_sessions", "logout_at", "logout_at TEXT")

rows = cur.execute("""
SELECT ha.id, ha.heir_id, ha.pin_code, ha.pin_hash, hr.role, hr.division
FROM heir_accounts ha
LEFT JOIN heirs_registry hr ON hr.id = ha.heir_id
ORDER BY ha.id
""").fetchall()

for r in rows:
    role_name = "heir"
    role_text = (r["role"] or "").lower()
    division_text = (r["division"] or "").lower()

    if "security" in role_text or "security" in division_text:
        role_name = "security_admin"
    elif "advanced systems" in role_text or "future ops" in division_text:
        role_name = "systems_admin"
    elif "voice" in role_text or "coach" in role_text or "entertainment" in role_text:
        role_name = "creator"

    cur.execute("UPDATE heir_accounts SET role_name=? WHERE id=?", (role_name, r["id"]))

    if not r["pin_hash"]:
        raw_pin = str(r["pin_code"] or "1234")
        salt = secrets.token_hex(16)
        pin_hash = hashlib.sha256((salt + raw_pin).encode("utf-8")).hexdigest()
        cur.execute("""
        UPDATE heir_accounts
        SET pin_salt=?, pin_hash=?
        WHERE id=?
        """, (salt, pin_hash, r["id"]))

conn.commit()
conn.close()
print("[OK] database security hardening complete")
PYEOF

########################################
# 3) PATCH DASHBOARD HELPERS
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

marker = "const server = http.createServer(async (req, res) => {"
helper = r"""
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function loadSecurityEnv() {
  try {
    const envPath = path.join(process.cwd(), 'config', 'security.env');
    if (!fs.existsSync(envPath)) return {};
    const raw = fs.readFileSync(envPath, 'utf8');
    const out = {};
    raw.split('\n').forEach(line => {
      const s = line.trim();
      if (!s || s.startsWith('#') || !s.includes('=')) return;
      const i = s.indexOf('=');
      out[s.slice(0, i).trim()] = s.slice(i + 1).trim();
    });
    return out;
  } catch (e) {
    return {};
  }
}

const __SECURITY_ENV = loadSecurityEnv();
const APP_SESSION_SECRET = __SECURITY_ENV.APP_SESSION_SECRET || 'fallback_dev_secret_replace_me';

function sha256Hex(v) {
  return crypto.createHash('sha256').update(String(v)).digest('hex');
}

function randomToken(size = 24) {
  return crypto.randomBytes(size).toString('hex');
}

function makePinHash(pin, salt) {
  return sha256Hex(String(salt) + String(pin));
}

function logSecurityEvent(eventType, subjectType = 'system', subjectId = 0, notes = '') {
  dbRun(`INSERT INTO security_audit_log (event_type, subject_type, subject_id, event_notes)
         VALUES ('${q(eventType)}', '${q(subjectType)}', ${Number(subjectId || 0)}, '${q(notes || '')}')`);
}

function getCookieMap(req) {
  const raw = req.headers.cookie || '';
  const map = {};
  raw.split(';').forEach(pair => {
    const s = pair.trim();
    if (!s || !s.includes('=')) return;
    const i = s.indexOf('=');
    map[s.slice(0, i).trim()] = decodeURIComponent(s.slice(i + 1).trim());
  });
  return map;
}

function setCookie(res, name, value, maxAge = 28800) {
  const cookie = `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
  const existing = res.getHeader ? res.getHeader('Set-Cookie') : null;
  if (!existing) res.setHeader('Set-Cookie', [cookie]);
  else if (Array.isArray(existing)) res.setHeader('Set-Cookie', [...existing, cookie]);
  else res.setHeader('Set-Cookie', [existing, cookie]);
}

function clearCookie(res, name) {
  setCookie(res, name, '', 0);
}

function createSecureHeirSession(heirId) {
  const sessionToken = randomToken(20);
  const sessionSecret = sha256Hex(APP_SESSION_SECRET + ':' + sessionToken);
  dbRun(`INSERT INTO heir_sessions (heir_id, session_token, session_secret, session_status)
         VALUES (${Number(heirId)}, '${q(sessionToken)}', '${q(sessionSecret)}', 'active')`);
  return sessionToken;
}

function getActiveHeirSession(req) {
  const cookies = getCookieMap(req);
  const token = cookies.heir_session || '';
  if (!token) return null;
  const secret = sha256Hex(APP_SESSION_SECRET + ':' + token);
  const rows = dbQuery(`
    SELECT hs.id, hs.heir_id, hs.session_status, ha.username, ha.role_name
    FROM heir_sessions hs
    LEFT JOIN heir_accounts ha ON ha.heir_id = hs.heir_id
    WHERE hs.session_token='${q(token)}'
      AND hs.session_secret='${q(secret)}'
      AND hs.session_status='active'
    ORDER BY hs.id DESC
    LIMIT 1
  `);
  return rows.length ? rows[0] : null;
}

function requireHeirRole(req, res, allowedRoles = []) {
  const session = getActiveHeirSession(req);
  if (!session) {
    redirect(res, '/heir-login?msg=Please%20log%20in');
    return null;
  }
  if (allowedRoles.length && !allowedRoles.includes(String(session.role_name || ''))) {
    redirect(res, '/heir-dashboard/' + Number(session.heir_id) + '?msg=Access%20denied');
    return null;
  }
  return session;
}

function recordLoginAttempt(username, status, req) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'local');
  dbRun(`INSERT INTO login_attempts (username, attempt_status, ip_address)
         VALUES ('${q(username || '')}', '${q(status)}', '${q(ip)}')`);
}

function isRateLimited(username) {
  const rows = dbQuery(`
    SELECT count(*) as c
    FROM login_attempts
    WHERE username='${q(username || '')}'
      AND attempt_status='failed'
      AND created_at >= datetime('now', '-15 minutes')
  `);
  return rows.length ? Number(rows[0].c || 0) >= 5 : false;
}
"""
if "function loadSecurityEnv()" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

# secure login GET renderer swap
text = text.replace(
"""return res.end(renderHeirLoginPage(session, requestURL.searchParams.get('msg') || ''));""",
"""return res.end(renderSecureHeirLoginPage ? renderSecureHeirLoginPage(session, requestURL.searchParams.get('msg') || '') : renderHeirLoginPage(session, requestURL.searchParams.get('msg') || ''));"""
)

# add secure login page helper if missing
if "function renderSecureHeirLoginPage(" not in text and "function renderHeirLoginPage(" in text:
    insert_after = "function renderHeirLoginPage(user = null, message = '') {"
    idx = text.find(insert_after)
    if idx != -1:
        end_idx = text.find("\n}\n", idx)
        if end_idx != -1:
            end_idx += 3
            secure_page = r"""
function renderSecureHeirLoginPage(user = null, message = '') {
  return htmlPage('Heir Login', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Secure Heirs Access</div>
          <h1>Heir Login</h1>
          <p>Secure sign-in for heir accounts.</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>
        <section class="clean-section">
          <div class="section-body">
            <div class="feature-card" style="max-width:560px;">
              <form method="POST" action="/heir-login">
                <label>Username</label>
                <input name="username" placeholder="jacobie" />
                <label>PIN</label>
                <input name="pin_code" placeholder="1234" type="password" />
                <button type="submit">Secure Login</button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  `, user);
}
"""
            text = text[:end_idx] + "\n" + secure_page + text[end_idx:]

# replace login POST logic
start = text.find("if (req.method === 'POST' && pathname === '/heir-login') {")
if start != -1:
    end = text.find("\n    if (req.method === 'GET' && pathname.startsWith('/heir-dashboard/')) {", start)
    if end != -1:
        new_block = """if (req.method === 'POST' && pathname === '/heir-login') {
      const body = await parseBody(req);
      const username = String(body.username || '').trim().toLowerCase();
      const pinCode = String(body.pin_code || '').trim();

      if (isRateLimited(username)) {
        recordLoginAttempt(username, 'rate_limited', req);
        logSecurityEvent('LOGIN_RATE_LIMITED', 'heir_account', 0, username);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(renderSecureHeirLoginPage(null, 'Too many login attempts'));
      }

      const rows = dbQuery(`SELECT ha.id, ha.heir_id, ha.pin_salt, ha.pin_hash, ha.account_status
                            FROM heir_accounts ha
                            WHERE lower(ha.username)='${q(username)}'
                              AND ha.account_status='active'
                            LIMIT 1`);

      if (!rows.length) {
        recordLoginAttempt(username, 'failed', req);
        logSecurityEvent('LOGIN_FAILED', 'heir_account', 0, username);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(renderSecureHeirLoginPage(null, 'Login failed'));
      }

      const acct = rows[0];
      const expected = makePinHash(pinCode, acct.pin_salt || '');
      if (String(expected) !== String(acct.pin_hash || '')) {
        dbRun(`UPDATE heir_accounts SET failed_login_count=COALESCE(failed_login_count,0)+1 WHERE id=${Number(acct.id)}`);
        recordLoginAttempt(username, 'failed', req);
        logSecurityEvent('LOGIN_FAILED', 'heir_account', Number(acct.heir_id), username);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(renderSecureHeirLoginPage(null, 'Login failed'));
      }

      dbRun(`UPDATE heir_accounts
             SET failed_login_count=0, last_login_at=CURRENT_TIMESTAMP
             WHERE id=${Number(acct.id)}`);

      const sessionToken = createSecureHeirSession(Number(acct.heir_id));
      setCookie(res, 'heir_session', sessionToken, 28800);
      recordLoginAttempt(username, 'success', req);
      logSecurityEvent('LOGIN_SUCCESS', 'heir_account', Number(acct.heir_id), username);

      return redirect(res, `/heir-dashboard/${Number(acct.heir_id)}?msg=Welcome`);
    }

    """
        text = text[:start] + "    " + new_block + text[end:]

# add logout route before heirs ecosystem
anchor = "    if (req.method === 'GET' && pathname === '/heirs-ecosystem') {"
if "pathname === '/heir-logout'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/heir-logout') {
      const session = getActiveHeirSession(req);
      if (session) {
        dbRun(`UPDATE heir_sessions
               SET session_status='logged_out', logout_at=CURRENT_TIMESTAMP
               WHERE id=${Number(session.id)}`);
        logSecurityEvent('LOGOUT', 'heir_account', Number(session.heir_id), session.username || '');
      }
      clearCookie(res, 'heir_session');
      return redirect(res, '/heir-login?msg=Logged%20out');
    }

    if (req.method === 'GET' && pathname === '/heirs-ecosystem') {"""
    text = text.replace(anchor, route, 1)

# protect key sensitive GET routes simply
protections = [
    ("/heir-payouts", ["security_admin","systems_admin"]),
    ("/payout-cycles", ["security_admin","systems_admin"]),
    ("/payout-automation", ["security_admin","systems_admin"]),
    ("/executive-dashboard", ["security_admin","systems_admin"]),
]
for route, roles in protections:
    old = f"""if (req.method === 'GET' && pathname === '{route}') {{"""
    if old in text and f"requireHeirRole(req, res, {roles}" not in text:
        text = text.replace(
            old,
            old + f"""
      const session = requireHeirRole(req, res, {roles});
      if (!session) return;""",
            1
        )

# heir dashboard protect
old_dash = """if (req.method === 'GET' && pathname.startsWith('/heir-dashboard/')) {"""
if old_dash in text and "Access%20denied" not in text[text.find(old_dash):text.find(old_dash)+400]:
    text = text.replace(
        old_dash,
        old_dash + """
      const session = requireHeirRole(req, res, []);
      if (!session) return;""",
        1
    )

# add logout nav link
if '<a href="/heir-logout">Logout</a>' not in text and '<a href="/heir-login">Heir Login</a>' in text:
    text = text.replace(
        '<a href="/heir-login">Heir Login</a>',
        '<a href="/heir-login">Heir Login</a>\n          <a href="/heir-logout">Logout</a>'
    )

p.write_text(text)
print("[OK] dashboard security patch applied")
PYEOF

########################################
# 4) RESTART / VERIFY
########################################
bash scripts/restart_world_socket.sh || true
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh

curl -s http://127.0.0.1:4900/health > "snapshots/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "snapshots/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "snapshots/socket_health_${STAMP}.json" || true

########################################
# 5) CHECKPOINT
########################################
cp apps/dashboard.js "backups/dashboard_security_safe_fix_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_security_safe_fix_${STAMP}.js"
cp db/aam.db "backups/aam_security_safe_fix_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as security_audit_log from security_audit_log;" > "snapshots/security_audit_log_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as login_attempts from login_attempts;" > "snapshots/login_attempts_${STAMP}.json"

cat > "reports/security_safe_fix_${STAMP}.txt" <<REPORT
SECURITY SAFE FIX REPORT
Timestamp: ${STAMP}

Added or verified:
- config/security.env
- pin hashing migration
- secure heir sessions
- logout route
- login attempt logging
- rate limiting helper
- security audit log
- basic role protection on sensitive routes
REPORT

echo "SECURITY SAFE FIX COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/heir-login"
echo "  termux-open-url http://127.0.0.1:4900/heir-logout"
echo "  termux-open-url http://127.0.0.1:4900/executive-dashboard"
