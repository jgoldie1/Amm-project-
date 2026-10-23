'use strict';
// Original TRYAMM crossover rules: management simulation + open-world roleplay.
// No third-party game source or assets copied into this module.
const CITY_SYSTEMS=['housing','business','roads','power','police','fire','health','education','park','cleanup'];
const ROLEPLAY_SYSTEMS=['walk','drive','work','rent','furnish','missions','npc-routines','city-events'];
function createHybridCity({cityId,district='Downtown'}={}){
 if(typeof cityId!=='string'||!/^[a-z]{2}-[a-z0-9-]{4,70}$/.test(cityId))throw Error('invalid_city');
 return {schema:'streetverse.hybrid-city.v1',cityId,district,mode:'fictional-preview',
 districts:[{id:district,population:600,housing:280,jobs:190,traffic:25,happiness:65,power:90,safety:70}],
 infrastructure:{roads:50,power:90,water:90,transit:45,parks:40},
 player:{credits:400,xp:0,home:null,job:null},
 management:CITY_SYSTEMS,roleplay:ROLEPLAY_SYSTEMS,
 integration:{existingCitySimulation:'StreetVerseCitySimulationRuntime',existingLife:'streetverse-life-simulation',existingDrive:'StreetVerseCityLifeRuntime',renderer:'pending',passport:'pending',verifiedCommerce:false},
 playable:false,certified:false};
}
function applyCityAction(city,action){
 if(!city||!CITY_SYSTEMS.includes(action?.kind)||!Number.isInteger(action.amount)||action.amount<1||action.amount>10)throw Error('invalid_city_action');
 const next=structuredClone(city),d=next.districts[0],cost=action.amount*20;
 if(next.player.credits<cost)throw Error('insufficient_fictional_credits');
 next.player.credits-=cost;
 if(action.kind==='housing')d.housing+=action.amount*3;
 else if(action.kind==='business')d.jobs+=action.amount*2;
 else if(action.kind==='roads')d.traffic=Math.max(0,d.traffic-action.amount);
 else if(action.kind==='park')d.happiness=Math.min(100,d.happiness+action.amount);
 else if(action.kind==='power')next.infrastructure.power=Math.min(100,next.infrastructure.power+action.amount);
 else if(action.kind==='cleanup')d.happiness=Math.min(100,d.happiness+Math.ceil(action.amount/2));
 else if(action.kind==='police')d.safety=Math.min(100,d.safety+action.amount);
 else if(action.kind==='fire')d.safety=Math.min(100,d.safety+Math.ceil(action.amount/2));
 else if(action.kind==='health'||action.kind==='education')d.happiness=Math.min(100,d.happiness+Math.ceil(action.amount/2));
 return next;
}
module.exports={CITY_SYSTEMS,ROLEPLAY_SYSTEMS,createHybridCity,applyCityAction};
