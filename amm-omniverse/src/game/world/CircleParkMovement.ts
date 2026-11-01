export type Position2D={x:number;z:number};
export type Bounds2D={minX:number;maxX:number;minZ:number;maxZ:number};
export const CIRCLE_PARK_BOUNDS:Bounds2D={minX:-20,maxX:20,minZ:-20,maxZ:5};
export const APARTMENT_BOUNDS:Bounds2D={minX:-6,maxX:6,minZ:-13.5,maxZ:-6.5};
export const DOOR_HALF_WIDTH=1.2;
export function insideBounds(p:Position2D,b:Bounds2D):boolean{return p.x>=b.minX&&p.x<=b.maxX&&p.z>=b.minZ&&p.z<=b.maxZ}
export function canEnterApartment(p:Position2D):boolean{return Math.abs(p.x)<=DOOR_HALF_WIDTH&&p.z>=-7.8&&p.z<=-4.8}
export function canUseRepairStation(p:Position2D):boolean{return Math.hypot(p.x-3,p.z+5.7)<=2}
export function canUseElevator(p:Position2D):boolean{return Math.abs(p.x)<=2&&p.z>=-8&&p.z<=-4.5}
export function moveWithWalls(from:Position2D,to:Position2D,inside:boolean):Position2D{
 const x=Math.max(CIRCLE_PARK_BOUNDS.minX,Math.min(CIRCLE_PARK_BOUNDS.maxX,to.x));
 const z=Math.max(CIRCLE_PARK_BOUNDS.minZ,Math.min(CIRCLE_PARK_BOUNDS.maxZ,to.z));
 if(inside)return {x,z};
 // Exterior walls block entry except at the centered doorway. Door interaction
 // changes game state; physical interior remains a future milestone.
 const crossesFront=from.z>-6.5&&z<=-6.5&&Math.abs(x)<=6;
 if(crossesFront)return {x,z:-6.5};
 const hitsFacade=z<=-6.5&&z>=-13.5&&Math.abs(x)<=6;
 if(hitsFacade)return {x:from.x,z:from.z};
 return {x,z};
}
