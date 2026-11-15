import * as THREE from 'three'

/** Fictional, non-medical anatomy visualization. Hidden during normal gameplay. */
export type BJOrganName='heart'|'left-lung'|'right-lung'|'liver'|'stomach'|'left-kidney'|'right-kidney'|'small-intestine'|'large-intestine'|'bladder'|'prostate'
export interface BJAnatomyHandle {
  root:THREE.Group
  setVisible:(visible:boolean)=>void
  setCondition:(condition:'healthy'|'injured')=>void
  setExploded:(enabled:boolean)=>void
  setXRay:(enabled:boolean)=>void
  tick:(elapsedSeconds:number)=>void
  dispose:()=>void
}
const ORGAN_LAYOUT:{name:BJOrganName;position:[number,number,number];size:[number,number,number];color:number}[]=[
  {name:'heart',position:[-.055,1.33,.065],size:[.095,.12,.07],color:0x9c354c},
  {name:'left-lung',position:[-.17,1.37,.02],size:[.115,.20,.075],color:0xc47c83},
  {name:'right-lung',position:[.17,1.37,.02],size:[.115,.20,.075],color:0xc47c83},
  {name:'liver',position:[.12,1.10,.045],size:[.22,.085,.11],color:0x85464b},
  {name:'stomach',position:[-.12,1.075,.07],size:[.105,.115,.08],color:0xc88a91},
  {name:'left-kidney',position:[-.14,.99,-.055],size:[.065,.09,.05],color:0x9d5964},
  {name:'right-kidney',position:[.14,.99,-.055],size:[.065,.09,.05],color:0x9d5964},
  {name:'small-intestine',position:[0,.89,.07],size:[.15,.105,.095],color:0xd2a18c},
  {name:'large-intestine',position:[0,.89,.035],size:[.195,.14,.09],color:0x98746c},
  {name:'bladder',position:[0,.71,.07],size:[.07,.065,.055],color:0xb68d75},
  {name:'prostate',position:[0,.645,.055],size:[.035,.025,.032],color:0xa87b83},
]
export function installStreetVerseBJAnatomy(hero:THREE.Object3D):BJAnatomyHandle{
  const existing=hero.getObjectByName('bj-anatomy-overlay')
  if(existing){existing.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();if(Array.isArray(object.material))object.material.forEach(material=>material.dispose());else object.material.dispose()}});existing.parent?.remove(existing)}
  const root=new THREE.Group()
  root.name='bj-anatomy-overlay'
  root.visible=false
  root.userData={fictional:true,medicalAccuracy:false,renderMode:'hidden-by-default'}
  const materials:THREE.MeshStandardMaterial[]=[]
  const organs:{mesh:THREE.Mesh;origin:THREE.Vector3;direction:THREE.Vector3}[]=[]
  let exploded=false,xray=false,injured=false
  for(const organ of ORGAN_LAYOUT){
    const material=new THREE.MeshStandardMaterial({color:organ.color,roughness:.75,transparent:true,opacity:.86,depthWrite:false})
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),material)
    mesh.name='bj-organ-'+organ.name
    mesh.position.set(...organ.position)
    mesh.scale.set(...organ.size)
    mesh.userData={organ:organ.name,fictional:true}
    materials.push(material)
    organs.push({mesh,origin:mesh.position.clone(),direction:new THREE.Vector3(Math.sign(mesh.position.x||1)*.3,(mesh.position.y-1.18)*.45,.20)})
    root.add(mesh)
  }
  // Draw the actual rig hierarchy in X-ray/tear-apart mode, rather than
  // inventing a second skeleton disconnected from the animated GLB.
  const bones:THREE.Bone[]=[]
  hero.traverse(node=>{if(node instanceof THREE.Bone)bones.push(node)})
  const segments=bones.filter(bone=>bone.parent instanceof THREE.Bone)
  const skeletonGeometry=new THREE.BufferGeometry()
  const skeletonPositions=new Float32Array(segments.length*6)
  skeletonGeometry.setAttribute('position',new THREE.BufferAttribute(skeletonPositions,3))
  const skeletonMaterial=new THREE.LineBasicMaterial({color:0xe6e8cf,transparent:true,opacity:.85,depthTest:false})
  const skeletonLines=new THREE.LineSegments(skeletonGeometry,skeletonMaterial)
  skeletonLines.name='bj-male-skeleton-rig-overlay'
  skeletonLines.frustumCulled=false
  root.add(skeletonLines)
  const parentPosition=new THREE.Vector3(),childPosition=new THREE.Vector3()
  hero.add(root)
  return {
    root,
    setVisible:visible=>{root.visible=visible},
    setCondition:condition=>{injured=condition==='injured';root.userData.condition=condition;materials.forEach(m=>{m.opacity=injured?.7:.86;m.emissive.setHex(injured?0x330008:0x000000)})},
    setExploded:enabled=>{exploded=enabled;root.userData.exploded=enabled;root.visible=enabled||xray},
    setXRay:enabled=>{xray=enabled;root.userData.xray=enabled;root.visible=enabled||exploded;materials.forEach(m=>{m.depthTest=!enabled})},
    tick:elapsedSeconds=>{if(root.visible&&segments.length){hero.updateWorldMatrix(true,true);for(let i=0;i<segments.length;i++){const bone=segments[i];(bone.parent as THREE.Bone).getWorldPosition(parentPosition);bone.getWorldPosition(childPosition);root.worldToLocal(parentPosition);root.worldToLocal(childPosition);skeletonPositions.set([parentPosition.x,parentPosition.y,parentPosition.z,childPosition.x,childPosition.y,childPosition.z],i*6)}skeletonGeometry.attributes.position.needsUpdate=true}for(const organ of organs){const target=organ.origin.clone().addScaledVector(organ.direction,exploded?1:0);organ.mesh.position.lerp(target,.16);if(organ.mesh.name==='bj-organ-heart')organ.mesh.scale.set(.095*(1+.035*Math.sin(elapsedSeconds*5)),.12*(1+.035*Math.sin(elapsedSeconds*5)),.07*(1+.035*Math.sin(elapsedSeconds*5)))}},
    dispose:()=>{root.parent?.remove(root);root.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose()});materials.forEach(m=>m.dispose());skeletonGeometry.dispose();skeletonMaterial.dispose()},
  }
}
