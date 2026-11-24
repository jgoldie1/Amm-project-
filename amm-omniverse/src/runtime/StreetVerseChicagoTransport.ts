import * as THREE from 'three'

// Original scenic corridor in StreetVerse game metres. One clock serves both renderers.
export function addChicagoTransport(root:THREE.Group){
 const corridor=new THREE.Group()
 corridor.name='west-side-transport-corridor'
 root.add(corridor)
 const cube=new THREE.BoxGeometry()
 const materials=new Map<number,THREE.MeshStandardMaterial>()
 function part(parent:THREE.Group,name:string,x:number,y:number,z:number,w:number,h:number,d:number,color:number){
  let mat=materials.get(color)
  if(!mat){mat=new THREE.MeshStandardMaterial({color,roughness:.76});materials.set(color,mat)}
  const mesh=new THREE.Mesh(cube,mat)
  mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh)
  return mesh
 }
 const train=new THREE.Group()
 train.name='elevated-train';train.position.set(0,6.81,-46);corridor.add(train)
 for(const offset of [-4.8,4.8]){
  part(train,'carriage',offset,1.25,0,9,2.5,2.9,0xb9c4c8)
  for(const side of [-1,1])part(train,'carriage-windows',offset,1.6,1.46*side,8.4,.83,.04,0x244151)
 }
 part(corridor,'west-side-expressway',0,.09,-76,176,.16,12,0x45494c)
 part(corridor,'divided-median',0,.39,-76,176,.6,.65,0xb5afa0)
 const traffic=[-1,1].map((direction,index)=>{
  const car=new THREE.Group();car.name='expressway-traffic';corridor.add(car)
  car.position.set(0,.18,-76+direction*3)
  part(car,'body',0,.55,0,4.3,1.1,1.8,index?0xbb6647:0x397ea2)
  part(car,'cab',-.22,1.34,0,2.1,.55,1.58,0x344856)
  return car
 })
 return {
  update(now:number){
   const seconds=now/1000
   // Smooth turnaround with a four-second dwell at either end of the modeled track.
   const t=seconds%48
   const travel=t<4?0:t<24?(t-4)/20:t<28?1:(48-t)/20
   train.position.x=-72*Math.cos(Math.PI*travel)
   traffic.forEach((car,i)=>{const x=(seconds*(i?10:8)+i*83)%168-84;car.position.x=i?x:-x})
  },
  dispose(){corridor.removeFromParent();cube.dispose();materials.forEach(mat=>mat.dispose())},
 }
}
