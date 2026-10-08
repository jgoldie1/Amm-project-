import fs from 'node:fs';import assert from 'node:assert/strict';
const src=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8');
for(const token of ['cameraLookYaw','cameraLookPitch','tryamm:streetverse-camera-look','applyThirdPersonShoulderCamera','switchShoulder','Switch third person shoulder'])assert.ok(src.includes(token),`missing camera polish: ${token}`);
assert.ok(src.includes('clampCameraLook'),'free-look safety clamp missing');
assert.ok(src.includes("playerCameraMode==='third-person'&&applyThirdPersonShoulderCamera"),'third-person shoulder runtime missing');
const clearance=fs.readFileSync(new URL('../src/runtime/StreetVerseCameraClearance.ts',import.meta.url),'utf8');
assert.ok(src.includes("enforceStreetVerseCameraClearance(origin,camera.position,cameraObstacles,externalCollisionBoxes,nearbyVehicleObstacles)"),"smoothed mobile shoulder camera must be collision checked");
for(const token of ['export function enforceStreetVerseCameraClearance','expandByScalar(.28)','cameraPosition.copy(focus).addScaledVector(direction,clearDistance)'])assert.ok(clearance.includes(token),'missing swept camera clearance: '+token);
console.log('StreetVerse free-look, shoulder, and smoothed collision-clearance contract: PASS');
