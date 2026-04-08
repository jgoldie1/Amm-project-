#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== PORTAL REDESIGN NEXT LEVEL START ==="

########################################
# 1) PATCH DASHBOARD.JS
########################################
python << 'PYEOF'
from pathlib import Path
import re

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

# --------------------------------------
# A) helper insertion
# --------------------------------------
helpers = r'''
function portalHeader() {
  return `
    <header class="portal-topbar">
      <div class="portal-topbar-inner">
        <div class="portal-brand">
          <div class="portal-brand-mark">AAM</div>
          <div class="portal-brand-copy">
            <div class="portal-brand-title">All American Marketplace</div>
            <div class="portal-brand-sub">Holographic Ecosystem</div>
          </div>
        </div>

        <nav class="portal-main-nav">
          <a href="/">Portal</a>
          <a href="/world-explorer">Worlds</a>
          <a href="/storefront-explorer">Marketplace</a>
          <a href="/wallet-center">Vault</a>
          <a href="/creator-hub">Creators</a>
          <a href="/progress">Progress</a>
        </nav>

        <div class="portal-actions">
          <a href="/command-core" class="portal-admin-btn">Command Core</a>
        </div>
      </div>
    </header>
  `;
}

function portalHeroBlock() {
  return `
    <section class="portal-hero">
      <div class="portal-hero-copy">
        <div class="portal-kicker">Immersive Commerce • Worlds • Finance • Creator Systems</div>
        <h1>Enter the All American Marketplace Portal</h1>
        <p>
          A unified system for immersive worlds, digital commerce, wallets, books, creator media,
          access control, logistics, automation, and live operational command.
        </p>
        <div class="portal-hero-actions">
          <a href="/world-explorer">Enter Worlds</a>
          <a href="/storefront-explorer" class="secondary">Open Marketplace</a>
        </div>
      </div>
      <div class="portal-hero-panel">
        <div class="signal-card">
          <div class="signal-label">System Mode</div>
          <div class="signal-value">Integrated Platform</div>
          <div class="signal-note">Worlds • Commerce • Access • Creator • Ops</div>
        </div>
      </div>
    </section>
  `;
}

function portalGateway(title, subtitle, href, icon='◆') {
  return `
    <a href="${href}" class="portal-gateway">
      <div class="portal-gateway-icon">${icon}</div>
      <div class="portal-gateway-copy">
        <h3>${title}</h3>
        <p>${subtitle}</p>
      </div>
      <div class="portal-gateway-arrow">→</div>
    </a>
  `;
}

function renderPortalHomePage(user = null) {
  const sceneCount = dbQuery(`SELECT count(*) as c FROM scene_registry`)[0]?.c || 0;
  const storefrontCount = dbQuery(`SELECT count(*) as c FROM world_storefronts`)[0]?.c || 0;
  const txCount = dbQuery(`SELECT count(*) as c FROM wallet_transactions`)[0]?.c || 0;
  const creatorCount =
    (dbQuery(`SELECT count(*) as c FROM podcasts`)[0]?.c || 0) +
    (dbQuery(`SELECT count(*) as c FROM podcast_rooms`)[0]?.c || 0);

  const gateways = `
    <div class="portal-gateway-grid">
      ${portalGateway('Enter Worlds', 'Explore immersive districts, motion worlds, avatar spaces, and live world systems.', '/world-explorer', '◎')}
      ${portalGateway('Marketplace', 'Browse storefronts, commerce surfaces, books, products, and order flows.', '/storefront-explorer', '▣')}
      ${portalGateway('Vault', 'View wallets, receipts, settlements, and financial activity across the platform.', '/wallet-center', '◈')}
      ${portalGateway('Creator Signal', 'Access podcasts, rooms, creator systems, and Quantum Beat TM foundations.', '/creator-hub', '◉')}
      ${portalGateway('Access Grid', 'Review entitlements, passes, and premium access layers.', '/access-center', '◇')}
      ${portalGateway('Command Core', 'Open the deeper control systems for worlds, compliance, logistics, and admin operations.', '/command-core', '✦')}
    </div>
  `;

  const statusStrip = `
    <section class="portal-status-strip">
      <div class="status-chip"><span>${sceneCount}</span> Worlds</div>
      <div class="status-chip"><span>${storefrontCount}</span> Storefronts</div>
      <div class="status-chip"><span>${txCount}</span> Wallet Transactions</div>
      <div class="status-chip"><span>${creatorCount}</span> Creator Signals</div>
      <div class="status-chip"><span>5090</span> Live World Socket</div>
      <div class="status-chip"><span>Stable</span> Platform State</div>
    </section>
  `;

  const featureBands = `
    <section class="portal-feature-band">
      <div class="portal-band-card">
        <h3>World Engine</h3>
        <p>Live world state, scene commands, avatar movement, object interactions, checkpoints, recovery, and orchestration.</p>
      </div>
      <div class="portal-band-card">
        <h3>Commerce Engine</h3>
        <p>Storefronts, products, world orders, settlement records, receipts, wallet transactions, and ownership flows.</p>
      </div>
      <div class="portal-band-card">
        <h3>Creator Engine</h3>
        <p>Books, blogs, podcasts, rooms, media foundations, voice concepts, and Quantum Beat TM event architecture.</p>
      </div>
    </section>
  `;

  return htmlPage('All American Marketplace Portal', `
    <div class="portal-shell">
      ${portalHeader()}
      <main class="portal-main">
        ${portalHeroBlock()}
        ${statusStrip}
        ${gateways}
        ${featureBands}
      </main>
    </div>
  `, user);
}

function renderCommandCorePage(user = null) {
  const cards = `
    <div class="command-core-grid">
      ${portalGateway('World State', 'Inspect shared world state, avatars, objects, and synchronization.', '/world-state', '◎')}
      ${portalGateway('World Control', 'Operational control over worlds and execution systems.', '/world-control', '◌')}
      ${portalGateway('World Execution', 'Commands, actions, and execution tracking.', '/world-execution', '✦')}
      ${portalGateway('World Persistence', 'Sessions, checkpoints, replay, and recovery.', '/world-persistence', '◈')}
      ${portalGateway('Automation', 'World rules, jobs, and orchestration events.', '/world-automation', '◇')}
      ${portalGateway('World Economy', 'Assets, ownership, inventory, and transfers.', '/world-economy', '▣')}
      ${portalGateway('Storefronts', 'Storefronts, products, orders, and activity.', '/world-storefronts', '◉')}
      ${portalGateway('Settlements', 'Settlement records, receipt bridge, and commerce log.', '/world-settlements', '◍')}
      ${portalGateway('World Access', 'Entitlements, passes, and access logs.', '/world-access', '◆')}
      ${portalGateway('Wallet Transactions', 'Financial transaction detail and wallet movement.', '/wallet-transactions', '◈')}
      ${portalGateway('Compliance', 'Compliance events, escalation, and templates.', '/compliance', '▦')}
      ${portalGateway('Logistics + IoT', 'Operational logistics, IoT, robotics, and manufacturing layers.', '/logistics', '⬢')}
    </div>
  `;

  return htmlPage('Command Core', `
    <div class="portal-shell">
      ${portalHeader()}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Admin + Operations + Deep Systems</div>
          <h1>Command Core</h1>
          <p>Control-center access for the deeper operational layers of the platform.</p>
        </section>
        ${cards}
      </main>
    </div>
  `, user);
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function renderPortalHomePage(user = null)" not in text and marker in text:
    text = text.replace(marker, helpers + "\n" + marker, 1)

# --------------------------------------
# B) replace "/" route output with portal home
# --------------------------------------
old_home_route = """    if (req.method === 'GET' && pathname === '/') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPublicHomePage(session));
    }"""
new_home_route = """    if (req.method === 'GET' && pathname === '/') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPortalHomePage(session));
    }"""
if old_home_route in text:
    text = text.replace(old_home_route, new_home_route, 1)

# --------------------------------------
# C) add command core route
# --------------------------------------
anchor = "    if (req.method === 'GET' && pathname === '/world-explorer') {"
if "pathname === '/command-core'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/command-core') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderCommandCorePage(session));
    }

    if (req.method === 'GET' && pathname === '/world-explorer') {"""
    text = text.replace(anchor, route, 1)

# --------------------------------------
# D) remove ugly old top link strip from htmlPage styling/content where possible
# --------------------------------------
css_insert = """
    .portal-shell { min-height:100vh; background:
      radial-gradient(circle at top left, rgba(37,99,235,0.18), transparent 32%),
      radial-gradient(circle at top right, rgba(14,165,233,0.12), transparent 26%),
      linear-gradient(180deg,#020617 0%,#0b1220 100%);
    }
    .portal-topbar { position:sticky; top:0; z-index:20; backdrop-filter: blur(12px); background:rgba(2,6,23,0.72); border-bottom:1px solid rgba(51,65,85,0.8); }
    .portal-topbar-inner { max-width:1280px; margin:0 auto; padding:16px 20px; display:flex; align-items:center; justify-content:space-between; gap:18px; }
    .portal-brand { display:flex; align-items:center; gap:14px; min-width:0; }
    .portal-brand-mark { width:48px; height:48px; border-radius:16px; display:flex; align-items:center; justify-content:center; font-weight:800; letter-spacing:1px; background:linear-gradient(135deg,#2563eb,#06b6d4); color:white; box-shadow:0 10px 30px rgba(37,99,235,0.35); }
    .portal-brand-title { font-size:18px; font-weight:700; color:#f8fafc; }
    .portal-brand-sub { font-size:12px; color:#93c5fd; letter-spacing:1px; text-transform:uppercase; }
    .portal-main-nav { display:flex; flex-wrap:wrap; gap:10px; align-items:center; justify-content:center; }
    .portal-main-nav a { color:#cbd5e1; text-decoration:none; padding:10px 14px; border-radius:999px; border:1px solid rgba(51,65,85,0.9); background:rgba(15,23,42,0.72); }
    .portal-main-nav a:hover { background:#1d4ed8; color:white; }
    .portal-actions { display:flex; align-items:center; }
    .portal-admin-btn { background:#f8fafc; color:#0f172a; text-decoration:none; padding:11px 16px; border-radius:12px; font-weight:700; }
    .portal-main { max-width:1280px; margin:0 auto; padding:28px 20px 56px 20px; }
    .portal-hero { display:grid; grid-template-columns:1.35fr .85fr; gap:22px; align-items:stretch; }
    .portal-hero-copy, .portal-hero-panel { background:linear-gradient(180deg,rgba(17,24,39,0.95),rgba(10,15,28,0.95)); border:1px solid rgba(51,65,85,0.95); border-radius:28px; padding:28px; box-shadow:0 18px 60px rgba(0,0,0,0.28); }
    .portal-kicker { font-size:12px; text-transform:uppercase; letter-spacing:1.6px; color:#7dd3fc; margin-bottom:12px; }
    .portal-hero-copy h1, .portal-subhero h1 { font-size:50px; line-height:1.02; margin:0 0 14px 0; color:#f8fafc; }
    .portal-hero-copy p, .portal-subhero p { font-size:17px; line-height:1.72; color:#cbd5e1; max-width:780px; }
    .portal-hero-actions { display:flex; flex-wrap:wrap; gap:14px; margin-top:22px; }
    .portal-hero-actions a { text-decoration:none; padding:13px 18px; border-radius:14px; background:#2563eb; color:white; font-weight:700; }
    .portal-hero-actions a.secondary { background:#1e293b; }
    .signal-card { height:100%; border-radius:22px; background:linear-gradient(180deg,#020617,#0f172a); border:1px solid rgba(30,41,59,0.95); padding:24px; display:flex; flex-direction:column; justify-content:center; }
    .signal-label { font-size:12px; text-transform:uppercase; letter-spacing:1.5px; color:#7dd3fc; }
    .signal-value { margin-top:10px; font-size:34px; font-weight:800; color:#f8fafc; }
    .signal-note { margin-top:10px; color:#94a3b8; line-height:1.65; }
    .portal-status-strip { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:12px; margin-top:18px; }
    .status-chip { background:rgba(15,23,42,0.82); border:1px solid rgba(51,65,85,0.95); border-radius:16px; padding:14px; color:#cbd5e1; text-align:center; }
    .status-chip span { display:block; font-size:24px; font-weight:800; color:#f8fafc; margin-bottom:4px; }
    .portal-gateway-grid, .command-core-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:18px; margin-top:24px; }
    .portal-gateway { display:grid; grid-template-columns:64px 1fr auto; gap:16px; align-items:center; text-decoration:none; padding:22px; border-radius:24px; background:linear-gradient(180deg,rgba(17,24,39,0.96),rgba(12,18,33,0.96)); border:1px solid rgba(51,65,85,0.95); box-shadow:0 14px 40px rgba(0,0,0,0.22); color:#e2e8f0; }
    .portal-gateway:hover { transform:translateY(-2px); border-color:#3b82f6; }
    .portal-gateway-icon { width:64px; height:64px; border-radius:18px; display:flex; align-items:center; justify-content:center; font-size:28px; background:linear-gradient(135deg,rgba(37,99,235,0.22),rgba(6,182,212,0.22)); color:#7dd3fc; }
    .portal-gateway-copy h3 { margin:0 0 6px 0; font-size:22px; color:#f8fafc; }
    .portal-gateway-copy p { margin:0; color:#94a3b8; line-height:1.6; }
    .portal-gateway-arrow { font-size:24px; color:#60a5fa; }
    .portal-feature-band { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; margin-top:24px; }
    .portal-band-card { background:rgba(15,23,42,0.85); border:1px solid rgba(51,65,85,0.95); border-radius:22px; padding:22px; }
    .portal-band-card h3 { margin:0 0 10px 0; color:#f8fafc; font-size:22px; }
    .portal-band-card p { margin:0; color:#94a3b8; line-height:1.7; }
    .portal-subhero { margin-bottom:20px; padding:10px 0 8px 0; }
    @media (max-width: 1100px) {
      .portal-topbar-inner { flex-wrap:wrap; }
      .portal-hero { grid-template-columns:1fr; }
      .portal-status-strip { grid-template-columns:repeat(3,minmax(0,1fr)); }
      .portal-feature-band { grid-template-columns:1fr; }
    }
    @media (max-width: 700px) {
      .portal-hero-copy h1, .portal-subhero h1 { font-size:34px; }
      .portal-status-strip { grid-template-columns:repeat(2,minmax(0,1fr)); }
      .portal-main-nav { justify-content:flex-start; }
      .portal-gateway { grid-template-columns:56px 1fr; }
      .portal-gateway-arrow { display:none; }
    }
"""

if ".portal-shell { min-height:100vh;" not in text:
    text = text.replace(".ok { color:#86efac; }", ".ok { color:#86efac; }\n" + css_insert, 1)

# Optional: soften old legacy nav labels if they still appear in a visible header block
text = text.replace("Business Manager • FinBank • Jarvis", "All American Marketplace Portal")

p.write_text(text)
print("[OK] portal redesign patch applied")
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

cp apps/dashboard.js "backups/dashboard_portal_redesign_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_portal_redesign_${STAMP}.js"
cp db/aam.db "backups/aam_portal_redesign_${STAMP}.db"

cat > "reports/portal_redesign_${STAMP}.txt" <<REPORT
PORTAL REDESIGN NEXT LEVEL REPORT
Timestamp: ${STAMP}

What changed:
- replaced cluttered top experience with a portal shell
- added branded header and cleaner primary nav
- created major gateway-based homepage
- added Command Core entry instead of dumping all admin links in public view
- improved visual hierarchy and first impression
- preserved underlying routes and systems

Key public routes:
- /
- /world-explorer
- /storefront-explorer
- /wallet-center
- /access-center
- /creator-hub
- /progress

Key control route:
- /command-core
REPORT

echo "PORTAL REDESIGN NEXT LEVEL COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/"
echo "  termux-open-url http://127.0.0.1:4900/command-core"
echo "  termux-open-url http://127.0.0.1:4900/world-explorer"
echo "  termux-open-url http://127.0.0.1:4900/storefront-explorer"
echo "  termux-open-url http://127.0.0.1:4900/progress"
