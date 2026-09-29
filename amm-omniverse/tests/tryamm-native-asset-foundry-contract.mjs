import fs from 'node:fs'

const foundry=fs.readFileSync(new URL('../src/data/TryammNativeAssetFoundry.ts',import.meta.url),'utf8')
const script=fs.readFileSync(new URL('../scripts/tryamm-native-asset-foundry.mjs',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('TRYAMM NATIVE ASSET FOUNDRY CONTRACT FAIL: '+msg)}

must(foundry.includes("id:'tryamm-native'"),'native provider identity missing')
must(foundry.includes('externalApiRequired:false'),'native provider must not require external API')
must(foundry.includes('creditsRequired:false'),'native provider must not require generation credits')
for(const item of ['parametric streets/sidewalks/curbs','modular building massing and facade kits','PBR material parameter recipes','holographic interaction anchors and emissive layers','collision metadata','deterministic four-sample generation']){
  must(foundry.includes(item),'missing native capability '+item)
}
must(foundry.includes("providerPriority:['tryamm-native','licensed-external-provider','manual-artist']"),'native-first provider order missing')
for(const id of ['sample-a-reality-restore','sample-b-chicago-documentary','sample-c-holo-reality-fusion','sample-d-cinematic-hero']){
  must(script.includes(id),'native generator missing '+id)
}
must(script.includes('GLTFExporter'),'native generator must emit real GLB')
must(script.includes('externalApi:false'),'native generated artifacts must record no external API')
must(script.includes('creditsUsed:0'),'native generated artifacts must record zero generation credits')
must(script.includes('street-and-sidewalk'),'native reusable kit missing street-and-sidewalk')
must(script.includes('brick-building-module'),'native reusable kit missing brick-building-module')
must(script.includes('street-lamp'),'native reusable kit missing street-lamp')
must(script.includes('bench'),'native reusable kit missing bench')
must(script.includes('hydrant'),'native reusable kit missing hydrant')
must(script.includes('vehicle-blockout'),'native reusable kit missing vehicle-blockout')
for(const id of ['streetverse-hero-player','resident-archetype-a','resident-archetype-b','resident-archetype-c','resident-archetype-d','resident-archetype-e','resident-archetype-f','resident-archetype-g','resident-archetype-h','city-transit-train'])must(script.includes(`'${id}'`),'native realism kit missing '+id)
for(const detail of ['wardrobe-jacket','hair-cap-accessory','wardrobe-chain','facial-hair'])must(script.includes(detail),'native resident visual variety missing '+detail)
for(const pivot of ['character-rig-hero','character-rig-resident','rig-pelvis','rig-spine','rig-head','rig-left-arm','rig-right-arm','rig-left-leg','rig-right-leg'])must(script.includes(pivot),'native character hierarchical rig missing '+pivot)
for(const face of ['eye-white-left','iris-left','pupil-left','brow-left','upper-lip','lower-lip','jaw','ear-left'])must(script.includes(face),'native facial anatomy v2 missing '+face)
for(const hair of ['hair-close-crop','hair-fade','hair-afro','hair-braided-base','hair-braid'])must(script.includes(hair),'native hair silhouette missing '+hair)
must(script.includes("rigState:'hierarchical-procedural-v2'"),'native humans must declare realism-v2 hierarchical rig state')
must(script.includes("rigState:'hierarchical-procedural-v3'"),'native humans must declare realism-v3 hierarchical rig state')
must(script.includes('facialDetailV3:true'),'native humans must declare facial-detail v3 evidence')
must(script.includes('blinkReady:true'),'native humans must expose blink-ready facial controls')
must(script.includes('breathingReady:true'),'native humans must expose breathing-ready body controls')
must(script.includes("materialResponse:'skin-cloth-separated'"),'native humans must separate skin and cloth material response')
for(const face of ['chin','cheek-left','cheek-right','nostril-left','nostril-right','eyelid-left','eyelid-right'])must(script.includes(face),'native facial-life v3 detail missing '+face)
for(const silhouette of ['clavicle-line','waist-silhouette'])must(script.includes(silhouette),'native body silhouette v3 detail missing '+silhouette)
must(script.includes("skin.userData={surface:'skin'"),'skin material response metadata missing')
must(script.includes("outfit.userData={surface:'fabric'"),'fabric material response metadata missing')
must(script.includes('new THREE.CapsuleGeometry(1.18,8.7'),'transit train visual must use a rounded generated shell instead of a box-only car body')
must(script.includes('function addRoundedShell'),'native foundry must expose rounded realism shell generation')
must(script.includes("addRoundedShell(group,'chassis'"),'sport sedan chassis must use rounded realism geometry instead of a box-only shell')
must(script.includes("addRoundedShell(group,'lower-body'"),'sport sedan body must use rounded realism geometry')
must(script.includes("addRoundedShell(group,'cabin'"),'sport sedan cabin must use rounded realism geometry')
must(script.includes("legacyCatalogId:'vehicle-blockout',realismReplacement:true"),'legacy vehicle-blockout catalog id must now generate the realism sedan')
must(script.includes('holo-wayfinder'),'native reusable kit missing holo-wayfinder')
must(script.includes('productionPublishAllowed:false'),'native assets must remain certification-gated')
must(script.includes('exactDigitalTwin:false'),'native Chicago-inspired assets must not claim exact geography')
for(const detail of ['storefront-glass','storefront-awning','window-sill','window-lintel','facade-band','cornice','rooftop-hvac']){
  must(script.includes(detail),'native building realism detail missing '+detail)
}
console.log('TRYAMM NATIVE ASSET FOUNDRY CONTRACT PASS: owned 4x GLB baseline generator + holographic winner + no external API/credits')