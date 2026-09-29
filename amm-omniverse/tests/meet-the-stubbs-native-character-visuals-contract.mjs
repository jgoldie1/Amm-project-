import fs from 'node:fs'
import assert from 'node:assert/strict'

const district=fs.readFileSync(new URL('../src/components/MeetTheStubbsWorldDistrict.tsx',import.meta.url),'utf8')
const catalog=fs.readFileSync(new URL('../src/data/TryammNativeRuntimeAssetCatalog.ts',import.meta.url),'utf8')
const foundry=fs.readFileSync(new URL('../scripts/tryamm-native-asset-foundry.mjs',import.meta.url),'utf8')

assert.match(district,/loadTryammNativeCircleParkLayer/,'Meet the Stubbs must load the native GLB layer')
assert.match(district,/nativeCharacterAsset=\(index:number\).*heroPlayer/,'BJ slot must use generated hero visual')
assert.match(district,/residentA','residentB','residentC','residentD','residentE','residentF','residentG','residentH'/,'cast must cycle through eight generated resident variants')
assert.match(district,/node instanceof THREE\.Mesh&&node\.name!=='player-ring'\)node\.visible=false/,'procedural character mesh must hide when generated GLB loads')
assert.match(district,/visual\.position\.copy\(r\.root\.position\)/,'generated characters must follow gameplay control roots')
assert.match(district,/nativeCharacterVisualAuthority:true/,'world-ready evidence must report character GLB authority')
assert.match(district,/nativeCharacterAnimationAuthority:true/,'world-ready evidence must report visible GLB animation authority')
assert.match(district,/THREE\.ACESFilmicToneMapping/,'family district must use filmic tone mapping for character materials')
assert.match(district,/faceFill=new THREE\.DirectionalLight/,'family district must include a face-readable fill light')
assert.match(district,/nativeHumanoidRig\(visual\)/,'loaded character GLBs must cache hierarchical rig pivots')
assert.match(district,/animateNativeHumanoid\(nativeCharacterRigs\[i\],walk,run,t,i\*\.61\)/,'visible GLBs must animate from gameplay movement state')
assert.match(district,/generatedOriginals:true,realPersonLikeness:false/,'character visual evidence must not claim real-person likeness')

for(const key of ['residentD','residentE','residentF','residentG','residentH'])assert.ok(catalog.includes(`${key}:{id:'resident-archetype-${key.slice(-1).toLowerCase()}'`),`missing runtime resident asset ${key}`)
for(const id of ['resident-archetype-d','resident-archetype-e','resident-archetype-f','resident-archetype-g','resident-archetype-h'])assert.ok(foundry.includes(`'${id}'`),`missing foundry archetype ${id}`)
for(const detail of ['wardrobe-jacket','hair-cap-accessory','wardrobe-chain','facial-hair'])assert.ok(foundry.includes(detail),`missing generated character variety detail ${detail}`)

console.log('Meet the Stubbs native character visual authority contract: PASS')
