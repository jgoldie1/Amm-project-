/** Pure navigation rules for walkable 5x5 StreetVerse storefronts.
 * Collision is axis-separated to allow wall sliding; front door centered at z=+2.5.
 */
export type Point2={x:number;z:number}
export type StoreBounds={x:number;z:number;halfWidth:number;halfDepth:number;doorHalfWidth:number}
export const storefrontBounds=(x:number,z:number):StoreBounds=>({x,z,halfWidth:2.5,halfDepth:2.5,doorHalfWidth:1})
export function canOccupyStore(p:Point2,b:StoreBounds,radius=.3):boolean{
 if(!Number.isFinite(p.x)||!Number.isFinite(p.z)||!Number.isFinite(radius)||radius<0)return false
 const dx=p.x-b.x,dz=p.z-b.z
 const insideX=Math.abs(dx)<b.halfWidth+radius
 const insideZ=Math.abs(dz)<b.halfDepth+radius
 if(!insideX||!insideZ)return true
 // Interior has solid rear and side walls; front doorway is a gap.
 const wall=.25
 if(Math.abs(dx)>b.halfWidth-wall-radius&&Math.abs(dz)<b.halfDepth+radius)return false
 if(dz<-b.halfDepth+wall+radius&&Math.abs(dx)<b.halfWidth+radius)return false
 if(dz>b.halfDepth-wall-radius&&Math.abs(dx)>b.doorHalfWidth-radius)return false
 return true
}
export function moveWithStoreCollisions(from:Point2,to:Point2,stores:StoreBounds[],radius=.3):Point2{
 const allowed=(p:Point2)=>stores.every(s=>canOccupyStore(p,s,radius))
 const deltaX=to.x-from.x,deltaZ=to.z-from.z
 const steps=Math.max(1,Math.ceil(Math.hypot(deltaX,deltaZ)/.2))
 let p={...from}
 for(let i=0;i<steps;i++){
  const x={x:p.x+deltaX/steps,z:p.z}
  if(allowed(x))p=x
  const z={x:p.x,z:p.z+deltaZ/steps}
  if(allowed(z))p=z
 }
 return p
}
