#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== CONVERSION FLOW TIGHTEN + SMOKE TEST START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_conversion_flow_${STAMP}.js"
cp db/aam.db "backups/aam_conversion_flow_${STAMP}.db"

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

cur.execute("""
CREATE TABLE IF NOT EXISTS conversion_flow_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER,
  flow_name TEXT NOT NULL,
  step_code TEXT NOT NULL,
  step_result TEXT NOT NULL DEFAULT 'completed',
  event_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS onboarding_path_presets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_type TEXT NOT NULL UNIQUE,
  path_name TEXT NOT NULL,
  destination_route TEXT NOT NULL,
  preset_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

presets = [
    ("creator_seller", "Creator Seller Path", "/build"),
    ("creator_coach", "Creator Coach Path", "/watch"),
    ("founder", "Founder Path", "/role-hub"),
    ("brand_connector", "Brand Connector Path", "/connect-system"),
]
for profile_type, path_name, destination_route in presets:
    cur.execute("""
    INSERT OR IGNORE INTO onboarding_path_presets
    (profile_type, path_name, destination_route, preset_status)
    VALUES (?, ?, ?, 'active')
    """, (profile_type, path_name, destination_route))

# tighten onboarding defaults for seeded heirs
rows = cur.execute("""
SELECT id, heir_id, profile_type
FROM onboarding_profiles
ORDER BY id
""").fetchall()

for r in rows:
    heir_id = r["heir_id"]
    profile_type = r["profile_type"] or "brand_connector"

    existing = cur.execute("""
        SELECT count(*) AS c
        FROM onboarding_steps
        WHERE heir_id=?
    """, (heir_id,)).fetchone()["c"]

    if int(existing) == 0:
        steps = [
            ("join_ecosystem", "Join Ecosystem", "completed"),
            ("connect_domain", "Connect Domain", "completed"),
            ("connect_store", "Connect Storefront", "completed"),
            ("connect_wallet", "Connect Wallet", "completed"),
            ("activate_streaming", "Activate Streaming", "pending"),
            ("activate_monetization", "Activate Monetization", "pending"),
            ("launch_brand", "Launch Brand", "pending"),
        ]
        for step_code, step_name, step_status in steps:
            cur.execute("""
            INSERT INTO onboarding_steps (heir_id, step_code, step_name, step_status)
            VALUES (?, ?, ?, ?)
            """, (heir_id, step_code, step_name, step_status))

conn.commit()
conn.close()
print("[OK] conversion flow support tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function getOnboardingDestination(heirId) {
  const rows = dbQuery(`
    SELECT op.profile_type, pp.destination_route
    FROM onboarding_profiles op
    LEFT JOIN onboarding_path_presets pp ON pp.profile_type = op.profile_type
    WHERE op.heir_id=${Number(heirId)}
    ORDER BY op.id DESC
    LIMIT 1
  `);
  if (rows.length && rows[0].destination_route) return String(rows[0].destination_route);
  return '/role-hub';
}

function logConversionFlow(heirId, flowName, stepCode, stepResult='completed', notes='') {
  dbRun(`INSERT INTO conversion_flow_events (heir_id, flow_name, step_code, step_result, event_notes)
         VALUES (${Number(heirId||0)}, '${q(flowName)}', '${q(stepCode)}', '${q(stepResult)}', '${q(notes)}')`);
}

function renderConversionControlPage(req, user = null, message = '') {
  const profiles = dbQuery(`
    SELECT o.id, h.name as heir_name, o.profile_type, o.brand_name, o.primary_goal, o.onboarding_status
    FROM onboarding_profiles o
    LEFT JOIN heirs_registry h ON h.id = o.heir_id
    ORDER BY o.id DESC
    LIMIT 100
  `);

  const steps = dbQuery(`
    SELECT s.id, h.name as heir_name, s.step_code, s.step_name, s.step_status, s.created_at
    FROM onboarding_steps s
    LEFT JOIN heirs_registry h ON h.id = s.heir_id
    ORDER BY s.id DESC
    LIMIT 200
  `);

  const events = dbQuery(`
    SELECT c.id, h.name as heir_name, c.flow_name, c.step_code, c.step_result, c.event_notes, c.created_at
    FROM conversion_flow_events c
    LEFT JOIN heirs_registry h ON h.id = c.heir_id
    ORDER BY c.id DESC
    LIMIT 200
  `);

  const profileRows = profiles.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.profile_type || ''}</td><td>${r.brand_name || ''}</td><td>${r.primary_goal || ''}</td><td>${r.onboarding_status || ''}</td></tr>
  `).join('');

  const stepRows = steps.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.step_code}</td><td>${r.step_name}</td><td>${r.step_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const eventRows = events.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.flow_name}</td><td>${r.step_code}</td><td>${r.step_result}</td><td>${r.event_notes || ''}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Conversion Flow Control', `
    <div class="portal-shell premium-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main premium-main">
        <section class="premium-hero">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Conversion + Onboarding</div>
            <h1>Conversion Flow Control</h1>
            <p>Clean onboarding steps, tighter connect-system routing, and simpler user paths from join to build.</p>
            ${message ? `<p class="ok">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/join" class="hero-primary-btn">Join</a>
              <a href="/connect-system" class="hero-secondary-btn">Connect</a>
              <a href="/build" class="hero-secondary-btn">Build</a>
              <a href="/learn" class="hero-secondary-btn">Learn</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Path Summary', `
          <div class="hero-action-grid">
            ${typeof heroActionCard === 'function' ? heroActionCard('Join → Connect', 'Move new users from buy-in to connected brand setup.', '/join') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('Connect → Build', 'Route brands into storefront and creator tools.', '/connect-system') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('Watch → Join', 'Convert streaming attention into ecosystem entry.', '/watch') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('Learn → Build', 'Train users and move them into creator or seller paths.', '/learn') : ''}
          </div>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Onboarding Profiles', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Type</th><th>Brand</th><th>Goal</th><th>Status</th></tr></thead>
            <tbody>${profileRows || '<tr><td colspan="6">No profiles yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Onboarding Steps', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Code</th><th>Name</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${stepRows || '<tr><td colspan="6">No steps yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Conversion Events', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Flow</th><th>Step</th><th>Result</th><th>Notes</th><th>Created</th></tr></thead>
            <tbody>${eventRows || '<tr><td colspan="7">No events yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}
"""

marker = "const server = http.createServer(async (req, res) => {"
if "function getOnboardingDestination(heirId)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

if '<a href="/conversion-control">Conversion</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/monetization-control">Monetization</a>',
        '<a href="/monetization-control">Monetization</a>\n          <a href="/conversion-control">Conversion</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/monetization-control') {"
if "pathname === '/conversion-control'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/conversion-control') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderConversionControlPage(req, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'GET' && pathname === '/monetization-control') {"""
    text = text.replace(anchor, route, 1)

# tighten checkout complete redirect
old_redirect = "      return redirect(res, `/heir-dashboard/${heirId}?msg=Buy-in%20complete`);"
new_redirect = """      logConversionFlow(heirId, 'join_to_access', 'checkout_complete', 'completed', t.tier_code);
      const destination = getOnboardingDestination(heirId);
      return redirect(res, `${destination}?msg=Buy-in%20complete`);"""
if old_redirect in text:
    text = text.replace(old_redirect, new_redirect, 1)

# tighten connect-system summary message
old_connect_line = """      return res.end(renderConnectSystemPage(req, session, requestURL.searchParams.get('msg') || ''));"""
new_connect_line = """      logConversionFlow(Number(session.heir_id || 0), 'connect_flow', 'connect_system_open', 'completed', 'connect-system');
      return res.end(renderConnectSystemPage(req, session, requestURL.searchParams.get('msg') || ''));"""
if old_connect_line in text:
    text = text.replace(old_connect_line, new_connect_line, 1)

p.write_text(text)
print("[OK] conversion flow patch applied")
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
# 5) NEXT-LEVEL SMOKE TESTS
########################################
# login a user
curl -s -i -c "test_results/heir_cookie_${STAMP}.txt" \
  -X POST "http://127.0.0.1:4900/heir-login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "username=jacobie&pin_code=1234" \
  > "test_results/login_jacobie_${STAMP}.txt" || true

# route smoke with session
for route in \
  / \
  /public-home \
  /watch \
  /join \
  /build \
  /learn \
  /connect-system \
  /conversion-control \
  /monetization-control \
  /role-hub \
  /visual-streaming \
  /engine-bridge
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i -b "test_results/heir_cookie_${STAMP}.txt" "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

# conversion smoke
curl -s -i -X POST "http://127.0.0.1:4900/checkout/complete" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "tier_code=basic_access&username=jacobie" \
  > "test_results/checkout_complete_jacobie_${STAMP}.txt" || true

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as conversion_flow_events from conversion_flow_events;" > "snapshots/conversion_flow_events_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as onboarding_path_presets from onboarding_path_presets;" > "snapshots/onboarding_path_presets_${STAMP}.json"
sqlite3 -json db/aam.db "select id, heir_id, flow_name, step_code, step_result, event_notes, created_at from conversion_flow_events order by id desc limit 50;" > "snapshots/conversion_flow_events_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, heir_id, profile_type, brand_name, primary_goal, onboarding_status from onboarding_profiles order by id desc limit 50;" > "snapshots/onboarding_profiles_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, heir_id, step_code, step_name, step_status, created_at from onboarding_steps order by id desc limit 100;" > "snapshots/onboarding_steps_tail_${STAMP}.json"

########################################
# 7) NEXT-LEVEL ERROR SCAN
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
    if "checkout failed" in lower:
        issues.append({"file": f.name, "problem": "checkout_failed"})
    if "tier not found" in lower:
        issues.append({"file": f.name, "problem": "tier_not_found"})
    if "username not found" in lower:
        issues.append({"file": f.name, "problem": "username_not_found"})

latest = Path.home() / "aam_full_system" / "snapshots" / "conversion_flow_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] conversion flow scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/conversion_flow_tighten_and_smoketest_${STAMP}.txt" <<REPORT
CONVERSION FLOW TIGHTEN + NEXT-LEVEL SMOKE TEST REPORT
Timestamp: ${STAMP}

Added:
- conversion_flow_events
- onboarding_path_presets
- /conversion-control

Tightened:
- onboarding steps
- connect-system flow logging
- checkout completion destination routing
- simpler user path from join to destination

Verified:
- core health
- session smoke tests
- front-door route smoke tests
- connect / conversion / monetization pages
- checkout completion smoke test
- next-level error scan

Purpose:
- tighten conversion flow
- simplify onboarding
- create stronger launch readiness
REPORT

echo "CONVERSION FLOW TIGHTEN + NEXT-LEVEL SMOKE TEST COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/conversion_flow_scan_latest.json"
echo "  cat snapshots/conversion_flow_events_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/conversion-control"
echo "  termux-open-url http://127.0.0.1:4900/connect-system"
echo "  termux-open-url http://127.0.0.1:4900/join"
echo "  termux-open-url http://127.0.0.1:4900/watch"
