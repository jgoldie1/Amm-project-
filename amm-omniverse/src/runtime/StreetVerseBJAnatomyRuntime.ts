import * as THREE from 'three'

/** Fictional, non-medical anatomy visualization. Hidden during normal gameplay. */
export type BJOrganName='heart'|'left-lung'|'right-lung'|'liver'|'stomach'|'left-kidney'|'right-kidney'
export interface BJAnatomyHandle {
  root:THREE.Group
  setVisible:(visible:boolean)=>void
  setCondition:(condition:'healthy'|'injured')=>void
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
  if(existing)existing.parent?.remove(existing)
  const root=new THREE.Group()
  root.name='bj-anatomy-overlay'
  root.visible=false
  root.userData={fictional:true,medicalAccuracy:false,renderMode:'hidden-by-default'}
  const materials:THREE.MeshStandardMaterial[]=[]
  for(const organ of ORGAN_LAYOUT){
    const material=new THREE.MeshStandardMaterial({color:organ.color,roughness:.75,transparent:true,opacity:.86,depthWrite:false})
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),material)
    mesh.name='bj-organ-'+organ.name
    mesh.position.set(...organ.position)
    mesh.scale.set(...organ.size)
    mesh.userData={organ:organ.name,fictional:true}
    materials.push(material)
    root.add(mesh)
  }
  hero.add(root)
  return {
    root,
    setVisible:visible=>{root.visible=visible},
    setCondition:condition=>{root.userData.condition=condition;materials.forEach(m=>{m.opacity=condition==='injured'?.7:.86})},
    dispose:()=>{root.parent?.remove(root);root.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose()});materials.forEach(m=>m.dispose())},
  }
}
