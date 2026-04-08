#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== INSTALL MEMORY + TIME MACHINE + WORLDS ==="

mkdir -p data/memory apps/worlds backups

cp apps/life_world.js "backups/life_world_$(date +%Y%m%d_%H%M%S).js"

echo
echo "[1] MEMORY ARCHIVE"
cat > data/memory/memory_archive.json <<'EOF'
{
  "memories": [
    {
      "id": "memory_001",
      "title": "Bethlehem Arrival",
      "scene": "scene_001",
      "world": "yahuah",
      "timeline": "past",
      "playable": true
    },
    {
      "id": "memory_002",
      "title": "Moon Base Alpha",
      "scene": "moon_scene_001",
      "world": "moon",
      "timeline": "future",
      "playable": true
    }
  ]
}
EOF

echo
echo "[2] MEMORY SYSTEM"
cat > apps/memory_system.js <<'JS'
const fs = require('fs');

function loadJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return { memories: [] };
  }
}

function getMemories() {
  return loadJSON('data/memory/memory_archive.json').memories || [];
}

function renderMemoryArchive() {
  const memories = getMemories();

  return `
    <div class="section">
      <div class="card">
        <h2>Memory Archive</h2>
        <ul>
          ${memories.map(m => `
            <li>
              <strong>${m.title}</strong> — ${m.world} / ${m.timeline}
              <button onclick="loadMemory('${m.id}')">Enter</button>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
    <script>
      function loadMemory(id) {
        alert("Loading memory: " + id);
      }
    </script>
  `;
}

module.exports = { getMemories, renderMemoryArchive };
JS

echo
echo "[3] TIME MACHINE"
cat > apps/time_machine.js <<'JS'
function renderTimeMachine() {
  return `
    <div class="section">
      <div class="card">
        <h2>Time Machine</h2>

        <select id="worldSelect">
          <option value="earth">Earth</option>
          <option value="moon">Moon</option>
          <option value="mars">Mars</option>
          <option value="twin_earth">Twin Earth</option>
        </select>

        <select id="timelineSelect">
          <option value="past">Past</option>
          <option value="present">Present</option>
          <option value="future">Future</option>
        </select>

        <button onclick="jumpTimeMachine()">Activate Rings</button>
      </div>
    </div>

    <script>
      function jumpTimeMachine() {
        const world = document.getElementById('worldSelect').value;
        const timeline = document.getElementById('timelineSelect').value;

        alert(
          "Activating Rings:\\n" +
          "1. Coordinate Ring\\n" +
          "2. Timeline Ring\\n" +
          "3. World Ring\\n" +
          "4. Protection Shield\\n" +
          "5. Energy Core\\n\\n" +
          "Traveling to " + world + " in " + timeline
        );
      }
    </script>
  `;
}

module.exports = { renderTimeMachine };
JS

echo
echo "[4] WORLD FILES"
cat > apps/worlds/moon.js <<'JS'
function renderMoon() {
  return `<div class="card"><h2>Moon World</h2><p>Low gravity exploration.</p></div>`;
}
module.exports = { renderMoon };
JS

cat > apps/worlds/mars.js <<'JS'
function renderMars() {
  return `<div class="card"><h2>Mars World</h2><p>Red planet frontier.</p></div>`;
}
module.exports = { renderMars };
JS

cat > apps/worlds/twin_earth.js <<'JS'
function renderTwinEarth() {
  return `<div class="card"><h2>Twin Earth</h2><p>Alternate Earth timeline.</p></div>`;
}
module.exports = { renderTwinEarth };
JS

echo
echo "[5] PATCH LIFE WORLD"
python <<'PY'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "life_world.js"
text = p.read_text()

if "renderMemoryArchive" not in text:
    text = text.replace(
        "const PORT = 4902;",
        "const PORT = 4902;\nconst { renderMemoryArchive } = require('./memory_system');\nconst { renderTimeMachine } = require('./time_machine');",
        1
    )

if "renderTimeMachine()" not in text:
    text = text.replace("</body>", "${renderMemoryArchive()}\n${renderTimeMachine()}\n</body>", 1)

p.write_text(text)
print("life_world.js patched")
PY

echo
echo "[6] VERIFY"
python -m json.tool data/memory/memory_archive.json >/dev/null && echo "memory_archive.json: OK"
node -c apps/memory_system.js
node -c apps/time_machine.js
node -c apps/worlds/moon.js
node -c apps/worlds/mars.js
node -c apps/worlds/twin_earth.js
node -c apps/life_world.js

echo
echo "[7] RESTART + SMOKE"
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh

echo
echo "[8] VERIFY LIFE WORLD"
curl -s http://127.0.0.1:4902/health ; echo
curl -s http://127.0.0.1:4902/ | grep -nE "Memory Archive|Time Machine|Moon Base Alpha|Activate Rings" || true

echo
echo "DONE"
echo "memory_archive: READY"
echo "time_machine: READY"
echo "world_starters: READY"
echo "platform: STABLE"
