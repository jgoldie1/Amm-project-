import fs from'node:fs';import assert from'node:assert/strict';
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/components/streetverse-mobile-layout.css',import.meta.url),'utf8');
for(const token of ['externalCameraObstacles','ray.intersectBox(box,hit)','Math.max(1.35','safeDesired'])assert.ok(world.includes(token),token);
for(const token of ['max-width: 480px','max-height: 82px','width: 116px','width: 98px'])assert.ok(css.includes(token),token);
console.log('StreetVerse iPhone world-view emergency fix contract: PASS');
