import fs from'node:fs';import assert from'node:assert/strict';
const src=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8');
for(const t of ['vehicleOccupied','cameraUiMode','tryamm:streetverse-toggle-player-camera','tryamm:streetverse-cycle-vehicle-camera','joystickWatchdog','applySeatedDriverPose',"new THREE.Vector3(-.36,.70,.42)"])assert.ok(src.includes(t),`missing mobile control/seat fix: ${t}`);
assert.ok(src.includes('clearInterval(joystickWatchdog)'),'joystick watchdog cleanup missing');
console.log('StreetVerse mobile control + seated driver contract: PASS');
