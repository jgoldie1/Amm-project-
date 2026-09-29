import * as THREE from 'three'

type WeatherLighting={
  sky:number
  fog:number
  lightMultiplier:number
}

export type StreetVerseChicagoVisualLifeCounts={
  facadeAccents:number
  awnings:number
  benches:number
  curbBins:number
  busShelters:number
  streetSigns:number
  socialResidents:number
}

export type StreetVerseChicagoVisualLifeRuntime={
  counts:StreetVerseChicagoVisualLifeCounts
  tick:(nowMs:number,weather:WeatherLighting)=>void
  dispose:()=>void
}

const BLOCKS:[number,number][]=[
  [-70,-70],[-70,-25],[-70,25],[-70,70],
  [-25,-70],[-25,-25],[-25,25],[-25,70],
  [25,-70],[25,-25],[25,25],[25,70],
  [70,-70],[70,-25],[70,25],[70,70],
]

const SOCIAL_SPOTS:[number,number,number][]=[
  [-30,-31,0],[-27,-30,Math.PI],[-21,-30,Math.PI/2],
  [30,-22,0],[34,-23,Math.PI],[38,-22,-Math.PI/2],
  [20,13,0],[23,12,Math.PI],[26,13,Math.PI/2],
  [-52,40,0],[-49,39,Math.PI],[-46,40,-Math.PI/2],
]

const BODY_COLORS=[0x3d8cd9,0xc44c70,0x4d9b62,0xd28b3d,0x7658b7,0x46a0a0]
const SKIN_COLORS=[0x5c3525,0x784a33,0x9b6547,0xb97a57,0xd3966f,0xe0ac87]

function materialList(material:THREE.Material|THREE.Material[]){
  return Array.isArray(material)?material:[material]
}

function disposeInstanced(mesh:THREE.InstancedMesh){
  mesh.geometry.dispose()
  materialList(mesh.material).forEach(material=>material.dispose())
}

function hourFromDate(nowMs:number){
  const date=new Date(nowMs)
  return date.getHours()+date.getMinutes()/60
}

function lightingForHour(hour:number){
  if(hour>=7&&hour<17)return {nightBlend:0,sun:1,hemi:1,glow:.32}
  if(hour>=17&&hour<20)return {nightBlend:(hour-17)/3*.62,sun:.82,hemi:.94,glow:.62}
  if(hour>=5&&hour<7)return {nightBlend:(7-hour)/2*.46,sun:.86,hemi:.95,glow:.5}
  return {nightBlend:.78,sun:.62,hemi:.86,glow:1}
}

export function createStreetVerseChicagoVisualLife(
  scene:THREE.Scene,
  hemi:THREE.HemisphereLight,
  sun:THREE.DirectionalLight,
):StreetVerseChicagoVisualLifeRuntime{
  const root=new THREE.Group()
  root.name='streetverse-chicago-visual-life-pass-3'
  scene.add(root)

  const matrix=new THREE.Object3D()
  const tint=new THREE.Color()

  const facadeGeometry=new THREE.BoxGeometry(3.6,.34,.16)
  const facadeMaterial=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.58,metalness:.08,vertexColors:true})
  const facadeAccents=new THREE.InstancedMesh(facadeGeometry,facadeMaterial,BLOCKS.length*3)
  let facadeIndex=0
  BLOCKS.forEach(([x,z],i)=>{
    for(let level=0;level<3;level++){
      matrix.position.set(x,3.6+level*3.25,z+8.55)
      matrix.rotation.set(0,0,0)
      matrix.scale.set(.86+(i%3)*.08,1,1)
      matrix.updateMatrix()
      facadeAccents.setMatrixAt(facadeIndex,matrix.matrix)
      tint.setHex((i+level)%3===0?0xbac8d0:(i+level)%3===1?0x8ea7b8:0x756f68)
      facadeAccents.setColorAt(facadeIndex,tint)
      facadeIndex++
    }
  })
  facadeAccents.instanceMatrix.needsUpdate=true
  if(facadeAccents.instanceColor)facadeAccents.instanceColor.needsUpdate=true
  facadeAccents.name='streetverse-mobile-facade-accents'
  root.add(facadeAccents)

  const awningGeometry=new THREE.BoxGeometry(5.8,.28,1.45)
  const awningMaterial=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.62,metalness:.06,vertexColors:true})
  const awnings=new THREE.InstancedMesh(awningGeometry,awningMaterial,BLOCKS.length)
  BLOCKS.forEach(([x,z],i)=>{
    matrix.position.set(x,3.25,z+8.7)
    matrix.rotation.set(0,0,0)
    matrix.scale.set(.88+(i%4)*.035,1,1)
    matrix.updateMatrix()
    awnings.setMatrixAt(i,matrix.matrix)
    tint.setHex([0x234d73,0x8d3e4b,0x2f7047,0x8b6533][i%4])
    awnings.setColorAt(i,tint)
  })
  awnings.instanceMatrix.needsUpdate=true
  if(awnings.instanceColor)awnings.instanceColor.needsUpdate=true
  awnings.name='streetverse-mobile-storefront-awnings'
  root.add(awnings)

  const glowGeometry=new THREE.BoxGeometry(4.9,.78,.07)
  const glowMaterial=new THREE.MeshBasicMaterial({color:0x9adfff,transparent:true,opacity:.42,depthWrite:false})
  const storefrontGlow=new THREE.InstancedMesh(glowGeometry,glowMaterial,BLOCKS.length)
  BLOCKS.forEach(([x,z],i)=>{
    matrix.position.set(x,2.15,z+8.93)
    matrix.rotation.set(0,0,0)
    matrix.scale.set(.88+(i%3)*.05,1,1)
    matrix.updateMatrix()
    storefrontGlow.setMatrixAt(i,matrix.matrix)
    tint.setHex(i%3===0?0xffc768:i%3===1?0x77d8ff:0xff7db2)
    storefrontGlow.setColorAt(i,tint)
  })
  storefrontGlow.instanceMatrix.needsUpdate=true
  if(storefrontGlow.instanceColor)storefrontGlow.instanceColor.needsUpdate=true
  storefrontGlow.name='streetverse-mobile-storefront-glow'
  root.add(storefrontGlow)

  const benchPositions:[number,number,number][]=[
    [-58,-58,0],[-28,-58,0],[28,-58,0],[58,-58,0],
    [-58,58,Math.PI],[-28,58,Math.PI],[28,58,Math.PI],[58,58,Math.PI],
    [-58,-12,Math.PI/2],[-58,12,Math.PI/2],[58,-12,-Math.PI/2],[58,12,-Math.PI/2],
  ]
  const benchGeometry=new THREE.BoxGeometry(3.2,.34,.78)
  const benchMaterial=new THREE.MeshLambertMaterial({color:0x4a3326})
  const benches=new THREE.InstancedMesh(benchGeometry,benchMaterial,benchPositions.length)
  benchPositions.forEach(([x,z,r],i)=>{
    matrix.position.set(x,.58,z);matrix.rotation.set(0,r,0);matrix.scale.set(1,1,1);matrix.updateMatrix();benches.setMatrixAt(i,matrix.matrix)
  })
  benches.instanceMatrix.needsUpdate=true
  benches.name='streetverse-mobile-benches'
  root.add(benches)

  const binPositions:[number,number][]=[
    [-61,-57],[-31,-57],[31,-57],[61,-57],[-61,57],[-31,57],[31,57],[61,57],
    [-57,-31],[-57,31],[57,-31],[57,31],
  ]
  const binGeometry=new THREE.CylinderGeometry(.32,.38,.92,8)
  const binMaterial=new THREE.MeshLambertMaterial({color:0x30373d})
  const bins=new THREE.InstancedMesh(binGeometry,binMaterial,binPositions.length)
  binPositions.forEach(([x,z],i)=>{matrix.position.set(x,.5,z);matrix.rotation.set(0,i*.27,0);matrix.scale.set(1,1,1);matrix.updateMatrix();bins.setMatrixAt(i,matrix.matrix)})
  bins.instanceMatrix.needsUpdate=true
  bins.name='streetverse-mobile-curb-bins'
  root.add(bins)

  const shelterSpots:[number,number,number][]=[
    [-42,-58,0],[42,-58,0],[-42,58,Math.PI],[42,58,Math.PI],[-58,26,Math.PI/2],[58,-26,-Math.PI/2],
  ]
  const shelterRoofGeometry=new THREE.BoxGeometry(5.4,.22,2.2)
  const shelterSideGeometry=new THREE.BoxGeometry(.18,3.1,2.05)
  const shelterRoofMaterial=new THREE.MeshStandardMaterial({color:0x44515b,roughness:.48,metalness:.38})
  const shelterSideMaterial=new THREE.MeshStandardMaterial({color:0x77b8d0,roughness:.2,metalness:.08,transparent:true,opacity:.34})
  const shelterRoofs=new THREE.InstancedMesh(shelterRoofGeometry,shelterRoofMaterial,shelterSpots.length)
  const shelterSides=new THREE.InstancedMesh(shelterSideGeometry,shelterSideMaterial,shelterSpots.length)
  shelterSpots.forEach(([x,z,r],i)=>{
    matrix.position.set(x,3.25,z);matrix.rotation.set(0,r,0);matrix.scale.set(1,1,1);matrix.updateMatrix();shelterRoofs.setMatrixAt(i,matrix.matrix)
    matrix.position.set(x+(Math.cos(r)*-2.5),1.7,z+(Math.sin(r)*2.5));matrix.updateMatrix();shelterSides.setMatrixAt(i,matrix.matrix)
  })
  shelterRoofs.instanceMatrix.needsUpdate=true;shelterSides.instanceMatrix.needsUpdate=true
  shelterRoofs.name='streetverse-mobile-bus-shelter-roofs';shelterSides.name='streetverse-mobile-bus-shelter-sides'
  root.add(shelterRoofs,shelterSides)

  const signSpots:[number,number,number][]=[
    [-54,-54,0],[-6,-54,0],[54,-54,0],[-54,-6,Math.PI/2],[54,-6,-Math.PI/2],
    [-54,54,Math.PI],[-6,54,Math.PI],[54,54,Math.PI],[-54,6,Math.PI/2],[54,6,-Math.PI/2],
    [-6,-6,0],[6,6,Math.PI],
  ]
  const signPoleGeometry=new THREE.CylinderGeometry(.06,.08,3.2,6)
  const signBoardGeometry=new THREE.BoxGeometry(1.8,.62,.1)
  const signPoleMaterial=new THREE.MeshLambertMaterial({color:0x353b42})
  const signBoardMaterial=new THREE.MeshBasicMaterial({color:0x1f6a4b})
  const signPoles=new THREE.InstancedMesh(signPoleGeometry,signPoleMaterial,signSpots.length)
  const signBoards=new THREE.InstancedMesh(signBoardGeometry,signBoardMaterial,signSpots.length)
  signSpots.forEach(([x,z,r],i)=>{
    matrix.position.set(x,1.6,z);matrix.rotation.set(0,r,0);matrix.scale.set(1,1,1);matrix.updateMatrix();signPoles.setMatrixAt(i,matrix.matrix)
    matrix.position.set(x,3.1,z);matrix.updateMatrix();signBoards.setMatrixAt(i,matrix.matrix)
  })
  signPoles.instanceMatrix.needsUpdate=true;signBoards.instanceMatrix.needsUpdate=true
  signPoles.name='streetverse-mobile-street-sign-poles';signBoards.name='streetverse-mobile-street-sign-boards'
  root.add(signPoles,signBoards)

  const socialBodyGeometry=new THREE.BoxGeometry(.64,1.5,.44)
  const socialHeadGeometry=new THREE.SphereGeometry(.27,7,5)
  const socialBodyMaterial=new THREE.MeshLambertMaterial({color:0xffffff})
  const socialHeadMaterial=new THREE.MeshLambertMaterial({color:0xffffff})
  const socialBodies=new THREE.InstancedMesh(socialBodyGeometry,socialBodyMaterial,SOCIAL_SPOTS.length)
  const socialHeads=new THREE.InstancedMesh(socialHeadGeometry,socialHeadMaterial,SOCIAL_SPOTS.length)
  SOCIAL_SPOTS.forEach((_,i)=>{
    tint.setHex(BODY_COLORS[i%BODY_COLORS.length]);socialBodies.setColorAt(i,tint)
    tint.setHex(SKIN_COLORS[i%SKIN_COLORS.length]);socialHeads.setColorAt(i,tint)
  })
  if(socialBodies.instanceColor)socialBodies.instanceColor.needsUpdate=true
  if(socialHeads.instanceColor)socialHeads.instanceColor.needsUpdate=true
  socialBodies.name='streetverse-mobile-social-resident-bodies';socialHeads.name='streetverse-mobile-social-resident-heads'
  root.add(socialBodies,socialHeads)

  let forcedHour:number|null=null
  const onTime=(event:Event)=>{
    const detail=(event as CustomEvent<{hour?:number}>).detail||{}
    const value=Number(detail.hour)
    forcedHour=Number.isFinite(value)?THREE.MathUtils.euclideanModulo(value,24):null
  }
  window.addEventListener('tryamm:streetverse-time-of-day',onTime)

  const skyColor=new THREE.Color()
  const nightColor=new THREE.Color(0x07101d)
  const fogColor=new THREE.Color()

  const tick=(nowMs:number,weather:WeatherLighting)=>{
    const hour=forcedHour??hourFromDate(nowMs)
    const lighting=lightingForHour(hour)
    glowMaterial.opacity=.3+lighting.glow*.58

    skyColor.setHex(weather.sky).lerp(nightColor,lighting.nightBlend)
    scene.background=skyColor
    if(scene.fog instanceof THREE.FogExp2){
      fogColor.setHex(weather.fog).lerp(nightColor,lighting.nightBlend*.78)
      scene.fog.color.copy(fogColor)
    }
    sun.intensity=1.8*weather.lightMultiplier*lighting.sun
    hemi.intensity=2.2*weather.lightMultiplier*lighting.hemi

    const time=nowMs/1000
    SOCIAL_SPOTS.forEach(([x,z,baseRotation],i)=>{
      const turn=Math.sin(time*.34+i*.9)*.22
      const bob=Math.sin(time*3.2+i*.73)*.02
      matrix.position.set(x,.92+bob,z);matrix.rotation.set(0,baseRotation+turn,0);matrix.scale.set(1,1,1);matrix.updateMatrix();socialBodies.setMatrixAt(i,matrix.matrix)
      matrix.position.set(x,1.88+bob,z);matrix.updateMatrix();socialHeads.setMatrixAt(i,matrix.matrix)
    })
    socialBodies.instanceMatrix.needsUpdate=true
    socialHeads.instanceMatrix.needsUpdate=true
  }

  const counts:StreetVerseChicagoVisualLifeCounts={
    facadeAccents:facadeIndex,
    awnings:BLOCKS.length,
    benches:benchPositions.length,
    curbBins:binPositions.length,
    busShelters:shelterSpots.length,
    streetSigns:signSpots.length,
    socialResidents:SOCIAL_SPOTS.length,
  }

  window.dispatchEvent(new CustomEvent('tryamm:streetverse-chicago-visual-pass-3-ready',{detail:{...counts,nightLighting:true,mobile:true,instanced:true}}))

  return{
    counts,
    tick,
    dispose:()=>{
      window.removeEventListener('tryamm:streetverse-time-of-day',onTime)
      root.removeFromParent()
      ;[
        facadeAccents,awnings,storefrontGlow,benches,bins,
        shelterRoofs,shelterSides,signPoles,signBoards,socialBodies,socialHeads,
      ].forEach(disposeInstanced)
    },
  }
}
