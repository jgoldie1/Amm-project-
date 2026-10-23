'use strict';
// Original fictional StreetVerse simulation: city events and community commerce.
// All money is simulated unless an independent server verifies payment.
const CRIMES={theft:{severity:2,safety:-3},vandalism:{severity:1,safety:-2},fraud:{severity:3,safety:-4},traffic:{severity:1,safety:-1}};
const INTERVENTIONS={report:{safety:1,trust:1},investigate:{safety:2,trust:1},restore:{safety:3,trust:2},communitySupport:{safety:2,trust:3}};
function applyWorldEvent(city,event){
 if(!city||!city.districts?.length)throw Error('invalid_city');
 const next=structuredClone(city),d=next.districts[0];
 if(event?.type==='crime'){
  const c=CRIMES[event.kind];if(!c)throw Error('invalid_crime_event');
  d.safety=Math.max(0,(d.safety||0)+c.safety);d.happiness=Math.max(0,(d.happiness||0)-c.severity);
  next.lastIncident={type:'fictional-crime',kind:event.kind,status:'reported',evidence:'game-world-only'};
 }else if(event?.type==='response'){
  const v=INTERVENTIONS[event.kind];if(!v)throw Error('invalid_response');
  d.safety=Math.min(100,(d.safety||0)+v.safety);d.happiness=Math.min(100,(d.happiness||0)+v.trust);
  next.lastIncident={type:'fictional-response',kind:event.kind,status:'completed'};
 }else throw Error('invalid_world_event');
 next.npcResponse={pedestrians:d.safety<60?'more-cautious':'normal',businesses:d.safety<60?'reduced-evening-traffic':'normal',police:d.safety<60?'higher-patrol-simulation':'normal'};
 return next;
}
function createConstructionPlacement(city,building){
 if(!city?.cityId||typeof building?.id!=='string'||!/^[a-z0-9-]{3,70}$/.test(building.id)||!Number.isFinite(building.x)||!Number.isFinite(building.z)||Math.abs(building.x)>100000||Math.abs(building.z)>100000)throw Error('invalid_placement');
 if(!['housing','shop','municipal','studio','community'].includes(building.kind))throw Error('invalid_building_kind');
 const next=structuredClone(city);
 next.construction=[...(next.construction||[]),{id:building.id,kind:building.kind,x:building.x,z:building.z,assetId:building.assetId||null,status:'preview-only',renderCertified:false,walkable:false}];
 return next;
}
function createCommunityListing({publisherId,title,kind,priceMinor=0}={}){
 if(typeof publisherId!=='string'||publisherId.length<3||typeof title!=='string'||title.length<3||title.length>120||!['game-mod','virtual-furniture','creator-service','business-storefront'].includes(kind)||!Number.isSafeInteger(priceMinor)||priceMinor<0)throw Error('invalid_listing');
 return {publisherId,title,kind,priceMinor,status:'draft',review:'required',entitlements:'server-gated',payable:false,creatorShareMinor:0};
}
module.exports={CRIMES,INTERVENTIONS,applyWorldEvent,createConstructionPlacement,createCommunityListing};
