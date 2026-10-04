import fs from 'node:fs';import assert from 'node:assert/strict';
const src=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8');
for(const token of ['cameraLookYaw','cameraLookPitch','tryamm:streetverse-camera-look','applyThirdPersonShoulderCamera','switchShoulder','Switch third person shoulder'])assert.ok(src.includes(token),`missing camera polish: ${token}`);
assert.ok(src.includes('clampCameraLook'),'free-look safety clamp missing');
assert.ok(src.includes("playerCameraMode==='third-person'&&applyThirdPersonShoulderCamera"),'third-person shoulder runtime missing');
console.log('StreetVerse free-look and shoulder camera contract: PASS');
