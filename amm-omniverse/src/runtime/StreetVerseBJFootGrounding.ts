import * as THREE from 'three'

/**
 * Conservative BJ GLB foot-ground contact. An additive ankle orientation pass,
 * NOT a full two-bone IK solver. It never repositions/skews the source skeleton.
 * Foot ray tests use a small, vetted surface set; flat-ground fallback is 0m.
 */
export type FootGroundingStatus={enabled:boolean;rigDetected:boolean;surfaceCount:number;leftContact:boolean;rightContact:boolean;correctionRadians:number}
/** GLB naming is inconsistent across Meshy, Mixamo, Blender and MetaHuman exports.
 * Compare normalized endings, never assume a `mixamorig:` separator.
 * Toe and hand bones are intentionally not interpreted as contact feet.
 */
export function streetVerseFootSide(name:string):'left'|'right'|null{
 const normalized=String(name||'').replace(/[^a-z0-9]/gi,'').toLowerCase()
 if(/(?:leftfoot|lfoot|leftankle|lankle)$/.test(normalized))return 'left'
 if(/(?:rightfoot|rfoot|rightankle|rankle)$/.test(normalized))return 'right'
 return null
}
const GROUND=/(?:^|[-_\s])(ground|sidewalk|pavement|walkway|road|ramp|stair|floor)(?:$|[-_\s\d])/i
const clamp=(x:number,min:number,max:number)=>Math.max(min,Math.min(max,x))
type Foot={bone:THREE.Bone;side:'left'|'right';baseline:number;correction:number;lastApplied:number;contact:boolean}
export function createStreetVerseBJFootGrounding(scene:THREE.Scene,getHero:()=>THREE.Object3D|null,isSeated:()=>boolean=()=>false){
 const ray=new THREE.Raycaster()
 const down=new THREE.Vector3(0,-1,0),origin=new THREE.Vector3(),surfaceNormal=new THREE.Vector3(0,1,0)
 const hits:THREE.Intersection<THREE.Object3D>[]=[]
 const surfaces:THREE.Mesh[]=[]
 let hero:THREE.Object3D|null=null,feet:Foot[]=[]
 let lastScan=-Infinity,lastProbe=-Infinity,lastReport=-Infinity
 let disposed=false
 const refreshSurfaces=(now:number)=>{
  if(now-lastScan<4000)return
  lastScan=now;surfaces.length=0
  scene.traverse(obj=>{
   if(surfaces.length>=64)return
   if(obj instanceof THREE.Mesh&&obj.visible&&GROUND.test(obj.name)&&!obj.name.startsWith('streetverse-bj-')){
    surfaces.push(obj)
   }
  })
 }
 const findFeet=(target:THREE.Object3D)=>{
  feet=[];const seen=new Set<THREE.Bone>()
  target.traverse(obj=>{
   if(!(obj instanceof THREE.SkinnedMesh))return
   for(const bone of obj.skeleton.bones){
    const side=streetVerseFootSide(bone.name)
    if(seen.has(bone)||!side)continue
    seen.add(bone)
    if(side)feet.push({bone,side,baseline:bone.rotation.x,correction:0,lastApplied:bone.rotation.x,contact:false})
   }
  })
  feet=feet.slice(0,2)
 }
 const getGround=(position:THREE.Vector3)=>{
  ray.set(position,down);ray.far=1.2
  // Reuse allocations and only query terrain-tagged static surfaces.
  hits.length=0
  ray.intersectObjects(surfaces,false,hits)
  for(const hit of hits){
   if(hit.face){
    surfaceNormal.copy(hit.face.normal).transformDirection(hit.object.matrixWorld)
    return {height:hit.point.y,pitch:Math.atan2(surfaceNormal.z,Math.max(.2,surfaceNormal.y))}
   }
  }
  return {height:0,pitch:0}
 }
 return {
  tick(now:number,moving:boolean)=>{
   if(disposed)return
   const current=getHero()
   if(current!==hero){
    for(const foot of feet){if(Math.abs(foot.bone.rotation.x-foot.lastApplied)<.003)foot.bone.rotation.x-=foot.correction}
    hero=current;feet=[]
    if(current)findFeet(current)
   }
   if(!hero)return
   const seated=isSeated()
   if(now-lastProbe>=90){lastProbe=now;refreshSurfaces(now)}
   else return
   for(const foot of feet){
    foot.bone.getWorldPosition(origin)
    origin.y+=.6
    const ground=getGround(origin)
    const heightDelta=origin.y-.6-ground.height
    const planted=!seated&&!moving&&heightDelta>=-.08&&heightDelta<=.22
    // Sample AFTER the character mixer each tick; preserve native animation by
    // applying only small additive ankle pitch adjustments when foot is planted.
    const desired=planted?clamp(ground.pitch,-.12,.12):0
    const correction=THREE.MathUtils.lerp(foot.correction,desired,.22)
    const sampledRotation=foot.bone.rotation.x
    const uncorrected=Math.abs(sampledRotation-foot.lastApplied)<.003?sampledRotation-foot.correction:sampledRotation
    foot.bone.rotation.x=uncorrected+correction
    foot.correction=correction;foot.lastApplied=foot.bone.rotation.x;foot.contact=planted
   }
   if(now-lastReport>1300){lastReport=now
    const status:FootGroundingStatus={enabled:true,rigDetected:feet.length>0,surfaceCount:surfaces.length,
     leftContact:feet.some(f=>f.side==='left'&&f.contact),rightContact:feet.some(f=>f.side==='right'&&f.contact),
     correctionRadians:Math.max(0,...feet.map(f=>Math.abs(f.correction)))}
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-foot-grounding-status',{detail:status}))
   }
  },
  dispose(){disposed=true
   // If the mixer has not since overwritten the additive correction, undo it.
   for(const foot of feet)foot.bone.rotation.x-=foot.correction
   feet=[];surfaces.length=0
  }
 }
}
