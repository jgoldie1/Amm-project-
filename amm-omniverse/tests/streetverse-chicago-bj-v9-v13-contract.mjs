import fs from 'node:fs'

const west=fs.readFileSync(new URL('../src/runtime/StreetVerseWestSideVisibleWorldRuntime.ts',import.meta.url),'utf8')
const bj=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts',import.meta.url),'utf8')
const photo=fs.readFileSync(new URL('../src/runtime/StreetVerseBJPhotoMatchRuntime.ts',import.meta.url),'utf8')
const compiler=fs.readFileSync(new URL('../scripts/compile-chicago-proof-zone-v9.mjs',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))
const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE CHICAGO + BJ V9/V13 CONTRACT FAIL: '+msg)}

for(const token of [
  "visualUpgradeVersion:'west-side-forger-v4'",
  "neighborhoodReconstructionVersion:'west-side-forger-v5'",
  "proofZoneDetailVersion:'chicago-proof-zone-v9'",
  "proofZoneStreetDetailPass:'tree-pit-manhole-parking-ramp-v9'",
  "gisCompiler:'compile-chicago-proof-zone-v9'",
  'west-side-asphalt-patch-v9',
  'west-side-manhole-v9',
  'west-side-tree-pit-v9',
  'west-side-parking-bay-v9',
  'west-side-curb-ramp-v9',
])must(west.includes(token),'West Side V9 missing '+token)

for(const token of [
  "schema:'tryamm.streetverse.chicago-proof-zone.v9'",
  "exactDigitalTwin:false",
  "authority:'public-data-grounded-game-reconstruction'",
  "source:'city-of-chicago-building-footprints'",
  "source:'city-of-chicago-street-centerlines'",
])must(compiler.includes(token),'Chicago V9 GIS compiler missing '+token)
must(pkg.scripts?.['reconstruction:compile']==='node scripts/compile-chicago-proof-zone-v9.mjs','reconstruction compiler npm command missing')

for(const token of [
  "productionFilename:'SV_HERO_BJ_STUBBS_V12.glb'",
  "authority:'tryamm-owned-native-glb-v12'",
  "texturePipeline:'pbr-mobile-production-v12'",
  "presentationPass:'bj-v13-hero-readability'",
  "faceLightingPass:'local-key-rim-v13'",
  "bj-face-key-v13",
  "bj-face-rim-v13",
  "heroReadabilityV13:true",
])must(bj.includes(token),'BJ production V13 presentation missing '+token)

for(const token of [
  'BJ_V10_HEAD_PROFILE',
  'BJ_V13_HEAD_DETAIL_PROFILE',
  "version:'bj-v13-approved-reference-depth-1'",
  "facialDepthPass:'bj-v13-brow-orbit-lip-jaw'",
  'browProjection:.010',
  'orbitRecess:.012',
  'upperLipProjection:.009',
  'lowerLipProjection:.012',
  'certifiedLikeness:false',
])must(photo.includes(token),'BJ approved-reference depth pass missing '+token)

must(!/certifiedLikeness:true/.test(photo),'BJ V13 must not claim certified likeness')
must(!/certifiedLikeness:true/.test(bj),'BJ production runtime must not claim certified likeness without verified authorization')

console.log('STREETVERSE CHICAGO + BJ V9/V13 CONTRACT PASS: preserved V4/V5/V8 + Chicago street-detail/GIS compiler + V12 asset authority + additive V13 BJ depth/readability')
