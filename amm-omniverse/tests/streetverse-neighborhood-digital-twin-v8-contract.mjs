import assert from 'node:assert/strict'
import fs from 'node:fs'

const source=fs.readFileSync(new URL('../src/data/StreetVerseChicagoReconstructionSources.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/runtime/StreetVerseWestSideVisibleWorldRuntime.ts',import.meta.url),'utf8')
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const fetcher=fs.readFileSync(new URL('../scripts/fetch-chicago-reconstruction-evidence.mjs',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))

for(const token of [
  'City of Chicago Building Footprints',
  'City of Chicago Street Center Lines',
  'City of Chicago Zoning Districts (current)',
  "reconstructionMode:'public-data-grounded-game-reconstruction'",
  'exactDigitalTwin:false',
  'Only model verified public interiors as measured'
]) assert.ok(source.includes(token),'reconstruction source registry missing '+token)

assert.match(world,/visualUpgradeVersion:'west-side-forger-v4'/)
assert.match(world,/neighborhoodReconstructionVersion:'west-side-forger-v5'/)
assert.match(world,/reconstructionMode:'public-data-grounded-game-reconstruction'/)
assert.match(world,/geometryAuthority:'city-gis-source-registry'/)
assert.match(world,/interiorAuthority:'verified-or-reconstructed'/)
assert.match(world,/vegetationPass:'layered-canopy-v4'/)
assert.match(world,/canopyLayers:7/)
assert.match(world,/streetDetailPass:'curb-alley-signage-v5'/)
assert.match(world,/exactDigitalTwin:false/)
assert.match(world,/west-side-service-alley/)
assert.match(world,/ROOSEVELT RD/)
assert.match(world,/TAYLOR ST/)
assert.match(world,/UIC →/)

assert.match(mobile,/mobileCharacterFallbackPass:'human-proportion-v6'/)
assert.match(mobile,/mobileCharacterSculptPass:'cheek-chin-depth-v8'/)
assert.match(mobile,/treeVisualPass:'layered-canopy-v4'/)
assert.match(mobile,/treeCanopyLayers:5/)
assert.match(mobile,/hero-cheekbone-left/)
assert.match(mobile,/hero-chin-volume/)
assert.match(mobile,/streetverse-mobile-tree-branches-left/)
assert.match(mobile,/streetverse-mobile-tree-crowns-back/)

for(const token of ['syp8-uezg','6imu-meau','Basemap_BlackWhite/MapServer/14/query','fetchArcGISAllStreets',"geometryType:'esriGeometryEnvelope'","inSR:'4326'","outSR:'4326'",'resultOffset',"f:'geojson'",'dj47-wfun','api/views/','geometryFieldCandidates','intersects(','exactDigitalTwin:false']) assert.ok(fetcher.includes(token),'GIS evidence fetcher missing '+token)
assert.equal(pkg.scripts?.['reconstruction:evidence'],'node scripts/fetch-chicago-reconstruction-evidence.mjs')

console.log('STREETVERSE NEIGHBORHOOD DIGITAL TWIN V8 CONTRACT PASS: public-data source registry + GIS evidence pipeline + source-labelled West Side reconstruction + visible BJ/tree upgrades')
