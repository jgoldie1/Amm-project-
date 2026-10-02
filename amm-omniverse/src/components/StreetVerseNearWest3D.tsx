import {Canvas,useFrame,useThree} from '@react-three/fiber'
import {compileNearWestRoadMeshes} from '../data/streetVerseNearWestRoadNetwork'
import {TAYLOR_STREET_CORRIDOR} from '../data/streetVerseCartesianNeighborhood'
import {NEAR_WEST_NPCS,NEAR_WEST_TRAFFIC} from '../data/streetVerseNearWestPopulation'
import CampusVerseCollegeBookBridge from './CampusVerseCollegeBookBridge'
import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {STREETVERSE_FUTURE_VEHICLES} from '../data/streetVerseFutureVehicles'
import StreetVerseFutureVehicleDealer from './StreetVerseFutureVehicleDealer'
import StreetVerseMyGarage,{type OwnedVehicle} from './StreetVerseMyGarage'
import {StreetVerseHitFx} from './StreetVerseHitFx'
import StreetVerseLiveRpPanel from './StreetVerseLiveRpPanel'
import StreetVerseCreatorGrowthPanel from './StreetVerseCreatorGrowthPanel'
import StreetVerseDiscordPanel from './StreetVerseDiscordPanel'
import {NEAR_WEST_BIRTHDAY_MISSIONS,requestMissionReward,type StreetVerseMission} from '../data/streetVerseBirthdayMissions'
import GreenvilleCampusVerseScene from './GreenvilleCampusVerseScene'

function MissionMarker({mission}:{mission:StreetVerseMission|null}){if(!mission)return null;return <group position={[mission.objective.x,0,mission.objective.z]}><mesh position={[0,2.5,0]}><cylinderGeometry args={[.7,.7,5,12]}/><meshStandardMaterial color="#f3c84b" emissive="#f3c84b" emissiveIntensity={.5} transparent opacity={.7}/></mesh><mesh position={[0,5.7,0]}><sphereGeometry args={[.9,12,10]}/><meshStandardMaterial color="#fff2a3" emissive="#f3c84b" emissiveIntensity={.8}/></mesh></group>}

function RoadMeshes(){
 const roads=compileNearWestRoadMeshes()
 return <group>
  {roads.map(r=><group key={r.id} position={[r.center.x,0,r.center.z]} rotation={[0,-r.headingRadians,0]}>
   <mesh receiveShadow position={[0,.02,0]}><boxGeometry args={[r.length,.08,r.width]}/><meshStandardMaterial color="#20252a" roughness={1}/></mesh>
   <mesh receiveShadow position={[0,.12,r.width/2+r.sidewalkWidth/2]}><boxGeometry args={[r.length,.22,r.sidewalkWidth]}/><meshStandardMaterial color="#c8c4b8" roughness={1}/></mesh>
   <mesh receiveShadow position={[0,.12,-r.width/2-r.sidewalkWidth/2]}><boxGeometry args={[r.length,.22,r.sidewalkWidth]}/><meshStandardMaterial color="#c8c4b8" roughness={1}/></mesh>
   <mesh position={[0,.16,r.width/2+.06]}><boxGeometry args={[r.length,.28,.18]}/><meshStandardMaterial color="#e7e2d7"/></mesh>
   <mesh position={[0,.16,-r.width/2-.06]}><boxGeometry args={[r.length,.28,.18]}/><meshStandardMaterial color="#e7e2d7"/></mesh>
   <mesh position={[0,.09,.16]}><boxGeometry args={[r.length,.025,.10]}/><meshStandardMaterial color="#f4cf45"/></mesh>
   <mesh position={[0,.09,-.16]}><boxGeometry args={[r.length,.025,.10]}/><meshStandardMaterial color="#f4cf45"/></mesh>
   <mesh position={[0,.09,r.width/2-.55]}><boxGeometry args={[r.length,.025,.09]}/><meshStandardMaterial color="#f6f4ec"/></mesh>
   <mesh position={[0,.09,-r.width/2+.55]}><boxGeometry args={[r.length,.025,.09]}/><meshStandardMaterial color="#f6f4ec"/></mesh>
  </group>)}
 </group>
}

function TaylorLots(){
 return <group>{TAYLOR_STREET_CORRIDOR.blocks.flatMap(block=>block.businesses.map((b,i)=>{
  const x=block.origin.x+b.lot.x,z=block.origin.z+b.lot.z
  return <group key={b.id} position={[x,0,z]}>
   <mesh castShadow receiveShadow position={[0,6,0]}><boxGeometry args={[18,12,16]}/><meshStandardMaterial color={i%2?'#7a3f2b':'#614b3d'}/></mesh>
   <mesh position={[0,2,-8.05]}><boxGeometry args={[3,4,.15]}/><meshStandardMaterial color="#173142"/></mesh>
   <mesh position={[0,7,-8.12]}><boxGeometry args={[11,1.4,.12]}/><meshStandardMaterial color="#e0c786"/></mesh>
  </group>
 }))}</group>
}


function JeffersonLegacyCampusMesh(){
 return <group position={[-820,0,575]}>
  <mesh castShadow receiveShadow position={[0,5,0]}><boxGeometry args={[42,10,28]}/><meshStandardMaterial color="#8b4a3b"/></mesh>
  <mesh position={[0,2,-14.1]}><boxGeometry args={[8,4,.25]}/><meshStandardMaterial color="#27485c"/></mesh>
  <mesh position={[0,9.2,-14.25]}><boxGeometry args={[26,1.5,.18]}/><meshStandardMaterial color="#e7dfcf"/></mesh>
  <mesh receiveShadow position={[25,.08,3]}><boxGeometry args={[18,.14,24]}/><meshStandardMaterial color="#d49b55"/></mesh>
  <mesh position={[25,.14,3]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[3,.12,6,36]}/><meshStandardMaterial color="#f7f3dd"/></mesh>
  <mesh position={[16,3.1,3]}><boxGeometry args={[.2,4.4,4]}/><meshStandardMaterial color="#f3f5ef"/></mesh>
  <mesh position={[34,3.1,3]}><boxGeometry args={[.2,4.4,4]}/><meshStandardMaterial color="#f3f5ef"/></mesh>
 </group>
}

function CircleParkWestSideMarker(){
 return <group position={[-850,0,835]}>
  <mesh receiveShadow position={[0,.2,0]}><cylinderGeometry args={[16,16,.35,32]}/><meshStandardMaterial color="#5c7a4f"/></mesh>
  <mesh position={[0,1.4,0]}><torusGeometry args={[9,.35,10,40]}/><meshStandardMaterial color="#e8c86a"/></mesh>
  <mesh position={[0,3,0]}><cylinderGeometry args={[.4,.4,6,10]}/><meshStandardMaterial color="#2f3b45"/></mesh>
 </group>
}


type MoveState={x:number;z:number}
function NearWestPlayer({move,onPosition,hidden=false,startPosition}:{move:React.MutableRefObject<MoveState>;onPosition:(x:number,z:number)=>void;hidden?:boolean;startPosition?:{x:number;z:number}}){
 const ref=useRef<THREE.Group>(null)
 const {camera}=useThree()
 useFrame((_,dt)=>{
  const p=ref.current;if(!p)return
  const speed=20
  p.position.x=THREE.MathUtils.clamp(p.position.x+move.current.x*speed*dt,-1180,560)
  p.position.z=THREE.MathUtils.clamp(p.position.z+move.current.z*speed*dt,380,1160)
  if(Math.abs(move.current.x)+Math.abs(move.current.z)>.05)p.rotation.y=Math.atan2(move.current.x,move.current.z)
  const target=new THREE.Vector3(p.position.x,p.position.y+6.5,p.position.z+14)
  camera.position.lerp(target,Math.min(1,dt*4));camera.lookAt(p.position.x,1.25,p.position.z)
  onPosition(p.position.x,p.position.z)
 })
 return <group ref={ref} visible={!hidden} position={[startPosition?.x??-650,0,startPosition?.z??700]}>
  <mesh position={[0,1.18,0]} castShadow><capsuleGeometry args={[.28,.82,5,10]}/><meshStandardMaterial color="#172c55" roughness={.82}/></mesh>
  <mesh position={[0,2.02,0]} castShadow scale={[.94,1.05,.92]}><sphereGeometry args={[.29,16,12]}/><meshStandardMaterial color="#79513c" roughness={.9}/></mesh>
  <mesh position={[0,2.22,-.03]} castShadow scale={[.96,.55,1]}><sphereGeometry args={[.30,14,10,0,Math.PI*2,0,Math.PI*.5]}/><meshStandardMaterial color="#17110f" roughness={1}/></mesh>
  {([-1,1] as const).map(side=><group key={side}>
   <mesh position={[side*.39,1.2,0]} rotation={[0,0,side*.08]} castShadow><capsuleGeometry args={[.075,.58,4,8]}/><meshStandardMaterial color="#79513c"/></mesh>
   <mesh position={[side*.16,.48,0]} castShadow><capsuleGeometry args={[.10,.58,4,8]}/><meshStandardMaterial color="#202329"/></mesh>
   <mesh position={[side*.16,.10,-.11]} castShadow><boxGeometry args={[.22,.14,.48]}/><meshStandardMaterial color="#111318"/></mesh>
   <mesh position={[side*.095,2.08,.255]}><sphereGeometry args={[.028,8,6]}/><meshStandardMaterial color="#17110f"/></mesh>
  </group>)}
  <mesh position={[0,1.12,.285]}><boxGeometry args={[.24,.05,.02]}/><meshStandardMaterial color="#c8a14b" metalness={.65} roughness={.3}/></mesh>
 </group>
}


function DrivenVehicle({vehicleId,move,onPosition,onHeading}:{vehicleId:string;move:React.MutableRefObject<MoveState>;onPosition:(x:number,z:number)=>void;onHeading:(yaw:number)=>void}){
 const v=STREETVERSE_FUTURE_VEHICLES.find(x=>x.id===vehicleId)
 const ref=useRef<THREE.Group>(null);const {camera}=useThree()
 const speedRef=useRef(0),steerRef=useRef(0)
 useFrame((_,dt)=>{const g=ref.current;if(!g||!v)return;const throttle=THREE.MathUtils.clamp(-move.current.z,-1,1),steerInput=THREE.MathUtils.clamp(move.current.x,-1,1),maxSpeed=Math.min(22,Math.max(8,v.speed));const targetSpeed=throttle*maxSpeed;speedRef.current=THREE.MathUtils.lerp(speedRef.current,targetSpeed,Math.min(1,(Math.abs(targetSpeed)>Math.abs(speedRef.current)?2.5:4.2)*dt));if(Math.abs(throttle)<.03)speedRef.current=THREE.MathUtils.lerp(speedRef.current,0,Math.min(1,4.6*dt));if(Math.abs(speedRef.current)<.04)speedRef.current=0;steerRef.current=THREE.MathUtils.lerp(steerRef.current,steerInput,Math.min(1,4.2*dt));const speedRatio=THREE.MathUtils.clamp(Math.abs(speedRef.current)/maxSpeed,0,1),turnScale=THREE.MathUtils.lerp(.90,.42,speedRatio);if(Math.abs(speedRef.current)>.08)g.rotation.y-=steerRef.current*Math.min(1.05,v.handling*.82)*turnScale*dt*(speedRef.current<0?-1:1);const forward=new THREE.Vector3(Math.sin(g.rotation.y),0,Math.cos(g.rotation.y));g.position.addScaledVector(forward,speedRef.current*dt);g.position.x=THREE.MathUtils.clamp(g.position.x,-1180,560);g.position.z=THREE.MathUtils.clamp(g.position.z,380,1160);const chase=new THREE.Vector3(g.position.x-forward.x*13,g.position.y+7,g.position.z-forward.z*13);camera.position.lerp(chase,Math.min(1,dt*3.7));camera.lookAt(g.position.x,g.position.y+1,g.position.z);onPosition(g.position.x,g.position.z);onHeading(g.rotation.y)})
 if(!v)return null
 const long=v.kind==='armored-utility'?5.6:v.kind==='cyber-shuttle'?5.2:v.kind==='hypercar'?4.8:2.7
 return <group ref={ref} position={[v.spawn.x,0,v.spawn.z]}><mesh castShadow position={[0,.9,0]}><boxGeometry args={[long,v.kind==='ring-bike'?.75:1.15,v.kind==='ring-bike'?1.1:2.15]}/><meshStandardMaterial color={v.visual.body} metalness={.7} roughness={.25}/></mesh><mesh position={[0,.8,-1.1]}><boxGeometry args={[long*.65,.12,.08]}/><meshStandardMaterial color={v.visual.accent} emissive={v.visual.accent} emissiveIntensity={.5}/></mesh></group>
}

function FutureVehicleMeshes({exclude}:{exclude?:string}){return <group>{STREETVERSE_FUTURE_VEHICLES.filter(v=>v.id!==exclude).map(v=>{
 const long=v.kind==='armored-utility'?5.6:v.kind==='cyber-shuttle'?5.2:v.kind==='hypercar'?4.8:2.7
 const high=v.kind==='armored-utility'?1.55:v.kind==='ring-bike'?.75:1.05
 return <group key={v.id} position={[v.spawn.x,0,v.spawn.z]}>
  <mesh castShadow position={[0,high/2+.35,0]}><boxGeometry args={[long,high,v.kind==='ring-bike'?1.1:2.15]}/><meshStandardMaterial color={v.visual.body} metalness={.65} roughness={.28}/></mesh>
  {v.kind==='ring-bike'?<>
   <mesh rotation={[Math.PI/2,0,0]} position={[-.9,.75,0]}><torusGeometry args={[.72,.11,10,24]}/><meshStandardMaterial color={v.visual.accent} emissive={v.visual.accent} emissiveIntensity={.4}/></mesh>
   <mesh rotation={[Math.PI/2,0,0]} position={[.9,.75,0]}><torusGeometry args={[.72,.11,10,24]}/><meshStandardMaterial color={v.visual.accent} emissive={v.visual.accent} emissiveIntensity={.4}/></mesh>
  </>:([-1,1] as const).flatMap(side=>([-1,1] as const).map(front=><mesh key={side+':'+front} rotation={[Math.PI/2,0,0]} position={[front*long*.32,.48,side*1.02]}><cylinderGeometry args={[.48,.48,.28,16]}/><meshStandardMaterial color={v.visual.wheel}/></mesh>))}
  <mesh position={[0,.78,-1.09]}><boxGeometry args={[long*.65,.13,.08]}/><meshStandardMaterial color={v.visual.accent} emissive={v.visual.accent} emissiveIntensity={.5}/></mesh>
 </group>
})}</group>}

function PopulationMeshes({reaction}:{reaction:{id:string;reaction:'stagger'|'downed'}|null}){return <group>
 {NEAR_WEST_NPCS.map((n,i)=><group key={n.id} rotation={[0,0,reaction?.id===n.id?(reaction.reaction==='downed'?1.45:.28):0]} position={[n.position.x,0,n.position.z]}>
  <mesh position={[0,1.02,0]} castShadow><capsuleGeometry args={[.24,.68,4,8]}/><meshStandardMaterial color={i%3===0?'#315b7a':i%3===1?'#704936':'#485b3b'}/></mesh>
  <mesh position={[0,1.78,0]}><sphereGeometry args={[.23,12,9]}/><meshStandardMaterial color={i%4===0?'#6f442f':i%4===1?'#8f654c':i%4===2?'#b57651':'#5b3829'}/></mesh>
  <mesh position={[0,1.96,-.02]} scale={[.95,.50,1]}><sphereGeometry args={[.235,10,8,0,Math.PI*2,0,Math.PI*.5]}/><meshStandardMaterial color={i%2?'#1c1715':'#2b211d'}/></mesh>
  {([-1,1] as const).map(side=><group key={side}><mesh position={[side*.34,1.02,0]} rotation={[0,0,side*.08]}><capsuleGeometry args={[.065,.48,3,7]}/><meshStandardMaterial color={i%4===0?'#6f442f':'#8f654c'}/></mesh><mesh position={[side*.13,.38,0]}><capsuleGeometry args={[.085,.46,3,7]}/><meshStandardMaterial color="#222831"/></mesh></group>)}
 </group>)}
 {NEAR_WEST_TRAFFIC.map((v,i)=><group key={v.id} position={[v.position.x,0,v.position.z]} rotation={[0,i%2?Math.PI:0,0]}><mesh position={[0,.62,0]} castShadow><boxGeometry args={[v.kind==='bus'?7:4.2,1.05,v.kind==='bus'?2.4:1.9]}/><meshStandardMaterial color={i%2?'#314c66':'#742f2f'} metalness={.35} roughness={.35}/></mesh><mesh position={[0,1.25,0]}><boxGeometry args={[v.kind==='bus'?5.6:2.2,.5,v.kind==='bus'?2.0:1.5]}/><meshStandardMaterial color="#8fc9df" metalness={.2} roughness={.15}/></mesh></group>)}
 </group>}

export default function StreetVerseNearWest3D(){
 const [collegeBookOpen,setCollegeBookOpen]=useState(false)
 const [greenvilleOpen,setGreenvilleOpen]=useState(false)
 const [dealerOpen,setDealerOpen]=useState(false)
 const [garageOpen,setGarageOpen]=useState(false)
 const [liveRpOpen,setLiveRpOpen]=useState(false)
 const [creatorGrowthOpen,setCreatorGrowthOpen]=useState(false)
 const [discordOpen,setDiscordOpen]=useState(false)
 const [driving,setDriving]=useState<string|null>(null)
 const [playerSpawn,setPlayerSpawn]=useState({x:-650,z:700})
 const [vehicleAmmo,setVehicleAmmo]=useState(12)
 const [vehicleAimSide,setVehicleAimSide]=useState<'left'|'right'>('left')
 const [hitFx,setHitFx]=useState<{id:number;position:[number,number,number]}|null>(null)
 const [safeZone,setSafeZone]=useState<string|null>(null)
 const [activeMission,setActiveMission]=useState<StreetVerseMission|null>(null)
 const [missionReady,setMissionReady]=useState(false)
 const [missionStep,setMissionStep]=useState<'talk'|'repair'|'drive'|'deliver'>('talk')
 const [npcReaction,setNpcReaction]=useState<{id:string;reaction:'stagger'|'downed'}|null>(null)
 const drivenPosition=useRef({x:-650,z:700})
 const drivenHeading=useRef(0)
 const [nearby,setNearby]=useState<{kind:'npc'|'business'|'vehicle';id:string;label:string;mission?:string}|null>(null)
 const lastNearby=useRef('')
 const move=useRef<MoveState>({x:0,z:0})
 const setMove=(x:number,z:number)=>{move.current={x,z}}
 const stopMove=()=>{move.current={x:0,z:0}}
 const senseNearby=(x:number,z:number)=>{
  if(activeMission&&missionStep==='deliver'){const d=Math.hypot(activeMission.objective.x-x,activeMission.objective.z-z);setMissionReady(prev=>prev===(d<16)?prev:d<16)}
  const protectedArea=(x>-900&&x<-560&&z>500&&z<850)?'UIC CAMPUS SAFE ZONE':(x>-560&&x<-250&&z>500&&z<860)?'MEDICAL DISTRICT SAFE ZONE':null
  setSafeZone(prev=>prev===protectedArea?prev:protectedArea)
  const targets=[
   ...NEAR_WEST_NPCS.map(n=>({kind:'npc' as const,id:n.id,label:n.displayName,mission:n.missionHook,x:n.position.x,z:n.position.z})),
   ...NEAR_WEST_TRAFFIC.map(v=>({kind:'vehicle' as const,id:v.id,label:v.kind==='bus'?'Bus':'Vehicle',x:v.position.x,z:v.position.z})),
   ...STREETVERSE_FUTURE_VEHICLES.map(v=>({kind:'vehicle' as const,id:v.id,label:v.name,mission:v.missionHooks[0],x:v.spawn.x,z:v.spawn.z})),
   ...TAYLOR_STREET_CORRIDOR.blocks.flatMap(block=>block.businesses.map(b=>({kind:'business' as const,id:b.id,label:b.displayName||'Taylor Street Business',mission:b.missionIds?.[0],x:block.origin.x+b.lot.x,z:block.origin.z+b.lot.z})))
  ]
  let best:any=null,dist=999
  for(const t of targets){const d=Math.hypot(t.x-x,t.z-z);if(d<dist){best=t;dist=d}}
  const next=best&&dist<14?{kind:best.kind,id:best.id,label:best.label,mission:best.mission}:null
  const key=next?next.kind+':'+next.id:''
  if(key!==lastNearby.current){lastNearby.current=key;setNearby(next)}
 }
 const vehicleFire=()=>{
  if(!driving||vehicleAmmo<=0||safeZone)return
  setVehicleAmmo(a=>Math.max(0,a-1))
  const origin=drivenPosition.current,yaw=drivenHeading.current
  const forward={x:Math.sin(yaw),z:Math.cos(yaw)}
  const side=vehicleAimSide==='left'?-1:1
  const aim={x:forward.x*.45+forward.z*side*.89,z:forward.z*.45-forward.x*side*.89}
  const candidates=NEAR_WEST_NPCS.map(n=>{const dx=n.position.x-origin.x,dz=n.position.z-origin.z,dist=Math.hypot(dx,dz)||1;return {n,dist,dot:(dx/dist)*aim.x+(dz/dist)*aim.z}}).filter(x=>x.dist<38&&x.dot>.86).sort((a,b)=>b.dot-a.dot||a.dist-b.dist)
  const target=candidates[0]?.n
  if(target){setNpcReaction({id:target.id,reaction:'stagger'});window.setTimeout(()=>setNpcReaction(r=>r?.id===target.id?{id:target.id,reaction:'downed'}:r),420);window.setTimeout(()=>setNpcReaction(r=>r?.id===target.id?null:r),5000);setHitFx({id:Date.now(),position:[target.position.x,1.15,target.position.z]});window.dispatchEvent(new CustomEvent('tryamm:streetverse-npc-hit',{detail:{targetId:target.id,damage:25,source:'fictional-vehicle-gameplay',aimSide:vehicleAimSide}}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-npc-consequence',{detail:{targetId:target.id,reaction:'stagger',missionConsequence:true}}))}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-action',{detail:{action:'fictional-fire',vehicleId:driving,side:vehicleAimSide,ammoAfter:vehicleAmmo-1,source:'vehicle-gameplay'}}))
 }
 const doAction=()=>{
  if(!nearby)return
  if(activeMission&&missionStep==='talk'&&nearby.kind==='npc'){setMissionStep('repair');window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-step',{detail:{missionId:activeMission.id,step:'talk-complete',targetId:nearby.id}}));return}
  if(activeMission&&missionStep==='repair'&&nearby.kind==='vehicle'){setMissionStep('drive');window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-step',{detail:{missionId:activeMission.id,step:'repair-complete',vehicleId:nearby.id}}));return}
  if(activeMission&&missionStep==='drive'&&nearby.kind==='vehicle'){setMissionStep('deliver');setDriving(nearby.id);window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-step',{detail:{missionId:activeMission.id,step:'drive-started',vehicleId:nearby.id}}));return}
  const action=nearby.kind==='npc'?'talk':nearby.kind==='business'?'enter':'enter-vehicle'
  if(nearby.kind==='vehicle')setDriving(nearby.id)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-gameplay-action',{detail:{action,target:nearby,source:'near-west-context-action'}}))
  if(nearby.mission)window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail:{missionId:nearby.mission,target:nearby.id}}))
 }
 const travelToGreenville=()=>{setCollegeBookOpen(false);window.dispatchEvent(new CustomEvent('tryamm:campusverse-travel',{detail:{from:'uic',to:'greenville',character:'Jacobie',source:'streetverse-uic-gateway'}}));setGreenvilleOpen(true)}
 useEffect(()=>{const open=(e:Event)=>{const d=(e as CustomEvent).detail||{};if(d.to==='greenville'){setCollegeBookOpen(false);setGreenvilleOpen(true)}};window.addEventListener('tryamm:campusverse-travel',open);return()=>window.removeEventListener('tryamm:campusverse-travel',open)},[])
 useEffect(()=>{const route=(e:Event)=>{const d=(e as CustomEvent<{campus?:string;hubId?:string;label?:string}>).detail||{};if(d.campus!=='uic')return;const hubs:Record<string,{x:number;z:number}>={'student-center-east':{x:-760,z:610},'daley-library':{x:-815,z:635},'taylor-street-building':{x:-560,z:700},'roosevelt-road-building':{x:-690,z:560}};const target=hubs[String(d.hubId||'')];if(!target)return;setPlayerSpawn(target);setCollegeBookOpen(false);window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:`UIC ROUTE • ${String(d.label||'Campus destination')}`}}))};window.addEventListener('tryamm:campusverse-destination',route);return()=>window.removeEventListener('tryamm:campusverse-destination',route)},[])
 if(greenvilleOpen)return <GreenvilleCampusVerseScene onReturn={()=>setGreenvilleOpen(false)}/>
 return <div aria-label="StreetVerse Near West 3D" style={{width:'100%',height:'100%',minHeight:420}}>
  <div style={{position:'absolute',left:12,right:12,top:12,zIndex:22,display:'flex',gap:6,overflowX:'auto',paddingBottom:4,WebkitOverflowScrolling:'touch'}}>
   <button aria-label="Open Quantum Discord" onClick={()=>setDiscordOpen(true)} style={{flex:'0 0 auto',minHeight:44,padding:'8px 11px',borderRadius:13,fontWeight:950}}>💬 DISCORD</button>
   <button aria-label="Open StreetVerse creator pass" onClick={()=>setCreatorGrowthOpen(true)} style={{flex:'0 0 auto',minHeight:44,padding:'8px 11px',borderRadius:13,fontWeight:950}}>🌍 CREATOR PASS</button>
   <button aria-label="Open StreetVerse LIVE RP" onClick={()=>setLiveRpOpen(true)} style={{flex:'0 0 auto',minHeight:44,padding:'8px 11px',borderRadius:13,fontWeight:950}}>🔴 LIVE • PK</button>
   <button aria-label="Open My Garage" onClick={()=>setGarageOpen(true)} style={{flex:'0 0 auto',minHeight:44,padding:'8px 11px',borderRadius:13,fontWeight:950}}>🏠 GARAGE</button>
   <button aria-label="Open Future Mobility dealership" onClick={()=>setDealerOpen(true)} style={{flex:'0 0 auto',minHeight:44,padding:'8px 11px',borderRadius:13,fontWeight:950}}>🚘 MOBILITY</button></div>
  {discordOpen&&<StreetVerseDiscordPanel onClose={()=>setDiscordOpen(false)}/>}
  {creatorGrowthOpen&&<StreetVerseCreatorGrowthPanel onClose={()=>setCreatorGrowthOpen(false)}/>}
  {liveRpOpen&&<StreetVerseLiveRpPanel onClose={()=>setLiveRpOpen(false)}/>}
  {dealerOpen&&<StreetVerseFutureVehicleDealer onClose={()=>setDealerOpen(false)}/>} 
  {garageOpen&&<StreetVerseMyGarage onClose={()=>setGarageOpen(false)} onSpawn={(o:OwnedVehicle)=>{setGarageOpen(false);setDriving(o.vehicleId);window.dispatchEvent(new CustomEvent('tryamm:vehicle-spawn-request',{detail:{ownershipId:o.ownershipId,vehicleId:o.vehicleId,position:playerSpawn}}))}}/>}
  {driving&&<div aria-label="Vehicle action controls" style={{position:'absolute',left:12,top:70,zIndex:23,display:'grid',gap:6,width:170}}>
   <button aria-label="Switch vehicle aim side" onClick={()=>setVehicleAimSide(v=>v==='left'?'right':'left')} style={{minHeight:44,borderRadius:12,fontWeight:900}}>LEAN • {vehicleAimSide.toUpperCase()}</button>
   <button aria-label="Use fictional vehicle weapon" disabled={vehicleAmmo<=0||!!safeZone} onClick={vehicleFire} style={{minHeight:48,borderRadius:12,fontWeight:950}}>{safeZone?'SAFE ZONE':`FIRE • ${vehicleAmmo}`}</button>
  </div>}
  {driving&&<button aria-label="Exit vehicle" onClick={()=>{const p=drivenPosition.current;setPlayerSpawn({x:p.x+3,z:p.z});window.dispatchEvent(new CustomEvent('tryamm:streetverse-gameplay-action',{detail:{action:'exit-vehicle',vehicleId:driving,position:p}}));setDriving(null)}} style={{position:'absolute',right:12,top:12,zIndex:22,minHeight:48,padding:'9px 13px',borderRadius:14,fontWeight:950}}>EXIT VEHICLE</button>}
  {nearby&&!driving&&<button aria-label="Context action" onClick={doAction} style={{position:'absolute',right:12,bottom:190,zIndex:22,minWidth:162,minHeight:52,padding:'10px 14px',borderRadius:16,fontWeight:950,fontSize:16}}>ACTION • {activeMission&&missionStep==='repair'&&nearby.kind==='vehicle'?'REPAIR':activeMission&&missionStep==='drive'&&nearby.kind==='vehicle'?'DRIVE':nearby.kind==='npc'?'TALK':nearby.kind==='business'?'ENTER':'RIDE'}<small style={{display:'block',fontSize:10}}>{nearby.label}</small></button>}
  <div aria-label={driving?'One hand driving controls':'One hand movement controls'} style={{position:'absolute',right:12,bottom:18,zIndex:21,display:'grid',gridTemplateColumns:'54px 54px 54px',gridTemplateRows:'54px 54px 54px',gap:5,touchAction:'none'}}>
   <span/><button aria-label="Walk forward" onPointerDown={()=>setMove(0,driving?-2:-1)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{gridColumn:2,fontSize:24,borderRadius:14}}>▲</button><span/>
   <button aria-label="Walk left" onPointerDown={()=>setMove(driving?-1.4:-1,0)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{fontSize:24,borderRadius:14}}>◀</button>
   <button aria-label="Stop walking" onClick={stopMove} style={{fontSize:12,fontWeight:900,borderRadius:14}}>STOP</button>
   <button aria-label="Walk right" onPointerDown={()=>setMove(driving?1.4:1,0)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{fontSize:24,borderRadius:14}}>▶</button>
   <span/><button aria-label="Walk backward" onPointerDown={()=>setMove(0,driving?1.2:1)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{gridColumn:2,fontSize:24,borderRadius:14}}>▼</button><span/>
  </div>
  <div style={{position:'absolute',left:12,bottom:96,zIndex:24,display:'grid',gap:6,width:'min(218px,58vw)'}}>
   <button aria-label="Open UIC CollegeBook gateway" onClick={()=>setCollegeBookOpen(v=>!v)} style={{minHeight:44,padding:'8px 10px',borderRadius:12,fontWeight:900}}>🎓 UIC • CAMPUSVERSE</button>
   <button aria-label="Travel from UIC to Greenville CampusVerse" onClick={travelToGreenville} style={{minHeight:44,padding:'8px 10px',borderRadius:12,fontWeight:900}}>GREENVILLE • JACOBIE →</button>
   {collegeBookOpen&&<CampusVerseCollegeBookBridge onClose={()=>setCollegeBookOpen(false)}/>}
  </div>
  <Canvas shadows camera={{position:[-620,260,980],fov:55,far:5000}}>
   <color attach="background" args={['#88a8bf']}/>
   <ambientLight intensity={1.3}/><directionalLight castShadow position={[80,180,60]} intensity={2}/>
   <mesh receiveShadow position={[0,-.12,700]}><boxGeometry args={[2600,.2,1800]}/><meshStandardMaterial color="#58724c"/></mesh>
   <RoadMeshes/><MissionMarker mission={activeMission}/><TaylorLots/><JeffersonLegacyCampusMesh/><CircleParkWestSideMarker/><PopulationMeshes reaction={npcReaction}/>{hitFx&&<StreetVerseHitFx key={hitFx.id} position={hitFx.position} level="cinematic" bornAt={0}/>}<FutureVehicleMeshes exclude={driving||undefined}/><NearWestPlayer move={move} onPosition={senseNearby} hidden={!!driving} startPosition={playerSpawn}/>{driving&&<DrivenVehicle vehicleId={driving} move={move} onPosition={(x,z)=>{drivenPosition.current={x,z}}} onHeading={yaw=>{drivenHeading.current=yaw}}/>}
  </Canvas>
 </div>
}
