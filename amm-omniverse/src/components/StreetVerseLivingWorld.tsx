import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { replacePrimitiveWithStreetVerseAsset } from '../services/streetverseAssetLoader'
import { addChicagoTransitAirportDepth } from '../runtime/StreetVerseChicago3DDepthRuntime'

const SAVE_KEY='tryamm.streetverse.living.v1'
const CHARACTER_KEY='tryamm.streetverse.playable-character.v1'
const START={x:0,z:54}
const ROAD_CENTERS=[-48,0,48]
const RESIDENT_ASSETS=['npc-citizen-a','npc-resident-premium-a','npc-resident-premium-b','npc-resident-premium-c']
const MISSIONS=[
  {id:'studio',label:'Aniyah 64 Track Studio',x:-42,z:-30},
  {id:'market',label:'All American Marketplace',x:42,z:-24},
  {id:'network',label:'All American Network',x:38,z:38},
  {id:'club',label:'Chicago After Dark',x:-38,z:38},
]
const RACE_PATH=[{x:0,z:48},{x:48,z:-48},{x:0,z:0},{x:48,z:48},{x:0,z:48}]

type Traffic={axis:'x'|'z';roadCenter:number;dir:1|-1;laneOffset:number;speed:number;phase:number}
type ResidentRoute={axis:'x'|'z';fixed:number;dir:1|-1;speed:number;phase:number}
type CharacterSelect={id?:string;label?:string;index?:number}
type VehicleInteract={entered?:boolean;x?:number;z?:number}
type VehicleInput={throttle?:number;brake?:number;steer?:number;handbrake?:number|boolean;horn?:boolean;exit?:boolean}
type AIRacerDetail={id?:string;name?:string;progress?:number;speed?:number}
type SurfaceInfo={name:'DRY'|'WET'|'LOW-GRIP';grip:number;accel:number}
type TrafficReaction={active?:boolean;kind?:string;x?:number;z?:number;speedMultiplier?:number;pullAside?:boolean;crossTrafficRed?:boolean}
type PedestrianReaction={active?:boolean;kind?:string;x?:number;z?:number;radius?:number;action?:string}
type SignalOverride={active?:boolean;crossTraffic?:string;priorityLane?:string;kind?:string}
type RoadblockState={active?:boolean;agency?:string;x?:number;z?:number;radius?:number;level?:number;reason?:string}
type ResponderWorldDetail={id?:string;agency?:string;x?:number;z?:number;heading?:number;speed?:number;status?:string;active?:boolean}
type ResponderNPCDetail={id?:string;unitId?:string;agency?:string;role?:string;x?:number;z?:number;heading?:number;status?:string;active?:boolean;assignment?:string}
type NativePowersportDetail={instanceId?:string;id?:string;label?:string;wheels?:number;className?:string;x?:number;z?:number;heading?:number;size?:{length?:number;width?:number;height?:number;rideHeight?:number};handling?:{grip?:number;steer?:number;roll?:number};stunts?:string[];enterable?:boolean;drivable?:boolean}

function loadSave(){try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}catch{return {}}}
function loadCharacter(){try{return JSON.parse(localStorage.getItem(CHARACTER_KEY)||'{}')?.character as CharacterSelect|undefined}catch{return undefined}}
function material(color:number,metalness=.1,roughness=.72){return new THREE.MeshStandardMaterial({color,metalness,roughness})}
function wrap(v:number,min=-88,max=88){const span=max-min;return min+((((v-min)%span)+span)%span)}
function nearestIntersection(v:number){return ROAD_CENTERS.reduce((best,n)=>Math.abs(v-n)<Math.abs(v-best)?n:best,ROAD_CENTERS[0])}
function approachingIntersection(v:number,dir:1|-1){const center=nearestIntersection(v);const distance=(center-v)*dir;return distance>0&&distance<10}
function surfaceAt(x:number,z:number):SurfaceInfo{if(x>18&&z<-6)return{name:'WET',grip:.62,accel:.9};if(x<-22&&z>5)return{name:'LOW-GRIP',grip:.72,accel:.94};return{name:'DRY',grip:1,accel:1}}
function racePoint(progress:number,laneOffset=0){const p=THREE.MathUtils.clamp(progress,0,100)/100*(RACE_PATH.length-1);const index=Math.min(RACE_PATH.length-2,Math.floor(p));const t=p-index;const a=RACE_PATH[index],b=RACE_PATH[index+1];const x=THREE.MathUtils.lerp(a.x,b.x,t),z=THREE.MathUtils.lerp(a.z,b.z,t);const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz)||1;return{x:x+(-dz/len)*laneOffset,z:z+(dx/len)*laneOffset,rotation:Math.atan2(-dz,dx)}}

function makeResident(i:number){
  const g=new THREE.Group()
  const skin=[0x5a321f,0x7a4a2f,0x9a6244,0xbd805b,0xd2a075,0xe2b899][i%6]
  const shirt=[0xff6f9e,0x65d8ff,0xffcf67,0x75e08e,0xb58cff,0xff8e62][i%6]
  const pants=[0x202936,0x283548,0x35313c,0x172d3d][i%4]
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.43,1.05,4,8),material(shirt,.05,.72));torso.position.y=1.55;torso.castShadow=true;g.add(torso)
  const head=new THREE.Mesh(new THREE.SphereGeometry(.38,12,10),material(skin,0,.62));head.position.y=2.78;head.castShadow=true;g.add(head)
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.39,10,8,0,Math.PI*2,0,Math.PI*.48),material([0x16120f,0x2b1c15,0x473126][i%3],0,.92));hair.position.y=2.9;g.add(hair)
  for(const side of [-1,1]){
    const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.72,3,6),material(skin,0,.66));arm.position.set(side*.55,1.65,0);arm.rotation.z=side*.14;g.add(arm)
    const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.15,.78,3,6),material(pants,0,.85));leg.position.set(side*.2,.52,0);g.add(leg)
  }
  const shoes=new THREE.Mesh(new THREE.BoxGeometry(.62,.18,.72),material(0x15171b,.05,.92));shoes.position.set(0,.12,-.08);g.add(shoes)
  return g
}

function makeCar(i:number){
  const car=new THREE.Group()
  const color=[0xe84141,0x3f8cff,0xe8c84b,0xeaeaea,0x1f1f27,0x4ccf8a][i%6]
  const shell=new THREE.Mesh(new THREE.BoxGeometry(4.9,1.12,2.2),material(color,.55,.3));shell.position.y=1;shell.castShadow=true;car.add(shell)
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.45,.84,1.88),material(0x83b9d6,.7,.18));cabin.position.set(-.25,1.78,0);cabin.castShadow=true;car.add(cabin)
  const hood=new THREE.Mesh(new THREE.BoxGeometry(.9,.18,1.92),material(color,.5,.3));hood.position.set(2.05,1.47,0);car.add(hood)
  for(const sx of [-1.5,1.5])for(const sz of [-1,1]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.3,12),material(0x111111,0,.9));wheel.rotation.x=Math.PI/2;wheel.position.set(sx,.55,sz*1.05);car.add(wheel)}
  for(const z of [-.68,.68]){
    const headlight=new THREE.Mesh(new THREE.BoxGeometry(.08,.26,.34),new THREE.MeshBasicMaterial({color:0xfff2c2}));headlight.position.set(2.47,1.03,z);car.add(headlight)
    const tail=new THREE.Mesh(new THREE.BoxGeometry(.08,.25,.32),new THREE.MeshBasicMaterial({color:0xff293d}));tail.position.set(-2.47,1.02,z);car.add(tail)
  }
  return car
}

function makeNativePowersport(d:NativePowersportDetail){
  const g=new THREE.Group(),wheels=Math.max(2,Number(d.wheels||4)),id=String(d.id||'powersport'),size=d.size||{}
  const length=Number(size.length||3),width=Number(size.width||1.6),height=Number(size.height||1.2),rideHeight=Number(size.rideHeight||.62)
  const frameColor=id.includes('sport')?0x2878ff:id.includes('dirt')||id.includes('trail')?0xff7a23:id.includes('cruiser')?0x20242a:id.includes('kart')?0xffcf3b:id.includes('utv')||id.includes('buggy')?0x4b7d46:0xe84242
  const frame=new THREE.Mesh(new THREE.BoxGeometry(length*.78,Math.max(.18,height*.22),Math.max(.32,width*.62)),material(frameColor,.35,.4));frame.position.y=rideHeight+.28;frame.castShadow=true;g.add(frame)
  const seat=new THREE.Mesh(new THREE.BoxGeometry(length*(wheels===2?.34:.42),.18,width*(wheels===2?.56:.66)),material(0x171a1f,.1,.82));seat.position.set(-length*.08,rideHeight+.62,0);g.add(seat)
  if(wheels===2){const tank=new THREE.Mesh(new THREE.SphereGeometry(.45,10,8),material(frameColor,.38,.34));tank.scale.set(1.2,.72,.72);tank.position.set(length*.12,rideHeight+.66,0);g.add(tank);const fork=new THREE.Mesh(new THREE.BoxGeometry(.12,.9,.12),material(0xaeb5bd,.65,.26));fork.position.set(length*.4,rideHeight+.45,0);fork.rotation.z=-.22;g.add(fork)}
  if(wheels>=3){const nose=new THREE.Mesh(new THREE.BoxGeometry(length*.28,.34,width*.82),material(frameColor,.32,.38));nose.position.set(length*.28,rideHeight+.38,0);g.add(nose)}
  if(id==='utv'||id==='dune-buggy'){for(const sx of [-.9,.9]){const bar=new THREE.Mesh(new THREE.BoxGeometry(.08,height*1.05,.08),material(0x20252b,.4,.45));bar.position.set(sx,rideHeight+height*.64,0);g.add(bar)}const roof=new THREE.Mesh(new THREE.BoxGeometry(length*.56,.08,width*.9),material(0x252b31,.25,.5));roof.position.set(-.1,rideHeight+height*1.12,0);g.add(roof)}
  const wheelRadius=wheels===2?.43:id==='go-kart'?.34:.39
  const addWheel=(x:number,z:number)=>{const wheel=new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius,wheelRadius,wheels===2?.18:.24,12),material(0x111111,0,.94));wheel.rotation.x=Math.PI/2;wheel.position.set(x,wheelRadius,z);wheel.castShadow=true;g.add(wheel)}
  if(wheels===2){addWheel(length*.39,0);addWheel(-length*.39,0)}else if(wheels===3){addWheel(length*.35,0);addWheel(-length*.34,width*.46);addWheel(-length*.34,-width*.46)}else{for(const x of [-length*.34,length*.34])for(const z of [-width*.46,width*.46])addWheel(x,z)}
  const light=new THREE.Mesh(new THREE.SphereGeometry(.11,8,6),new THREE.MeshBasicMaterial({color:0xfff2c2}));light.position.set(length*.47,rideHeight+.54,0);g.add(light)
  g.userData.powersportProfile=d;g.userData.nativePowersport=true;g.userData.powersportId=id;g.userData.powersportLabel=d.label||id.toUpperCase()
  return g
}

function makeResponderVehicle(agencyRaw:string){
  const agency=agencyRaw.toLowerCase()
  const g=new THREE.Group()
  const isAmbulance=agency.includes('ambul'),isFire=agency.includes('fire'),isSheriff=agency.includes('sheriff'),isFederal=agency.includes('fbi')||agency.includes('cia')||agency.includes('mib')||agency.includes('intel')
  const bodyColor=isAmbulance?0xf2f2f2:isFire?0xb72828:isSheriff?0x2a2f36:isFederal?0x15191f:0x243b62
  const shell=new THREE.Mesh(new THREE.BoxGeometry(isFire?6.7:isAmbulance?6.2:5.4,isFire?1.55:1.25,isFire?2.5:2.25),material(bodyColor,.45,.34));shell.position.y=1.12;shell.castShadow=true;g.add(shell)
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(isFire?2.4:2.5,.9,1.92),material(0x789aae,.65,.22));cabin.position.set(isFire?1.75:-.2,1.9,0);cabin.castShadow=true;g.add(cabin)
  if(isAmbulance||isFire){const rear=new THREE.Mesh(new THREE.BoxGeometry(isFire?3.5:3.1,isFire?1.8:2.05,isFire?2.35:2.15),material(bodyColor,.35,.4));rear.position.set(isFire?-1.45:-1.35,isFire?1.5:1.62,0);rear.castShadow=true;g.add(rear)}
  for(const sx of isFire?[-2.2,2.2]:[-1.65,1.65])for(const sz of [-1,1]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.47,.47,.32,12),material(0x111111,0,.92));wheel.rotation.x=Math.PI/2;wheel.position.set(sx,.52,sz*1.08);g.add(wheel)}
  const bar=new THREE.Mesh(new THREE.BoxGeometry(1.45,.12,.28),material(0x22262c,.5,.25));bar.position.set(.1,isAmbulance||isFire?2.75:2.45,0);g.add(bar)
  const left=new THREE.Mesh(new THREE.BoxGeometry(.58,.16,.3),new THREE.MeshBasicMaterial({color:0xff2745,transparent:true,opacity:1}));left.position.set(-.35,bar.position.y+.05,0);left.userData.responderBeacon='left';g.add(left)
  const rightColor=isFire?0xffb52b:isAmbulance?0xffffff:isSheriff?0x4aa3ff:isFederal?0xffffff:0x2f74ff
  const right=new THREE.Mesh(new THREE.BoxGeometry(.58,.16,.3),new THREE.MeshBasicMaterial({color:rightColor,transparent:true,opacity:.25}));right.position.set(.35,bar.position.y+.05,0);right.userData.responderBeacon='right';g.add(right)
  g.userData.responderAgency=agencyRaw.toUpperCase();g.userData.responderStatus='approach'
  return g
}

function makeResponderNPC(roleRaw:string,agencyRaw:string){
  const role=roleRaw.toLowerCase(),g=new THREE.Group()
  const isEMS=role.includes('paramedic'),isFire=role.includes('fire'),isFederal=role.includes('agent'),isSheriff=role.includes('deputy')
  const uniform=isEMS?0xe9ecef:isFire?0xc3392d:isFederal?0x20242b:isSheriff?0x5a5147:0x253a62
  const vest=isEMS?0x57b8d8:isFire?0xf4c542:isFederal?0x11151a:isSheriff?0x2e3338:0x121820
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.92,4,8),material(uniform,.08,.72));torso.position.y=1.48;torso.castShadow=true;g.add(torso)
  const vestMesh=new THREE.Mesh(new THREE.BoxGeometry(.82,.66,.5),material(vest,.15,.58));vestMesh.position.set(0,1.62,.05);g.add(vestMesh)
  const head=new THREE.Mesh(new THREE.SphereGeometry(.32,10,8),material(0xa96f4e,0,.65));head.position.y=2.55;g.add(head)
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.14,10),material(isFire?0xf2d13c:isEMS?0xffffff:isFederal?0x171a1f:0x202b3a,.05,.72));cap.position.y=2.88;g.add(cap)
  for(const side of [-1,1]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.1,.62,3,6),material(uniform,.05,.78));arm.position.set(side*.48,1.5,0);g.add(arm);const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.67,3,6),material(0x20252b,.05,.84));leg.position.set(side*.17,.5,0);g.add(leg)}
  if(isEMS){const bag=new THREE.Mesh(new THREE.BoxGeometry(.5,.42,.32),material(0xe13b3b,.1,.7));bag.position.set(.5,.75,.15);g.add(bag)}
  if(isFire){const tank=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.7,8),material(0x495159,.5,.35));tank.position.set(0,1.45,-.34);g.add(tank)}
  g.userData.responderRole=roleRaw;g.userData.responderAgency=agencyRaw;g.userData.responderNPC=true
  return g
}

export default function StreetVerseLivingWorld({onClose}:{onClose:()=>void}){
  const mountRef=useRef<HTMLDivElement|null>(null)
  const inputRef=useRef({up:false,down:false,left:false,right:false})
  const visitedRef=useRef<string[]>(loadSave().visited||[])
  const [visited,setVisited]=useState<string[]>(visitedRef.current)
  const [message,setMessage]=useState('Welcome to District 01. Explore the living city and reach the glowing mission beacons.')
  const [paused,setPaused]=useState(false)
  const [assetStatus,setAssetStatus]=useState('PROCEDURAL CITY • 24 RESIDENTS • 20 VEHICLES')
  const [signalStatus,setSignalStatus]=useState('E/W GO • N/S WALK')
  const [activeCharacter,setActiveCharacter]=useState(()=>loadCharacter()?.label||'YOU')
  const [driveStatus,setDriveStatus]=useState('ON FOOT')

  useEffect(()=>{visitedRef.current=visited},[visited])

  useEffect(()=>{
    const mount=mountRef.current
    if(!mount)return
    const saved=loadSave()
    const scene=new THREE.Scene();scene.background=new THREE.Color(0x07101d);scene.fog=new THREE.FogExp2(0x07101d,.007)
    addChicagoTransitAirportDepth(scene)
    const camera=new THREE.PerspectiveCamera(63,1,.1,600)
    const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;mount.appendChild(renderer.domElement)
    const hemi=new THREE.HemisphereLight(0x9bdcff,0x17111b,2.7);scene.add(hemi)
    const sun=new THREE.DirectionalLight(0xffe0bd,3.4);sun.position.set(55,90,25);sun.castShadow=true;scene.add(sun)

    const ground=new THREE.Mesh(new THREE.PlaneGeometry(190,190),material(0x142019,0,.98));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground)
    const roadMat=material(0x1c2029,0,.98),sidewalkMat=material(0x6c7073,0,.95),laneMat=new THREE.MeshBasicMaterial({color:0xe8d97a}),crosswalkMat=new THREE.MeshBasicMaterial({color:0xf4f5ef})
    for(const z of ROAD_CENTERS){const road=new THREE.Mesh(new THREE.BoxGeometry(190,.12,14),roadMat);road.position.set(0,.07,z);scene.add(road);for(const dz of [-9,9]){const walk=new THREE.Mesh(new THREE.BoxGeometry(190,.2,3),sidewalkMat);walk.position.set(0,.12,z+dz);scene.add(walk)}for(let x=-84;x<=84;x+=12){const mark=new THREE.Mesh(new THREE.BoxGeometry(6,.03,.16),laneMat);mark.position.set(x,.145,z);scene.add(mark)}}
    for(const x of ROAD_CENTERS){const road=new THREE.Mesh(new THREE.BoxGeometry(14,.12,190),roadMat);road.position.set(x,.07,0);scene.add(road);for(const dx of [-9,9]){const walk=new THREE.Mesh(new THREE.BoxGeometry(3,.2,190),sidewalkMat);walk.position.set(x+dx,.12,0);scene.add(walk)}for(let z=-84;z<=84;z+=12){const mark=new THREE.Mesh(new THREE.BoxGeometry(.16,.03,6),laneMat);mark.position.set(x,.145,z);scene.add(mark)}}
    for(const x of ROAD_CENTERS)for(const z of ROAD_CENTERS){for(const offset of [-5,-3,-1,1,3,5]){const eastWest=new THREE.Mesh(new THREE.BoxGeometry(.7,.035,5.2),crosswalkMat);eastWest.position.set(x+offset,.17,z+7.15);scene.add(eastWest);const northSouth=new THREE.Mesh(new THREE.BoxGeometry(5.2,.035,.7),crosswalkMat);northSouth.position.set(x+7.15,.17,z+offset);scene.add(northSouth)}}
    const wetPatch=new THREE.Mesh(new THREE.PlaneGeometry(64,42),new THREE.MeshStandardMaterial({color:0x23384c,metalness:.35,roughness:.32,transparent:true,opacity:.46}));wetPatch.rotation.x=-Math.PI/2;wetPatch.position.set(50,.19,-35);scene.add(wetPatch)
    const lowGripPatch=new THREE.Mesh(new THREE.PlaneGeometry(54,44),new THREE.MeshStandardMaterial({color:0x4d4232,metalness:.05,roughness:1,transparent:true,opacity:.38}));lowGripPatch.rotation.x=-Math.PI/2;lowGripPatch.position.set(-54,.19,38);scene.add(lowGripPatch)

    const signalLights:{axis:'x'|'z';lamp:THREE.Mesh}[]=[]
    for(const x of ROAD_CENTERS)for(const z of ROAD_CENTERS)for(const axis of ['x','z'] as const){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.1,.12,3.8,8),material(0x33383e,.7,.3));pole.position.set(x+(axis==='x'?8.5:-8.5),1.9,z+(axis==='z'?8.5:-8.5));scene.add(pole);const lamp=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),new THREE.MeshBasicMaterial({color:0x43ff7b}));lamp.position.copy(pole.position);lamp.position.y=3.85;scene.add(lamp);signalLights.push({axis,lamp})}

    const collisionBoxes:THREE.Box3[]=[]
    const roadblockRoot=new THREE.Group();scene.add(roadblockRoot)
    const roadblockBoxes:THREE.Box3[]=[]
    let roadblockState:RoadblockState={active:false,x:0,z:0,radius:0,level:0}
    const clearRoadblockVisuals=()=>{roadblockRoot.clear();roadblockBoxes.splice(0,roadblockBoxes.length)}
    const makeBarricade=(x:number,z:number,rotation=0)=>{const g=new THREE.Group();const beam=new THREE.Mesh(new THREE.BoxGeometry(6,.55,.35),material(0xf0f0f0,.12,.58));beam.position.y=1.05;g.add(beam);for(const sx of [-2,0,2]){const stripe=new THREE.Mesh(new THREE.BoxGeometry(.7,.58,.38),material(0xff7a1a,.08,.54));stripe.position.set(sx,1.05,0);stripe.rotation.z=.38;g.add(stripe)}for(const sx of [-2.3,2.3]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.24,1.5,.3),material(0x40464e,.35,.55));leg.position.set(sx,.48,0);g.add(leg);const beacon=new THREE.Mesh(new THREE.SphereGeometry(.18,8,6),new THREE.MeshBasicMaterial({color:0xff3f43,transparent:true,opacity:1}));beacon.position.set(sx,1.62,0);beacon.userData.roadblockBeacon=true;g.add(beacon)}g.position.set(x,.06,z);g.rotation.y=rotation;roadblockRoot.add(g);roadblockBoxes.push(new THREE.Box3().setFromObject(g).expandByScalar(.35))}
    const onRoadblockState=(event:Event)=>{const d=(event as CustomEvent<RoadblockState>).detail||{};roadblockState=d;clearRoadblockVisuals();if(!d.active)return;const x=Number(d.x||0),z=Number(d.z||0),radius=THREE.MathUtils.clamp(Number(d.radius||24),14,42),level=THREE.MathUtils.clamp(Number(d.level||2),1,5);const ring=new THREE.Mesh(new THREE.RingGeometry(Math.max(4,radius-1),radius,48),new THREE.MeshBasicMaterial({color:level>=4?0xff3855:0xffb34f,transparent:true,opacity:.16,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.set(x,.22,z);roadblockRoot.add(ring);const nearestX=nearestIntersection(x),nearestZ=nearestIntersection(z);makeBarricade(x-radius*.72,z,0);makeBarricade(x+radius*.72,z,0);makeBarricade(x,z-radius*.72,Math.PI/2);makeBarricade(x,z+radius*.72,Math.PI/2);for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2;const cone=new THREE.Mesh(new THREE.ConeGeometry(.38,1.35,10),material(0xff7b22,.05,.78));cone.position.set(x+Math.cos(a)*radius,.68,z+Math.sin(a)*radius);roadblockRoot.add(cone)}setMessage(`${String(d.agency||'POLICE')} perimeter established near ${Math.round(nearestX)},${Math.round(nearestZ)} • level ${Math.round(level)} roadblock active.`);setAssetStatus('ROADBLOCKS/PERIMETER • 24 RESIDENTS • 20 VEHICLES • EMERGENCY CITY REACTION')}
    addEventListener('tryamm:streetverse-roadblock-state',onRoadblockState)

    const responderRoot=new THREE.Group();scene.add(responderRoot)
    const responderVehicles=new Map<string,THREE.Group>()
    const responderBoxes=new Map<string,THREE.Box3>()
    const onResponderWorldPosition=(event:Event)=>{const d=(event as CustomEvent<ResponderWorldDetail>).detail||{};const id=String(d.id||'');if(!id)return;if(d.active===false){const old=responderVehicles.get(id);if(old){responderRoot.remove(old);responderVehicles.delete(id);responderBoxes.delete(id)}return}let unit=responderVehicles.get(id);if(!unit){unit=makeResponderVehicle(String(d.agency||'police'));unit.userData.responderId=id;responderVehicles.set(id,unit);responderRoot.add(unit);setAssetStatus('NATIVE RESPONDER VEHICLES • ROADBLOCKS/PERIMETER • 24 RESIDENTS • 20 VEHICLES')}unit.position.set(Number(d.x||0),.08,Number(d.z||0));unit.rotation.y=Number(d.heading||0);unit.userData.responderStatus=String(d.status||'approach');unit.userData.responderSpeed=Number(d.speed||0);responderBoxes.set(id,new THREE.Box3().setFromObject(unit).expandByScalar(.35));if(d.status==='staged')setMessage(`${String(d.agency||'Responder').toUpperCase()} unit ${id} staged at the incident perimeter.`)}
    addEventListener('tryamm:streetverse-responder-world-position',onResponderWorldPosition)

    const responderNPCRoot=new THREE.Group();scene.add(responderNPCRoot)
    const responderNPCs=new Map<string,THREE.Group>()
    const responderNPCBoxes=new Map<string,THREE.Box3>()
    const onResponderNPCPosition=(event:Event)=>{const d=(event as CustomEvent<ResponderNPCDetail>).detail||{};const id=String(d.id||'');if(!id)return;if(d.active===false){const old=responderNPCs.get(id);if(old){responderNPCRoot.remove(old);responderNPCs.delete(id);responderNPCBoxes.delete(id)}return}let npc=responderNPCs.get(id);if(!npc){npc=makeResponderNPC(String(d.role||'officer'),String(d.agency||'police'));npc.userData.responderNPCId=id;responderNPCs.set(id,npc);responderNPCRoot.add(npc);setAssetStatus('RESPONDER NPC TEAMS • NATIVE RESPONDER VEHICLES • ROADBLOCKS • 24 RESIDENTS • 20 VEHICLES')}npc.position.set(Number(d.x||0),0,Number(d.z||0));npc.rotation.y=Number(d.heading||0);npc.userData.responderStatus=String(d.status||'deploying');npc.userData.assignment=String(d.assignment||d.status||'scene-support');responderNPCBoxes.set(id,new THREE.Box3().setFromObject(npc).expandByScalar(.18))}
    const onResponderNPCDeployed=(event:Event)=>{const d=(event as CustomEvent<ResponderNPCDetail>).detail||{};setMessage(`${String(d.agency||'Responder').toUpperCase()} ${String(d.role||'team member').replace('-',' ')} deployed • ${String(d.assignment||'scene support').replace('-',' ')}.`)}
    addEventListener('tryamm:streetverse-responder-npc-position',onResponderNPCPosition)
    addEventListener('tryamm:streetverse-responder-npc-deployed',onResponderNPCDeployed)

    const districtColors=[0x223a51,0x352a4b,0x2f4a3e,0x54392d,0x29485b,0x4b2e46]
    const buildingPositions=[[-70,-70],[-70,-25],[-70,25],[-70,70],[-25,-70],[-25,-25],[-25,25],[-25,70],[25,-70],[25,-25],[25,25],[25,70],[70,-70],[70,-25],[70,25],[70,70]]
    buildingPositions.forEach(([x,z],i)=>{const h=14+((i*11)%30),w=16+(i%3)*3,d=16+((i+1)%3)*3;const building=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(districtColors[i%districtColors.length],.18,.68));building.position.set(x,h/2,z);building.castShadow=true;building.receiveShadow=true;scene.add(building);collisionBoxes.push(new THREE.Box3().setFromObject(building).expandByScalar(1.2))})

    const shopDefs=[{x:-42,z:-30,c:0xb96cff},{x:42,z:-24,c:0x5be7ff},{x:38,z:38,c:0xffc95b},{x:-38,z:38,c:0xff4f9a}]
    shopDefs.forEach(shop=>{const base=new THREE.Mesh(new THREE.BoxGeometry(15,7,11),material(shop.c,.28,.42));base.position.set(shop.x,3.5,shop.z);base.castShadow=true;scene.add(base);const glow=new THREE.PointLight(shop.c,14,24,2);glow.position.set(shop.x,5,shop.z+7);scene.add(glow);collisionBoxes.push(new THREE.Box3().setFromObject(base).expandByScalar(.8))})

    const trees:THREE.Group[]=[];for(let i=0;i<34;i++){const g=new THREE.Group();const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.35,.48,3,8),material(0x69482f));trunk.position.y=1.5;g.add(trunk);const crown=new THREE.Mesh(new THREE.SphereGeometry(1.7,10,8),material(i%3?0x256b3f:0x34794d));crown.position.y=4;g.add(crown);const side=i%2?1:-1;g.position.set(side*(18+(i%4)*16),0,-78+(i*11)%156);scene.add(g);trees.push(g)}
    const streetLights:THREE.Group[]=[];for(let i=0;i<18;i++){const g=new THREE.Group();const pole=new THREE.Mesh(new THREE.CylinderGeometry(.12,.16,6,8),material(0x353b45,.7,.3));pole.position.y=3;g.add(pole);const lamp=new THREE.PointLight(0xffd7a0,5,18,2);lamp.position.y=6.2;g.add(lamp);g.position.set(i%2?10:-10,0,-76+i*9);scene.add(g);streetLights.push(g)}

    const avatar=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(1.05,2.2,5,10),material(0x58e8ff,.38,.32));body.position.y=2.2;body.castShadow=true;avatar.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.78,18,14),material(0xc98e67,0,.58));head.position.y=4.25;avatar.add(head);avatar.position.set(saved.x??START.x,0,saved.z??START.z);scene.add(avatar)
    replacePrimitiveWithStreetVerseAsset({id:'player-default',fallback:avatar,scene,position:avatar.position.clone()}).then(ok=>ok&&setAssetStatus('PLAYER GLB • RESIDENT GLB GATE ACTIVE • 20 VEHICLES • CHICAGO TRANSIT/AIRPORT DEPTH'))

    const npcs:THREE.Group[]=[]
    for(let i=0;i<24;i++){
      const anchor=new THREE.Group();const fallback=makeResident(i);anchor.add(fallback)
      const horizontal=i<16;const dir=(i%2===0?1:-1) as 1|-1;const route:ResidentRoute=horizontal?{axis:'x',fixed:i<8?-18:18,dir,speed:1.7+(i%5)*.18,phase:i*9}:{axis:'z',fixed:i<20?-18:18,dir,speed:1.55+(i%4)*.2,phase:i*11};anchor.userData.route=route
      if(route.axis==='x')anchor.position.set(wrap(-78+route.phase),0,route.fixed);else anchor.position.set(route.fixed,0,wrap(-78+route.phase));scene.add(anchor);npcs.push(anchor)
      const id=RESIDENT_ASSETS[i%RESIDENT_ASSETS.length]
      replacePrimitiveWithStreetVerseAsset({id,fallback,scene,parent:anchor,position:new THREE.Vector3(0,0,0),requireClearance:true}).then(ok=>{if(ok)setAssetStatus('GLB RESIDENTS • SMART CROSSWALKS • 20 VEHICLES • CHICAGO TRANSIT/AIRPORT DEPTH')})
    }

    let controlled:THREE.Group=avatar
    let controlledIndex=-1
    const selectCharacter=(detail:CharacterSelect)=>{
      const requested=Number(detail.index)
      if(Number.isInteger(requested)&&requested>=0&&requested<npcs.length){
        controlledIndex=requested;controlled=npcs[requested];avatar.visible=false;controlled.userData.playerControlled=true
        setActiveCharacter(detail.label||`RESIDENT ${String(requested+1).padStart(2,'0')}`)
        setMessage(`${detail.label||`Resident ${requested+1}`} is now player-controlled. WASD, arrows, touch and gamepad now move this character.`)
      }else{
        if(controlledIndex>=0&&npcs[controlledIndex])npcs[controlledIndex].userData.playerControlled=false
        controlledIndex=-1;controlled=avatar;avatar.visible=true;setActiveCharacter(detail.label||'YOU');setMessage('Main StreetVerse character restored to player control.')
      }
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-controlled',{detail:{id:detail.id||'you',label:detail.label||'YOU',index:controlledIndex,x:controlled.position.x,z:controlled.position.z}}))
    }
    const onCharacterSelect=(event:Event)=>selectCharacter((event as CustomEvent<CharacterSelect>).detail||{})
    addEventListener('tryamm:streetverse-character-select',onCharacterSelect)
    const initialCharacter=loadCharacter();if(initialCharacter)selectCharacter(initialCharacter)

    const cars:THREE.Group[]=[]
    for(let i=0;i<20;i++){const car=makeCar(i);const horizontal=i<12;const dir=(i%2===0?1:-1) as 1|-1;const roadCenter=horizontal?(i<6?-48:48):(i<16?-48:48);const traffic:Traffic={axis:horizontal?'x':'z',roadCenter,dir,laneOffset:dir>0?2.4:-2.4,speed:8.5+(i%5)*1.05,phase:i*13};car.userData.traffic=traffic;car.userData.aiTraffic=true;car.userData.driveSpeed=0;if(horizontal){car.position.set(wrap(-82+traffic.phase),.05,roadCenter+traffic.laneOffset);car.rotation.y=dir>0?0:Math.PI}else{car.position.set(roadCenter+traffic.laneOffset,.05,wrap(-82+traffic.phase));car.rotation.y=dir>0?-Math.PI/2:Math.PI/2}scene.add(car);cars.push(car)}
    const nativePowersports=new Map<string,THREE.Group>()
    const onNativePowersport=(event:Event)=>{const d=(event as CustomEvent<NativePowersportDetail>).detail||{};const instanceId=String(d.instanceId||`${d.id||'powersport'}-${Date.now()}`);const ride=makeNativePowersport(d);ride.userData.traffic={axis:'x',roadCenter:0,dir:1,laneOffset:0,speed:0,phase:0} as Traffic;ride.userData.aiTraffic=false;ride.userData.driveSpeed=0;ride.position.set(THREE.MathUtils.clamp(Number(d.x||0),-84,84),.04,THREE.MathUtils.clamp(Number(d.z||0),-84,84));ride.rotation.y=Number(d.heading||0);scene.add(ride);cars.push(ride);nativePowersports.set(instanceId,ride);setAssetStatus(`NATIVE POWERSPORTS • ${nativePowersports.size} SPAWNED • 24 RESIDENTS • ${cars.length} DRIVABLE VEHICLES`);setMessage(`${String(d.label||d.id||'Powersport').toUpperCase()} spawned in the living city. Walk near it and press E to ride.`);window.dispatchEvent(new CustomEvent('tryamm:streetverse-powersport-native-status',{detail:{state:'NATIVE_SPAWNED',instanceId,id:d.id,label:d.label,x:ride.position.x,z:ride.position.z}}))}
    addEventListener('tryamm:streetverse-native-powersport-request',onNativePowersport)

    const aiRacerDefs=[{id:'nova',name:'NOVA',car:makeCar(0),lane:-2.4},{id:'south',name:'SOUTH LOOP',car:makeCar(2),lane:0},{id:'lake',name:'LAKEFRONT',car:makeCar(5),lane:2.4}]
    aiRacerDefs.forEach((r,i)=>{const p=racePoint(i*1.5,r.lane);r.car.position.set(p.x,.08,p.z);r.car.rotation.y=p.rotation;r.car.visible=false;r.car.userData.aiRacer=true;r.car.userData.aiRacerId=r.id;scene.add(r.car)})
    const hideAIRacers=()=>aiRacerDefs.forEach(r=>{r.car.visible=false})
    const onAIRacer=(event:Event)=>{const d=(event as CustomEvent<AIRacerDetail>).detail||{};const racer=aiRacerDefs.find(r=>r.id===d.id||r.name===d.name);if(!racer)return;const p=racePoint(Number(d.progress)||0,racer.lane);racer.car.visible=true;racer.car.position.set(p.x,.08,p.z);racer.car.rotation.y=p.rotation;window.dispatchEvent(new CustomEvent('tryamm:streetverse-ai-racer-world-position',{detail:{id:racer.id,name:racer.name,progress:Number(d.progress)||0,x:p.x,z:p.z,speed:Number(d.speed)||0}}))}
    const onAIStart=()=>{aiRacerDefs.forEach((r,i)=>{const p=racePoint(i*1.25,r.lane);r.car.visible=true;r.car.position.set(p.x,.08,p.z);r.car.rotation.y=p.rotation})}
    const onRaceEnd=()=>hideAIRacers()
    addEventListener('tryamm:streetverse-ai-opponent',onAIRacer);addEventListener('tryamm:streetverse-ai-opponents-start',onAIStart);addEventListener('tryamm:streetverse-mission-complete',onRaceEnd);addEventListener('tryamm:streetverse-scene-close',onRaceEnd)

    let activeCar:THREE.Group|null=null
    let activeCarIndex=-1
    let driver:THREE.Group|null=null
    let driveThrottle=0,driveBrake=0,driveSteer=0,driveHandbrake=0,driveSpeed=0,velocityX=0,velocityZ=0
    let hornDown=false
    let trafficReaction:TrafficReaction={active:false,speedMultiplier:1,pullAside:false,crossTrafficRed:false,x:0,z:0}
    let pedestrianReaction:PedestrianReaction={active:false,radius:0,x:0,z:0}
    let signalOverride:SignalOverride={active:false}
    const onTrafficReaction=(event:Event)=>{trafficReaction=(event as CustomEvent<TrafficReaction>).detail||{active:false,speedMultiplier:1};setMessage(trafficReaction.active?`${String(trafficReaction.kind||'Emergency').toUpperCase()} response active. Traffic is yielding and clearing the route.`:'Emergency route cleared. Normal traffic flow restored.')}
    const onPedestrianReaction=(event:Event)=>{pedestrianReaction=(event as CustomEvent<PedestrianReaction>).detail||{active:false,radius:0}}
    const onSignalOverride=(event:Event)=>{signalOverride=(event as CustomEvent<SignalOverride>).detail||{active:false}}
    addEventListener('tryamm:streetverse-traffic-reaction',onTrafficReaction);addEventListener('tryamm:streetverse-pedestrian-reaction',onPedestrianReaction);addEventListener('tryamm:streetverse-signal-override',onSignalOverride)
    const nearestCar=(from:THREE.Group)=>{let bestIndex=-1,best=Infinity;cars.forEach((car,i)=>{if(car===activeCar)return;const d=Math.hypot(car.position.x-from.position.x,car.position.z-from.position.z);if(d<best){best=d;bestIndex=i}});return {index:bestIndex,distance:best}}
    const enterCar=()=>{
      if(activeCar)return
      const nearest=nearestCar(controlled)
      if(nearest.index<0||nearest.distance>18){setMessage('No drivable vehicle close enough. Move nearer to traffic or a powersport and try again.');window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-denied',{detail:{reason:'too-far',distance:nearest.distance}}));return}
      driver=controlled;activeCar=cars[nearest.index];activeCarIndex=nearest.index;activeCar.userData.aiTraffic=false;const profile=activeCar.userData.powersportProfile as NativePowersportDetail|undefined;driveSpeed=profile?0:Math.max(0,Number((activeCar.userData.traffic as Traffic)?.speed||0)*.45);activeCar.userData.driveSpeed=driveSpeed;const f=new THREE.Vector3(Math.cos(activeCar.rotation.y),0,-Math.sin(activeCar.rotation.y));velocityX=f.x*driveSpeed;velocityZ=f.z*driveSpeed;driver.visible=false;controlled=activeCar
      const label=profile?String(profile.label||profile.id||'POWERSPORT').toUpperCase():`CAR ${String(activeCarIndex+1).padStart(2,'0')}`;setDriveStatus(`DRIVING • ${label}`);setMessage(`${label} active. W gas • S brake/reverse • A/D steer • SPACE handbrake • H horn • E exit.`)
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-controlled',{detail:{entered:true,index:activeCarIndex,x:activeCar.position.x,z:activeCar.position.z,speed:driveSpeed,vehicleType:profile?'powersport':'car',ride:profile}}));if(profile)window.dispatchEvent(new CustomEvent('tryamm:streetverse-powersport-controlled',{detail:{entered:true,index:activeCarIndex,x:activeCar.position.x,z:activeCar.position.z,ride:profile}}))
    }
    const tmp=new THREE.Vector3()
    const exitCar=()=>{
      if(!activeCar||!driver)return
      const car=activeCar,who=driver,profile=car.userData.powersportProfile as NativePowersportDetail|undefined
      const side=new THREE.Vector3(0,0,profile?2.8:4.2).applyAxisAngle(new THREE.Vector3(0,1,0),car.rotation.y)
      let ex=THREE.MathUtils.clamp(car.position.x+side.x,-86,86),ez=THREE.MathUtils.clamp(car.position.z+side.z,-86,86)
      if(collisionBoxes.some(box=>box.containsPoint(tmp.set(ex,2,ez)))||roadblockBoxes.some(box=>box.containsPoint(tmp.set(ex,2,ez)))||Array.from(responderBoxes.values()).some(box=>box.containsPoint(tmp.set(ex,2,ez)))||Array.from(responderNPCBoxes.values()).some(box=>box.containsPoint(tmp.set(ex,2,ez)))){ex=THREE.MathUtils.clamp(car.position.x-side.x,-86,86);ez=THREE.MathUtils.clamp(car.position.z-side.z,-86,86)}
      who.position.set(ex,0,ez);who.visible=true;controlled=who;car.userData.aiTraffic=false;car.userData.driveSpeed=0;car.rotation.z=0;activeCar=null;activeCarIndex=-1;driver=null;driveThrottle=0;driveBrake=0;driveSteer=0;driveHandbrake=0;driveSpeed=0;velocityX=0;velocityZ=0
      setDriveStatus('ON FOOT');setMessage(profile?'Exited powersport. It stays parked for re-entry.':'Exited vehicle. Character control restored; your car stays parked for re-entry.')
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-controlled',{detail:{entered:false,x:controlled.position.x,z:controlled.position.z,vehicleType:profile?'powersport':'car',ride:profile}}));if(profile)window.dispatchEvent(new CustomEvent('tryamm:streetverse-powersport-controlled',{detail:{entered:false,x:controlled.position.x,z:controlled.position.z,ride:profile}}))
    }
    const onVehicleInteract=(event:Event)=>{const d=(event as CustomEvent<VehicleInteract>).detail||{};d.entered?enterCar():exitCar()}
    const onVehicleInput=(event:Event)=>{const d=(event as CustomEvent<VehicleInput>).detail||{};driveThrottle=THREE.MathUtils.clamp(Number(d.throttle||0),0,1);driveBrake=THREE.MathUtils.clamp(Number(d.brake||0),0,1);driveSteer=THREE.MathUtils.clamp(Number(d.steer||0),-1,1);driveHandbrake=typeof d.handbrake==='boolean'?(d.handbrake?1:0):THREE.MathUtils.clamp(Number(d.handbrake||0),0,1);if(d.horn&&!hornDown){hornDown=true;window.dispatchEvent(new CustomEvent('tryamm:streetverse-drive-sound',{detail:{kind:'horn'}}))}if(!d.horn)hornDown=false;if(d.exit)exitCar()}
    addEventListener('tryamm:streetverse-vehicle-interact',onVehicleInteract)
    addEventListener('tryamm:streetverse-vehicle-input',onVehicleInput)

    const dogs:THREE.Group[]=[];for(let i=0;i<3;i++){const dog=new THREE.Group();const dogBody=new THREE.Mesh(new THREE.BoxGeometry(1.6,.75,.7),material(i?0x8a5b35:0x303033));dogBody.position.y=.75;dog.add(dogBody);dog.position.set(-20+i*22,0,62-i*15);scene.add(dog);dogs.push(dog)}
    const birds:THREE.Mesh[]=[];for(let i=0;i<9;i++){const bird=new THREE.Mesh(new THREE.ConeGeometry(.28,.8,5),material(0xd9e8f5,.15,.7));bird.rotation.z=Math.PI/2;scene.add(bird);birds.push(bird)}
    const beacons=new Map<string,THREE.Group>();MISSIONS.forEach(m=>{const g=new THREE.Group();g.position.set(m.x,0,m.z);const ring=new THREE.Mesh(new THREE.TorusGeometry(2.4,.22,12,44),new THREE.MeshBasicMaterial({color:0xffd45e}));ring.rotation.x=Math.PI/2;ring.position.y=.35;g.add(ring);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.35,.9,12,18,1,true),new THREE.MeshBasicMaterial({color:0x55ddff,transparent:true,opacity:.2,side:THREE.DoubleSide}));beam.position.y=6;g.add(beam);scene.add(g);beacons.set(m.id,g)})

    const keys=new Set<string>();const down=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift','h',' '].includes(k)){e.preventDefault();keys.add(k)}if(k==='e'){e.preventDefault();activeCar?exitCar():enterCar()}};const up=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase());addEventListener('keydown',down,{passive:false});addEventListener('keyup',up)
    const resize=()=>{const w=mount.clientWidth,h=Math.max(420,mount.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};const ro=new ResizeObserver(resize);ro.observe(mount);resize()
    const clock=new THREE.Clock(),desiredCam=new THREE.Vector3(),forward=new THREE.Vector3(),right=new THREE.Vector3();let raf=0,lastSave=0,elapsed=0,lastWorldPulse=0,lastSignalPhase=-1,lastDrivePulse=0,lastImpact=0
    const collides=(x:number,z:number)=>collisionBoxes.some(box=>box.containsPoint(tmp.set(x,2,z)))||roadblockBoxes.some(box=>box.containsPoint(tmp.set(x,2,z)))||Array.from(responderBoxes.values()).some(box=>box.containsPoint(tmp.set(x,2,z)))||Array.from(responderNPCBoxes.values()).some(box=>box.containsPoint(tmp.set(x,1.4,z)))
    const carHitsTraffic=(car:THREE.Group,x:number,z:number)=>cars.some(other=>other!==car&&Math.hypot(other.position.x-x,other.position.z-z)<(car.userData.nativePowersport||other.userData.nativePowersport?2.25:3.3))||aiRacerDefs.some(r=>r.car.visible&&r.car!==car&&Math.hypot(r.car.position.x-x,r.car.position.z-z)<3.5)||Array.from(responderVehicles.values()).some(r=>Math.hypot(r.position.x-x,r.position.z-z)<3.7)||Array.from(responderNPCs.values()).some(r=>Math.hypot(r.position.x-x,r.position.z-z)<1.6)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-enter',{detail:{district:'01',residents:npcs.length,vehicles:cars.length,smartIntersections:true,chicagoTransitAirportDepth:true,drivableVehicles:true,lateralGripPhysics:true,integratedAIRacers:true,surfaceGrip:true,emergencyCityReaction:true,roadblockGeometry:true,nativeResponderVehicles:true,nativeResponderNPCs:true,nativePowersports:true}}))

    const animate=()=>{
      const dt=Math.min(.033,clock.getDelta());elapsed+=dt
      const phase=Math.floor(elapsed/8)%2;const eastWestGreen=phase===0;const emergencySignals=!!signalOverride.active||!!trafficReaction.crossTrafficRed
      if(phase!==lastSignalPhase||emergencySignals){lastSignalPhase=phase;setSignalStatus(emergencySignals?'EMERGENCY PRIORITY • CROSS TRAFFIC RED':eastWestGreen?'E/W GO • N/S WALK':'N/S GO • E/W WALK');window.dispatchEvent(new CustomEvent('tryamm:streetverse-signal',{detail:{eastWestGreen,phase,emergencyOverride:emergencySignals}}))}
      signalLights.forEach(s=>{(s.lamp.material as THREE.MeshBasicMaterial).color.setHex(emergencySignals?0xff3f54:(s.axis==='x'?eastWestGreen:!eastWestGreen)?0x43ff7b:0xff3f54)})
      if(roadblockState.active){const flash=Math.floor(elapsed*6)%2===0;roadblockRoot.traverse(o=>{if(o.userData.roadblockBeacon&&o instanceof THREE.Mesh){const m=o.material as THREE.MeshBasicMaterial;m.opacity=flash?1:.18}})}
      if(responderVehicles.size){const flash=Math.floor(elapsed*8)%2===0;responderRoot.traverse(o=>{if(o instanceof THREE.Mesh&&o.userData.responderBeacon){const m=o.material as THREE.MeshBasicMaterial;m.opacity=o.userData.responderBeacon==='left'?(flash?1:.15):(flash?.15:1)}})}
      responderNPCs.forEach((npc,i)=>{const moving=String(npc.userData.responderStatus||'').toLowerCase()==='moving';npc.position.y=moving?Math.sin(elapsed*9+i)*.035:0})
      const input=inputRef.current;let dx=0,dz=0;if(keys.has('w')||keys.has('arrowup')||input.up)dz-=1;if(keys.has('s')||keys.has('arrowdown')||input.down)dz+=1;if(keys.has('a')||keys.has('arrowleft')||input.left)dx-=1;if(keys.has('d')||keys.has('arrowright')||input.right)dx+=1
      const gp=(navigator.getGamepads?.()||[])[0];if(gp){dx+=Math.abs(gp.axes[0]||0)>.18?(gp.axes[0]||0):0;dz+=Math.abs(gp.axes[1]||0)>.18?(gp.axes[1]||0):0}

      if(activeCar&&!paused){
        const profile=activeCar.userData.powersportProfile as NativePowersportDetail|undefined,handling=profile?.handling||{},rideWheels=Math.max(2,Number(profile?.wheels||4))
        const keyThrottle=(keys.has('w')||keys.has('arrowup')||input.up)?1:0,keyBrake=(keys.has('s')||keys.has('arrowdown')||input.down)?1:0,keySteer=((keys.has('a')||keys.has('arrowleft')||input.left)?-1:0)+((keys.has('d')||keys.has('arrowright')||input.right)?1:0)
        const gpThrottle=gp?.buttons?.[7]?.value||0,gpBrake=gp?.buttons?.[6]?.value||0,gpSteer=Math.abs(gp?.axes?.[0]||0)>.18?(gp?.axes?.[0]||0):0,gpHandbrake=gp?.buttons?.[0]?.pressed?1:0
        const throttle=Math.max(driveThrottle,keyThrottle,gpThrottle),brake=Math.max(driveBrake,keyBrake,gpBrake),steer=THREE.MathUtils.clamp(Math.abs(driveSteer)>Math.abs(gpSteer)?driveSteer:(keySteer||gpSteer),-1,1),handbrake=Math.max(driveHandbrake,keys.has(' ')?1:0,gpHandbrake)
        const surface=surfaceAt(activeCar.position.x,activeCar.position.z)
        forward.set(Math.cos(activeCar.rotation.y),0,-Math.sin(activeCar.rotation.y));right.set(-forward.z,0,forward.x)
        let longitudinal=velocityX*forward.x+velocityZ*forward.z
        let lateral=velocityX*right.x+velocityZ*right.z
        const rideGrip=THREE.MathUtils.clamp(Number(handling.grip||1),.58,1.12),rideSteer=THREE.MathUtils.clamp(Number(handling.steer||1),.72,1.42),rideRoll=THREE.MathUtils.clamp(Number(handling.roll||.25),.08,.8)
        const accel=profile?18+rideGrip*10:25,decel=profile?29:32,drag=profile?5.8:7.2,maxForward=profile?(rideWheels===2?43:String(profile.id||'').includes('kart')?34:38):39,maxReverse=profile?-7:-14
        if(throttle>0)longitudinal+=accel*surface.accel*throttle*dt
        if(brake>0&&longitudinal>0)longitudinal-=decel*brake*dt;else if(brake>0)longitudinal-=accel*.72*brake*dt
        if(!throttle&&!brake)longitudinal-=Math.sign(longitudinal)*Math.min(Math.abs(longitudinal),drag*dt)
        longitudinal=THREE.MathUtils.clamp(longitudinal,maxReverse,maxForward)
        const speedAbs=Math.abs(longitudinal),steerScale=THREE.MathUtils.clamp(speedAbs/7,.18,1)
        const yawGrip=(handbrake?2.45:1.62)*rideSteer;activeCar.rotation.y-=steer*yawGrip*steerScale*dt*(longitudinal>=0?1:-1)
        const lateralKick=steer*speedAbs*(handbrake?.92:.16)*dt;lateral+=lateralKick
        const grip=(handbrake?1.15:(brake>.65?3.4:7.4))*surface.grip*rideGrip;lateral*=Math.max(0,1-grip*dt)
        const burnout=throttle>.75&&brake>.55&&speedAbs<8;const wheelspin=throttle>.82&&speedAbs<12
        if(burnout)lateral+=steer*(4.2+throttle*3)*dt
        forward.set(Math.cos(activeCar.rotation.y),0,-Math.sin(activeCar.rotation.y));right.set(-forward.z,0,forward.x)
        velocityX=forward.x*longitudinal+right.x*lateral;velocityZ=forward.z*longitudinal+right.z*lateral
        const nx=THREE.MathUtils.clamp(activeCar.position.x+velocityX*dt,-87,87),nz=THREE.MathUtils.clamp(activeCar.position.z+velocityZ*dt,-87,87)
        const hitWorld=collides(nx,nz),hitTraffic=carHitsTraffic(activeCar,nx,nz)
        if(!hitWorld&&!hitTraffic){activeCar.position.x=nx;activeCar.position.z=nz}else{const impact=Math.hypot(velocityX,velocityZ);velocityX*=-.2;velocityZ*=-.2;longitudinal*=-.18;lateral*=-.12;if(performance.now()-lastImpact>350){lastImpact=performance.now();window.dispatchEvent(new CustomEvent('tryamm:streetverse-drive-sound',{detail:{kind:'impact',speed:impact}}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-collision',{detail:{kind:hitTraffic?'traffic':'world',speed:impact,x:activeCar.position.x,z:activeCar.position.z,vehicleType:profile?'powersport':'car',ride:profile}}))}}
        driveSpeed=longitudinal;const slipAngle=Math.min(90,Math.abs(Math.atan2(lateral,Math.max(1,Math.abs(longitudinal)))*180/Math.PI));const drifting=slipAngle>8&&speedAbs>11
        const lean=profile?THREE.MathUtils.clamp(-steer*speedAbs*.006*(1+rideRoll*2),-.24,.24):THREE.MathUtils.clamp(-steer*speedAbs*.006,-.11,.11);activeCar.rotation.z=THREE.MathUtils.lerp(activeCar.rotation.z,lean,1-Math.pow(.02,dt))
        if((brake>.55||handbrake>.2)&&speedAbs>10&&performance.now()-lastDrivePulse>260){lastDrivePulse=performance.now();window.dispatchEvent(new CustomEvent('tryamm:streetverse-drive-sound',{detail:{kind:'brake',speed:speedAbs,handbrake:handbrake>0}}))}
        if((drifting||burnout)&&performance.now()-lastDrivePulse>260){lastDrivePulse=performance.now();window.dispatchEvent(new CustomEvent('tryamm:streetverse-drive-sound',{detail:{kind:'skid',speed:speedAbs,slipAngle,burnout,surface:surface.name}}))}
        if(keys.has('h')&&!hornDown){hornDown=true;window.dispatchEvent(new CustomEvent('tryamm:streetverse-drive-sound',{detail:{kind:'horn'}}))}if(!keys.has('h')&&!driveThrottle)hornDown=false
        activeCar.userData.driveSpeed=driveSpeed
        const detail={entered:true,index:activeCarIndex,speed:Math.hypot(velocityX,velocityZ),signedSpeed:driveSpeed,throttle,brake,steer,handbrake,heading:activeCar.rotation.y,velocityX,velocityZ,lateralSpeed:lateral,slipAngle,drifting,burnout,wheelspin,surface:surface.name,gripMultiplier:surface.grip*rideGrip,x:activeCar.position.x,z:activeCar.position.z,vehicleType:profile?'powersport':'car',ride:profile,vehicleClass:profile?.className,wheels:profile?.wheels,stunts:profile?.stunts};window.dispatchEvent(new CustomEvent('tryamm:streetverse-drive-telemetry',{detail}));if(profile)window.dispatchEvent(new CustomEvent('tryamm:streetverse-powersport-telemetry',{detail}))
      }else if(!paused&&(dx||dz)){
        const len=Math.hypot(dx,dz)||1;dx/=len;dz/=len;const speed=(keys.has('shift')?28:18)*dt;const nx=THREE.MathUtils.clamp(controlled.position.x+dx*speed,-88,88),nz=THREE.MathUtils.clamp(controlled.position.z+dz*speed,-88,88);if(!collides(nx,controlled.position.z))controlled.position.x=nx;if(!collides(controlled.position.x,nz))controlled.position.z=nz;controlled.rotation.y=Math.atan2(dx,dz)
      }
      npcs.forEach((npc,i)=>{if(i===controlledIndex||npc===driver){npc.position.y=0;return}const r=npc.userData.route as ResidentRoute;const emergencyDistance=Math.hypot(npc.position.x-Number(pedestrianReaction.x||0),npc.position.z-Number(pedestrianReaction.z||0));const emergencyNear=!!pedestrianReaction.active&&emergencyDistance<=Number(pedestrianReaction.radius||22);const walkAllowed=emergencySignals?false:(r.axis==='x'?!eastWestGreen:eastWestGreen);const current=r.axis==='x'?npc.position.x:npc.position.z;const stop=emergencyNear||(approachingIntersection(current,r.dir)&&!walkAllowed);const speed=stop?0:r.speed;const travel=wrap(-88+elapsed*speed*r.dir+r.phase);const stepBack=emergencyNear?(i%2?2.2:-2.2):0;if(r.axis==='x'){npc.position.x=travel;npc.position.z=r.fixed+stepBack;npc.rotation.y=r.dir>0?Math.PI/2:-Math.PI/2}else{npc.position.x=r.fixed+stepBack;npc.position.z=travel;npc.rotation.y=r.dir>0?0:Math.PI}npc.position.y=Math.sin(elapsed*5+i)*.025})
      cars.forEach((car)=>{if(car===activeCar||car.userData.aiTraffic===false)return;const t=car.userData.traffic as Traffic;if(!t)return;const current=t.axis==='x'?car.position.x:car.position.z;const green=emergencySignals?false:(t.axis==='x'?eastWestGreen:!eastWestGreen);const stop=approachingIntersection(current,t.dir)&&!green;const multiplier=trafficReaction.active?THREE.MathUtils.clamp(Number(trafficReaction.speedMultiplier||.28),.1,1):1;const emergencyDistance=Math.hypot(car.position.x-Number(trafficReaction.x||0),car.position.z-Number(trafficReaction.z||0));const nearRoute=!!trafficReaction.active&&emergencyDistance<30;const effective=stop?0:t.speed*(nearRoute?multiplier:Math.max(multiplier,.55));const travel=wrap(-88+elapsed*effective*t.dir+t.phase);const pull=trafficReaction.pullAside&&nearRoute?(t.dir>0?1.6:-1.6):0;if(t.axis==='x'){car.position.x=travel;car.position.z=t.roadCenter+t.laneOffset+pull;car.rotation.y=t.dir>0?0:Math.PI}else{car.position.x=t.roadCenter+t.laneOffset+pull;car.position.z=travel;car.rotation.y=t.dir>0?-Math.PI/2:Math.PI/2}car.userData.emergencyYield=nearRoute;car.userData.driveSpeed=effective})
      dogs.forEach((dog,i)=>{dog.position.x+=Math.sin(elapsed*.8+i)*dt*.8;dog.rotation.y=Math.sin(elapsed+i)});birds.forEach((bird,i)=>{const a=elapsed*.35+i*.68,b=26+i%3*4;bird.position.set(Math.cos(a)*b,18+i%3*3,Math.sin(a)*b);bird.rotation.y=-a});trees.forEach((tree,i)=>{tree.rotation.z=Math.sin(elapsed*.7+i)*.015})
      MISSIONS.forEach(m=>{const g=beacons.get(m.id);if(g)g.rotation.y+=dt*.9;const d=Math.hypot(controlled.position.x-m.x,controlled.position.z-m.z);if(d<4.5&&!visitedRef.current.includes(m.id)){const next=[...visitedRef.current,m.id];visitedRef.current=next;setVisited(next);setMessage(`Checkpoint reached: ${m.label}. ${MISSIONS.length-next.length} district objective${MISSIONS.length-next.length===1?'':'s'} remaining.`)}})
      const day=(Math.sin(elapsed*.03)+1)/2;sun.intensity=1.5+day*2.4;hemi.intensity=1.4+day*1.6;streetLights.forEach(g=>{g.visible=day<.56})
      if(activeCar){forward.set(Math.cos(activeCar.rotation.y),0,-Math.sin(activeCar.rotation.y));const profile=activeCar.userData.powersportProfile as NativePowersportDetail|undefined;const back=profile?9.5:13,up=profile?6.2:7.5,ahead=profile?5.5:7;desiredCam.set(activeCar.position.x-forward.x*back,up,activeCar.position.z-forward.z*back);camera.position.lerp(desiredCam,1-Math.pow(.0003,dt));camera.lookAt(activeCar.position.x+forward.x*ahead,profile?1.2:1.6,activeCar.position.z+forward.z*ahead)}else{desiredCam.set(controlled.position.x,11,controlled.position.z+16);camera.position.lerp(desiredCam,1-Math.pow(.001,dt));camera.lookAt(controlled.position.x,2.5,controlled.position.z-4)}
      const now=performance.now(),activeProfile=activeCar?.userData.powersportProfile as NativePowersportDetail|undefined;window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-position',{detail:{x:controlled.position.x,z:controlled.position.z,character:activeCar?(activeProfile?String(activeProfile.label||activeProfile.id||'POWERSPORT'):`VEHICLE ${activeCarIndex+1}`):activeCharacter,index:activeCar?activeCarIndex:controlledIndex,vehicle:!!activeCar,vehicleType:activeProfile?'powersport':activeCar?'car':undefined,ride:activeProfile,speed:activeCar?Math.hypot(velocityX,velocityZ):0}}));if(now-lastWorldPulse>650){const car=cars[Math.floor(elapsed)%cars.length],npc=npcs[Math.floor(elapsed*1.7)%npcs.length];window.dispatchEvent(new CustomEvent('tryamm:world-sound',{detail:{kind:'vehicle',x:car.position.x,z:car.position.z,speed:Number((car.userData.traffic as Traffic)?.speed||car.userData.driveSpeed||0),level:.08}}));window.dispatchEvent(new CustomEvent('tryamm:world-sound',{detail:{kind:'footstep',x:npc.position.x,z:npc.position.z,level:.035}}));lastWorldPulse=now}if(now-lastSave>900){localStorage.setItem(SAVE_KEY,JSON.stringify({x:controlled.position.x,z:controlled.position.z,controlledIndex,character:activeCharacter,vehicleIndex:activeCarIndex,powersport:activeProfile?.id,visited:visitedRef.current,updatedAt:new Date().toISOString()}));lastSave=now}
      renderer.render(scene,camera);raf=requestAnimationFrame(animate)
    }
    animate()
    return()=>{window.dispatchEvent(new CustomEvent('tryamm:streetverse-exit',{detail:{district:'01'}}));cancelAnimationFrame(raf);ro.disconnect();removeEventListener('keydown',down);removeEventListener('keyup',up);removeEventListener('tryamm:streetverse-character-select',onCharacterSelect);removeEventListener('tryamm:streetverse-vehicle-interact',onVehicleInteract);removeEventListener('tryamm:streetverse-vehicle-input',onVehicleInput);removeEventListener('tryamm:streetverse-native-powersport-request',onNativePowersport);removeEventListener('tryamm:streetverse-ai-opponent',onAIRacer);removeEventListener('tryamm:streetverse-ai-opponents-start',onAIStart);removeEventListener('tryamm:streetverse-mission-complete',onRaceEnd);removeEventListener('tryamm:streetverse-scene-close',onRaceEnd);removeEventListener('tryamm:streetverse-traffic-reaction',onTrafficReaction);removeEventListener('tryamm:streetverse-pedestrian-reaction',onPedestrianReaction);removeEventListener('tryamm:streetverse-signal-override',onSignalOverride);removeEventListener('tryamm:streetverse-roadblock-state',onRoadblockState);removeEventListener('tryamm:streetverse-responder-world-position',onResponderWorldPosition);removeEventListener('tryamm:streetverse-responder-npc-position',onResponderNPCPosition);removeEventListener('tryamm:streetverse-responder-npc-deployed',onResponderNPCDeployed);nativePowersports.clear();responderVehicles.clear();responderBoxes.clear();responderNPCs.clear();responderNPCBoxes.clear();renderer.dispose();renderer.domElement.remove()}
  },[paused])

  const press=(key:keyof typeof inputRef.current,value:boolean)=>{inputRef.current[key]=value}
  return <div role="dialog" aria-modal="true" aria-label="StreetVerse Living World" style={{position:'fixed',inset:0,zIndex:16000,background:'#02040a',color:'#fff',display:'grid',gridTemplateRows:'auto 1fr auto',fontFamily:'Inter,system-ui,sans-serif'}}>
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,padding:'9px 12px',background:'#050a12ee',borderBottom:'1px solid #28425a'}}><div><div style={{fontSize:9,fontWeight:950,letterSpacing:2,color:'#59e7ff'}}>STREETVERSE • CHICAGO • LIVING WORLD</div><div style={{fontWeight:950,fontSize:'clamp(18px,4vw,29px)'}}>District 01</div><div style={{fontSize:9,color:'#ffd45e',marginTop:3}}>PLAYING AS • {activeCharacter} • {driveStatus}</div></div><div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:9,color:'#8effb7'}}>{assetStatus}</span><button onClick={onClose} aria-label="Close StreetVerse" style={{width:42,height:42,borderRadius:13,border:'1px solid #3a5369',background:'#0c1520',color:'#fff',fontSize:22}}>×</button></div></header>
    <main style={{position:'relative',minHeight:0}}><div ref={mountRef} style={{position:'absolute',inset:0,minHeight:420}}/><div style={{position:'absolute',left:10,top:10,maxWidth:340,padding:10,borderRadius:14,background:'#030914dc',border:'1px solid #2b485e',backdropFilter:'blur(9px)'}}><div style={{fontSize:9,color:'#ffd45e',fontWeight:950}}>LIVING CITY MISSION</div><div style={{fontSize:12,lineHeight:1.45,marginTop:5}}>{message}</div><div style={{fontSize:10,marginTop:7,color:visited.length===MISSIONS.length?'#79ffad':'#b7c6d5'}}>{visited.length}/{MISSIONS.length} locations {visited.length===MISSIONS.length?'• DISTRICT COMPLETE ✓':''}</div></div><div style={{position:'absolute',right:10,top:10,display:'grid',gap:5,justifyItems:'end'}}><div style={{padding:'7px 9px',borderRadius:999,background:'#030914dc',border:'1px solid #2b485e',fontSize:9}}>24 PLAYABLE RESIDENTS • 20+ DRIVABLE VEHICLES • NATIVE POWERSPORTS • 3 AI RACERS • RESPONDER VEHICLES/NPCS • 3D ROADBLOCKS</div><div style={{padding:'7px 9px',borderRadius:999,background:'#030914dc',border:'1px solid #2b485e',fontSize:9,color:'#8effb7'}}>{signalStatus}</div></div></main>
    <footer style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:8,padding:'8px 10px',background:'#050912',borderTop:'1px solid #24384b'}}><div style={{fontSize:9,color:'#8fa5b7'}}>ON FOOT: WASD/arrows • Shift run • touch/gamepad • DRIVE/RIDE: W gas • S brake/reverse • A/D steer • SPACE handbrake • H horn • E enter/exit</div><div style={{display:'grid',gridTemplateColumns:'54px 54px 54px',gap:4,touchAction:'none',userSelect:'none'}}><span/><Pad label="▲" down={()=>press('up',true)} up={()=>press('up',false)}/><span/><Pad label="◀" down={()=>press('left',true)} up={()=>press('left',false)}/><Pad label="▼" down={()=>press('down',true)} up={()=>press('down',false)}/><Pad label="▶" down={()=>press('right',true)} up={()=>press('right',false)}/></div><div style={{display:'flex',justifyContent:'flex-end',gap:7}}><button onClick={()=>{localStorage.removeItem(SAVE_KEY);location.reload()}} style={smallBtn}>RESET</button><button onClick={()=>setPaused(v=>!v)} style={smallBtn}>{paused?'PLAY':'PAUSE'}</button></div></footer>
  </div>
}

function Pad({label,down,up}:{label:string;down:()=>void;up:()=>void}){return <button aria-label={`Move ${label}`} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);down()}} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} style={{width:54,height:44,borderRadius:12,border:'1px solid #4a6a82',background:'#0d1a28',color:'#fff',fontSize:17,fontWeight:900}}>{label}</button>}
const smallBtn:React.CSSProperties={border:'1px solid #3b5368',borderRadius:10,padding:'9px 10px',background:'#0d1722',color:'#fff',fontSize:9,fontWeight:900}