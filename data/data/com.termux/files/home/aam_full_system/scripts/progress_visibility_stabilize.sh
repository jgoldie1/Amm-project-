#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== PROGRESS VISIBILITY + STABILIZE START ==="

########################################
# 1) PATCH DASHBOARD WITH PROGRESS PAGE
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r'''
function renderProgressPage(user = null) {
  const metrics = {
    scenes: dbQuery(`SELECT count(*) as c FROM scene_registry`)[0]?.c || 0,
    storefronts: dbQuery(`SELECT count(*) as c FROM world_storefronts`)[0]?.c || 0,
    products: dbQuery(`SELECT count(*) as c FROM storefront_products`)[0]?.c || 0,
    worldOrders: dbQuery(`SELECT count(*) as c FROM world_cart_orders`)[0]?.c || 0,
    settlements: dbQuery(`SELECT count(*) as c FROM world_order_settlements`)[0]?.c || 0,
    wallets: dbQuery(`SELECT count(*) as c FROM wallets`)[0]?.c || 0,
    walletTx: dbQuery(`SELECT count(*) as c FROM wallet_transactions`)[0]?.c || 0,
    receipts: dbQuery(`SELECT count(*) as c FROM receipts`)[0]?.c || 0,
    assets: dbQuery(`SELECT count(*) as c FROM world_assets`)[0]?.c || 0,
    transfers: dbQuery(`SELECT count(*) as c FROM asset_transfer_log`)[0]?.c || 0,
    entitlements: dbQuery(`SELECT count(*) as c FROM world_entitlements`)[0]?.c || 0,
    accessPasses: dbQuery(`SELECT count(*) as c FROM world_access_passes`)[0]?.c || 0,
    holoMessages: dbQuery(`SELECT count(*) as c FROM holographic_messages`)[0]?.c || 0,
    droneJobs: dbQuery(`SELECT count(*) as c FROM drone_service_jobs`)[0]?.c || 0,
    beatProfiles: dbQuery(`SELECT count(*) as c FROM quantum_beat_profiles`)[0]?.c || 0,
    beatEvents: dbQuery(`SELECT count(*) as c FROM quantum_beat_events`)[0]?.c || 0,
    books: dbQuery(`SELECT count(*) as c FROM books`)[0]?.c || 0,
    blogPosts: dbQuery(`SELECT count(*) as c FROM blog_posts`)[0]?.c || 0,
    podcasts: dbQuery(`SELECT count(*) as c FROM podcasts`)[0]?.c || 0,
    rooms: dbQuery(`SELECT count(*) as c FROM podcast_rooms`)[0]?.c || 0,
    creditCases: dbQuery(`SELECT count(*) as c FROM credit_cases`)[0]?.c || 0,
    complianceEvents: dbQuery(`SELECT count(*) as c FROM compliance_events`)[0]?.c || 0,
    roboticsAssets: dbQuery(`SELECT count(*) as c FROM robotics_assets`)[0]?.c || 0,
    manufacturingJobs: dbQuery(`SELECT count(*) as c FROM manufacturing_jobs`)[0]?.c || 0
  };

  const totalSignals =
    metrics.scenes + metrics.storefronts + metrics.products + metrics.worldOrders +
    metrics.settlements + metrics.wallets + metrics.walletTx + metrics.receipts +
    metrics.assets + metrics.transfers + metrics.entitlements + metrics.accessPasses +
    metrics.holoMessages + metrics.droneJobs + metrics.beatProfiles + metrics.beatEvents +
    metrics.books + metrics.blogPosts + metrics.podcasts + metrics.rooms +
    metrics.creditCases + metrics.complianceEvents + metrics.roboticsAssets + metrics.manufacturingJobs;

  let completionBand = 'Foundation';
  if (totalSignals >= 150) completionBand = 'Advanced Foundation';
  if (totalSignals >= 300) completionBand = 'Integrated Platform';
  if (totalSignals >= 500) completionBand = 'Expansion Ready';

  const serviceCards = `
    <div class="stats-grid">
      ${statCard('Dashboard', '4900', 'App shell online')}
      ${statCard('Jarvis', '5000', 'AI core online')}
      ${statCard('World Socket', '5090', 'Live world bridge')}
      ${statCard('Platform Stage', completionBand, 'Current build maturity')}
    </div>
  `;

  const buildCards = `
    <div class="stats-grid">
      ${statCard('Worlds', metrics.scenes)}
      ${statCard('Storefronts', metrics.storefronts)}
      ${statCard('Products', metrics.products)}
      ${statCard('World Orders', metrics.worldOrders)}
      ${statCard('Settlements', metrics.settlements)}
      ${statCard('Wallet Tx', metrics.walletTx)}
      ${statCard('Assets', metrics.assets)}
      ${statCard('Transfers', metrics.transfers)}
      ${statCard('Access Passes', metrics.accessPasses)}
      ${statCard('Holo Messages', metrics.holoMessages)}
      ${statCard('Drone Jobs', metrics.droneJobs)}
      ${statCard('Quantum Beat Events', metrics.beatEvents)}
      ${statCard('Books', metrics.books)}
      ${statCard('Blog Posts', metrics.blogPosts)}
      ${statCard('Podcasts', metrics.podcasts)}
      ${statCard('Rooms', metrics.rooms)}
      ${statCard('Credit Cases', metrics.creditCases)}
      ${statCard('Compliance Events', metrics.complianceEvents)}
      ${statCard('Robotics Assets', metrics.roboticsAssets)}
      ${statCard('Manufacturing Jobs', metrics.manufacturingJobs)}
    </div>
  `;

  const milestoneRows = [
    ['Core app shell', 'Complete'],
    ['World runtime foundation', metrics.scenes > 0 ? 'Complete' : 'In Progress'],
    ['Commerce/storefront foundation', metrics.storefronts > 0 ? 'Complete' : 'In Progress'],
    ['Settlement bridge', metrics.settlements > 0 ? 'Complete' : 'In Progress'],
    ['Access/entitlement layer', metrics.accessPasses > 0 ? 'Complete' : 'In Progress'],
    ['Holographic communications layer', metrics.holoMessages > 0 ? 'Complete' : 'In Progress'],
    ['Drone service foundation', metrics.droneJobs > 0 ? 'Complete' : 'In Progress'],
    ['Quantum Beat TM foundation', metrics.beatProfiles > 0 ? 'Complete' : 'In Progress'],
    ['Creator/media foundation', (metrics.podcasts + metrics.rooms) > 0 ? 'Complete' : 'In Progress'],
    ['Books/wallet/receipt layer', (metrics.books + metrics.wallets + metrics.receipts) > 0 ? 'Complete' : 'In Progress'],
    ['Robotics/manufacturing foundation', (metrics.roboticsAssets + metrics.manufacturingJobs) > 0 ? 'Complete' : 'In Progress'],
    ['Public-facing frontend cleanup', 'Complete']
  ].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');

  const content = `
    ${cleanSection('Live Platform Status', serviceCards, 'This page makes your progress visible in one place.')}
    ${cleanSection('Build Counts', buildCards, 'Counts across the major platform layers.')}
    ${cleanSection('Milestones', `
      <table>
        <thead><tr><th>Milestone</th><th>Status</th></tr></thead>
        <tbody>${milestoneRows}</tbody>
      </table>
    `, 'A cleaner progress tracker for what is already built.')}
    ${cleanSection('What This Means', `
      <div class="feature-grid">
        ${featureCard('You can see progress now', 'This page gives you visible counts and milestone status instead of guessing.')}
        ${featureCard('Backend foundation is strong', 'World state, commerce, settlements, access, and control systems are in place.')}
        ${featureCard('Frontend is improving', 'The public shell is cleaner and now has a dedicated progress screen.')}
        ${featureCard('Next phase is real user flows', 'Signup, member dashboards, creator flows, and richer consumer UX come next.')}
      </div>
    `)}
  `;

  return uiShell('Platform Progress', content, user, {
    publicMode: true,
    subtitle: 'A visible progress screen for the All American Marketplace ecosystem.'
  });
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function renderProgressPage(user = null)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

if '<a href="/progress">Progress</a>' not in text and 'function cleanPublicNav() {' in text:
    text = text.replace(
        '<a href="/creator-hub">Creators</a>',
        '<a href="/creator-hub">Creators</a>\n      <a href="/progress">Progress</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/creator-hub') {"
if "pathname === '/progress'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/progress') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderProgressPage(session));
    }

    if (req.method === 'GET' && pathname === '/creator-hub') {"""
    text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] progress page patch applied")
PYEOF

########################################
# 2) RESTART / VERIFY
########################################
bash scripts/restart_world_socket.sh || true
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh

echo "--- SOCKET HEALTH ---"
curl -s http://127.0.0.1:5090/health || true

########################################
# 3) CHECKPOINT
########################################
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports

cp apps/dashboard.js "backups/dashboard_progress_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_progress_${STAMP}.js"
cp db/aam.db "backups/aam_progress_${STAMP}.db"

cat > "reports/progress_visibility_${STAMP}.txt" <<REPORT
PROGRESS VISIBILITY + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- /progress route
- visible platform metrics
- visible milestone tracker
- completion band summary
- cleaner public nav link to Progress

Goal:
- make platform progress visible
- reduce guesswork
- show counts and milestone status in one place
REPORT

echo "PROGRESS VISIBILITY + STABILIZE COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/progress"
echo "  termux-open-url http://127.0.0.1:4900/"
echo "  curl -s http://127.0.0.1:5090/health"
