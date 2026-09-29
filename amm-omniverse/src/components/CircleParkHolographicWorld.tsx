import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {createCircleParkHologram} from '../game/holographic/CircleParkHolographicPrototype'
import {CIRCLE_PARK_TWIN,createTwinDebugOverlay} from '../game/holographic/DigitalTwinPipeline'
import type {CompanionCommand} from '../data/StreetVerseCompanionEcologyEngine'
import {disposeNativeAssetLayer,loadTryammNativeCircleParkLayer} from '../runtime/TryammNativeAssetRuntime'
import {CIRCLE_PARK_WASTE_PICKUPS,CIRCLE_PARK_DISPOSAL_POINT} from '../data/CircleParkWasteDisposal'
import {CIRCLE_PARK_REPAIR_CAR,CIRCLE_PARK_REPAIR_KIT,STREETVERSE_CHICAGO_ROUTE,chicagoNextObjective,nearDisposal,nearRepairCar,nearRepairKit,nearestWaste} from '../data/CircleParkChicagoCompletion'
import type {StreetVerseAmbientJob} from '../runtime/StreetVerseLivingMobilityRuntime'

type Zone={minX:number;maxX:number;minZ:number;maxZ:number}
type SelectedMission={id:string;title:string;rewardXP:number}
const BLOCKERS:Zone[]=[{minX:-43,maxX:-7,minZ:-34,maxZ:24},{minX:7,maxX:43,minZ:-34,maxZ:24}]
const MISSION_TARGET=new THREE.Vector3(0,1.4,-35)
const BUSINESS_TARGET=new THREE.Vector3(9,1.4,-4)
const HOME_TARGET=new THREE.Vector3(-9,1.4,-4)
const inside=(x:number,z:number,b:Zone)=>x>b.minX&&x<b.maxX&&z>b.minZ&&z<b.maxZ

export default function CircleParkHolographicWorld({onClose}:{onClose:()=>void}){
 const mountRef=useRef<HTMLDivElement|null>(null),joystickKnob=useRef<HTMLDivElement|null>(null),input=useRef({x:0,z:0}),nearEntrance=useRef(false),insideDemo=useRef(false),nearElevator=useRef(false),companionCommand=useRef<CompanionCommand>('follow'),playerRef=useRef<THREE.Mesh|null>(null),dogRef=useRef<THREE.Group|null>(null),carryingRef=useRef<string|null>(null),disposedRef=useRef<string[]>([]),repairKitRef=useRef(false),repairStepRef=useRef(0),drivingRef=useRef(false),routeIndexRef=useRef(0),routeCompleteRef=useRef(false),doorsOpenRef=useRef(false),repairCarPositionRef=useRef<[number,number,number]>([...CIRCLE_PARK_REPAIR_CAR.position]),mobilityJobRef=useRef<StreetVerseAmbientJob|null>(null),mobilityStageRef=useRef<'pickup'|'dropoff'|'complete'>('pickup')
 const [message,setMessage]=useState('Walk to the glowing entrance.'),[nativeAssets,setNativeAssets]=useState<{state:'LOADING'|'READY'|'FALLBACK';loaded:number;failed:number}>({state:'LOADING',loaded:0,failed:0}),[canOpen,setCanOpen]=useState(false),[interior,setInterior]=useState(false),[canElevator,setCanElevator]=useState(false),[floorLevel,setFloorLevel]=useState(1),[dogCommand,setDogCommand]=useState<CompanionCommand>('follow'),[missionComplete,setMissionComplete]=useState(false),[xp,setXp]=useState(0),[shareMessage,setShareMessage]=useState(''),[businessNear,setBusinessNear]=useState(false),[businessComplete,setBusinessComplete]=useState(false),[selectedMission,setSelectedMission]=useState<SelectedMission|null>(null),[selectedCharacter,setSelectedCharacter]=useState('YOU'),[circleXp,setCircleXp]=useState(0),[starterHome,setStarterHome]=useState(false),[chicagoUnlocked,setChicagoUnlocked]=useState(false),[homeNear,setHomeNear]=useState(false),[carrying,setCarrying]=useState<string|null>(null),[disposed,setDisposed]=useState<string[]>([]),[repairKit,setRepairKit]=useState(false),[repairStep,setRepairStep]=useState(0),[nearWasteId,setNearWasteId]=useState<string|null>(null),[nearDump,setNearDump]=useState(false),[nearKit,setNearKit]=useState(false),[nearCar,setNearCar]=useState(false),[driving,setDriving]=useState(false),[routeIndex,setRouteIndex]=useState(0),[routeComplete,setRouteComplete]=useState(false),[doorsOpen,setDoorsOpen]=useState(false),[mobilityJob,setMobilityJob]=useState<StreetVerseAmbientJob|null>(null),[mobilityStage,setMobilityStage]=useState<'pickup'|'dropoff'|'complete'>('pickup')
 useEffect(()=>{
  const onMission=(event:Event)=>{const detail=(event as CustomEvent).detail||{};if(detail.mission){setSelectedMission(detail.mission);setMessage(`MISSION LOADED • ${detail.mission.title}`)}}
  const onCharacter=(event:Event)=>{const detail=(event as CustomEvent).detail||{};if(detail.label)setSelectedCharacter(detail.label)}
  window.addEventListener('tryamm:streetverse-mission-selected',onMission as EventListener);window.addEventListener('tryamm:streetverse-character-select',onCharacter as EventListener)
  try{const saved=JSON.parse(localStorage.getItem('tryamm.streetverse.playable-character.v1')||'{}');if(saved?.character?.label)setSelectedCharacter(saved.character.label)}catch{}
  const onProgress=(event:Event)=>{const p=(event as CustomEvent).detail||{};setCircleXp(Number(p.xp||0));setStarterHome(Boolean(p.starterHomeClaimed));setChicagoUnlocked(Boolean(p.chicagoUnlocked))}
  window.addEventListener('tryamm:circle-park-progress',onProgress as EventListener)
  const onMobilityJob=(event:Event)=>{
    const detail=(event as CustomEvent<StreetVerseAmbientJob>).detail
    if(!detail?.id)return
    mobilityJobRef.current=detail;mobilityStageRef.current='pickup';setMobilityJob(detail);setMobilityStage('pickup')
    setMessage(`MOBILITY JOB • ${detail.label} • follow the gold beacon.`)
  }
  window.addEventListener('tryamm:streetverse-mobility-job',onMobilityJob as EventListener)
  try{const p=JSON.parse(localStorage.getItem('tryamm.streetverse.circle-park.progress.v1')||'{}');setCircleXp(Number(p.xp||0));setStarterHome(Boolean(p.starterHomeClaimed));setChicagoUnlocked(Boolean(p.chicagoUnlocked))}catch{}
  return()=>{window.removeEventListener('tryamm:streetverse-mission-selected',onMission as EventListener);window.removeEventListener('tryamm:streetverse-character-select',onCharacter as EventListener);window.removeEventListener('tryamm:circle-park-progress',onProgress as EventListener);window.removeEventListener('tryamm:streetverse-mobility-job',onMobilityJob as EventListener)}
 },[])
 useEffect(()=>{
  const mount=mountRef.current;if(!mount)return
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x050b14);scene.fog=new THREE.Fog(0x050b14,55,150)
  const camera=new THREE.PerspectiveCamera(62,1,.1,220),renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;mount.appendChild(renderer.domElement)
  scene.add(new THREE.HemisphereLight(0x8fefff,0x101018,2.2));const key=new THREE.DirectionalLight(0xffffff,2.4);key.position.set(-20,35,-20);scene.add(key)
  const world=createCircleParkHologram('interactive-demo');scene.add(world);scene.add(createTwinDebugOverlay(CIRCLE_PARK_TWIN))

  let nativeLayer:THREE.Group|null=null
  let nativeRepairCar:THREE.Object3D|null=null
  let nativeDriverDoorPivot:THREE.Object3D|null=null
  let nativePassengerDoorPivot:THREE.Object3D|null=null
  let nativeHoodPivot:THREE.Object3D|null=null
  let nativeLayerCancelled=false
  void loadTryammNativeCircleParkLayer().then(result=>{
    if(nativeLayerCancelled){
      disposeNativeAssetLayer(result.group)
      return
    }
    nativeLayer=result.group
    nativeRepairCar=result.group.getObjectByName('circle-park-repair-car-native')||null
    nativeDriverDoorPivot=nativeRepairCar?.getObjectByName('driver-door-pivot')||null
    nativePassengerDoorPivot=nativeRepairCar?.getObjectByName('passenger-door-pivot')||null
    nativeHoodPivot=nativeRepairCar?.getObjectByName('hood-pivot')||null
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

  const ambientPersonCount=18
  const ambientPeople=new THREE.InstancedMesh(new THREE.CapsuleGeometry(.34,.72,4,8),new THREE.MeshStandardMaterial({color:0x8fd9ff,emissive:0x12384c,emissiveIntensity:.22}),ambientPersonCount)
  ambientPeople.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(ambientPeople)
  const peopleSeed=Array.from({length:ambientPersonCount},(_,i)=>({side:i%2===0?-1:1,offset:(i*7)%68-34,speed:.35+(i%5)*.08}))

  const ambientCarCount=10
  const ambientCars=new THREE.InstancedMesh(new THREE.BoxGeometry(1.85,.78,3.7),new THREE.MeshStandardMaterial({color:0x6aa9ff,metalness:.3,roughness:.52}),ambientCarCount)
  ambientCars.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(ambientCars)
  const carSeed=Array.from({length:ambientCarCount},(_,i)=>({lane:i%2===0?-3:3,offset:(i*11)%76-38,speed:5+(i%4)}))

  const ambientMotoCount=4
  const ambientMotos=new THREE.InstancedMesh(new THREE.BoxGeometry(.65,.8,1.9),new THREE.MeshStandardMaterial({color:0xff7d52,metalness:.25,roughness:.45}),ambientMotoCount)
  ambientMotos.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(ambientMotos)
  const motoSeed=Array.from({length:ambientMotoCount},(_,i)=>({lane:i%2===0?-1.8:1.8,offset:(i*17)%70-35,speed:8+(i%3)}))
  const instanceDummy=new THREE.Object3D()

  const mobilityBeacon=new THREE.Group();mobilityBeacon.name='streetverse-mobility-beacon';mobilityBeacon.visible=false
  const mobilityColumn=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,5.5,12),new THREE.MeshBasicMaterial({color:0xffc84d,transparent:true,opacity:.7}));mobilityColumn.position.y=2.75;mobilityBeacon.add(mobilityColumn)
  const mobilityRing=new THREE.Mesh(new THREE.TorusGeometry(1.25,.09,10,32),new THREE.MeshBasicMaterial({color:0xffd75e}));mobilityRing.rotation.x=Math.PI/2;mobilityRing.position.y=.1;mobilityBeacon.add(mobilityRing)
  const mobilityPerson=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.72,4,8),new THREE.MeshStandardMaterial({color:0xffd75e,emissive:0x6b3f00,emissiveIntensity:.45}));mobilityPerson.position.set(0,1.1,0);mobilityBeacon.add(mobilityPerson)
  scene.add(mobilityBeacon)

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
  camera.position.set(0,7,-57);let raf=0,last=performance.now(),doorOpen=0,lastTelemetry=0
  const resize=()=>{const w=mount.clientWidth,h=mount.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};resize();addEventListener('resize',resize)
  const tick=(now:number)=>{
   const dt=Math.min(.05,(now-last)/1000);last=now
   const speed=drivingRef.current?17:9
   const maxX=drivingRef.current?6:43
   const nx=THREE.MathUtils.clamp(player.position.x+input.current.x*speed*dt,-maxX,maxX)
   const nz=THREE.MathUtils.clamp(player.position.z+input.current.z*speed*dt,-48,31)
   if(drivingRef.current||insideDemo.current||!BLOCKERS.some(b=>inside(nx,nz,b))){player.position.x=nx;player.position.z=nz}

   if(drivingRef.current){
    player.visible=false
    repairCar.position.x=player.position.x;repairCar.position.z=player.position.z
    repairCarPositionRef.current=[repairCar.position.x,repairCar.position.y,repairCar.position.z]
    if(Math.abs(input.current.x)+Math.abs(input.current.z)>.05)repairCar.rotation.y=Math.atan2(input.current.x,input.current.z)
   }else{
    player.visible=true
    repairCarPositionRef.current=[repairCar.position.x,repairCar.position.y,repairCar.position.z]
   }

   repairCar.visible=!nativeRepairCar
   if(nativeRepairCar){
    nativeRepairCar.position.set(repairCar.position.x,0,repairCar.position.z)
    nativeRepairCar.rotation.y=repairCar.rotation.y+Math.PI/2
    nativeDriverDoorPivot&&(nativeDriverDoorPivot.rotation.y=THREE.MathUtils.lerp(nativeDriverDoorPivot.rotation.y,doorsOpenRef.current?-1.05:0,.12))
    nativePassengerDoorPivot&&(nativePassengerDoorPivot.rotation.y=THREE.MathUtils.lerp(nativePassengerDoorPivot.rotation.y,doorsOpenRef.current?1.05:0,.12))
    const nativeHoodTarget=repairStepRef.current>0&&repairStepRef.current<3?-.9:0
    nativeHoodPivot&&(nativeHoodPivot.rotation.z=THREE.MathUtils.lerp(nativeHoodPivot.rotation.z,nativeHoodTarget,.12))
   }

   if(companionCommand.current==='follow'||companionCommand.current==='return'){
    const target=new THREE.Vector3(player.position.x-1.8,0,player.position.z-1.8),d=dog.position.distanceTo(target)
    if(d>.3)dog.position.lerp(target,Math.min(1,dt*3.2))
    if(companionCommand.current==='return'&&d<1){companionCommand.current='follow';setDogCommand('follow')}
   }

   car.position.z=-8+((now*.006)%58)-29;car.position.x=3;car.rotation.y=0
   traffic2.position.z=22-((now*.005)%58);traffic2.position.x=-3;traffic2.rotation.y=Math.PI
   npc.position.x=-4+Math.sin(now*.0007)*1.2

   for(let i=0;i<ambientPersonCount;i++){
     const seed=peopleSeed[i],travel=((now*.001*seed.speed+seed.offset+38)%76)-38
     instanceDummy.position.set(seed.side*11.2,1.15,seed.side<0?travel:-travel)
     instanceDummy.rotation.set(0,seed.side<0?0:Math.PI,0);instanceDummy.scale.set(1,1,1);instanceDummy.updateMatrix()
     ambientPeople.setMatrixAt(i,instanceDummy.matrix)
   }
   ambientPeople.instanceMatrix.needsUpdate=true

   for(let i=0;i<ambientCarCount;i++){
     const seed=carSeed[i],travel=((now*.001*seed.speed+seed.offset+42)%84)-42
     instanceDummy.position.set(seed.lane,.55,seed.lane<0?travel:-travel)
     instanceDummy.rotation.set(0,seed.lane<0?0:Math.PI,0);instanceDummy.scale.set(1,1,1);instanceDummy.updateMatrix()
     ambientCars.setMatrixAt(i,instanceDummy.matrix)
   }
   ambientCars.instanceMatrix.needsUpdate=true

   for(let i=0;i<ambientMotoCount;i++){
     const seed=motoSeed[i],travel=((now*.001*seed.speed+seed.offset+40)%80)-40
     instanceDummy.position.set(seed.lane,.5,seed.lane<0?travel:-travel)
     instanceDummy.rotation.set(0,seed.lane<0?0:Math.PI,0);instanceDummy.scale.set(1,1,1);instanceDummy.updateMatrix()
     ambientMotos.setMatrixAt(i,instanceDummy.matrix)
   }
   ambientMotos.instanceMatrix.needsUpdate=true

   leftDoorPivot.rotation.y=THREE.MathUtils.lerp(leftDoorPivot.rotation.y,doorsOpenRef.current?-1.08:0,.12)
   rightDoorPivot.rotation.y=THREE.MathUtils.lerp(rightDoorPivot.rotation.y,doorsOpenRef.current?1.08:0,.12)
   const hoodTarget=repairStepRef.current>0&&repairStepRef.current<3?-.9:0
   hoodPivot.rotation.x=THREE.MathUtils.lerp(hoodPivot.rotation.x,hoodTarget,.12)
   repairCarMat.color.setHex(repairStepRef.current>=3?0x247fbd:0x244862)
   repairCarMat.emissive.setHex(repairStepRef.current>=3?0x001c2d:0x000000)
   repairKitMesh.visible=!repairKitRef.current

   carriedTrash.visible=Boolean(carryingRef.current)
   if(carryingRef.current)carriedTrash.position.set(player.position.x+.65,player.position.y+.25,player.position.z+.2)
   for(const pickup of CIRCLE_PARK_WASTE_PICKUPS){
    const hidden=disposedRef.current.includes(pickup.id)||carryingRef.current===pickup.id
    const marker=trashMarkers.get(pickup.id);if(marker)marker.visible=!hidden
    const native=nativeLayer?.getObjectByName(pickup.id);if(native)native.visible=!hidden
   }
   dumpsterBeacon.scale.setScalar(carryingRef.current?1+.12*Math.sin(now*.006):.82)

   routeMarkers.forEach((marker,index)=>{
    const active=!routeCompleteRef.current&&repairStepRef.current>=3&&index===routeIndexRef.current
    marker.visible=repairStepRef.current>=3&&!routeCompleteRef.current
    marker.scale.setScalar(active?1.05+.12*Math.sin(now*.008):.72)
    marker.children.forEach(child=>{const mat=(child as THREE.Mesh).material as THREE.Material&{opacity?:number};if('opacity'in mat)mat.opacity=active?.92:.35})
   })

   const p:[number,number,number]=[player.position.x,player.position.y,player.position.z]

   const activeMobility=mobilityJobRef.current
   if(activeMobility&&mobilityStageRef.current!=='complete'){
     const target=mobilityStageRef.current==='pickup'?activeMobility.pickup:activeMobility.dropoff
     mobilityBeacon.visible=true
     mobilityBeacon.position.set(target[0],0,target[2])
     mobilityBeacon.scale.setScalar(1+.08*Math.sin(now*.01))
     const mobilityDistance=Math.hypot(player.position.x-target[0],player.position.z-target[2])
     if(mobilityDistance<3.8){
       if(mobilityStageRef.current==='pickup'){
         mobilityStageRef.current='dropoff';setMobilityStage('dropoff')
         const pickupCopy=activeMobility.kind==='rideshare'?'RIDER PICKED UP':activeMobility.kind==='delivery'?'PACKAGE PICKED UP':activeMobility.kind==='car-share'?'CAR-SHARE HANDOFF COMPLETE':'RECOVERY TARGET LOCATED / SECURED'
         setMessage(`${pickupCopy} • NEXT: ${activeMobility.kind==='recovery'?'TOW / IMPOUND DESTINATION':'DESTINATION'}.`)
       }else{
         mobilityStageRef.current='complete';setMobilityStage('complete');mobilityBeacon.visible=false
         setXp(v=>v+activeMobility.rewardXP)
         setMessage(`MOBILITY JOB COMPLETE • ${activeMobility.label} • +${activeMobility.rewardXP} XP • +${activeMobility.rewardCredits} GAME CREDITS.`)
         window.dispatchEvent(new CustomEvent('tryamm:streetverse-mobility-job-complete',{detail:{...activeMobility,simulation:true}}))
       }
     }
   }else mobilityBeacon.visible=false

   const waste=nearestWaste(p,disposedRef.current,carryingRef.current)
   setNearWasteId(waste?.item.id||null)
   setNearDump(nearDisposal(p))
   setNearKit(!repairKitRef.current&&nearRepairKit(p))
   setNearCar(nearRepairCar(p,repairCarPositionRef.current))

   if(drivingRef.current&&repairStepRef.current>=3&&!routeCompleteRef.current){
    const checkpoint=STREETVERSE_CHICAGO_ROUTE[routeIndexRef.current]
    if(checkpoint&&Math.hypot(player.position.x-checkpoint.position[0],player.position.z-checkpoint.position[2])<4.2){
      setXp(v=>v+checkpoint.rewardXP)
      const next=routeIndexRef.current+1
      if(next>=STREETVERSE_CHICAGO_ROUTE.length){
        routeCompleteRef.current=true;setRouteComplete(true);setRouteIndex(STREETVERSE_CHICAGO_ROUTE.length)
        setXp(v=>v+250)
        setMessage(`CHICAGO SLICE COMPLETE • ${checkpoint.label} reached • Circle Park → Roosevelt → Taylor → Pilsen • +${checkpoint.rewardXP+250} XP.`)
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{mission:{id:'circle-park-roosevelt-taylor-pilsen',title:'Circle Park → Roosevelt → Taylor → Pilsen',rewardXP:550},character:selectedCharacter,routeComplete:true}}))
      }else{
        routeIndexRef.current=next;setRouteIndex(next)
        setMessage(`CHECKPOINT • ${checkpoint.label} • +${checkpoint.rewardXP} XP • NEXT: ${STREETVERSE_CHICAGO_ROUTE[next].label}.`)
      }
    }
   }

   const near=player.position.distanceTo(MISSION_TARGET)<4
   if(near!==nearEntrance.current){nearEntrance.current=near;setCanOpen(near);if(!insideDemo.current&&!drivingRef.current)setMessage(near?'Entrance reached • OPEN is available.':'Explore Circle Park • follow the active objective.')}
   const homeClose=!insideDemo.current&&player.position.distanceTo(HOME_TARGET)<6
   if(homeClose!==homeNear){setHomeNear(homeClose);if(homeClose&&!starterHome&&!drivingRef.current)setMessage('Starter home marker reached • CLAIM HOME is available.')}
   const shopNear=!insideDemo.current&&player.position.distanceTo(BUSINESS_TARGET)<6
   if(shopNear!==businessNear){setBusinessNear(shopNear);if(shopNear&&!businessComplete&&!drivingRef.current)setMessage('Local business discovered • CHECK IN is available.')}
   const elev=insideDemo.current&&player.position.distanceTo(new THREE.Vector3(3,1.4,-16))<3.5
   if(elev!==nearElevator.current){nearElevator.current=elev;setCanElevator(elev);if(elev)setMessage('Elevator reached • RIDE ELEVATOR is available.')}

   doorOpen=THREE.MathUtils.lerp(doorOpen,insideDemo.current?1:0,.08);door.position.x=doorOpen*3.5;floor.visible=stairs.visible=elevator.visible=insideDemo.current

   if(now-lastTelemetry>300){
    lastTelemetry=now
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-position',{detail:{x:player.position.x,z:player.position.z,speed:Math.hypot(input.current.x,input.current.z)*speed,vehicle:drivingRef.current,vehicleType:drivingRef.current?'car':undefined,district:'circle-park'}}))
   }

   camera.position.lerp(new THREE.Vector3(player.position.x,player.position.y+(drivingRef.current?4.4:5),player.position.z-(drivingRef.current?13:11)),.08)
   camera.lookAt(player.position.x,player.position.y+1,player.position.z+4)
   renderer.render(scene,camera)
   raf=requestAnimationFrame(tick)
  }
  raf=requestAnimationFrame(tick);return()=>{nativeLayerCancelled=true;cancelAnimationFrame(raf);removeEventListener('resize',resize);if(nativeLayer){scene.remove(nativeLayer);disposeNativeAssetLayer(nativeLayer)}renderer.dispose();renderer.domElement.remove()}
 },[])
 const stop=()=>{input.current={x:0,z:0};if(joystickKnob.current)joystickKnob.current.style.transform='translate(0px,0px)'}
 const move=(x:number,z:number)=>{input.current={x,z}}
 const keyDown=(e:React.KeyboardEvent<HTMLDivElement>)=>{if(e.key==='ArrowUp'||e.key==='w')move(0,1);else if(e.key==='ArrowDown'||e.key==='s')move(0,-1);else if(e.key==='ArrowLeft'||e.key==='a')move(-1,0);else if(e.key==='ArrowRight'||e.key==='d')move(1,0)}
 const joystick=(e:React.PointerEvent<HTMLDivElement>)=>{e.currentTarget.setPointerCapture(e.pointerId);const r=e.currentTarget.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),radius=r.width*.38,mag=Math.hypot(dx,dy)||1,scale=Math.min(1,radius/mag),jx=dx*scale,jy=dy*scale;input.current={x:jx/radius,z:-jy/radius};if(joystickKnob.current)joystickKnob.current.style.transform=`translate(${jx}px,${jy}px)`}
 const pickUpTrash=()=>{
  if(carryingRef.current)return setMessage('You are already carrying trash • take it to the dumpster.')
  const id=nearWasteId
  if(!id)return setMessage('Move closer to visible trash first.')
  carryingRef.current=id;setCarrying(id);setMessage('TRASH PICKED UP • carry it to the glowing dumpster.')
 }
 const disposeTrash=()=>{
  const id=carryingRef.current
  if(!id)return setMessage('Pick up trash before using the dumpster.')
  if(!nearDump)return setMessage('Move closer to the dumpster.')
  const next=[...new Set([...disposedRef.current,id])]
  disposedRef.current=next;setDisposed(next);carryingRef.current=null;setCarrying(null);setXp(v=>v+20)
  if(next.length>=CIRCLE_PARK_WASTE_PICKUPS.length){setXp(v=>v+75);setMessage('CIRCLE PARK CLEANUP COMPLETE • all trash disposed • +135 XP total cleanup reward. NEXT: GET REPAIR KIT.')}
  else setMessage(`TRASH DISPOSED • +20 XP • ${next.length}/${CIRCLE_PARK_WASTE_PICKUPS.length} cleaned.`)
 }
 const pickRepairKit=()=>{
  if(repairKitRef.current)return
  if(!nearKit)return setMessage('Move closer to the glowing repair kit.')
  repairKitRef.current=true;setRepairKit(true);setMessage('REPAIR KIT ACQUIRED • go to the blue starter car. You can open its doors, but it will not drive until repaired.')
 }
 const toggleCarDoors=()=>{
  if(!nearCar&&!drivingRef.current)return setMessage('Move closer to the blue starter car.')
  doorsOpenRef.current=!doorsOpenRef.current;setDoorsOpen(doorsOpenRef.current)
  setMessage(doorsOpenRef.current?'VEHICLE DOORS OPEN • car is still disabled until repaired.':'VEHICLE DOORS CLOSED.')
 }
 const repairCar=()=>{
  if(!nearCar)return setMessage('Move closer to the blue starter car.')
  if(!repairKitRef.current)return setMessage('You need the repair kit first.')
  if(drivingRef.current)return setMessage('Exit the vehicle before repairing it.')
  if(repairStepRef.current>=3)return setMessage('Vehicle repair is complete • ENTER VEHICLE.')
  const next=repairStepRef.current+1;repairStepRef.current=next;setRepairStep(next)
  const labels=['OPEN HOOD','FIX ENGINE','CLOSE HOOD']
  if(next<3)setMessage(`${labels[next-1]} COMPLETE • NEXT: ${labels[next]}.`)
  else{setXp(v=>v+125);setMessage('VEHICLE REPAIR COMPLETE • +125 XP • NEXT: ENTER VEHICLE and drive to ROOSEVELT ROAD.')}
 }
 const toggleVehicle=()=>{
  if(drivingRef.current){
    drivingRef.current=false;setDriving(false);doorsOpenRef.current=true;setDoorsOpen(true)
    playerRef.current?.position.set(repairCarPositionRef.current[0]+2,1.4,repairCarPositionRef.current[2])
    setMessage('VEHICLE EXITED • car remains parked and repaired.')
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-controlled',{detail:{entered:false,vehicleType:'car',controlledVehicleId:'circle-park-repair-car'}}))
    return
  }
  if(!nearCar)return setMessage('Move closer to the blue starter car.')
  if(repairStepRef.current<3)return setMessage('CAR DISABLED • complete OPEN HOOD → FIX ENGINE → CLOSE HOOD before driving.')
  drivingRef.current=true;setDriving(true);doorsOpenRef.current=false;setDoorsOpen(false)
  playerRef.current?.position.set(...repairCarPositionRef.current)
  setMessage(`DRIVE MODE ACTIVE • NEXT: ${STREETVERSE_CHICAGO_ROUTE[routeIndexRef.current]?.label||'Pilsen'}.`)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-controlled',{detail:{entered:true,vehicleType:'car',controlledVehicleId:'circle-park-repair-car'}}))
 }
 const open=()=>{if(!nearEntrance.current)return setMessage('Move closer to the entrance first.');insideDemo.current=true;setInterior(true);if(!missionComplete){const reward=selectedMission?.rewardXP||100;setMissionComplete(true);setXp(v=>v+reward);setMessage(`MISSION COMPLETE • ${selectedMission?.title||'Circle Park Arrival'} • +${reward} XP. Interior demo entered.`);window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{mission:selectedMission||{id:'circle-park-arrival',title:'Circle Park Arrival',rewardXP:100},character:selectedCharacter,rewardXP:reward}}))}else setMessage('Interior demo entered • stairs + elevator mockup active.')}
 const exitInterior=()=>{insideDemo.current=false;nearElevator.current=false;setCanElevator(false);setInterior(false);setFloorLevel(1);setMessage('Returned outside • source-backed interior geometry remains pending authorization.')}
 const rideElevator=()=>{if(!nearElevator.current)return;setFloorLevel(v=>v===1?2:1);setMessage('Elevator demo moved between conceptual floors • verified interior geometry remains pending.')}
 const claimHome=()=>{if(!homeNear||starterHome)return;window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{mission:{id:'circle-park-home',title:'Find & Claim Your Apartment',rewardXP:200},character:selectedCharacter,rewardXP:200}}));setMessage('STARTER HOME CLAIMED • personal instanced Circle Park home • +200 XP.')}
 const checkInBusiness=()=>{if(!businessNear||businessComplete)return;setBusinessComplete(true);setXp(v=>v+50);setMessage('BUSINESS MISSION COMPLETE • Neighborhood Check-In • +50 XP.')}
 const captureMission=async()=>{if(!missionComplete)return;const share={title:'StreetVerse Chicago',text:`I completed ${selectedMission?.title||'Circle Park Arrival'} in StreetVerse Chicago • +${selectedMission?.rewardXP||100} XP`};try{if(navigator.share){await navigator.share(share);setShareMessage('Share sheet opened • choose Reels, LIVE, Messages or another app.')}else{await navigator.clipboard?.writeText(share.text);setShareMessage('Mission highlight copied • ready for TRYAMM Reels/Holo LIVE composer.')}}catch{setShareMessage('Share cancelled • mission highlight remains ready.')}}
 const commandDog=(cmd:CompanionCommand)=>{companionCommand.current=cmd;setDogCommand(cmd);const labels:Record<CompanionCommand,string>={follow:'Companion following.',stay:'Companion staying here.',search:'Companion searching the nearby mission area.',help:'Companion ready to assist/rescue.',defend:'Companion guarding during fictional gameplay danger.',return:'Companion returning to you.'};setMessage(labels[cmd])}
 const baseNextObjective=chicagoNextObjective({disposedCount:disposed.length,carrying:Boolean(carrying),repairKit,repairStep,driving,routeIndex,routeComplete})
 const nextObjective=mobilityJob&&mobilityStage!=='complete'?(mobilityStage==='pickup'?mobilityJob.label:(mobilityJob.kind==='recovery'?'TOW VEHICLE TO IMPOUND':'GO TO DESTINATION')):baseNextObjective
 const repairAction=['OPEN HOOD','FIX ENGINE','CLOSE HOOD'][repairStep]||'REPAIR COMPLETE'
 return <div tabIndex={0} onKeyDown={keyDown} onKeyUp={stop} aria-label="Playable StreetVerse Chicago Circle Park world" style={{position:'fixed',inset:0,zIndex:2500,background:'#050b14',outline:'none'}}><div ref={mountRef} style={{position:'absolute',inset:0}}/>
  <div style={{position:'absolute',top:12,left:12,right:12,padding:12,border:'1px solid #00ffcc88',borderRadius:14,background:'#07131dcc',color:'#eaffff',fontFamily:'system-ui'}}><b>STREETVERSE CHICAGO • CIRCLE PARK</b><div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:5,fontSize:11}}><span>PLAYER: {selectedCharacter}</span><span>MISSION: {missionComplete?'COMPLETE':selectedMission?.title||'REACH THE GLOWING ENTRANCE'}</span><span>REWARD: {selectedMission?`+${selectedMission.rewardXP} XP`:'+100 XP'}</span><span>MISSION XP: {xp}</span><span>CIRCLE XP: {circleXp}/1000</span><span>HOME: {starterHome?'CLAIMED':'FIND IT'}</span><span>CHICAGO: {chicagoUnlocked?'UNLOCKED':'LOCKED'}</span><span>CITY ACTIVITY: 18 PEDS • 10 CARS • 4 MOTOS + JOB TRAFFIC</span><span>BUSINESS: {businessComplete?'CHECKED IN':'DISCOVER'}</span><span>NATIVE ASSETS: {nativeAssets.state} • {nativeAssets.loaded} LOADED{nativeAssets.failed?` • ${nativeAssets.failed} FALLBACK`:''}</span><span>2027 FLEET: ACTIVE • RARE AIR TRAFFIC</span><span>MOBILITY: {mobilityJob?mobilityStage.toUpperCase():'AVAILABLE'}</span></div><div style={{fontSize:12,opacity:.82}}>Chicago-inspired playable district • TRYAMM native GLB preview layer + authoritative gameplay primitives • conceptual massing, not survey/CAD geometry.</div><div style={{fontSize:12,marginTop:5}}>{message}{interior?` • FLOOR ${floorLevel}`:''}</div><div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:7,fontSize:11,fontWeight:900}}><span>CLEANUP: {disposed.length}/{CIRCLE_PARK_WASTE_PICKUPS.length}{carrying?' • CARRYING':''}</span><span>CAR: {driving?'DRIVING':repairStep>=3?'REPAIRED':repairKit?`REPAIR ${repairStep}/3`:'BROKEN'}</span><span>ROUTE: {Math.min(routeIndex,STREETVERSE_CHICAGO_ROUTE.length)}/{STREETVERSE_CHICAGO_ROUTE.length}</span><span style={{color:'#ffd75e'}}>NEXT: {nextObjective}</span></div></div>
  <div aria-live="polite" style={{position:'absolute',width:1,height:1,overflow:'hidden',clip:'rect(0 0 0 0)'}}>{message}</div>
  <div aria-label="Circle Park analog movement joystick" onPointerDown={joystick} onPointerMove={e=>{if(e.buttons)joystick(e)}} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop} style={{position:'absolute',left:18,bottom:20,width:124,height:124,borderRadius:'50%',border:'2px solid #00ffcc',background:'#06131bcc',touchAction:'none',boxShadow:'inset 0 0 28px #00ffcc33'}}><div ref={joystickKnob} style={{position:'absolute',left:44,top:44,width:32,height:32,borderRadius:'50%',background:'#eaffff',boxShadow:'0 0 18px #00ffcc',transition:'transform 35ms linear'}}/></div>
  <div aria-label="One-hand movement controls" style={{position:'absolute',left:18,bottom:152,display:'grid',gridTemplateColumns:'repeat(3,38px)',gap:4}}><span/><button aria-label="Move forward" onPointerDown={()=>move(0,1)} onPointerUp={stop} onPointerCancel={stop} style={moveBtn}>▲</button><span/><button aria-label="Move left" onPointerDown={()=>move(-1,0)} onPointerUp={stop} onPointerCancel={stop} style={moveBtn}>◀</button><button aria-label="Stop movement" onClick={stop} style={moveBtn}>■</button><button aria-label="Move right" onPointerDown={()=>move(1,0)} onPointerUp={stop} onPointerCancel={stop} style={moveBtn}>▶</button><span/><button aria-label="Move backward" onPointerDown={()=>move(0,-1)} onPointerUp={stop} onPointerCancel={stop} style={moveBtn}>▼</button><span/></div>
  <div aria-label="StreetVerse contextual actions" style={{position:'absolute',right:16,top:150,display:'flex',flexDirection:'column',alignItems:'stretch',gap:8,minWidth:190,maxWidth:'44vw'}}>
   {nearWasteId&&!carrying&&<button onClick={pickUpTrash} style={actionBtn}>PICK UP TRASH</button>}
   {carrying&&nearDump&&<button onClick={disposeTrash} style={actionBtn}>DISPOSE TRASH</button>}
   {nearKit&&!repairKit&&<button onClick={pickRepairKit} style={actionBtn}>PICK UP REPAIR KIT</button>}
   {nearCar&&<button onClick={toggleCarDoors} style={actionBtn}>{doorsOpen?'CLOSE DOORS':'OPEN DOORS'}</button>}
   {nearCar&&repairKit&&repairStep<3&&!driving&&<button onClick={repairCar} style={actionBtn}>{repairAction}</button>}
   {(nearCar||driving)&&<button onClick={toggleVehicle} style={{...actionBtn,border:'1px solid #59e7ff',color:'#9af0ff'}}>{driving?'EXIT VEHICLE':'ENTER VEHICLE'}</button>}
  </div>
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
const actionBtn:React.CSSProperties={minHeight:48,padding:'11px 13px',borderRadius:14,border:'1px solid #ffd75eaa',background:'#07131bee',color:'#fff',fontSize:11,fontWeight:950,touchAction:'manipulation',boxShadow:'0 8px 24px #0008'}