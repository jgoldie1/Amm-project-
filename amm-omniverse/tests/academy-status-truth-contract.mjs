import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/foundation/academyStatusRegistry.ts', import.meta.url), 'utf8');
assert.ok(source.includes("Streamers Academy', status: 'BUILDING'"));
assert.ok(source.includes("TRYAMM Opportunity Center', status: 'BUILDING'"));
assert.ok(source.includes("Skills / Talent Passport', status: 'BUILDING'"));
assert.ok(!source.includes("Streamers Academy', status: 'LIVE'"));
console.log('academy status truth contract: ok');
