const fs = require('fs');
const path = require('path');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function buildIndex() {
  const ecosystem = readJson('data/world/ecosystem_registry.json', {});
  const gifts = readJson('data/world/holographic_gifts.json', { gifts: [] });
  const themes = readJson('data/themes/child_themes.json', { themes: [] });

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

  writeJson('data/index/search_index.json', {
    builtAt: new Date().toISOString(),
    count: docs.length,
    docs
  });

  console.log(`Indexed ${docs.length} docs`);
}

buildIndex();
