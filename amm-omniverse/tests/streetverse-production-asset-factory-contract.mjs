import fs from'node:fs';import assert from'node:assert/strict';
const forger=fs.readFileSync(new URL('../src/game/forger/StreetVerseWorldForger.ts',import.meta.url),'utf8');
const manifest=fs.readFileSync(new URL('../src/game/forger/StreetVerseProductionAssetManifest.ts',import.meta.url),'utf8');
for(const token of ['building','character','vehicle','prop','meshy','collision','lod-mobile'])assert.ok(forger.toLowerCase().includes(token),`World Forger missing ${token}`);
for(const token of ['SV_HERO_BJ_STUBBS_V6.glb','sit-drive','talk-lipsync','five-seats','two-way-lanes','device-verified'])assert.ok(manifest.includes(token),`production manifest missing ${token}`);
assert.ok(manifest.includes("state:'required'"),'missing explicit unfinished state');
console.log('StreetVerse production asset factory contract: PASS');
