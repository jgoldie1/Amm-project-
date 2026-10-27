/** StreetVerse staged Chicago district mesh plan.
 * Deterministic lightweight geometry instructions, not a rendered/certified real-world map.
 * Existing Circle Park gameplay and production scenes remain untouched.
 */
export type CityDistrict='circle-park'|'taylor'|'roosevelt'|'pilsen'|'west-side'|'downtown'
export type CityBlock={id:string;district:CityDistrict;col:number;row:number;buildingCount:number;trees:number;trafficSpawns:number;quality:'low'|'medium'|'high'}
export type DistrictPack={district:CityDistrict;blocks:CityBlock[];seed:number;status:'staging';fictionalized:true}
const DISTRICTS:CityDistrict[]=['circle-park','taylor','roosevelt','pilsen','west-side','downtown']
function hash(seed:number,x:number,y:number):number{
 let h=(seed^(Math.imul(x+1,73856093))^(Math.imul(y+1,19349663)))>>>0
 h^=h>>>16;h=Math.imul(h,2246822507);h^=h>>>13;return h>>>0
}
export function createDistrictPack(district:CityDistrict,options:{seed:number;size:number;quality:'low'|'medium'|'high'}):DistrictPack{
 if(!DISTRICTS.includes(district))throw Error('unknown_district')
 const {seed,size,quality}=options
 if(!Number.isSafeInteger(seed)||!Number.isSafeInteger(size)||size<1||size>12)throw Error('invalid_bounds')
 const blocks:CityBlock[]=[]
 const density=quality==='high'?8:quality==='medium'?5:3
 for(let row=0;row<size;row++)for(let col=0;col<size;col++){
  const v=hash(seed,col,row)
  blocks.push({id:district+'-'+col+'-'+row,district,col,row,buildingCount:1+(v%density),trees:(v>>>4)%4,
   trafficSpawns:quality==='low'?0:(v>>>7)%3,quality})
 }
 return{district,blocks,seed,status:'staging',fictionalized:true}
}
/** Prepare a complete set of districts while keeping only the requested pack resident. */
export function createChicagoStagingPlan(seed=20261026,quality:'low'|'medium'|'high'='low'){
 return DISTRICTS.map((district,i)=>({
  district,build:()=>createDistrictPack(district,{seed:seed+i*17,size:district==='circle-park'?2:6,quality})
 }))
}
/** Never replace the protected playable Circle Park scene with generated geometry. */
export function canMountDistrictPack(pack:DistrictPack,context:{isStaging:boolean;protectedCircleParkActive:boolean}){
 return context.isStaging&&pack.status==='staging'&&!(pack.district==='circle-park'&&context.protectedCircleParkActive)
}
