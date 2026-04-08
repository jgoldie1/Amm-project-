#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== UI CLEANUP + STABILIZE START ==="

########################################
# 1) PATCH DASHBOARD UI SHELL
########################################
python << 'PYEOF'
from pathlib import Path
import re

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

# --------------------------------------
# A) Add cleaner UI helpers if missing
# --------------------------------------
helpers = r'''
function uiShell(title, content, user = null, options = {}) {
  const publicMode = options.publicMode !== false;
  const nav = publicMode ? cleanPublicNav() : cleanAdminNav();
  return htmlPage(title, `
    <div class="app-shell">
      <div class="hero-bar">
        <div>
          <div class="eyebrow">${publicMode ? 'All American Marketplace' : 'Admin Control'}</div>
          <h1 class="hero-title">${title}</h1>
          ${options.subtitle ? `<p class="hero-subtitle">${options.subtitle}</p>` : ''}
        </div>
      </div>
      ${nav}
      <div class="page-wrap">
        ${content}
      </div>
    </div>
  `, user);
}

function cleanPublicNav() {
  return `
    <div class="clean-nav">
      <a href="/">Home</a>
      <a href="/world-explorer">Worlds</a>
      <a href="/storefront-explorer">Storefronts</a>
      <a href="/books">Books</a>
      <a href="/wallet-center">Wallet</a>
      <a href="/access-center">Access</a>
      <a href="/creator-hub">Creators</a>
      <a href="/blog">Blog</a>
    </div>
  `;
}

function cleanAdminNav() {
  return `
    <div class="clean-nav admin-nav">
      <a href="/world-state">World State</a>
      <a href="/world-control">World Control</a>
      <a href="/world-execution">Execution</a>
      <a href="/world-persistence">Persistence</a>
      <a href="/world-automation">Automation</a>
      <a href="/world-economy">Economy</a>
      <a href="/world-storefronts">Storefronts</a>
      <a href="/world-settlements">Settlements</a>
      <a href="/world-access">Access</a>
      <a href="/wallet-transactions">Wallet Tx</a>
      <a href="/compliance">Compliance</a>
    </div>
  `;
}

function statCard(label, value, note='') {
  return `
    <div class="stat-card">
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
      ${note ? `<div class="stat-note">${note}</div>` : ''}
    </div>
  `;
}

function cleanSection(title, body, subtitle='') {
  return `
    <section class="clean-section">
      <div class="section-head">
        <h2>${title}</h2>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      <div class="section-body">${body}</div>
    </section>
  `;
}

function featureCard(title, body, href='', cta='Open') {
  return `
    <div class="feature-card">
      <h3>${title}</h3>
      <p>${body}</p>
      ${href ? `<a href="${href}" class="feature-link">${cta}</a>` : ''}
    </div>
  `;
}
'''

marker = "const server = http.createServer(async (req, res) => {"
if "function uiShell(title, content, user = null, options = {})" not in text and marker in text:
    text = text.replace(marker, helpers + "\n" + marker, 1)

# --------------------------------------
# B) Upgrade homepage renderer
# --------------------------------------
old_home_pattern = r"function renderPublicHomePage\(user = null\) \{.*?\n\}"
new_home = r'''
function renderPublicHomePage(user = null) {
  const worlds = dbQuery(`SELECT id, scene_name, scene_type, scene_status FROM scene_registry ORDER BY id DESC LIMIT 6`);
  const storefronts = dbQuery(`SELECT id, storefront_name, storefront_type, storefront_status FROM world_storefronts ORDER BY id DESC LIMIT 6`);
  const books = dbQuery(`SELECT id, title, price_cents FROM books ORDER BY id DESC LIMIT 6`);
  const blogs = dbQuery(`SELECT id, title, slug FROM blog_posts ORDER BY id DESC LIMIT 6`);

  const walletCount = dbQuery(`SELECT count(*) as c FROM wallets`)[0]?.c || 0;
  const worldCount = dbQuery(`SELECT count(*) as c FROM scene_registry`)[0]?.c || 0;
  const storeCount = dbQuery(`SELECT count(*) as c FROM world_storefronts`)[0]?.c || 0;
  const bookCount = dbQuery(`SELECT count(*) as c FROM books`)[0]?.c || 0;

  const stats = `
    <div class="stats-grid">
      ${statCard('Worlds', worldCount, 'Immersive environments')}
      ${statCard('Storefronts', storeCount, 'Commerce surfaces')}
      ${statCard('Books', bookCount, 'Knowledge + media')}
      ${statCard('Wallets', walletCount, 'Finance foundation')}
    </div>
  `;

  const hero = `
    <div class="landing-hero">
      <div class="landing-copy">
        <div class="eyebrow">Holographic Commerce + Worlds + Finance</div>
        <h1>Build, explore, sell, create, and control your digital ecosystem.</h1>
        <p>
          The All American Marketplace system connects immersive worlds, storefronts, books, wallet rails,
          access systems, creator tools, logistics, and live operations into one platform.
        </p>
        <div class="hero-actions">
          <a href="/world-explorer">Explore Worlds</a>
          <a href="/storefront-explorer" class="secondary">Browse Storefronts</a>
        </div>
      </div>
      <div class="hero-panel">
        ${stats}
      </div>
    </div>
  `;

  const worldCards = worlds.map(w => featureCard(
    w.scene_name || 'World',
    `Type: ${w.scene_type || 'N/A'} · Status: ${w.scene_status || 'N/A'}`,
    `/motion-worlds/${w.id}`,
    'Enter World'
  )).join('');

  const storeCards = storefronts.map(s => featureCard(
    s.storefront_name || 'Storefront',
    `Type: ${s.storefront_type || 'N/A'} · Status: ${s.storefront_status || 'N/A'}`,
    `/world-storefronts`,
    'View Storefronts'
  )).join('');

  const bookCards = books.map(b => featureCard(
    b.title || 'Book',
    `Price: $${((Number(b.price_cents || 0))/100).toFixed(2)}`,
    `/books/read/${b.id}`,
    'Read'
  )).join('');

  const articleList = blogs.length
    ? `<div class="article-list">` + blogs.map(b => `<a href="/blog/${b.slug}" class="article-row">${b.title || 'Article'}</a>`).join('') + `</div>`
    : `<div class="muted">No articles yet.</div>`;

  const content = `
    ${hero}
    ${cleanSection('Featured Worlds', `<div class="feature-grid">${worldCards || '<div class="muted">No worlds yet.</div>'}</div>`, 'Explore immersive environments and live world systems.')}
    ${cleanSection('Featured Storefronts', `<div class="feature-grid">${storeCards || '<div class="muted">No storefronts yet.</div>'}</div>`, 'Commerce surfaces connected to the immersive economy.')}
    ${cleanSection('Books + Knowledge', `<div class="feature-grid">${bookCards || '<div class="muted">No books yet.</div>'}</div>`, 'Knowledge, content, and media inside the ecosystem.')}
    ${cleanSection('Latest Articles', articleList, 'Updates, knowledge, and public-facing content.')}
  `;

  return uiShell(
    'All American Marketplace Holographic Ecosystem',
    content,
    user,
    {
      publicMode: true,
      subtitle: 'A unified platform for immersive worlds, digital commerce, creators, logistics, finance, and access control.'
    }
  );
}
'''
text = re.sub(old_home_pattern, new_home, text, flags=re.DOTALL)

# --------------------------------------
# C) Upgrade public explorer pages
# --------------------------------------
replacements = {
r"function renderWorldExplorerPage\(user = null\) \{.*?\n\}": r'''
function renderWorldExplorerPage(user = null) {
  const worlds = dbQuery(`
    SELECT sr.id, sr.scene_name, sr.scene_type, sr.scene_status,
           (SELECT count(*) FROM avatar_positions ap WHERE ap.scene_id = sr.id) as avatar_count,
           (SELECT count(*) FROM shared_world_objects so WHERE so.scene_id = sr.id) as object_count
    FROM scene_registry sr
    ORDER BY sr.id DESC
  `);

  const cards = worlds.map(w => `
    <div class="feature-card">
      <h3>${w.scene_name || ''}</h3>
      <p>Type: ${w.scene_type || ''}</p>
      <p>Status: ${w.scene_status || ''}</p>
      <p>Avatars: ${w.avatar_count || 0} · Objects: ${w.object_count || 0}</p>
      <a href="/motion-worlds/${w.id}" class="feature-link">Open World</a>
    </div>
  `).join('');

  return uiShell('World Explorer', `
    ${cleanSection('Explore Worlds', `<div class="feature-grid">${cards || '<div class="muted">No worlds yet.</div>'}</div>`, 'A cleaner view of immersive spaces and available worlds.')}
  `, user, { publicMode: true, subtitle: 'Browse active immersive worlds without the admin clutter.' });
}
''',

r"function renderStorefrontExplorerPage\(user = null\) \{.*?\n\}": r'''
function renderStorefrontExplorerPage(user = null) {
  const rows = dbQuery(`
    SELECT ws.id, ws.storefront_name, ws.storefront_type, ws.storefront_status,
           (SELECT count(*) FROM storefront_products sp WHERE sp.storefront_id = ws.id) as product_count
    FROM world_storefronts ws
    ORDER BY ws.id DESC
  `);

  const cards = rows.map(r => `
    <div class="feature-card">
      <h3>${r.storefront_name || ''}</h3>
      <p>Type: ${r.storefront_type || ''}</p>
      <p>Status: ${r.storefront_status || ''}</p>
      <p>Products: ${r.product_count || 0}</p>
      <a href="/world-storefronts" class="feature-link">View Commerce Layer</a>
    </div>
  `).join('');

  return uiShell('Storefront Explorer', `
    ${cleanSection('Commerce Surfaces', `<div class="feature-grid">${cards || '<div class="muted">No storefronts yet.</div>'}</div>`, 'Browse available storefronts connected to the world economy.')}
  `, user, { publicMode: true, subtitle: 'A cleaner storefront browsing experience.' });
}
''',

r"function renderWalletCenterPage\(user = null\) \{.*?\n\}": r'''
function renderWalletCenterPage(user = null) {
  const wallets = dbQuery(`SELECT id, wallet_name, wallet_status FROM wallets ORDER BY id DESC LIMIT 12`);
  const tx = dbQuery(`SELECT id, wallet_id, tx_type, amount_cents, note, created_at FROM wallet_transactions ORDER BY id DESC LIMIT 20`);

  const walletCards = wallets.map(w => `
    <div class="feature-card">
      <h3>${w.wallet_name || 'Wallet'}</h3>
      <p>Status: ${w.wallet_status || ''}</p>
      <a href="/wallet-transactions" class="feature-link">View Transactions</a>
    </div>
  `).join('');

  const txRows = tx.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.wallet_id || ''}</td>
      <td>${r.tx_type || ''}</td>
      <td>${r.amount_cents || 0}</td>
      <td>${r.note || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return uiShell('Wallet Center', `
    ${cleanSection('Wallets', `<div class="feature-grid">${walletCards || '<div class="muted">No wallets yet.</div>'}</div>`, 'Financial surfaces and wallet identities.')}
    ${cleanSection('Recent Transactions', `
      <table>
        <thead><tr><th>ID</th><th>Wallet</th><th>Type</th><th>Amount</th><th>Note</th><th>Created</th></tr></thead>
        <tbody>${txRows || '<tr><td colspan="6">No transactions yet.</td></tr>'}</tbody>
      </table>
    `, 'A cleaner transaction overview.')}
  `, user, { publicMode: true, subtitle: 'Wallets, transaction flows, and finance surfaces.' });
}
''',

r"function renderAccessCenterPage\(user = null\) \{.*?\n\}": r'''
function renderAccessCenterPage(user = null) {
  const entitlements = dbQuery(`SELECT id, entitlement_name, entitlement_type, entitlement_status FROM world_entitlements ORDER BY id DESC LIMIT 20`);
  const passes = dbQuery(`SELECT id, scene_id, owner_type, owner_id, entitlement_id, pass_status FROM world_access_passes ORDER BY id DESC LIMIT 20`);

  const entitlementCards = entitlements.map(e => `
    <div class="feature-card">
      <h3>${e.entitlement_name || ''}</h3>
      <p>Type: ${e.entitlement_type || ''}</p>
      <p>Status: ${e.entitlement_status || ''}</p>
    </div>
  `).join('');

  const passRows = passes.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.scene_id || ''}</td>
      <td>${p.owner_type || ''} #${p.owner_id || ''}</td>
      <td>${p.entitlement_id || ''}</td>
      <td>${p.pass_status || ''}</td>
    </tr>
  `).join('');

  return uiShell('Access Center', `
    ${cleanSection('Entitlements', `<div class="feature-grid">${entitlementCards || '<div class="muted">No entitlements yet.</div>'}</div>`, 'Premium access and scene-entry rights.')}
    ${cleanSection('Access Passes', `
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Owner</th><th>Entitlement</th><th>Status</th></tr></thead>
        <tbody>${passRows || '<tr><td colspan="5">No access passes yet.</td></tr>'}</tbody>
      </table>
    `, 'Current granted passes and access links.')}
  `, user, { publicMode: true, subtitle: 'Scene access, entitlement grants, and premium rights.' });
}
''',

r"function renderCreatorHubPage\(user = null\) \{.*?\n\}": r'''
function renderCreatorHubPage(user = null) {
  const podcasts = dbQuery(`SELECT id, title, host_name, status FROM podcasts ORDER BY id DESC LIMIT 12`);
  const rooms = dbQuery(`SELECT id, room_name, room_status FROM podcast_rooms ORDER BY id DESC LIMIT 12`);
  const beatProfiles = dbQuery(`SELECT id, beat_name, beat_mode, bpm, beat_status FROM quantum_beat_profiles ORDER BY id DESC LIMIT 12`);

  const cards = [
    ...podcasts.map(p => `
      <div class="feature-card">
        <h3>${p.title || 'Podcast'}</h3>
        <p>Host: ${p.host_name || ''}</p>
        <p>Status: ${p.status || ''}</p>
      </div>
    `),
    ...rooms.map(r => `
      <div class="feature-card">
        <h3>${r.room_name || 'Room'}</h3>
        <p>Status: ${r.room_status || ''}</p>
      </div>
    `),
    ...beatProfiles.map(b => `
      <div class="feature-card">
        <h3>${b.beat_name || 'Quantum Beat TM'}</h3>
        <p>Mode: ${b.beat_mode || ''}</p>
        <p>BPM: ${b.bpm || ''} · Status: ${b.beat_status || ''}</p>
      </div>
    `)
  ].join('');

  return uiShell('Creator Hub', `
    ${cleanSection('Creator Systems', `<div class="feature-grid">${cards || '<div class="muted">No creator systems yet.</div>'}</div>`, 'Stages, rooms, podcasts, and branded event foundations.')}
  `, user, { publicMode: true, subtitle: 'A cleaner creator-facing experience.' });
}
'''
}

for pattern, repl in replacements.items():
    text = re.sub(pattern, repl, text, flags=re.DOTALL)

# --------------------------------------
# D) Improve CSS inside htmlPage if possible
# --------------------------------------
css_insert = """
    .app-shell { min-height:100vh; }
    .page-wrap { max-width:1180px; margin:0 auto; padding:24px 16px 48px 16px; }
    .hero-bar { max-width:1180px; margin:0 auto; padding:28px 16px 8px 16px; }
    .eyebrow { font-size:12px; letter-spacing:1.6px; text-transform:uppercase; color:#93c5fd; margin-bottom:10px; }
    .hero-title { font-size:36px; line-height:1.05; margin:0; }
    .hero-subtitle { max-width:760px; color:#94a3b8; font-size:15px; line-height:1.6; margin-top:10px; }
    .clean-nav { max-width:1180px; margin:0 auto; padding:10px 16px 0 16px; display:flex; flex-wrap:wrap; gap:10px; }
    .clean-nav a { background:#1e293b; border:1px solid #334155; border-radius:999px; padding:10px 14px; text-decoration:none; color:#e2e8f0; }
    .clean-nav a:hover { background:#2563eb; }
    .admin-nav a { background:#0f172a; }
    .landing-hero { display:grid; grid-template-columns:1.4fr 1fr; gap:20px; align-items:stretch; margin-top:16px; }
    .landing-copy, .hero-panel { background:#111827; border:1px solid #334155; border-radius:22px; padding:24px; }
    .landing-copy h1 { font-size:42px; line-height:1.02; margin:0 0 14px 0; }
    .landing-copy p { color:#cbd5e1; line-height:1.7; font-size:16px; }
    .hero-actions { display:flex; flex-wrap:wrap; gap:12px; margin-top:18px; }
    .hero-actions a { display:inline-block; padding:12px 18px; border-radius:12px; text-decoration:none; background:#2563eb; color:white; }
    .hero-actions a.secondary { background:#334155; }
    .stats-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
    .stat-card { background:#020617; border:1px solid #1e293b; border-radius:18px; padding:18px; }
    .stat-label { color:#94a3b8; font-size:12px; text-transform:uppercase; letter-spacing:1px; }
    .stat-value { font-size:32px; font-weight:700; margin-top:8px; }
    .stat-note { color:#64748b; font-size:13px; margin-top:6px; }
    .clean-section { margin-top:28px; }
    .section-head h2 { margin:0; font-size:26px; }
    .section-head p { color:#94a3b8; margin:8px 0 0 0; }
    .section-body { margin-top:14px; }
    .feature-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; }
    .feature-card { background:#111827; border:1px solid #334155; border-radius:20px; padding:20px; box-shadow:0 8px 24px rgba(0,0,0,.18); }
    .feature-card h3 { margin:0 0 10px 0; font-size:20px; }
    .feature-card p { color:#94a3b8; line-height:1.6; }
    .feature-link { display:inline-block; margin-top:10px; padding:10px 14px; background:#2563eb; color:white; border-radius:12px; text-decoration:none; }
    .article-list { display:grid; gap:10px; }
    .article-row { display:block; background:#111827; border:1px solid #334155; border-radius:14px; padding:14px; color:#e2e8f0; text-decoration:none; }
    table { width:100%; border-collapse:collapse; overflow:hidden; border-radius:14px; }
    thead th { background:#0f172a; color:#cbd5e1; text-align:left; padding:12px; border-bottom:1px solid #334155; }
    tbody td { padding:12px; border-bottom:1px solid #1e293b; vertical-align:top; }
    tbody tr:hover { background:rgba(255,255,255,0.02); }
    @media (max-width: 900px) {
      .landing-hero { grid-template-columns:1fr; }
      .landing-copy h1 { font-size:34px; }
      .hero-title { font-size:30px; }
      .stats-grid { grid-template-columns:1fr 1fr; }
    }
    @media (max-width: 640px) {
      .stats-grid { grid-template-columns:1fr; }
      .clean-nav { gap:8px; }
      .clean-nav a { padding:9px 12px; font-size:14px; }
      .feature-grid { grid-template-columns:1fr; }
    }
"""

if ".app-shell { min-height:100vh; }" not in text:
    text = text.replace(".ok { color:#86efac; }", ".ok { color:#86efac; }\n" + css_insert, 1)

p.write_text(text)
print("[OK] UI cleanup patch applied")
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

cp apps/dashboard.js "backups/dashboard_ui_cleanup_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_ui_cleanup_${STAMP}.js"
cp db/aam.db "backups/aam_ui_cleanup_${STAMP}.db"

cat > "reports/ui_cleanup_${STAMP}.txt" <<REPORT
UI CLEANUP + STABILIZE REPORT
Timestamp: ${STAMP}

What changed:
- cleaner public shell
- reduced homepage clutter
- improved visual hierarchy
- separate clean public/admin nav
- card-based world/storefront/creator presentation
- stronger spacing, typography, and rhythm
- preserved backend functionality

Main public routes:
- /
- /world-explorer
- /storefront-explorer
- /wallet-center
- /access-center
- /creator-hub
REPORT

echo "UI CLEANUP + STABILIZE COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/"
echo "  termux-open-url http://127.0.0.1:4900/world-explorer"
echo "  termux-open-url http://127.0.0.1:4900/storefront-explorer"
echo "  termux-open-url http://127.0.0.1:4900/wallet-center"
echo "  termux-open-url http://127.0.0.1:4900/access-center"
echo "  termux-open-url http://127.0.0.1:4900/creator-hub"
