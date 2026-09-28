import * as THREE from 'three'
import type {StreetVerseSignalState,StreetVerseTrafficAxis} from './StreetVerseChicagoTrafficLifeRuntime'

export type StreetVerseRoutineKind='commuter'|'shopper'|'delivery'|'visitor'

type CrossingResident={
  axis:'x'|'z'
  trafficAxis:StreetVerseTrafficAxis
  fixed:number
  center:number
  coordinate:number
  direction:1|-1
  inCrossing:boolean
  dwellUntil:number
  routine:StreetVerseRoutineKind
  phase:number
}

export type StreetVerseChicagoPedestrianRoutineCounts={
  crossingResidents:number
  walkSignals:number
  signalizedCrossings:number
  routineTypes:number
}

export type StreetVerseChicagoPedestrianRoutineRuntime={
  counts:StreetVerseChicagoPedestrianRoutineCounts
  tick:(nowMs:number)=>void
  dispose:()=>void
}

const INTERSECTIONS=[-48,0,48]
const BODY_COLORS=[0x3f8fd7,0xc44f71,0x3fa261,0xd28b3e,0x7959b8,0x45a1a0]
const SKIN_COLORS=[0x5c3525,0x784a33,0x9b6547,0xb97a57,0xd3966f,0xe0ac87]
const ROUTINES:StreetVerseRoutineKind[]=['commuter','shopper','delivery','visitor']

function disposeInstanced(mesh:THREE.InstancedMesh){
  mesh.geometry.dispose()
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material]
  materials.forEach(material=>material.dispose())
}

export function createStreetVerseChicagoPedestrianRoutines(
  scene:THREE.Scene,
  getSignalState:(axis:StreetVerseTrafficAxis,nowMs:number)=>StreetVerseSignalState,
):StreetVerseChicagoPedestrianRoutineRuntime{
  const root=new THREE.Group()
  root.name='streetverse-chicago-pedestrian-routines-pass-6'
  scene.add(root)

  const residents:CrossingResident[]=[]
  let routeIndex=0
  for(const x of INTERSECTIONS)for(const z of INTERSECTIONS){
    residents.push({
      axis:'z',
      trafficAxis:'x',
      fixed:x-3.2,
      center:z,
      coordinate:z-12,
      direction:1,
      inCrossing:false,
      dwellUntil:0,
      routine:ROUTINES[routeIndex%ROUTINES.length],
      phase:routeIndex*.63,
    })
    routeIndex++
    residents.push({
      axis:'x',
      trafficAxis:'z',
      fixed:z+3.2,
      center:x,
      coordinate:x+12,
      direction:-1,
      inCrossing:false,
      dwellUntil:0,
      routine:ROUTINES[routeIndex%ROUTINES.length],
      phase:routeIndex*.63,
    })
    routeIndex++
  }

  const matrix=new THREE.Object3D()
  const tint=new THREE.Color()

  const bodyGeometry=new THREE.BoxGeometry(.62,1.48,.44)
  const headGeometry=new THREE.SphereGeometry(.27,7,5)
  const parcelGeometry=new THREE.BoxGeometry(.34,.28,.28)
  const bodyMaterial=new THREE.MeshLambertMaterial({color:0xffffff})
  const headMaterial=new THREE.MeshLambertMaterial({color:0xffffff})
  const parcelMaterial=new THREE.MeshLambertMaterial({color:0xc79345})
  const bodies=new THREE.InstancedMesh(bodyGeometry,bodyMaterial,residents.length)
  const heads=new THREE.InstancedMesh(headGeometry,headMaterial,residents.length)
  const parcels=new THREE.InstancedMesh(parcelGeometry,parcelMaterial,residents.length)

  residents.forEach((resident,i)=>{
    tint.setHex(BODY_COLORS[i%BODY_COLORS.length]);bodies.setColorAt(i,tint)
    tint.setHex(SKIN_COLORS[i%SKIN_COLORS.length]);heads.setColorAt(i,tint)
    matrix.position.set(0,-50,0);matrix.rotation.set(0,0,0);matrix.scale.set(0,0,0);matrix.updateMatrix();parcels.setMatrixAt(i,matrix.matrix)
  })
  if(bodies.instanceColor)bodies.instanceColor.needsUpdate=true
  if(heads.instanceColor)heads.instanceColor.needsUpdate=true
  parcels.instanceMatrix.needsUpdate=true
  bodies.name='streetverse-mobile-crossing-resident-bodies'
  heads.name='streetverse-mobile-crossing-resident-heads'
  parcels.name='streetverse-mobile-crossing-resident-parcels'
  root.add(bodies,heads,parcels)

  const walkSignalSpots:{x:number;z:number;trafficAxis:StreetVerseTrafficAxis}[]=[]
  for(const x of INTERSECTIONS)for(const z of INTERSECTIONS){
    walkSignalSpots.push(
      {x:x-5.4,z:z-8.5,trafficAxis:'x'},
      {x:x+8.5,z:z+5.4,trafficAxis:'z'},
    )
  }
  const walkGeometry=new THREE.BoxGeometry(.42,.58,.14)
  const walkMaterial=new THREE.MeshBasicMaterial({color:0xffffff,vertexColors:true})
  const walkSignals=new THREE.InstancedMesh(walkGeometry,walkMaterial,walkSignalSpots.length)
  walkSignalSpots.forEach((spot,i)=>{
    matrix.position.set(spot.x,2.5,spot.z)
    matrix.rotation.set(0,spot.trafficAxis==='x'?0:Math.PI/2,0)
    matrix.scale.set(1,1,1)
    matrix.updateMatrix()
    walkSignals.setMatrixAt(i,matrix.matrix)
    walkSignals.setColorAt(i,tint.setHex(0xef4d4d))
  })
  walkSignals.instanceMatrix.needsUpdate=true
  if(walkSignals.instanceColor)walkSignals.instanceColor.needsUpdate=true
  walkSignals.name='streetverse-mobile-pedestrian-walk-signals'
  root.add(walkSignals)

  let lastTime=performance.now()
  let lastSignalKey=''
  let telemetryAt=0

  const tick=(nowMs:number)=>{
    const dt=Math.min(.05,Math.max(0,(nowMs-lastTime)/1000))
    lastTime=nowMs

    const xSafe=getSignalState('x',nowMs)==='red'
    const zSafe=getSignalState('z',nowMs)==='red'
    const signalKey=`${xSafe?'walk':'stop'}:${zSafe?'walk':'stop'}`
    if(signalKey!==lastSignalKey){
      lastSignalKey=signalKey
      walkSignalSpots.forEach((spot,i)=>{
        const safe=spot.trafficAxis==='x'?xSafe:zSafe
        walkSignals.setColorAt(i,tint.setHex(safe?0x45e27d:0xef4d4d))
      })
      if(walkSignals.instanceColor)walkSignals.instanceColor.needsUpdate=true
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-pedestrian-signal-state',{
        detail:{eastWestCrossing:xSafe?'walk':'stop',northSouthCrossing:zSafe?'walk':'stop'},
      }))
    }

    let waiting=0
    let crossing=0

    residents.forEach((resident,i)=>{
      const safe=getSignalState(resident.trafficAxis,nowMs)==='red'
      const local=resident.coordinate-resident.center
      const approachingCurb=resident.direction>0
        ? local>=-9.2&&local<-7.7
        : local<=9.2&&local>7.7
      const insideCrossing=Math.abs(local)<=8.2

      if(resident.inCrossing&&Math.abs(local)>=8.25)resident.inCrossing=false
      if(!resident.inCrossing&&safe&&approachingCurb)resident.inCrossing=true

      const mustWait=nowMs<resident.dwellUntil||(!resident.inCrossing&&!safe&&approachingCurb)
      if(mustWait)waiting++
      else{
        const baseSpeed=resident.routine==='commuter'?1.9:resident.routine==='delivery'?1.72:resident.routine==='shopper'?1.48:1.58
        resident.coordinate+=resident.direction*baseSpeed*dt
      }

      const endLocal=resident.coordinate-resident.center
      if(endLocal>12.2){
        resident.coordinate=resident.center+12.2
        resident.direction=-1
        resident.inCrossing=false
        resident.dwellUntil=nowMs+1200+(i%4)*260
      }else if(endLocal<-12.2){
        resident.coordinate=resident.center-12.2
        resident.direction=1
        resident.inCrossing=false
        resident.dwellUntil=nowMs+1200+(i%4)*260
      }

      const x=resident.axis==='x'?resident.coordinate:resident.fixed
      const z=resident.axis==='z'?resident.coordinate:resident.fixed
      const heading=resident.axis==='x'
        ?(resident.direction>0?Math.PI/2:-Math.PI/2)
        :(resident.direction>0?0:Math.PI)
      const bob=mustWait?0:Math.sin(nowMs/1000*5.4+resident.phase)*.026

      matrix.position.set(x,.9+bob,z)
      matrix.rotation.set(0,heading,0)
      matrix.scale.set(1,1,1)
      matrix.updateMatrix()
      bodies.setMatrixAt(i,matrix.matrix)

      matrix.position.set(x,1.86+bob,z)
      matrix.updateMatrix()
      heads.setMatrixAt(i,matrix.matrix)

      if(resident.routine==='delivery'){
        matrix.position.set(
          x+(resident.axis==='x'?.28:0),
          1.25+bob,
          z+(resident.axis==='z'?.28:0),
        )
        matrix.rotation.set(0,heading,0)
        matrix.scale.set(1,1,1)
      }else{
        matrix.position.set(0,-50,0)
        matrix.rotation.set(0,0,0)
        matrix.scale.set(0,0,0)
      }
      matrix.updateMatrix()
      parcels.setMatrixAt(i,matrix.matrix)

      if(insideCrossing||resident.inCrossing)crossing++
    })

    bodies.instanceMatrix.needsUpdate=true
    heads.instanceMatrix.needsUpdate=true
    parcels.instanceMatrix.needsUpdate=true

    if(nowMs-telemetryAt>2500){
      telemetryAt=nowMs
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-pedestrian-routine-state',{
        detail:{waiting,crossing,total:residents.length,routines:ROUTINES},
      }))
    }
  }

  tick(performance.now())

  const counts:StreetVerseChicagoPedestrianRoutineCounts={
    crossingResidents:residents.length,
    walkSignals:walkSignalSpots.length,
    signalizedCrossings:INTERSECTIONS.length*INTERSECTIONS.length,
    routineTypes:ROUTINES.length,
  }

  window.dispatchEvent(new CustomEvent('tryamm:streetverse-chicago-pedestrian-routines-ready',{
    detail:{...counts,crosswalkAware:true,trafficSignalAware:true,mobile:true,instanced:true},
  }))

  return{
    counts,
    tick,
    dispose(){
      root.removeFromParent()
      ;[bodies,heads,parcels,walkSignals].forEach(disposeInstanced)
    },
  }
}
