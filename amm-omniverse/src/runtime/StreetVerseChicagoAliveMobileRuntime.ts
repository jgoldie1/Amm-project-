import * as THREE from 'three'

export type StreetVerseChicagoAliveCounts={
  ambientResidents:number
  parkedVehicles:number
  storefronts:number
  streetProps:number
  crosswalkStripes:number
}

export type StreetVerseChicagoAliveMobileRuntime={
  counts:StreetVerseChicagoAliveCounts
  tick:(nowMs:number)=>void
  dispose:()=>void
}

type CrowdRoute={axis:'x'|'z';fixed:number;phase:number;speed:number}

const BODY_COLORS=[0x2f8fd7,0xc94f75,0x3f9d62,0xd38a39,0x7958b8,0x4aa3a0,0xb75d3c,0x8ca63f]
const SKIN_COLORS=[0x5b3525,0x7a4d34,0x9b6547,0xb97956,0xd49770,0xe2ae88]
const CAR_COLORS=[0x2f6bd9,0xc53d3d,0xe1c052,0xe9edf1,0x232830,0x2e9c68,0x8a4fb0]

function disposeMesh(mesh:THREE.InstancedMesh){
  mesh.geometry.dispose()
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material]
  materials.forEach(material=>material.dispose())
}

export function createStreetVerseChicagoAliveMobile(scene:THREE.Scene):StreetVerseChicagoAliveMobileRuntime{
  const root=new THREE.Group()
  root.name='streetverse-chicago-alive-mobile'
  scene.add(root)

  const matrix=new THREE.Object3D()
  const tint=new THREE.Color()

  const intersections:[number,number][]=[]
  for(const x of [-48,0,48])for(const z of [-48,0,48])intersections.push([x,z])
  const crosswalkGeometry=new THREE.BoxGeometry(1.05,.035,4.4)
  const crosswalkMaterial=new THREE.MeshBasicMaterial({color:0xe8e3cf})
  const crosswalkStripes=new THREE.InstancedMesh(crosswalkGeometry,crosswalkMaterial,intersections.length*8)
  let stripeIndex=0
  for(const [x,z] of intersections){
    for(let i=-2;i<=1;i++){
      matrix.position.set(x+i*1.55,.11,z-7.4)
      matrix.rotation.set(0,0,0)
      matrix.scale.set(1,1,1)
      matrix.updateMatrix()
      crosswalkStripes.setMatrixAt(stripeIndex++,matrix.matrix)
      matrix.position.set(x-7.4,.11,z+i*1.55)
      matrix.rotation.set(0,Math.PI/2,0)
      matrix.updateMatrix()
      crosswalkStripes.setMatrixAt(stripeIndex++,matrix.matrix)
    }
  }
  crosswalkStripes.instanceMatrix.needsUpdate=true
  crosswalkStripes.name='streetverse-mobile-crosswalks'
  root.add(crosswalkStripes)

  const parkedPositions:{x:number;z:number;rotation:number}[]=[
    {x:-72,z:-41,rotation:0},{x:-54,z:-41,rotation:0},{x:-24,z:-41,rotation:0},{x:20,z:-41,rotation:0},{x:55,z:-41,rotation:0},{x:73,z:-41,rotation:0},
    {x:-69,z:41,rotation:Math.PI},{x:-39,z:41,rotation:Math.PI},{x:-5,z:41,rotation:Math.PI},{x:27,z:41,rotation:Math.PI},{x:61,z:41,rotation:Math.PI},
    {x:-41,z:-72,rotation:Math.PI/2},{x:-41,z:-22,rotation:Math.PI/2},{x:-41,z:24,rotation:Math.PI/2},{x:41,z:-62,rotation:-Math.PI/2},{x:41,z:-17,rotation:-Math.PI/2},{x:41,z:27,rotation:-Math.PI/2},{x:41,z:68,rotation:-Math.PI/2},
  ]
  const carBodyGeometry=new THREE.BoxGeometry(4.25,.78,1.95)
  const carCabinGeometry=new THREE.BoxGeometry(2.05,.62,1.6)
  const carBodyMaterial=new THREE.MeshLambertMaterial({color:0xffffff})
  const carCabinMaterial=new THREE.MeshLambertMaterial({color:0x203247})
  const parkedBodies=new THREE.InstancedMesh(carBodyGeometry,carBodyMaterial,parkedPositions.length)
  const parkedCabins=new THREE.InstancedMesh(carCabinGeometry,carCabinMaterial,parkedPositions.length)
  parkedPositions.forEach((p,i)=>{
    matrix.position.set(p.x,.62,p.z);matrix.rotation.set(0,p.rotation,0);matrix.scale.set(1,1,1);matrix.updateMatrix();parkedBodies.setMatrixAt(i,matrix.matrix)
    tint.setHex(CAR_COLORS[i%CAR_COLORS.length]);parkedBodies.setColorAt(i,tint)
    matrix.position.set(p.x,.98,p.z);matrix.updateMatrix();parkedCabins.setMatrixAt(i,matrix.matrix)
  })
  parkedBodies.instanceMatrix.needsUpdate=true;parkedCabins.instanceMatrix.needsUpdate=true
  if(parkedBodies.instanceColor)parkedBodies.instanceColor.needsUpdate=true
  parkedBodies.name='streetverse-mobile-parked-car-bodies';parkedCabins.name='streetverse-mobile-parked-car-cabins'
  root.add(parkedBodies,parkedCabins)

  const blockCenters:[number,number][]=[[-70,-70],[-70,-25],[-70,25],[-70,70],[-25,-70],[-25,-25],[-25,25],[-25,70],[25,-70],[25,-25],[25,25],[25,70],[70,-70],[70,-25],[70,25],[70,70]]
  const storefrontGeometry=new THREE.BoxGeometry(6.4,1.05,.42)
  const storefrontMaterial=new THREE.MeshBasicMaterial({color:0x7fd9ff})
  const storefronts=new THREE.InstancedMesh(storefrontGeometry,storefrontMaterial,blockCenters.length)
  blockCenters.forEach(([x,z],i)=>{
    const faceSouth=Math.abs(z)>=Math.abs(x)
    if(faceSouth){matrix.position.set(x,2.25,z+(z>0?-8.15:8.15));matrix.rotation.set(0,0,0)}
    else{matrix.position.set(x+(x>0?-8.15:8.15),2.25,z);matrix.rotation.set(0,Math.PI/2,0)}
    matrix.scale.set(.84+(i%3)*.08,1,1);matrix.updateMatrix();storefronts.setMatrixAt(i,matrix.matrix)
    tint.setHex(i%3===0?0xffc769:i%3===1?0x6ee7ff:0xff7db2);storefronts.setColorAt(i,tint)
  })
  storefronts.instanceMatrix.needsUpdate=true
  if(storefronts.instanceColor)storefronts.instanceColor.needsUpdate=true
  storefronts.name='streetverse-mobile-storefronts'
  root.add(storefronts)

  const propPositions:[number,number][]=[
    [-58,-54],[-28,-54],[-8,-54],[22,-54],[54,-54],[-58,-12],[-28,-12],[22,-12],[54,-12],[-58,12],[-28,12],[22,12],[54,12],
    [-58,54],[-28,54],[-8,54],[22,54],[54,54],[-54,-28],[-54,28],[54,-28],[54,28],[-12,-58],[12,-58],[-12,58],[12,58],
  ]
  const propGeometry=new THREE.CylinderGeometry(.14,.19,.82,6)
  const propMaterial=new THREE.MeshLambertMaterial({color:0xc64032})
  const streetProps=new THREE.InstancedMesh(propGeometry,propMaterial,propPositions.length)
  propPositions.forEach(([x,z],i)=>{matrix.position.set(x,.47,z);matrix.rotation.set(0,(i%6)*.35,0);matrix.scale.set(1,1,1);matrix.updateMatrix();streetProps.setMatrixAt(i,matrix.matrix)})
  streetProps.instanceMatrix.needsUpdate=true
  streetProps.name='streetverse-mobile-curb-props'
  root.add(streetProps)

  const crowdCount=28
  const crowdRoutes:CrowdRoute[]=Array.from({length:crowdCount},(_,i)=>({
    axis:i%2===0?'x':'z',
    fixed:[-57,-39,-9,9,39,57][i%6],
    phase:(i*19)%150,
    speed:3.6+(i%5)*.42,
  }))
  const crowdBodyGeometry=new THREE.BoxGeometry(.62,1.5,.42)
  const crowdHeadGeometry=new THREE.SphereGeometry(.26,7,5)
  const crowdBodyMaterial=new THREE.MeshLambertMaterial({color:0xffffff})
  const crowdHeadMaterial=new THREE.MeshLambertMaterial({color:0xffffff})
  const crowdBodies=new THREE.InstancedMesh(crowdBodyGeometry,crowdBodyMaterial,crowdCount)
  const crowdHeads=new THREE.InstancedMesh(crowdHeadGeometry,crowdHeadMaterial,crowdCount)
  crowdRoutes.forEach((_,i)=>{
    tint.setHex(BODY_COLORS[i%BODY_COLORS.length]);crowdBodies.setColorAt(i,tint)
    tint.setHex(SKIN_COLORS[i%SKIN_COLORS.length]);crowdHeads.setColorAt(i,tint)
  })
  if(crowdBodies.instanceColor)crowdBodies.instanceColor.needsUpdate=true
  if(crowdHeads.instanceColor)crowdHeads.instanceColor.needsUpdate=true
  crowdBodies.name='streetverse-mobile-ambient-crowd-bodies';crowdHeads.name='streetverse-mobile-ambient-crowd-heads'
  root.add(crowdBodies,crowdHeads)

  const updateCrowd=(nowMs:number)=>{
    const time=nowMs/1000
    const span=154,cycle=span*2
    crowdRoutes.forEach((route,i)=>{
      const distance=(time*route.speed+route.phase)%cycle
      const forward=distance<=span
      const along=-77+(forward?distance:cycle-distance)
      const x=route.axis==='x'?along:route.fixed
      const z=route.axis==='x'?route.fixed:along
      const heading=route.axis==='x'?(forward?Math.PI/2:-Math.PI/2):(forward?0:Math.PI)
      const bob=Math.sin(time*5.2+i*.8)*.035
      matrix.position.set(x,.9+bob,z);matrix.rotation.set(0,heading,0);matrix.scale.set(1,1,1);matrix.updateMatrix();crowdBodies.setMatrixAt(i,matrix.matrix)
      matrix.position.set(x,1.86+bob,z);matrix.updateMatrix();crowdHeads.setMatrixAt(i,matrix.matrix)
    })
    crowdBodies.instanceMatrix.needsUpdate=true
    crowdHeads.instanceMatrix.needsUpdate=true
  }
  updateCrowd(performance.now())

  const counts:StreetVerseChicagoAliveCounts={
    ambientResidents:crowdCount,
    parkedVehicles:parkedPositions.length,
    storefronts:blockCenters.length,
    streetProps:propPositions.length,
    crosswalkStripes:stripeIndex,
  }

  window.dispatchEvent(new CustomEvent('tryamm:streetverse-chicago-alive-ready',{detail:{...counts,mobile:true,instanced:true,visualDensity:'alive-v1'}}))

  return{
    counts,
    tick:updateCrowd,
    dispose:()=>{
      root.removeFromParent()
      ;[crosswalkStripes,parkedBodies,parkedCabins,storefronts,streetProps,crowdBodies,crowdHeads].forEach(disposeMesh)
    },
  }
}
