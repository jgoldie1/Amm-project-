'use strict';
// Data-driven city-life preview. Do not mark unbuilt cities playable.
const {getExpansionDestinations}=require('./streetverse-global-expansion');
const themes={
 'us-mi-detroit':{culture:['motown','automotive'],transit:['bus','car'],missions:['record-label-showcase','auto-design-challenge']},
 'us-ca-san-diego':{culture:['coastal','arts'],transit:['tram','car'],missions:['waterfront-delivery','artist-showcase']},
 'us-nv-las-vegas':{culture:['entertainment','hospitality'],transit:['bus','car'],missions:['venue-production','convention-business']},
 'us-fl-tampa':{culture:['waterfront','sports'],transit:['streetcar','bus'],missions:['harbor-logistics','creator-festival']},
 'us-ga-atlanta':{culture:['music','film'],transit:['rail','bus'],missions:['studio-session','film-production']},
 'us-ny-new-york-city':{culture:['media','fashion'],transit:['subway','bus'],missions:['borough-business','fashion-showcase']},
 'us-tx-houston':{culture:['space','energy'],transit:['light-rail','bus'],missions:['space-industry-expo','logistics-contract']},
 'us-tx-dallas':{culture:['commerce','arts'],transit:['light-rail','bus'],missions:['business-deal','music-night']},
 'us-tx-austin':{culture:['music','technology'],transit:['bus','rail'],missions:['startup-showcase','music-festival']},
 'us-tx-san-antonio':{culture:['history','riverfront'],transit:['bus','car'],missions:['riverwalk-tour','heritage-story']},
 'us-tx-fort-worth':{culture:['western','arts'],transit:['rail','bus'],missions:['stockyards-event','gallery-show']},
 'us-tx-el-paso':{culture:['border-culture','arts'],transit:['bus','car'],missions:['cross-border-business-education','creator-event']}
};
function getCityLifePreview(id){
 const city=getExpansionDestinations().find(c=>c.id===id);
 if(!city)return null;
 const m=themes[id]||{culture:['local-culture','community'],transit:['bus','car'],missions:['business-opening','creator-meetup']};
 return {id:city.id,name:city.name,districts:city.starter,theme:m.culture,transit:m.transit,missionSeeds:m.missions,systems:['day-night-cycle','fictional-pedestrian-population','traffic-routes','shop-fronts','local-events','accessible-menus','city-economy','airport-arrival'],cityState:'preview-only',npcSimulationActive:false,playable:false,currency:'XP-only-until-server-verified',requires:['city-asset-pack','scene-compiler','NPC-and-traffic-AI','collision-and-navmesh','persisted-profile-travel','real-device-performance-and-QA']};
}
module.exports={getCityLifePreview};
