'use strict';
// AI Cafe StreetVerse World Director: deterministic build plan only.
// Produces auditable tasks; it does not submit paid jobs, publish worlds, or certify playability.
const {getEarthRegistry}=require('./streetverse-earth-registry');
const {getExpansionDestinations}=require('./streetverse-global-expansion');
const {getCityLifePreview}=require('./streetverse-city-life-expansion');
const PHASES=[
 {id:'preserve',agent:'Guardian / AI Cafe QA',tasks:['snapshot Chicago baseline','run existing regression tests','record previous deployment revision']},
 {id:'assets',agent:'HoloLab / World Forger',tasks:['rights-cleared neighborhood architecture','LOD buildings and trees','mobile memory budget','source asset provenance']},
 {id:'geometry',agent:'Construct / World Compiler',tasks:['roads and terrain','scene graph and district entrances','collision and navigation mesh']},
 {id:'life',agent:'StreetVerse Living City',tasks:['pedestrian schedules and reactions','traffic routes and vehicle controls','day night cycle','events and local missions']},
 {id:'commerce',agent:'AI Cafe Business / Holo Ads',tasks:['founder-controlled storefront locations','approved business passports','separate fictional XP from real payments','ad placement disclosure']},
 {id:'media',agent:'CrossVerse LIVE / HoloLab',tasks:['authorized creator events','captioning and accessible modes','rights and moderation validation']},
 {id:'travel',agent:'StreetVerse Earth Travel',tasks:['airport arrival scene','persist character and inventory server-side','return route and world transition']},
 {id:'certify',agent:'Guardian / Owner',tasks:['mobile and desktop smoke tests','accessibility QA','performance/cost review','owner signoff before release']}
];
function buildCityJobs(cityId){
 const region=getEarthRegistry().regions.find(x=>x.id===cityId);
 if(!region)throw new Error('Unknown StreetVerse city');
 const destination=getExpansionDestinations().find(x=>x.id===cityId);
 const life=getCityLifePreview(cityId);
 const districts=life?.districts||[];
 return {schema:'tryamm.world-director.plan.v1',cityId,city:region.name,
 baseline:'reuse Chicago systems; never mutate Chicago to build other cities',
 cityReady:false,playable:false,productionApproved:false,
 districts,characterContinuity:'not implemented',currency:'fictional XP only',
 phases:PHASES.map((phase,index)=>({order:index+1,...phase,status:'not-run',
 evidenceRequired:true,requiresApproval:index===0||index===7})),
 preview:life||null,unlistedRegion:!destination,
 launchBlockers:['certified city assets','actual renderer integration','NPC and traffic simulation','airport transitions','server-side saved progress','business verification','real-device QA']};
}
function buildWorldJobs(){return getEarthRegistry().regions.filter(r=>r.country==='US'||r.country==='NG'||r.country==='GH'||r.country==='KE'||r.country==='ZA'||r.country==='ET'||r.country==='GB'||r.country==='JP').map(r=>buildCityJobs(r.id));}
module.exports={PHASES,buildCityJobs,buildWorldJobs};
