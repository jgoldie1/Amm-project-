const fs = require('fs');
const path = require('path');

function ensureDir(file) {
  const dir = path.dirname(path.resolve(file));
  fs.mkdirSync(dir, { recursive: true });
}

function loadJson(file, fallback) {
  try {
    const p = path.resolve(file);
    ensureDir(p);
    if (!fs.existsSync(p)) {
      fs.writeFileSync(p, JSON.stringify(fallback, null, 2));
      return fallback;
    }
    const raw = fs.readFileSync(p, 'utf8').trim();
    if (!raw) {
      fs.writeFileSync(p, JSON.stringify(fallback, null, 2));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function saveJson(file, data) {
  const p = path.resolve(file);
  ensureDir(p);
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

module.exports = { loadJson, saveJson };
