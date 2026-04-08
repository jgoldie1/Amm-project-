#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FAST ADD NEURO + HOLOJOURNEY START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

cp apps/dashboard.js "backups/dashboard_fast_neuro_holo_${STAMP}.js"
cp db/aam.db "backups/aam_fast_neuro_holo_${STAMP}.db"

python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

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

if cur.execute("SELECT count(*) FROM neuro_interface_profiles").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO neuro_interface_profiles
        (profile_name, interface_type, control_mode, signal_source, safety_mode, profile_status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("Stubbs Neuro Assist", "non_invasive_bci", "assistive", "eeg_gaze_voice", "consent_required", "active"),
        ("Lyons Accessibility Link", "non_invasive_bci", "hands_free_ui", "gaze_voice_touch", "consent_required", "active"),
    ])

if cur.execute("SELECT count(*) FROM neuro_signal_sessions").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO neuro_signal_sessions
        (profile_name, session_type, input_channel, output_action, session_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("Stubbs Neuro Assist", "navigation_assist", "eeg", "ui_navigation", "ready"),
        ("Stubbs Neuro Assist", "creator_control", "voice", "stream_control", "ready"),
    ])

if cur.execute("SELECT count(*) FROM holojourney_generation_profiles").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO holojourney_generation_profiles
        (profile_name, generation_mode, output_style, holographic_mode, profile_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("HoloJourney Core", "image_generation", "cinematic", "enabled", "active"),
        ("HoloJourney Creator Posters", "brand_generation", "luxury", "enabled", "active"),
    ])

if cur.execute("SELECT count(*) FROM holojourney_render_queue").fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO holojourney_render_queue
        (job_name, prompt_text, output_format, output_target, job_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        ("future_city_holo_scene", "Futuristic cyber city with creator towers and holographic transit", "image", "holographic_display", "queued"),
        ("isaiah_tv_launch_poster", "Luxury AI TV launch poster for Isaiah Anyone Can Be a Star", "image", "creator_channel", "queued"),
    ])

conn.commit()
conn.close()
print("[OK] fast neuro + holojourney tables ready")
PYEOF

python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text(errors="ignore")

helper1 = r"""
function renderNeuroControlPage(req, user = null, message = '') {
  const profiles = dbQuery(`
    SELECT id, profile_name, interface_type, control_mode, signal_source, safety_mode, profile_status, created_at
    FROM neuro_interface_profiles
    ORDER BY id DESC LIMIT 100
  `);
  const sessions = dbQuery(`
    SELECT id, profile_name, session_type, input_channel, output_action, session_status, created_at
    FROM neuro_signal_sessions
    ORDER BY id DESC LIMIT 200
  `);

  const profileRows = profiles.map(r => `<tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.interface_type}</td><td>${r.control_mode}</td><td>${r.signal_source}</td><td>${r.safety_mode}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const sessionRows = sessions.map(r => `<tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.session_type}</td><td>${r.input_channel}</td><td>${r.output_action}</td><td>${r.session_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Neuro Control', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Neuro Control</h1><p>${message || 'Safe non-invasive assistive control profiles.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Mode</th><th>Signal</th><th>Safety</th><th>Status</th><th>Created</th></tr></thead><tbody>${profileRows || '<tr><td colspan="8">No neuro profiles</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Profile</th><th>Session</th><th>Input</th><th>Output</th><th>Status</th><th>Created</th></tr></thead><tbody>${sessionRows || '<tr><td colspan="7">No sessions</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

helper2 = r"""
function renderHoloJourneyPage(req, user = null, message = '') {
  const profiles = dbQuery(`
    SELECT id, profile_name, generation_mode, output_style, holographic_mode, profile_status, created_at
    FROM holojourney_generation_profiles
    ORDER BY id DESC LIMIT 100
  `);
  const queue = dbQuery(`
    SELECT id, job_name, prompt_text, output_format, output_target, job_status, created_at
    FROM holojourney_render_queue
    ORDER BY id DESC LIMIT 200
  `);

  const profileRows = profiles.map(r => `<tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.generation_mode}</td><td>${r.output_style}</td><td>${r.holographic_mode}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const queueRows = queue.map(r => `<tr><td>${r.id}</td><td>${r.job_name}</td><td>${r.prompt_text || ''}</td><td>${r.output_format}</td><td>${r.output_target}</td><td>${r.job_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('HoloJourney TV', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>HoloJourney TV</h1><p>${message || 'Holographic generation profiles and render queue.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Name</th><th>Mode</th><th>Style</th><th>Holo</th><th>Status</th><th>Created</th></tr></thead><tbody>${profileRows || '<tr><td colspan="7">No profiles</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Job</th><th>Prompt</th><th>Format</th><th>Target</th><th>Status</th><th>Created</th></tr></thead><tbody>${queueRows || '<tr><td colspan="7">No jobs</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}
"""

server_marker = "const server = http.createServer(async (req, res) => {"
helpers = []
if "function renderNeuroControlPage(req, user = null, message = '')" not in text:
    helpers.append(helper1)
if "function renderHoloJourneyPage(req, user = null, message = '')" not in text:
    helpers.append(helper2)
if helpers:
    text = text.replace(server_marker, "\n".join(helpers) + "\n" + server_marker, 1)

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

anchor = "    if (req.method === 'GET' && pathname === '/quantum-mail') {"
blocks = []
if "pathname === '/neuro-control'" not in text:
    blocks.append(route1)
if "pathname === '/holojourney-tv'" not in text:
    blocks.append(route2)
if blocks and anchor in text:
    text = text.replace(anchor, "\n".join(blocks) + "\n" + anchor, 1)

if '<a href="/neuro-control">Neuro</a>' not in text and '<a href="/quantum-mail">OmniMail OS</a>' in text:
    text = text.replace(
        '<a href="/quantum-mail">OmniMail OS</a>',
        '<a href="/quantum-mail">OmniMail OS</a>\n          <a href="/neuro-control">Neuro</a>\n          <a href="/holojourney-tv">HoloJourney TV</a>',
        1
    )

p.write_text(text)
print("[OK] fast neuro + holojourney routes added")
PYEOF

bash scripts/check_js.sh
bash scripts/safe_restart.sh >/dev/null 2>&1 || true
bash scripts/status.sh || true

for route in /neuro-control /holojourney-tv /quantum-mail /holo-search; do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

python3 << PYEOF
from pathlib import Path
import json

stamp = "${STAMP}"
root = Path.home() / "aam_full_system" / "test_results"
issues = []
for f in sorted(root.glob(f"*_{stamp}.txt")):
    txt = f.read_text(errors="ignore").lower()
    if "cannot get" in txt or "not found" in txt:
        issues.append({"file": f.name, "problem": "route_missing"})
    if "http/1.1 500" in txt:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in txt or "syntaxerror" in txt:
        issues.append({"file": f.name, "problem": "js_runtime_error"})
latest = Path.home() / "aam_full_system" / "snapshots" / "fast_add_neuro_holojourney_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] fast neuro + holojourney scan complete: {len(issues)} issues")
PYEOF

cat > "reports/fast_add_neuro_holojourney_${STAMP}.txt" <<REPORT
FAST ADD NEURO + HOLOJOURNEY REPORT
Timestamp: ${STAMP}

Added:
- /neuro-control
- /holojourney-tv

Purpose:
- speed up the rebuild
- keep the patch small
- preserve the stable advanced base
REPORT

echo "FAST ADD NEURO + HOLOJOURNEY COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/fast_add_neuro_holojourney_scan_latest.json"
