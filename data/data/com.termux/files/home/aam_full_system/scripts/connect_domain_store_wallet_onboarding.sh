#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== CONNECT DOMAIN + STORE + WALLET + ONBOARDING START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_connect_system_${STAMP}.js"
cp db/aam.db "backups/aam_connect_system_${STAMP}.db"

########################################
# 2) DATABASE
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS connected_domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER,
  domain_name TEXT NOT NULL,
  domain_type TEXT NOT NULL DEFAULT 'custom_domain',
  connection_status TEXT NOT NULL DEFAULT 'connected',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS connected_storefronts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER,
  storefront_name TEXT NOT NULL,
  storefront_url TEXT,
  storefront_type TEXT NOT NULL DEFAULT 'web2_store',
  connection_status TEXT NOT NULL DEFAULT 'connected',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS connected_wallets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER,
  wallet_label TEXT NOT NULL,
  wallet_address TEXT,
  wallet_network TEXT NOT NULL DEFAULT 'web3',
  connection_status TEXT NOT NULL DEFAULT 'connected',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS onboarding_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER,
  profile_type TEXT NOT NULL,
  brand_name TEXT,
  primary_goal TEXT,
  onboarding_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS onboarding_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER,
  step_code TEXT NOT NULL,
  step_name TEXT NOT NULL,
  step_status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS brand_connection_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER,
  event_type TEXT NOT NULL,
  event_payload TEXT,
  event_status TEXT NOT NULL DEFAULT 'processed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

seed_rows = [
    (1, "jacobievision.com", "custom_domain", "Jacobie Vision Store", "https://jacobievision.example", "web2_store", "Jacobie Wallet", "0xJACOBIE", "polygon", "creator_seller", "Jacobie Vision", "Build media + commerce"),
    (2, "anyonecanbeastar.com", "custom_domain", "Anyone Can Be a Star", "https://isaiahstar.example", "stream_store", "Isaiah Wallet", "0xISAIAH", "solana", "creator_seller", "Anyone Can Be a Star", "Grow audience + sell"),
    (3, "aniyahcoach.com", "custom_domain", "Aniyah Singing Coach", "https://aniyahcoach.example", "service_store", "Aniyah Wallet", "0xANIYAH", "polygon", "creator_coach", "Aniyah Coach", "Teach + monetize"),
]

for heir_id, domain_name, domain_type, store_name, store_url, store_type, wallet_label, wallet_address, wallet_network, profile_type, brand_name, goal in seed_rows:
    cur.execute("""
    INSERT OR IGNORE INTO connected_domains (heir_id, domain_name, domain_type, connection_status)
    VALUES (?, ?, ?, 'connected')
    """, (heir_id, domain_name, domain_type))
    cur.execute("""
    INSERT OR IGNORE INTO connected_storefronts (heir_id, storefront_name, storefront_url, storefront_type, connection_status)
    VALUES (?, ?, ?, ?, 'connected')
    """, (heir_id, store_name, store_url, store_type))
    cur.execute("""
    INSERT OR IGNORE INTO connected_wallets (heir_id, wallet_label, wallet_address, wallet_network, connection_status)
    VALUES (?, ?, ?, ?, 'connected')
    """, (heir_id, wallet_label, wallet_address, wallet_network))
    cur.execute("""
    INSERT OR IGNORE INTO onboarding_profiles (heir_id, profile_type, brand_name, primary_goal, onboarding_status)
    VALUES (?, ?, ?, ?, 'active')
    """, (heir_id, profile_type, brand_name, goal))

    for step_code, step_name, step_status in [
        ("connect_domain", "Connect Domain", "completed"),
        ("connect_store", "Connect Storefront", "completed"),
        ("connect_wallet", "Connect Wallet", "completed"),
        ("activate_streaming", "Activate Streaming", "pending"),
        ("activate_monetization", "Activate Monetization", "pending"),
    ]:
        cur.execute("""
        INSERT OR IGNORE INTO onboarding_steps (heir_id, step_code, step_name, step_status)
        VALUES (?, ?, ?, ?)
        """, (heir_id, step_code, step_name, step_status))

    for event_type, payload in [
        ("domain_connected", domain_name),
        ("storefront_connected", store_name),
        ("wallet_connected", wallet_address),
    ]:
        cur.execute("""
        INSERT INTO brand_connection_events (heir_id, event_type, event_payload, event_status)
        VALUES (?, ?, ?, 'processed')
        """, (heir_id, event_type, payload))

conn.commit()
conn.close()
print("[OK] connect system tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function renderConnectSystemPage(req, user = null, message = '') {
  const domains = dbQuery(`
    SELECT d.id, h.name as heir_name, d.domain_name, d.domain_type, d.connection_status, d.created_at
    FROM connected_domains d
    LEFT JOIN heirs_registry h ON h.id = d.heir_id
    ORDER BY d.id DESC
    LIMIT 100
  `);

  const stores = dbQuery(`
    SELECT s.id, h.name as heir_name, s.storefront_name, s.storefront_url, s.storefront_type, s.connection_status, s.created_at
    FROM connected_storefronts s
    LEFT JOIN heirs_registry h ON h.id = s.heir_id
    ORDER BY s.id DESC
    LIMIT 100
  `);

  const wallets = dbQuery(`
    SELECT w.id, h.name as heir_name, w.wallet_label, w.wallet_address, w.wallet_network, w.connection_status, w.created_at
    FROM connected_wallets w
    LEFT JOIN heirs_registry h ON h.id = w.heir_id
    ORDER BY w.id DESC
    LIMIT 100
  `);

  const profiles = dbQuery(`
    SELECT o.id, h.name as heir_name, o.profile_type, o.brand_name, o.primary_goal, o.onboarding_status, o.created_at
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
    SELECT e.id, h.name as heir_name, e.event_type, e.event_payload, e.event_status, e.created_at
    FROM brand_connection_events e
    LEFT JOIN heirs_registry h ON h.id = e.heir_id
    ORDER BY e.id DESC
    LIMIT 200
  `);

  const domainRows = domains.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.domain_name}</td><td>${r.domain_type}</td><td>${r.connection_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const storeRows = stores.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.storefront_name}</td><td>${r.storefront_url || ''}</td><td>${r.storefront_type}</td><td>${r.connection_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const walletRows = wallets.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.wallet_label}</td><td>${r.wallet_address || ''}</td><td>${r.wallet_network}</td><td>${r.connection_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const profileRows = profiles.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.profile_type}</td><td>${r.brand_name || ''}</td><td>${r.primary_goal || ''}</td><td>${r.onboarding_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const stepRows = steps.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.step_code}</td><td>${r.step_name}</td><td>${r.step_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const eventRows = events.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.event_type}</td><td>${r.event_payload || ''}</td><td>${r.event_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Connect Your Brand', `
    <div class="portal-shell premium-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main premium-main">
        <section class="premium-hero">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Connection Layer</div>
            <h1>Connect Your Brand</h1>
            <p>Bring your domain, storefront, wallet, creator role, and brand into the All American Marketplace Holographic Streaming Ecosystem.</p>
            ${message ? `<p class="ok">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/join" class="hero-primary-btn">Join First</a>
              <a href="/watch" class="hero-secondary-btn">Watch & Discover</a>
              <a href="/build" class="hero-secondary-btn">Build & Earn</a>
              <a href="/learn" class="hero-secondary-btn">Learn the System</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('What This Does', `
          <div class="hero-action-grid">
            ${typeof heroActionCard === 'function' ? heroActionCard('Connect Domains', 'Let brands plug their domain into your ecosystem.', '/connect-system') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('Connect Storefronts', 'Bring external stores into the marketplace network.', '/connect-system') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('Connect Wallets', 'Attach wallet identity and monetization flows.', '/connect-system') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('Activate Onboarding', 'Turn every brand into a guided ecosystem participant.', '/connect-system') : ''}
          </div>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Connected Domains', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Domain</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${domainRows || '<tr><td colspan="6">No domains yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Connected Storefronts', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Name</th><th>URL</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${storeRows || '<tr><td colspan="7">No storefronts yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Connected Wallets', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Label</th><th>Address</th><th>Network</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${walletRows || '<tr><td colspan="7">No wallets yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Onboarding Profiles', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Type</th><th>Brand</th><th>Goal</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${profileRows || '<tr><td colspan="7">No onboarding profiles yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Onboarding Steps', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Code</th><th>Name</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${stepRows || '<tr><td colspan="6">No onboarding steps yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Connection Events', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Event</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${eventRows || '<tr><td colspan="6">No events yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}
"""

marker = "const server = http.createServer(async (req, res) => {"
if "function renderConnectSystemPage(req, user = null, message = '')" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

if '<a href="/connect-system">Connect</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/visual-streaming">Visual Streaming</a>',
        '<a href="/visual-streaming">Visual Streaming</a>\n          <a href="/connect-system">Connect</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/visual-streaming') {"
if "pathname === '/connect-system'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/connect-system') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderConnectSystemPage(req, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'GET' && pathname === '/visual-streaming') {"""
    text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] connect system UI applied")
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
# 5) ROUTE CHECKS
########################################
for route in \
  /connect-system \
  /join \
  /watch \
  /build \
  /learn \
  /visual-streaming \
  /engine-bridge \
  /role-hub
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as connected_domains from connected_domains;" > "snapshots/connected_domains_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as connected_storefronts from connected_storefronts;" > "snapshots/connected_storefronts_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as connected_wallets from connected_wallets;" > "snapshots/connected_wallets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as onboarding_profiles from onboarding_profiles;" > "snapshots/onboarding_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as onboarding_steps from onboarding_steps;" > "snapshots/onboarding_steps_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as brand_connection_events from brand_connection_events;" > "snapshots/brand_connection_events_${STAMP}.json"

########################################
# 7) REPORT
########################################
cat > "reports/connect_domain_store_wallet_onboarding_${STAMP}.txt" <<REPORT
CONNECT DOMAIN + STORE + WALLET + ONBOARDING REPORT
Timestamp: ${STAMP}

Added:
- connected_domains
- connected_storefronts
- connected_wallets
- onboarding_profiles
- onboarding_steps
- brand_connection_events
- /connect-system

Purpose:
- allow brands to connect their domain, storefront, and wallet
- create onboarding structure for ecosystem participation
- prepare the platform for real external business integration
REPORT

echo "CONNECT DOMAIN + STORE + WALLET + ONBOARDING COMPLETE: $STAMP"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/connect-system"
echo "  termux-open-url http://127.0.0.1:4900/join"
echo "  termux-open-url http://127.0.0.1:4900/watch"
