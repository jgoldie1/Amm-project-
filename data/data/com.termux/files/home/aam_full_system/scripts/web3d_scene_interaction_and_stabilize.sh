#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== WEB3D SCENE INTERACTION + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results public/world3d

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_web3d_interaction_${STAMP}.js"
cp db/aam.db "backups/aam_web3d_interaction_${STAMP}.db"
cp public/world3d/index.html "backups/world3d_index_${STAMP}.html"

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
CREATE TABLE IF NOT EXISTS web3d_interaction_targets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  node_name TEXT NOT NULL,
  interaction_label TEXT NOT NULL,
  destination_route TEXT NOT NULL,
  interaction_type TEXT NOT NULL DEFAULT 'route_jump',
  target_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

targets = [
    ("Marketplace Hub", "Open Marketplace Systems", "/connect-system"),
    ("Creator Stage", "Open Creator / Streaming Layer", "/watch"),
    ("World Gate", "Open Engine + World Control", "/engine-bridge"),
    ("NPC Alpha", "Open Accessibility Layer", "/accessibility"),
    ("NPC Beta", "Open Avatar Rig Layer", "/avatar-rig-control"),
    ("Player Spawn", "Open Role Hub", "/role-hub"),
]

for row in targets:
    cur.execute("""
    INSERT INTO web3d_interaction_targets
    (node_name, interaction_label, destination_route, interaction_type, target_status)
    VALUES (?, ?, ?, 'route_jump', 'active')
    """, row)

conn.commit()
conn.close()
print("[OK] web3d interaction targets ready")
PYEOF

########################################
# 3) PATCH WORLD HTML
########################################
cat > public/world3d/index.html <<'HTML'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>AAM Interactive Web 3D World</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body {
      margin: 0;
      height: 100%;
      background: #020617;
      color: #fff;
      font-family: Arial, sans-serif;
    }
    #app {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: linear-gradient(180deg, #0b1120 0%, #111827 100%);
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
    .hud {
      position: absolute;
      top: 12px;
      left: 12px;
      right: 12px;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      pointer-events: none;
    }
    .panel, .controls, .interaction-panel, .legend {
      pointer-events: auto;
      background: rgba(2, 6, 23, 0.84);
      border: 1px solid #334155;
      border-radius: 18px;
      box-shadow: 0 10px 28px rgba(0,0,0,.28);
      backdrop-filter: blur(10px);
    }
    .panel {
      padding: 14px 16px;
      max-width: 560px;
    }
    .controls {
      padding: 12px;
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .interaction-panel {
      position: absolute;
      right: 12px;
      bottom: 12px;
      width: min(380px, calc(100vw - 24px));
      padding: 14px;
    }
    .legend {
      position: absolute;
      bottom: 12px;
      left: 12px;
      max-width: 420px;
      padding: 12px 14px;
      line-height: 1.5;
    }
    .panel h1, .interaction-panel h2 {
      margin: 0 0 8px 0;
    }
    .badge {
      display: inline-block;
      padding: 7px 10px;
      border-radius: 999px;
      background: #1d4ed8;
      font-size: 0.92rem;
      margin-right: 6px;
      margin-top: 6px;
    }
    button, .action-link {
      min-height: 48px;
      border-radius: 12px;
      border: 1px solid #475569;
      background: #0f172a;
      color: #fff;
      padding: 10px 14px;
      cursor: pointer;
      font-size: 0.98rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    button:focus, .action-link:focus {
      outline: 3px solid #60a5fa;
      outline-offset: 2px;
    }
    .action-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 12px;
    }
    .skip-link {
      position: absolute;
      left: -9999px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
    }
    .skip-link:focus {
      left: 16px;
      top: 16px;
      width: auto;
      height: auto;
      z-index: 9999;
      background: #111827;
      color: #fff;
      padding: 12px 16px;
      border-radius: 12px;
    }
    @media (prefers-reduced-motion: reduce) {
      * {
        animation: none !important;
        transition: none !important;
      }
    }
  </style>
</head>
<body>
  <a class="skip-link" href="#controls">Skip to controls</a>
  <div id="app" aria-label="Interactive Web 3D world prototype">
    <div class="hud">
      <div class="panel">
        <h1>AAM Interactive Web 3D World</h1>
        <p>This prototype adds clickable world interactions so the 3D world can route into your ecosystem.</p>
        <span class="badge">Marketplace Hub</span>
        <span class="badge">Creator Stage</span>
        <span class="badge">World Gate</span>
        <span class="badge">NPC Interaction</span>
      </div>
      <div id="controls" class="controls" aria-label="World controls">
        <button id="btnDay">Day</button>
        <button id="btnNight">Night</button>
        <button id="btnReset">Reset View</button>
        <button id="btnLabels">Toggle Labels</button>
      </div>
    </div>

    <div class="legend">
      <strong>Interaction</strong>
      Click a visible object in the world to open an interaction card. Then jump into the linked system page.
    </div>

    <div class="interaction-panel" id="interactionPanel" aria-live="polite">
      <h2>World Interaction</h2>
      <p id="interactionText">Select an object in the 3D scene.</p>
      <div class="action-row">
        <a id="interactionLink" class="action-link" href="/world-experience-control">Open Target</a>
      </div>
    </div>
  </div>

  <script type="module">
    import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
    import { OrbitControls } from 'https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js';

    const app = document.getElementById('app');
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0b1120, 40, 180);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(18, 14, 26);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    app.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2, -10);
    controls.enableDamping = true;
    controls.maxDistance = 120;
    controls.minDistance = 8;
    controls.maxPolarAngle = Math.PI / 2.1;

    const hemi = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.2);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1.25);
    dir.position.set(24, 30, 10);
    scene.add(dir);

    const groundGeo = new THREE.PlaneGeometry(220, 220, 20, 20);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1f3b2d,
      roughness: 0.95,
      metalness: 0.02
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const grid = new THREE.GridHelper(220, 44, 0x334155, 0x1e293b);
    scene.add(grid);

    function makeBox(x, y, z, sx, sy, sz, color, meta) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(sx, sy, sz),
        new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.08 })
      );
      mesh.position.set(x, y, z);
      mesh.userData = meta;
      scene.add(mesh);
      return mesh;
    }

    function makeCylinder(x, y, z, rTop, rBottom, h, color, meta) {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(rTop, rBottom, h, 24),
        new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.06 })
      );
      mesh.position.set(x, y, z);
      mesh.userData = meta;
      scene.add(mesh);
      return mesh;
    }

    const interactiveObjects = [];

    function addInteractive(mesh) {
      interactiveObjects.push(mesh);
      return mesh;
    }

    const hub = addInteractive(makeBox(0, 2.5, -20, 10, 5, 10, 0x2563eb, {
      label: 'Marketplace Hub',
      description: 'Connect brands, domains, storefronts, and commerce systems.',
      href: '/connect-system'
    }));

    const stage = addInteractive(makeCylinder(18, 1, -10, 5, 5, 2, 0x7c3aed, {
      label: 'Creator Stage',
      description: 'Enter streaming, creator surfaces, and watch flows.',
      href: '/watch'
    }));

    const gateLeft = makeBox(-20, 4, -12, 2, 8, 2, 0xf59e0b, {});
    const gateRight = makeBox(-14, 4, -12, 2, 8, 2, 0xf59e0b, {});
    const gateTop = addInteractive(makeBox(-17, 8.5, -12, 8, 1, 2, 0xfbbf24, {
      label: 'World Gate',
      description: 'Jump into engine bridge and world control systems.',
      href: '/engine-bridge'
    }));

    const avatar = addInteractive(makeCylinder(0, 1, 0, 0.7, 0.9, 2, 0x22c55e, {
      label: 'Player Spawn',
      description: 'Open the role hub and central platform routing.',
      href: '/role-hub'
    }));

    const npc1 = addInteractive(makeCylinder(8, 1, -6, 0.6, 0.8, 1.8, 0xef4444, {
      label: 'NPC Alpha',
      description: 'Open accessibility controls and inclusive interaction settings.',
      href: '/accessibility'
    }));

    const npc2 = addInteractive(makeCylinder(-8, 1, -8, 0.6, 0.8, 1.8, 0xf97316, {
      label: 'NPC Beta',
      description: 'Open avatar rig and holographic character controls.',
      href: '/avatar-rig-control'
    }));

    const labels = [];
    function createLabel(text, position) {
      const div = document.createElement('div');
      div.textContent = text;
      div.style.position = 'absolute';
      div.style.color = '#fff';
      div.style.background = 'rgba(2,6,23,.72)';
      div.style.padding = '6px 8px';
      div.style.borderRadius = '10px';
      div.style.border = '1px solid #334155';
      div.style.fontSize = '13px';
      div.style.pointerEvents = 'none';
      app.appendChild(div);
      labels.push({ el: div, position });
    }

    createLabel('Marketplace Hub', new THREE.Vector3(0, 5.5, -20));
    createLabel('Creator Stage', new THREE.Vector3(18, 3.6, -10));
    createLabel('World Gate', new THREE.Vector3(-17, 10.2, -12));
    createLabel('Player Spawn', new THREE.Vector3(0, 3.2, 0));
    createLabel('NPC Alpha', new THREE.Vector3(8, 3, -6));
    createLabel('NPC Beta', new THREE.Vector3(-8, 3, -8));

    let labelsVisible = true;

    function updateLabels() {
      labels.forEach(item => {
        const vector = item.position.clone().project(camera);
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
        item.el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        item.el.style.display = labelsVisible ? 'block' : 'none';
      });
    }

    function setDay() {
      renderer.setClearColor(0x87ceeb, 1);
      scene.fog.color.set(0x87ceeb);
      hemi.intensity = 1.25;
      dir.intensity = 1.25;
      ground.material.color.set(0x356b4c);
    }

    function setNight() {
      renderer.setClearColor(0x020617, 1);
      scene.fog.color.set(0x0b1120);
      hemi.intensity = 0.55;
      dir.intensity = 0.45;
      ground.material.color.set(0x163126);
    }

    const interactionText = document.getElementById('interactionText');
    const interactionLink = document.getElementById('interactionLink');

    function setInteraction(meta) {
      interactionText.textContent = `${meta.label}: ${meta.description}`;
      interactionLink.href = meta.href;
      interactionLink.textContent = `Open ${meta.label}`;
    }

    document.getElementById('btnDay').addEventListener('click', setDay);
    document.getElementById('btnNight').addEventListener('click', setNight);
    document.getElementById('btnReset').addEventListener('click', () => {
      camera.position.set(18, 14, 26);
      controls.target.set(0, 2, -10);
      controls.update();
    });
    document.getElementById('btnLabels').addEventListener('click', () => {
      labelsVisible = !labelsVisible;
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function onPointerClick(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactiveObjects, false);
      if (hits.length > 0) {
        const meta = hits[0].object.userData || {};
        if (meta && meta.href) setInteraction(meta);
      }
    }

    renderer.domElement.addEventListener('click', onPointerClick);

    setDay();
    setInteraction({
      label: 'World Ready',
      description: 'Click an object in the world to open an ecosystem destination.',
      href: '/world-experience-control'
    });

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      avatar.rotation.y += 0.01;
      npc1.rotation.y -= 0.008;
      npc2.rotation.y += 0.006;
      updateLabels();
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>
HTML

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
# 5) SMOKE TEST
########################################
for route in \
  / \
  /world3d \
  /web3d-client \
  /world-experience-control \
  /engine-bridge \
  /avatar-rig-control \
  /watch \
  /connect-system \
  /role-hub
do
  name="$(echo "$route" | sed 's#^/##' | sed 's#/#_#g')"
  [ -z "$name" ] && name="home"
  curl -s -i "http://127.0.0.1:4900$route" > "test_results/${name}_${STAMP}.txt" || true
done

########################################
# 6) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select count(*) as web3d_interaction_targets from web3d_interaction_targets;" > "snapshots/web3d_interaction_targets_${STAMP}.json"
sqlite3 -json db/aam.db "select id, node_name, interaction_label, destination_route, interaction_type, target_status, created_at from web3d_interaction_targets order by id desc limit 100;" > "snapshots/web3d_interaction_targets_tail_${STAMP}.json"

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

latest = Path.home() / "aam_full_system" / "snapshots" / "web3d_interaction_scan_latest.json"
latest.write_text(json.dumps(issues, indent=2))
print(f"[OK] web3d interaction scan complete: {len(issues)} issues")
PYEOF

########################################
# 8) REPORT
########################################
cat > "reports/web3d_scene_interaction_and_stabilize_${STAMP}.txt" <<REPORT
WEB3D SCENE INTERACTION + STABILIZE REPORT
Timestamp: ${STAMP}

Added:
- web3d_interaction_targets
- clickable world interactions
- interaction panel
- route-linked world objects

Purpose:
- make the 3d scene interactive
- connect world objects to platform systems
- stabilize everything around usable world navigation
REPORT

echo "WEB3D SCENE INTERACTION + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/web3d_interaction_scan_latest.json"
echo "  cat snapshots/web3d_interaction_targets_tail_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/world3d"
echo "  termux-open-url http://127.0.0.1:4900/web3d-client"
echo "  termux-open-url http://127.0.0.1:4900/world-experience-control"
