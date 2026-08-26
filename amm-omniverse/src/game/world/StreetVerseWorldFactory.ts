import * as THREE from 'three'

const material=(color:number,roughness=.65,metalness=.08)=>new THREE.MeshStandardMaterial({color,roughness,metalness})
const mesh=(geometry:THREE.BufferGeometry,color:number)=>{const m=new THREE.Mesh(geometry,material(color));m.castShadow=true;m.receiveShadow=true;return m}

export function createVehicle(seed=0){
  const g=new THREE.Group();const colors=[0x152f4b,0x6f1825,0x243f2b,0xdddddd,0x171717,0x604a28];const paint=colors[seed%colors.length]
  const body=mesh(new THREE.BoxGeometry(4.4,.9,8),paint);body.position.y=1.15;g.add(body)
  const hood=mesh(new THREE.BoxGeometry(4.2,.45,2.1),paint);hood.position.set(0,1.65,-2.75);g.add(hood)
  const cabin=mesh(new THREE.BoxGeometry(3.7,1.45,3.8),paint);cabin.position.set(0,2.05,.3);g.add(cabin)
  const glass=material(0x17364b,.2,.35);for(const z of [-1.63,2.22]){const w=new THREE.Mesh(new THREE.PlaneGeometry(3.05,.92),glass);w.position.set(0,2.15,z);w.rotation.y=z<0?0:Math.PI;g.add(w)}
  const tireMat=material(0x090909,.95,0);for(const x of [-2.05,2.05])for(const z of [-2.45,2.45]){const t=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,.42,18),tireMat);t.rotation.z=Math.PI/2;t.position.set(x,.72,z);t.castShadow=true;g.add(t)}
  const lampMat=new THREE.MeshStandardMaterial({color:0xfff0bd,emissive:0xffd37a,emissiveIntensity:2});for(const x of [-1.35,1.35]){const l=new THREE.Mesh(new THREE.BoxGeometry(.55,.3,.08),lampMat);l.position.set(x,1.35,-4.04);g.add(l)}
  return g
}

export function createStorefront(seed=0,label='STREETVERSE'){
  const g=new THREE.Group();const facade=[0x263a4b,0x49332c,0x303e34,0x3d3152][seed%4]
  const building=mesh(new THREE.BoxGeometry(15,13,14),facade);building.position.y=6.5;g.add(building)
  const glassMat=material(0x163b50,.18,.4);for(const x of [-4.5,0,4.5]){const win=new THREE.Mesh(new THREE.PlaneGeometry(3.2,4),glassMat);win.position.set(x,7.5,-7.01);g.add(win)}
  const door=new THREE.Mesh(new THREE.PlaneGeometry(2.4,4.2),glassMat);door.position.set(0,2.2,-7.03);g.add(door)
  const signCanvas=document.createElement('canvas');signCanvas.width=512;signCanvas.height=128;const c=signCanvas.getContext('2d')!;c.fillStyle='#08111d';c.fillRect(0,0,512,128);c.fillStyle='#f4d36b';c.font='bold 42px sans-serif';c.textAlign='center';c.fillText(label,256,78);const tex=new THREE.CanvasTexture(signCanvas);const sign=new THREE.Mesh(new THREE.PlaneGeometry(9,2.25),new THREE.MeshBasicMaterial({map:tex}));sign.position.set(0,11,-7.08);g.add(sign)
  const awning=mesh(new THREE.BoxGeometry(9,.28,2.1),0x121b28);awning.position.set(0,5.1,-7.8);g.add(awning)
  return g
}

export function createDog(seed=0){
  const g=new THREE.Group();const fur=[0x6b452b,0x24201d,0xc29a68,0xddd0b5][seed%4]
  const body=mesh(new THREE.CapsuleGeometry(.45,1.2,5,10),fur);body.rotation.z=Math.PI/2;body.position.y=.8;g.add(body)
  const head=mesh(new THREE.SphereGeometry(.48,14,12),fur);head.position.set(1.05,1.05,0);g.add(head)
  const snout=mesh(new THREE.BoxGeometry(.48,.3,.38),fur);snout.position.set(1.45,.96,0);g.add(snout)
  const nose=mesh(new THREE.SphereGeometry(.11,8,8),0x111111);nose.position.set(1.7,.98,0);g.add(nose)
  for(const x of [-.62,.55])for(const z of [-.3,.3]){const leg=mesh(new THREE.CylinderGeometry(.1,.12,.72,8),fur);leg.position.set(x,.38,z);g.add(leg)}
  const tail=mesh(new THREE.CylinderGeometry(.07,.13,.95,8),fur);tail.position.set(-1.05,1.1,0);tail.rotation.z=-.85;g.add(tail)
  return g
}

export function createBird(seed=0){
  const g=new THREE.Group();const body=mesh(new THREE.SphereGeometry(.28,12,9),[0x35383d,0x74523d,0x263f55][seed%3]);g.add(body)
  const wingMat=material(0xb5bac0,.8,0);for(const side of [-1,1]){const wing=mesh(new THREE.BoxGeometry(.7,.05,.25),0xb5bac0);wing.position.x=side*.45;wing.rotation.z=side*.22;g.add(wing)}
  return g
}
