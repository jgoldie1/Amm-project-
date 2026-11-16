// Four-district stylized Tampa Riverwalk demo anchors, not surveyed street coordinates.
// Riverwalk labels are conceptual scene locations until real-world GIS/asset review.
export const TAMPA_RIVERWALK_SCENE_STATUS='PROTOTYPE_NOT_GEOSPATIAL_CERTIFIED';
export const TAMPA_RIVERWALK_DISTRICTS=Object.freeze([
 {id:'riverwalk',label:'Riverwalk Promenade',x:0,z:7,kind:'public-walkway',activity:'Accessible riverside walk and public music preview'},
 {id:'beauty',label:'LaTeasia Beauty House Quarter',x:18,z:-4,kind:'beauty-district',activity:'BeautyVerse salon, appointments and business-roleplay preview'},
 {id:'homes',label:'Residential Village',x:-19,z:-9,kind:'residential',activity:'Residential community prototype; 42 homes remain a planned expansion'},
 {id:'pier',label:'Holo Entertainment Pier',x:1,z:-23,kind:'entertainment',activity:'Independent artist performance and music-video location preview'}
]);
export function resolveTampaTravel(id){return TAMPA_RIVERWALK_DISTRICTS.find(x=>x.id===id)||null}
export function clampTampaWalk(x,z){
 if(!Number.isFinite(x)||!Number.isFinite(z))return {x:0,z:7};
 return {x:Math.max(-33,Math.min(33,x)),z:Math.max(-35,Math.min(33,z))};
}
