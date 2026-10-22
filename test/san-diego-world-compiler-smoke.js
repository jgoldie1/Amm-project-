'use strict';
const assert=require('node:assert/strict');
const {buildSanDiegoDistrictJobs,summarizeSanDiegoBuild}=require('../lib/san-diego-world-compiler');
const {createChicagoRegistry}=require('../lib/world-compiler');
const before=createChicagoRegistry();
const jobs=buildSanDiegoDistrictJobs();
assert.equal(jobs.length,5);
assert.equal(new Set(jobs.map(j=>j.districtId)).size,5);
for(const item of jobs){
 assert.equal(item.job.compiler,'TRYAMM_NEIGHBORHOOD_COMPILER');
 assert(item.job.pipeline.includes('NEIGHBORHOOD_COMPILER'));
 assert.equal(item.playable,false);
 assert.equal(item.job.geospatial.boundarySource,'san-diego-licensed-boundary-required');
 assert(item.job.generation.layers.includes('LOCAL_TRANSIT_STOPS'));
 assert(!item.job.generation.layers.includes('CTA_TRANSIT_STOPS'));
 assert(item.slice.runtimeLayers.some(x=>x.name==='LOCAL_TRANSIT_STOPS'));
 assert.equal(item.slice.certification.requiresRenderedBrowserProof,true);
}
assert.deepEqual(createChicagoRegistry(),before);
assert.equal(summarizeSanDiegoBuild().districts,5);
console.log('San Diego reuses Chicago compiler; Chicago registry preserved; no city marked playable');
