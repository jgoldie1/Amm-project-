'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function existingPublicTarget(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean || clean === '/') return true;
  if (!clean.startsWith('/')) return true;
  const target = clean.endsWith('/') ? `${clean}index.html` : clean;
  return fs.existsSync(path.join(publicDir, target.replace(/^\//, '')));
}

function auditLinks(rel) {
  const html = read(rel);
  const hrefs = [...html.matchAll(/\bhref=["']([^"']+)["']/g)].map(m => m[1]);
  const broken = hrefs.filter(href => href.startsWith('/') && !href.startsWith('//') && !existingPublicTarget(href));
  assert.deepStrictEqual(broken, [], `${rel} has missing internal targets: ${broken.join(', ')}`);
}

function auditButtonIds(htmlRel, jsRels, exempt = []) {
  const html = read(htmlRel);
  const js = jsRels.map(read).join('\n');
  const ids = [...html.matchAll(/<button\b[^>]*\bid=["']([^"']+)["']/gi)].map(m => m[1]);
  const missing = ids.filter(id => !exempt.includes(id) && !js.includes(`#${id}`) && !js.includes(`getElementById('${id}')`) && !js.includes(`getElementById("${id}")`));
  assert.deepStrictEqual(missing, [], `${htmlRel} has button IDs without handlers: ${missing.join(', ')}`);
}

function auditDataControls(htmlRel, jsRels, attribute) {
  const html = read(htmlRel);
  const js = jsRels.map(read).join('\n');
  if (!new RegExp(`\\b${attribute}=["']`).test(html)) return;
  assert(js.includes(`[${attribute}]`) || js.includes(`dataset.${attribute.replace(/^data-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`), `${htmlRel} uses ${attribute} controls but no matching delegated handler was found`);
}

auditLinks('public/index.html');
auditLinks('public/spaceverse.html');
auditLinks('public/moon-mission.html');
auditLinks('public/el-saturn-space.html');

auditButtonIds('public/index.html', ['public/app.js', 'public/judah-splash.js', 'public/install-app.js'], ['splashStart', 'splashSkip', 'splashReplay', 'installOpen', 'installConfirm', 'installDismiss']);
auditDataControls('public/index.html', ['public/app.js'], 'data-open');
auditDataControls('public/index.html', ['public/app.js'], 'data-gift');
auditDataControls('public/index.html', ['public/app.js'], 'data-status');

auditButtonIds('public/spaceverse.html', ['public/spaceverse.js']);
auditDataControls('public/spaceverse.html', ['public/spaceverse.js'], 'data-world');
auditDataControls('public/spaceverse.html', ['public/spaceverse.js'], 'data-model');

console.log('TRYAMM UI route/button audit passed');
