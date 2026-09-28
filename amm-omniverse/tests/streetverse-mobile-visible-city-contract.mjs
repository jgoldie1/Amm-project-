import assert from 'node:assert/strict'
import fs from 'node:fs'

const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')

assert.match(world,/streetTreePositions:\[number,number\]\[\]/,'mobile world must declare a deterministic street-tree layout')
assert.match(world,/new THREE\.InstancedMesh\(/,'mobile trees must use instancing to protect phone performance')
assert.match(world,/createMobileResidentPopulation\(scene\)/,'mobile world must keep the resident population')
assert.match(world,/const cars:THREE\.Group\[\]=\[\]/,'mobile world must keep richer moving/drivable vehicle groups')
assert.match(world,/treeCount:streetTreePositions\.length/,'world-ready proof must report visible tree count')
assert.match(world,/cityBlockCount:blocks\.length/,'world-ready proof must report visible city block count')
assert.match(world,/visibleCityParity:'lightweight'/,'world-ready proof must mark the mobile visible-city parity layer')
assert.match(world,/THREE\.ACESFilmicToneMapping/,'mobile alpha must use cinematic tone mapping without enabling expensive phone shadows')
assert.match(world,/const skylineDefs:/,'mobile alpha must add a denser skyline silhouette')
assert.match(world,/const lampPositions:/,'mobile alpha must add lightweight street-light furniture')
assert.match(world,/for\(let i=0;i<14;i\+\+\)/,'mobile Chicago visual pass must include fourteen moving cars before the starter vehicle')
assert.match(world,/fameRankFanCount/,'mobile world must map Fame ranks to visible crowd reactions')
assert.match(world,/tryamm:streetverse-fame-state/,'mobile world must react to the restored Fame runtime')
assert.match(world,/fameReactiveCrowds:true/,'world-ready proof must advertise visible Fame reactions')
assert.match(world,/visualDensity:'chicago-visual-v2'/,'world-ready proof must identify the Chicago visual-density pass')
assert.match(world,/DodecahedronGeometry/,'street trees must use a compact natural-looking low-poly crown instead of the oversized cone prototype')
assert.match(world,/crosswalkMat/,'mobile Chicago streets must render crosswalk markings')
assert.match(world,/const bridge=new THREE\.Mesh/,'mobile Riverwalk must include a visible bridge deck')
assert.match(world,/SCAN MAP/,'mobile quick navigation must expose the working scan-map action')
assert.match(world,/camY=activeCar\?8\.2:9\.2/,'mobile third-person camera must remain closer to the player than the old distant prototype camera')

console.log('StreetVerse mobile visible-city parity contract: PASS')
