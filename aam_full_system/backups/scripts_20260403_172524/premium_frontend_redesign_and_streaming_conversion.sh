#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== PREMIUM FRONTEND REDESIGN + STREAMING CONVERSION START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_premium_frontend_${STAMP}.js"
cp db/aam.db "backups/aam_premium_frontend_${STAMP}.db"

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
CREATE TABLE IF NOT EXISTS homepage_feature_flags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flag_name TEXT NOT NULL UNIQUE,
  flag_value TEXT NOT NULL DEFAULT 'on',
  flag_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS streaming_conversion_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id INTEGER,
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  target_tier_code TEXT,
  event_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

flags = [
    ("premium_frontend", "on"),
    ("watch_join_flow", "on"),
    ("role_split_nav", "on"),
    ("streaming_conversion", "on"),
]
for name, value in flags:
    cur.execute("""
    INSERT OR IGNORE INTO homepage_feature_flags
    (flag_name, flag_value, flag_status)
    VALUES (?, ?, 'active')
    """, (name, value))

events = [
    (1, "Jacobie Vision Intro Funnel", "join_cta", "basic_access"),
    (2, "Anyone Can Be a Star Premium Funnel", "storefront_cta", "storefront_access"),
    (3, "Aniyah Coach Creator Funnel", "creator_cta", "creator_access"),
]
for channel_id, event_name, event_type, target_tier_code in events:
    cur.execute("""
    INSERT INTO streaming_conversion_events
    (channel_id, event_name, event_type, target_tier_code, event_status)
    VALUES (?, ?, ?, ?, 'active')
    """, (channel_id, event_name, event_type, target_tier_code))

conn.commit()
conn.close()
print("[OK] premium frontend support tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD UI
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function premiumSection(title, body) {
  return `
    <section class="premium-section">
      <div class="premium-section-head">
        <h2>${title}</h2>
      </div>
      <div class="premium-section-body">
        ${body}
      </div>
    </section>
  `;
}

function heroActionCard(title, desc, href, cta = 'Open') {
  return `
    <div class="hero-action-card">
      <h3>${title}</h3>
      <p>${desc}</p>
      <a href="${href}" class="hero-action-link">${cta}</a>
    </div>
  `;
}

function renderPremiumPublicHome(req, user = null) {
  const sceneCount = dbQuery(`SELECT count(*) as c FROM visual_world_scenes`)[0]?.c || 0;
  const channelCount = dbQuery(`SELECT count(*) as c FROM creator_stream_channels`)[0]?.c || 0;
  const storefrontCount = dbQuery(`SELECT count(*) as c FROM heir_storefront_ownership`)[0]?.c || 0;
  const heirCount = dbQuery(`SELECT count(*) as c FROM heirs_registry`)[0]?.c || 0;

  const streamRows = dbQuery(`
    SELECT c.id, c.channel_name, c.channel_type, c.access_tier, h.name as heir_name
    FROM creator_stream_channels c
    LEFT JOIN heirs_registry h ON h.id = c.heir_id
    ORDER BY c.id ASC
    LIMIT 6
  `);

  const streamCards = streamRows.map(r => `
    <div class="feature-card compact-card">
      <div class="compact-card-head"><h3>${r.channel_name}</h3></div>
      <p>Host: ${r.heir_name || 'Unknown'}</p>
      <p>Type: ${r.channel_type || ''}</p>
      <p>Tier: ${r.access_tier || ''}</p>
      <a href="/watch" class="feature-link">Watch Channel</a>
    </div>
  `).join('');

  return htmlPage('All American Marketplace', `
    <div class="portal-shell premium-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main premium-main">
        <section class="premium-hero">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Living Economy Platform</div>
            <h1>Stream. Join. Build. Earn. Own.</h1>
            <p>The All American Marketplace Holographic Streaming Ecosystem brings together worlds, creators, commerce, ownership, heirs, payouts, and immersive growth in one platform.</p>
            <div class="premium-cta-row">
              <a href="/join" class="hero-primary-btn">Join the Ecosystem</a>
              <a href="/watch" class="hero-secondary-btn">Watch Live</a>
              <a href="/build" class="hero-secondary-btn">Build & Earn</a>
              <a href="/learn" class="hero-secondary-btn">Learn More</a>
            </div>
          </div>
          <div class="premium-hero-stats">
            ${typeof statCard === 'function' ? statCard('Worlds', sceneCount) : ''}
            ${typeof statCard === 'function' ? statCard('Channels', channelCount) : ''}
            ${typeof statCard === 'function' ? statCard('Storefronts', storefrontCount) : ''}
            ${typeof statCard === 'function' ? statCard('Heirs', heirCount) : ''}
          </div>
        </section>

        ${premiumSection('Choose Your Path', `
          <div class="hero-action-grid">
            ${heroActionCard('Watch', 'Enter the streaming, podcast, and event layer that drives attention into the ecosystem.', '/watch', 'Enter Watch')}
            ${heroActionCard('Join', 'Buy into the ecosystem and unlock access, roles, and participation pathways.', '/join', 'Start Join Flow')}
            ${heroActionCard('Build', 'Creators, storefront owners, and heirs use this layer to build value and earnings.', '/build', 'Open Build')}
            ${heroActionCard('Learn', 'Training, onboarding, and future university pathways to help users grow.', '/learn', 'Open Learn')}
          </div>
        `)}

        ${premiumSection('Live Creator Surfaces', `
          <div class="feature-grid compact-grid">
            ${streamCards || '<div class="muted">No channels yet.</div>'}
          </div>
        `)}

        ${premiumSection('Why This Platform Wins', `
          <div class="feature-grid compact-grid">
            ${heroActionCard('Streaming + Commerce', 'Creators can drive attention and conversion in one stack.', '/watch')}
            ${heroActionCard('Ownership + Identity', 'Heirs, roles, access, and ownership are built into the platform.', '/role-hub')}
            ${heroActionCard('Finance + Payouts', 'Executive finance, analytics, payouts, and scheduling are integrated.', '/executive-dashboard')}
            ${heroActionCard('World + Engine Bridge', 'Metaverse, middleverse, multiverse, and engine orchestration sit behind one control plane.', '/engine-bridge')}
          </div>
        `)}
      </main>
    </div>
  `, user);
}

function renderPremiumWatchPage(req, user = null, message = '') {
  const channels = dbQuery(`
    SELECT c.id, c.channel_name, c.channel_type, c.access_tier, h.name as heir_name
    FROM creator_stream_channels c
    LEFT JOIN heirs_registry h ON h.id = c.heir_id
    ORDER BY c.id ASC
  `);

  const liveSessions = dbQuery(`
    SELECT s.id, c.channel_name, s.session_title, s.session_type, s.session_status, s.created_at
    FROM creator_live_sessions s
    LEFT JOIN creator_stream_channels c ON c.id = s.channel_id
    ORDER BY s.id DESC
    LIMIT 20
  `);

  const conversionEvents = dbQuery(`
    SELECT sce.id, c.channel_name, sce.event_name, sce.event_type, sce.target_tier_code, sce.event_status
    FROM streaming_conversion_events sce
    LEFT JOIN creator_stream_channels c ON c.id = sce.channel_id
    ORDER BY sce.id DESC
    LIMIT 20
  `);

  const channelCards = channels.map(r => `
    <div class="hero-action-card">
      <h3>${r.channel_name}</h3>
      <p>Host: ${r.heir_name || 'Unknown'}</p>
      <p>Type: ${r.channel_type || ''}</p>
      <p>Access Tier: ${r.access_tier || ''}</p>
      <div class="premium-cta-row">
        <a href="/join" class="hero-primary-btn">Unlock Access</a>
        <a href="/build" class="hero-secondary-btn">Become a Creator</a>
      </div>
    </div>
  `).join('');

  const sessionRows = liveSessions.map(r => `
    <tr><td>${r.id}</td><td>${r.channel_name || ''}</td><td>${r.session_title}</td><td>${r.session_type}</td><td>${r.session_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const conversionRows = conversionEvents.map(r => `
    <tr><td>${r.id}</td><td>${r.channel_name || ''}</td><td>${r.event_name}</td><td>${r.event_type}</td><td>${r.target_tier_code || ''}</td><td>${r.event_status}</td></tr>
  `).join('');

  return htmlPage('Watch', `
    <div class="portal-shell premium-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main premium-main">
        <section class="premium-hero">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Attention Engine</div>
            <h1>Watch the Ecosystem Live</h1>
            <p>Streaming, podcast, coaching, performance, and future holographic live experiences all connect to your join, build, and monetization flows.</p>
            ${message ? `<p class="ok">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/join" class="hero-primary-btn">Join to Unlock</a>
              <a href="/build" class="hero-secondary-btn">Become a Creator</a>
            </div>
          </div>
        </section>

        ${premiumSection('Featured Channels', `
          <div class="hero-action-grid">
            ${channelCards || '<div class="muted">No channels yet.</div>'}
          </div>
        `)}

        ${premiumSection('Live Session Queue', `
          <table>
            <thead><tr><th>ID</th><th>Channel</th><th>Title</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${sessionRows || '<tr><td colspan="6">No sessions yet.</td></tr>'}</tbody>
          </table>
        `)}

        ${premiumSection('Streaming Conversion Funnels', `
          <table>
            <thead><tr><th>ID</th><th>Channel</th><th>Event</th><th>Type</th><th>Target Tier</th><th>Status</th></tr></thead>
            <tbody>${conversionRows || '<tr><td colspan="6">No conversion events yet.</td></tr>'}</tbody>
          </table>
        `)}
      </main>
    </div>
  `, user);
}
"""

marker = "const server = http.createServer(async (req, res) => {"
if "function renderPremiumPublicHome(req, user = null)" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

# Upgrade / and /public-home behavior
old_root = """    if (req.method === 'GET' && pathname === '/') {
      const portalSession = typeof getPortalSession === 'function' ? getPortalSession(req) : { kind: 'public', role_name: 'public' };
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      if (portalSession && portalSession.kind === 'heir') {
        return res.end(renderMemberHomePage(req, portalSession));
      }
      return res.end(renderPublicHomePage(portalSession));
    }"""
new_root = """    if (req.method === 'GET' && pathname === '/') {
      const portalSession = typeof getPortalSession === 'function' ? getPortalSession(req) : { kind: 'public', role_name: 'public' };
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      if (portalSession && portalSession.kind === 'heir') {
        return res.end(renderMemberHomePage(req, portalSession));
      }
      return res.end(renderPremiumPublicHome(req, portalSession));
    }"""
if old_root in text:
    text = text.replace(old_root, new_root, 1)

old_public = """    if (req.method === 'GET' && pathname === '/public-home') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPublicHomePage(session));
    }"""
new_public = """    if (req.method === 'GET' && pathname === '/public-home') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPremiumPublicHome(req, session));
    }"""
if old_public in text:
    text = text.replace(old_public, new_public, 1)

old_watch = """    if (req.method === 'GET' && pathname === '/watch') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWatchPage(req, session));
    }"""
new_watch = """    if (req.method === 'GET' && pathname === '/watch') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPremiumWatchPage(req, session, requestURL.searchParams.get('msg') || ''));
    }"""
if old_watch in text:
    text = text.replace(old_watch, new_watch, 1)

# add style block if possible
style_block = """
.premium-shell { background: linear-gradient(180deg,#020617 0%,#071226 45%,#0f172a 100%); }
.premium-main { gap: 24px; }
.premium-hero {
  display: grid;
  grid-template-columns: 1.4fr .9fr;
  gap: 20px;
  align-items: stretch;
  padding: 26px;
  border: 1px solid #1e293b;
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.88);
  box-shadow: 0 12px 40px rgba(0,0,0,.25);
}
.premium-hero-copy h1 { font-size: 2.3rem; line-height: 1.05; margin: 8px 0 14px 0; }
.premium-cta-row { display:flex; flex-wrap:wrap; gap:12px; margin-top:16px; }
.hero-primary-btn, .hero-secondary-btn, .hero-action-link {
  display:inline-block; padding:12px 16px; border-radius:14px; text-decoration:none;
}
.hero-primary-btn { background:#2563eb; color:white; }
.hero-secondary-btn { background:#111827; color:white; border:1px solid #334155; }
.hero-action-grid {
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap:16px;
}
.hero-action-card {
  border:1px solid #23324a;
  border-radius:20px;
  padding:18px;
  background:rgba(2,6,23,.88);
  box-shadow:0 10px 28px rgba(0,0,0,.2);
}
.hero-action-card h3 { margin-bottom:8px; }
.premium-section {
  border:1px solid #1e293b;
  border-radius:22px;
  overflow:hidden;
  background:rgba(15,23,42,.88);
}
.premium-section-head { padding:18px 20px 0 20px; }
.premium-section-body { padding:18px 20px 20px 20px; }
@media (max-width: 900px) {
  .premium-hero { grid-template-columns: 1fr; }
}
"""
if style_block.strip() not in text and "</style>" in text:
    text = text.replace("</style>", style_block + "\n</style>", 1)

p.write_text(text)
print("[OK] premium frontend redesign patch applied")
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
# 5) FRESH ROUTE SWEEP
########################################
for route in \
  / \
  /public-home \
  /watch \
  /join \
  /build \
  /learn \
  /role-hub \
  /engine-bridge \
  /visual-streaming \
  /executive-dashboard
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) ERROR SCAN
########################################
python3 << 'PYEOF'
from pathlib import Path
import json

root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{Path.cwd().name if False else ''}")):
    pass

for f in sorted(root.glob("*.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such column" in lower:
      issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
      issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
      issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "premium_frontend_route_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] premium frontend route scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) REPORT
########################################
cat > "reports/premium_frontend_redesign_and_streaming_conversion_${STAMP}.txt" <<REPORT
PREMIUM FRONTEND REDESIGN + STREAMING CONVERSION REPORT
Timestamp: ${STAMP}

Added:
- premium public home experience
- premium watch experience
- cleaner CTA and hero structure
- stronger conversion hierarchy
- stronger visual separation of watch/join/build/learn

Purpose:
- make the platform feel premium
- improve conversion
- strengthen the streaming attention engine
- move the system closer to superior product experience
REPORT

echo "PREMIUM FRONTEND REDESIGN + STREAMING CONVERSION COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/premium_frontend_route_scan_latest.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/"
echo "  termux-open-url http://127.0.0.1:4900/watch"
echo "  termux-open-url http://127.0.0.1:4900/join"
echo "  termux-open-url http://127.0.0.1:4900/visual-streaming"
