import * as THREE from 'three'

/** Non-destructive foot-ground contact for loaded GLB characters.
 * Finds actual ankle/foot bones, probes approved walkable surfaces, and draws
 * cheap ground contact decals. Does NOT claim two-bone inverse kinematics.
 * All resources are bounded; animations, skin weights and skeleton stay intact.
 */
export type StreetVerseFootContactMode='off'|'contacts'
export type StreetVerseFootContactState={
 characterId:string;leftBone:string|null;rightBone:string|null;
 groundedFeet:number;skinnedRig:boolean;mode:StreetVerseFootContactMode;
 surfaceProbes:number;source:'bj-real-rig-foot-contact'
}
type FootSide='left'|'right'
const ALLOWED_SURFACE=/^(streetverse-ground|.*(?:sidewalk|pavement|road|ramp|stairs|stair|curb|floor|walkway|platform).*)$/i
const LEFT=/^(?:left|l)[_ .-]?(?:foot|ankle)|(?:foot|ankle)[_ .-]?(?:left|l)$|mixamorigleftfoot/i
const RIGHT=/^(?:right|r)[_ .-]?(?:foot|ankle)|(?:foot|ankle)[_ .-]?(?:right|r)$|mixamorigrightfoot/i
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value))
export function identifyBJFootBones(hero:THREE.Object3D):Record<FootSide,THREE.Bone|null>{
 const result:Record<FootSide,THREE.Bone|null>={left:null,right:null}
 const available=new Set<THREE.Bone>()
 hero.traverse(child=>{if(child instanceof THREE.SkinnedMesh)for(const bone of child.skeleton.bones)available.add(bone)})
 for(const bone of available){
  if(!result.left&&LEFT.test(bone.name))result.left=bone
  if(!result.right&&RIGHT.test(bone.name))result.right=bone
 }
 return result
}
export function isApprovedFootSurface(mesh:THREE.Object3D){
 return mesh instanceof THREE.Mesh&&!mesh.userData?.footContactDisabled&&ALLOWED_SURFACE.test(mesh.name)
}
export function createBJFootGroundContact(scene:THREE.Scene,getHero:()=>THREE.Object3D|null,isSeated:()=>boolean,characterId='bj-stubbs'){
 let mode:StreetVerseFootContactMode='contacts'
 let heroRef:THREE.Object3D|null=null
 let found:Record<FootSide,THREE.Bone|null>={left:null,right:null}
 let lastProbe=-Infinity,lastStatus=-Infinity
 let groundSurfaces:THREE.Object3D[]=[]
 const ray=new THREE.Raycaster()
 ray.far=1.5
 const jointPosition=new THREE.Vector3()
 const hitOrigin=new THREE.Vector3()
 const down=new THREE.Vector3(0,-1,0)
 const plateGeometry=new THREE.CircleGeometry(.105,14)
 const plateMaterial=new THREE.MeshBasicMaterial({color:0x111b21,transparent:true,opacity:.32,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1})
 const plateGroup=new THREE.Group()
 plateGroup.name='bj-ground-contact-visuals'
 plateGroup.renderOrder=2
 scene.add(plateGroup)
 const decals=(['left','right'] as const).map(side=>{
  const mesh=new THREE.Mesh(plateGeometry,plateMaterial)
  mesh.name='bj-'+side+'-foot-contact-decal'
  mesh.rotation.x=-Math.PI/2
  mesh.visible=false
  plateGroup.add(mesh)
  return mesh
 })
 const onMode=(event:Event)=>{
  const next=(event as CustomEvent<{mode?:StreetVerseFootContactMode}>).detail?.mode
  if(next==='off'||next==='contacts')mode=next
  if(mode==='off')decals.forEach(mesh=>mesh.visible=false)
 }
 if(typeof window!=='undefined')window.addEventListener('tryamm:streetverse-foot-contact-mode',onMode)
 const publish=(now:number,contacts:number)=>{
  if(typeof window==='undefined'||now-lastStatus<950)return
  lastStatus=now
  const state:StreetVerseFootContactState={
   characterId,leftBone:found.left?.name||null,rightBone:found.right?.name||null,
   groundedFeet:contacts,skinnedRig:Boolean(found.left||found.right),mode,
   surfaceProbes:groundSurfaces.length,source:'bj-real-rig-foot-contact'
  }
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-foot-contact-status',{detail:state}))
 }
 return {
  tick:(now:number)=>{
   if(mode==='off'){decals.forEach(mesh=>mesh.visible=false);return}
   const hero=getHero()
   if(!hero||!hero.visible||isSeated()){decals.forEach(mesh=>mesh.visible=false);return}
   if(hero!==heroRef){
    heroRef=hero
    found=identifyBJFootBones(hero)
    // Cache a short list of named walkable meshes only; avoid casting at residents and vehicles.
    groundSurfaces=[]
    scene.traverse(node=>{
     if(groundSurfaces.length>=72)return
     if(node===hero||!isApprovedFootSurface(node))return
     let parent=node.parent
     while(parent){if(parent===hero)return;parent=parent.parent}
     groundSurfaces.push(node)
    })
   }
   if(now-lastProbe<60)return
   lastProbe=now
   hero.updateMatrixWorld(true)
   scene.updateMatrixWorld(true)
   let grounded=0
   for(const [i,side] of (['left','right'] as const).entries()){
    const bone=found[side],decal=decals[i]
    if(!bone){decal.visible=false;continue}
    bone.getWorldPosition(jointPosition)
    hitOrigin.copy(jointPosition).addScaledVector(down,-.35)
    ray.set(hitOrigin,down)
    const hits=ray.intersectObjects(groundSurfaces,false)
    const hit=hits.find(hit=>hit.point.y<=jointPosition.y+.12&&hit.point.y>=jointPosition.y-.75)
    if(!hit){decal.visible=false;continue}
    const contactGap=jointPosition.y-hit.point.y
    if(!Number.isFinite(contactGap)||contactGap<-.12||contactGap>.75){decal.visible=false;continue}
    decal.visible=true
    decal.position.set(hit.point.x,hit.point.y+.012,hit.point.z)
    const strength=clamp(1-contactGap/.38,0,1)
    decal.material=plateMaterial
    decal.scale.setScalar(clamp(.5+strength*.5,.5,1))
    grounded++
   }
   publish(now,grounded)
  },
  getDetectedFeet:()=>({left:found.left?.name||null,right:found.right?.name||null}),
  dispose:()=>{
   if(typeof window!=='undefined')window.removeEventListener('tryamm:streetverse-foot-contact-mode',onMode)
   plateGroup.removeFromParent()
   plateGeometry.dispose()
   plateMaterial.dispose()
   groundSurfaces=[]
  }
 }
}
