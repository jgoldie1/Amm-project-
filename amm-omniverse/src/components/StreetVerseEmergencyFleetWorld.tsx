import {useEffect} from 'react'
import * as THREE from 'three'
import {subscribeStreetVerseScene} from '../game/streetverseSceneRegistry'

type Kind='police'|'ambulance'|'fire'
type Unit={id:string;kind:Kind;group:THREE.Group;x:number;z:number;targetX:number;targetZ:number;speed:number;active:boolean}

const paint=(color:number)=>new THREE.MeshStandardMaterial({color,roughness:.42,metalness:.28})
const dark=paint(0x11151a),glass=paint(0x6d96ad),white=paint(0xf1f4f6),red=paint(0xc9231d),blue=paint(0x203d74)

function wheels(group:THREE.Group,front=1.7,rear=-1.7){
  for(const x of [rear,front])for(const z of [-1.08,1.08]){
    const w=new THREE.Mesh(new THREE.CylinderGeometry(.44,.44,.34,12),dark);w.rotation.x=Math.PI/2;w.position.set(x,.5,z);group.add(w)
  }
}
function lightBar(group:THREE.Group,kind:Kind){
  const holder=new THREE.Group();holder.position.set(.1,2.35,0)
  const a=new THREE.Mesh(new THREE.BoxGeometry(.65,.14,.34),new THREE.MeshBasicMaterial({color:kind==='fire'?0xff3b25:0xff3348,transparent:true,opacity:.95}));a.position.z=-.28
  const b=new THREE.Mesh(new THREE.BoxGeometry(.65,.14,.34),new THREE.MeshBasicMaterial({color:kind==='ambulance'?0xffffff:0x3178ff,transparent:true,opacity:.95}));b.position.z=.28
  holder.add(a,b);group.add(holder);group.userData.flashA=a;group.userData.flashB=b
}
function makePolice(){
  const g=new THREE.Group();g.name='streetverse-world-police-car'
  const body=new THREE.Mesh(new THREE.BoxGeometry(4.8,1.05,2.15),blue);body.position.y=.95;g.add(body)
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.45,.9,1.86),glass);cabin.position.set(-.15,1.65,0);g.add(cabin)
  const stripe=new THREE.Mesh(new THREE.BoxGeometry(4.9,.16,2.18),white);stripe.position.y=1.05;g.add(stripe)
  wheels(g);lightBar(g,'police');g.userData.kind='police';g.userData.playerDrivable=false;g.userData.emergencyMissionVehicle=true;return g
}
function makeAmbulance(){
  const g=new THREE.Group();g.name='streetverse-world-ambulance'
  const cab=new THREE.Mesh(new THREE.BoxGeometry(2.3,1.3,2.2),white);cab.position.set(1.45,1.1,0);g.add(cab)
  const box=new THREE.Mesh(new THREE.BoxGeometry(3.3,2.25,2.3),white);box.position.set(-1.25,1.55,0);g.add(box)
  const stripe=new THREE.Mesh(new THREE.BoxGeometry(5.1,.26,2.34),red);stripe.position.y=1.35;g.add(stripe)
  const windshield=new THREE.Mesh(new THREE.BoxGeometry(.12,.75,1.75),glass);windshield.position.set(2.62,1.65,0);g.add(windshield)
  wheels(g,1.75,-1.55);lightBar(g,'ambulance');g.userData.kind='ambulance';g.userData.playerDrivable=false;g.userData.emergencyMissionVehicle=true;return g
}
function makeFire(){
  const g=new THREE.Group();g.name='streetverse-world-fire-truck'
  const chassis=new THREE.Mesh(new THREE.BoxGeometry(6.4,1.25,2.35),red);chassis.position.y=1;g.add(chassis)
  const cab=new THREE.Mesh(new THREE.BoxGeometry(2.25,1.55,2.15),paint(0xd53228));cab.position.set(2.0,1.75,0);g.add(cab)
  const rear=new THREE.Mesh(new THREE.BoxGeometry(3.3,1.65,2.15),paint(0xa91916));rear.position.set(-1.25,1.55,0);g.add(rear)
  const ladderBase=new THREE.Mesh(new THREE.BoxGeometry(3.8,.20,.38),white);ladderBase.position.set(-.7,2.75,0);g.add(ladderBase)
  const hose=new THREE.Mesh(new THREE.TorusGeometry(.62,.09,8,24),dark);hose.rotation.y=Math.PI/2;hose.position.set(-1.8,1.75,1.18);g.add(hose)
  for(let i=0;i<3;i++){const compartment=new THREE.Mesh(new THREE.BoxGeometry(.8,.8,.06),paint(0xdddddd));compartment.position.set(-2+i*.95,1.35,-1.11);g.add(compartment)}
  wheels(g,2.05,-1.8);lightBar(g,'fire');g.userData.kind='fire';g.userData.playerDrivable=false;g.userData.emergencyMissionVehicle=true;g.userData.ladderRigTarget=true;return g
}
function makeResponseHub(){
  const g=new THREE.Group();g.name='streetverse-west-side-response-hub'
  const slab=new THREE.Mesh(new THREE.BoxGeometry(26,.2,14),paint(0x4e5357));slab.position.set(-64,.1,34);g.add(slab)
  const rear=new THREE.Mesh(new THREE.BoxGeometry(26,5,.4),paint(0x6d655c));rear.position.set(-64,2.5,40.8);g.add(rear)
  for(const x of [-72,-64,-56]){
    const side=new THREE.Mesh(new THREE.BoxGeometry(.35,5,13),paint(0x77716a));side.position.set(x-4,2.5,34);g.add(side)
    const roof=new THREE.Mesh(new THREE.BoxGeometry(8,.35,13),paint(0x3c4146));roof.position.set(x,5,34);g.add(roof)
  }
  const fireMark=new THREE.Mesh(new THREE.BoxGeometry(6,.8,.18),red);fireMark.position.set(-70,4.0,27.4);g.add(fireMark)
  const emsMark=new THREE.Mesh(new THREE.BoxGeometry(6,.8,.18),white);emsMark.position.set(-64,4.0,27.4);g.add(emsMark)
  const policeMark=new THREE.Mesh(new THREE.BoxGeometry(6,.8,.18),blue);policeMark.position.set(-58,4.0,27.4);g.add(policeMark)
  g.userData={label:'West Side Emergency Response Hub',services:['fire','ambulance','police'],walkableApron:true}
  return g
}
function build(kind:Kind){return kind==='fire'?makeFire():kind==='ambulance'?makeAmbulance():makePolice()}
const speedFor=(kind:Kind)=>kind==='fire'?14:kind==='ambulance'?16:18
const spawnFor=(kind:Kind)=>kind==='fire'?{x:-70,z:36}:kind==='ambulance'?{x:-64,z:31}:{x:-58,z:36}

export default function StreetVerseEmergencyFleetWorld(){
  useEffect(()=>{
    const units=new Map<Kind,Unit>()
    let scene:THREE.Scene|null=null,station:THREE.Group|null=null,raf=0,last=performance.now(),flashClock=0

    const ensure=(kind:Kind)=>{
      let unit=units.get(kind)
      if(unit)return unit
      if(!scene)return null
      const group=build(kind),spawn=spawnFor(kind);group.position.set(spawn.x,0,spawn.z);scene.add(group)
      unit={id:'west-side-'+kind+'-01',kind,group,x:spawn.x,z:spawn.z,targetX:spawn.x,targetZ:spawn.z,speed:speedFor(kind),active:false};units.set(kind,unit)
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-world-unit-ready',{detail:{id:unit.id,kind,x:unit.x,z:unit.z,actualWorldMesh:true}}))
      return unit
    }

    const unsub=subscribeStreetVerseScene(handle=>{
      if(scene){for(const unit of units.values())scene.remove(unit.group);if(station)scene.remove(station)}
      units.clear();if(station&&scene)scene.remove(station);station=null;scene=handle?.scene||null
      if(!scene)return
      station=makeResponseHub();scene.add(station)
      ensure('police');ensure('ambulance');ensure('fire')
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-fleet-ready',{detail:{police:true,ambulance:true,fireTruck:true,station:'west-side-response-hub',worldMeshes:true}}))
    })

    const dispatchUnit=(kind:Kind,x:number,z:number)=>{
      const unit=ensure(kind);if(!unit)return
      unit.targetX=THREE.MathUtils.clamp(x,-80,80);unit.targetZ=THREE.MathUtils.clamp(z,-80,80);unit.active=true
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-vehicle-dispatched',{detail:{id:unit.id,kind,x:unit.x,z:unit.z,targetX:unit.targetX,targetZ:unit.targetZ,worldMesh:true}}))
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-sound-event',{detail:{kind:'emergency-siren',service:kind,source:'world-emergency-fleet'}}))
    }
    const normalize=(raw:string):Kind=>raw.toLowerCase().includes('fire')?'fire':raw.toLowerCase().includes('ambul')||raw.toLowerCase().includes('ems')?'ambulance':'police'
    const onEmergency=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};dispatchUnit(normalize(String(d.type||d.kind||d.service||d.agency||'police')),Number(d.x||0),Number(d.z||0))}
    const onResponder=(event:Event)=>{
      const d=(event as CustomEvent<any>).detail||{};const kind=normalize(String(d.agency||d.kind||'police'));const unit=ensure(kind);if(!unit||d.active===false)return
      if(Number.isFinite(Number(d.x)))unit.targetX=Number(d.x);if(Number.isFinite(Number(d.z)))unit.targetZ=Number(d.z);unit.active=true
    }
    const onCollision=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};if(Number(d.speed||d.impact||0)>12)dispatchUnit('ambulance',Number(d.x||0),Number(d.z||0))}
    const onFire=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};if(d.burning!==false)dispatchUnit('fire',Number(d.x||0),Number(d.z||0))}
    const onCleared=()=>{for(const unit of units.values()){const home=spawnFor(unit.kind);unit.targetX=home.x;unit.targetZ=home.z;unit.active=false}}

    addEventListener('tryamm:streetverse-emergency-response',onEmergency)
    addEventListener('tryamm:streetverse-responder-world-position',onResponder)
    addEventListener('tryamm:streetverse-vehicle-collision',onCollision)
    addEventListener('tryamm:streetverse-structure-fire-state',onFire)
    addEventListener('tryamm:streetverse-incident-cleared',onCleared)
    addEventListener('tryamm:streetverse-emergency-resolved',onCleared)

    const tick=(now:number)=>{
      const dt=Math.min(.05,(now-last)/1000);last=now;flashClock+=dt
      for(const unit of units.values()){
        const dx=unit.targetX-unit.x,dz=unit.targetZ-unit.z,dist=Math.hypot(dx,dz)
        if(dist>.3){const step=Math.min(dist,unit.speed*dt);unit.x+=dx/dist*step;unit.z+=dz/dist*step;unit.group.rotation.y=Math.atan2(-dz,dx)}
        unit.group.position.set(unit.x,0,unit.z)
        const on=Math.floor(flashClock*9)%2===0
        const a=unit.group.userData.flashA as THREE.Mesh|undefined,b=unit.group.userData.flashB as THREE.Mesh|undefined
        if(a&&(a.material as THREE.MeshBasicMaterial).opacity!==undefined)(a.material as THREE.MeshBasicMaterial).opacity=on?1:.18
        if(b&&(b.material as THREE.MeshBasicMaterial).opacity!==undefined)(b.material as THREE.MeshBasicMaterial).opacity=on?.18:1
        if(dist<1&&unit.active)window.dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-unit-arrived',{detail:{id:unit.id,kind:unit.kind,x:unit.x,z:unit.z,worldMesh:true}}))
      }
      raf=requestAnimationFrame(tick)
    }
    raf=requestAnimationFrame(tick)

    return()=>{
      cancelAnimationFrame(raf);unsub()
      removeEventListener('tryamm:streetverse-emergency-response',onEmergency);removeEventListener('tryamm:streetverse-responder-world-position',onResponder);removeEventListener('tryamm:streetverse-vehicle-collision',onCollision);removeEventListener('tryamm:streetverse-structure-fire-state',onFire);removeEventListener('tryamm:streetverse-incident-cleared',onCleared);removeEventListener('tryamm:streetverse-emergency-resolved',onCleared)
      if(scene)for(const unit of units.values())scene.remove(unit.group)
    }
  },[])
  return null
}
