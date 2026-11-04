/**
 * Approximate local-space fit envelope for the six-seat StreetVerse SUV.
 * These are simulation dimensions, not proof that any particular GLB mesh fits.
 * Production mesh QA must run Box3/skinned mesh checks against the actual cabin.
 */
export type CabinAvatarSize={shoulderWidthM:number;seatedHeightM:number;seatedDepthM:number}
export type CabinSeatAnchor={x:number;y:number;z:number}
export type CabinFit={fits:boolean;scale:number;reason:'ok'|'invalid-dimensions'|'too-large'|'roof-overlap'|'wall-overlap'|'passenger-overlap';size:CabinAvatarSize}
export const SIX_SEAT_SUV_SHELL={
 minX:-2.58,maxX:.1,minZ:-.94,maxZ:.94,roofY:1.86,
 maxScaleReduction:.08,clearanceM:.012
} as const
export const DEFAULT_SEATED_AVATAR:CabinAvatarSize={shoulderWidthM:.42,seatedHeightM:.98,seatedDepthM:.57}
const valid=(n:number)=>Number.isFinite(n)&&n>0&&n<10
const scaled=(b:CabinAvatarSize,k:number):CabinAvatarSize=>({shoulderWidthM:b.shoulderWidthM*k,seatedHeightM:b.seatedHeightM*k,seatedDepthM:b.seatedDepthM*k})
export function checkSixSeatCabinFit(
 anchor:CabinSeatAnchor,body:CabinAvatarSize,
 others:readonly {anchor:CabinSeatAnchor;size:CabinAvatarSize}[]=[]
):CabinFit{
 if(![anchor.x,anchor.y,anchor.z,body.shoulderWidthM,body.seatedHeightM,body.seatedDepthM].every(Number.isFinite)||
 !valid(body.shoulderWidthM)||!valid(body.seatedHeightM)||!valid(body.seatedDepthM)){
  return {fits:false,scale:1,reason:'invalid-dimensions',size:body}
 }
 const shell=SIX_SEAT_SUV_SHELL
 const minimum=1-shell.maxScaleReduction
 let reason:CabinFit['reason']='too-large'
 for(let scale=1;scale>=minimum-.00001;scale-=.01){
  const size=scaled(body,scale)
  const halfWidth=size.shoulderWidthM/2,halfDepth=size.seatedDepthM/2
  if(anchor.y+size.seatedHeightM+shell.clearanceM>shell.roofY){reason='roof-overlap';continue}
  if(anchor.z-halfWidth-shell.clearanceM<shell.minZ||anchor.z+halfWidth+shell.clearanceM>shell.maxZ||
     anchor.x-halfDepth-shell.clearanceM<shell.minX||anchor.x+halfDepth+shell.clearanceM>shell.maxX){reason='wall-overlap';continue}
  const overlapping=others.some(o=>{
    const depth=(size.seatedDepthM+o.size.seatedDepthM)/2+shell.clearanceM
    const shoulder=(size.shoulderWidthM+o.size.shoulderWidthM)/2+shell.clearanceM
    return Math.abs(anchor.x-o.anchor.x)<depth&&Math.abs(anchor.z-o.anchor.z)<shoulder
  })
  if(overlapping){reason='passenger-overlap';continue}
  return {fits:true,scale:Math.max(minimum,Math.round(scale*100)/100),reason:'ok',size}
 }
 return {fits:false,scale:1,reason,size:body}
}
