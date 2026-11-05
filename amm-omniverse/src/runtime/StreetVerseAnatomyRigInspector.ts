import * as THREE from 'three'
import {STREETVERSE_ORGAN_LABELS,type StreetVerseOrgan} from './StreetVerseAnatomySimulation'

/** Reversible inspection overlay for BJ's *real* GLB bones and stylized fictional organ states.
 * Never detaches, rotates, scales, or alters source skeleton bones, skin weights or GLB.
 * Not realistic surgery, diagnostic anatomy or gore.
 */
export type StreetVerseAnatomyInspectMode='off'|'overlay'|'exploded'
const organs:ReadonlyArray<{id:StreetVerseOrgan;offset:[number,number,number];scale:[number,number,number];color:number}>=[
 {id:'brain',offset:[0,1.69,0],scale:[.13,.10,.12],color:0xcf9bc4},
 {id:'heart',offset:[-.08,1.26,.16],scale:[.09,.12,.08],color:0xc46c7f},
 {id:'lungs',offset:[.1,1.31,.09],scale:[.20,.20,.10],color:0x9fd3d7},
 {id:'liver',offset:[-.11,1.00,.14],scale:[.19,.10,.10],color:0xa48b69},
 {id:'kidneys',offset:[.12,.89,.03],scale:[.13,.09,.09],color:0x8facb0},
]
export function createStreetVerseAnatomyRigInspector(scene:THREE.Scene,getHero:()=>THREE.Object3D|null){
 let mode:StreetVerseAnatomyInspectMode='off'
 let selectedHero:THREE.Object3D|null=null
 const overlay=new THREE.Group()
 overlay.name='streetverse-bj-nondestructive-anatomy-inspector'
 overlay.visible=false
 scene.add(overlay)
 const geometry=new THREE.SphereGeometry(1,10,8)
 const boneGeometry=new THREE.SphereGeometry(.034,7,6)
 const boneMaterial=new THREE.MeshBasicMaterial({color:0xffde9e,transparent:true,opacity:.86,depthWrite:false})
 const organMeshes=organs.map(spec=>{
  const material=new THREE.MeshBasicMaterial({color:spec.color,transparent:true,opacity:.78,depthWrite:false})
  const mesh=new THREE.Mesh(geometry,material)
  mesh.name='schematic-'+spec.id
  mesh.userData={organId:spec.id,label:STREETVERSE_ORGAN_LABELS[spec.id],nonMedical:true}
  mesh.scale.set(...spec.scale)
  overlay.add(mesh)
  return {mesh,spec,material}
 })
 const markers:THREE.Mesh[]=[]
 let bones:THREE.Bone[]=[]
 const temp=new THREE.Vector3()
 const center=new THREE.Vector3()
 const bonePosition=new THREE.Vector3()
 let lastEmitted=-1
 function rebuild(hero:THREE.Object3D){
  markers.forEach(mesh=>overlay.remove(mesh))
  markers.length=0
  bones=[]
  const seen=new Set<THREE.Bone>()
  hero.traverse(node=>{
   if(node instanceof THREE.SkinnedMesh){
    for(const bone of node.skeleton?.bones||[]){
     if(!seen.has(bone)){seen.add(bone);bones.push(bone)}
    }
   }
  })
  bones=bones.slice(0,96) // phone-safe visual budget
  bones.forEach((_,index)=>{
   const marker=new THREE.Mesh(boneGeometry,boneMaterial)
   marker.name='rig-joint-'+index
   overlay.add(marker)
   markers.push(marker)
  })
  lastEmitted=-1
 }
 const onMode=(event:Event)=>{
  const requested=(event as CustomEvent<{mode?:StreetVerseAnatomyInspectMode}>).detail?.mode
  if(requested!=='off'&&requested!=='overlay'&&requested!=='exploded')return
  mode=requested
  overlay.visible=mode!=='off'
  lastEmitted=-1
 }
 window.addEventListener('tryamm:streetverse-anatomy-inspect-toggle',onMode)
 return{
  getMode:()=>mode,
  tick:()=>{
   if(mode==='off')return
   const hero=getHero()
   if(!hero){overlay.visible=false;return}
   overlay.visible=true
   if(hero!==selectedHero){selectedHero=hero;rebuild(hero)}
   hero.getWorldPosition(center)
   overlay.position.copy(center)
   overlay.rotation.y=hero.rotation.y
   overlay.scale.setScalar(1)
   overlay.updateMatrixWorld(true)
   organMeshes.forEach(({mesh,spec})=>{
    const [x,y,z]=spec.offset
    mesh.position.set(x+(mode==='exploded'?Math.sign(x||1)*.48:0),y,z+(mode==='exploded'?.32:0))
   })
   markers.forEach((marker,i)=>{
    bones[i].getWorldPosition(bonePosition)
    overlay.worldToLocal(bonePosition)
    if(mode==='exploded'){
     const dx=bonePosition.x
     bonePosition.x+=Math.sign(dx||1)*.24
    }
    marker.position.copy(bonePosition)
   })
   if(lastEmitted!==bones.length){
    lastEmitted=bones.length
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-anatomy-inspector-status',{detail:{
     characterId:'bj-stubbs',mode,rigBoneCount:bones.length,organOverlays:organs.map(x=>x.id),realSkinnedRig:bones.length>0,
     nonDestructive:true,nonMedical:true
    }}))
   }
  },
  dispose:()=>{
   window.removeEventListener('tryamm:streetverse-anatomy-inspect-toggle',onMode)
   markers.forEach(mesh=>overlay.remove(mesh))
   overlay.removeFromParent()
   geometry.dispose();boneGeometry.dispose();boneMaterial.dispose()
   organMeshes.forEach(x=>x.material.dispose())
  }
 }
}
