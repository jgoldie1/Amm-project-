'use strict';
const assert=require('assert');
const {snapshot}=require('../lib/ai-factory-routes');
const snap=snapshot();
assert.equal(snap.architectureReady,true,'AI Factory architecture must be ready');
assert.equal(snap.service,'Stubbs AI Model Router / AI Factory');
const ids=snap.lanes.map(l=>l.id);
for(const id of ['llm','vision_ocr','image','video','audio','world_3d','game_agents'])assert(ids.includes(id),`missing lane ${id}`);
assert.equal(typeof snap.ownedGpuConnected,'boolean');
assert.equal(typeof snap.fullMovieRenderReady,'boolean');
for(const lane of snap.lanes){assert(['available','blocked'].includes(lane.execution));assert(Array.isArray(lane.providers));}
console.log(`AI Factory smoke: PASS (${snap.lanes.length} lanes; owned GPU ${snap.ownedGpuConnected?'connected':'not connected'})`);
