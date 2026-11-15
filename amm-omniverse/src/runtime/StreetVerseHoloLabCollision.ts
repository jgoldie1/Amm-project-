/** HoloLab doorway collision and safe-spawn contract, independent of rendering. */
export type HoloPoint={x:number;z:number}
export type HoloObstacle={x:number;z:number;halfWidth:number;halfDepth:number}
export const HOLOLAB_COLLISION_RADIUS=0.35
export const HOLOLAB_SAFE_SPAWNS={outside:{x:-3,z:0},chamber:{x:0,z:0},past:{x:0,z:1.5},present:{x:0,z:1.5},future:{x:0,z:1.5}} as const
export function canOccupyHoloLab(position:HoloPoint,obstacles:readonly HoloObstacle[],radius=HOLOLAB_COLLISION_RADIUS){
 if(!Number.isFinite(position.x)||!Number.isFinite(position.z)||!Number.isFinite(radius)||radius<=0)return false
 return obstacles.every(o=>{
  const dx=Math.max(Math.abs(position.x-o.x)-o.halfWidth,0)
  const dz=Math.max(Math.abs(position.z-o.z)-o.halfDepth,0)
  return dx*dx+dz*dz>=radius*radius
 })
}
export function advanceHoloLabCharacter(current:HoloPoint,target:HoloPoint,speed:number,deltaSeconds:number,obstacles:readonly HoloObstacle[]){
 if(!Number.isFinite(speed)||speed<0||!Number.isFinite(deltaSeconds)||deltaSeconds<0)throw new Error('Invalid movement parameters')
 const dx=target.x-current.x,dz=target.z-current.z,distance=Math.hypot(dx,dz)
 if(!distance)return {...current}
 const step=Math.min(distance,speed*Math.min(deltaSeconds,0.05))
 const next={x:current.x+dx/distance*step,z:current.z+dz/distance*step}
 return canOccupyHoloLab(next,obstacles)?next:{...current}
}
