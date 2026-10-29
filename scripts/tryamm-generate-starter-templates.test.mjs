#!/usr/bin/env node
import assert from 'node:assert/strict';
import { verticals,render } from './tryamm-generate-starter-templates.mjs';
assert.equal(verticals.length,20,'Expected 20 starter industries');
assert.equal(new Set(verticals.map(v=>v[0])).size,20,'Duplicate slug');
for(const v of verticals){const html=render(v);assert.match(html,/<html lang="en">/);assert.match(html,/<meta name="viewport"/);assert.match(html,/No visitor information is collected/);assert.match(html,/No live booking or payments enabled/);assert.ok(!/<script/i.test(html),'No third-party scripts in preview');assert.ok(!/sk_live_|whsec_|service_role/i.test(html),'No sensitive credentials');}
console.log('PASS: 20 independent original preview shells; safe no-checkout notices and accessibility markup verified');
