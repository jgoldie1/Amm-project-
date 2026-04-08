const fs = require('fs');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

function search(q) {
  const index = readJson('data/index/search_index.json', { docs: [] });
  const needle = String(q || '').trim().toLowerCase();
  if (!needle) return [];

  return index.docs.filter(doc =>
    doc.name.toLowerCase().includes(needle) ||
    (doc.tags || []).some(tag => tag.includes(needle))
  ).slice(0, 20);
}

const q = process.argv.slice(2).join(' ');
console.log(JSON.stringify({ ok: true, query: q, results: search(q) }, null, 2));
