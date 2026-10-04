import fs from'node:fs';import assert from'node:assert/strict';
const world=fs.readFileSync(new URL('../src/runtime/StreetVerseWestSideVisibleWorldRuntime.ts',import.meta.url),'utf8');
const spec=fs.readFileSync(new URL('../src/game/forger/ThomasJeffersonSchoolReconstruction.ts',import.meta.url),'utf8');
for(const t of ['addThomasJeffersonSchool','jefferson-masonry','jefferson-stone-belt','jefferson-cornice','jefferson-tall-window','THOMAS JEFFERSON SCHOOL','1522 W Fillmore St'])assert.ok(world.includes(t),t);
assert.ok(!world.includes("label:'Jefferson School'"),'generic Jefferson box must stay removed');
for(const t of ['classrooms','gymnasium','library/media center','stairs','accessible vertical circulation','interior-nav','iPhone-device-verify'])assert.ok(spec.includes(t),t);
console.log('Thomas Jefferson School reconstruction contract: PASS');
