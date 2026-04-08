#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== ROLE-BASED UI CLEANUP + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_role_ui_${STAMP}.js"
cp db/aam.db "backups/aam_role_ui_${STAMP}.db"

########################################
# 2) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path
import re

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function getPortalSession(req) {
  try {
    if (typeof getActiveHeirSession === 'function') {
      const s = getActiveHeirSession(req);
      if (s) return { kind: 'heir', ...s };
    }
  } catch (e) {}
  return { kind: 'public', role_name: 'public' };
}

function renderPortalNavForSession(req) {
  const session = getPortalSession(req);
  const role = String(session.role_name || 'public');

  const publicLinks = [
    ['/', 'Home'],
    ['/world-explorer', 'Worlds'],
    ['/storefront-explorer', 'Storefronts'],
    ['/creator-hub', 'Creators'],
    ['/heir-login', 'Login']
  ];

  const heirLinks = [
    ['/heir-dashboard/' + Number(session.heir_id || 1), 'My Dashboard'],
    ['/wallet-center', 'Wallet'],
    ['/access-center', 'Access'],
    ['/heirs-ecosystem', 'Heirs'],
    ['/heir-logout', 'Logout']
  ];

  const creatorLinks = [
    ['/creator-hub', 'Creator Hub'],
    ['/storefront-explorer', 'Storefronts'],
    ['/heir-dashboard/' + Number(session.heir_id || 1), 'My Dashboard'],
    ['/heir-logout', 'Logout']
  ];

  const adminLinks = [
    ['/executive-dashboard', 'Executive'],
    ['/heir-finance', 'Finance'],
    ['/heir-payouts', 'Payouts'],
    ['/payout-automation', 'Automation'],
    ['/payout-cycles', 'Cycles'],
    ['/storefront-analytics', 'Analytics'],
    ['/scheduled-payout-jobs', 'Schedules'],
    ['/heir-storefronts', 'Ownership'],
    ['/command-core', 'Command'],
    ['/progress', 'Progress'],
    ['/heir-logout', 'Logout']
  ];

  let links = publicLinks;
  if (role === 'creator') links = creatorLinks;
  else if (role === 'security_admin' || role === 'systems_admin') links = adminLinks;
  else if (role !== 'public') links = heirLinks;

  return `
    <nav class="portal-main-nav role-nav">
      ${links.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}
    </nav>
  `;
}

function renderRoleHubPage(req, user = null) {
  const session = getPortalSession(req);
  const role = String(session.role_name || 'public');

  const roleLabel =
    role === 'security_admin' ? 'Security Admin' :
    role === 'systems_admin' ? 'Systems Admin' :
    role === 'creator' ? 'Creator' :
    role === 'heir' ? 'Heir Member' : 'Public Visitor';

  const cards = [];

  if (role === 'public') {
    cards.push(
      ['World Explorer', '/world-explorer', 'Explore world surfaces and public experiences.'],
      ['Storefront Explorer', '/storefront-explorer', 'Browse storefront pathways and commercial surfaces.'],
      ['Creator Hub', '/creator-hub', 'Discover creator-facing experiences.'],
      ['Heir Login', '/heir-login', 'Sign in to a protected member experience.']
    );
  } else if (role === 'creator') {
    cards.push(
      ['My Dashboard', '/heir-dashboard/' + Number(session.heir_id || 1), 'View your personal creator-linked dashboard.'],
      ['Creator Hub', '/creator-hub', 'Open your media and creator tools.'],
      ['Storefront Explorer', '/storefront-explorer', 'View storefront-linked creator surfaces.'],
      ['Logout', '/heir-logout', 'End the current secure session.']
    );
  } else if (role === 'security_admin' || role === 'systems_admin') {
    cards.push(
      ['Executive Dashboard', '/executive-dashboard', 'View top-level platform command and finance visibility.'],
      ['Heir Finance', '/heir-finance', 'Review heir balances and payout detail.'],
      ['Payout Automation', '/payout-automation', 'Run and review automation payout operations.'],
      ['Storefront Analytics', '/storefront-analytics', 'Review storefront performance visibility.'],
      ['Command Core', '/command-core', 'Open the operator command layer.'],
      ['Progress', '/progress', 'Track platform build and status.']
    );
  } else {
    cards.push(
      ['My Dashboard', '/heir-dashboard/' + Number(session.heir_id || 1), 'View your personal heir dashboard.'],
      ['Wallet Center', '/wallet-center', 'Open wallet and account visibility.'],
      ['Access Center', '/access-center', 'Review access-related surfaces.'],
      ['Heirs Ecosystem', '/heirs-ecosystem', 'Open the heirs network view.'],
      ['Logout', '/heir-logout', 'End the current secure session.']
    );
  }

  return htmlPage('Role Hub', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Role-Based Experience</div>
          <h1>${roleLabel}</h1>
          <p>This hub shows a cleaner view based on the active session role.</p>
        </section>
        <div class="feature-grid">
          ${cards.map(([title, href, desc]) => `
            <div class="feature-card">
              <h3>${title}</h3>
              <p>${desc}</p>
              <a href="${href}" class="feature-link">Open</a>
            </div>
          `).join('')}
        </div>
      </main>
    </div>
  `, user);
}
"""

marker = "const server = http.createServer(async (req, res) => {"
if "function getPortalSession(req)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

# Add route
anchor = "    if (req.method === 'GET' && pathname === '/heir-login') {"
if "pathname === '/role-hub'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/role-hub') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderRoleHubPage(req, session));
    }

    if (req.method === 'GET' && pathname === '/heir-login') {"""
    text = text.replace(anchor, route, 1)

# Add nav link
if '<a href="/role-hub">Role Hub</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/heir-login">Heir Login</a>',
        '<a href="/heir-login">Heir Login</a>\n          <a href="/role-hub">Role Hub</a>'
    )

p.write_text(text)
print("[OK] role-based UI cleanup patch applied")
PYEOF

########################################
# 3) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "snapshots/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "snapshots/jarvis_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5090/health > "snapshots/socket_health_${STAMP}.json" || true

curl -s http://127.0.0.1:4900/role-hub > "snapshots/role_hub_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/heir-login > "snapshots/heir_login_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/progress > "snapshots/progress_${STAMP}.html" || true

########################################
# 4) REPORT
########################################
cat > "reports/role_based_ui_cleanup_${STAMP}.txt" <<REPORT
ROLE-BASED UI CLEANUP + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- role hub page
- role-aware navigation helper
- cleaner separation for public, heir, creator, and admin-style roles

Route:
- /role-hub

Goal:
- reduce clutter
- make navigation cleaner
- prepare for stronger public/member/admin separation
REPORT

echo "ROLE-BASED UI CLEANUP + STABILIZE COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/role-hub"
echo "  termux-open-url http://127.0.0.1:4900/heir-login"
echo "  termux-open-url http://127.0.0.1:4900/progress"
