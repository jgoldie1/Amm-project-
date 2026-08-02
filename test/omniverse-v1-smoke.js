'use strict';
const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('public/omniverse-v1.html', 'utf8');
const js = fs.readFileSync('public/omniverse-v1.js', 'utf8');

for (const marker of ['Enter Globe','Herrin proof journey','Quantum Tag','Flutterwave + Paystack sandbox']) {
  assert(html.includes(marker), `Missing frontend marker: ${marker}`);
}
for (const route of [
  '/api/profile/experience',
  '/api/experience/v1',
  '/api/enter-globe/prepare',
  '/api/payments/nigeria/providers',
  '/api/payments/nigeria/intents'
]) {
  assert(js.includes(route), `Frontend is not wired to ${route}`);
}
assert(js.includes("worldId: 'herrin'"), 'Herrin teleport target is missing');
assert(js.includes("currency: 'NGN'"), 'Nigeria currency wiring is missing');
console.log('Omniverse V1 frontend smoke test passed');
