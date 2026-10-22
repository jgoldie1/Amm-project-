'use strict';
/* Reuse the Chicago neighborhood compiler for San Diego without rewriting Chicago data. */
const {getCityManifest}=require('./streetverse-earth-registry');
const {buildNeighborhoodJob,compilePlayableSlice}=require('./world-compiler');
const {evaluatePromotion}=require('./world-certification');
function buildSanDiegoDistrictJobs(){
 const city=getCityManifest('us-ca-san-diego');
 if(!city)throw Error('San Diego manifest unavailable');
 return city.districts.map((district,index)=>{
   const area={id:'SD-'+String(index+1).padStart(2,'0'),number:index+1,name:district.name};
   const options={targetStatus:'CONSTRUCTING',boundarySource:'san-diego-licensed-boundary-required',roadsSource:'OPEN_OR_LICENSED_SAN_DIEGO_ROADS_REQUIRED',buildingsSource:'OPEN_OR_LICENSED_SAN_DIEGO_BUILDINGS_REQUIRED',businessSource:'OWNER_APPROVED_BUSINESS_DATA_REQUIRED',transitSource:'AUTHORIZED_SAN_DIEGO_TRANSIT_REQUIRED'};
   const job=buildNeighborhoodJob(area,options);
   // Override Chicago-only defaults. Keep evidence gates and generator stages.
   job.geospatial.boundarySource=options.boundarySource;
   job.geospatial.streetNetwork=options.roadsSource;
   job.geospatial.buildingFootprints=options.buildingsSource;
   job.generation.layers=job.generation.layers.map(layer=>layer==='CTA_TRANSIT_STOPS'?'LOCAL_TRANSIT_STOPS':layer);
   const slice=compilePlayableSlice(area,options);
   slice.runtimeLayers=slice.runtimeLayers.map(layer=>({...layer,name:layer.name==='CTA_TRANSIT_STOPS'?'LOCAL_TRANSIT_STOPS':layer.name}));
   return {districtId:district.id,cityId:city.worldId,area,job,slice,status:'CONSTRUCTING',playable:false,certificationRequired:true};
 });
}
function summarizeSanDiegoBuild(){
 const jobs=buildSanDiegoDistrictJobs();
 return {city:'San Diego',districts:jobs.length,buildJobs:jobs.map(x=>({id:x.districtId,compiler:x.job.compiler,stages:x.job.pipeline.length,playable:x.playable})),promotionGate:evaluatePromotion({fromStatus:'DATA_READY',toStatus:'CONSTRUCTING',evidence:[]})};
}
module.exports={buildSanDiegoDistrictJobs,summarizeSanDiegoBuild};
