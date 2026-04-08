const fs = require('fs');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

function query(q) {
  const index = readJson('data/index/oracle_index.json', { docs: [] });
  const needle = String(q || '').trim().toLowerCase();
  if (!needle) return [];
  return index.docs.filter(doc =>
    String(doc.name || '').toLowerCase().includes(needle) ||
    String(doc.text || '').toLowerCase().includes(needle) ||
    (doc.tags || []).some(tag => String(tag).toLowerCase().includes(needle))
  ).slice(0, 15);
}

const q = process.argv.slice(2).join(' ');
console.log(JSON.stringify({ ok: true, query: q, results: query(q) }, null, 2));
