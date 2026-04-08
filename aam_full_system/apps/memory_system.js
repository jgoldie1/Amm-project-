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
