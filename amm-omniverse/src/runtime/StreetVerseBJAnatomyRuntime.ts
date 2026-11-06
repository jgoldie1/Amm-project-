import * as THREE from 'three'

/** Fictional, non-medical anatomy visualization. Hidden during normal gameplay. */
export type BJOrganName='heart'|'left-lung'|'right-lung'|'liver'|'stomach'|'left-kidney'|'right-kidney'
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
  hero.add(root)
  return {
    root,
    setVisible:visible=>{root.visible=visible},
    setCondition:condition=>{injured=condition==='injured';root.userData.condition=condition;materials.forEach(m=>{m.opacity=injured?.7:.86;m.emissive.setHex(injured?0x330008:0x000000)})},
    setExploded:enabled=>{exploded=enabled;root.userData.exploded=enabled;root.visible=enabled||xray},
    setXRay:enabled=>{xray=enabled;root.userData.xray=enabled;root.visible=enabled||exploded;materials.forEach(m=>{m.depthTest=!enabled})},
    tick:elapsedSeconds=>{for(const organ of organs){const target=organ.origin.clone().addScaledVector(organ.direction,exploded?1:0);organ.mesh.position.lerp(target,.16);if(organ.mesh.name==='bj-organ-heart')organ.mesh.scale.set(.095*(1+.035*Math.sin(elapsedSeconds*5)),.12*(1+.035*Math.sin(elapsedSeconds*5)),.07*(1+.035*Math.sin(elapsedSeconds*5)))}},
    dispose:()=>{root.parent?.remove(root);root.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose()});materials.forEach(m=>m.dispose())},
  }
}
