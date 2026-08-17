'use strict';
const {spawnSync}=require('child_process');
const files=[
  'server.js',
  'lib/quantum-internet-routes.js','lib/quantum-intelligence.js','lib/quantum-crawler.js','lib/quantum-index-store.js','lib/quantum-persistent-index.js','lib/quantum-multimodal-index.js',
  'lib/holographic-internet.js','lib/holographic-display-capabilities.js','lib/multiview-3d.js','lib/quantum-audio-scene.js','lib/holo-tv-platform.js','lib/holo-room-orchestrator.js','lib/holo-multiuser-room.js','lib/spatial-continuity.js','lib/holo-presence.js','lib/volumetric-presence.js','lib/holographic-runtime.js','lib/holographic-runtime-routes.js',
  'public/holo-media-transport.js','public/holo-runtime-demo.js',
  'test/holo-media-transport-smoke.js','test/holographic-runtime-routes-smoke.js'
];
let failed=0;
for(const file of files){
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  if(result.status===0){console.log(`syntax PASS ${file}`);continue;}
  failed++;
  const detail=(result.stderr||result.stdout||'syntax check failed').trim().replace(/\r?\n/g,'%0A');
  console.error(`::error file=${file},title=JavaScript syntax check failed::${detail}`);
}
if(failed){console.error(`Syntax check failed for ${failed} file(s).`);process.exit(1);}
console.log(`Syntax check PASS (${files.length} files)`);
