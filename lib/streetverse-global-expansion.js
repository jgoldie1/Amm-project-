'use strict';
/* Data-driven city and region travel registry. No unverified world is playable. */
const {getEarthRegistry}=require('./streetverse-earth-registry');
const destinations=[
{id:'us-mi-detroit',name:'Detroit',region:'Michigan',latitude:42.3314,longitude:-83.0458,starter:['Downtown','Midtown','Corktown']},
{id:'us-nv-las-vegas',name:'Las Vegas',region:'Nevada',latitude:36.1699,longitude:-115.1398,starter:['Downtown','Arts District','The Strip']},
{id:'us-ga-atlanta',name:'Atlanta',region:'Georgia',latitude:33.7490,longitude:-84.3880,starter:['Downtown','Midtown','Old Fourth Ward']},
{id:'us-pa-philadelphia',name:'Philadelphia',region:'Pennsylvania',latitude:39.9526,longitude:-75.1636,starter:['Center City','Old City','University City']}
];
function getExpansionDestinations(){const registry=getEarthRegistry();return destinations.map(city=>({...city,registered:registry.regions.some(x=>x.id===city.id),status:'planned',playable:false}));}
function planFlight(from,to){const allowed=new Set(getEarthRegistry().regions.map(x=>x.id));if(!allowed.has(from)||!allowed.has(to)||from===to)throw Error('Invalid flight endpoints');return {from,to,mode:'fly-in',status:'planned',durationSeconds:null,travelEnabled:false,reason:'Destination scene and flight transition not yet certified'};}
module.exports={getExpansionDestinations,planFlight};
