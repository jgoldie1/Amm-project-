import * as THREE from 'three'

export type StreetVerseTrafficAxis='x'|'z'
export type StreetVerseTrafficDirection=1|-1
export type StreetVerseSignalState='green'|'yellow'|'red'

export type StreetVerseChicagoTrafficLifeCounts={
  intersections:number
  signalHeads:number
  signalPoles:number
}

export type StreetVerseChicagoTrafficLifeRuntime={
  counts:StreetVerseChicagoTrafficLifeCounts
  tick:(nowMs:number)=>void
  getSignalState:(axis:StreetVerseTrafficAxis,nowMs:number)=>StreetVerseSignalState
  getTrafficMultiplier:(axis:StreetVerseTrafficAxis,coordinate:number,direction:StreetVerseTrafficDirection,nowMs:number)=>number
  dispose:()=>void
}

const INTERSECTIONS=[-48,0,48]
const SIGNAL_CYCLE_SECONDS=24
const GREEN=0x39d86f
const YELLOW=0xffd34f
const RED=0xef4d4d
const DIM=0x293038

function phaseSecond(nowMs:number){
  return (nowMs/1000)%SIGNAL_CYCLE_SECONDS
}

function signalState(axis:StreetVerseTrafficAxis,nowMs:number):StreetVerseSignalState{
  const second=phaseSecond(nowMs)
  if(axis==='x'){
    if(second<9)return 'green'
    if(second<11)return 'yellow'
    return 'red'
  }
  if(second<12)return 'red'
  if(second<21)return 'green'
  if(second<23)return 'yellow'
  return 'red'
}

function nextIntersectionDistance(coordinate:number,direction:StreetVerseTrafficDirection){
  let best=Infinity
  for(const intersection of INTERSECTIONS){
    const distance=direction>0?intersection-coordinate:coordinate-intersection
    if(distance>=0&&distance<best)best=distance
  }
  return best
}

function signalColor(state:StreetVerseSignalState){
  if(state==='green')return GREEN
  if(state==='yellow')return YELLOW
  return RED
}

export function createStreetVerseChicagoTrafficLife(scene:THREE.Scene):StreetVerseChicagoTrafficLifeRuntime{
  const root=new THREE.Group()
  root.name='streetverse-chicago-traffic-life-pass-4'
  scene.add(root)

  const signalSpots:{x:number;z:number;axis:StreetVerseTrafficAxis;rotation:number}[]=[]
  for(const x of INTERSECTIONS)for(const z of INTERSECTIONS){
    signalSpots.push(
      {x:x-8.2,z:z-5.5,axis:'x',rotation:0},
      {x:x+8.2,z:z+5.5,axis:'x',rotation:Math.PI},
      {x:x-5.5,z:z+8.2,axis:'z',rotation:Math.PI/2},
      {x:x+5.5,z:z-8.2,axis:'z',rotation:-Math.PI/2},
    )
  }

  const matrix=new THREE.Object3D()
  const color=new THREE.Color()

  const poleGeometry=new THREE.CylinderGeometry(.07,.09,3.7,6)
  const poleMaterial=new THREE.MeshLambertMaterial({color:0x2d3339})
  const poles=new THREE.InstancedMesh(poleGeometry,poleMaterial,signalSpots.length)

  const headGeometry=new THREE.BoxGeometry(.62,1.25,.48)
  const headMaterial=new THREE.MeshBasicMaterial({color:0xffffff,vertexColors:true})
  const heads=new THREE.InstancedMesh(headGeometry,headMaterial,signalSpots.length)

  signalSpots.forEach((spot,i)=>{
    matrix.position.set(spot.x,1.85,spot.z)
    matrix.rotation.set(0,spot.rotation,0)
    matrix.scale.set(1,1,1)
    matrix.updateMatrix()
    poles.setMatrixAt(i,matrix.matrix)

    matrix.position.set(spot.x,3.45,spot.z)
    matrix.updateMatrix()
    heads.setMatrixAt(i,matrix.matrix)
    heads.setColorAt(i,color.setHex(DIM))
  })
  poles.instanceMatrix.needsUpdate=true
  heads.instanceMatrix.needsUpdate=true
  if(heads.instanceColor)heads.instanceColor.needsUpdate=true
  poles.name='streetverse-mobile-traffic-signal-poles'
  heads.name='streetverse-mobile-traffic-signal-heads'
  root.add(poles,heads)

  let lastX:StreetVerseSignalState|null=null
  let lastZ:StreetVerseSignalState|null=null

  const tick=(nowMs:number)=>{
    const xState=signalState('x',nowMs)
    const zState=signalState('z',nowMs)
    if(xState===lastX&&zState===lastZ)return

    signalSpots.forEach((spot,i)=>{
      const state=spot.axis==='x'?xState:zState
      heads.setColorAt(i,color.setHex(signalColor(state)))
    })
    if(heads.instanceColor)heads.instanceColor.needsUpdate=true

    if(xState!==lastX||zState!==lastZ){
      lastX=xState
      lastZ=zState
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-traffic-signal-state',{
        detail:{horizontal:xState,vertical:zState,cycleSeconds:SIGNAL_CYCLE_SECONDS,simulated:true},
      }))
    }
  }

  const getTrafficMultiplier=(
    axis:StreetVerseTrafficAxis,
    coordinate:number,
    direction:StreetVerseTrafficDirection,
    nowMs:number,
  )=>{
    const state=signalState(axis,nowMs)
    if(state==='green')return 1
    const distance=nextIntersectionDistance(coordinate,direction)
    if(!Number.isFinite(distance))return 1
    if(state==='yellow'){
      if(distance<3.2)return .18
      if(distance<8)return .55
      return 1
    }
    if(distance<3.6)return 0
    if(distance<8.5)return .28
    if(distance<13)return .62
    return 1
  }

  tick(performance.now())

  const counts:StreetVerseChicagoTrafficLifeCounts={
    intersections:INTERSECTIONS.length*INTERSECTIONS.length,
    signalHeads:signalSpots.length,
    signalPoles:signalSpots.length,
  }

  window.dispatchEvent(new CustomEvent('tryamm:streetverse-chicago-traffic-life-ready',{
    detail:{...counts,trafficObeysSignals:true,mobile:true,instanced:true,cycleSeconds:SIGNAL_CYCLE_SECONDS},
  }))

  return{
    counts,
    tick,
    getSignalState:signalState,
    getTrafficMultiplier,
    dispose(){
      root.removeFromParent()
      poleGeometry.dispose()
      headGeometry.dispose()
      poleMaterial.dispose()
      headMaterial.dispose()
    },
  }
}
