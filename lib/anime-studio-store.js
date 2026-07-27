const fs = require('fs');
const path = require('path');

function createStore(filename = 'anime-studio-state.json') {
  const directory = path.join(process.cwd(), 'data', 'runtime');
  const filePath = path.join(directory, filename);
  const state = { projects: new Map(), plans: new Map(), jobs: new Map() };

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const group of Object.keys(state)) {
      for (const item of parsed[group] || []) state[group].set(item.id, item);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') console.warn('Anime Studio state could not be loaded:', error.message);
  }

  let saveTimer = null;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        fs.mkdirSync(directory, { recursive: true });
        const serialized = {};
        for (const [group, map] of Object.entries(state)) serialized[group] = [...map.values()];
        const tempPath = `${filePath}.tmp`;
        fs.writeFileSync(tempPath, JSON.stringify(serialized, null, 2), 'utf8');
        fs.renameSync(tempPath, filePath);
      } catch (error) {
        console.error('Anime Studio state could not be persisted:', error.message);
      }
    }, 50);
  }

  return { ...state, persist, filePath };
}

module.exports = { createStore };
