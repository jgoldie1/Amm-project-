'use strict';
/** Deterministic non-geographic district previews for the next US cities. */
const {getExpansionDestinations}=require('./streetverse-global-expansion');
function compileCityPreview(cityId,districtName){
 const city=getExpansionDestinations().find(x=>x.id===cityId);
 if(!city)throw Error('City not registered for preview');
 if(!city.starter.includes(districtName))throw Error('District not registered for preview');
 const districtIndex=city.starter.indexOf(districtName),spacing=90,size=5;
 const roads=[],buildings=[],trees=[];
 for(let i=0;i<=size;i++){
  roads.push({from:[0,i*spacing],to:[size*spacing,i*spacing]},{from:[i*spacing,0],to:[i*spacing,size*spacing]});
 }
 for(let x=0;x<size;x++)for(let z=0;z<size;z++){
  const height=12+((x*7+z*11+districtIndex*3)%8)*8;
  buildings.push({x:x*spacing+spacing/2,z:z*spacing+spacing/2,height,kind:'placeholder-box'});
  trees.push({x:x*spacing+spacing*.18,z:z*spacing+spacing*.2,kind:'placeholder-tree'});
 }
 return {cityId,district:districtName,latitude:city.latitude,longitude:city.longitude,kind:'fictional-procedural-preview',playable:false,certified:false,live:false,roads,buildings,trees,playerSpawn:{x:spacing/2,z:spacing/2},requires:['licensed-road-data','real-3d-assets','collision','renderer-integration','mobile-qa','certification']};
}
module.exports={compileCityPreview};
