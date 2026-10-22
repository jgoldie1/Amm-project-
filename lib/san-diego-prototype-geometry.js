'use strict';
/**
 * Deterministic placeholder block-layout generation for San Diego prototypes.
 * These are fictional layouts, NOT surveyed real streets or building footprints.
 */
const {buildSanDiegoDistrictJobs}=require('./san-diego-world-compiler');
function buildPrototypeDistrict(id){
 const job=buildSanDiegoDistrictJobs().find(x=>x.districtId===id);
 if(!job||!['downtown','serra-mesa'].includes(id))throw Error('Prototype district unavailable');
 const downtown=id==='downtown',size=downtown?6:5,spacing=downtown?90:110;
 const roads=[],buildings=[],trees=[],spawn={x:spacing/2,y:0,z:spacing/2};
 for(let i=0;i<=size;i++){
   roads.push({id:id+'-road-ew-'+i,from:{x:0,z:i*spacing},to:{x:size*spacing,z:i*spacing},width:12});
   roads.push({id:id+'-road-ns-'+i,from:{x:i*spacing,z:0},to:{x:i*spacing,z:size*spacing},width:12});
 }
 for(let x=0;x<size;x++)for(let z=0;z<size;z++){
   const height=downtown?18+((x*7+z*11)%9)*9:7+((x*3+z*5)%3)*3;
   buildings.push({id:id+'-building-'+x+'-'+z,position:{x:x*spacing+spacing*.5,y:height/2,z:z*spacing+spacing*.5},dimensions:{x:spacing*.45,y:height,z:spacing*.42},asset:'placeholder-box',licensedFootprint:false});
   trees.push({id:id+'-tree-'+x+'-'+z,position:{x:x*spacing+spacing*.16,y:0,z:z*spacing+spacing*.2},asset:'placeholder-tree'});
 }
 return {schemaVersion:1,cityId:'streetverse-us-ca-san-diego',districtId:id,kind:'fictional-procedural-preview',source:'TRYAMM_NEIGHBORHOOD_COMPILER',playerSpawn:spawn,roads,buildings,trees,collisionRequired:true,live:false,certified:false};
}
module.exports={buildPrototypeDistrict};
