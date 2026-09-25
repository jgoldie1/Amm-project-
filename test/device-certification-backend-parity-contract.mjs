import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const production = read('../.github/workflows/deploy-tryamm-production.yml');
const device = read('../.github/workflows/tryamm-device-certification.yml');

const backendPattern = /https:\/\/[^'\s]+\.onrender\.com/g;
const productionBackends = [...new Set(production.match(backendPattern) || [])];
const deviceBackends = [...new Set(device.match(backendPattern) || [])];

assert.ok(productionBackends.length, 'production certification must probe at least one Render backend');
assert.ok(deviceBackends.length, 'device certification must probe at least one Render backend');
assert.deepEqual(
  deviceBackends,
  productionBackends,
  'device certification must probe the same Render backend(s) as production certification'
);

assert.match(device, /Require exact live production SHA/, 'device certification must bind proof to the exact live production SHA');
assert.match(device, /reel_created/, 'device certification must require a real Reel result');
assert.match(device, /saved_to_phone/, 'device certification must require Save to Phone result');
assert.match(device, /returned_to_world/, 'device certification must require world-loop continuity');

console.log('Device certification backend parity contract: PASS');
