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

console.log('StreetVerse mobile visible-city parity contract: PASS')
