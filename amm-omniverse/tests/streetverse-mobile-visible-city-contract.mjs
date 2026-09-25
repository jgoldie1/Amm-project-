import assert from 'node:assert/strict'
import fs from 'node:fs'

const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')

assert.match(world,/streetTreePositions:\[number,number\]\[\]/,'mobile world must declare a deterministic street-tree layout')
assert.match(world,/new THREE\.InstancedMesh\(/,'mobile trees must use instancing to protect phone performance')
assert.match(world,/createMobileResidentPopulation\(scene\)/,'mobile world must keep the resident population')
assert.match(world,/const cars:THREE\.Mesh\[\]=\[\]/,'mobile world must keep moving/drivable vehicles')
assert.match(world,/treeCount:streetTreePositions\.length/,'world-ready proof must report visible tree count')
assert.match(world,/cityBlockCount:blocks\.length/,'world-ready proof must report visible city block count')
assert.match(world,/visibleCityParity:'lightweight'/,'world-ready proof must mark the mobile visible-city parity layer')
assert.match(world,/THREE\.ACESFilmicToneMapping/,'mobile alpha must use cinematic tone mapping without enabling expensive phone shadows')
assert.match(world,/const skylineDefs:/,'mobile alpha must add a denser skyline silhouette')
assert.match(world,/const lampPositions:/,'mobile alpha must add lightweight street-light furniture')
assert.match(world,/for\(let i=0;i<12;i\+\+\)/,'mobile alpha traffic density must include twelve moving cars before the starter vehicle')
assert.match(world,/fameRankFanCount/,'mobile world must map Fame ranks to visible crowd reactions')
assert.match(world,/tryamm:streetverse-fame-state/,'mobile world must react to the restored Fame runtime')
assert.match(world,/fameReactiveCrowds:true/,'world-ready proof must advertise visible Fame reactions')
assert.match(world,/visualDensity:'alpha-v1'/,'world-ready proof must identify the alpha visual-density pass')

console.log('StreetVerse mobile visible-city parity contract: PASS')
