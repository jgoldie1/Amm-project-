import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {createCircleParkHologram} from '../game/holographic/CircleParkHolographicPrototype'
import {CIRCLE_PARK_TWIN,createTwinDebugOverlay} from '../game/holographic/DigitalTwinPipeline'
import type {CompanionCommand} from '../data/StreetVerseCompanionEcologyEngine'
import {disposeNativeAssetLayer,loadTryammNativeCircleParkLayer} from '../runtime/TryammNativeAssetRuntime'
import {CIRCLE_PARK_WASTE_PICKUPS,CIRCLE_PARK_DISPOSAL_POINT} from '../data/CircleParkWasteDisposal'
import {CIRCLE_PARK_REPAIR_CAR,CIRCLE_PARK_REPAIR_KIT,STREETVERSE_CHICAGO_ROUTE,chicagoNextObjective,nearDisposal,nearRepairCar,nearRepairKit,nearestWaste} from '../data/CircleParkChicagoCompletion'

type Zone={minX:number;maxX:number;minZ:number;maxZ:number}
type SelectedMission={id:string;title:string;rewardXP:number}
const BLOCKERS:Zone[]=[{minX:-43,maxX:-7,minZ:-34,maxZ:24},{minX:7,maxX:43,minZ:-34,maxZ:24}]
const MISSION_TARGET=new THREE.Vector3(0,1.4,-35)
const BUSINESS_TARGET=new THREE.Vector3(9,1.4,-4)
const HOME_TARGET=new THREE.Vector3(-9,1.4,-4)
const inside=(x:number,z:number,b:Zone)=>x>b.minX&&x<b.maxX&&z>b.minZ&&z<b.maxZ

export default function CircleParkHolographicWorld({onClose}:{onClose:()=>void}){
 const mountRef=useRef<HTMLDivElement|null>(null),joystickKnob=useRef<HTMLDivElement|null>(null),input=useRef({x:0,z:0}),nearEntrance=useRef(false),insideDemo=useRef(false),nearElevator=useRef(false),companionCommand=useRef<CompanionCommand>('follow'),playerRef=useRef<THREE.Mesh|null>(null),dogRef=useRef<THREE.Group|null>(null),carryingRef=useRef<string|null>(null),disposedRef=useRef<string[]>([]),repairKitRef=useRef(false),repairStepRef=useRef(0),drivingRef=useRef(false),routeIndexRef=useRef(0),routeCompleteRef=useRef(false),doorsOpenRef=useRef(false),repairCarPositionRef=useRef<[number,number,number]>([...CIRCLE_PARK_REPAIR_CAR.position])
 const [message,setMessage]=useState('Walk to the glowing entrance.'),[nativeAssets,setNativeAssets]=useState<{state:'LOADING'|'READY'|'FALLBACK';loaded:number;failed:number}>({state:'LOADING',loaded:0,failed:0}),[canOpen,setCanOpen]=useState(false),[interior,setInterior]=useState(false),[canElevator,setCanElevator]=useState(false),[floorLevel,setFloorLevel]=useState(1),[dogCommand,setDogCommand]=useState<CompanionCommand>('follow'),[missionComplete,setMissionComplete]=useState(false),[xp,setXp]=useState(0),[shareMessage,setShareMessage]=useState(''),[businessNear,setBusinessNear]=useState(false),[businessComplete,setBusinessComplete]=useState(false),[selectedMission,setSelectedMission]=useState<SelectedMission|null>(null),[selectedCharacter,setSelectedCharacter]=useState('YOU'),[circleXp,setCircleXp]=useState(0),[starterHome,setStarterHome]=useState(false),[chicagoUnlocked,setChicagoUnlocked]=useState(false),[homeNear,setHomeNear]=useState(false),[carrying,setCarrying]=useState<string|null>(null),[disposed,setDisposed]=useState<string[]>([]),[repairKit,setRepairKit]=useState(false),[repairStep,setRepairStep]=useState(0),[nearWasteId,setNearWasteId]=useState<string|null>(null),[nearDump,setNearDump]=useState(false),[nearKit,setNearKit]=useState(false),[nearCar,setNearCar]=useState(false),[driving,setDriving]=useState(false),[routeIndex,setRouteIndex]=useState(0),[routeComplete,setRouteComplete]=useState(false),[doorsOpen,setDoorsOpen]=useState(false)
 useEffect(()=>{
  const onMission=(event:Event)=>{const detail=(event as CustomEvent).detail||{};if(detail.mission){setSelectedMission(detail.mission);setMessage(`MISSION LOADED • ${detail.mission.title}`)}}
  const onCharacter=(event:Event)=>{const detail=(event as CustomEvent).detail||{};if(detail.label)setSelectedCharacter(detail.label)}
  window.addEventListener('tryamm:streetverse-mission-selected',onMission as EventListener);window.addEventListener('tryamm:streetverse-character-select',onCharacter as EventListener)
  try{const saved=JSON.parse(localStorage.getItem('tryamm.streetverse.playable-character.v1')||'{}');if(saved?.character?.label)setSelectedCharacter(saved.character.label)}catch{}
  const onProgress=(event:Event)=>{const p=(event as CustomEvent).detail||{};setCircleXp(Number(p.xp||0));setStarterHome(Boolean(p.starterHomeClaimed));setChicagoUnlocked(Boolean(p.chicagoUnlocked))}
  window.addEventListener('tryamm:circle-park-progress',onProgress as EventListener)
  try{const p=JSON.parse(localStorage.getItem('tryamm.streetverse.circle-park.progress.v1')||'{}');setCircleXp(Number(p.xp||0));setStarterHome(Boolean(p.starterHomeClaimed));setChicagoUnlocked(Boolean(p.chicagoUnlocked))}catch{}
  return()=>{window.removeEventListener('tryamm:streetverse-mission-selected',onMission as EventListener);window.removeEventListener('tryamm:streetverse-character-select',onCharacter as EventListener);window.removeEventListener('tryamm:circle-park-progress',onProgress as EventListener)}
 },[])
 useEffect(()=>{
  const mount=mountRef.current;if(!mount)return
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x050b14);scene.fog=new THREE.Fog(0x050b14,55,150)
  const camera=new THREE.PerspectiveCamera(62,1,.1,220),renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;mount.appendChild(renderer.domElement)
  scene.add(new THREE.HemisphereLight(0x8fefff,0x101018,2.2));const key=new THREE.DirectionalLight(0xffffff,2.4);key.position.set(-20,35,-20);scene.add(key)
  const world=createCircleParkHologram('interactive-demo');scene.add(world);scene.add(createTwinDebugOverlay(CIRCLE_PARK_TWIN))

  let nativeLayer:THREE.Group|null=null
  let nativeLayerCancelled=false
  void loadTryammNativeCircleParkLayer().then(result=>{
    if(nativeLayerCancelled){
      disposeNativeAssetLayer(result.group)
      return
    }
    nativeLayer=result.group
    scene.add(result.group)
    setNativeAssets({
      state:result.loaded>0?'READY':'FALLBACK',
      loaded:result.loaded,
      failed:result.failed.length,
    })
    if(result.failed.length)console.warn('TRYAMM native visual layer partial fallback',result.failed)
  }).catch(error=>{
    if(nativeLayerCancelled)return
    console.warn('TRYAMM native visual layer fallback',error)
    setNativeAssets({state:'FALLBACK',loaded:0,failed:1})
  })

  const player=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.92,4,8),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x00ccff,emissiveIntensity:.45}));player.position.set(0,1.4,-46);scene.add(player);playerRef.current=player
  const dog=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(1.35,.75,2),new THREE.MeshStandardMaterial({color:0x8a5a34}));body.position.y=.65;dog.add(body);const head=new THREE.Mesh(new THREE.BoxGeometry(.85,.85,.85),new THREE.MeshStandardMaterial({color:0x9b6840}));head.position.set(0,1,-1.15);dog.add(head);dog.position.set(-2,0,-44);scene.add(dog);dogRef.current=dog
  const road=new THREE.Mesh(new THREE.PlaneGeometry(18,82),new THREE.MeshStandardMaterial({color:0x151b22,roughness:.95}));road.rotation.x=-Math.PI/2;road.position.set(0,.015,-7);scene.add(road)
  for(let z=-43;z<30;z+=8){const lane=new THREE.Mesh(new THREE.PlaneGeometry(.16,3.4),new THREE.MeshBasicMaterial({color:0xffdf70}));lane.rotation.x=-Math.PI/2;lane.position.set(0,.025,z);scene.add(lane)}
  const sidewalkMat=new THREE.MeshStandardMaterial({color:0x667078,roughness:1});for(const x of [-11,11]){const walk=new THREE.Mesh(new THREE.BoxGeometry(4,.18,82),sidewalkMat);walk.position.set(x,.08,-7);scene.add(walk)}
  const skylineMat=new THREE.MeshStandardMaterial({color:0x162c3d,emissive:0x07131f,emissiveIntensity:.3});for(let i=0;i<12;i++){const side=i%2===0?-1:1,h=10+(i%4)*4,b=new THREE.Mesh(new THREE.BoxGeometry(8,h,7),skylineMat);b.position.set(side*(19+(i%3)*3),h/2,-38+i*7);scene.add(b)}
  const sign=new THREE.Mesh(new THREE.BoxGeometry(8,2.2,.25),new THREE.MeshStandardMaterial({color:0x092133,emissive:0x00aacc,emissiveIntensity:.7}));sign.position.set(0,7,-33.7);scene.add(sign)
  const shop=new THREE.Mesh(new THREE.BoxGeometry(7,4.5,5),new THREE.MeshStandardMaterial({color:0x243447,emissive:0x07131f,emissiveIntensity:.25}));shop.position.set(9,2.25,-4);scene.add(shop)
  const homeMarker=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,.18,24),new THREE.MeshStandardMaterial({color:0x7ee7ff,emissive:0x007799,emissiveIntensity:.8}));homeMarker.position.set(-9,.18,-7);scene.add(homeMarker)
  const shopMarker=new THREE.Mesh(new THREE.CylinderGeometry(.75,.75,.15,20),new THREE.MeshStandardMaterial({color:0xffd75e,emissive:0xaa7700,emissiveIntensity:.8}));shopMarker.position.set(9,.16,-7);scene.add(shopMarker)
  const npc=new THREE.Mesh(new THREE.CapsuleGeometry(.5,1,4,8),new THREE.MeshStandardMaterial({color:0xffcc66,emissive:0x553300,emissiveIntensity:.25}));npc.position.set(-4,1.2,-37);scene.add(npc)
  const traffic2=new THREE.Mesh(new THREE.BoxGeometry(2,1,3.8),new THREE.MeshStandardMaterial({color:0xffb347,metalness:.3,roughness:.5}));traffic2.position.set(-3,.7,16);scene.add(traffic2)
  const car=new THREE.Mesh(new THREE.BoxGeometry(2.2,1,4.2),new THREE.MeshStandardMaterial({color:0x3aa8ff,metalness:.35,roughness:.45}));car.position.set(0,.7,-8);scene.add(car)

  const repairCar=new THREE.Group();repairCar.name='circle-park-repair-car'
  const repairCarMat=new THREE.MeshStandardMaterial({color:0x244862,metalness:.45,roughness:.48})
  const repairBody=new THREE.Mesh(new THREE.BoxGeometry(2.25,.8,4.25),repairCarMat);repairBody.position.y=.65;repairCar.add(repairBody)
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.75,.68,1.9),new THREE.MeshStandardMaterial({color:0x213746,metalness:.25,roughness:.25}));cabin.position.set(0,1.25,-.25);repairCar.add(cabin)
  const leftDoorPivot=new THREE.Group();leftDoorPivot.position.set(-1.14,.9,-.15);const leftDoor=new THREE.Mesh(new THREE.BoxGeometry(.08,.72,1.45),repairCarMat);leftDoor.position.z=.42;leftDoorPivot.add(leftDoor);repairCar.add(leftDoorPivot)
  const rightDoorPivot=new THREE.Group();rightDoorPivot.position.set(1.14,.9,-.15);const rightDoor=new THREE.Mesh(new THREE.BoxGeometry(.08,.72,1.45),repairCarMat);rightDoor.position.z=.42;rightDoorPivot.add(rightDoor);repairCar.add(rightDoorPivot)
  const hoodPivot=new THREE.Group();hoodPivot.position.set(0,1.05,-1.35);const hood=new THREE.Mesh(new THREE.BoxGeometry(2.05,.12,1.35),repairCarMat);hood.position.z=-.55;hoodPivot.add(hood);repairCar.add(hoodPivot)
  repairCar.position.set(...CIRCLE_PARK_REPAIR_CAR.position);scene.add(repairCar)

  const repairKitMesh=new THREE.Group();const kitBox=new THREE.Mesh(new THREE.BoxGeometry(.7,.32,.5),new THREE.MeshStandardMaterial({color:0xffd75e,emissive:0xaa7700,emissiveIntensity:.55}));kitBox.position.y=.22;repairKitMesh.add(kitBox);const kitHandle=new THREE.Mesh(new THREE.TorusGeometry(.18,.04,6,12,Math.PI),new THREE.MeshStandardMaterial({color:0x222222}));kitHandle.rotation.z=Math.PI;kitHandle.position.y=.48;repairKitMesh.add(kitHandle);repairKitMesh.position.set(...CIRCLE_PARK_REPAIR_KIT.position);scene.add(repairKitMesh)

  const carriedTrash=new THREE.Mesh(new THREE.SphereGeometry(.34,10,8),new THREE.MeshStandardMaterial({color:0x111315,roughness:1}));carriedTrash.visible=false;scene.add(carriedTrash)
  const trashMarkers=new Map<string,THREE.Group>()
  for(const pickup of CIRCLE_PARK_WASTE_PICKUPS){const marker=new THREE.Group();marker.name=`mission-${pickup.id}`;const bag=new THREE.Mesh(new THREE.SphereGeometry(.35,10,8),new THREE.MeshStandardMaterial({color:0x151719,roughness:1}));bag.position.y=.35;marker.add(bag);const ring=new THREE.Mesh(new THREE.TorusGeometry(.62,.05,8,24),new THREE.MeshBasicMaterial({color:0xffd75e}));ring.rotation.x=Math.PI/2;ring.position.y=.06;marker.add(ring);marker.position.set(...pickup.position);scene.add(marker);trashMarkers.set(pickup.id,marker)}
  const dumpsterBeacon=new THREE.Mesh(new THREE.TorusGeometry(1.1,.07,8,32),new THREE.MeshBasicMaterial({color:0x79ffad}));dumpsterBeacon.rotation.x=Math.PI/2;dumpsterBeacon.position.set(...CIRCLE_PARK_DISPOSAL_POINT.position);scene.add(dumpsterBeacon)

  const routeMarkers=STREETVERSE_CHICAGO_ROUTE.map((checkpoint,index)=>{const group=new THREE.Group();group.name=`route-${checkpoint.id}`;const column=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,5,12),new THREE.MeshBasicMaterial({color:index===0?0xffd75e:0x4fe3ff,transparent:true,opacity:.6}));column.position.y=2.5;group.add(column);const ring=new THREE.Mesh(new THREE.TorusGeometry(1.35,.09,10,36),new THREE.MeshBasicMaterial({color:index===0?0xffd75e:0x4fe3ff}));ring.rotation.x=Math.PI/2;ring.position.y=.1;group.add(ring);group.position.set(...checkpoint.position);scene.add(group);return group})

  const businessMarker=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,.18,24),new THREE.MeshStandardMaterial({color:0x79ffad,emissive:0x19aa66,emissiveIntensity:.7}));businessMarker.position.set(0,.18,-35);scene.add(businessMarker)
  const door=new THREE.Mesh(new THREE.BoxGeometry(3.6,5,.35),new THREE.MeshStandardMaterial({color:0x00d9ff,emissive:0x00aacc,emissiveIntensity:.6,transparent:true,opacity:.7}));door.position.set(0,2.5,-34);scene.add(door)
  const floor=new THREE.Mesh(new THREE.BoxGeometry(12,.25,18),new THREE.MeshStandardMaterial({color:0x102936}));floor.position.set(0,.05,-22);floor.visible=false;scene.add(floor)
  const stairs=new THREE.Group();for(let i=0;i<6;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(4,.35,1.2),new THREE.MeshStandardMaterial({color:0x48d8ff}));s.position.set(-3,.2+i*.35,-17+i*.7);stairs.add(s)}stairs.visible=false;scene.add(stairs)
  const elevator=new THREE.Mesh(new THREE.BoxGeometry(3,5,3),new THREE.MeshStandardMaterial({color:0x242b35,emissive:0x8844ff,emissiveIntensity:.35}));elevator.position.set(3,2.5,-16);elevator.visible=false;scene.add(elevator)
  camera.position.set(0,7,-57);let raf=0,last=performance.now(),doorOpen=0
  const resize=()=>{const w=mount.clientWidth,h=mount.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};resize();addEventListener('resize',resize)
  const tick=(now:number)=>{const dt=Math.min(.05,(now-last)/1000);last=now;const nx=THREE.MathUtils.clamp(player.position.x+input.current.x*9*dt,-43,43),nz=THREE.MathUtils.clamp(player.position.z+input.current.z*9*dt,-48,31);if(insideDemo.current||!BLOCKERS.some(b=>inside(nx,nz,b))){player.position.x=nx;player.position.z=nz}
   if(companionCommand.current==='follow'||companionCommand.current==='return'){const target=new THREE.Vector3(player.position.x-1.8,0,player.position.z-1.8),d=dog.position.distanceTo(target);if(d>.3)dog.position.lerp(target,Math.min(1,dt*3.2));if(companionCommand.current==='return'&&d<1){companionCommand.current='follow';setDogCommand('follow')}}
   car.position.z=-8+((now*.006)%58)-29;car.position.x=3;car.rotation.y=0
   traffic2.position.z=22-((now*.005)%58);traffic2.position.x=-3;traffic2.rotation.y=Math.PI
   npc.position.x=-4+Math.sin(now*.0007)*1.2
   const near=player.position.distanceTo(MISSION_TARGET)<4;if(near!==nearEntrance.current){nearEntrance.current=near;setCanOpen(near);if(!insideDemo.current)setMessage(near?'Entrance reached • OPEN is available.':'Explore Circle Park • building collision is active.')}
   const homeClose=!insideDemo.current&&player.position.distanceTo(HOME_TARGET)<6;if(homeClose!==homeNear){setHomeNear(homeClose);if(homeClose&&!starterHome)setMessage('Starter home marker reached • CLAIM HOME is available.')}
   const shopNear=!insideDemo.current&&player.position.distanceTo(BUSINESS_TARGET)<6;if(shopNear!==businessNear){setBusinessNear(shopNear);if(shopNear&&!businessComplete)setMessage('Local business discovered • CHECK IN is available.')}
   const elev=insideDemo.current&&player.position.distanceTo(new THREE.Vector3(3,1.4,-16))<3.5;if(elev!==nearElevator.current){nearElevator.current=elev;setCanElevator(elev);if(elev)setMessage('Elevator reached • RIDE ELEVATOR is available.')}
   doorOpen=THREE.MathUtils.lerp(doorOpen,insideDemo.current?1:0,.08);door.position.x=doorOpen*3.5;floor.visible=stairs.visible=elevator.visible=insideDemo.current
   camera.position.lerp(new THREE.Vector3(player.position.x,player.position.y+5,player.position.z-11),.08);camera.lookAt(player.position.x,player.position.y+1,player.position.z+4);renderer.render(scene,camera);raf=requestAnimationFrame(tick)}
  raf=requestAnimationFrame(tick);return()=>{nativeLayerCancelled=true;cancelAnimationFrame(raf);removeEventListener('resize',resize);if(nativeLayer){scene.remove(nativeLayer);disposeNativeAssetLayer(nativeLayer)}renderer.dispose();renderer.domElement.remove()}
 },[])
 const stop=()=>{input.current={x:0,z:0}}
 const move=(x:number,z:number)=>{input.current={x,z}}
 const keyDown=(e:React.KeyboardEvent<HTMLDivElement>)=>{if(e.key==='ArrowUp'||e.key==='w')move(0,1);else if(e.key==='ArrowDown'||e.key==='s')move(0,-1);else if(e.key==='ArrowLeft'||e.key==='a')move(-1,0);else if(e.key==='ArrowRight'||e.key==='d')move(1,0)}
 const joystick=(e:React.PointerEvent<HTMLDivElement>)=>{e.currentTarget.setPointerCapture(e.pointerId);const r=e.currentTarget.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),radius=r.width*.38,mag=Math.hypot(dx,dy)||1,scale=Math.min(1,radius/mag);input.current={x:(dx*scale)/radius,z:(-dy*scale)/radius}}
 const open=()=>{if(!nearEntrance.current)return setMessage('Move closer to the entrance first.');insideDemo.current=true;setInterior(true);if(!missionComplete){const reward=selectedMission?.rewardXP||100;setMissionComplete(true);setXp(v=>v+reward);setMessage(`MISSION COMPLETE • ${selectedMission?.title||'Circle Park Arrival'} • +${reward} XP. Interior demo entered.`);window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{mission:selectedMission||{id:'circle-park-arrival',title:'Circle Park Arrival',rewardXP:100},character:selectedCharacter,rewardXP:reward}}))}else setMessage('Interior demo entered • stairs + elevator mockup active.')}
 const exitInterior=()=>{insideDemo.current=false;nearElevator.current=false;setCanElevator(false);setInterior(false);setFloorLevel(1);setMessage('Returned outside • source-backed interior geometry remains pending authorization.')}
 const rideElevator=()=>{if(!nearElevator.current)return;setFloorLevel(v=>v===1?2:1);setMessage('Elevator demo moved between conceptual floors • verified interior geometry remains pending.')}
 const claimHome=()=>{if(!homeNear||starterHome)return;window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{mission:{id:'circle-park-home',title:'Find & Claim Your Apartment',rewardXP:200},character:selectedCharacter,rewardXP:200}}));setMessage('STARTER HOME CLAIMED • personal instanced Circle Park home • +200 XP.')}
 const checkInBusiness=()=>{if(!businessNear||businessComplete)return;setBusinessComplete(true);setXp(v=>v+50);setMessage('BUSINESS MISSION COMPLETE • Neighborhood Check-In • +50 XP.')}
 const captureMission=async()=>{if(!missionComplete)return;const share={title:'StreetVerse Chicago',text:`I completed ${selectedMission?.title||'Circle Park Arrival'} in StreetVerse Chicago • +${selectedMission?.rewardXP||100} XP`};try{if(navigator.share){await navigator.share(share);setShareMessage('Share sheet opened • choose Reels, LIVE, Messages or another app.')}else{await navigator.clipboard?.writeText(share.text);setShareMessage('Mission highlight copied • ready for TRYAMM Reels/Holo LIVE composer.')}}catch{setShareMessage('Share cancelled • mission highlight remains ready.')}}
 const commandDog=(cmd:CompanionCommand)=>{companionCommand.current=cmd;setDogCommand(cmd);const labels:Record<CompanionCommand,string>={follow:'Companion following.',stay:'Companion staying here.',search:'Companion searching the nearby mission area.',help:'Companion ready to assist/rescue.',defend:'Companion guarding during fictional gameplay danger.',return:'Companion returning to you.'};setMessage(labels[cmd])}
 return <div tabIndex={0} onKeyDown={keyDown} onKeyUp={stop} aria-label="Playable StreetVerse Chicago Circle Park world" style={{position:'fixed',inset:0,zIndex:2500,background:'#050b14',outline:'none'}}><div ref={mountRef} style={{position:'absolute',inset:0}}/>
  <div style={{position:'absolute',top:12,left:12,right:12,padding:12,border:'1px solid #00ffcc88',borderRadius:14,background:'#07131dcc',color:'#eaffff',fontFamily:'system-ui'}}><b>STREETVERSE CHICAGO • CIRCLE PARK</b><div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:5,fontSize:11}}><span>PLAYER: {selectedCharacter}</span><span>MISSION: {missionComplete?'COMPLETE':selectedMission?.title||'REACH THE GLOWING ENTRANCE'}</span><span>REWARD: {selectedMission?`+${selectedMission.rewardXP} XP`:'+100 XP'}</span><span>MISSION XP: {xp}</span><span>CIRCLE XP: {circleXp}/1000</span><span>HOME: {starterHome?'CLAIMED':'FIND IT'}</span><span>CHICAGO: {chicagoUnlocked?'UNLOCKED':'LOCKED'}</span><span>CITY ACTIVITY: ACTIVE</span><span>BUSINESS: {businessComplete?'CHECKED IN':'DISCOVER'}</span><span>NATIVE ASSETS: {nativeAssets.state} • {nativeAssets.loaded} LOADED{nativeAssets.failed?` • ${nativeAssets.failed} FALLBACK`:''}</span></div><div style={{fontSize:12,opacity:.82}}>Chicago-inspired playable district • TRYAMM native GLB preview layer + authoritative gameplay primitives • conceptual massing, not survey/CAD geometry.</div><div style={{fontSize:12,marginTop:5}}>{message}{interior?` • FLOOR ${floorLevel}`:''}</div></div>
  <div aria-live="polite" style={{position:'absolute',width:1,height:1,overflow:'hidden',clip:'rect(0 0 0 0)'}}>{message}</div>
  <div aria-label="Circle Park analog movement joystick" onPointerDown={joystick} onPointerMove={e=>{if(e.buttons)joystick(e)}} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop} style={{position:'absolute',left:18,bottom:20,width:124,height:124,borderRadius:'50%',border:'2px solid #00ffcc',background:'#06131bcc',touchAction:'none',boxShadow:'inset 0 0 28px #00ffcc33'}}><div style={{position:'absolute',left:44,top:44,width:32,height:32,borderRadius:'50%',background:'#eaffff',boxShadow:'0 0 18px #00ffcc'}}/></div>
  <div aria-label="One-hand movement controls" style={{position:'absolute',left:18,bottom:152,display:'grid',gridTemplateColumns:'repeat(3,38px)',gap:4}}><span/><button aria-label="Move forward" onPointerDown={()=>move(0,1)} onPointerUp={stop} onPointerCancel={stop} style={moveBtn}>▲</button><span/><button aria-label="Move left" onPointerDown={()=>move(-1,0)} onPointerUp={stop} onPointerCancel={stop} style={moveBtn}>◀</button><button aria-label="Stop movement" onClick={stop} style={moveBtn}>■</button><button aria-label="Move right" onPointerDown={()=>move(1,0)} onPointerUp={stop} onPointerCancel={stop} style={moveBtn}>▶</button><span/><button aria-label="Move backward" onPointerDown={()=>move(0,-1)} onPointerUp={stop} onPointerCancel={stop} style={moveBtn}>▼</button><span/></div>
  <div aria-label="Companion controls" style={{position:'absolute',left:154,bottom:20,display:'flex',maxWidth:'calc(100vw - 330px)',gap:6,flexWrap:'wrap'}}>{(['follow','stay','search','help','defend','return'] as CompanionCommand[]).map(cmd=><button key={cmd} onClick={()=>commandDog(cmd)} style={{padding:'8px 10px',borderRadius:999,border:'1px solid #00ffcc88',background:dogCommand===cmd?'#0b5048dd':'#06131bdd',color:'#fff',fontSize:11,textTransform:'uppercase'}}>{cmd}</button>)}</div>
  {homeNear&&!starterHome&&<button onClick={claimHome} aria-label="Claim personal Circle Park starter home" style={{position:'absolute',right:16,bottom:330,padding:'12px 16px',borderRadius:999,border:'1px solid #7ee7ff',background:'#071b24dd',color:'#fff'}}>CLAIM HOME • +200 XP</button>}
  {chicagoUnlocked&&<button onClick={()=>{window.location.href='/streetverse?district=chicago'}} aria-label="Open StreetVerse Chicago" style={{position:'absolute',right:16,bottom:330,padding:'12px 16px',borderRadius:999,border:'1px solid #ffd75e',background:'#211b08ee',color:'#fff'}}>OPEN STREETVERSE CHICAGO</button>}
  {businessNear&&!businessComplete&&<button onClick={checkInBusiness} aria-label="Check in at local Chicago business" style={{position:'absolute',right:16,bottom:268,padding:'12px 16px',borderRadius:999,border:'1px solid #ffd75e',background:'#211b08dd',color:'#fff'}}>CHECK IN • +50 XP</button>}
  {missionComplete&&<div style={{position:'absolute',right:16,bottom:206,display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}><button onClick={captureMission} aria-label="Share completed Chicago mission" style={{padding:'12px 16px',borderRadius:999,border:'1px solid #ff4fd8',background:'#1b0b20dd',color:'#fff'}}>CAPTURE / SHARE</button>{shareMessage&&<div aria-live="polite" style={{maxWidth:260,padding:'7px 9px',borderRadius:10,background:'#07131ddd',color:'#fff',fontSize:11}}>{shareMessage}</div>}</div>}
  {interior&&<button disabled={!canElevator} onClick={rideElevator} style={{position:'absolute',right:16,bottom:144,padding:'12px 16px',borderRadius:999,border:'1px solid #aa66ff',background:'#0b1020dd',color:'#fff',opacity:canElevator?1:.45}}>RIDE ELEVATOR</button>}
  <button disabled={!canOpen&&!interior} onClick={interior?exitInterior:open} style={{position:'absolute',right:16,bottom:82,padding:'12px 16px',borderRadius:999,border:'1px solid #00ffcc',background:'#06131bdd',color:'#fff',opacity:canOpen||interior?1:.45}}>{interior?'EXIT INTERIOR':'OPEN'}</button>
  <button onClick={onClose} style={{position:'absolute',right:16,bottom:20,padding:'12px 18px',borderRadius:999,border:'1px solid #00ffcc',background:'#06131b',color:'#fff'}}>EXIT WORLD</button>
 </div>
}

const moveBtn:React.CSSProperties={width:38,height:38,borderRadius:10,border:'1px solid #00ffcc88',background:'#06131bdd',color:'#fff',fontSize:17,touchAction:'none'}