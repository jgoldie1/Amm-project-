#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== QUANTUM HOLO ENGINE BUILD START ==="

########################################
# 1) DB TABLES
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS holographic_generators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    generator_name TEXT NOT NULL,
    generator_type TEXT NOT NULL,
    dimension_mode TEXT NOT NULL DEFAULT '3D',
    render_profile TEXT,
    generator_status TEXT NOT NULL DEFAULT 'ready',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS immersive_engines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    engine_name TEXT NOT NULL,
    engine_mode TEXT NOT NULL,
    target_stack TEXT,
    engine_status TEXT NOT NULL DEFAULT 'configured',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS hybrid_game_engines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    engine_name TEXT NOT NULL,
    game_type TEXT NOT NULL,
    latency_profile TEXT,
    engine_status TEXT NOT NULL DEFAULT 'ready',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS performance_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_name TEXT NOT NULL,
    profile_type TEXT NOT NULL,
    optimization_target TEXT,
    profile_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS nanotech_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_name TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    control_profile TEXT,
    asset_status TEXT NOT NULL DEFAULT 'planned',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS engine_scene_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER,
    generator_id INTEGER,
    immersive_engine_id INTEGER,
    game_engine_id INTEGER,
    link_status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

# seed holographic generators
seed_generators = [
    ("Quantum Holo Generator Alpha", "holographic_generator", "3D", "balanced", "ready"),
    ("Quantum Holo Generator Beta", "holographic_generator", "5D", "cinematic", "ready"),
    ("Mixed Reality Projection Core", "mixed_reality_generator", "XR", "interactive", "ready"),
]

for name, gtype, dim, profile, status in seed_generators:
    cur.execute("SELECT 1 FROM holographic_generators WHERE generator_name = ?", (name,))
    if not cur.fetchone():
        cur.execute("""
            INSERT INTO holographic_generators (generator_name, generator_type, dimension_mode, render_profile, generator_status)
            VALUES (?, ?, ?, ?, ?)
        """, (name, gtype, dim, profile, status))

# seed immersive engines
seed_engines = [
    ("AAM AR Engine", "AR", "mobile_ar_overlay", "configured"),
    ("AAM VR Engine", "VR", "world_navigation", "configured"),
    ("AAM Mixed Reality Engine", "MR", "hybrid_overlay", "configured"),
]

for name, mode, stack, status in seed_engines:
    cur.execute("SELECT 1 FROM immersive_engines WHERE engine_name = ?", (name,))
    if not cur.fetchone():
        cur.execute("""
            INSERT INTO immersive_engines (engine_name, engine_mode, target_stack, engine_status)
            VALUES (?, ?, ?, ?)
        """, (name, mode, stack, status))

# seed hybrid game engines
seed_games = [
    ("Quantum Hybrid Games Core", "hybrid_world_game", "low_latency", "ready"),
    ("Holo Arena Engine", "competitive_room_game", "optimized", "ready"),
    ("Creator Quest Engine", "creator_economy_game", "balanced", "ready"),
]

for name, gtype, lat, status in seed_games:
    cur.execute("SELECT 1 FROM hybrid_game_engines WHERE engine_name = ?", (name,))
    if not cur.fetchone():
        cur.execute("""
            INSERT INTO hybrid_game_engines (engine_name, game_type, latency_profile, engine_status)
            VALUES (?, ?, ?, ?)
        """, (name, gtype, lat, status))

# seed performance profiles
seed_profiles = [
    ("Quantum Speed Accelerator", "speed_accelerator", "scene_loading_and_streaming", "active"),
    ("Quantum Lag Buster", "lag_reduction", "interactive_worlds_and_rooms", "active"),
    ("Adaptive Mixed Reality Optimizer", "render_optimizer", "ar_vr_mr_profiles", "active"),
]

for name, ptype, target, status in seed_profiles:
    cur.execute("SELECT 1 FROM performance_profiles WHERE profile_name = ?", (name,))
    if not cur.fetchone():
        cur.execute("""
            INSERT INTO performance_profiles (profile_name, profile_type, optimization_target, profile_status)
            VALUES (?, ?, ?, ?)
        """, (name, ptype, target, status))

# seed nanotech registry
seed_nano = [
    ("Nanotech Fabrication Core", "nanotech_core", "nano_fabrication_profile_v1", "planned"),
    ("Nano Healing Material Registry", "nano_material", "bio_support_profile", "planned"),
    ("Nano Surface Coating Engine", "nano_surface_system", "protective_layer_profile", "planned"),
]

for name, atype, profile, status in seed_nano:
    cur.execute("SELECT 1 FROM nanotech_registry WHERE asset_name = ?", (name,))
    if not cur.fetchone():
        cur.execute("""
            INSERT INTO nanotech_registry (asset_name, asset_type, control_profile, asset_status)
            VALUES (?, ?, ?, ?)
        """, (name, atype, profile, status))

# seed scene links
cur.execute("SELECT count(*) FROM engine_scene_links")
if cur.fetchone()[0] == 0:
    cur.executemany("""
        INSERT INTO engine_scene_links (scene_id, generator_id, immersive_engine_id, game_engine_id, link_status)
        VALUES (?, ?, ?, ?, ?)
    """, [
        (1, 1, 1, 1, "active"),
        (2, 3, 3, 2, "active"),
        (3, 2, 2, 3, "active"),
    ])

conn.commit()
conn.close()
print("[OK] quantum holo engine tables ready")
PYEOF

########################################
# 2) PATCH DASHBOARD
########################################
python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

def insert_before(marker: str, block: str):
    global text
    if block.strip() not in text and marker in text:
        text = text.replace(marker, block + "\n" + marker)

if '<a href="/quantum-holo">Quantum Holo</a>' not in text and '<a href="/scene-viewer">Scene Viewer</a>' in text:
    text = text.replace(
        '<a href="/scene-viewer">Scene Viewer</a>',
        '<a href="/scene-viewer">Scene Viewer</a>\n      <a href="/quantum-holo">Quantum Holo</a>\n      <a href="/immersive-engines">Immersive Engines</a>\n      <a href="/hybrid-games">Hybrid Games</a>\n      <a href="/performance-profiles">Performance</a>\n      <a href="/nanotech">Nanotech</a>'
    )

pages = r'''
function renderQuantumHoloPage(user = null) {
  const gens = dbQuery("SELECT id, generator_name, generator_type, dimension_mode, render_profile, generator_status, created_at FROM holographic_generators ORDER BY id DESC");
  const links = dbQuery(`
    SELECT l.id, s.scene_name, g.generator_name, i.engine_name, h.engine_name as game_engine, l.link_status
    FROM engine_scene_links l
    LEFT JOIN scene_registry s ON s.id = l.scene_id
    LEFT JOIN holographic_generators g ON g.id = l.generator_id
    LEFT JOIN immersive_engines i ON i.id = l.immersive_engine_id
    LEFT JOIN hybrid_game_engines h ON h.id = l.game_engine_id
    ORDER BY l.id DESC
  `);

  const genCards = gens.map(g => `
    <div class="card">
      <h3>${g.generator_name}</h3>
      <p><strong>Type:</strong> ${g.generator_type}</p>
      <p><strong>Dimension:</strong> ${g.dimension_mode}</p>
      <p><strong>Render Profile:</strong> ${g.render_profile || ''}</p>
      <p><strong>Status:</strong> ${g.generator_status}</p>
      <p class="muted">${g.created_at || ''}</p>
    </div>
  `).join('');

  const linkRows = links.map(l => `
    <tr>
      <td>${l.id}</td>
      <td>${l.scene_name || ''}</td>
      <td>${l.generator_name || ''}</td>
      <td>${l.engine_name || ''}</td>
      <td>${l.game_engine || ''}</td>
      <td>${l.link_status}</td>
    </tr>
  `).join('');

  return htmlPage('Quantum Holographic Layer', `
    <div class="section">
      <div class="card">
        <h2>Quantum 3D / 5D Holographic Generator Layer</h2>
        <p>This is the orchestration layer for holographic generation, immersive scenes, mixed reality overlays, and hybrid game-world linking.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${genCards || '<div class="card"><p>No generators yet.</p></div>'}</div>
    </div>
    <div class="section">
      <div class="card">
        <h3>Scene Engine Links</h3>
        <table>
          <thead><tr><th>ID</th><th>Scene</th><th>Generator</th><th>Immersive Engine</th><th>Game Engine</th><th>Status</th></tr></thead>
          <tbody>${linkRows || '<tr><td colspan="6">No links yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderImmersiveEnginesPage(user = null) {
  const rows = dbQuery("SELECT id, engine_name, engine_mode, target_stack, engine_status, created_at FROM immersive_engines ORDER BY id DESC");
  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.engine_name}</td>
      <td>${r.engine_mode}</td>
      <td>${r.target_stack || ''}</td>
      <td>${r.engine_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Immersive Engines', `
    <div class="section">
      <div class="card">
        <h2>AR / VR / Mixed Reality Engines</h2>
        <p>Engine registry for augmented reality, virtual reality, and mixed reality execution profiles.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Engine</th><th>Mode</th><th>Target</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="6">No immersive engines yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderHybridGamesPage(user = null) {
  const rows = dbQuery("SELECT id, engine_name, game_type, latency_profile, engine_status, created_at FROM hybrid_game_engines ORDER BY id DESC");
  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.engine_name}</td>
      <td>${r.game_type}</td>
      <td>${r.latency_profile || ''}</td>
      <td>${r.engine_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Hybrid Games Engine', `
    <div class="section">
      <div class="card">
        <h2>Quantum Hybrid Games Engine</h2>
        <p>Game-world engine registry for competitive rooms, creator worlds, and hybrid interactive experiences.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Engine</th><th>Game Type</th><th>Latency Profile</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="6">No hybrid game engines yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderPerformanceProfilesPage(user = null) {
  const rows = dbQuery("SELECT id, profile_name, profile_type, optimization_target, profile_status, created_at FROM performance_profiles ORDER BY id DESC");
  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.profile_name}</td>
      <td>${r.profile_type}</td>
      <td>${r.optimization_target || ''}</td>
      <td>${r.profile_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Performance Profiles', `
    <div class="section">
      <div class="card">
        <h2>Quantum Speed Accelerator + Quantum Lag Buster</h2>
        <p>Performance control registry for scene loading, world transitions, stream responsiveness, and interactive experience optimization.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Profile</th><th>Type</th><th>Optimization Target</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="6">No performance profiles yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderNanotechPage(user = null) {
  const rows = dbQuery("SELECT id, asset_name, asset_type, control_profile, asset_status, created_at FROM nanotech_registry ORDER BY id DESC");
  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.asset_name}</td>
      <td>${r.asset_type}</td>
      <td>${r.control_profile || ''}</td>
      <td>${r.asset_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Nanotech Registry', `
    <div class="section">
      <div class="card">
        <h2>Nanotech Registry</h2>
        <p>Nanotech registry for future fabrication, advanced materials, healing material concepts, and nano-scale manufacturing integration.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Asset</th><th>Type</th><th>Control Profile</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="6">No nanotech assets yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}
'''
insert_before("const server = http.createServer(async (req, res) => {", pages)

anchor = "    if (req.method === 'GET' && pathname === '/scene-viewer') {"
if "pathname === '/quantum-holo'" not in text and anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/quantum-holo') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderQuantumHoloPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/immersive-engines') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderImmersiveEnginesPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/hybrid-games') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHybridGamesPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/performance-profiles') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPerformanceProfilesPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/nanotech') {
      const authUser = hardenAdminAccess(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderNanotechPage(authUser));
    }

    if (req.method === 'GET' && pathname === '/scene-viewer') {"""
    text = text.replace(anchor, routes)

p.write_text(text)
print("[OK] quantum holo engine patch applied")
PYEOF

########################################
# 3) RESTART / VERIFY
########################################
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh

########################################
# 4) CHECKPOINT
########################################
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots

cp apps/dashboard.js "backups/dashboard_quantum_holo_${STAMP}.js"
cp db/aam.db "backups/aam_quantum_holo_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as holographic_generators from holographic_generators;" > "snapshots/holographic_generators_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as immersive_engines from immersive_engines;" > "snapshots/immersive_engines_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as hybrid_game_engines from hybrid_game_engines;" > "snapshots/hybrid_game_engines_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as performance_profiles from performance_profiles;" > "snapshots/performance_profiles_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as nanotech_registry from nanotech_registry;" > "snapshots/nanotech_registry_${STAMP}.json"
sqlite3 -json db/aam.db "select count(*) as engine_scene_links from engine_scene_links;" > "snapshots/engine_scene_links_${STAMP}.json"

echo "QUANTUM HOLO ENGINE CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/quantum-holo"
echo "  termux-open-url http://127.0.0.1:4900/immersive-engines"
echo "  termux-open-url http://127.0.0.1:4900/hybrid-games"
echo "  termux-open-url http://127.0.0.1:4900/performance-profiles"
echo "  termux-open-url http://127.0.0.1:4900/nanotech"
