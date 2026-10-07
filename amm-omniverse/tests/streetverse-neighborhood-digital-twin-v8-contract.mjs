import assert from 'node:assert/strict'
import fs from 'node:fs'

const source=fs.readFileSync(new URL('../src/data/StreetVerseChicagoReconstructionSources.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/runtime/StreetVerseWestSideVisibleWorldRuntime.ts',import.meta.url),'utf8')
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')

for(const token of [
  'City of Chicago Building Footprints',
  'City of Chicago Street Center Lines',
  'City of Chicago Zoning Districts (current)',
  "reconstructionMode:'public-data-grounded-game-reconstruction'",
  'exactDigitalTwin:false',
  'Only model verified public interiors as measured'
]) assert.match(source,new RegExp(token.replace(/[.*+?^$()|[\]{}]/g,'\\$&')))

assert.match(world,/visualUpgradeVersion:'west-side-forger-v5'/)
assert.match(world,/reconstructionMode:'public-data-grounded-game-reconstruction'/)
assert.match(world,/geometryAuthority:'city-gis-source-registry'/)
assert.match(world,/interiorAuthority:'verified-or-reconstructed'/)
assert.match(world,/vegetationPass:'layered-canopy-v4'/)
assert.match(world,/canopyLayers:7/)
assert.match(world,/streetDetailPass:'curb-alley-signage-v5'/)
assert.match(world,/exactDigitalTwin:false/)
assert.match(mobile,/mobileCharacterFallbackPass:'sculpted-readability-v8'/)
assert.match(mobile,/treeVisualPass:'layered-canopy-v4'/)
assert.match(mobile,/treeCanopyLayers:5/)
assert.match(mobile,/hero-cheekbone-left/)
assert.match(mobile,/hero-chin-volume/)

console.log('STREETVERSE NEIGHBORHOOD DIGITAL TWIN V8 CONTRACT PASS: public-data source registry + source-labelled West Side reconstruction + visible BJ/tree upgrades')
