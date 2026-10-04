import fs from'node:fs';import assert from'node:assert/strict';
const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts',import.meta.url),'utf8');
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8');
for(const token of ["status:'missing'","status:'invalid-or-load-failed'","status:'ready'","instanceof THREE.SkinnedMesh","instanceof THREE.Bone","boneCount<12"])assert.ok(runtime.includes(token),`missing production human validation: ${token}`);
for(const token of ["loadStreetVerseMeshyBJHeroDetailed","fallbackActive","invalid-or-load-failed","nativeCancelled||!nativeLayer"])assert.ok(world.includes(token),`missing production human status guard: ${token}`);
assert.ok(!world.includes("void loadStreetVerseMeshyBJHero().then(handle=>{"),'legacy ambiguous BJ loader still wired');
console.log('StreetVerse BJ production human validation contract: PASS');
