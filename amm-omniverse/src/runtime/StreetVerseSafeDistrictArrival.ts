/** Resolve a walkable 2D landing without bypassing the active scene's collision rules.
 * This is only used for explicit user-requested district travel, never for frame movement.
 */
export type StreetVerseDistrictPoint={x:number;z:number}
export type StreetVerseArrivalResult=StreetVerseDistrictPoint&{adjusted:boolean;distance:number}

export function findSafeStreetVerseDistrictArrival(
 requested:StreetVerseDistrictPoint,
 canTraverse:(x:number,z:number)=>boolean,
 clampCoordinate:(value:number)=>number,
):StreetVerseArrivalResult|null{
 if(!Number.isFinite(requested.x)||!Number.isFinite(requested.z))return null
 const targetX=clampCoordinate(requested.x),targetZ=clampCoordinate(requested.z)
 if(canTraverse(targetX,targetZ))return{x:targetX,z:targetZ,adjusted:false,distance:0}
 // Search closest distances first. No random jitter, no placement into a blocked cell.
 for(const radius of [1.5,3,4.5,6,9,12,16,20]){
  for(let i=0;i<16;i++){
   const angle=(i/16)*Math.PI*2
   const x=clampCoordinate(targetX+Math.cos(angle)*radius)
   const z=clampCoordinate(targetZ+Math.sin(angle)*radius)
   if(!canTraverse(x,z))continue
   const distance=Math.hypot(x-targetX,z-targetZ)
   return{x,z,adjusted:true,distance}
  }
 }
 return null
}
