#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== MONETIZATION ENFORCEMENT + WALLET ACCESS START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_monetization_enforcement_${STAMP}.js"
cp db/aam.db "backups/aam_monetization_enforcement_${STAMP}.db"

########################################
# 2) DATABASE SUPPORT
########################################
python3 << 'PYEOF'
import sqlite3
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
        print(f"[OK] added {table}.{name}")

ensure_col("heir_wallets", "wallet_status", "wallet_status TEXT DEFAULT 'active'")
ensure_col("heir_wallets", "wallet_type", "wallet_type TEXT DEFAULT 'platform_wallet'")
ensure_col("heir_wallets", "tier_code", "tier_code TEXT DEFAULT 'basic_access'")

cur.execute("""
CREATE TABLE IF NOT EXISTS monetization_access_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_code TEXT NOT NULL UNIQUE,
  feature_name TEXT NOT NULL,
  required_tier_code TEXT NOT NULL,
  rule_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS monetization_feature_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER,
  feature_code TEXT NOT NULL,
  access_result TEXT NOT NULL,
  event_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

rules = [
    ("watch_basic", "Watch Basic Streaming", "basic_access"),
    ("creator_tools", "Creator Tools", "creator_access"),
    ("storefront_tools", "Storefront Tools", "storefront_access"),
    ("founder_heir_tools", "Founder Heir Tools", "founder_heir"),
    ("visual_world_creator", "Visual World Creator Arena", "creator_access"),
    ("multiverse_gateway", "Multiverse Gateway", "storefront_access"),
]
for feature_code, feature_name, required_tier_code in rules:
    cur.execute("""
    INSERT OR IGNORE INTO monetization_access_rules
    (feature_code, feature_name, required_tier_code, rule_status)
    VALUES (?, ?, ?, 'active')
    """, (feature_code, feature_name, required_tier_code))

# backfill wallets for heirs if missing
heirs = cur.execute("SELECT id FROM heirs_registry ORDER BY id").fetchall()
for h in heirs:
    heir_id = int(h["id"])
    exists = cur.execute("SELECT 1 FROM heir_wallets WHERE heir_id=? LIMIT 1", (heir_id,)).fetchone()
    if not exists:
        cur.execute("""
        INSERT INTO heir_wallets
        (heir_id, wallet_name, wallet_type, wallet_status, tier_code)
        VALUES (?, ?, 'platform_wallet', 'active', 'basic_access')
        """, (heir_id, f"Heir {heir_id} Wallet"))

# sync wallets from active access passes
passes = cur.execute("""
SELECT owner_id as heir_id, tier_code
FROM ecosystem_access_passes
WHERE owner_type='heir' AND pass_status='active'
ORDER BY id
""").fetchall()

for row in passes:
    heir_id = int(row["heir_id"])
    tier_code = row["tier_code"]
    cur.execute("""
    UPDATE heir_wallets
    SET tier_code=?, wallet_status='active'
    WHERE heir_id=?
    """, (tier_code, heir_id))

conn.commit()
conn.close()
print("[OK] monetization enforcement DB ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function getHeirTierCode(heirId) {
  const passRows = dbQuery(`
    SELECT tier_code
    FROM ecosystem_access_passes
    WHERE owner_type='heir' AND owner_id=${Number(heirId)} AND pass_status='active'
    ORDER BY id DESC
    LIMIT 1
  `);
  if (passRows.length) return String(passRows[0].tier_code || 'basic_access');

  const walletRows = dbQuery(`
    SELECT tier_code
    FROM heir_wallets
    WHERE heir_id=${Number(heirId)}
    ORDER BY id DESC
    LIMIT 1
  `);
  if (walletRows.length) return String(walletRows[0].tier_code || 'basic_access');

  return 'basic_access';
}

function tierRank(tierCode) {
  const map = {
    basic_access: 1,
    creator_access: 2,
    storefront_access: 3,
    founder_heir: 4
  };
  return map[String(tierCode || 'basic_access')] || 0;
}

function heirHasTier(heirId, requiredTierCode) {
  const current = getHeirTierCode(heirId);
  return tierRank(current) >= tierRank(requiredTierCode);
}

function enforceFeatureAccess(req, res, heirId, featureCode) {
  const rows = dbQuery(`
    SELECT required_tier_code
    FROM monetization_access_rules
    WHERE feature_code='${q(featureCode)}'
      AND rule_status='active'
    LIMIT 1
  `);

  if (!rows.length) return true;

  const requiredTierCode = String(rows[0].required_tier_code || 'basic_access');
  const ok = heirHasTier(heirId, requiredTierCode);

  dbRun(`INSERT INTO monetization_feature_events (heir_id, feature_code, access_result, event_notes)
         VALUES (${Number(heirId)}, '${q(featureCode)}', '${ok ? 'granted' : 'denied'}', '${q(requiredTierCode)}')`);

  return ok;
}

function renderMonetizationControlPage(req, user = null, message = '') {
  const tiers = dbQuery(`
    SELECT id, tier_name, tier_code, price_cents, tier_type, tier_status
    FROM membership_tiers
    ORDER BY price_cents ASC, id ASC
  `);

  const rules = dbQuery(`
    SELECT id, feature_code, feature_name, required_tier_code, rule_status, created_at
    FROM monetization_access_rules
    ORDER BY id ASC
  `);

  const passes = dbQuery(`
    SELECT e.id, h.name as heir_name, e.tier_code, e.pass_status, e.activated_at
    FROM ecosystem_access_passes e
    LEFT JOIN heirs_registry h ON h.id = e.owner_id
    WHERE e.owner_type='heir'
    ORDER BY e.id DESC
    LIMIT 100
  `);

  const wallets = dbQuery(`
    SELECT w.id, h.name as heir_name, w.wallet_name, w.wallet_type, w.wallet_status, w.tier_code
    FROM heir_wallets w
    LEFT JOIN heirs_registry h ON h.id = w.heir_id
    ORDER BY w.id DESC
    LIMIT 100
  `);

  const events = dbQuery(`
    SELECT m.id, h.name as heir_name, m.feature_code, m.access_result, m.event_notes, m.created_at
    FROM monetization_feature_events m
    LEFT JOIN heirs_registry h ON h.id = m.heir_id
    ORDER BY m.id DESC
    LIMIT 100
  `);

  const tierRows = tiers.map(r => `
    <tr><td>${r.id}</td><td>${r.tier_name}</td><td>${r.tier_code}</td><td>$${((Number(r.price_cents || 0))/100).toFixed(2)}</td><td>${r.tier_type}</td><td>${r.tier_status}</td></tr>
  `).join('');

  const ruleRows = rules.map(r => `
    <tr><td>${r.id}</td><td>${r.feature_code}</td><td>${r.feature_name}</td><td>${r.required_tier_code}</td><td>${r.rule_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const passRows = passes.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.tier_code}</td><td>${r.pass_status}</td><td>${r.activated_at || ''}</td></tr>
  `).join('');

  const walletRows = wallets.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.wallet_name || ''}</td><td>${r.wallet_type || ''}</td><td>${r.wallet_status || ''}</td><td>${r.tier_code || ''}</td></tr>
  `).join('');

  const eventRows = events.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.feature_code}</td><td>${r.access_result}</td><td>${r.event_notes || ''}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Monetization Control', `
    <div class="portal-shell premium-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main premium-main">
        <section class="premium-hero">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Monetization Enforcement</div>
            <h1>Monetization Control</h1>
            <p>Access tiers, unlocks, passes, wallets, and feature access are enforced here.</p>
            ${message ? `<p class="ok">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/join" class="hero-primary-btn">Open Join</a>
              <a href="/build" class="hero-secondary-btn">Open Build</a>
              <a href="/watch" class="hero-secondary-btn">Open Watch</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Membership Tiers', `
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Code</th><th>Price</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>${tierRows || '<tr><td colspan="6">No tiers yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Feature Access Rules', `
          <table>
            <thead><tr><th>ID</th><th>Feature Code</th><th>Feature Name</th><th>Required Tier</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${ruleRows || '<tr><td colspan="6">No rules yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Active Access Passes', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Tier</th><th>Status</th><th>Activated</th></tr></thead>
            <tbody>${passRows || '<tr><td colspan="5">No passes yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Wallet Tier Sync', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Wallet</th><th>Type</th><th>Status</th><th>Tier Code</th></tr></thead>
            <tbody>${walletRows || '<tr><td colspan="6">No wallet rows yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Feature Access Events', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Feature</th><th>Result</th><th>Required Tier</th><th>Created</th></tr></thead>
            <tbody>${eventRows || '<tr><td colspan="6">No events yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}

function renderLockedUpgradePage(req, user = null, featureName = 'Feature', requiredTier = 'basic_access') {
  return htmlPage('Upgrade Required', `
    <div class="portal-shell premium-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main premium-main">
        <section class="premium-hero">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Upgrade Required</div>
            <h1>${featureName}</h1>
            <p>This area requires <strong>${requiredTier}</strong> or higher.</p>
            <div class="premium-cta-row">
              <a href="/join" class="hero-primary-btn">Upgrade Access</a>
              <a href="/role-hub" class="hero-secondary-btn">Back to Role Hub</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  `, user);
}
"""

marker = "const server = http.createServer(async (req, res) => {"
if "function getHeirTierCode(heirId)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

if '<a href="/monetization-control">Monetization</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/connect-system">Connect</a>',
        '<a href="/connect-system">Connect</a>\n          <a href="/monetization-control">Monetization</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/connect-system') {"
if "pathname === '/monetization-control'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/monetization-control') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderMonetizationControlPage(req, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'GET' && pathname === '/connect-system') {"""
    text = text.replace(anchor, route, 1)

# Gate build page
old_build = """    if (req.method === 'GET' && pathname === '/build') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderBuildPage(req, session));
    }"""
new_build = """    if (req.method === 'GET' && pathname === '/build') {
      const session = getActiveHeirSession(req);
      if (!session) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(renderLockedUpgradePage(req, null, 'Build & Earn', 'basic_access'));
      }
      const ok = enforceFeatureAccess(req, res, Number(session.heir_id), 'storefront_tools');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      if (!ok) return res.end(renderLockedUpgradePage(req, session, 'Build & Earn', 'storefront_access'));
      return res.end(renderBuildPage(req, session));
    }"""
if old_build in text:
    text = text.replace(old_build, new_build, 1)

# Gate watch page
old_watch = """    if (req.method === 'GET' && pathname === '/watch') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPremiumWatchPage(req, session, requestURL.searchParams.get('msg') || ''));
    }"""
new_watch = """    if (req.method === 'GET' && pathname === '/watch') {
      const session = getActiveHeirSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      if (!session) return res.end(renderPremiumWatchPage(req, null, requestURL.searchParams.get('msg') || ''));
      const ok = enforceFeatureAccess(req, res, Number(session.heir_id), 'watch_basic');
      if (!ok) return res.end(renderLockedUpgradePage(req, session, 'Watch', 'basic_access'));
      return res.end(renderPremiumWatchPage(req, session, requestURL.searchParams.get('msg') || ''));
    }"""
if old_watch in text:
    text = text.replace(old_watch, new_watch, 1)

# Gate connect system
old_connect = """    if (req.method === 'GET' && pathname === '/connect-system') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderConnectSystemPage(req, session, requestURL.searchParams.get('msg') || ''));
    }"""
new_connect = """    if (req.method === 'GET' && pathname === '/connect-system') {
      const session = getActiveHeirSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      if (!session) return res.end(renderLockedUpgradePage(req, null, 'Connect System', 'creator_access'));
      const ok = enforceFeatureAccess(req, res, Number(session.heir_id), 'creator_tools');
      if (!ok) return res.end(renderLockedUpgradePage(req, session, 'Connect System', 'creator_access'));
      return res.end(renderConnectSystemPage(req, session, requestURL.searchParams.get('msg') || ''));
    }"""
if old_connect in text:
    text = text.replace(old_connect, new_connect, 1)

# Gate visual streaming
old_visual = """    if (req.method === 'GET' && pathname === '/visual-streaming') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderVisualStreamingPage(req, session, requestURL.searchParams.get('msg') || ''));
    }"""
new_visual = """    if (req.method === 'GET' && pathname === '/visual-streaming') {
      const session = getActiveHeirSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      if (!session) return res.end(renderLockedUpgradePage(req, null, 'Visual Streaming', 'creator_access'));
      const ok = enforceFeatureAccess(req, res, Number(session.heir_id), 'visual_world_creator');
      if (!ok) return res.end(renderLockedUpgradePage(req, session, 'Visual Streaming', 'creator_access'));
      return res.end(renderVisualStreamingPage(req, session, requestURL.searchParams.get('msg') || ''));
    }"""
if old_visual in text:
    text = text.replace(old_visual, new_visual, 1)

p.write_text(text)
print("[OK] monetization enforcement UI patch applied")
PYEOF

########################################
# 4) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "test_results/socket_health_${STAMP}.json" || true

########################################
# 5) TEST LOGINS + FEATURE GATES
########################################
# login basic heir
curl -s -i -c "test_results/heir_cookie_${STAMP}.txt" \
  -X POST "http://127.0.0.1:4900/heir-login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "username=jacobie&pin_code=1234" \
  > "test_results/login_jacobie_${STAMP}.txt" || true

# gated routes with session
curl -s -i -b "test_results/heir_cookie_${STAMP}.txt" "http://127.0.0.1:4900/watch" > "test_results/watch_gate_${STAMP}.txt" || true
curl -s -i -b "test_results/heir_cookie_${STAMP}.txt" "http://127.0.0.1:4900/build" > "test_results/build_gate_${STAMP}.txt" || true
curl -s -i -b "test_results/heir_cookie_${STAMP}.txt" "http://127.0.0.1:4900/connect-system" > "test_results/connect_gate_${STAMP}.txt" || true
curl -s -i -b "test_results/heir_cookie_${STAMP}.txt" "http://127.0.0.1:4900/visual-streaming" > "test_results/visual_gate_${STAMP}.txt" || true

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as monetization_access_rules from monetization_access_rules;" > "snapshots/monetization_access_rules_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as monetization_feature_events from monetization_feature_events;" > "snapshots/monetization_feature_events_${STAMP}.json"
sqlite3 -json db/aam.db "select id, heir_id, feature_code, access_result, event_notes, created_at from monetization_feature_events order by id desc limit 50;" > "snapshots/monetization_feature_events_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, heir_id, wallet_name, wallet_type, wallet_status, tier_code from heir_wallets order by id desc limit 50;" > "snapshots/heir_wallets_tiers_${STAMP}.json"

########################################
# 7) ERROR SCAN
########################################
python3 << 'PYEOF'
from pathlib import Path
import json

root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob("*.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "monetization_enforcement_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] monetization enforcement scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/monetization_enforcement_and_wallet_access_${STAMP}.txt" <<REP
cd ~/aam_full_system

cat > scripts/fix_monetization_enforcement_finish.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FIX MONETIZATION ENFORCEMENT FINISH START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_monetization_finish_${STAMP}.js"
cp db/aam.db "backups/aam_monetization_finish_${STAMP}.db"

bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

sqlite3 -json db/aam.db "select count(*) as monetization_access_rules from monetization_access_rules;" > "snapshots/monetization_access_rules_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as monetization_feature_events from monetization_feature_events;" > "snapshots/monetization_feature_events_${STAMP}.json"
sqlite3 -json db/aam.db "select id, heir_id, feature_code, access_result, event_notes, created_at from monetization_feature_events order by id desc limit 50;" > "snapshots/monetization_feature_events_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, heir_id, wallet_name, wallet_type, wallet_status, tier_code from heir_wallets order by id desc limit 50;" > "snapshots/heir_wallets_tiers_${STAMP}.json"

python3 << 'PYEOF'
from pathlib import Path
import json

root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob("*.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "monetization_enforcement_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] monetization enforcement scan complete: {len(issues)} issues")
PYEOF

cat > "reports/monetization_enforcement_and_wallet_access_${STAMP}.txt" <<REPORT
MONETIZATION ENFORCEMENT + WALLET ACCESS REPORT
Timestamp: ${STAMP}

Verified:
- monetization_access_rules
- monetization_feature_events
- tier sync into heir_wallets
- monetization enforcement snapshots
- fresh monetization enforcement scan

Purpose:
- enforce access tiers
- enforce unlocks
- connect join -> access -> features
- tie monetization to heirs and wallets
- close out the interrupted report step cleanly
REPORT

echo "FIX MONETIZATION ENFORCEMENT FINISH COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/monetization_enforcement_scan_latest.json"
echo "  cat snapshots/monetization_feature_events_tail_${STAMP}.json"
echo "  cat snapshots/heir_wallets_tiers_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/monetization-control"
echo "  termux-open-url http://127.0.0.1:4900/watch"
echo "  termux-open-url http://127.0.0.1:4900/build"
echo "  termux-open-url http://127.0.0.1:4900/connect-system"
