'use strict';
const assert=require('assert');
const fs=require('fs');
for(const file of ['server.js','public/index.html','public/app.js','public/styles.css','public/living-worlds.html','public/living-worlds-runtime.js','public/data/worlds.json']) assert(fs.existsSync(file),`${file} missing`);
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
console.log('TryAMM and Living Worlds smoke checks passed');
