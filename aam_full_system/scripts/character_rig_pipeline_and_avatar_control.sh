#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== CHARACTER RIG PIPELINE + AVATAR CONTROL START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results uploads/avatars uploads/avatar_profiles

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_avatar_rig_${STAMP}.js"
cp db/aam.db "backups/aam_avatar_rig_${STAMP}.db"

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
CREATE TABLE IF NOT EXISTS avatar_characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heir_id INTEGER,
  character_name TEXT NOT NULL,
  character_type TEXT NOT NULL DEFAULT 'open_world_avatar',
  style_mode TEXT DEFAULT 'realistic',
  avatar_status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS avatar_profile_uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  upload_type TEXT NOT NULL,
  file_path TEXT,
  upload_status TEXT NOT NULL DEFAULT 'uploaded',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS avatar_rig_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  rig_type TEXT NOT NULL DEFAULT '3d_standard',
  rig_mode TEXT DEFAULT 'humanoid',
  holographic_mode TEXT DEFAULT 'disabled',
  facial_capture_mode TEXT DEFAULT 'prepared',
  export_status TEXT NOT NULL DEFAULT 'prepared',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS avatar_workflow_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  workflow_name TEXT NOT NULL,
  workflow_type TEXT NOT NULL,
  workflow_payload TEXT,
  job_status TEXT NOT NULL DEFAULT 'queued',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS avatar_deployment_targets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  target_name TEXT NOT NULL,
  target_type TEXT NOT NULL,
  deployment_status TEXT NOT NULL DEFAULT 'prepared',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS avatar_holographic_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  holo_profile_name TEXT NOT NULL,
  dimensional_mode TEXT DEFAULT '3d',
  projection_mode TEXT DEFAULT 'screen_ready',
  interaction_mode TEXT DEFAULT 'basic',
  holo_status TEXT NOT NULL DEFAULT 'prepared',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed a few platform characters
seed = [
    (1, "Jacobie Prime", "open_world_avatar", "realistic"),
    (2, "Isaiah Starform", "performance_avatar", "stylized"),
    (3, "Aniyah Voiceform", "coach_avatar", "realistic"),
]
for heir_id, character_name, character_type, style_mode in seed:
    cur.execute("""
    INSERT OR IGNORE INTO avatar_characters
    (heir_id, character_name, character_type, style_mode, avatar_status)
    VALUES (?, ?, ?, ?, 'draft')
    """, (heir_id, character_name, character_type, style_mode))

rows = cur.execute("SELECT id, character_name FROM avatar_characters ORDER BY id").fetchall()
for character_id, character_name in rows:
    cur.execute("""
    INSERT OR IGNORE INTO avatar_rig_profiles
    (character_id, rig_type, rig_mode, holographic_mode, facial_capture_mode, export_status)
    VALUES (?, '3d_standard', 'humanoid', 'prepared', 'prepared', 'prepared')
    """, (character_id,))

    cur.execute("""
    INSERT OR IGNORE INTO avatar_holographic_profiles
    (character_id, holo_profile_name, dimensional_mode, projection_mode, interaction_mode, holo_status)
    VALUES (?, ?, '3d_5d_hybrid', 'holographic_ready', 'interactive', 'prepared')
    """, (character_id, f"{character_name} Holo Profile"))

    targets = [
        ("Web World", "web"),
        ("Unity Bridge", "unity"),
        ("Unreal Bridge", "unreal"),
        ("Metaverse Plane", "metaverse"),
        ("Middleverse Plane", "middleverse"),
        ("Multiverse Plane", "multiverse"),
    ]
    for target_name, target_type in targets:
        cur.execute("""
        INSERT OR IGNORE INTO avatar_deployment_targets
        (character_id, target_name, target_type, deployment_status)
        VALUES (?, ?, ?, 'prepared')
        """, (character_id, target_name, target_type))

    jobs = [
        ("Front Profile Intake", "profile_capture", '{"view":"front"}'),
        ("Side Profile Intake", "profile_capture", '{"view":"side"}'),
        ("3D Rig Generation", "rigging", '{"rig":"3d_standard"}'),
        ("5D Holographic Rig Prep", "holo_rigging", '{"rig":"3d_5d_hybrid"}'),
        ("Metaverse Export", "deployment", '{"target":"metaverse"}'),
    ]
    for workflow_name, workflow_type, payload in jobs:
        cur.execute("""
        INSERT INTO avatar_workflow_jobs
        (character_id, workflow_name, workflow_type, workflow_payload, job_status)
        VALUES (?, ?, ?, ?, 'queued')
        """, (character_id, workflow_name, workflow_type, payload))

conn.commit()
conn.close()
print("[OK] avatar rig pipeline DB ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function renderAvatarRigPage(req, user = null, message = '') {
  const chars = dbQuery(`
    SELECT a.id, h.name as heir_name, a.character_name, a.character_type, a.style_mode, a.avatar_status, a.created_at
    FROM avatar_characters a
    LEFT JOIN heirs_registry h ON h.id = a.heir_id
    ORDER BY a.id DESC
    LIMIT 100
  `);

  const uploads = dbQuery(`
    SELECT u.id, a.character_name, u.upload_type, u.file_path, u.upload_status, u.created_at
    FROM avatar_profile_uploads u
    LEFT JOIN avatar_characters a ON a.id = u.character_id
    ORDER BY u.id DESC
    LIMIT 100
  `);

  const rigs = dbQuery(`
    SELECT r.id, a.character_name, r.rig_type, r.rig_mode, r.holographic_mode, r.facial_capture_mode, r.export_status, r.created_at
    FROM avatar_rig_profiles r
    LEFT JOIN avatar_characters a ON a.id = r.character_id
    ORDER BY r.id DESC
    LIMIT 100
  `);

  const holo = dbQuery(`
    SELECT h.id, a.character_name, h.holo_profile_name, h.dimensional_mode, h.projection_mode, h.interaction_mode, h.holo_status, h.created_at
    FROM avatar_holographic_profiles h
    LEFT JOIN avatar_characters a ON a.id = h.character_id
    ORDER BY h.id DESC
    LIMIT 100
  `);

  const jobs = dbQuery(`
    SELECT j.id, a.character_name, j.workflow_name, j.workflow_type, j.job_status, j.created_at
    FROM avatar_workflow_jobs j
    LEFT JOIN avatar_characters a ON a.id = j.character_id
    ORDER BY j.id DESC
    LIMIT 200
  `);

  const deploy = dbQuery(`
    SELECT d.id, a.character_name, d.target_name, d.target_type, d.deployment_status, d.created_at
    FROM avatar_deployment_targets d
    LEFT JOIN avatar_characters a ON a.id = d.character_id
    ORDER BY d.id DESC
    LIMIT 200
  `);

  const charRows = chars.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.character_name}</td><td>${r.character_type}</td><td>${r.style_mode || ''}</td><td>${r.avatar_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const uploadRows = uploads.map(r => `
    <tr><td>${r.id}</td><td>${r.character_name || ''}</td><td>${r.upload_type}</td><td>${r.file_path || ''}</td><td>${r.upload_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const rigRows = rigs.map(r => `
    <tr><td>${r.id}</td><td>${r.character_name || ''}</td><td>${r.rig_type}</td><td>${r.rig_mode}</td><td>${r.holographic_mode}</td><td>${r.facial_capture_mode}</td><td>${r.export_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const holoRows = holo.map(r => `
    <tr><td>${r.id}</td><td>${r.character_name || ''}</td><td>${r.holo_profile_name}</td><td>${r.dimensional_mode}</td><td>${r.projection_mode}</td><td>${r.interaction_mode}</td><td>${r.holo_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const jobRows = jobs.map(r => `
    <tr><td>${r.id}</td><td>${r.character_name || ''}</td><td>${r.workflow_name}</td><td>${r.workflow_type}</td><td>${r.job_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const deployRows = deploy.map(r => `
    <tr><td>${r.id}</td><td>${r.character_name || ''}</td><td>${r.target_name}</td><td>${r.target_type}</td><td>${r.deployment_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Avatar Rig Control', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="avatar-rig-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Character + Rig Pipeline</div>
            <h1 id="avatar-rig-title">Avatar Rig Control</h1>
            <p>Create open-world characters, intake front and side profile uploads, prepare 3D / 5D-style holographic rigs, and deploy them to metaverse, middleverse, and multiverse targets.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/engine-bridge" class="hero-primary-btn">Engine Bridge</a>
              <a href="/visual-streaming" class="hero-secondary-btn">Visual Streaming</a>
              <a href="/watch" class="hero-secondary-btn">Watch</a>
              <a href="/build" class="hero-secondary-btn">Build</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Avatar Pipeline Purpose', `
          <div class="hero-action-grid">
            ${typeof heroActionCard === 'function' ? heroActionCard('Profile Intake', 'Capture front and side character references for rig workflows.', '/avatar-rig-control') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('3D Rig Prep', 'Prepare character records for humanoid rigging and export.', '/avatar-rig-control') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('5D Holo Prep', 'Prepare holographic rig profiles for immersive character use.', '/avatar-rig-control') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('Universe Deployment', 'Track deployment targets across metaverse, middleverse, and multiverse.', '/avatar-rig-control') : ''}
          </div>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Avatar Characters', `
          <table aria-label="Avatar Characters">
            <thead><tr><th>ID</th><th>Heir</th><th>Name</th><th>Type</th><th>Style</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${charRows || '<tr><td colspan="7">No avatar characters yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Profile Uploads', `
          <table aria-label="Avatar Profile Uploads">
            <thead><tr><th>ID</th><th>Character</th><th>Upload Type</th><th>File</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${uploadRows || '<tr><td colspan="6">No uploads yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Rig Profiles', `
          <table aria-label="Avatar Rig Profiles">
            <thead><tr><th>ID</th><th>Character</th><th>Rig Type</th><th>Rig Mode</th><th>Holographic</th><th>Facial Capture</th><th>Export</th><th>Created</th></tr></thead>
            <tbody>${rigRows || '<tr><td colspan="8">No rig profiles yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Holographic Profiles', `
          <table aria-label="Avatar Holographic Profiles">
            <thead><tr><th>ID</th><th>Character</th><th>Name</th><th>Dimension</th><th>Projection</th><th>Interaction</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${holoRows || '<tr><td colspan="8">No holographic profiles yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Workflow Jobs', `
          <table aria-label="Avatar Workflow Jobs">
            <thead><tr><th>ID</th><th>Character</th><th>Name</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${jobRows || '<tr><td colspan="6">No workflow jobs yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Deployment Targets', `
          <table aria-label="Avatar Deployment Targets">
            <thead><tr><th>ID</th><th>Character</th><th>Target</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${deployRows || '<tr><td colspan="6">No deployment targets yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}
"""

marker = "const server = http.createServer(async (req, res) => {"
if "function renderAvatarRigPage(req, user = null, message = '')" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

if '<a href="/avatar-rig-control">Avatar Rig</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/accessibility">Accessibility</a>',
        '<a href="/accessibility">Accessibility</a>\n          <a href="/avatar-rig-control">Avatar Rig</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/accessibility') {"
if "pathname === '/avatar-rig-control'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/avatar-rig-control') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderAvatarRigPage(req, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'GET' && pathname === '/accessibility') {"""
    text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] avatar rig UI patch applied")
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
# 5) NEXT-LEVEL AVATAR + ACCESSIBILITY SMOKE TEST
########################################
for route in \
  / \
  /watch \
  /build \
  /engine-bridge \
  /visual-streaming \
  /payment-control \
  /accessibility \
  /avatar-rig-control
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as avatar_characters from avatar_characters;" > "snapshots/avatar_characters_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as avatar_profile_uploads from avatar_profile_uploads;" > "snapshots/avatar_profile_uploads_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as avatar_rig_profiles from avatar_rig_profiles;" > "snapshots/avatar_rig_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as avatar_workflow_jobs from avatar_workflow_jobs;" > "snapshots/avatar_workflow_jobs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as avatar_deployment_targets from avatar_deployment_targets;" > "snapshots/avatar_deployment_targets_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as avatar_holographic_profiles from avatar_holographic_profiles;" > "snapshots/avatar_holographic_profiles_${STAMP}.json"

sqlite3 -json db/aam.db "select id, heir_id, character_name, character_type, style_mode, avatar_status, created_at from avatar_characters order by id desc limit 50;" > "snapshots/avatar_characters_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, character_id, rig_type, rig_mode, holographic_mode, facial_capture_mode, export_status, created_at from avatar_rig_profiles order by id desc limit 50;" > "snapshots/avatar_rig_profiles_tail_${STAMP}.json"
sqlite3 -json db/aam.db "select id, character_id, holo_profile_name, dimensional_mode, projection_mode, interaction_mode, holo_status, created_at from avatar_holographic_profiles order by id desc limit 50;" > "snapshots/avatar_holographic_profiles_tail_${STAMP}.json"

########################################
# 7) ERROR SCAN
########################################
python3 << 'PYEOF'
from pathlib import Path
import json

root = Path.home() / "aam_full_system" / "test_results"
issues = []

for f in sorted(root.glob("*.txt")):
    txt = f.read_text(errors="ignore")
    lower = txt.lower()
    if "no such column" in lower:
        issues.append({"file": f.name, "problem": "missing_column"})
    if "http/1.1 500" in lower:
        issues.append({"file": f.name, "problem": "http_500"})
    if "referenceerror" in lower or "syntaxerror" in lower:
        issues.append({"file": f.name, "problem": "js_runtime_error"})

latest = Path.home() / "aam_full_system" / "snapshots" / "avatar_rig_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] avatar rig scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/character_rig_pipeline_and_avatar_control_${STAMP}.txt" <<REPORT
CHARACTER RIG PIPELINE + AVATAR CONTROL REPORT
Timestamp: ${STAMP}

Added:
- avatar_characters
- avatar_profile_uploads
- avatar_rig_profiles
- avatar_workflow_jobs
- avatar_deployment_targets
- avatar_holographic_profiles
- /avatar-rig-control

Purpose:
- prepare user-uploaded front and side profile intake
- prepare 3D / 5D-style holographic rig records
- organize deployment targets for metaverse, middleverse, and multiverse play
- make the platform more avatar-ready and disability-accessible
REPORT

echo "CHARACTER RIG PIPELINE + AVATAR CONTROL COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/avatar_rig_scan_latest.json"
echo "  cat snapshots/avatar_characters_tail_${STAMP}.json"
echo "  cat snapshots/avatar_rig_profiles_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/avatar-rig-control"
echo "  termux-open-url http://127.0.0.1:4900/accessibility"
echo "  termux-open-url http://127.0.0.1:4900/engine-bridge"
