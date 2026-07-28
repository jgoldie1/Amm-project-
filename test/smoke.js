'use strict';
const assert=require('assert');
const fs=require('fs');
for(const file of ['server.js','public/index.html','public/app.js','public/styles.css','public/living-worlds.html','public/living-worlds-runtime.js','public/data/worlds.json','public/vocal-studio.html','public/vocal-studio.js','public/vocal-studio.css','public/xr-vocal-studio.html','public/xr-vocal-studio.js','public/xr-vocal-studio.css','public/xr-studio-features.js']) assert(fs.existsSync(file),`${file} missing`);
const server=fs.readFileSync('server.js','utf8');
for(const route of ['/api/health','/api/auth/register','/api/rooms','/api/checkout','/api/admin/summary']) assert(server.includes(route),`${route} missing`);
const html=fs.readFileSync('public/index.html','utf8');
for(const feature of ['Go live','Virtual gifts','Ticketed livestreams','Built for trust']) assert(html.includes(feature),`${feature} missing`);
const registry=JSON.parse(fs.readFileSync('public/data/worlds.json','utf8')).worlds;
assert.strictEqual(registry.length,13,'13 worlds required');
const bySlug=new Map(registry.map(w=>[w.slug,w]));
for(const slug of ['faith-hub','lion-kingdom-gate']) assert.strictEqual(bySlug.get(slug)?.status,'live',`${slug} must be live`);
for(const world of registry.filter(w=>w.status==='live')){
  assert(world.spawn&&world.budget&&world.environment&&Array.isArray(world.portals),`${world.slug} runtime metadata missing`);
  for(const portal of world.portals) assert.strictEqual(bySlug.get(portal.toSlug)?.status,'live',`${portal.id} target is not enterable`);
}
const runtime=fs.readFileSync('public/living-worlds-runtime.js','utf8');
for(const feature of ['class WorldRegistry','class WorldRuntime','enforceBudget','disposeObject','async transition','renderer.info.memory','SoloAmbientPresence']) assert(runtime.includes(feature),`${feature} missing`);
const studioHtml=fs.readFileSync('public/vocal-studio.html','utf8');
for(const feature of ['Record microphone','Vocal Coach','Save on this device','Export finished song','Export stems']) assert(studioHtml.includes(feature),`${feature} studio control missing`);
const studio=fs.readFileSync('public/vocal-studio.js','utf8');
for(const feature of ['MediaRecorder','autoCorrelate','autoTuneTrack','createDynamicsCompressor','indexedDB.open','OfflineAudioContext','encodeWav','exportStems']) assert(studio.includes(feature),`${feature} studio engine missing`);
const xrHtml=fs.readFileSync('public/xr-vocal-studio.html','utf8');
for(const feature of ['2D Studio','3D Spatial','Holographic','Enter VR','Enter AR / MR','Four-view pyramid','Parallax display','Connect positional audio','Add reverb zone','Add performer','Connect lip sync','Restore room placement','XR quality']) assert(xrHtml.includes(feature),`${feature} XR control missing`);
const xr=fs.readFileSync('public/xr-vocal-studio.js','utf8');
for(const feature of ['immersive-vr','immersive-ar','setMode','renderPyramid','parallax','renderer.xr.enabled','hand-tracking','hit-test','XRStudioFeatures','prepareARPlacement','enableGestures']) assert(xr.includes(feature),`${feature} XR runtime missing`);
const xrFeatures=fs.readFileSync('public/xr-studio-features.js','utf8');
for(const feature of ['THREE.PositionalAudio','addReverbZone','createPerformer','connectLipSync','prepareARPlacement','placePersistentAnchor','BroadcastChannel','xr_studio_state','setQuality','monitorPerformance','dispose']) assert(xrFeatures.includes(feature),`${feature} advanced XR feature missing`);
console.log('TryAMM, Living Worlds, advanced Vocal Studio and production-foundation XR smoke checks passed');
