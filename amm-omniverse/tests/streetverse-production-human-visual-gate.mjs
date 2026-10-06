import fs from'node:fs';import assert from'node:assert/strict';
const src=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8');
assert.ok(src.includes("status:'fallback-not-production-ready'"));
assert.ok(src.includes("status:'missing-production-glb'"));
assert.ok(src.includes("status:'production-human-ready'"));
assert.ok(src.includes("BJ V6 HUMAN ASSET MISSING"));
assert.ok(!src.includes("source:'streetverse-mobile-procedural-fallback-until-photo-head-ready'"));
console.log('StreetVerse production human visual gate: PASS');
