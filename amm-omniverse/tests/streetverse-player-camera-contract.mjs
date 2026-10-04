import fs from 'node:fs';import assert from 'node:assert/strict';
const src=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8');
for(const token of ["type PlayerCameraMode='third-person'|'first-person'","applyFirstPersonCamera","tryamm:streetverse-player-camera","Toggle first person third person camera","1ST PERSON","3RD PERSON"])assert.ok(src.includes(token),`missing player camera contract: ${token}`);
assert.ok(src.includes("!activeCar&&playerCameraMode==='first-person'"),'first-person must apply to on-foot play');
assert.ok(src.includes("activeCar&&applyVehicleCamera"),'vehicle cameras must retain authority in cars');
console.log('StreetVerse first/third-person camera contract: PASS');
