const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4902;
const { renderMemoryArchive } = require('./memory_system');
const { renderTimeMachine } = require('./time_machine');
const { renderWorld, renderAudioAndGifts } = require('./world_renderer');
const ROOT = path.join(process.env.HOME, 'aam_full_system', 'data', 'world', 'life_of_yahuah_maschian');

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, name), 'utf8'));
}

function page(manifest, zones, scenes, quests) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${manifest.title}</title>
  <style>
    body { font-family: Arial, sans-serif; background:#020617; color:#e2e8f0; margin:0; padding:20px; }
    .card,.topbar { background:#111827; border:1px solid #334155; border-radius:16px; padding:16px; }
    .topbar { margin-bottom:20px; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:16px; }
    .section { margin-top:24px; }
    .pill { display:inline-block; padding:6px 10px; background:#2563eb; border-radius:999px; margin-right:8px; margin-top:6px; font-size:13px; }
    button,select { background:#2563eb; color:white; border:none; border-radius:10px; padding:10px 14px; margin-right:8px; cursor:pointer; }
    .muted { color:#94a3b8; }
    .quest { background:#0f172a; border:1px solid #334155; border-radius:12px; padding:12px; margin-top:12px; }
  </style>
</head>
<body>
  <div class="topbar">
    <h1>${manifest.title}</h1>
    <p class="muted">Playable metaverse / middleverse / multiverse foundation</p>
    <span class="pill">Port 4902</span>
    <span class="pill">${scenes.length} Scenes</span>
    <span class="pill">${quests.length} Quests</span>
    <span class="pill">Playable</span>
  </div>

  <div class="section">
    <div class="grid">
      ${manifest.realms.map(r => `
        <div class="card">
          <h3>${r.name}</h3>
          <p>${r.purpose}</p>
        </div>
      `).join('')}
    </div>
  </div>

  <div class="section">
    <div class="card">
      <h2>World Explorer</h2>
      <select id="sceneSelect">
        ${scenes.map(s => `<option value="${s.id}">${s.id} — ${s.title}</option>`).join('')}
      </select>
      <button onclick="loadScene()">Load Scene</button>
      <button onclick="prevScene()">Prev</button>
      <button onclick="nextScene()">Next</button>
      <div id="sceneBox" class="quest"></div>
    </div>
  </div>

  <div class="section">
    <div class="grid">
      ${zones.map(z => `
        <div class="card">
          <h3>${z.name}</h3>
          <p><strong>Realm:</strong> ${z.realm}</p>
          <p><strong>Recommended Level:</strong> ${z.recommendedLevel}</p>
        </div>
      `).join('')}
    </div>
  </div>

  <script>
    const scenes = ${JSON.stringify(scenes)};
    const quests = ${JSON.stringify(quests)};
    let current = 0;

    function renderScene(scene) {
      const quest = quests.find(q => q.sceneId === scene.id);
      document.getElementById('sceneBox').innerHTML = \`
        <h3>\${scene.title}</h3>
        <p><strong>Zone:</strong> \${scene.zoneName}</p>
        <p><strong>Realm:</strong> \${scene.realm}</p>
        <p><strong>Description:</strong> \${scene.description}</p>
        <div class="quest">
          <h4>\${quest.title}</h4>
          <p><strong>Objective:</strong> \${quest.objective}</p>
          <p><strong>XP:</strong> \${quest.xp}</p>
          <p><strong>Reward:</strong> \${quest.reward.scroll} + \${quest.reward.teaching}</p>
          <p><strong>Unlocks:</strong> \${quest.unlockScene || 'End of chain'}</p>
        </div>
      \`;
      document.getElementById('sceneSelect').value = scene.id;
    }

    function loadScene() {
      const id = document.getElementById('sceneSelect').value;
      const idx = scenes.findIndex(s => s.id === id);
      if (idx >= 0) {
        current = idx;
        renderScene(scenes[current]);
      }
    }

    function prevScene() {
      if (current > 0) {
        current -= 1;
        renderScene(scenes[current]);
      }
    }

    function nextScene() {
      if (current < scenes.length - 1) {
        current += 1;
        renderScene(scenes[current]);
      }
    }

    renderScene(scenes[0]);
  </script>
${renderWorld()}
${renderAudioAndGifts()}
${renderMemoryArchive()}
${renderTimeMachine()}
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const manifest = load('world_manifest.json');
  const zones = load('zones.json');
  const scenes = load('scenes.json');
  const quests = load('quests.json');

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, service: 'life-world', port: PORT }, null, 2));
  }

  if (req.url === '/api/world') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ manifest, zones, scenes, quests }, null, 2));
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(page(manifest, zones, scenes, quests));
});

server.listen(PORT, () => {
  console.log(`Life world running on ${PORT}`);
});
