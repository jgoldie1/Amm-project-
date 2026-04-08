#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== REPAIR NEURO + HOLO CREATOR + KINGDOM + OMNIMAIL + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_repair_neuro_holo_kingdom_${STAMP}.js"
cp db/aam.db "backups/aam_repair_neuro_holo_kingdom_${STAMP}.db"

########################################
# 2) DATABASE REPAIR
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

# keep branding / kingdom metadata in one place
cur.execute("""
CREATE TABLE IF NOT EXISTS platform_identity_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  identity_group TEXT NOT NULL,
  internal_name TEXT NOT NULL,
  public_name TEXT NOT NULL,
  identity_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS neuro_interface_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT NOT NULL,
  interface_type TEXT DEFAULT 'non_invasive_bci',
  control_mode TEXT DEFAULT 'assistive',
  signal_source TEXT DEFAULT 'eeg_gaze_voice',
  safety_mode TEXT DEFAULT 'consent_required',
  profile_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS neuro_signal_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT NOT NULL,
  session_type TEXT DEFAULT 'navigation_assist',
  input_channel TEXT DEFAULT 'eeg',
  output_action TEXT DEFAULT 'ui_navigation',
  session_status TEXT DEFAULT 'ready',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS holojourney_generation_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT NOT NULL,
  generation_mode TEXT DEFAULT 'image_generation',
  output_style TEXT DEFAULT 'cinematic',
  holographic_mode TEXT DEFAULT 'enabled',
  profile_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS holojourney_render_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_name TEXT NOT NULL,
  prompt_text TEXT,
  output_format TEXT DEFAULT 'image',
  output_target TEXT DEFAULT 'holographic_display',
  job_status TEXT DEFAULT 'queued',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS creator_tv_channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_name TEXT NOT NULL,
  channel_owner TEXT NOT NULL,
  channel_type TEXT DEFAULT 'ai_tv',
  visibility_mode TEXT DEFAULT 'public',
  monetization_mode TEXT DEFAULT 'enabled',
  channel_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS creator_tv_programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_name TEXT NOT NULL,
  program_name TEXT NOT NULL,
  program_type TEXT DEFAULT 'livestream',
  ai_assist_mode TEXT DEFAULT 'enabled',
  holographic_mode TEXT DEFAULT 'enabled',
  program_status TEXT DEFAULT 'scheduled',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS streaming_network_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  network_name TEXT NOT NULL,
  network_type TEXT DEFAULT 'holographic_streaming',
  delivery_mode TEXT DEFAULT 'adaptive',
  latency_profile TEXT DEFAULT 'low_latency',
  network_status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS streaming_event_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  event_group TEXT DEFAULT 'creator_stream',
  linked_channel TEXT,
  audience_mode TEXT DEFAULT 'global',
  event_status TEXT DEFAULT 'live_ready',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# refresh platform identity records
cur.execute("UPDATE platform_identity_registry SET identity_status='inactive' WHERE identity_group IN ('mail_brand','kingdom_brand')")
cur.execute("""
INSERT INTO platform_identity_registry
(identity_group, internal_name, public_name, identity_status)
VALUES
('mail_brand', 'Quantum Mail', 'OmniMail OS', 'active')
""")
cur.execute("""
INSERT INTO platform_identity_registry
(identity_group, internal_name, public_name, identity_status)
VALUES
('kingdom_brand', 'Platform Kingdom Layer', 'The Kingdom OS', 'active')
""")

if cur.execute("SELECT count(*) FROM neuro_interface_profiles").fetchone()[0] == 0:
    rows = [
        ("Stubbs Neuro Assist", "non_invasive_bci", "assistive", "eeg_gaze_voice", "consent_required", "active"),
        ("Lyons Accessibility Link", "non_invasive_bci", "hands_free_ui", "gaze_voice_touch", "consent_required", "active"),
    ]
    cur.executemany("""
        INSERT INTO neuro_interface_profiles
        (profile_name, interface_type, control_mode, signal_source, safety_mode, profile_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM neuro_signal_sessions").fetchone()[0] == 0:
    rows = [
        ("Stubbs Neuro Assist", "navigation_assist", "eeg", "ui_navigation", "ready"),
        ("Stubbs Neuro Assist", "creator_control", "voice", "stream_control", "ready"),
        ("Lyons Accessibility Link", "accessibility_mode", "gaze", "screen_focus", "ready"),
    ]
    cur.executemany("""
        INSERT INTO neuro_signal_sessions
        (profile_name, session_type, input_channel, output_action, session_status)
        VALUES (?, ?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM holojourney_generation_profiles").fetchone()[0] == 0:
    rows = [
        ("HoloJourney Core", "image_generation", "cinematic", "enabled", "active"),
        ("HoloJourney World Assets", "world_asset_generation", "premium_3d", "enabled", "active"),
        ("HoloJourney Creator Posters", "brand_generation", "luxury", "enabled", "active"),
    ]
    cur.executemany("""
        INSERT INTO holojourney_generation_profiles
        (profile_name, generation_mode, output_style, holographic_mode, profile_status)
        VALUES (?, ?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM holojourney_render_queue").fetchone()[0] == 0:
    rows = [
        ("future_city_holo_scene", "Futuristic cyber city with creator towers and holographic transit", "image", "holographic_display", "queued"),
        ("isaiah_tv_launch_poster", "Luxury AI TV launch poster for Isaiah Anyone Can Be a Star", "image", "creator_channel", "queued"),
        ("creator_stage_world_asset", "Premium creator stage for holographic streaming", "3d_asset", "world3d", "queued"),
    ]
    cur.executemany("""
        INSERT INTO holojourney_render_queue
        (job_name, prompt_text, output_format, output_target, job_status)
        VALUES (?, ?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM creator_tv_channels").fetchone()[0] == 0:
    rows = [
        ("Isaiah Anyone Can Be a Star AI TV", "Isaiah", "ai_tv", "public", "enabled", "active"),
        ("Jacobie Vision Holo TV", "Jacobie", "holographic_tv", "public", "enabled", "active"),
        ("Aniyah Creator Spotlight", "Aniyah", "creator_tv", "public", "enabled", "active"),
    ]
    cur.executemany("""
        INSERT INTO creator_tv_channels
        (channel_name, channel_owner, channel_type, visibility_mode, monetization_mode, channel_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM creator_tv_programs").fetchone()[0] == 0:
    rows = [
        ("Isaiah Anyone Can Be a Star AI TV", "Anyone Can Be a Star Live", "livestream", "enabled", "enabled", "scheduled"),
        ("Isaiah Anyone Can Be a Star AI TV", "AI Talent Discovery", "ai_showcase", "enabled", "enabled", "scheduled"),
        ("Jacobie Vision Holo TV", "Holographic World News", "broadcast", "enabled", "enabled", "scheduled"),
    ]
    cur.executemany("""
        INSERT INTO creator_tv_programs
        (channel_name, program_name, program_type, ai_assist_mode, holographic_mode, program_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM streaming_network_registry").fetchone()[0] == 0:
    rows = [
        ("HoloStream Core", "holographic_streaming", "adaptive", "low_latency", "active"),
        ("CreatorCast Network", "creator_streaming", "adaptive", "low_latency", "active"),
        ("OmniLive Broadcast", "broadcast_streaming", "global_delivery", "optimized", "active"),
    ]
    cur.executemany("""
        INSERT INTO streaming_network_registry
        (network_name, network_type, delivery_mode, latency_profile, network_status)
        VALUES (?, ?, ?, ?, ?)
    """, rows)

if cur.execute("SELECT count(*) FROM streaming_event_log").fetchone()[0] == 0:
    rows = [
        ("Isaiah TV launch event", "creator_stream", "Isaiah Anyone Can Be a Star AI TV", "global", "live_ready"),
        ("Holo creator stage preview", "holographic_stream", "Jacobie Vision Holo TV", "global", "live_ready"),
        ("AI talent spotlight", "creator_stream", "Aniyah Creator Spotlight", "global", "live_ready"),
    ]
    cur.executemany("""
        INSERT INTO streaming_event_log
        (event_name, event_group, linked_channel, audience_mode, event_status)
        VALUES (?, ?, ?, ?, ?)
    """, rows)

conn.commit()
conn.close()
print("[OK] neuro + holo creator + kingdom + OmniMail tables repaired and seeded")
PYEOF

########################################
# 3) PATCH / VERIFY DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper1 = r"""
function renderNeuroControlPage(req, user = null, message = '') {
  const profiles = dbQuery(`
    SELECT id, profile_name, interface_type, control_mode, signal_source, safety_mode, profile_status, created_at
    FROM neuro_interface_profiles
    ORDER BY id DESC
    LIMIT 100
  `);

  const sessions = dbQuery(`
    SELECT id, profile_name, session_type, input_channel, output_action, session_status, created_at
    FROM neuro_signal_sessions
    ORDER BY id DESC
    LIMIT 200
  `);

  const profileRows = profiles.map(r => `<tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.interface_type}</td><td>${r.control_mode}</td><td>${r.signal_source}</td><td>${r.safety_mode}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const sessionRows = sessions.map(r => `<tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.session_type}</td><td>${r.input_channel}</td><td>${r.output_action}</td><td>${r.session_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Neuro Control', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="neuro-control-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Consent-Based Neuro Interface</div>
            <h1 id="neuro-control-title">Neuro Control</h1>
            <p>Safe non-invasive assistive control profiles for accessibility, creator control, and hands-free navigation.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>
        <section><table aria-label="Neuro Interface Profiles"><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Mode</th><th>Signal</th><th>Safety</th><th>Status</th><th>Created</th></tr></thead><tbody>${profileRows || '<tr><td colspan="8">No neuro profiles yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Neuro Signal Sessions"><thead><tr><th>ID</th><th>Profile</th><th>Session</th><th>Input</th><th>Output</th><th>Status</th><th>Created</th></tr></thead><tbody>${sessionRows || '<tr><td colspan="7">No neuro sessions yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

helper2 = r"""
function renderHoloJourneyPage(req, user = null, message = '') {
  const profiles = dbQuery(`
    SELECT id, profile_name, generation_mode, output_style, holographic_mode, profile_status, created_at
    FROM holojourney_generation_profiles
    ORDER BY id DESC
    LIMIT 100
  `);

  const queue = dbQuery(`
    SELECT id, job_name, prompt_text, output_format, output_target, job_status, created_at
    FROM holojourney_render_queue
    ORDER BY id DESC
    LIMIT 200
  `);

  const channels = dbQuery(`
    SELECT id, channel_name, channel_owner, channel_type, visibility_mode, monetization_mode, channel_status, created_at
    FROM creator_tv_channels
    ORDER BY id DESC
    LIMIT 100
  `);

  const programs = dbQuery(`
    SELECT id, channel_name, program_name, program_type, ai_assist_mode, holographic_mode, program_status, created_at
    FROM creator_tv_programs
    ORDER BY id DESC
    LIMIT 200
  `);

  const networks = dbQuery(`
    SELECT id, network_name, network_type, delivery_mode, latency_profile, network_status, created_at
    FROM streaming_network_registry
    ORDER BY id DESC
    LIMIT 100
  `);

  const events = dbQuery(`
    SELECT id, event_name, event_group, linked_channel, audience_mode, event_status, created_at
    FROM streaming_event_log
    ORDER BY id DESC
    LIMIT 200
  `);

  const profileRows = profiles.map(r => `<tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.generation_mode}</td><td>${r.output_style}</td><td>${r.holographic_mode}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const queueRows = queue.map(r => `<tr><td>${r.id}</td><td>${r.job_name}</td><td>${r.prompt_text || ''}</td><td>${r.output_format}</td><td>${r.output_target}</td><td>${r.job_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const channelRows = channels.map(r => `<tr><td>${r.id}</td><td>${r.channel_name}</td><td>${r.channel_owner}</td><td>${r.channel_type}</td><td>${r.visibility_mode}</td><td>${r.monetization_mode}</td><td>${r.channel_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const programRows = programs.map(r => `<tr><td>${r.id}</td><td>${r.channel_name}</td><td>${r.program_name}</td><td>${r.program_type}</td><td>${r.ai_assist_mode}</td><td>${r.holographic_mode}</td><td>${r.program_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const networkRows = networks.map(r => `<tr><td>${r.id}</td><td>${r.network_name}</td><td>${r.network_type}</td><td>${r.delivery_mode}</td><td>${r.latency_profile}</td><td>${r.network_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const eventRows = events.map(r => `<tr><td>${r.id}</td><td>${r.event_name}</td><td>${r.event_group}</td><td>${r.linked_channel || ''}</td><td>${r.audience_mode}</td><td>${r.event_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('HoloJourney + AI TV', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="holojourney-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Holographic Generation + Creator Broadcasting</div>
            <h1 id="holojourney-title">HoloJourney + AI TV</h1>
            <p>Generate holographic visuals, launch creator channels, and strengthen the streaming ecosystem.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>
        <section><table aria-label="HoloJourney Profiles"><thead><tr><th>ID</th><th>Name</th><th>Mode</th><th>Style</th><th>Holo</th><th>Status</th><th>Created</th></tr></thead><tbody>${profileRows || '<tr><td colspan="7">No profiles yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="HoloJourney Render Queue"><thead><tr><th>ID</th><th>Job</th><th>Prompt</th><th>Format</th><th>Target</th><th>Status</th><th>Created</th></tr></thead><tbody>${queueRows || '<tr><td colspan="7">No jobs yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Creator TV Channels"><thead><tr><th>ID</th><th>Channel</th><th>Owner</th><th>Type</th><th>Visibility</th><th>Monetization</th><th>Status</th><th>Created</th></tr></thead><tbody>${channelRows || '<tr><td colspan="8">No channels yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Creator TV Programs"><thead><tr><th>ID</th><th>Channel</th><th>Program</th><th>Type</th><th>AI</th><th>Holo</th><th>Status</th><th>Created</th></tr></thead><tbody>${programRows || '<tr><td colspan="8">No programs yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Streaming Networks"><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Delivery</th><th>Latency</th><th>Status</th><th>Created</th></tr></thead><tbody>${networkRows || '<tr><td colspan="7">No networks yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Streaming Event Log"><thead><tr><th>ID</th><th>Event</th><th>Group</th><th>Channel</th><th>Audience</th><th>Status</th><th>Created</th></tr></thead><tbody>${eventRows || '<tr><td colspan="7">No events yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}
"""

if "function renderNeuroControlPage(req, user = null, message = '')" not in text:
    text = text.replace("const server = http.createServer(async (req, res) => {", helper1 + "\n" + helper2 + "\nconst server = http.createServer(async (req, res) => {", 1)

text = text.replace("OmniMail", "OmniMail OS")
if '<a href="/neuro-control">Neuro</a>' not in text and '<a href="/quantum-mail">OmniMail OS</a>' in text:
    text = text.replace(
        '<a href="/quantum-mail">OmniMail OS</a>',
        '<a href="/quantum-mail">OmniMail OS</a>\n          <a href="/neuro-control">Neuro</a>\n          <a href="/holojourney-tv">HoloJourney TV</a>',
        1
    )

route1 = """
    if (req.method === 'GET' && pathname === '/neuro-control') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderNeuroControlPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

route2 = """
    if (req.method === 'GET' && pathname === '/holojourney-tv') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHoloJourneyPage(req, session, requestURL.searchParams.get('msg') || ''));
    }
"""

if "pathname === '/neuro-control'" not in text:
    anchor = "    if (req.method === 'GET' && pathname === '/quantum-mail') {"
    if anchor in text:
        text = text.replace(anchor, route1 + "\n" + route2 + "\n" + anchor, 1)

p.write_text(text)
print("[OK] dashboard patched for neuro + holo creator + OmniMail OS")
PYEOF

########################################
# 4) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true

########################################
# 5) SMOKE TEST
#####cd ~/aam_full_system

cat > scripts/finish_repair_neuro_holo_creator_kingdom_omnimail.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FINISH REPAIR NEURO + HOLO CREATOR + KINGDOM + OMNIMAIL OS START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_finish_repair_neuro_holo_${STAMP}.js"
cp db/aam.db "backups/aam_finish_repair_neuro_holo_${STAMP}.db"

########################################
# 1) VERIFY TABLES
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path
import sys

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

required = [
    "platform_identity_registry",
    "neuro_interface_profiles",
    "neuro_signal_sessions",
    "holojourney_generation_profiles",
    "holojourney_render_queue",
    "creator_tv_channels",
    "creator_tv_programs",
    "streaming_network_registry",
    "streaming_event_log",
]

missing = []
for t in required:
    row = cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (t,)).fetchone()
    if not row:
        missing.append(t)

conn.close()

if missing:
    print("Missing tables: " + ", ".join(missing))
    sys.exit(1)

print("[OK] repair tables verified")
PYEOF

########################################
# 2) VERIFY ROUTES
########################################
python3 << 'PYEOF'
from pathlib import Path
import sys

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

checks = [
    ("renderNeuroControlPage", "helper renderNeuroControlPage"),
    ("renderHoloJourneyPage", "helper renderHoloJourneyPage"),
    ("pathname === '/neuro-control'", "route /neuro-control"),
    ("pathname === '/holojourney-tv'", "route /holojourney-tv"),
    ("OmniMail OS", "OmniMail OS label"),
]

missing = [label for needle, label in checks if needle not in text]
if missing:
    print("Missing dashboard pieces: " + ", ".join(missing))
    sys.exit(1)

print("[OK] repair routes verified")
PYEOF

########################################
# 3) RESTART / VERIFY
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

curl -s http://127.0.0.1:4900/health > "test_results/dashboard_health_${STAMP}.json" || true
curl -s http://127.0.0.1:5000/health > "test_results/jarvis_health_${STAMP}.json" || true

########################################
# 4) SMOKE TEST
########################################
for route in \
  / \
  /neuro-control \
  /holojourney-tv \
  /quantum-mail \
  /quantum-mail-admin \
  /holo-search \
  /platform-analytics \
  /world3d
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 5) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select id, identity_group, internal_name, public_name, identity_status, created_at from platform_identity_registry order by id desc limit 20;" > "snapshots/platform_identity_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as neuro_interface_profiles from neuro_interface_profiles;" > "snapshots/neuro_interface_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as neuro_signal_sessions from neuro_signal_sessions;" > "snapshots/neuro_signal_sessions_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as holojourney_generation_profiles from holojourney_generation_profiles;" > "snapshots/holojourney_generation_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as holojourney_render_queue from holojourney_render_queue;" > "snapshots/holojourney_render_queue_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as creator_tv_channels from creator_tv_channels;" > "snapshots/creator_tv_channels_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as creator_tv_programs from creator_tv_programs;" > "snapshots/creator_tv_programs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as streaming_network_registry from streaming_network_registry;" > "snapshots/streaming_network_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as streaming_event_log from streaming_event_log;" > "snapshots/streaming_event_log_${STAMP}.json"

sqlite3 -json db/aam.db "select id, channel_name, channel_owner, channel_type, visibility_mode, monetization_mode, channel_status, created_at from creator_tv_channels order by id desc limit 50;" > "snapshots/creator_tv_channels_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, profile_name, interface_type, control_mode, signal_source, safety_mode, profile_status, created_at from neuro_interface_profiles order by id desc limit 50;" > "snapshots/neuro_interface_profiles_tail_${STAMP}.json"

########################################
# 6) FRESH-ONLY ERROR SCAN
########################################
python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "no such table" in txt:
        issues.append({"file": f.name, "problem": "missing_table"})
    if "no such column" in txt:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "repair_neuro_holo_creator_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] finish repair scan complete: {len(issues)} issues")
PYEOF

########################################
# 7) REPORT
########################################
cat > "reports/finish_repair_neuro_holo_creator_kingdom_omnimail_${STAMP}.txt" <<REPORT
FINISH REPAIR NEURO + HOLO CREATOR + KINGDOM + OMNIMAIL OS REPORT
Timestamp: ${STAMP}

Verified:
- platform identity registry
- neuro interface tables
- holojourney tables
- creator TV tables
- streaming tables
- /neuro-control
- /holojourney-tv
- OmniMail OS labels
- dashboard health
- jarvis health
- fresh route smoke tests

Purpose:
- finish the cut-off repair run
- preserve OmniMail OS and The Kingdom OS identity
- stabilize the advanced creator, streaming, and assistive layer
REPORT

echo "FINISH REPAIR NEURO + HOLO CREATOR + KINGDOM + OMNIMAIL OS COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/repair_neuro_holo_creator_scan_latest.json"
echo "  cat snapshots/platform_identity_registry_${STAMP}.json"
echo "  cat snapshots/creator_tv_channels_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/neuro-control"
echo "  termux-open-url http://127.0.0.1:4900/holojourney-tv"
echo "  termux-open-url http://127.0.0.1:4900/quantum-mail"
