#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== SESSION-AWARE HOME SPLIT START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_home_split_${STAMP}.js"
cp db/aam.db "backups/aam_home_split_${STAMP}.db"

########################################
# 2) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function renderPublicHomePage(user = null) {
  return htmlPage('All American Marketplace', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Public Experience</div>
          <h1>All American Marketplace</h1>
          <p>Explore worlds, storefronts, creators, and the public-facing marketplace ecosystem.</p>
        </section>
        <div class="feature-grid">
          <div class="feature-card">
            <h3>World Explorer</h3>
            <p>Browse public world surfaces and immersive pathways.</p>
            <a href="/world-explorer" class="feature-link">Open Worlds</a>
          </div>
          <div class="feature-card">
            <h3>Storefront Explorer</h3>
            <p>Review public storefront and commerce layers.</p>
            <a href="/storefront-explorer" class="feature-link">Open Storefronts</a>
          </div>
          <div class="feature-card">
            <h3>Creator Hub</h3>
            <p>Discover creator-facing surfaces and media pathways.</p>
            <a href="/creator-hub" class="feature-link">Open Creators</a>
          </div>
          <div class="feature-card">
            <h3>Heir Login</h3>
            <p>Sign in to the protected heirs network experience.</p>
            <a href="/heir-login" class="feature-link">Secure Login</a>
          </div>
        </div>
      </main>
    </div>
  `, user);
}

function renderMemberHomePage(req, user = null) {
  const session = typeof getPortalSession === 'function' ? getPortalSession(req) : { role_name: 'public' };
  const role = String(session.role_name || 'public');
  const heirId = Number(session.heir_id || 1);

  let title = 'Member Home';
  let desc = 'Your personalized platform home.';
  let cards = [];

  if (role === 'creator') {
    title = 'Creator Home';
    desc = 'Creator-focused access to dashboard, storefronts, and media surfaces.';
    cards = [
      ['My Dashboard', `/heir-dashboard/${heirId}`, 'Open your creator-linked dashboard.'],
      ['Creator Hub', '/creator-hub', 'Open creator tools and media surfaces.'],
      ['Storefront Explorer', '/storefront-explorer', 'Review linked commercial surfaces.'],
      ['Role Hub', '/role-hub', 'Return to your role hub.']
    ];
  } else if (role === 'security_admin' || role === 'systems_admin') {
    title = 'Operator Home';
    desc = 'Executive and operator command access for finance, payouts, and platform intelligence.';
    cards = [
      ['Executive Dashboard', '/executive-dashboard', 'Open the executive command layer.'],
      ['Heir Finance', '/heir-finance', 'Review balances and payout visibility.'],
      ['Payout Automation', '/payout-automation', 'Run payout automation actions.'],
      ['Storefront Analytics', '/storefront-analytics', 'Review storefront performance.'],
      ['Role Hub', '/role-hub', 'Return to your role hub.']
    ];
  } else {
    title = 'Heir Home';
    desc = 'Your member-focused access to the heirs network and personal platform tools.';
    cards = [
      ['My Dashboard', `/heir-dashboard/${heirId}`, 'Open your heir dashboard.'],
      ['Wallet Center', '/wallet-center', 'Review wallet-linked surfaces.'],
      ['Access Center', '/access-center', 'Open access-related surfaces.'],
      ['Heirs Ecosystem', '/heirs-ecosystem', 'Review the heirs network.'],
      ['Role Hub', '/role-hub', 'Return to your role hub.']
    ];
  }

  return htmlPage(title, `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Session-Aware Experience</div>
          <h1>${title}</h1>
          <p>${desc}</p>
        </section>
        <div class="feature-grid">
          ${cards.map(([label, href, desc]) => `
            <div class="feature-card">
              <h3>${label}</h3>
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
if "function renderPublicHomePage(user = null)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

# add routes
anchor = "    if (req.method === 'GET' && pathname === '/role-hub') {"
if "pathname === '/member-home'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/member-home') {
      const session = requireHeirRole(req, res, []);
      if (!session) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderMemberHomePage(req, session));
    }

    if (req.method === 'GET' && pathname === '/public-home') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPublicHomePage(session));
    }

    if (req.method === 'GET' && pathname === '/role-hub') {"""
    text = text.replace(anchor, route, 1)

# make / session-aware if the route is easy to replace
home_old = """    if (req.method === 'GET' && pathname === '/') {"""
if home_old in text and "pathname === '/public-home'" in text:
    text = text.replace(
        home_old,
        """    if (req.method === 'GET' && pathname === '/') {
      const portalSession = typeof getPortalSession === 'function' ? getPortalSession(req) : { kind: 'public', role_name: 'public' };
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      if (portalSession && portalSession.kind === 'heir') {
        return res.end(renderMemberHomePage(req, portalSession));
      }
      return res.end(renderPublicHomePage(portalSession));
    }

    if (req.method === 'GET' && pathname === '/__old_home_disabled__') {""",
        1
    )

# add nav links
if '<a href="/member-home">Member Home</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/role-hub">Role Hub</a>',
        '<a href="/role-hub">Role Hub</a>\n          <a href="/member-home">Member Home</a>\n          <a href="/public-home">Public Home</a>'
    )

p.write_text(text)
print("[OK] session-aware home split patch applied")
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

curl -s http://127.0.0.1:4900/public-home > "snapshots/public_home_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/heir-login > "snapshots/heir_login_${STAMP}.html" || true
curl -s http://127.0.0.1:4900/progress > "snapshots/progress_${STAMP}.html" || true

########################################
# 4) REPORT
########################################
cat > "reports/session_aware_home_split_${STAMP}.txt" <<REPORT
SESSION-AWARE HOME SPLIT REPORT
Timestamp: ${STAMP}

Added:
- public home
- member home
- session-aware root route behavior
- cleaner separation between public and logged-in experiences

Routes:
- /public-home
- /member-home
- /
REPORT

echo "SESSION-AWARE HOME SPLIT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/"
echo "  termux-open-url http://127.0.0.1:4900/public-home"
echo "  termux-open-url http://127.0.0.1:4900/member-home"
echo "  termux-open-url http://127.0.0.1:4900/role-hub"
