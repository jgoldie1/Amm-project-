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
 const onOrgans=(event:Event)=>{
  const detail=(event as CustomEvent<{characterId?:string;integrity?:Partial<Record<StreetVerseOrgan,number>>}>).detail
  if(detail?.characterId!=='bj-stubbs'||!detail.integrity)return
  organMeshes.forEach(({spec,material})=>{
   const integrity=Number(detail.integrity?.[spec.id])
   if(!Number.isFinite(integrity))return
   const intensity=THREE.MathUtils.clamp(integrity,0,100)/100
   material.color.setHex(spec.color).lerp(new THREE.Color(0xffa347),1-intensity)
   material.opacity=.50+intensity*.28
  })
 }
 window.addEventListener('tryamm:streetverse-organ-state',onOrgans)
 const markers:THREE.Mesh[]=[]
 // A lightweight skeletal graph follows the ORIGINAL GLB parent-child joints.
 // All lines are overlays; no change is made to skinning or bone transforms.
 const boneLinkVertices=new Float32Array(96*2*3)
 const boneLinkGeometry=new THREE.BufferGeometry()
 const boneLinkAttribute=new THREE.BufferAttribute(boneLinkVertices,3)
 boneLinkGeometry.setAttribute('position',boneLinkAttribute)
 boneLinkGeometry.setDrawRange(0,0)
 const boneLinkMaterial=new THREE.LineBasicMaterial({color:0xffe4b3,transparent:true,opacity:.70,depthTest:false})
 const boneLinks=new THREE.LineSegments(boneLinkGeometry,boneLinkMaterial)
 boneLinks.name='bj-original-glb-skeleton-connection-overlay'
 boneLinks.frustumCulled=false
 overlay.add(boneLinks)
 let boneParentIndices:number[]=[]
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
  boneParentIndices=bones.map(bone=>bone.parent instanceof THREE.Bone?bones.indexOf(bone.parent):-1)
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
   let segments=0
   markers.forEach((marker,i)=>{
    const parentIndex=boneParentIndices[i]
    if(parentIndex<0)return
    const parent=markers[parentIndex]
    const start=segments*6
    boneLinkVertices[start]=marker.position.x
    boneLinkVertices[start+1]=marker.position.y
    boneLinkVertices[start+2]=marker.position.z
    boneLinkVertices[start+3]=parent.position.x
    boneLinkVertices[start+4]=parent.position.y
    boneLinkVertices[start+5]=parent.position.z
    segments++
   })
   boneLinkGeometry.setDrawRange(0,segments*2)
   boneLinkAttribute.needsUpdate=true
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
   window.removeEventListener('tryamm:streetverse-organ-state',onOrgans)
   markers.forEach(mesh=>overlay.remove(mesh))
   overlay.removeFromParent()
   geometry.dispose();boneGeometry.dispose();boneMaterial.dispose()
   boneLinkGeometry.dispose();boneLinkMaterial.dispose()
   organMeshes.forEach(x=>x.material.dispose())
  }
 }
}
