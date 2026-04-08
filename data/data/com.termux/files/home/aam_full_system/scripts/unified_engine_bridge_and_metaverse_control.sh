#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== UNIFIED ENGINE BRIDGE + METAVERSE CONTROL START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results config

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_engine_bridge_${STAMP}.js"
cp apps/world_socket.js "backups/world_socket_engine_bridge_${STAMP}.js"
cp db/aam.db "backups/aam_engine_bridge_${STAMP}.db"

########################################
# 2) DATABASE LAYER
########################################
python3 << 'PYEOF'
import sqlite3
from pathlib import Path

db = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS engine_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  engine_name TEXT NOT NULL,
  engine_code TEXT NOT NULL UNIQUE,
  engine_type TEXT NOT NULL,
  render_mode TEXT,
  engine_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS engine_workflow_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  engine_code TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  workflow_type TEXT NOT NULL,
  scene_id INTEGER,
  job_payload TEXT,
  job_status TEXT NOT NULL DEFAULT 'queued',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS engine_build_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  engine_code TEXT NOT NULL,
  build_name TEXT NOT NULL,
  target_platform TEXT NOT NULL,
  build_notes TEXT,
  build_status TEXT NOT NULL DEFAULT 'prepared',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS holographic_generator_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT NOT NULL,
  profile_type TEXT NOT NULL,
  dimension_mode TEXT,
  render_density TEXT,
  profile_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS immersive_runtime_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  runtime_name TEXT NOT NULL,
  runtime_type TEXT NOT NULL,
  device_scope TEXT,
  runtime_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS acceleration_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT NOT NULL,
  profile_code TEXT NOT NULL UNIQUE,
  acceleration_type TEXT NOT NULL,
  optimization_scope TEXT,
  profile_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS ai_orchestration_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_name TEXT NOT NULL,
  ai_family TEXT NOT NULL,
  orchestration_scope TEXT,
  profile_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS metaverse_control_planes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plane_name TEXT NOT NULL,
  plane_code TEXT NOT NULL UNIQUE,
  plane_scope TEXT NOT NULL,
  plane_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

engines = [
    ("Web World Engine", "web_world", "webgl", "browser_3d"),
    ("Unity Bridge", "unity_bridge", "unity", "realtime_3d"),
    ("Unreal Bridge", "unreal_bridge", "unreal", "cinematic_3d"),
    ("Hybrid Holo Engine", "hybrid_holo", "holographic", "3d_5d_hybrid"),
    ("AR VR MR Runtime", "immersive_runtime", "immersive", "ar_vr_mr")
]
for engine_name, engine_code, engine_type, render_mode in engines:
    cur.execute("""
    INSERT OR IGNORE INTO engine_registry
    (engine_name, engine_code, engine_type, render_mode, engine_status)
    VALUES (?, ?, ?, ?, 'active')
    """, (engine_name, engine_code, engine_type, render_mode))

profiles = [
    ("Hybrid 3D/5D Holographic Generator", "generator", "3d_5d", "adaptive_dense"),
    ("Quantum Visual Fabric", "generator", "holo_quantum", "high_density"),
]
for profile_name, profile_type, dimension_mode, render_density in profiles:
    cur.execute("""
    INSERT OR IGNORE INTO holographic_generator_profiles
    (profile_name, profile_type, dimension_mode, render_density, profile_status)
    VALUES (?, ?, ?, ?, 'active')
    """, (profile_name, profile_type, dimension_mode, render_density))

runtimes = [
    ("AR Runtime", "ar", "mobile_headset"),
    ("VR Runtime", "vr", "headset_roomscale"),
    ("MR Runtime", "mr", "mixed_environment"),
]
for runtime_name, runtime_type, device_scope in runtimes:
    cur.execute("""
    INSERT OR IGNORE INTO immersive_runtime_profiles
    (runtime_name, runtime_type, device_scope, runtime_status)
    VALUES (?, ?, ?, 'active')
    """, (runtime_name, runtime_type, device_scope))

accels = [
    ("Quantum Speed Accelerator", "quantum_speed_accelerator", "performance", "world_render_pipeline"),
    ("Quantum Lag Buster", "quantum_lag_buster", "latency", "sync_network_pipeline"),
    ("Googolplex Tech", "googolplex_tech", "scale", "massive_compute_orchestration"),
    ("Lyon Tech Runtime", "lyon_tech_runtime", "ai_optimization", "predictive_runtime_control"),
]
for profile_name, profile_code, acceleration_type, optimization_scope in accels:
    cur.execute("""
    INSERT OR IGNORE INTO acceleration_profiles
    (profile_name, profile_code, acceleration_type, optimization_scope, profile_status)
    VALUES (?, ?, ?, ?, 'active')
    """, (profile_name, profile_code, acceleration_type, optimization_scope))

ais = [
    ("Stubbs AI Orchestrator", "stubbs_ai", "platform_world_finance_security"),
    ("Lyon Tech AI", "lyon_tech", "runtime_prediction_optimization"),
    ("Jarvis Command Mesh", "jarvis", "operator_assist_and_workflow"),
]
for profile_name, ai_family, orchestration_scope in ais:
    cur.execute("""
    INSERT OR IGNORE INTO ai_orchestration_profiles
    (profile_name, ai_family, orchestration_scope, profile_status)
    VALUES (?, ?, ?, 'active')
    """, (profile_name, ai_family, orchestration_scope))

planes = [
    ("Metaverse Surface Plane", "metaverse_plane", "interactive_worlds"),
    ("Middleverse Logic Plane", "middleverse_plane", "commerce_identity_streaming_logic"),
    ("Multiverse Expansion Plane", "multiverse_plane", "cross_domain_sector_expansion"),
]
for plane_name, plane_code, plane_scope in planes:
    cur.execute("""
    INSERT OR IGNORE INTO metaverse_control_planes
    (plane_name, plane_code, plane_scope, plane_status)
    VALUES (?, ?, ?, 'active')
    """, (plane_name, plane_code, plane_scope))

# seed a few jobs
jobs = [
    ("web_world", "Commerce World Sync", "world_sync", 1, '{"mode":"browser_live"}'),
    ("unity_bridge", "Unity Scene Bridge", "scene_export", 1, '{"target":"unity"}'),
    ("unreal_bridge", "Unreal Scene Bridge", "scene_export", 1, '{"target":"unreal"}'),
    ("hybrid_holo", "Holo Generator Pass", "holo_render", 1, '{"mode":"3d_5d"}'),
]
for engine_code, workflow_name, workflow_type, scene_id, payload in jobs:
    cur.execute("""
    INSERT INTO engine_workflow_jobs
    (engine_code, workflow_name, workflow_type, scene_id, job_payload, job_status)
    VALUES (?, ?, ?, ?, ?, 'queued')
    """, (engine_code, workflow_name, workflow_type, scene_id, payload))

conn.commit()
conn.close()
print("[OK] unified engine bridge tables ready")
PYEOF

########################################
# 3) PATCH DASHBOARD
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

helper = r"""
function renderEngineBridgePage(req, user = null, message = '') {
  const engines = dbQuery(`
    SELECT id, engine_name, engine_code, engine_type, render_mode, engine_status, created_at
    FROM engine_registry
    ORDER BY id ASC
  `);

  const jobs = dbQuery(`
    SELECT id, engine_code, workflow_name, workflow_type, scene_id, job_status, created_at
    FROM engine_workflow_jobs
    ORDER BY id DESC
    LIMIT 100
  `);

  const builds = dbQuery(`
    SELECT id, engine_code, build_name, target_platform, build_status, created_at
    FROM engine_build_runs
    ORDER BY id DESC
    LIMIT 100
  `);

  const holo = dbQuery(`
    SELECT id, profile_name, dimension_mode, render_density, profile_status, created_at
    FROM holographic_generator_profiles
    ORDER BY id DESC
  `);

  const runtime = dbQuery(`
    SELECT id, runtime_name, runtime_type, device_scope, runtime_status, created_at
    FROM immersive_runtime_profiles
    ORDER BY id DESC
  `);

  const accel = dbQuery(`
    SELECT id, profile_name, profile_code, acceleration_type, optimization_scope, profile_status, created_at
    FROM acceleration_profiles
    ORDER BY id DESC
  `);

  const ai = dbQuery(`
    SELECT id, profile_name, ai_family, orchestration_scope, profile_status, created_at
    FROM ai_orchestration_profiles
    ORDER BY id DESC
  `);

  const planes = dbQuery(`
    SELECT id, plane_name, plane_code, plane_scope, plane_status, created_at
    FROM metaverse_control_planes
    ORDER BY id DESC
  `);

  const engineRows = engines.map(r => `
    <tr><td>${r.id}</td><td>${r.engine_name}</td><td>${r.engine_code}</td><td>${r.engine_type}</td><td>${r.render_mode || ''}</td><td>${r.engine_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const jobRows = jobs.map(r => `
    <tr><td>${r.id}</td><td>${r.engine_code}</td><td>${r.workflow_name}</td><td>${r.workflow_type}</td><td>${r.scene_id || ''}</td><td>${r.job_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const buildRows = builds.map(r => `
    <tr><td>${r.id}</td><td>${r.engine_code}</td><td>${r.build_name}</td><td>${r.target_platform}</td><td>${r.build_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const holoRows = holo.map(r => `
    <tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.dimension_mode || ''}</td><td>${r.render_density || ''}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const runtimeRows = runtime.map(r => `
    <tr><td>${r.id}</td><td>${r.runtime_name}</td><td>${r.runtime_type}</td><td>${r.device_scope || ''}</td><td>${r.runtime_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const accelRows = accel.map(r => `
    <tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.profile_code}</td><td>${r.acceleration_type}</td><td>${r.optimization_scope || ''}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const aiRows = ai.map(r => `
    <tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.ai_family}</td><td>${r.orchestration_scope || ''}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const planeRows = planes.map(r => `
    <tr><td>${r.id}</td><td>${r.plane_name}</td><td>${r.plane_code}</td><td>${r.plane_scope || ''}</td><td>${r.plane_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Unified Engine Bridge', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main cleaner-main">
        <section class="portal-subhero clean-hero">
          <div class="portal-kicker">Engine + Universe Control</div>
          <h1>Unified Engine Bridge</h1>
          <p>Control layer for Web, Unity, Unreal, hybrid holographic, AR/VR/MR, metaverse, middleverse, and multiverse orchestration.</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>

        <div class="feature-grid compact-grid">
          ${typeof compactFeatureCard === 'function' ? compactFeatureCard('Metaverse Plane', 'Interactive world surface control.', '/engine-bridge') : ''}
          ${typeof compactFeatureCard === 'function' ? compactFeatureCard('Middleverse Plane', 'Commerce, streaming, identity, and logic control.', '/engine-bridge') : ''}
          ${typeof compactFeatureCard === 'function' ? compactFeatureCard('Multiverse Plane', 'Expansion into multiple sectors and worlds.', '/engine-bridge') : ''}
          ${typeof compactFeatureCard === 'function' ? compactFeatureCard('Scheduler Command', 'Run execution and orchestration workflows.', '/scheduler-command') : ''}
        </div>

        <section class="clean-section"><div class="section-head"><h2>Engine Registry</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Name</th><th>Code</th><th>Type</th><th>Render</th><th>Status</th><th>Created</th></tr></thead><tbody>${engineRows || '<tr><td colspan="7">No engines yet.</td></tr>'}</tbody></table></div></section>
        <section class="clean-section"><div class="section-head"><h2>Workflow Jobs</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Engine</th><th>Name</th><th>Type</th><th>Scene</th><th>Status</th><th>Created</th></tr></thead><tbody>${jobRows || '<tr><td colspan="7">No workflow jobs yet.</td></tr>'}</tbody></table></div></section>
        <section class="clean-section"><div class="section-head"><h2>Build Runs</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Engine</th><th>Build</th><th>Target</th><th>Status</th><th>Created</th></tr></thead><tbody>${buildRows || '<tr><td colspan="6">No builds yet.</td></tr>'}</tbody></table></div></section>
        <section class="clean-section"><div class="section-head"><h2>Holographic Profiles</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Name</th><th>Dimension</th><th>Density</th><th>Status</th><th>Created</th></tr></thead><tbody>${holoRows || '<tr><td colspan="6">No profiles yet.</td></tr>'}</tbody></table></div></section>
        <section class="clean-section"><div class="section-head"><h2>Immersive Runtime Profiles</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Device Scope</th><th>Status</th><th>Created</th></tr></thead><tbody>${runtimeRows || '<tr><td colspan="6">No runtime profiles yet.</td></tr>'}</tbody></table></div></section>
        <section class="clean-section"><div class="section-head"><h2>Acceleration Profiles</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Name</th><th>Code</th><th>Type</th><th>Scope</th><th>Status</th><th>Created</th></tr></thead><tbody>${accelRows || '<tr><td colspan="7">No acceleration profiles yet.</td></tr>'}</tbody></table></div></section>
        <section class="clean-section"><div class="section-head"><h2>AI Orchestration Profiles</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Name</th><th>Family</th><th>Scope</th><th>Status</th><th>Created</th></tr></thead><tbody>${aiRows || '<tr><td colspan="6">No AI profiles yet.</td></tr>'}</tbody></table></div></section>
        <section class="clean-section"><div class="section-head"><h2>Control Planes</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Name</th><th>Code</th><th>Scope</th><th>Status</th><th>Created</th></tr></thead><tbody>${planeRows || '<tr><td colspan="6">No control planes yet.</td></tr>'}</tbody></table></div></section>
      </main>
    </div>
  `, user);
}
"""

marker = "const server = http.createServer(async (req, res) => {"
if "function renderEngineBridgePage(req, user = null, message = '')" not in text and marker in text:
    text = text.replace(marker, helper + "\n" + marker, 1)

if '<a href="/engine-bridge">Engine Bridge</a>' not in text and 'portal-main-nav' in text:
    text = text.replace(
        '<a href="/scheduler-command">Scheduler</a>',
        '<a href="/scheduler-command">Scheduler</a>\n          <a href="/engine-bridge">Engine Bridge</a>'
    )

anchor = "    if (req.method === 'GET' && pathname === '/scheduler-command') {"
if "pathname === '/engine-bridge'" not in text and anchor in text:
    route = """    if (req.method === 'GET' && pathname === '/engine-bridge') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderEngineBridgePage(req, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'GET' && pathname === '/scheduler-command') {"""
    text = text.replace(anchor, route, 1)

p.write_text(text)
print("[OK] unified engine bridge UI applied")
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
  /engine-bridge \
  /watch \
  /join \
  /build \
  /learn \
  /role-hub \
  /executive-dashboard \
  /scheduler-command
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as engine_registry from engine_registry;" > "snapshots/engine_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as engine_workflow_jobs from engine_workflow_jobs;" > "snapshots/engine_workflow_jobs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as engine_build_runs from engine_build_runs;" > "snapshots/engine_build_runs_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as holographic_generator_profiles from holographic_generator_profiles;" > "snapshots/holographic_generator_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as immersive_runtime_profiles from immersive_runtime_profiles;" > "snapshots/immersive_runtime_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as acceleration_profiles from acceleration_profiles;" > "snapshots/acceleration_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as ai_orchestration_profiles from ai_orchestration_profiles;" > "snapshots/ai_orchestration_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as metaverse_control_planes from metaverse_control_planes;" > "snapshots/metaverse_control_planes_${STAMP}.json"

########################################
# 7) REPORT
########################################
cat > "reports/unified_engine_bridge_${STAMP}.txt" <<REPORT
UNIFIED ENGINE BRIDGE + METAVERSE CONTROL REPORT
Timestamp: ${STAMP}

Added:
- engine_registry
- engine_workflow_jobs
- engine_build_runs
- holographic_generator_profiles
- immersive_runtime_profiles
- acceleration_profiles
- ai_orchestration_profiles
- metaverse_control_planes
- /engine-bridge

Purpose:
- bridge Web, Unity, Unreal, holo, AR/VR/MR, metaverse, middleverse, and multiverse control
- centralize orchestration
- prepare future engine clients and visual world activation
REPORT

echo "UNIFIED ENGINE BRIDGE + METAVERSE CONTROL COMPLETE: $STAMP"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/engine-bridge"
echo "  termux-open-url http://127.0.0.1:4900/join"
echo "  termux-open-url http://127.0.0.1:4900/watch"
