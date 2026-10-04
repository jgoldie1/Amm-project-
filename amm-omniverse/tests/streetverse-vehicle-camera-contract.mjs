import fs from 'node:fs';import assert from 'node:assert/strict';
const src=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8');
for(const mode of ["'chase'","'driver'","'front-passenger'","'rear-left'","'rear-center'","'rear-right'","'dashboard'","'cinematic'"])assert.ok(src.includes(mode),`missing vehicle camera ${mode}`);
assert.ok(src.includes('applyVehicleCamera'),'vehicle camera transform missing');
assert.ok(src.includes('tryamm:streetverse-vehicle-camera'),'vehicle camera event missing');
assert.ok(src.includes('Cycle vehicle camera'),'one-tap camera UI missing');
console.log('StreetVerse vehicle camera contract: PASS');
