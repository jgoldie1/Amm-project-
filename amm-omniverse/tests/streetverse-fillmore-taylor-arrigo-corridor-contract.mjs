import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const scene=read('../src/runtime/StreetVerseFillmoreTaylorArrigoCorridorV1.ts')
const gate=read('../src/runtime/CircleParkTaylorGuardGateV1.ts')
const world=read('../src/components/StreetVerseMobileWorld.tsx')
const grid=read('../src/data/StreetVerseChicagoBuildGrid.ts')
const builder=read('../src/components/StreetVerseWestSideWorldBuilder.tsx')
for(const name of ["id:'fillmore'","id:'taylor'","id:'little-italy'","id:'arrigo-park'","'W FILLMORE ST'","'W TAYLOR ST'","'ARRIGO PARK'","'arrigo-park-grass-pocket'","'arrigo-park-cross-path'","'arrigo-park-mature-tree-trunk'","'fillmore-street-pedestrian-crosswalk'","'little-italy-route-wayfinding-sign'"]){
 assert.ok(scene.includes(name),'Corridor is missing '+name)
}
assert.ok(scene.includes('surveyed:false'),'No claim of precise geographical reconstruction')
assert.ok(scene.includes('routeIsRealWorldNavigation:false'),'No false geographic directions')
assert.ok(gate.includes('circle-park-reference-black-iron-fence'),'Black iron fence from supplied photo study must be visible')
assert.ok(gate.includes('taylor-laflin-entry-outer-masonry-pier'),'Brick piers from user photos must appear')
for(const token of [
 'installStreetVerseFillmoreTaylorArrigoCorridorV1(circleParkReality)',
 "['little-italy-route','🌳 FILLMORE → ARRIGO PARK']",
 "tryamm:streetverse-little-italy-route-request",
 "tryamm:streetverse-little-italy-checkpoint",
 "findSafeStreetVerseDistrictArrival({x:stop.x,z:stop.z},canTraverse,clamp)",
 "removeEventListener('tryamm:streetverse-little-italy-route-request',onLittleItalyRoute)",
 "littleItalyCorridor.disposeMaterials()",
 "circle-park-basketball-side-line",
 "circle-park-basketball-baseline"
])assert.ok(world.includes(token),'Actual StreetVerse mobile game missing '+token)
for(const id of ['fillmore','arrigo-park'])assert.ok(builder.includes("'"+id+"':{x:"),'World Builder missing real 3D route entry '+id)
for(const id of ['fillmore-street','arrigo-park'])assert.ok(grid.includes("id:'"+id+"'"),'StreetVerse grid missing '+id)
for(const id of ['circle-park-fillmore','fillmore-taylor','taylor-arrigo-park'])assert.ok(grid.includes("id:'"+id+"'"),'Missing city walking connector '+id)
console.log('STREETVERSE FILLMORE TAYLOR ARRIGO CONTRACT PASS: user-inspired fenced gate, photo-inspired court, schematic city walk, one-hand navigation and safe collision anchors')
