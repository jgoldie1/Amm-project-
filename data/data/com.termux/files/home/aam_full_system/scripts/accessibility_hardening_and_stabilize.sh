#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== ACCESSIBILITY HARDENING + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_accessibility_${STAMP}.js"
cp db/aam.db "backups/aam_accessibility_${STAMP}.db"

########################################
# 2) DATABASE SUPPORT
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS accessibility_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER,
  profile_name TEXT NOT NULL,
  text_scale TEXT DEFAULT 'normal',
  contrast_mode TEXT DEFAULT 'standard',
  motion_mode TEXT DEFAULT 'full',
  input_mode TEXT DEFAULT 'standard',
  navigation_mode TEXT DEFAULT 'standard',
  profile_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS accessibility_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER,
  event_type TEXT NOT NULL,
  event_notes TEXT,
  event_status TEXT DEFAULT 'processed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed default profiles for known heirs if missing
cur.execute("SELECT id FROM heirs_registry ORDER BY id")
for (heir_id,) in cur.fetchall():
    exists = cur.execute("SELECT 1 FROM accessibility_profiles WHERE heir_id=? LIMIT 1", (heir_id,)).fetchone()
    if not exists:
        cur.execute("""
        INSERT INTO accessibility_profiles
        (heir_id, profile_name, text_scale, contrast_mode, motion_mode, input_mode, navigation_mode, profile_status)
        VALUES (?, 'Default Accessible Profile', 'large', 'high', 'reduced', 'one_hand', 'simplified', 'active')
        """, (heir_id,))

conn.commit()
conn.close()
print("[OK] accessibility support tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function renderAccessibilityPage(req, user = null, message = '') {
  const profiles = dbQuery(`
    SELECT a.id, h.name as heir_name, a.profile_name, a.text_scale, a.contrast_mode, a.motion_mode, a.input_mode, a.navigation_mode, a.profile_status, a.created_at
    FROM accessibility_profiles a
    LEFT JOIN heirs_registry h ON h.id = a.heir_id
    ORDER BY a.id DESC
    LIMIT 100
  `);

  const events = dbQuery(`
    SELECT e.id, h.name as heir_name, e.event_type, e.event_notes, e.event_status, e.created_at
    FROM accessibility_events e
    LEFT JOIN heirs_registry h ON h.id = e.heir_id
    ORDER BY e.id DESC
    LIMIT 100
  `);

  const profileRows = profiles.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.heir_name || ''}</td>
      <td>${r.profile_name || ''}</td>
      <td>${r.text_scale || ''}</td>
      <td>${r.contrast_mode || ''}</td>
      <td>${r.motion_mode || ''}</td>
      <td>${r.input_mode || ''}</td>
      <td>${r.navigation_mode || ''}</td>
      <td>${r.profile_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const eventRows = events.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.heir_name || ''}</td>
      <td>${r.event_type}</td>
      <td>${r.event_notes || ''}</td>
      <td>${r.event_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Accessibility', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero accessible-hero" aria-labelledby="accessibility-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Accessibility + Inclusion</div>
            <h1 id="accessibility-title">Accessibility Control</h1>
            <p>Large text, reduced motion, higher contrast, simpler navigation, and one-hand-friendly interaction patterns.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/join" class="hero-primary-btn">Join</a>
              <a href="/watch" class="hero-secondary-btn">Watch</a>
              <a href="/build" class="hero-secondary-btn">Build</a>
              <a href="/learn" class="hero-secondary-btn">Learn</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Accessibility Principles', `
          <div class="hero-action-grid">
            ${typeof heroActionCard === 'function' ? heroActionCard('Large Text', 'Bigger text scale improves readability and one-hand use.', '/accessibility') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('High Contrast', 'Stronger contrast helps low-vision users.', '/accessibility') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('Reduced Motion', 'Less motion helps users sensitive to animation.', '/accessibility') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('Simplified Navigation', 'Cleaner movement through the platform reduces overload.', '/accessibility') : ''}
          </div>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Accessibility Profiles', `
          <table aria-label="Accessibility Profiles">
            <thead>
              <tr>
                <th>ID</th><th>Heir</th><th>Profile</th><th>Text</th><th>Contrast</th><th>Motion</th><th>Input</th><th>Navigation</th><th>Status</th><th>Created</th>
              </tr>
            </thead>
            <tbody>${profileRows || '<tr><td colspan="10">No accessibility profiles yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Accessibility Events', `
          <table aria-label="Accessibility Events">
            <thead>
              <tr>
                <th>ID</th><th>Heir</th><th>Event</th><th>Notes</th><th>Status</th><th>Created</th>
              </tr>
            </thead>
            <tbody>${eventRows || '<tr><td colspan="6">No accessibility events yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}
"""

marker = "const server = http.createServer(async (req, res) => {"
if "function renderAccessibilityPage(req, user = null, message = '')" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

if '<a href="/accessibility">Accessibility</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/payment-control">Payments</a>',
        '<a href="/payment-control">Payments</a>\n          <a href="/accessibility">Accessibility</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/payment-control') {"
if "pathname === '/accessibility'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/accessibility') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderAccessibilityPage(req, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'GET' && pathname === '/payment-control') {"""
    text = text.replace(anchor, route, 1)

# Add accessibility styles once
style_block = """
.skip-link {
  position:absolute;
  left:-9999px;
  top:auto;
  width:1px;
  height:1px;
  overflow:hidden;
}
.skip-link:focus {
  left:16px;
  top:16px;
  width:auto;
  height:auto;
  z-index:9999;
  background:#111827;
  color:#fff;
  padding:12px 16px;
  border-radius:12px;
}
html { scroll-behavior: auto; }
body.accessible, .accessible-shell, .accessible-main {
  font-size: 18px;
  line-height: 1.6;
}
a, button, input, select, textarea {
  min-height: 48px;
}
button, .hero-primary-btn, .hero-secondary-btn, .hero-action-link, .feature-link {
  padding-top: 14px !important;
  padding-bottom: 14px !important;
}
:focus {
  outline: 3px solid #60a5fa !important;
  outline-offset: 3px !important;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
"""
if style_block.strip() not in text and "</style>" in text:
    text = text.replace("</style>", style_block + "\n</style>", 1)

# add aria labels to common inputs if easy safe replacements exist
text = text.replace('<input name="username" placeholder="jacobie" />', '<input name="username" placeholder="jacobie" aria-label="Username" />')
text = text.replace('<input name="pin_code" placeholder="1234" type="password" />', '<input name="pin_code" placeholder="1234" type="password" aria-label="PIN code" />')

p.write_text(text)
print("[OK] accessibility UI patch applied")
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
# 5) NEXT-LEVEL ACCESSIBILITY SMOKE TEST
########################################
for route in \
  / \
  /join \
  /watch \
  /build \
  /learn \
  /connect-system \
  /conversion-control \
  /monetization-control \
  /payment-control \
  /accessibility
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as accessibility_profiles from accessibility_profiles;" > "snapshots/accessibility_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as accessibility_events from accessibility_events;" > "snapshots/accessibility_events_${STAMP}.json"
sqlite3 -json db/aam.db "select id, heir_id, profile_name, text_scale, contrast_mode, motion_mode, input_mode, navigation_mode, profile_status, created_at from accessibility_profiles order by id desc limit 50;" > "snapshots/accessibility_profiles_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "accessibility_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] accessibility scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/accessibility_hardening_and_stabilize_${STAMP}.txt" <<REPORT
ACCESSIBILITY HARDENING + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- accessibility_profiles
- accessibility_events
- /accessibility

Improved:
- skip link
- reduced motion support
- stronger focus states
- larger touch targets
- bigger readable text
- better input labels
- simplified accessible interaction layer

Purpose:
- make the platform more disability-friendly
- improve one-hand accessibility
- improve low-vision accessibility
- increase launch readiness and inclusivity
REPORT

echo "ACCESSIBILITY HARDENING + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/accessibility_scan_latest.json"
echo "  cat snapshots/accessibility_profiles_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/accessibility"
echo "  termux-open-url http://127.0.0.1:4900/"
echo "  termux-open-url http://127.0.0.1:4900/join"
