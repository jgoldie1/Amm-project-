#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== BUY-IN + JOIN + CHECKOUT + UNLOCK START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_buyin_${STAMP}.js"
cp db/aam.db "backups/aam_buyin_${STAMP}.db"

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
CREATE TABLE IF NOT EXISTS membership_tiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tier_name TEXT NOT NULL,
  tier_code TEXT NOT NULL UNIQUE,
  price_cents INTEGER NOT NULL DEFAULT 0,
  tier_type TEXT NOT NULL DEFAULT 'access',
  tier_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS ecosystem_access_passes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_type TEXT NOT NULL,
  owner_id INTEGER NOT NULL,
  tier_code TEXT NOT NULL,
  pass_status TEXT NOT NULL DEFAULT 'active',
  activated_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS checkout_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_type TEXT NOT NULL,
  owner_id INTEGER,
  tier_code TEXT NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  checkout_status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS unlock_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_type TEXT NOT NULL,
  owner_id INTEGER NOT NULL,
  tier_code TEXT NOT NULL,
  unlock_scope TEXT NOT NULL,
  unlock_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

tiers = [
    ("Basic Access", "basic_access", 1000, "access"),
    ("Creator Access", "creator_access", 2500, "creator"),
    ("Storefront Access", "storefront_access", 5000, "storefront"),
    ("Founder Heir Access", "founder_heir", 10000, "founder"),
]

for tier_name, tier_code, price_cents, tier_type in tiers:
    exists = cur.execute("SELECT 1 FROM membership_tiers WHERE tier_code=? LIMIT 1", (tier_code,)).fetchone()
    if not exists:
        cur.execute("""
        INSERT INTO membership_tiers (tier_name, tier_code, price_cents, tier_type, tier_status)
        VALUES (?, ?, ?, ?, 'active')
        """, (tier_name, tier_code, price_cents, tier_type))

conn.commit()
conn.close()
print("[OK] buy-in tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function renderJoinPage(req, user = null, message = '') {
  const tiers = dbQuery(`
    SELECT id, tier_name, tier_code, price_cents, tier_type
    FROM membership_tiers
    WHERE tier_status='active'
    ORDER BY price_cents ASC, id ASC
  `);

  const cards = tiers.map(t => `
    <div class="feature-card compact-card">
      <div class="compact-card-head"><h3>${t.tier_name}</h3></div>
      <p><strong>$${((Number(t.price_cents || 0))/100).toFixed(2)}</strong></p>
      <p>Tier code: ${t.tier_code}</p>
      <p>Type: ${t.tier_type}</p>
      <form method="POST" action="/checkout">
        <input type="hidden" name="tier_code" value="${t.tier_code}" />
        <button type="submit">Choose ${t.tier_name}</button>
      </form>
    </div>
  `).join('');

  return htmlPage('Join the Ecosystem', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main cleaner-main">
        <section class="portal-subhero clean-hero">
          <div class="portal-kicker">Join / Buy-In</div>
          <h1>Enter the Ecosystem</h1>
          <p>Choose an access tier to unlock your place in the platform economy.</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>
        <div class="feature-grid compact-grid">
          ${cards}
        </div>
      </main>
    </div>
  `, user);
}

function renderCheckoutPage(req, user = null, tierCode = '', message = '') {
  const rows = dbQuery(`
    SELECT tier_name, tier_code, price_cents, tier_type
    FROM membership_tiers
    WHERE tier_code='${q(tierCode)}'
    LIMIT 1
  `);

  if (!rows.length) {
    return htmlPage('Checkout', `<div class="card"><h2>Tier not found</h2></div>`, user);
  }

  const t = rows[0];
  return htmlPage('Checkout', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main cleaner-main">
        <section class="portal-subhero clean-hero">
          <div class="portal-kicker">Checkout</div>
          <h1>${t.tier_name}</h1>
          <p>Simulated checkout for access unlocking.</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>

        <section class="clean-section">
          <div class="section-body">
            <div class="feature-card" style="max-width:560px;">
              <p><strong>Tier:</strong> ${t.tier_name}</p>
              <p><strong>Price:</strong> $${((Number(t.price_cents || 0))/100).toFixed(2)}</p>
              <p><strong>Type:</strong> ${t.tier_type}</p>

              <form method="POST" action="/checkout/complete">
                <input type="hidden" name="tier_code" value="${t.tier_code}" />
                <label>Heir Username</label>
                <input name="username" placeholder="jacobie" />
                <button type="submit">Complete Buy-In</button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  `, user);
}

function renderBuildPage(req, user = null) {
  return htmlPage('Build', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Build / Earn</div>
          <h1>Build</h1>
          <p>Creator, storefront, and ownership-driven pathways for earning inside the ecosystem.</p>
        </section>
        <div class="feature-grid">
          ${compactFeatureCard('Creator Hub', 'Build creator presence and media pathways.', '/creator-hub')}
          ${compactFeatureCard('Storefront Explorer', 'Review commercial surfaces and storefront layers.', '/storefront-explorer')}
          ${compactFeatureCard('Heirs Ecosystem', 'See identity, ownership, and network participation.', '/heirs-ecosystem')}
          ${compactFeatureCard('Role Hub', 'Return to the role-based platform experience.', '/role-hub')}
        </div>
      </main>
    </div>
  `, user);
}

function renderLearnPage(req, user = null) {
  return htmlPage('Learn', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">University / Learn</div>
          <h1>Learn</h1>
          <p>Training, onboarding, and future All American Marketplace University pathways.</p>
        </section>
        <div class="feature-grid">
          ${compactFeatureCard('Join the Ecosystem', 'Start with the ecosystem access path.', '/join')}
          ${compactFeatureCard('Role Hub', 'See role-based access and next steps.', '/role-hub')}
          ${compactFeatureCard('Public Home', 'Return to the public-facing experience.', '/public-home')}
          ${compactFeatureCard('Member Home', 'Open the logged-in member experience.', '/member-home')}
        </div>
      </main>
    </div>
  `, user);
}

function renderWatchPage(req, user = null) {
  return htmlPage('Watch', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Watch / Streaming</div>
          <h1>Watch</h1>
          <p>Holographic streaming, podcasts, creator rooms, and future immersive media surfaces.</p>
        </section>
        <div class="feature-grid">
          ${compactFeatureCard('Creator Hub', 'Open creator-facing media surfaces.', '/creator-hub')}
          ${compactFeatureCard('Public Home', 'Return to the main public experience.', '/public-home')}
          ${compactFeatureCard('Join', 'Join the ecosystem to unlock deeper access.', '/join')}
          ${compactFeatureCard('Role Hub', 'See your role-aware next steps.', '/role-hub')}
        </div>
      </main>
    </div>
  `, user);
}
"""

marker = "const server = http.createServer(async (req, res) => {"
if "function renderJoinPage(req, user = null, message = '')" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

# add nav links
if '<a href="/join">Join</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/public-home">Public Home</a>',
        '<a href="/public-home">Public Home</a>\n          <a href="/watch">Watch</a>\n          <a href="/join">Join</a>\n          <a href="/build">Build</a>\n          <a href="/learn">Learn</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/public-home') {"
if "pathname === '/join'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/watch') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWatchPage(req, session));
    }

    if (req.method === 'GET' && pathname === '/join') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderJoinPage(req, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'POST' && pathname === '/checkout') {
      const session = hardenPublicSession(req);
      const body = await parseBody(req);
      const tierCode = String(body.tier_code || '').trim();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderCheckoutPage(req, session, tierCode, 'Tier selected'));
    }

    if (req.method === 'POST' && pathname === '/checkout/complete') {
      const body = await parseBody(req);
      const tierCode = String(body.tier_code || '').trim();
      const username = String(body.username || '').trim().toLowerCase();

      const accountRows = dbQuery(`
        SELECT ha.heir_id, ha.role_name
        FROM heir_accounts ha
        WHERE lower(ha.username)='${q(username)}'
          AND ha.account_status='active'
        LIMIT 1
      `);

      const tierRows = dbQuery(`
        SELECT tier_code, price_cents, tier_type
        FROM membership_tiers
        WHERE tier_code='${q(tierCode)}'
        LIMIT 1
      `);

      if (!accountRows.length || !tierRows.length) {
        return redirect(res, '/join?msg=Checkout%20failed');
      }

      const heirId = Number(accountRows[0].heir_id);
      const t = tierRows[0];

      dbRun(`INSERT INTO checkout_orders (owner_type, owner_id, tier_code, amount_cents, checkout_status)
             VALUES ('heir', ${heirId}, '${q(t.tier_code)}', ${Number(t.price_cents || 0)}, 'paid')`);

      const existingPass = dbQuery(`
        SELECT id FROM ecosystem_access_passes
        WHERE owner_type='heir' AND owner_id=${heirId} AND tier_code='${q(t.tier_code)}'
        LIMIT 1
      `);

      if (!existingPass.length) {
        dbRun(`INSERT INTO ecosystem_access_passes (owner_type, owner_id, tier_code, pass_status)
               VALUES ('heir', ${heirId}, '${q(t.tier_code)}', 'active')`);
      }

      const scopes = [];
      if (t.tier_code === 'basic_access') scopes.push('basic_access');
      if (t.tier_code === 'creator_access') scopes.push('basic_access', 'creator_tools');
      if (t.tier_code === 'storefront_access') scopes.push('basic_access', 'storefront_tools');
      if (t.tier_code === 'founder_heir') scopes.push('basic_access', 'creator_tools', 'storefront_tools', 'founder_access');

      for (const scope of scopes) {
        const ex = dbQuery(`
          SELECT id FROM unlock_events
          WHERE owner_type='heir' AND owner_id=${heirId} AND tier_code='${q(t.tier_code)}' AND unlock_scope='${q(scope)}'
          LIMIT 1
        `);
        if (!ex.length) {
          dbRun(`INSERT INTO unlock_events (owner_type, owner_id, tier_code, unlock_scope, unlock_status)
                 VALUES ('heir', ${heirId}, '${q(t.tier_code)}', '${q(scope)}', 'active')`);
        }
      }

      if (typeof logSecurityEvent === 'function') {
        logSecurityEvent('BUYIN_COMPLETE', 'heir_account', heirId, t.tier_code);
      }

      return redirect(res, `/heir-dashboard/${heirId}?msg=Buy-in%20complete`);
    }

    if (req.method === 'GET' && pathname === '/build') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderBuildPage(req, session));
    }

    if (req.method === 'GET' && pathname === '/learn') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderLearnPage(req, session));
    }

    if (req.method === 'GET' && pathname === '/public-home') {"""
    text = text.replace(anchor, routes, 1)

p.write_text(text)
print("[OK] buy-in + join patch applied")
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
  /watch \
  /join \
  /build \
  /learn \
  /public-home \
  /member-home \
  /role-hub
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) CHECKPOINT
########################################
sqlite3 -json db/aam.db "select count(*) as membership_tiers from membership_tiers;" > "snapshots/membership_tiers_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as ecosystem_access_passes from ecosystem_access_passes;" > "snapshots/ecosystem_access_passes_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as checkout_orders from checkout_orders;" > "snapshots/checkout_orders_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as unlock_events from unlock_events;" > "snapshots/unlock_events_${STAMP}.json"

cat > "reports/buyin_join_checkout_unlock_${STAMP}.txt" <<REPORT
BUY-IN + JOIN + CHECKOUT + UNLOCK REPORT
Timestamp: ${STAMP}

Added:
- membership_tiers
- ecosystem_access_passes
- checkout_orders
- unlock_events

Routes:
- /watch
- /join
- /build
- /learn
- /checkout
- /checkout/complete

Goal:
- create front-door conversion flow
- simulate buy-in checkout
- unlock access scopes
- prepare real monetization integration
REPORT

echo "BUY-IN + JOIN + CHECKOUT + UNLOCK COMPLETE: $STAMP"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/join"
echo "  termux-open-url http://127.0.0.1:4900/watch"
echo "  termux-open-url http://127.0.0.1:4900/build"
echo "  termux-open-url http://127.0.0.1:4900/learn"
