import {useEffect,useRef,useState} from 'react'
import './streetverse-mobile-layout.css'
import {createStreetVerseCameraClearance} from '../runtime/StreetVerseCameraClearance'
import {createStreetVerseWestSideVisibleWorld} from '../runtime/StreetVerseWestSideVisibleWorldRuntime'
import * as THREE from 'three'
import {createMobileResidentPopulation,disposeMobileResidentPopulation,tickMobileResidentPopulation} from '../runtime/StreetVerseMobileLivingCityRuntime'
import {createStreetVerseWeatherRenderer,weatherBadge,type StreetVerseWeatherState} from '../runtime/StreetVerseWeatherRuntime'
import {normalizeStreetVerseHumanHeight,STREETVERSE_HUMAN_HEIGHT_METERS,residentHeight} from '../runtime/StreetVerseHumanScale'
import {CIRCLE_PARK_SPAWN,CHICAGO_ROAD_CORRIDORS,CHICAGO_STREETVERSE_PLACES,nearestChicagoPlace,worldToChicagoGridCell} from '../data/StreetVerseChicagoGrid'
import {CIRCLE_PARK_RESIDENT_ENTRANCE} from '../data/CircleParkResidentEntrance'
import {createStreetVerseChicagoAliveMobile} from '../runtime/StreetVerseChicagoAliveMobileRuntime'
import {createStreetVerseChicagoVisualLife} from '../runtime/StreetVerseChicagoVisualLifeRuntime'
import {createStreetVerseChicagoTrafficLife,type StreetVerseTrafficAxis,type StreetVerseTrafficDirection} from '../runtime/StreetVerseChicagoTrafficLifeRuntime'
import {createStreetVerseChicagoIdentityInteraction,type StreetVerseInteractionPrompt} from '../runtime/StreetVerseChicagoIdentityInteractionRuntime'
import {createStreetVerseChicagoPedestrianRoutines} from '../runtime/StreetVerseChicagoPedestrianRoutineRuntime'
import {disposeNativeAssetLayer,loadTryammNativeCircleParkLayer} from '../runtime/TryammNativeAssetRuntime'
import type {NativePlacement} from '../data/TryammNativeRuntimeAssetCatalog'
import {WORLD_REGISTRY,advanceWorldBuild,canPublishWorld,queueWorldBuild} from '../game/simulation/worldBuilderPipeline'
import {useGameStore} from '../game/state/useGameStore'
import type {GameplayAction} from '../game/simulation/gameplaySimulationBridge'
import CircleParkBasketballGame from './CircleParkBasketballGame'
import StreetVersePoolGame from './StreetVersePoolGame'
import CircleParkSeniorCommonsPanel from './CircleParkSeniorCommonsPanel'
import StreetVerseResourcePassport from './StreetVerseResourcePassport'
import StreetVersePocketDimension from './StreetVersePocketDimension'
import StreetVerseReelCaptureOverlay from './StreetVerseReelCaptureOverlay'
import StreetVerseLiveTalkControl from './StreetVerseLiveTalkControl'
import {installStreetVerseReelCapture} from '../runtime/StreetVerseReelCaptureRuntime'
import {createStreetVerseUnderwaterPoolRuntime} from '../runtime/StreetVerseUnderwaterPoolRuntime'
import {createStreetVerseInsectEcology} from '../runtime/StreetVerseInsectEcologyRuntime'
import {createStreetVerseRodentRuntime} from '../runtime/StreetVerseRodentRuntime'
import {installCircleParkResidentAccessRuntime} from '../runtime/CircleParkResidentAccessRuntime'
import {installCircleParkCommunitySafetyRuntime} from '../runtime/CircleParkCommunitySafetyRuntime'
import {installStreetVerseResourcePassportRuntime} from '../runtime/StreetVerseResourcePassportRuntime'
import {announceStreetVerseCharacterReady,STREETVERSE_HERO_CHARACTER_ID} from '../data/streetVerseNamedCharacterRegistry'
import {canClaimPhotoMatched} from '../data/StreetVerseCharacterReferenceAuthorization'
import {installStreetVerseCharacterDevelopmentRuntime} from '../runtime/StreetVerseCharacterDevelopmentRuntime'
import {installStreetVerseCharacterHeadRuntime} from '../runtime/StreetVerseCharacterHeadRuntime'
import {installStreetVerseFacialExpressionRuntime} from '../runtime/StreetVerseFacialExpressionRuntime'
import {installStreetVerseEmotionalIntelligenceRuntime} from '../runtime/StreetVerseEmotionalIntelligenceRuntime'
import {installStreetVerseBodyNeedsRuntime} from '../runtime/StreetVerseBodyNeedsRuntime'
import {installStreetVerseThreatResponseRuntime} from '../runtime/StreetVerseThreatResponseRuntime'
import {installStreetVerseWorldConsequenceRuntime} from '../runtime/StreetVerseWorldConsequenceRuntime'
import type {StreetVerseWorldConsequenceMission} from '../runtime/StreetVerseWorldConsequenceRuntime'
import {BJ_PHOTOMATCH_ASSET,installBJPhotoMatchedHead} from '../runtime/StreetVerseBJPhotoMatchRuntime'
import {BJ_MESHY_V6_ASSET,loadStreetVerseMeshyBJHero,type StreetVerseMeshyBJHeroHandle} from '../runtime/StreetVerseMeshyBJHeroRuntime'
import {loadStreetVerseMeshyCharacter,type StreetVerseMeshyLoadedCharacter} from '../runtime/StreetVerseMeshyCharacterRuntime'
import {loadStreetVersePublishedBodyBase,type StreetVersePublishedBodyHandle} from '../runtime/StreetVersePublishedBodyBaseRuntime'
import CircleParkGuardCheckInHUD from './CircleParkGuardCheckInHUD'
import StreetVerseAdultRecreationHUD from './StreetVerseAdultRecreationHUD'
import StreetVerseEmergencyCallHUD from './StreetVerseEmergencyCallHUD'
import StreetVerseEmergencyIncidentLifecycle from './StreetVerseEmergencyIncidentLifecycle'
import StreetVerseResponderNPCController from './StreetVerseResponderNPCController'
import StreetVerseEmergencyFleetWorld from './StreetVerseEmergencyFleetWorld'
import StreetVerseThomasJeffersonSchool from './StreetVerseThomasJeffersonSchool'
import StreetVerseSchoolLearningHUD from './StreetVerseSchoolLearningHUD'
import StreetVerseSchoolLifeWorld from './StreetVerseSchoolLifeWorld'
import StreetVerseWestSideMissionDirector from './StreetVerseWestSideMissionDirector'
import StreetVerseDialogueHUD from './StreetVerseDialogueHUD'
import {installStreetVerseAdultSubstanceRuntime} from '../runtime/StreetVerseAdultSubstanceRuntime'
import StreetVerseRescueMissionHUD from './StreetVerseRescueMissionHUD'
import HoloGPTAssistant from './HoloGPTAssistant'
import StreetVerseInGamePanels from './StreetVerseInGamePanels'
import {installStreetVerseSoundBankRuntime} from '../runtime/StreetVerseSoundBankRuntime'
import {installStreetVerseAICafeBridgeRuntime} from '../runtime/StreetVerseAICafeBridgeRuntime'
import {installStreetVerseRescueIncidentRuntime} from '../runtime/StreetVerseRescueIncidentRuntime'
import {registerStreetVerseScene} from '../game/streetverseSceneRegistry'
import UniversalMissionDirector from './UniversalMissionDirector'
import {boardTransport,createTransportManifest,leaveTransport,passengerCount,type TransportManifest} from '../runtime/StreetVersePassengerTransportRuntime'


const SAVE_KEY='tryamm.streetverse.living.v1'
const NATIVE_CITY_BLOCKS=[[-70,-70],[-70,-25],[-70,25],[-70,70],[-25,-70],[-25,-25],[-25,25],[-25,70],[25,-70],[25,-25],[25,25],[25,70],[70,-70],[70,-25],[70,25],[70,70]] as const
const nativeBuildingLabel=(i:number)=>({
  5:'mobile-native-building-west-south',
  6:'mobile-native-building-west',
  7:'mobile-native-building-west-spawn',
  9:'mobile-native-building-east-south',
  10:'mobile-native-building-east',
  11:'mobile-native-building-east-spawn',
} as Record<number,string>)[i]||`mobile-native-building-${i+1}`
const clamp=(v:number)=>THREE.MathUtils.clamp(v,-82,82)

export default function StreetVerseMobileWorld({onClose}:{onClose:()=>void}){
 const mountRef=useRef<HTMLDivElement|null>(null)
 const input=useRef({up:false,down:false,left:false,right:false})
 const directTouchInput=useRef({up:false,down:false,left:false,right:false})
 const analogInput=useRef({x:0,y:0})
 const joystickKnobRef=useRef<HTMLDivElement|null>(null)
 const interactionRef=useRef<StreetVerseInteractionPrompt|null>(null)
 const focusedMissionId=useRef<string|null>(null)
 const [interactionPrompt,setInteractionPrompt]=useState<StreetVerseInteractionPrompt|null>(null)
 const [status,setStatus]=useState('MOBILE CITY • STARTING')
 const [message,setMessage]=useState('StreetVerse Mobile Mode • lightweight Chicago renderer')
 const [weatherStatus,setWeatherStatus]=useState('WEATHER • CONNECTING')
 const [menuOpen,setMenuOpen]=useState(false)
 const [missionGuide,setMissionGuide]=useState<{id:string,label:string,distance:number,bearing:string,objective?:string}|null>(null)
 const [basketballOpen,setBasketballOpen]=useState(false)
 const [poolSessionId,setPoolSessionId]=useState<string|null>(null)
 const [seniorCommonsOpen,setSeniorCommonsOpen]=useState(false)
 const [resourcePassportOpen,setResourcePassportOpen]=useState(false)
 const [pocketDimensionOpen,setPocketDimensionOpen]=useState(false)
 const [socialToolsOpen,setSocialToolsOpen]=useState(false)
 const [firstJourneyReady,setFirstJourneyReady]=useState(false)
 const [firstJourneyReelReady,setFirstJourneyReelReady]=useState(false)
 const [districtReelReady,setDistrictReelReady]=useState(false)
 const firstJourneyReadyRef=useRef(false)
 const reelReadyRef=useRef(false)
 const [controlSide,setControlSide]=useState<'left'|'right'>(()=>{try{return localStorage.getItem('tryamm:streetverse-one-hand-side')==='right'?'right':'left'}catch{return'left'}})
 const [vehicleOccupied,setVehicleOccupied]=useState(false)
 const [cameraUiMode,setCameraUiMode]=useState<'first-person'|'third-person'>('third-person')
 const [vehicleCameraUiMode,setVehicleCameraUiMode]=useState('chase')
 const joystickLastMoveAt=useRef(0)
 useEffect(()=>{const onVehicle=(e:Event)=>setVehicleOccupied(Boolean((e as CustomEvent<{entered?:boolean}>).detail?.entered));const onPlayerCamera=(e:Event)=>setCameraUiMode((e as CustomEvent<{mode?:'first-person'|'third-person'}>).detail?.mode==='first-person'?'first-person':'third-person');const onCarCamera=(e:Event)=>setVehicleCameraUiMode(String((e as CustomEvent<{mode?:string}>).detail?.mode||'chase'));addEventListener('tryamm:streetverse-vehicle-controlled',onVehicle);addEventListener('tryamm:streetverse-player-camera-changed',onPlayerCamera);addEventListener('tryamm:streetverse-vehicle-camera-changed',onCarCamera);return()=>{removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicle);removeEventListener('tryamm:streetverse-player-camera-changed',onPlayerCamera);removeEventListener('tryamm:streetverse-vehicle-camera-changed',onCarCamera)}},[])
 useEffect(()=>{
  const mount=mountRef.current;if(!mount)return
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'default',alpha:false})}catch(err){setStatus('WEBGL UNAVAILABLE');setMessage('This browser could not start the 3D renderer. Close other tabs and reload StreetVerse.');return}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.35));renderer.shadowMap.enabled=false;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.24;mount.appendChild(renderer.domElement)
  const reelCapture=installStreetVerseReelCapture(renderer.domElement)
  const scene=new THREE.Scene();scene.background=new THREE.Color(0xa9c2d4);scene.fog=new THREE.Fog(0xa9c2d4,95,245)
  const externalCollisionBoxes:THREE.Box3[]=[]
  const westSideVisibleWorld=createStreetVerseWestSideVisibleWorld(scene,externalCollisionBoxes)
  const unregisterScene=registerStreetVerseScene({scene,collisionBoxes:externalCollisionBoxes})
  const rescueFireRoot=new THREE.Group();rescueFireRoot.name='streetverse-dynamic-rescue-fire';rescueFireRoot.visible=false;scene.add(rescueFireRoot)
  const rescueFlames:THREE.Mesh[]=[]
  for(let i=0;i<8;i++){
    const flame=new THREE.Mesh(new THREE.ConeGeometry(.45+(i%3)*.12,1.7+(i%2)*.65,7),new THREE.MeshBasicMaterial({color:i%2?0xff9b2f:0xff5a20,transparent:true,opacity:.82,depthWrite:false}))
    flame.position.set((i%4-1.5)*.8,.9+Math.floor(i/4)*1.1,(i%2-.5)*1.3);rescueFireRoot.add(flame);rescueFlames.push(flame)
  }
  const rescueSmoke:THREE.Mesh[]=[]
  for(let i=0;i<6;i++){
    const puff=new THREE.Mesh(new THREE.SphereGeometry(.8+i*.10,8,6),new THREE.MeshBasicMaterial({color:0x2a2a2a,transparent:true,opacity:.28,depthWrite:false}))
    puff.position.set((i%2-.5)*.8,2.6+i*.65,(i%3-1)*.45);rescueFireRoot.add(puff);rescueSmoke.push(puff)
  }
  let rescueBurnProgress=0
  const onStructureFireState=(event:Event)=>{
    const d=(event as CustomEvent<{x?:number;z?:number;burning?:boolean;burnProgress?:number}>).detail||{}
    rescueFireRoot.position.set(Number(d.x||0),0,Number(d.z||0))
    rescueFireRoot.visible=Boolean(d.burning)
    rescueBurnProgress=THREE.MathUtils.clamp(Number(d.burnProgress||0),0,100)
    if(rescueFireRoot.visible)setMessage('RESCUE ALERT • STRUCTURE FIRE • responders en route')
  }
  addEventListener('tryamm:streetverse-structure-fire-state',onStructureFireState)
  const camera=new THREE.PerspectiveCamera(62,1,.1,320);camera.position.set(0,16,24)
  const hemi=new THREE.HemisphereLight(0xb9e7ff,0x151822,2.2);scene.add(hemi);const sun=new THREE.DirectionalLight(0xffdfbc,1.8);sun.position.set(35,55,20);scene.add(sun);const faceFill=new THREE.DirectionalLight(0x86bdff,.42);faceFill.position.set(-30,16,28);scene.add(faceFill)
  const weatherRenderer=createStreetVerseWeatherRenderer(scene,hemi,sun,{mobile:true,radius:88})
  const chicagoWorldSeed=WORLD_REGISTRY.find(seed=>seed.id==='us-il-chicago')
  let worldBuild=chicagoWorldSeed?queueWorldBuild(chicagoWorldSeed):null
  const advanceLiveWorldBuild=(check:string,passed:boolean)=>{
    if(!worldBuild)return
    worldBuild=advanceWorldBuild(worldBuild,check,passed)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-world-builder-state',{detail:{...worldBuild,publishable:canPublishWorld(worldBuild),assetGenerator:'tryamm-native-asset-foundry',quantumSpeedEngine:true,source:'streetverse-mobile-world'}}))
  }
  const applyWorldEconomy=(action:GameplayAction,source:string)=>{
    const before=useGameStore.getState().cityConsequences
    useGameStore.getState().applyCityConsequence(action)
    const after=useGameStore.getState().cityConsequences
    const changed=after.jobs!==before.jobs||after.businesses!==before.businesses||after.population!==before.population||after.traffic!==before.traffic||after.culture!==before.culture||after.reputation!==before.reputation||after.cashReward!==before.cashReward||after.xpReward!==before.xpReward
    if(changed)advanceLiveWorldBuild('economy',true)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-economy-evidence',{detail:{action,source,changed,before,after}}))
    return changed
  }
  const onGameplayAction=(event:Event)=>{const detail=(event as CustomEvent<{action?:GameplayAction;source?:string}>).detail||{};if(detail.action)applyWorldEconomy(detail.action,String(detail.source||'streetverse-gameplay-action'))}
  addEventListener('tryamm:streetverse-gameplay-action',onGameplayAction)
  type NativeHumanoidRig={head:THREE.Object3D|null;spine:THREE.Object3D|null;leftArm:THREE.Object3D|null;rightArm:THREE.Object3D|null;leftLeg:THREE.Object3D|null;rightLeg:THREE.Object3D|null;leftEyelid:THREE.Object3D|null;rightEyelid:THREE.Object3D|null;leftIris:THREE.Object3D|null;rightIris:THREE.Object3D|null;leftPupil:THREE.Object3D|null;rightPupil:THREE.Object3D|null;leftBrow:THREE.Object3D|null;rightBrow:THREE.Object3D|null;jaw:THREE.Object3D|null}
  const nativeHumanoidRig=(visual:THREE.Object3D|null):NativeHumanoidRig|null=>visual?{head:visual.getObjectByName('rig-head')||null,spine:visual.getObjectByName('rig-spine')||null,leftArm:visual.getObjectByName('rig-left-arm')||null,rightArm:visual.getObjectByName('rig-right-arm')||null,leftLeg:visual.getObjectByName('rig-left-leg')||null,rightLeg:visual.getObjectByName('rig-right-leg')||null,leftEyelid:visual.getObjectByName('eyelid-left')||null,rightEyelid:visual.getObjectByName('eyelid-right')||null,leftIris:visual.getObjectByName('iris-left')||null,rightIris:visual.getObjectByName('iris-right')||null,leftPupil:visual.getObjectByName('pupil-left')||null,rightPupil:visual.getObjectByName('pupil-right')||null,leftBrow:visual.getObjectByName('brow-left')||null,rightBrow:visual.getObjectByName('brow-right')||null,jaw:visual.getObjectByName('jaw')||null}:null
  const animateNativeHumanoid=(rig:NativeHumanoidRig|null|undefined,moving:boolean,run:boolean,now:number,phase:number,facialDetail:boolean,talking=false,focusYaw=0,liveTalkLevel=0,affectBreathing=.15,affectPosture='neutral')=>{if(!rig)return;const t=now*.001,rate=run?10:6.8,amp=moving?(run?.88:.58):.035,swing=Math.sin(t*rate+phase)*amp;if(rig.leftArm)rig.leftArm.rotation.x=swing;if(rig.rightArm)rig.rightArm.rotation.x=-swing;if(rig.leftLeg)rig.leftLeg.rotation.x=-swing*.76;if(rig.rightLeg)rig.rightLeg.rotation.x=swing*.76;if(rig.head){const idleYaw=moving?Math.sin(t*rate*.45+phase)*.045:Math.sin(t*.72+phase)*.10;rig.head.rotation.y=THREE.MathUtils.lerp(rig.head.rotation.y,talking?focusYaw:idleYaw,talking?.18:.10);rig.head.rotation.x=THREE.MathUtils.lerp(rig.head.rotation.x,talking?Math.sin(t*.85)*.018:0,.12)}const breathRate=1.15+THREE.MathUtils.clamp(affectBreathing,0,1)*1.35,breath=Math.sin(t*breathRate+phase)*.5+.5,breathDepth=.004+THREE.MathUtils.clamp(affectBreathing,0,1)*.010,postureLean=affectPosture==='withdrawn'?.045:affectPosture==='guarded'?.028:affectPosture==='open'?-.018:affectPosture==='energized'?-.010:0;if(rig.spine){rig.spine.rotation.z=moving?Math.sin(t*rate+phase)*.022:Math.sin(t*.55+phase)*.012;rig.spine.rotation.x=(moving?.025:Math.sin(t*.9+phase)*.008)+postureLean;rig.spine.scale.set(1+breath*breathDepth*.5,1+breath*breathDepth,1+breath*breathDepth*.4)}if(!facialDetail)return;const blinkClock=(t+phase*.41)%4.6,blink=blinkClock>4.36?Math.sin(((blinkClock-4.36)/.24)*Math.PI):0;for(const eyelid of [rig.leftEyelid,rig.rightEyelid])if(eyelid){eyelid.scale.y=.16+blink*.52;eyelid.position.y=.108-blink*.018}const glance=(talking?focusYaw*.22:0)+Math.sin(t*.73+phase)*.018;for(const eye of [rig.leftIris,rig.rightIris,rig.leftPupil,rig.rightPupil])if(eye)eye.rotation.y=glance;const expression=Math.sin(t*.31+phase),talkBrow=talking?.018:0;if(rig.leftBrow)rig.leftBrow.rotation.z=.05+expression*.025-talkBrow;if(rig.rightBrow)rig.rightBrow.rotation.z=-.05-expression*.025+talkBrow;if(rig.jaw){const synthetic=talking?Math.max(0,(Math.sin(t*12.4)+Math.sin(t*7.1+1.2)+.35)/2.35)*.09:Math.max(0,Math.sin(t*.47+phase))*.012;const mic=THREE.MathUtils.clamp(liveTalkLevel,0,1)*.115;rig.jaw.rotation.x=Math.max(synthetic,mic)}}
  const applySeatedDriverPose=(rig:NativeHumanoidRig|null|undefined)=>{if(!rig)return;if(rig.spine)rig.spine.rotation.x=.08;if(rig.leftLeg){rig.leftLeg.rotation.x=-1.18;rig.leftLeg.rotation.z=.06}if(rig.rightLeg){rig.rightLeg.rotation.x=-1.18;rig.rightLeg.rotation.z=-.06}if(rig.leftArm){rig.leftArm.rotation.x=-.72;rig.leftArm.rotation.z=-.30}if(rig.rightArm){rig.rightArm.rotation.x=-.72;rig.rightArm.rotation.z=.30}}
  let nativeLayer:THREE.Group|null=null,nativeHero:THREE.Object3D|null=null,nativeTrain:THREE.Object3D|null=null,nativeStarterCar:THREE.Object3D|null=null,nativeRepairCar:THREE.Object3D|null=null,nativeResidents:THREE.Object3D[]=[],nativeTrafficCars:THREE.Object3D[]=[],nativeBuildings:THREE.Object3D[]=[],primitiveBuildingVisuals:THREE.Object3D[][]=[],nativeHeroRig:NativeHumanoidRig|null=null,nativeResidentRigs:Array<NativeHumanoidRig|null>=[],nativeDriverDoorPivot:THREE.Object3D|null=null,nativePassengerDoorPivot:THREE.Object3D|null=null,nativeHoodPivot:THREE.Object3D|null=null,nativeCancelled=false,nativeWindLocs:THREE.Object3D[]=[],heroConversationUntil=0,heroConversationFocusYaw=0,heroLiveTalkLevel=0,heroAffectBreathing=.15,heroAffectPosture='neutral',heroBodyMovementScale=1,heroSprintAllowed=true,bjHeadRuntime:ReturnType<typeof installStreetVerseCharacterHeadRuntime>|null=null,bjPhotoMatch:ReturnType<typeof installBJPhotoMatchedHead>|null=null,bjPhotoMatchReady=false,bjMeshyHero:StreetVerseMeshyBJHeroHandle|null=null,publishedHeroBody:StreetVersePublishedBodyHandle|null=null,familyHeroHandle:StreetVerseMeshyLoadedCharacter|null=null,meshyResidentHandles:Array<StreetVerseMeshyLoadedCharacter|null>=Array(12).fill(null),nativeHeroFallback:THREE.Object3D|null=null,onPlayerAssetSelect:((event:Event)=>void)|null=null
  const mobileNativePlacements:NativePlacement[]=[
    {asset:'sportSedan2027',position:[-8,0,50],rotationY:0,label:'mobile-repair-car-native'},
    {asset:'boxTruckCustom2027',position:[32,0,-24],rotationY:Math.PI/2,label:'mobile-custom-box-truck'},
    {asset:'vehicleBlockout',position:[8,0,54],rotationY:0,label:'mobile-parked-car-a'},
    {asset:'vehicleBlockout',position:[-5,0,34],rotationY:Math.PI,label:'mobile-parked-car-b'},

    {asset:'tree',position:[-16,0,18],scale:1.05,label:'mobile-native-tree-west'},
    {asset:'tree',position:[16,0,18],scale:1.05,label:'mobile-native-tree-east'},
    {asset:'tree',position:[-16,0,42],scale:.95,label:'mobile-native-tree-west-spawn'},
    {asset:'tree',position:[16,0,42],scale:1.08,label:'mobile-native-tree-east-spawn'},
    {asset:'tree',position:[-16,0,62],scale:1.02,label:'mobile-native-tree-west-north'},
    {asset:'tree',position:[16,0,62],scale:.98,label:'mobile-native-tree-east-north'},

    {asset:'streetLamp',position:[-8,0,40],label:'mobile-native-lamp-west'},
    {asset:'streetLamp',position:[8,0,40],label:'mobile-native-lamp-east'},
    {asset:'streetLamp',position:[-8,0,58],label:'mobile-native-lamp-west-spawn'},
    {asset:'streetLamp',position:[8,0,58],label:'mobile-native-lamp-east-spawn'},
    {asset:'streetLamp',position:[-8,0,20],label:'mobile-native-lamp-west-south'},
    {asset:'streetLamp',position:[8,0,20],label:'mobile-native-lamp-east-south'},

    {asset:'bench',position:[-13,0,46],rotationY:Math.PI/2,label:'mobile-native-bench-west'},
    {asset:'bench',position:[13,0,46],rotationY:-Math.PI/2,label:'mobile-native-bench-east'},
    {asset:'hydrant',position:[10,0,44],label:'mobile-native-hydrant-a'},
    {asset:'hydrant',position:[-10,0,30],label:'mobile-native-hydrant-b'},
    {asset:'trashCan',position:[-12,0,52],label:'mobile-native-trash-can'},
    {asset:'recyclingBin',position:[12,0,52],label:'mobile-native-recycling-bin'},

    {asset:'holoWayfinder',position:[0,0,34],label:'mobile-native-wayfinder'},
    {asset:'holoWayfinder',position:[0,0,58],label:'mobile-native-wayfinder-spawn'},
    {asset:'heroPlayer',position:[0,0,0],label:'mobile-native-hero'},
    {asset:'sportSedan2027',position:[-18,0,50],rotationY:0,label:'mobile-starter-car-native'},
    {asset:'cityTransitTrain',position:[-70,6.1,-35],rotationY:0,label:'mobile-native-train'},
  ]
  NATIVE_CITY_BLOCKS.forEach(([x,z],i)=>{if(i===3||i===7)return;mobileNativePlacements.push({
    asset:'building',
    position:[x,0,z],
    rotationY:i%2?Math.PI:0,
    scale:i%4===0?1.18:i%4===1?1.08:i%4===2?1.12:1,
    label:nativeBuildingLabel(i),
  })})
  const nativeResidentCycle=['residentA','residentB','residentC','residentD','residentE','residentF','residentG','residentH'] as const
  const nativeResidentVisualScale=[.94,1.04,.98,1.09,.92,1.06,1.00,1.11] as const
  for(let i=0;i<12;i++)mobileNativePlacements.push({asset:nativeResidentCycle[i%nativeResidentCycle.length],position:[0,0,0],scale:nativeResidentVisualScale[i%nativeResidentVisualScale.length],label:`mobile-native-resident-${i+1}`})
  for(let i=0;i<14;i++)mobileNativePlacements.push({asset:'sportSedan2027',position:[0,0,0],label:`mobile-native-traffic-car-${i+1}`})
  void loadTryammNativeCircleParkLayer({placements:mobileNativePlacements}).then(result=>{
    if(nativeCancelled){disposeNativeAssetLayer(result.group);return}
    nativeLayer=result.group
    nativeHero=result.group.getObjectByName('mobile-native-hero')||null
    nativeHeroFallback=nativeHero
    nativeTrain=result.group.getObjectByName('mobile-native-train')||null
    nativeStarterCar=result.group.getObjectByName('mobile-starter-car-native')||null
    nativeRepairCar=result.group.getObjectByName('mobile-repair-car-native')||null
    nativeResidents=Array.from({length:12},(_,i)=>result.group.getObjectByName(`mobile-native-resident-${i+1}`)).filter((item):item is THREE.Object3D=>Boolean(item))
    nativeResidents.forEach((resident,i)=>normalizeStreetVerseHumanHeight(resident,residentHeight(i)))
    nativeHeroRig=nativeHumanoidRig(nativeHero)
    if(nativeHero){
      normalizeStreetVerseHumanHeight(nativeHero,STREETVERSE_HUMAN_HEIGHT_METERS.adultHero)
      nativeHero.userData={...nativeHero.userData,characterId:STREETVERSE_HERO_CHARACTER_ID,displayName:'BJ Stubbs',identityContinuityKey:STREETVERSE_HERO_CHARACTER_ID,namedCharacter:true,era:'current',headArchitecture:'bj-v5-photo-match-ready',photoMatchedAssetId:BJ_PHOTOMATCH_ASSET.id}
      bjPhotoMatch?.dispose()
      // A reference photo is an optional preview, never the default game face.
      const previewPhotoHead=new URLSearchParams(window.location.search).get('svPhotoHead')==='1'
      bjPhotoMatch=previewPhotoHead?installBJPhotoMatchedHead(nativeHero):null
      bjPhotoMatchReady=false
      if(bjPhotoMatch)void bjPhotoMatch.ready.then(ok=>{
        if(nativeCancelled)return
        bjPhotoMatchReady=ok
        if(ok){
          nativeHero!.userData={...nativeHero!.userData,photoMatchedHeadActive:true,photoMatchedAssetId:BJ_PHOTOMATCH_ASSET.id,photoReferenceTextureAuthority:true}
          announceStreetVerseCharacterReady({id:STREETVERSE_HERO_CHARACTER_ID,assetId:BJ_PHOTOMATCH_ASSET.id,era:'current',photoMatched:canClaimPhotoMatched(STREETVERSE_HERO_CHARACTER_ID),source:'streetverse-mobile-approved-bj-head'})
          window.dispatchEvent(new CustomEvent('tryamm:streetverse-hero-visual-authority',{detail:{characterId:STREETVERSE_HERO_CHARACTER_ID,displayName:'BJ Stubbs',assetId:BJ_PHOTOMATCH_ASSET.id,referenceMatchedPreview:true,photoMatched:canClaimPhotoMatched(STREETVERSE_HERO_CHARACTER_ID),certifiedLikeness:canClaimPhotoMatched(STREETVERSE_HERO_CHARACTER_ID),active3DMesh:true,approvedReferencePixels:true,proceduralFaceHidden:true}}))
        }
      })
      bjHeadRuntime?.dispose()
      bjHeadRuntime=installStreetVerseCharacterHeadRuntime(nativeHero,STREETVERSE_HERO_CHARACTER_ID)
      nativeWindLocs=[]
      nativeHero.traverse(object=>{if(/loc|braid/i.test(object.name)){object.userData={...object.userData,windBaseRotation:{x:object.rotation.x,y:object.rotation.y,z:object.rotation.z}};nativeWindLocs.push(object)}})
      announceStreetVerseCharacterReady({id:STREETVERSE_HERO_CHARACTER_ID,assetId:'streetverse-hero-player',era:'current',photoMatched:false,source:'streetverse-mobile-procedural-fallback-until-photo-head-ready'})
    }
    if(nativeHeroFallback){
      void loadStreetVerseMeshyBJHero().then(handle=>{
        if(!handle)return
        if(nativeCancelled||!nativeLayer){handle.dispose();return}
        bjMeshyHero?.dispose()
        bjMeshyHero=handle
        bjPhotoMatch?.dispose();bjPhotoMatch=null;bjPhotoMatchReady=false
        bjHeadRuntime?.dispose();bjHeadRuntime=null
        nativeHeroFallback!.visible=false
        nativeLayer.add(handle.object)
        nativeHero=handle.object
        nativeHero.position.copy(avatar.position)
        nativeHero.rotation.y=avatar.rotation.y
        nativeHeroRig=nativeHumanoidRig(nativeHero)
        nativeWindLocs=[]
        nativeHero.traverse(object=>{if(/loc|braid|dread|hair/i.test(object.name)){object.userData={...object.userData,windBaseRotation:{x:object.rotation.x,y:object.rotation.y,z:object.rotation.z}};nativeWindLocs.push(object)}})
        announceStreetVerseCharacterReady({id:STREETVERSE_HERO_CHARACTER_ID,assetId:BJ_MESHY_V6_ASSET.id,era:'current',photoMatched:canClaimPhotoMatched(STREETVERSE_HERO_CHARACTER_ID),source:'streetverse-mobile-meshy-bj-v6'})
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-hero-visual-authority',{detail:{characterId:STREETVERSE_HERO_CHARACTER_ID,displayName:'BJ Stubbs',assetId:BJ_MESHY_V6_ASSET.id,referenceMatchedPreview:true,photoMatched:canClaimPhotoMatched(STREETVERSE_HERO_CHARACTER_ID),certifiedLikeness:canClaimPhotoMatched(STREETVERSE_HERO_CHARACTER_ID),authoritative3DMesh:true,meshyV6:true,proceduralFallbackSuppressed:true,morphTargetNames:handle.morphTargetNames}}))
      })
    }
    const activatePublishedBody=async(assetId:string,label:string)=>{
      if(assetId!=='sv-james-body-base-v1')return
      const handle=await loadStreetVersePublishedBodyBase('sv-james-body-base-v1','global')
      if(!handle){setMessage('JAMES YOUTH BODY BASE • waiting for the real published Meshy rig');return}
      if(nativeCancelled||!nativeLayer){handle.dispose();return}
      publishedHeroBody?.dispose()
      publishedHeroBody=handle
      bjMeshyHero?.dispose();bjMeshyHero=null
      bjPhotoMatch?.dispose();bjPhotoMatch=null;bjPhotoMatchReady=false
      bjHeadRuntime?.dispose();bjHeadRuntime=null
      if(nativeHeroFallback)nativeHeroFallback.visible=false
      nativeLayer.add(handle.object)
      nativeHero=handle.object
      nativeHero.position.copy(avatar.position)
      nativeHero.rotation.y=avatar.rotation.y
      nativeHeroRig=nativeHumanoidRig(nativeHero)
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-hero-visual-authority',{detail:{characterId:'james-stubbs',displayName:label||'JAMES',assetId:'sv-james-body-base-v1',authoritative3DMesh:true,identityNeutralBodyBase:true,finalFacialLikeness:false,proceduralFallbackSuppressed:true}}))
      setMessage('JAMES YOUTH BODY BASE LIVE • rigged Meshy body loaded • final face and exact height still need approved reference tuning')
    }
    const activateFamilyStandIn=async(assetId:string,label:string,characterId?:string)=>{
      const handle=await loadStreetVerseMeshyCharacter(assetId)
      if(!handle){setMessage((label||'FAMILY CHARACTER').toUpperCase()+' • waiting for published Meshy stand-in rig');return}
      if(nativeCancelled||!nativeLayer){handle.dispose();return}
      familyHeroHandle?.dispose();familyHeroHandle=handle
      publishedHeroBody?.dispose();publishedHeroBody=null
      bjMeshyHero?.dispose();bjMeshyHero=null
      bjPhotoMatch?.dispose();bjPhotoMatch=null;bjPhotoMatchReady=false
      bjHeadRuntime?.dispose();bjHeadRuntime=null
      if(nativeHeroFallback)nativeHeroFallback.visible=false
      nativeLayer.add(handle.object)
      nativeHero=handle.object
      nativeHero.position.copy(avatar.position)
      nativeHero.rotation.y=avatar.rotation.y
      nativeHeroRig=nativeHumanoidRig(nativeHero)
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-hero-visual-authority',{detail:{characterId:characterId||null,displayName:label||'FAMILY CHARACTER',assetId,authoritative3DMesh:true,genericStandIn:true,realPersonLikeness:false,finalLikeness:false,proceduralFallbackSuppressed:true}}))
      setMessage((label||'FAMILY CHARACTER').toUpperCase()+' • generic rig live • likeness reference still separate')
    }
    onPlayerAssetSelect=(event:Event)=>{
      const d=(event as CustomEvent<{assetId?:string;label?:string;characterId?:string}>).detail||{}
      const assetId=String(d.assetId||'')
      if(assetId==='sv-james-body-base-v1'){void activatePublishedBody(assetId,String(d.label||'JAMES'));return}
      if(assetId&&assetId!=='sv-bj-stubbs-v6')void activateFamilyStandIn(assetId,String(d.label||'FAMILY CHARACTER'),String(d.characterId||''))
    }
    addEventListener('tryamm:streetverse-player-asset-select',onPlayerAssetSelect)
    const savedPlayable=(()=>{try{return JSON.parse(localStorage.getItem('tryamm.streetverse.playable-character.v1')||'{}')?.character}catch{return null}})()
    if(savedPlayable?.assetId==='sv-james-body-base-v1')void activatePublishedBody(savedPlayable.assetId,String(savedPlayable.label||'JAMES'))
    else if(savedPlayable?.assetId&&savedPlayable.assetId!=='sv-bj-stubbs-v6')void activateFamilyStandIn(String(savedPlayable.assetId),String(savedPlayable.label||'GLOBAL CHARACTER'),String(savedPlayable.id||''))
    nativeResidentRigs=nativeResidents.map(nativeHumanoidRig)
    const circleParkMeshySlots=['sv-black-man-youngadult-01','sv-black-woman-youngadult-01','sv-black-man-adult-01','sv-black-woman-adult-01'] as const
    circleParkMeshySlots.forEach((slotId,i)=>{
      void loadStreetVerseMeshyCharacter(slotId).then(handle=>{
        if(!handle)return
        if(nativeCancelled||!nativeLayer){handle.dispose();return}
        meshyResidentHandles[i]?.dispose()
        const fallback=nativeResidents[i]
        if(fallback)fallback.visible=false
        handle.object.name=`mobile-meshy-resident-${i+1}`
        nativeLayer.add(handle.object)
        nativeResidents[i]=handle.object
        nativeResidentRigs[i]=nativeHumanoidRig(handle.object)
        meshyResidentHandles[i]=handle
        window.dispatchEvent(new CustomEvent('tryamm:circle-park-meshy-resident-live',{detail:{slotId,index:i,filename:handle.slot.filename,sourceUrl:handle.sourceUrl,animated:Boolean(handle.mixer)}}))
      })
    })
    nativeTrafficCars=Array.from({length:14},(_,i)=>result.group.getObjectByName(`mobile-native-traffic-car-${i+1}`)).filter((item):item is THREE.Object3D=>Boolean(item))
    nativeBuildings=Array.from({length:NATIVE_CITY_BLOCKS.length},(_,i)=>result.group.getObjectByName(nativeBuildingLabel(i))).filter((item):item is THREE.Object3D=>Boolean(item))
    nativeBuildings.forEach((_,i)=>primitiveBuildingVisuals[i]?.forEach(part=>{part.visible=false}))
    if(activeCircleParkEra!=='present')nativeBuildings.forEach(building=>{building.visible=false})
    nativeDriverDoorPivot=nativeRepairCar?.getObjectByName('driver-door-pivot')||null
    nativePassengerDoorPivot=nativeRepairCar?.getObjectByName('passenger-door-pivot')||null
    nativeHoodPivot=nativeRepairCar?.getObjectByName('hood-pivot')||null
    scene.add(nativeLayer)
    const nativeCoverage={
      hero:Boolean(nativeHero),
      residents:nativeResidents.length,
      trafficCars:nativeTrafficCars.length,
      train:Boolean(nativeTrain),
      starterCar:Boolean(nativeStarterCar),
      repairCar:Boolean(nativeRepairCar),
      buildings:nativeBuildings.length,
    }
    advanceLiveWorldBuild('geography',result.loaded>0)
    advanceLiveWorldBuild('spawn',nativeCoverage.hero&&nativeCoverage.repairCar)
    advanceLiveWorldBuild('traffic',nativeCoverage.trafficCars>=14&&nativeCoverage.train)
    advanceLiveWorldBuild('accessibility',true)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-native-mobile-ready',{detail:{loaded:result.loaded,failed:result.failed.length,previewVisualOnly:true,assetAuthority:'generated-glb-visuals-over-primitive-control-roots',worldBuilderActive:Boolean(worldBuild),assetGenerator:'tryamm-native-asset-foundry',quantumSpeedEngine:true,...nativeCoverage}}))
  }).catch(error=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-native-mobile-error',{detail:{message:String((error as Error)?.message||error)}})))
  let weatherDriveMultiplier=1
  const applyWeather=(state:StreetVerseWeatherState)=>{weatherRenderer.apply(state);weatherDriveMultiplier=weatherRenderer.getVisual().trafficSpeedMultiplier;setWeatherStatus('WEATHER • '+weatherBadge(state))}
  const onWeather=(event:Event)=>applyWeather((event as CustomEvent<StreetVerseWeatherState>).detail)
  addEventListener('tryamm:streetverse-weather-state',onWeather)
  try{const cached=JSON.parse(localStorage.getItem('tryamm.streetverse.weather.v1')||'null') as StreetVerseWeatherState|null;if(cached)applyWeather(cached)}catch{}
  const mat=(c:number)=>new THREE.MeshLambertMaterial({color:c})
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(190,190),mat(0x3f5c43));ground.name='streetverse-ground';ground.rotation.x=-Math.PI/2;scene.add(ground)
  const roadMat=mat(0x20242c),walkMat=mat(0x73787d),laneMat=new THREE.MeshBasicMaterial({color:0xe9d66b}),crosswalkMat=new THREE.MeshBasicMaterial({color:0xe9ecef})
  for(const v of [-48,0,48]){
   const r1=new THREE.Mesh(new THREE.BoxGeometry(190,.08,14),roadMat);r1.position.set(0,.04,v);scene.add(r1)
   const r2=new THREE.Mesh(new THREE.BoxGeometry(14,.08,190),roadMat);r2.position.set(v,.04,0);scene.add(r2)
   for(const d of [-9,9]){const w1=new THREE.Mesh(new THREE.BoxGeometry(190,.12,3),walkMat);w1.position.set(0,.08,v+d);scene.add(w1);const w2=new THREE.Mesh(new THREE.BoxGeometry(3,.12,190),walkMat);w2.position.set(v+d,.08,0);scene.add(w2)}
  }
  const laneGeometry=new THREE.BoxGeometry(6,.025,.13),laneMarks=new THREE.InstancedMesh(laneGeometry,laneMat,72),markMatrix=new THREE.Object3D();let laneIndex=0
  for(const v of [-48,0,48])for(let p=-82;p<=72;p+=14){markMatrix.position.set(p,.095,v);markMatrix.rotation.y=0;markMatrix.updateMatrix();laneMarks.setMatrixAt(laneIndex++,markMatrix.matrix);markMatrix.position.set(v,.095,p);markMatrix.rotation.y=Math.PI/2;markMatrix.updateMatrix();laneMarks.setMatrixAt(laneIndex++,markMatrix.matrix)}laneMarks.instanceMatrix.needsUpdate=true;scene.add(laneMarks)
  const crosswalkGeometry=new THREE.BoxGeometry(.72,.028,4.8),crosswalks=new THREE.InstancedMesh(crosswalkGeometry,crosswalkMat,108);let crossIndex=0
  for(const x of [-48,0,48])for(const z of [-48,0,48])for(const offset of [-5,-3,-1,1,3,5]){markMatrix.position.set(x+offset,.105,z+7.2);markMatrix.rotation.y=0;markMatrix.updateMatrix();crosswalks.setMatrixAt(crossIndex++,markMatrix.matrix);markMatrix.position.set(x+7.2,.105,z+offset);markMatrix.rotation.y=Math.PI/2;markMatrix.updateMatrix();crosswalks.setMatrixAt(crossIndex++,markMatrix.matrix)}crosswalks.instanceMatrix.needsUpdate=true;scene.add(crosswalks)
  const corridorMat=new THREE.MeshLambertMaterial({color:0x2a3038})
  CHICAGO_ROAD_CORRIDORS.forEach(corridor=>{const mesh=new THREE.Mesh(corridor.axis==='x'?new THREE.BoxGeometry(190,.1,corridor.width):new THREE.BoxGeometry(corridor.width,.1,190),corridorMat);mesh.position.set(corridor.axis==='z'?corridor.at:0,.11,corridor.axis==='x'?corridor.at:0);scene.add(mesh)})
  const makeLabel=(text:string)=>{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d')!;ctx.fillStyle='rgba(4,15,24,.86)';ctx.fillRect(0,0,512,96);ctx.strokeStyle='#75e8ff';ctx.lineWidth=3;ctx.strokeRect(3,3,506,90);ctx.fillStyle='#fff';ctx.font='900 31px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,48);const texture=new THREE.CanvasTexture(canvas);const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:true,depthWrite:false,opacity:.90});const sprite=new THREE.Sprite(material);const width=THREE.MathUtils.clamp(4.8+text.length*.12,5.4,7.4);sprite.scale.set(width,1.18,1);sprite.userData={disposeTexture:texture,mobileWorldLabel:true,nearFadeDistance:10};return sprite}
  const placeLabels:THREE.Sprite[]=[]
  CHICAGO_STREETVERSE_PLACES.forEach(place=>{const label=makeLabel(place.label.toUpperCase());label.position.set(place.x,4.2,place.z);scene.add(label);placeLabels.push(label)})
  const pilsenArt=new THREE.Group();pilsenArt.position.set(-57,0,-50);const muralColors=[0xff5b79,0x4cc9f0,0xffc857,0x7ae582,0xc77dff,0xff8c42];for(let i=0;i<6;i++){const panel=new THREE.Mesh(new THREE.BoxGeometry(4.4,4.8,.25),new THREE.MeshLambertMaterial({color:muralColors[i]}));panel.position.set(i*4.5,2.4,0);pilsenArt.add(panel);const accent=new THREE.Mesh(new THREE.BoxGeometry(2.6,.45,.28),new THREE.MeshBasicMaterial({color:muralColors[(i+2)%muralColors.length]}));accent.position.set(i*4.5,2.5+(i%3-1)*.8,-.15);accent.rotation.z=(i%2?.24:-.24);pilsenArt.add(accent)}scene.add(pilsenArt)
  const circleParkReality=new THREE.Group();circleParkReality.name='streetverse-circle-park-reality-layer-v2'
  const brick=new THREE.MeshLambertMaterial({color:0x8a4e39}),brickDark=new THREE.MeshLambertMaterial({color:0x663a2d}),stone=new THREE.MeshLambertMaterial({color:0xc2b7a2}),glass=new THREE.MeshStandardMaterial({color:0x9fc6d6,roughness:.2,metalness:.05}),courtMat=new THREE.MeshLambertMaterial({color:0x365a45}),playMat=new THREE.MeshLambertMaterial({color:0x8b3d35})
  const circleConcrete=new THREE.MeshStandardMaterial({color:0x918e86,roughness:.88,metalness:0}),circleConcreteDark=new THREE.MeshStandardMaterial({color:0x6f6c66,roughness:.9,metalness:0}),circleAsphalt=new THREE.MeshStandardMaterial({color:0x25282c,roughness:.96,metalness:0}),circleCurb=new THREE.MeshLambertMaterial({color:0xb9b6ae}),circleMetal=new THREE.MeshStandardMaterial({color:0x20262c,roughness:.55,metalness:.46}),circleShrub=new THREE.MeshLambertMaterial({color:0x35633b}),circleMulch=new THREE.MeshLambertMaterial({color:0x4b3528})
  const addCircleBox=(name:string,size:[number,number,number],pos:[number,number,number],material:THREE.Material)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.name=name;mesh.position.set(...pos);circleParkReality.add(mesh);return mesh}
  // Original TRYAMM reconstruction based on the public Circle Park address, 8-level massing,
  // apartment/townhome mix, playground, picnic/landscaping and basketball amenities.
  const mainSlab=addCircleBox('circle-park-main-apartment-slab',[20,24,10],[-38,12,44],circleConcrete)
  const mainWing=addCircleBox('circle-park-main-apartment-wing',[10,18,18],[-47,9,46],circleConcreteDark)
  const seniorWing=addCircleBox('circle-park-senior-wing',[10,14,11],[-31,7,49],circleConcreteDark)
  seniorWing.userData={streetVersePlacement:'roosevelt-side-entry',exactSurveyed:false,verifiedUse:'senior-disabled-housing',source:'public-reference+user-directed-layout'}
  const seniorCommonsGlass=addCircleBox('circle-park-senior-commons-glass',[6.8,3.1,.18],[-31,1.75,43.42],new THREE.MeshStandardMaterial({color:0x4d7687,roughness:.16,metalness:.05,transparent:true,opacity:.84}))
  const seniorCommonsCanopy=addCircleBox('circle-park-senior-commons-canopy',[7.8,.30,2.8],[-31,3.65,42.75],circleConcrete)
  const seniorCommonsWalk=addCircleBox('circle-park-senior-commons-walk',[6,.16,10],[-31,.18,37.8],circleCurb);seniorCommonsWalk.rotation.x=-.025
  for(const x of [-34,-28]){addCircleBox('circle-park-senior-bench-seat',[2.2,.2,.7],[x,.72,38.8],circleMetal);addCircleBox('circle-park-senior-bench-back',[2.2,.85,.14],[x,1.22,39.12],circleMetal)}
  for(const x of [-35,-27]){addCircleBox('circle-park-senior-garden-bed',[2.6,.42,1.5],[x,.26,35.5],circleMulch);const shrub=new THREE.Mesh(new THREE.DodecahedronGeometry(.58,1),circleShrub);shrub.position.set(x,.82,35.5);circleParkReality.add(shrub)}
  const seniorCommonsLabel=makeLabel('SENIOR COMMONS');seniorCommonsLabel.position.set(-31,4.8,42.35);seniorCommonsLabel.scale.set(6.8,1.25,1);circleParkReality.add(seniorCommonsLabel)
  void seniorCommonsGlass;void seniorCommonsCanopy
  for(const facade of [mainSlab,mainWing,seniorWing]){
    for(let y=3;y<=facade.scale.y*0+18;y+=3){void y}
  }
  for(let floor=0;floor<7;floor++)for(let bay=0;bay<5;bay++){
    const w=addCircleBox('circle-park-window',[2.2,.55,.12],[-45+bay*3.2,3+floor*2.9,49.08],glass);w.renderOrder=1
  }
  // 1111 S Ashland reference language: horizontal glazing, ribbed concrete, recessed lobby and landscaped entry.
  for(let floor=0;floor<7;floor++){
    const band=addCircleBox('circle-park-horizontal-window-band',[17.6,1.22,.16],[-38,2.7+floor*2.95,49.16],glass);band.renderOrder=2
    const sill=addCircleBox('circle-park-facade-sill',[18.3,.20,.28],[-38,1.98+floor*2.95,49.12],circleConcreteDark);void sill
  }
  for(const x of [-46.7,-42.4,-38,-33.6,-29.3])addCircleBox('circle-park-ribbed-concrete-fin',[.34,22,.42],[x,11.2,49.22],circleConcreteDark)
  const lobbyGlass=addCircleBox('circle-park-1111-lobby-glass',[8.8,3.2,.18],[-38,1.85,49.28],new THREE.MeshStandardMaterial({color:0x31505e,roughness:.14,metalness:.08,transparent:true,opacity:.84}))
  const canopy=addCircleBox('circle-park-1111-entry-canopy',[9.8,.36,3.0],[-38,3.75,50.2],circleConcreteDark)
  for(const x of [-42.1,-33.9])addCircleBox('circle-park-entry-column',[.42,3.5,.42],[x,1.75,50.1],circleConcrete)
  const addressLabel=makeLabel('1111 • CIRCLE PARK');addressLabel.position.set(-38,5.05,50.55);addressLabel.scale.set(6.4,1.15,1);circleParkReality.add(addressLabel);const mobileWorldLabels=[...placeLabels,seniorCommonsLabel,addressLabel]
  const entryDrive=addCircleBox('circle-park-entry-drive',[25,.12,12],[-38,.12,34],circleAsphalt)
  const entryWalk=addCircleBox('circle-park-entry-sidewalk',[25,.16,3.0],[-38,.18,40.8],circleCurb)
  const [guardX,,guardZ]=CIRCLE_PARK_RESIDENT_ENTRANCE.anchors.guardGate.position
  const [sideGateX,,sideGateZ]=CIRCLE_PARK_RESIDENT_ENTRANCE.anchors.residentSideGate.position
  const [hillX,hillY,hillZ]=CIRCLE_PARK_RESIDENT_ENTRANCE.anchors.hill.position
  const securityBooth=addCircleBox('circle-park-security-booth',[4.8,3.1,3.8],[guardX-4,1.55,guardZ-1.5],circleConcreteDark)
  const securityWindow=addCircleBox('circle-park-security-booth-window',[2.8,1.35,.12],[guardX-4,1.85,guardZ+.45],glass);securityWindow.renderOrder=2
  const mainGateLeft=addCircleBox('circle-park-main-gate-left',[6.6,2.1,.16],[guardX-4.1,1.05,guardZ+2.2],circleMetal)
  const mainGateRight=addCircleBox('circle-park-main-gate-right',[6.6,2.1,.16],[guardX+4.1,1.05,guardZ+2.2],circleMetal)
  const sideGate=addCircleBox('circle-park-resident-side-gate',[3.2,2.1,.16],[sideGateX,1.05,sideGateZ],circleMetal)
  sideGate.userData={residentKey:true,gameplayGate:true,exactRealWorldSecurity:false}
  const gateLabel=makeLabel('SECURITY • SIGN IN / RESIDENT KEY');gateLabel.position.set(guardX,4.7,guardZ+1.4);gateLabel.scale.set(11.5,1.65,1);circleParkReality.add(gateLabel);mobileWorldLabels.push(gateLabel)
  const hillMat=new THREE.MeshLambertMaterial({color:0x58784a})
  const grillHill=new THREE.Mesh(new THREE.SphereGeometry(8.8,20,12,0,Math.PI*2,0,Math.PI*.52),hillMat);grillHill.name='circle-park-grill-hill';grillHill.position.set(hillX,hillY-2.8,hillZ);grillHill.scale.set(1.35,.62,1.15);circleParkReality.add(grillHill)
  void securityBooth;void mainGateLeft;void mainGateRight
  for(let stall=0;stall<7;stall++)addCircleBox('circle-park-parking-stripe',[.12,.035,4.5],[-47+stall*3.0,.205,33.4],stone)
  for(const [x,z,w,d] of [[-52,40,3,18],[-24,40,3,18],[-38,53,29,2.2]] as [number,number,number,number][])addCircleBox('circle-park-sidewalk',[w,.15,d],[x,.18,z],circleCurb)
  for(const [x,z] of [[-49,42],[-46,42],[-30,42],[-27,42],[-45,53],[-40,53],[-35,53],[-30,53]] as [number,number][]){
    const bed=addCircleBox('circle-park-landscape-bed',[2.3,.18,1.7],[x,.20,z],circleMulch);void bed
    const shrub=new THREE.Mesh(new THREE.DodecahedronGeometry(.72,1),circleShrub);shrub.name='circle-park-shrub';shrub.position.set(x,.78,z);shrub.scale.set(1.2,.72,1);circleParkReality.add(shrub)
  }
  const townhomeRows:[number,number,number][]=[[-17,46,0],[-9,46,0],[-1,46,0],[-17,37,Math.PI],[-9,37,Math.PI],[-1,37,Math.PI]]
  townhomeRows.forEach(([x,z,rot],i)=>{const home=new THREE.Group();home.name='circle-park-townhome-'+(i+1);const body=new THREE.Mesh(new THREE.BoxGeometry(6.2,5.8,7.4),i%2?brick:brickDark);body.position.y=2.9;home.add(body);const roof=new THREE.Mesh(new THREE.BoxGeometry(6.5,.45,7.7),stone);roof.position.y=6;home.add(roof);const porch=new THREE.Mesh(new THREE.BoxGeometry(3.8,.3,1.6),stone);porch.position.set(0,.18,4.2);home.add(porch);for(const side of [-1,1]){const win=new THREE.Mesh(new THREE.BoxGeometry(1.25,1.25,.12),glass);win.position.set(side*1.7,3.2,3.76);home.add(win)}home.position.set(x,0,z);home.rotation.y=rot;circleParkReality.add(home)})
  const courtyard=addCircleBox('circle-park-courtyard',[24,.18,17],[-20,.13,58],new THREE.MeshLambertMaterial({color:0x607b4a}))
  const court=addCircleBox('circle-park-basketball-court',[15,.12,8],[-48,.17,61],courtMat)
  for(const z of [57.2,64.8]){const pole=addCircleBox('circle-park-hoop-pole',[.18,3.1,.18],[-48,1.55,z],stone);const back=addCircleBox('circle-park-backboard',[2.1,1.25,.12],[-48,3,z+(z<61?1:-1)*.3],stone);void pole;void back}
  const playground=addCircleBox('circle-park-playground-pad',[8,.16,7],[-15,.18,61],playMat)
  const playTower=addCircleBox('circle-park-play-tower',[2.2,2.6,2.2],[-15,1.45,61],new THREE.MeshLambertMaterial({color:0xe8b844}))
  const slide=new THREE.Mesh(new THREE.BoxGeometry(1.1,.18,4.8),new THREE.MeshLambertMaterial({color:0x4f9bd7}));slide.name='circle-park-slide';slide.position.set(-12.8,1,61);slide.rotation.z=-.36;circleParkReality.add(slide)
  const picnicMat=new THREE.MeshLambertMaterial({color:0x6d5138})
  for(const [x,z] of [[-26,62],[-22,64],[-18,55],[-28,55]] as [number,number][]){const table=addCircleBox('circle-park-picnic-table',[2.3,.18,1.2],[x,.85,z],picnicMat);const legA=addCircleBox('circle-park-picnic-leg',[.18,1.2,.18],[x-.65,.45,z],picnicMat);const legB=addCircleBox('circle-park-picnic-leg',[.18,1.2,.18],[x+.65,.45,z],picnicMat);void table;void legA;void legB}
  const poolDeckMat=new THREE.MeshLambertMaterial({color:0xb8b7ad}),poolWaterMat=new THREE.MeshStandardMaterial({color:0x2e9fd0,roughness:.16,metalness:.05,transparent:true,opacity:.78}),tennisMat=new THREE.MeshLambertMaterial({color:0x477b58}),tennisLineMat=new THREE.MeshBasicMaterial({color:0xf4f1da}),grillMat=new THREE.MeshStandardMaterial({color:0x25272a,metalness:.55,roughness:.5})
  addCircleBox('circle-park-pool-deck',[17,.16,11],[5,.17,63],poolDeckMat)
  const poolHouse=addCircleBox('circle-park-indoor-pool-house',[18,4.8,10],[5,2.4,63],new THREE.MeshStandardMaterial({color:0xb7c0c2,roughness:.72,metalness:0,transparent:true,opacity:.42}))
  const poolGlassSouth=addCircleBox('circle-park-indoor-pool-glass',[14,2.9,.15],[5,2.2,68.05],new THREE.MeshStandardMaterial({color:0x83bdd3,roughness:.18,transparent:true,opacity:.48}))
  const poolDeckOutside=addCircleBox('circle-park-pool-outdoor-deck',[8,.18,10],[17,.18,63],poolDeckMat)
  poolHouse.userData={userDirectedLayout:true,indoorPool:true,outdoorDeck:true,notSurveyed:true}
  void poolGlassSouth;void poolDeckOutside
  const circleParkPool=addCircleBox('circle-park-swimming-pool',[14,.12,8],[5,.24,63],poolWaterMat);circleParkPool.userData={userDirectedLayout:true,indoorPool:true,outdoorDeck:true,notSurveyed:true}
  for(const x of [-1,11])for(const z of [59.7,66.3])addCircleBox('circle-park-pool-fence-post',[.1,1.5,.1],[x,.75,z],circleMetal)
  const tennisCourt=addCircleBox('circle-park-tennis-court',[18,.12,9],[22,.17,61],tennisMat);tennisCourt.userData={streetVerseAddition:true,notVerifiedRealWorldAmenity:true}
  addCircleBox('circle-park-tennis-net',[.12,1.05,8.2],[22,.7,61],new THREE.MeshLambertMaterial({color:0xdadada}))
  for(const x of [13.3,22,30.7])addCircleBox('circle-park-tennis-line',[.08,.025,8.2],[x,.245,61],tennisLineMat)
  for(const z of [57.1,64.9])addCircleBox('circle-park-tennis-baseline',[17.2,.025,.08],[22,.245,z],tennisLineMat)
  const basketballBall=new THREE.Mesh(new THREE.SphereGeometry(.32,10,8),new THREE.MeshLambertMaterial({color:0xd86b28}));basketballBall.name='circle-park-basketball-ball';basketballBall.position.set(-48,.5,61);circleParkReality.add(basketballBall)
  const tennisBall=new THREE.Mesh(new THREE.SphereGeometry(.16,8,6),new THREE.MeshBasicMaterial({color:0xd8ff55}));tennisBall.name='circle-park-tennis-ball';tennisBall.position.set(18,.45,61);circleParkReality.add(tennisBall)
  const grillSmoke:THREE.Mesh[]=[]
  for(const [x,z] of [[-25,69],[-19,69]] as [number,number][]){
    const grillBase=new THREE.Mesh(new THREE.CylinderGeometry(.55,.48,.82,10),grillMat);grillBase.name='circle-park-grill';grillBase.position.set(x,.62,z);circleParkReality.add(grillBase)
    const grillTop=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,.18,12),grillMat);grillTop.position.set(x,1.05,z);circleParkReality.add(grillTop)
    for(let i=0;i<3;i++){const puff=new THREE.Mesh(new THREE.SphereGeometry(.18+i*.05,6,5),new THREE.MeshBasicMaterial({color:0xc9c9c9,transparent:true,opacity:0}));puff.name='circle-park-grill-smoke';puff.position.set(x,1.4+i*.35,z);puff.userData={baseX:x,baseZ:z};circleParkReality.add(puff);grillSmoke.push(puff)}
  }
  const securityPatrols:THREE.Group[]=[]
  for(let i=0;i<2;i++){
    const patrol=new THREE.Group();patrol.name='circle-park-security-patrol-'+(i+1)
    const patrolBody=new THREE.Mesh(new THREE.CapsuleGeometry(.30,1.02,3,8),new THREE.MeshLambertMaterial({color:0x202936}));patrolBody.position.y=1.18;patrol.add(patrolBody)
    const patrolHead=new THREE.Mesh(new THREE.SphereGeometry(.24,9,7),new THREE.MeshLambertMaterial({color:0x70462f}));patrolHead.position.y=2.17;patrol.add(patrolHead)
    const patrolVest=new THREE.Mesh(new THREE.BoxGeometry(.66,.78,.12),new THREE.MeshLambertMaterial({color:0x3b4c5f}));patrolVest.position.set(0,1.45,.30);patrol.add(patrolVest)
    normalizeStreetVerseHumanHeight(patrol,i===0?1.82:1.74)
    patrol.userData={role:'community-security',doctrine:'keep-the-peace',patrolIndex:i,realWorldAuthority:false}
    patrol.position.set(i===0?-42:-26,0,i===0?44:58)
    circleParkReality.add(patrol);securityPatrols.push(patrol)
  }
  const heritageSign=makeLabel('CIRCLE PARK • ABLA • ASHLAND / LAFLIN');heritageSign.position.set(-25,7.5,52);heritageSign.scale.set(18,3.1,1);circleParkReality.add(heritageSign)
  const driveSign=makeLabel('CIRCLE PARK DRIVE • S. LAFLIN');driveSign.position.set(-24,5.7,20);driveSign.scale.set(15,2.7,1);circleParkReality.add(driveSign)
  const historySign=makeLabel('JANE ADDAMS / ABLA HISTORY');historySign.position.set(24,5.5,42);historySign.scale.set(15,2.7,1);circleParkReality.add(historySign)
  // Original heritage marker inspired by the neighborhood's public-art history; not a reproduction of Edgar Miller's Animal Court.
  const heritageMarker=new THREE.Group();heritageMarker.name='abla-animal-court-heritage-marker-original'
  const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.6,.65,12),stone);pedestal.position.y=.33;heritageMarker.add(pedestal)
  const heritageBody=new THREE.Mesh(new THREE.IcosahedronGeometry(1.5,1),circleConcrete);heritageBody.position.y=1.75;heritageBody.scale.set(1.35,.85,1);heritageMarker.add(heritageBody)
  for(const side of [-1,1]){const form=new THREE.Mesh(new THREE.ConeGeometry(.52,1.2,10),circleConcreteDark);form.position.set(side*1.25,2.5,0);form.rotation.z=side*.48;heritageMarker.add(form)}
  heritageMarker.position.set(24,0,45);heritageMarker.userData={originalTryammInterpretation:true,historicalReference:'Jane Addams public-art heritage',notAReplica:true};circleParkReality.add(heritageMarker)
  const fencePostGeometry=new THREE.BoxGeometry(.10,2.1,.10),fencePostMaterial=circleMetal
  for(let i=0;i<12;i++){const post=new THREE.Mesh(fencePostGeometry,fencePostMaterial);post.name='circle-park-court-fence-post';post.position.set(-55+i*1.28,1.05,56.5);circleParkReality.add(post)}
  for(const y of [.55,1.6])addCircleBox('circle-park-court-fence-rail',[14.2,.08,.08],[-48, y,56.5],circleMetal)
  for(const [x,z] of [[-31,57],[-24,57],[-31,63],[-24,63]] as [number,number][]){const bench=addCircleBox('circle-park-bench-seat',[2.7,.20,.72],[x,.72,z],circleMetal);const back=addCircleBox('circle-park-bench-back',[2.7,.82,.14],[x,1.25,z-.32],circleMetal);void bench;void back}
  circleParkReality.userData={source:'public-reference-reconstruction',version:'reality-max-v2',originalTryammGeometry:true,addressAnchor:'1111 S Ashland Ave',circleParkDriveHistoricalAnchor:true,architecturalReferences:['horizontal glazing','ribbed concrete','recessed entry','brick-and-stone townhomes'],amenities:['townhomes','playground','picnic','basketball','barbecue','swimming','tennis','courtyard','landscaping','parking','sidewalks'],heritage:['ABLA','Jane Addams public-housing history','original public-art marker']}
  scene.add(circleParkReality)
  const circleParkTimeLayers=new THREE.Group();circleParkTimeLayers.name='circle-park-time-machine-world-layers'
  const historyBrick=new THREE.MeshLambertMaterial({color:0x7d4a38}),historyTan=new THREE.MeshLambertMaterial({color:0xa58a69}),historyConcrete=new THREE.MeshLambertMaterial({color:0x77736b}),historyWeathered=new THREE.MeshLambertMaterial({color:0x595b5c}),historyGrass=new THREE.MeshLambertMaterial({color:0x526f43})
  const makeHistoryBox=(group:THREE.Group,name:string,size:[number,number,number],pos:[number,number,number],material:THREE.Material)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.name=name;mesh.position.set(...pos);group.add(mesh);return mesh}
  const era1938=new THREE.Group();era1938.name='circle-park-era-1938-jane-addams';era1938.visible=false
  for(const [x,z,rot] of [[-48,43,0],[-38,43,0],[-28,43,0],[-18,43,0],[-48,57,Math.PI],[-38,57,Math.PI],[-28,57,Math.PI],[-18,57,Math.PI]] as [number,number,number][]){const row=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(7.8,4.8,9.5),historyBrick);body.position.y=2.4;row.add(body);const roof=new THREE.Mesh(new THREE.BoxGeometry(8.2,.36,9.9),historyTan);roof.position.y=4.95;row.add(roof);row.position.set(x,0,z);row.rotation.y=rot;era1938.add(row)}
  makeHistoryBox(era1938,'1938-shared-green',[38,.12,10],[-33,.1,50],historyGrass)
  const label1938=makeLabel('1938 • JANE ADDAMS HOUSES • RECONSTRUCTION');label1938.position.set(-34,7,36);label1938.scale.set(20,3.2,1);era1938.add(label1938)
  era1938.userData={era:'1938',evidence:'documented-history+reconstruction',note:'Original TRYAMM massing informed by documented Jane Addams Houses history; not an exact digital twin.'}

  const era1955=new THREE.Group();era1955.name='circle-park-era-1955-grace-abbott';era1955.visible=false
  for(const [x,z,h] of [[-48,44,30],[-28,44,34],[-48,63,32],[-28,63,36]] as [number,number,number][]){makeHistoryBox(era1955,'1955-high-rise',[9,h,13],[x,h/2,z],historyConcrete);for(let floor=0;floor<Math.floor(h/3.2);floor++)makeHistoryBox(era1955,'1955-window-band',[7.6,.45,.10],[x,2.1+floor*3.2,z+6.56],glass)}
  makeHistoryBox(era1955,'1955-superblock-green',[34,.12,12],[-38,.1,54],historyGrass)
  const label1955=makeLabel('1955 • GRACE ABBOTT HOMES • RECONSTRUCTION');label1955.position.set(-38,8,34);label1955.scale.set(20,3.2,1);era1955.add(label1955)
  era1955.userData={era:'1955',evidence:'documented-history+reconstruction',note:'Original TRYAMM high-rise transition scene; not copied plans or third-party models.'}

  const era1996=new THREE.Group();era1996.name='circle-park-era-1996-abla';era1996.visible=false
  for(const [x,z,h] of [[-48,44,30],[-28,44,34],[-48,63,32],[-28,63,36]] as [number,number,number][]){const tower=makeHistoryBox(era1996,'1996-abla-high-rise',[9,h,13],[x,h/2,z],historyWeathered);tower.rotation.y=((x+z)%2)*.02;for(let floor=0;floor<Math.floor(h/3.2);floor++)makeHistoryBox(era1996,'1996-window-band',[7.5,.38,.10],[x,2.1+floor*3.2,z+6.56],new THREE.MeshLambertMaterial({color:floor%3===0?0x403f3a:0x6c7778}))}
  makeHistoryBox(era1996,'1996-basketball-court',[16,.12,9],[-12,.12,58],courtMat)
  const label1996=makeLabel('1996 • ABLA COMMUNITY ARCHIVE • RECONSTRUCTION');label1996.position.set(-30,8,34);label1996.scale.set(21,3.2,1);era1996.add(label1996)
  era1996.userData={era:'1996',evidence:'primary-source-reference+reconstruction',note:'Original TRYAMM scene informed by documented ABLA photography; source photos are not embedded.'}

  circleParkTimeLayers.add(era1938,era1955,era1996);scene.add(circleParkTimeLayers)
  let activeCircleParkEra='present'
  const applyCircleParkEra=(era:string)=>{
    activeCircleParkEra=['1938','1955','1996'].includes(era)?era:'present'
    circleParkReality.visible=activeCircleParkEra==='present'
    era1938.visible=activeCircleParkEra==='1938';era1955.visible=activeCircleParkEra==='1955';era1996.visible=activeCircleParkEra==='1996'
    nativeBuildings.forEach(building=>{building.visible=activeCircleParkEra==='present'})
    window.dispatchEvent(new CustomEvent('tryamm:circle-park-era-applied',{detail:{era:activeCircleParkEra,source:'streetverse-mobile-world',reconstruction:activeCircleParkEra!=='present'}}))
    window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:activeCircleParkEra==='present'?'Circle Park returned to present day.':`Circle Park historical reconstruction: ${activeCircleParkEra}.`}}))
  }
  const onCircleParkTimeEra=(event:Event)=>applyCircleParkEra(String((event as CustomEvent<{era?:string}>).detail?.era||'present'))
  addEventListener('tryamm:circle-park-time-era',onCircleParkTimeEra)
  try{const saved=JSON.parse(localStorage.getItem('tryamm.streetverse.chicago-time-machine.v1')||'{}');applyCircleParkEra(String(saved.worldEra||'present'))}catch{applyCircleParkEra('present')}
  const colors=[0x24425b,0x41345a,0x31513f,0x5c4032,0x31566b,0x56354e]
  const blocks=NATIVE_CITY_BLOCKS
  const windowWarm=new THREE.MeshBasicMaterial({color:0xffd58a}),windowCool=new THREE.MeshBasicMaterial({color:0x7fd9ff})
  const buildingColliders:{minX:number,maxX:number,minZ:number,maxZ:number}[]=[]
  blocks.forEach(([x,z],i)=>{
   const h=10+(i*7)%22,w=15+(i%3)*2,d=15+((i+1)%3)*2
   buildingColliders.push({minX:x-w/2-.7,maxX:x+w/2+.7,minZ:z-d/2-.7,maxZ:z+d/2+.7})
   const visualParts:THREE.Object3D[]=[]
   const addPrimitiveBuildingPart=(part:THREE.Object3D)=>{scene.add(part);visualParts.push(part)}
   const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(colors[i%colors.length]));b.position.set(x,h/2,z);addPrimitiveBuildingPart(b)
   const roof=new THREE.Mesh(new THREE.BoxGeometry(w*.72,.5,d*.72),mat(0x151c24));roof.position.set(x,h+.25,z);addPrimitiveBuildingPart(roof)
   const rooftop=new THREE.Mesh(new THREE.BoxGeometry(Math.max(2,w*.28),.85,Math.max(2,d*.25)),mat(0x2c343b));rooftop.position.set(x,h+.92,z);addPrimitiveBuildingPart(rooftop)
   const entrance=new THREE.Mesh(new THREE.BoxGeometry(Math.min(3.4,w*.28),2.5,.16),new THREE.MeshBasicMaterial({color:i%2?0x6bc9e8:0xffc16b}));entrance.position.set(x,1.35,z+d/2+.1);addPrimitiveBuildingPart(entrance)
   const lit=(i%3===0?windowWarm:windowCool)
   const levels=Math.max(1,Math.min(4,Math.floor(h/5)))
   for(let level=0;level<levels;level++){
    const y=3.2+level*4.8
    const front=new THREE.Mesh(new THREE.BoxGeometry(w*.62,.38,.08),lit);front.position.set(x,y,z+d/2+.05);addPrimitiveBuildingPart(front)
    const side=new THREE.Mesh(new THREE.BoxGeometry(.08,.38,d*.52),lit);side.position.set(x+w/2+.05,y,z);addPrimitiveBuildingPart(side)
   }
   primitiveBuildingVisuals.push(visualParts)
  })
  const skylineDefs:[number,number,number,number][]=[[-91,-84,12,44],[-91,-38,10,58],[-91,18,13,50],[-91,72,11,64],[91,-72,13,54],[91,-18,11,46],[91,38,12,62],[91,82,10,48]]
  skylineDefs.forEach(([x,z,w,h],i)=>{const tower=new THREE.Mesh(new THREE.BoxGeometry(w,h,w*.82),mat(i%2?0x26394c:0x314153));tower.position.set(x,h/2,z);scene.add(tower);const crown=new THREE.Mesh(new THREE.BoxGeometry(w*.58,.65,w*.52),new THREE.MeshBasicMaterial({color:i%2?0x63cfff:0xffcf7d}));crown.position.set(x,h+.35,z);scene.add(crown)})
  const streetTreePositions:[number,number][]=[[-57,-57],[-57,-39],[-57,-9],[-57,9],[-57,39],[-57,57],[-39,-57],[-9,-57],[9,-57],[39,-57],[57,-57],[57,-39],[57,-9],[57,9],[57,39],[57,57],[-39,57],[-9,57],[9,57],[39,57],[-39,-9],[-9,-39],[39,9],[9,39]]
  const treeTrunkGeometry=new THREE.CylinderGeometry(.15,.22,2.4,6),treeCrownGeometry=new THREE.DodecahedronGeometry(1.05,0)
  const streetTreeTrunks=new THREE.InstancedMesh(treeTrunkGeometry,mat(0x6a4a2e),streetTreePositions.length),streetTreeCrowns=new THREE.InstancedMesh(treeCrownGeometry,mat(0x2f6b42),streetTreePositions.length)
  const treeMatrix=new THREE.Object3D();streetTreePositions.forEach(([x,z],i)=>{const scale=.86+(i%5)*.055;treeMatrix.position.set(x,1.1,z);treeMatrix.rotation.y=(i%8)*.36;treeMatrix.scale.set(scale,scale,scale);treeMatrix.updateMatrix();streetTreeTrunks.setMatrixAt(i,treeMatrix.matrix);treeMatrix.position.set(x,3.15,z);treeMatrix.rotation.y=(i%7)*.41;treeMatrix.scale.set(scale*.92,scale*(.86+(i%3)*.08),scale*.92);treeMatrix.updateMatrix();streetTreeCrowns.setMatrixAt(i,treeMatrix.matrix)});streetTreeTrunks.instanceMatrix.needsUpdate=true;streetTreeCrowns.instanceMatrix.needsUpdate=true;streetTreeTrunks.name='streetverse-mobile-tree-trunks';streetTreeCrowns.name='streetverse-mobile-tree-crowns';scene.add(streetTreeTrunks,streetTreeCrowns);
  const windDebrisGeometry=new THREE.PlaneGeometry(.42,.22),windDebrisMaterial=new THREE.MeshBasicMaterial({color:0xd8c9a7,side:THREE.DoubleSide,transparent:true,opacity:.78})
  const windDebris:THREE.Mesh[]=[]
  for(let i=0;i<8;i++){const scrap=new THREE.Mesh(windDebrisGeometry,windDebrisMaterial);scrap.name='streetverse-wind-debris';scrap.position.set(-30+(i%4)*7,.10,-2+Math.floor(i/4)*7);scrap.rotation.x=-Math.PI/2;scrap.visible=false;scrap.userData={windSeed:i*.73};scene.add(scrap);windDebris.push(scrap)}
  const lampPositions:[number,number][]=[[-39,-57],[-9,-57],[9,-57],[39,-57],[-57,-39],[-57,-9],[-57,9],[-57,39],[57,-39],[57,-9],[57,9],[57,39],[-39,57],[-9,57],[9,57],[39,57]]
  const lampPoleGeometry=new THREE.CylinderGeometry(.07,.09,4.4,5),lampBulbGeometry=new THREE.SphereGeometry(.12,6,4)
  const lampPoles=new THREE.InstancedMesh(lampPoleGeometry,mat(0x2d333c),lampPositions.length),lampBulbs=new THREE.InstancedMesh(lampBulbGeometry,new THREE.MeshBasicMaterial({color:0xffdf9a}),lampPositions.length)
  const lampMatrix=new THREE.Object3D();lampPositions.forEach(([x,z],i)=>{lampMatrix.position.set(x,2.2,z);lampMatrix.scale.set(1,1,1);lampMatrix.updateMatrix();lampPoles.setMatrixAt(i,lampMatrix.matrix);lampMatrix.position.set(x,4.45,z);lampMatrix.updateMatrix();lampBulbs.setMatrixAt(i,lampMatrix.matrix)});lampPoles.instanceMatrix.needsUpdate=true;lampBulbs.instanceMatrix.needsUpdate=true;scene.add(lampPoles,lampBulbs)
  for(const i of [1,5,9,13]){const [x,z]=lampPositions[i];const glow=new THREE.PointLight(0xffd99a,1.7,15,2);glow.position.set(x,4.3,z);scene.add(glow)}
  const river=new THREE.Mesh(new THREE.PlaneGeometry(150,15),new THREE.MeshLambertMaterial({color:0x17658b}));river.rotation.x=-Math.PI/2;river.rotation.z=.08;river.position.set(0,.06,-18);scene.add(river)
  const riverShimmer=new THREE.Mesh(new THREE.PlaneGeometry(146,3.2),new THREE.MeshBasicMaterial({color:0x4ba9c8,transparent:true,opacity:.2}));riverShimmer.rotation.x=-Math.PI/2;riverShimmer.rotation.z=.08;riverShimmer.position.set(0,.075,-18);scene.add(riverShimmer)
  const riverWalkMat=mat(0x8a8177);for(const z of [-8.9,-27.1]){const walk=new THREE.Mesh(new THREE.BoxGeometry(154,.18,3.1),riverWalkMat);walk.position.set(0,.13,z);scene.add(walk);for(let x=-70;x<=70;x+=7){const post=new THREE.Mesh(new THREE.BoxGeometry(.08,1.05,.08),mat(0x5e6870));post.position.set(x,.7,z+(z< -18?1.45:-1.45));scene.add(post)}const railTop=new THREE.Mesh(new THREE.BoxGeometry(145,.08,.08),mat(0x5e6870));railTop.position.set(0,1.15,z+(z< -18?1.45:-1.45));scene.add(railTop)}
  const bridge=new THREE.Mesh(new THREE.BoxGeometry(12,.48,25),mat(0x5a6168));bridge.position.set(0,.42,-18);scene.add(bridge);for(const sx of [-5.55,5.55]){const sideRail=new THREE.Mesh(new THREE.BoxGeometry(.14,1.05,25),mat(0x323941));sideRail.position.set(sx,1.05,-18);scene.add(sideRail)}
  const rail=new THREE.Mesh(new THREE.BoxGeometry(176,.45,2.2),mat(0x4a4e55));rail.position.set(0,6,-35);scene.add(rail);for(let x=-78;x<=78;x+=13){const p=new THREE.Mesh(new THREE.BoxGeometry(.55,6,.55),mat(0x34383d));p.position.set(x,3,-35);scene.add(p)}
  const train=new THREE.Group();for(let i=0;i<3;i++){const car=new THREE.Mesh(new THREE.BoxGeometry(11.8,2.4,2.8),mat(0xd9dde0));car.position.x=i*12.3;train.add(car);const stripe=new THREE.Mesh(new THREE.BoxGeometry(10.8,.3,2.86),new THREE.MeshBasicMaterial({color:0x00a1de}));stripe.position.set(i*12.3,0,0);train.add(stripe)}train.position.set(-70,7.3,-35);scene.add(train)
  const blockedByExternal=(x:number,z:number)=>externalCollisionBoxes.some(box=>box.containsPoint(new THREE.Vector3(x,1,z)))
  const canTraverseStatic=(x:number,z:number)=>{const blockedByBuilding=buildingColliders.some(b=>x>=b.minX&&x<=b.maxX&&z>=b.minZ&&z<=b.maxZ);if(blockedByBuilding)return false;const inRiver=z>=-27.2&&z<=-8.8&&x>=-75&&x<=75;const onBridge=Math.abs(x)<=5.2;return !inRiver||onBridge}
  const canTraverse=(x:number,z:number)=>canTraverseStatic(x,z)&&!blockedByExternal(x,z)
  const canDrive=(x:number,z:number)=>{const onMappedRoad=CHICAGO_ROAD_CORRIDORS.some(road=>road.axis==='x'?Math.abs(z-road.at)<=road.width*.68:Math.abs(x-road.at)<=road.width*.68);if(onMappedRoad)return true;const blockedByBuilding=buildingColliders.some(b=>x>=b.minX-1.5&&x<=b.maxX+1.5&&z>=b.minZ-1.5&&z<=b.maxZ+1.5);return !blockedByBuilding}
  const avatar=new THREE.Group();avatar.name='streetverse-mobile-hero';avatar.userData={characterId:'bj-stubbs',displayName:'BJ Stubbs',fallbackRealism:'bj-v4-mobile',identityContinuityKey:'bj-stubbs'}
  const skinMat=mat(0x70462f),shirtMat=mat(0x101215),pantsMat=mat(0x202329),hairMat=mat(0x17110f),beardGrayMat=mat(0x8e8882),goldMat=new THREE.MeshStandardMaterial({color:0xc8a14b,roughness:.32,metalness:.72})
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.46,1.38,4,10),shirtMat);body.name='hero-torso';body.position.y=1.82;body.scale.set(.96,1,.88);avatar.add(body)
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(.125,.145,.23,10),skinMat);neck.name='hero-neck';neck.position.y=2.82;avatar.add(neck)
  const head=new THREE.Mesh(new THREE.SphereGeometry(.43,18,14),skinMat);head.name='hero-head';head.position.y=3.31;head.scale.set(.93,1.07,.90);avatar.add(head)
  const jawFallback=new THREE.Mesh(new THREE.SphereGeometry(.28,14,10),skinMat);jawFallback.name='hero-jaw';jawFallback.position.set(0,3.16,.015);jawFallback.scale.set(.92,.65,.82);avatar.add(jawFallback)
  const crown=new THREE.Mesh(new THREE.SphereGeometry(.44,16,10,0,Math.PI*2,0,Math.PI*.45),hairMat);crown.name='hero-hair';crown.position.set(0,3.48,-.03);crown.scale.set(.98,.70,1.0);avatar.add(crown)
  for(const side of [-1,1])for(let i=0;i<3;i++){const loc=new THREE.Mesh(new THREE.CapsuleGeometry(.024,.86+i*.10,3,7),hairMat);loc.name='hero-loc';loc.position.set(side*(.11+i*.045),2.86-i*.06,-.18-i*.025);loc.rotation.z=side*(.07+i*.02);avatar.add(loc)}
  const beard=new THREE.Mesh(new THREE.SphereGeometry(.285,16,12,0,Math.PI*2,Math.PI*.42,Math.PI*.46),hairMat);beard.name='hero-beard';beard.position.set(0,3.13,.09);beard.scale.set(.92,.82,.88);avatar.add(beard)
  const grayBeard=new THREE.Mesh(new THREE.SphereGeometry(.18,14,10),beardGrayMat);grayBeard.name='hero-beard-gray';grayBeard.position.set(0,3.05,.17);grayBeard.scale.set(.82,.75,.56);avatar.add(grayBeard)
  for(const side of [-1,1]){
    const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.78,3,8),skinMat);arm.name='hero-arm';arm.position.set(side*.56,1.86,0);arm.rotation.z=side*.08;avatar.add(arm)
    const hand=new THREE.Mesh(new THREE.SphereGeometry(.105,10,8),skinMat);hand.name='hero-hand';hand.position.set(side*.61,1.28,.02);hand.scale.set(.72,1.08,.62);avatar.add(hand)
    for(let finger=0;finger<4;finger++){const digit=new THREE.Mesh(new THREE.CapsuleGeometry(.010,.085,2,5),skinMat);digit.name='hero-finger';digit.position.set(side*(.575+(finger-1.5)*.018),1.17,.035);digit.rotation.z=side*(finger-1.5)*.02;avatar.add(digit)}
    const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.88,3,8),pantsMat);leg.name='hero-leg';leg.position.set(side*.19,.58,0);avatar.add(leg)
    const shoe=new THREE.Mesh(new THREE.BoxGeometry(.28,.17,.66),mat(0x111318));shoe.name='hero-shoe';shoe.position.set(side*.19,.13,-.13);avatar.add(shoe)
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.043,8,6),mat(0x20150f));eye.name='hero-face-eye';eye.position.set(side*.135,3.38,.393);avatar.add(eye)
  }
  const mouth=new THREE.Mesh(new THREE.BoxGeometry(.16,.025,.018),mat(0x6f3d36));mouth.name='hero-face-mouth';mouth.position.set(0,3.15,.425);avatar.add(mouth)
  const pendantChain=new THREE.Mesh(new THREE.TorusGeometry(.13,.010,6,18,Math.PI),goldMat);pendantChain.name='hero-gold-chain';pendantChain.rotation.x=Math.PI/2;pendantChain.position.set(0,2.31,.28);avatar.add(pendantChain)
  const pendantFallback=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.018,12),goldMat);pendantFallback.name='hero-gold-pendant';pendantFallback.rotation.x=Math.PI/2;pendantFallback.position.set(0,2.18,.30);avatar.add(pendantFallback)
  const shirtGold=new THREE.Mesh(new THREE.BoxGeometry(.29,.055,.018),goldMat);shirtGold.name='hero-shirt-signature';shirtGold.position.set(0,2.02,.405);avatar.add(shirtGold)
  const shirtWhiteA=new THREE.Mesh(new THREE.BoxGeometry(.24,.025,.019),new THREE.MeshBasicMaterial({color:0xe9ecef}));shirtWhiteA.position.set(0,2.10,.406);avatar.add(shirtWhiteA)
  const shirtWhiteB=shirtWhiteA.clone();shirtWhiteB.position.y=1.94;avatar.add(shirtWhiteB)
  normalizeStreetVerseHumanHeight(avatar,STREETVERSE_HUMAN_HEIGHT_METERS.adultHero)
  const fallbackWindLocs=avatar.children.filter(child=>child.name==='hero-loc')
  fallbackWindLocs.forEach(object=>{object.userData={...object.userData,windBaseRotation:{x:object.rotation.x,y:object.rotation.y,z:object.rotation.z}}})
  let saved:any={};try{saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}catch{}const savedX=Number(saved.x??CIRCLE_PARK_SPAWN.x),savedZ=Number(saved.z??CIRCLE_PARK_SPAWN.z),savedSpawnValid=Number.isFinite(savedX)&&Number.isFinite(savedZ)&&canTraverse(savedX,savedZ);avatar.position.set(savedSpawnValid?savedX:CIRCLE_PARK_SPAWN.x,0,savedSpawnValid?savedZ:CIRCLE_PARK_SPAWN.z);scene.add(avatar);const underwaterPool=createStreetVerseUnderwaterPoolRuntime(scene,camera,avatar);if(!savedSpawnValid)setMessage('StreetVerse restored a safe Chicago spawn because the previous saved position was no longer walkable.')
  advanceLiveWorldBuild('collision',buildingColliders.length===blocks.length&&canTraverse(CIRCLE_PARK_SPAWN.x,CIRCLE_PARK_SPAWN.z))
  let persistenceCertified=false
  try{const probeKey=`${SAVE_KEY}.world-builder-probe`,probe=JSON.stringify({x:avatar.position.x,z:avatar.position.z,at:Date.now()});localStorage.setItem(probeKey,probe);persistenceCertified=localStorage.getItem(probeKey)===probe;localStorage.removeItem(probeKey)}catch{}
  advanceLiveWorldBuild('persistence',persistenceCertified)
  const missionDefs=[
   {id:'studio',label:'ROOSEVELT CHECK-IN',objective:'Check in on Roosevelt Road after the First Ride and meet the West Side business route.',x:-28,z:18,c:0xb96cff},
   {id:'market',label:'TAYLOR STREET RUN',objective:'Drive or walk south to Taylor Street and reach the neighborhood mission beacon.',x:24,z:-8,c:0x5be7ff},
   {id:'river',label:'PILSEN ARTS RUN',objective:'Continue into Pilsen and reach the arts-and-business beacon.',x:-24,z:-36,c:0xffc95b},
   {id:'stage',label:'CIRCLE PARK RETURN',objective:'Return to Circle Park to close the West Side route and unlock your Reel.',x:0,z:49,c:0xff4f9a}
  ] as const
  const missionLabelTextures:THREE.CanvasTexture[]=[]
  const makeMissionLabel=(label:string,color:number)=>{const canvas=document.createElement('canvas');canvas.width=384;canvas.height=96;const ctx=canvas.getContext('2d');if(!ctx)return null;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='rgba(2,10,18,.88)';ctx.roundRect(4,4,376,88,18);ctx.fill();ctx.strokeStyle='#9ef6ff';ctx.lineWidth=4;ctx.stroke();ctx.fillStyle='#fff';ctx.font='900 32px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('MISSION • '+label,192,48);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;missionLabelTextures.push(texture);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,color}));sprite.scale.set(13,3.25,1);return sprite}
  missionDefs.forEach(m=>{const beacon=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,9,10),new THREE.MeshBasicMaterial({color:m.c,transparent:true,opacity:.72}));beacon.position.set(m.x,4.5,m.z);scene.add(beacon);const ring=new THREE.Mesh(new THREE.TorusGeometry(1.7,.16,6,18),new THREE.MeshBasicMaterial({color:m.c}));ring.rotation.x=Math.PI/2;ring.position.set(m.x,.32,m.z);scene.add(ring);const label=makeMissionLabel(m.label,m.c);if(label){label.position.set(m.x,10,m.z);scene.add(label)}})
  const reachedMissionCheckpoints=new Set<string>()
  const checkMissionProximity=(x:number,z:number)=>{for(const mission of missionDefs){if(reachedMissionCheckpoints.has(mission.id))continue;if(Math.hypot(mission.x-x,mission.z-z)<=7){reachedMissionCheckpoints.add(mission.id);if(focusedMissionId.current===mission.id)focusedMissionId.current=null;window.dispatchEvent(new CustomEvent('tryamm:streetverse-checkpoint',{detail:{checkpoint:mission.id,id:mission.id,x,z,mobileLite:true,mobileSafeMode:false,htmlCity:false}}));setMessage(`Mission checkpoint reached • ${mission.label} • ${reachedMissionCheckpoints.size}/${missionDefs.length}`);if(reachedMissionCheckpoints.size===missionDefs.length){const complete={id:'district-01-mobile-safe',label:'StreetVerse Chicago District 01',source:'streetverse-mobile-3d',visited:[...reachedMissionCheckpoints],total:missionDefs.length,mobileLite:true,mobileSafeMode:false,htmlCity:false};setMessage('WEST SIDE ROUTE COMPLETE ✓ • Roosevelt → Taylor → Pilsen → Circle Park • REEL READY.');setDistrictReelReady(true);reelReadyRef.current=true;applyWorldEconomy('host-creator-event','district-01-mobile-safe');window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{...complete,route:['roosevelt','taylor','pilsen','circle-park']}}));window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'StreetVerse District 01 complete • 4/4 checkpoints ✓'}}))}}}}
  const carShellGeometry=new THREE.BoxGeometry(4.5,.72,2.02),carCabinGeometry=new THREE.BoxGeometry(2.12,.7,1.68),carWheelGeometry=new THREE.CylinderGeometry(.38,.38,.26,12),carLightGeometry=new THREE.BoxGeometry(.08,.2,.34),carHoodGeometry=new THREE.BoxGeometry(1.35,.2,1.9),carTrunkGeometry=new THREE.BoxGeometry(.78,.2,1.9),carGlassGeometry=new THREE.BoxGeometry(.08,.54,1.48)
  const cabinMat=new THREE.MeshStandardMaterial({color:0x274456,roughness:.18,metalness:.38}),wheelMat=mat(0x111318),headlightMat=new THREE.MeshBasicMaterial({color:0xffe8b0}),taillightMat=new THREE.MeshBasicMaterial({color:0xff3b45})
  const makeMobileCar=(color:number)=>{const g=new THREE.Group();g.name='streetverse-mobile-vehicle';const paint=mat(color);const shell=new THREE.Mesh(carShellGeometry,paint);shell.name='vehicle-body';shell.position.y=.79;g.add(shell);const hood=new THREE.Mesh(carHoodGeometry,paint);hood.name='vehicle-hood';hood.position.set(1.48,1.12,0);g.add(hood);const trunk=new THREE.Mesh(carTrunkGeometry,paint);trunk.name='vehicle-trunk';trunk.position.set(-1.82,1.1,0);g.add(trunk);const cabin=new THREE.Mesh(carCabinGeometry,cabinMat);cabin.name='vehicle-cabin';cabin.position.set(-.3,1.48,0);g.add(cabin);const windshield=new THREE.Mesh(carGlassGeometry,cabinMat);windshield.name='vehicle-windshield';windshield.position.set(.76,1.52,0);windshield.rotation.z=-.24;g.add(windshield);const rearGlass=windshield.clone();rearGlass.name='vehicle-rear-window';rearGlass.position.x=-1.28;rearGlass.rotation.z=.24;g.add(rearGlass);for(const x of [-1.38,1.38])for(const z of [-.98,.98]){const wheel=new THREE.Mesh(carWheelGeometry,wheelMat);wheel.name='vehicle-wheel';wheel.rotation.x=Math.PI/2;wheel.position.set(x,.42,z);g.add(wheel)}for(const z of [-.62,.62]){const light=new THREE.Mesh(carLightGeometry,headlightMat);light.name='vehicle-headlight';light.position.set(2.28,.82,z);g.add(light);const tail=new THREE.Mesh(carLightGeometry,taillightMat);tail.name='vehicle-taillight';tail.position.set(-2.28,.82,z);g.add(tail)}return g}
  const trafficPlan:ReadonlyArray<{axis:StreetVerseTrafficAxis;center:number;lane:number;direction:StreetVerseTrafficDirection;start:number}>=[
    {axis:'x',center:49,lane:-2.25,direction:1,start:-76},{axis:'x',center:49,lane:2.25,direction:-1,start:68},
    {axis:'x',center:18,lane:-2.35,direction:1,start:-58},{axis:'x',center:18,lane:2.35,direction:-1,start:54},
    {axis:'x',center:-8,lane:-2.1,direction:1,start:-72},{axis:'x',center:-8,lane:2.1,direction:-1,start:72},
    {axis:'x',center:-36,lane:-2.35,direction:1,start:-42},{axis:'x',center:-36,lane:2.35,direction:-1,start:40},
    {axis:'z',center:-45,lane:2.0,direction:1,start:-72},{axis:'z',center:-45,lane:-2.0,direction:-1,start:66},
    {axis:'z',center:0,lane:2.35,direction:1,start:-56},{axis:'z',center:0,lane:-2.35,direction:-1,start:58},
    {axis:'z',center:45,lane:2.0,direction:1,start:-68},{axis:'z',center:45,lane:-2.0,direction:-1,start:70},
  ]
  const cars:THREE.Group[]=[]
  trafficPlan.forEach((laneSpec,i)=>{const car=makeMobileCar([0xd94141,0x4288ff,0xd9bd48,0xe8e8e8,0x22252b,0x3abf7a][i%6]);car.userData.trafficAxis=laneSpec.axis;car.userData.trafficDirection=laneSpec.direction;car.userData.trafficSpeed=7.4+(i%4)*.85;car.userData.trafficPhase=i*19;car.userData.trafficLaneCenter=laneSpec.center+laneSpec.lane;if(laneSpec.axis==='x'){car.position.set(laneSpec.start,.05,laneSpec.center+laneSpec.lane);car.rotation.y=laneSpec.direction>0?0:Math.PI}else{car.position.set(laneSpec.center+laneSpec.lane,.05,laneSpec.start);car.rotation.y=laneSpec.direction>0?-Math.PI/2:Math.PI/2}scene.add(car);cars.push(car)})
  const passengerSeatOffsets:Record<string,THREE.Vector3>={
    'front-driver':new THREE.Vector3(-.28,1.02,.42),
    'front-passenger':new THREE.Vector3(-.28,1.02,-.42),
    'rear-left':new THREE.Vector3(-1.02,1.00,.48),
    'rear-center':new THREE.Vector3(-1.02,1.00,0),
    'rear-right':new THREE.Vector3(-1.02,1.00,-.48),
  }
  const makeSeatedRider=(seatId:string,index:number)=>{
    const rider=new THREE.Group();rider.name=`vehicle-rider-${seatId}`;rider.visible=false
    const skin=new THREE.MeshLambertMaterial({color:[0x6f452f,0x8d5c40,0xb27652,0x5a3929][index%4]})
    const cloth=new THREE.MeshLambertMaterial({color:[0x355f8c,0x7b3f67,0x3f754f,0x8a6631][index%4]})
    const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.18,.45,3,6),cloth);torso.position.y=.28;torso.rotation.z=-.06;rider.add(torso)
    const head=new THREE.Mesh(new THREE.SphereGeometry(.18,8,6),skin);head.name='rider-head';head.position.set(.05,.76,0);rider.add(head)
    const lap=new THREE.Mesh(new THREE.BoxGeometry(.42,.12,.46),cloth);lap.position.set(.18,.04,0);rider.add(lap)
    rider.userData={seatId,head,talkPhase:index*.9};return rider
  }
  const installFiveSeatManifest=(car:THREE.Group,vehicleId:string)=>{
    const manifest=createTransportManifest(vehicleId,'car')
    car.userData.transportManifest=manifest;car.userData.passengerCapacity=5;car.userData.seatLayout=['front-driver','front-passenger','rear-left','rear-center','rear-right']
    const riderVisuals:Record<string,THREE.Group>={}
    ;['front-passenger','rear-left','rear-center','rear-right'].forEach((seatId,index)=>{const rider=makeSeatedRider(seatId,index);rider.position.copy(passengerSeatOffsets[seatId]);rider.rotation.y=-Math.PI/2;car.add(rider);riderVisuals[seatId]=rider})
    car.userData.riderVisuals=riderVisuals
    return manifest
  }
  const syncVisibleRiders=(car:THREE.Group,now:number,visibleVehicle?:THREE.Object3D|null)=>{
    const manifest=car.userData.transportManifest as TransportManifest|undefined
    const visuals=car.userData.riderVisuals as Record<string,THREE.Group>|undefined
    if(!manifest||!visuals)return
    const host=visibleVehicle||car
    for(const [seatId,rider] of Object.entries(visuals)){
      if(rider.parent!==host)host.attach(rider)
      const actorId=manifest.occupants[seatId]
      rider.visible=Boolean(actorId)
      rider.userData.actorId=actorId||null
      const local=passengerSeatOffsets[seatId];if(local){rider.position.copy(local);rider.rotation.set(0,-Math.PI/2,0)}
      const head=rider.userData.head as THREE.Object3D|undefined
      if(head&&actorId){const phase=Number(rider.userData.talkPhase||0);head.rotation.y=Math.sin(now*.0011+phase)*.16;head.rotation.x=Math.sin(now*.0017+phase)*.035}
    }
  }
  const starterCar=makeMobileCar(0x36a9e8);starterCar.position.set(-18,.05,50);starterCar.userData.playerDrivable=true;starterCar.userData.vehicleId='starter-car';starterCar.userData.label='Starter Car';installFiveSeatManifest(starterCar,'starter-car');scene.add(starterCar);cars.push(starterCar)
  const repairCar=makeMobileCar(0xd97732);repairCar.position.set(-8,.05,50);repairCar.userData.playerDrivable=true;repairCar.userData.vehicleId='first-repair-car';repairCar.userData.label='Repair Mission Car';repairCar.userData.broken=true;installFiveSeatManifest(repairCar,'first-repair-car');scene.add(repairCar);cars.push(repairCar)
  const transportManifest=(car:THREE.Group)=>car.userData.transportManifest as TransportManifest|undefined
  const announceRiders=(car:THREE.Group)=>{const manifest=transportManifest(car);if(!manifest)return;const count=passengerCount(manifest);window.dispatchEvent(new CustomEvent('tryamm:streetverse-rider-manifest',{detail:{vehicleId:String(car.userData.vehicleId||'vehicle'),riders:count,capacity:manifest.seats.length,seats:manifest.seats.map(seat=>({id:seat.id,occupied:Boolean(manifest.occupants[seat.id])})),mobileLite:true}}))}
  const boardCompanion=(car:THREE.Group,actorId:string,preferredSeatId?:string)=>{const manifest=transportManifest(car);if(!manifest)return null;const seatId=boardTransport(manifest,actorId,preferredSeatId);announceRiders(car);return seatId}
  const leaveCompanion=(car:THREE.Group,actorId:string)=>{const manifest=transportManifest(car);if(!manifest)return false;const left=leaveTransport(manifest,actorId);announceRiders(car);return left}
  const onBoardCompanion=(event:Event)=>{const d=(event as CustomEvent<{vehicleId?:string;actorId?:string;preferredSeatId?:string}>).detail||{};const car=cars.find(v=>String(v.userData.vehicleId||'')===String(d.vehicleId||''));if(car&&d.actorId)boardCompanion(car,String(d.actorId),d.preferredSeatId)}
  const onLeaveCompanion=(event:Event)=>{const d=(event as CustomEvent<{vehicleId?:string;actorId?:string}>).detail||{};const car=cars.find(v=>String(v.userData.vehicleId||'')===String(d.vehicleId||''));if(car&&d.actorId)leaveCompanion(car,String(d.actorId))}
  addEventListener('tryamm:streetverse-board-companion',onBoardCompanion);addEventListener('tryamm:streetverse-leave-companion',onLeaveCompanion)
  const firstJourneyGuide=new THREE.Group();const firstGuideBody=new THREE.Mesh(new THREE.CapsuleGeometry(.4,1.05,3,8),mat(0x7be9ff));firstGuideBody.position.y=1.25;firstJourneyGuide.add(firstGuideBody);const firstGuideHead=new THREE.Mesh(new THREE.SphereGeometry(.34,10,8),mat(0x9b6749));firstGuideHead.position.y=2.45;firstJourneyGuide.add(firstGuideHead);const firstGuideHalo=new THREE.Mesh(new THREE.TorusGeometry(.72,.07,8,24),new THREE.MeshBasicMaterial({color:0xffd75e}));firstGuideHalo.rotation.x=Math.PI/2;firstGuideHalo.position.y=.08;firstJourneyGuide.add(firstGuideHalo);firstJourneyGuide.position.set(0,0,18);firstJourneyGuide.visible=false;scene.add(firstJourneyGuide);const firstJourneyDriveTarget={x:0,z:18,label:'ROOSEVELT ROAD'}
  const firstJourneyBeacon=new THREE.Group();firstJourneyBeacon.visible=false;const firstJourneyColumn=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,8,10),new THREE.MeshBasicMaterial({color:0xffd75e,transparent:true,opacity:.72}));firstJourneyColumn.position.y=4;firstJourneyBeacon.add(firstJourneyColumn);const firstJourneyRing=new THREE.Mesh(new THREE.TorusGeometry(1.55,.12,8,28),new THREE.MeshBasicMaterial({color:0xffe887}));firstJourneyRing.rotation.x=Math.PI/2;firstJourneyRing.position.y=.18;firstJourneyBeacon.add(firstJourneyRing);firstJourneyBeacon.position.set(repairCar.position.x,0,repairCar.position.z);scene.add(firstJourneyBeacon)
  let firstJourneyActive=false,firstJourneyDrove=false
  const worldConsequenceBeacon=new THREE.Group();worldConsequenceBeacon.name='world-consequence-beacon';worldConsequenceBeacon.visible=false
  const worldConsequenceColumn=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,9,10),new THREE.MeshBasicMaterial({color:0x67e8ff,transparent:true,opacity:.62}));worldConsequenceColumn.position.y=4.5;worldConsequenceBeacon.add(worldConsequenceColumn)
  const worldConsequenceRing=new THREE.Mesh(new THREE.TorusGeometry(1.8,.13,8,30),new THREE.MeshBasicMaterial({color:0xffd86b}));worldConsequenceRing.rotation.x=Math.PI/2;worldConsequenceRing.position.y=.20;worldConsequenceBeacon.add(worldConsequenceRing);scene.add(worldConsequenceBeacon)
  let activeWorldMission:StreetVerseWorldConsequenceMission|null=null,worldMissionStarted=false,lastEnvironmentHapticAt=0,environmentWindIntensity=0,environmentGustIntensity=0,environmentWindDirection=0
  const onFirstJourneyStart=()=>{firstJourneyActive=true;firstJourneyDrove=false;setFirstJourneyReady(false);firstJourneyReadyRef.current=false;setFirstJourneyReelReady(false);reelReadyRef.current=false;repairCar.userData.broken=true;nativeRepairStep=0;nativeDoorsOpen=false;firstJourneyGuide.visible=false;firstJourneyBeacon.position.set(repairCar.position.x,0,repairCar.position.z);firstJourneyBeacon.visible=true;boardCompanion(repairCar,'circle-park-guide-rider','front-passenger');boardCompanion(repairCar,'circle-park-neighbor-rider','rear-left');setMissionGuide({id:'iphone-first-journey',label:'REPAIR CAR',distance:Math.round(Math.hypot(avatar.position.x-repairCar.position.x,avatar.position.z-repairCar.position.z)),bearing:'FOLLOW GOLD BEACON'});setMessage('FIRST RIDE STARTED • Circle Park • two neighbors are waiting in the 5-seat mission car • repair it, enter, and drive to Roosevelt.')}
  const onFirstJourneyComplete=()=>{firstJourneyActive=false;firstJourneyDrove=false;setFirstJourneyReady(false);firstJourneyReadyRef.current=false;setFirstJourneyReelReady(true);reelReadyRef.current=true;firstJourneyGuide.visible=false;firstJourneyBeacon.visible=false;setMissionGuide(null);setMessage('FIRST RIDE COMPLETE ✓ • reward recorded • REEL READY')}
  addEventListener('tryamm:streetverse-first-journey-start',onFirstJourneyStart);addEventListener('tryamm:streetverse-first-journey-complete',onFirstJourneyComplete)
  const residents=createMobileResidentPopulation(scene)
  const alive=createStreetVerseChicagoAliveMobile(scene)
  const visualLife=createStreetVerseChicagoVisualLife(scene,hemi,sun)
  const trafficLife=createStreetVerseChicagoTrafficLife(scene)
  const pedestrianRoutines=createStreetVerseChicagoPedestrianRoutines(scene,trafficLife.getSignalState)
  const identityInteraction=createStreetVerseChicagoIdentityInteraction(scene)
  const insectEcology=createStreetVerseInsectEcology(scene)
  const rodentEcology=createStreetVerseRodentRuntime(scene)
  const resourcePassportRuntime=installStreetVerseResourcePassportRuntime()
  const residentAccessRuntime=installCircleParkResidentAccessRuntime()
  const communitySafetyRuntime=installCircleParkCommunitySafetyRuntime()
  const onCircleParkAccessResult=(event:Event)=>{
    const detail=(event as CustomEvent<{method?:string;allowed?:boolean;target?:[number,number,number];impact?:{intensity?:number}}>).detail||{}
    if(!detail.allowed||!detail.target)return
    avatar.position.set(detail.target[0],0,detail.target[2])
    if(detail.method==='guard-sign-in')setMessage('CIRCLE PARK • SIGNED IN • SECURITY WAVES YOU THROUGH')
    else if(detail.method==='resident-key')setMessage('CIRCLE PARK • RESIDENT KEY • SIDE GATE OPEN')
    else if(detail.method==='gate-vault'){setMessage('CIRCLE PARK • GATE VAULT • LANDING IMPACT');heroAffectPosture='guarded';heroAffectBreathing=Math.max(heroAffectBreathing,.55)}
    window.dispatchEvent(new CustomEvent('tryamm:reel-moment',{detail:{kind:'circle-park-entry',method:detail.method,impact:detail.impact?.intensity||0,source:'streetverse-mobile-world'}}))
  }
  addEventListener('tryamm:circle-park-access-result',onCircleParkAccessResult)
  const characterDevelopment=installStreetVerseCharacterDevelopmentRuntime(STREETVERSE_HERO_CHARACTER_ID)
  const facialExpressions=installStreetVerseFacialExpressionRuntime(STREETVERSE_HERO_CHARACTER_ID)
  const emotionalIntelligence=installStreetVerseEmotionalIntelligenceRuntime(STREETVERSE_HERO_CHARACTER_ID)
  const bodyNeeds=installStreetVerseBodyNeedsRuntime(STREETVERSE_HERO_CHARACTER_ID)
  const threatResponse=installStreetVerseThreatResponseRuntime(STREETVERSE_HERO_CHARACTER_ID)
  const worldConsequences=installStreetVerseWorldConsequenceRuntime(STREETVERSE_HERO_CHARACTER_ID)
  const adultSubstanceRuntime=installStreetVerseAdultSubstanceRuntime()
  const rescueIncidentRuntime=installStreetVerseRescueIncidentRuntime()
  const soundBankRuntime=installStreetVerseSoundBankRuntime()
  const aiCafeBridgeRuntime=installStreetVerseAICafeBridgeRuntime()
  let adultImpairment=0
  const onAdultImpairment=(event:Event)=>{
    const d=(event as CustomEvent<{combined?:number;drivingBlocked?:boolean}>).detail||{}
    adultImpairment=THREE.MathUtils.clamp(Number(d.combined||0),0,1)
    if(d.drivingBlocked&&activeCar){
      setMessage('IMPAIRED • PARK AND EXIT • driving disabled for adult-recreation simulation')
    }
  }
  addEventListener('tryamm:streetverse-impairment-state',onAdultImpairment)
  let activeCircleParkActivity='',circleParkActivityStartedAt=0,basketballMove='shootaround',basketballDunkStyle='power-two-hand'
  const circleParkActivityCounts:Record<string,number>={}
  const onCircleParkActivity=(event:Event)=>{
    const detail=(event as CustomEvent<{activity?:string;mode?:string}>).detail||{}
    const activity=String(detail.activity||'social')
    activeCircleParkActivity=activity;circleParkActivityStartedAt=performance.now();if(activity==='basketball')setBasketballOpen(true);if(activity==='swimming')setPoolSessionId('circle-park-pool')
    circleParkActivityCounts[activity]=(circleParkActivityCounts[activity]||0)+1
    const labels:Record<string,string>={basketball:'BASKETBALL • SHOT',playground:'PLAYGROUND • PLAY',barbecue:'BARBECUE • COOKOUT',swimming:'POOL • SWIM',tennis:'TENNIS • RALLY',social:'COURTYARD • HANG OUT'}
    setMessage(labels[activity]||'CIRCLE PARK ACTIVITY')
    window.dispatchEvent(new CustomEvent('tryamm:circle-park-activity-progress',{detail:{activity,mode:detail.mode,count:circleParkActivityCounts[activity],world:'circle-park',source:'streetverse-mobile-world'}}))
    window.dispatchEvent(new CustomEvent('tryamm:reel-moment',{detail:{kind:'circle-park-activity',activity,source:'streetverse-mobile-world'}}))
  }
  addEventListener('tryamm:circle-park-activity',onCircleParkActivity)
  const onPoolOpen=(event:Event)=>{const d=(event as CustomEvent<{poolId?:string}>).detail||{};setPoolSessionId(String(d.poolId||'streetverse-pool'))}
  const onSeniorCommonsOpen=()=>setSeniorCommonsOpen(true)
  addEventListener('tryamm:pool-open',onPoolOpen);addEventListener('tryamm:senior-commons-open',onSeniorCommonsOpen)
  const onCircleParkBasketballPlay=(event:Event)=>{const d=(event as CustomEvent<{move?:string;dunkStyle?:string}>).detail||{};basketballMove=String(d.move||'jumper');basketballDunkStyle=String(d.dunkStyle||basketballDunkStyle);activeCircleParkActivity='basketball';circleParkActivityStartedAt=performance.now()}
  addEventListener('tryamm:circle-park-basketball-play',onCircleParkBasketballPlay)
  const fameFans:THREE.Group[]=[]
  for(let i=0;i<8;i++){const fan=new THREE.Group();const fanBody=new THREE.Mesh(new THREE.BoxGeometry(.72,1.5,.5),mat([0xff6f9e,0x65d8ff,0xffcf67,0x75e08e][i%4]));fanBody.position.y=1.15;fan.add(fanBody);const fanHead=new THREE.Mesh(new THREE.SphereGeometry(.27,7,5),mat([0x7a4d32,0xa36b4b,0xc88d68,0xd79a70][i%4]));fanHead.position.y=2.16;fan.add(fanHead);normalizeStreetVerseHumanHeight(fan,residentHeight(i+20));fan.visible=false;scene.add(fan);fameFans.push(fan)}
  const fameRankFanCount:Record<string,number>={'Unknown':0,'Local Buzz':2,'Rising Talent':4,'City Star':6,'National Star':8,'Global Star':8,'Icon':8,'Legend':8}
  let fameFanCount=0,lastFameRank='Unknown'
  const applyFameReaction=(detail:Record<string,unknown>)=>{const rank=String(detail.rank||'Unknown');fameFanCount=fameRankFanCount[rank]??0;if(rank!==lastFameRank){lastFameRank=rank;if(rank!=='Unknown')setMessage(`FAME REACTION • ${rank.toUpperCase()} • residents recognize you in StreetVerse.`)}}
  const onFameReaction=(event:Event)=>applyFameReaction((event as CustomEvent<Record<string,unknown>>).detail||{})
  addEventListener('tryamm:streetverse-fame-state',onFameReaction)
  try{const cachedFame=JSON.parse(localStorage.getItem('tryamm.streetverse.fame.v1')||'null');if(cachedFame)applyFameReaction(cachedFame)}catch{}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-resident-population-ready',{detail:{mode:'mobile-lite',residentCount:residents.length,lightweight:true}}))
  type PlayerCameraMode='third-person'|'first-person'
  let playerCameraMode:PlayerCameraMode=(()=>{try{return localStorage.getItem('tryamm:streetverse-player-camera')==='first-person'?'first-person':'third-person'}catch{return'third-person'}})()
  const setPlayerCameraMode=(mode:PlayerCameraMode)=>{playerCameraMode=mode;try{localStorage.setItem('tryamm:streetverse-player-camera',mode)}catch{};setMessage(`PLAYER CAMERA • ${mode==='first-person'?'FIRST PERSON':'THIRD PERSON'}`);window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-camera-changed',{detail:{mode}}))}
  const togglePlayerCamera=()=>setPlayerCameraMode(playerCameraMode==='third-person'?'first-person':'third-person')
  let cameraLookYaw=0,cameraLookPitch=0,thirdPersonShoulder:1|-1=1
  const clampCameraLook=()=>{cameraLookYaw=THREE.MathUtils.clamp(cameraLookYaw,-1.35,1.35);cameraLookPitch=THREE.MathUtils.clamp(cameraLookPitch,-.72,.62)}
  const onCameraLook=(event:Event)=>{const d=(event as CustomEvent<{dx?:number;dy?:number;absolute?:boolean}>).detail||{};if(d.absolute){cameraLookYaw=Number(d.dx||0);cameraLookPitch=Number(d.dy||0)}else{cameraLookYaw+=Number(d.dx||0)*.012;cameraLookPitch+=Number(d.dy||0)*.010}clampCameraLook()}
  const switchShoulder=()=>{thirdPersonShoulder=thirdPersonShoulder===1?-1:1;setMessage(`3RD PERSON • ${thirdPersonShoulder===1?'RIGHT':'LEFT'} SHOULDER`)}
  const onTogglePlayerCamera=()=>togglePlayerCamera(),onSwitchShoulder=()=>switchShoulder(),onCycleVehicleCamera=()=>cycleVehicleCamera()
  addEventListener('tryamm:streetverse-camera-look',onCameraLook);addEventListener('tryamm:streetverse-toggle-player-camera',onTogglePlayerCamera);addEventListener('tryamm:streetverse-switch-shoulder',onSwitchShoulder);addEventListener('tryamm:streetverse-cycle-vehicle-camera',onCycleVehicleCamera)
  const applyFirstPersonCamera=(hero:THREE.Object3D)=>{const axis=new THREE.Vector3(0,1,0),yaw=hero.rotation.y+cameraLookYaw,eye=new THREE.Vector3(0,1.66,.08).applyAxisAngle(axis,hero.rotation.y).add(hero.position),forward=new THREE.Vector3(Math.sin(yaw),Math.sin(cameraLookPitch),-Math.cos(yaw)).normalize();camera.position.lerp(eye,.42);camera.lookAt(eye.clone().add(forward.multiplyScalar(8)));return true}
  const applyThirdPersonShoulderCamera=(hero:THREE.Object3D)=>{const axis=new THREE.Vector3(0,1,0),yaw=hero.rotation.y+cameraLookYaw,offset=new THREE.Vector3(-5.6,3.25,thirdPersonShoulder*1.15).applyAxisAngle(axis,yaw),desired=hero.position.clone().add(offset);camera.position.lerp(desired,.18);const look=hero.position.clone().add(new THREE.Vector3(Math.sin(yaw)*4.5,1.55+cameraLookPitch*2.2,-Math.cos(yaw)*4.5));camera.lookAt(look);return true}
  type VehicleCameraMode='chase'|'driver'|'front-passenger'|'rear-left'|'rear-center'|'rear-right'|'dashboard'|'cinematic'
  const vehicleCameraModes:VehicleCameraMode[]=['chase','driver','front-passenger','rear-left','rear-center','rear-right','dashboard','cinematic']
  let vehicleCameraMode:VehicleCameraMode='chase'
  const vehicleCameraLocal:Record<Exclude<VehicleCameraMode,'chase'|'cinematic'>,{position:THREE.Vector3;look:THREE.Vector3}>={
    driver:{position:new THREE.Vector3(-.18,1.63,.42),look:new THREE.Vector3(5.8,1.35,.38)},
    'front-passenger':{position:new THREE.Vector3(-.18,1.63,-.42),look:new THREE.Vector3(5.8,1.35,-.34)},
    'rear-left':{position:new THREE.Vector3(-1.02,1.56,.48),look:new THREE.Vector3(4.8,1.32,.22)},
    'rear-center':{position:new THREE.Vector3(-1.04,1.56,0),look:new THREE.Vector3(4.8,1.32,0)},
    'rear-right':{position:new THREE.Vector3(-1.02,1.56,-.48),look:new THREE.Vector3(4.8,1.32,-.22)},
    dashboard:{position:new THREE.Vector3(.58,1.44,0),look:new THREE.Vector3(6.8,1.20,0)},
  }
  const applyVehicleCamera=(car:THREE.Group,now:number)=>{
    if(vehicleCameraMode==='chase')return false
    const yaw=car.rotation.y,axis=new THREE.Vector3(0,1,0)
    if(vehicleCameraMode==='cinematic'){const orbit=new THREE.Vector3(-8.8,3.5,6.8).applyAxisAngle(axis,yaw+Math.sin(now*.00022)*.28);camera.position.lerp(car.position.clone().add(orbit),.10);camera.lookAt(car.position.x,1.15,car.position.z);return true}
    const spec=vehicleCameraLocal[vehicleCameraMode],worldPos=spec.position.clone().applyAxisAngle(axis,yaw).add(car.position),worldLook=spec.look.clone().applyAxisAngle(axis,yaw).add(car.position)
    camera.position.lerp(worldPos,.28);camera.lookAt(worldLook);return true
  }
  const onVehicleCamera=(event:Event)=>{const requested=String((event as CustomEvent<{mode?:string}>).detail?.mode||'chase') as VehicleCameraMode;if(vehicleCameraModes.includes(requested)){vehicleCameraMode=requested;setMessage(`CAR CAMERA • ${requested.replaceAll('-',' ').toUpperCase()}`)}}
  const cycleVehicleCamera=()=>{const index=vehicleCameraModes.indexOf(vehicleCameraMode);vehicleCameraMode=vehicleCameraModes[(index+1)%vehicleCameraModes.length];setMessage(`CAR CAMERA • ${vehicleCameraMode.replaceAll('-',' ').toUpperCase()}`);window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-camera-changed',{detail:{mode:vehicleCameraMode}}))}
  addEventListener('tryamm:streetverse-vehicle-camera',onVehicleCamera)
  let activeCar:THREE.Group|null=null,driveHeading=0,driveSpeed=0,driveSteer=0,oneHandDriveAssist=(()=>{try{return localStorage.getItem('tryamm:streetverse-control-mode')==='one-hand'}catch{return false}})(),oneHandCruise=false,nativeRepairStep=0,nativeDoorsOpen=false
  const onControlMode=(event:Event)=>{const d=(event as CustomEvent<{mode?:string}>).detail||{};oneHandDriveAssist=d.mode==='one-hand';if(oneHandDriveAssist)setMessage('ONE-HAND DRIVE ASSIST • slower speed + gentler steering enabled.')}
  addEventListener('tryamm:streetverse-control-mode',onControlMode)
  const onCruise=(event:Event)=>{const d=(event as CustomEvent<{active?:boolean}>).detail||{};oneHandCruise=Boolean(d.active)&&Boolean(activeCar);setMessage(oneHandCruise?'ONE-HAND CRUISE ON • steer with the joystick • EXIT cancels cruise.':'ONE-HAND CRUISE OFF.')}
  addEventListener('tryamm:streetverse-cruise',onCruise)
  const onRepairStep=(event:Event)=>{const d=(event as CustomEvent<{vehicleId?:string;step?:number}>).detail||{};if(String(d.vehicleId||'')==='first-repair-car')nativeRepairStep=Math.max(0,Math.min(3,Number(d.step||0)))}
  const onVehicleDoor=(event:Event)=>{const d=(event as CustomEvent<{vehicleId?:string;open?:boolean}>).detail||{};if(String(d.vehicleId||'')==='first-repair-car')nativeDoorsOpen=d.open===true}
  addEventListener('tryamm:streetverse-repair-step',onRepairStep);addEventListener('tryamm:streetverse-vehicle-door',onVehicleDoor)
  const repairedState=()=>repairCar.userData.broken!==true
  const nearestCar=()=>{let car:THREE.Group|null=null,distance=Infinity;const preferred=cars.filter(candidate=>candidate!==activeCar&&candidate.userData.playerDrivable===true&&!candidate.userData.broken);const pool=preferred.length?preferred:cars.filter(candidate=>candidate!==activeCar);for(const candidate of pool){const d=Math.hypot(candidate.position.x-avatar.position.x,candidate.position.z-avatar.position.z);if(d<distance){distance=d;car=candidate}}return{car,distance}}
  const enterVehicle=()=>{if(activeCar)return;const nearest=nearestCar();const car=nearest.car;if(!car||nearest.distance>28){setMessage('No drivable vehicle close enough. Move nearer to the blue Starter Car and tap DRIVE again.');window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-denied',{detail:{reason:'too-far',distance:nearest.distance,mobileLite:true}}));return}const vehicleId=String(car.userData.vehicleId||'vehicle');if(car.userData.broken){setMessage('REPAIR REQUIRED • use the Holo Actions repair steps before driving.');window.dispatchEvent(new CustomEvent('tryamm:streetverse-interaction-context',{detail:{kind:'vehicle',vehicleId,label:String(car.userData.label||'Vehicle'),broken:true,drivable:false,repairKit:true,missionId:`vehicle-repair:${vehicleId}`}}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-denied',{detail:{vehicleId,reason:'repair-required',mobileLite:true}}));return}activeCar=car;car.userData.userDriven=true;boardCompanion(car,STREETVERSE_HERO_CHARACTER_ID,'front-driver');driveHeading=car.rotation.y;driveSpeed=0;driveSteer=0;if(car===repairCar){nativeDoorsOpen=false;if(firstJourneyActive){firstJourneyDrove=false;firstJourneyBeacon.position.set(firstJourneyDriveTarget.x,0,firstJourneyDriveTarget.z);firstJourneyBeacon.visible=true;setMessage('DRIVE LEG • take the repaired car from Circle Park to Roosevelt Road.')}}avatar.visible=false;avatar.position.set(car.position.x,0,car.position.z);setStatus('MOBILE CITY • DRIVING');setMessage('Vehicle control active • W/S or throttle/brake to move • A/D or steer to turn • EXIT VEHICLE returns to walking.');window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-controlled',{detail:{entered:true,mobileLite:true,x:car.position.x,z:car.position.z,vehicleType:'car'}}))}
  const exitVehicle=()=>{if(!activeCar)return;if(firstJourneyActive&&activeCar===repairCar&&!firstJourneyDrove){setMessage('KEEP DRIVING • reach the Roosevelt Road gold beacon before exiting.');return}oneHandCruise=false;window.dispatchEvent(new CustomEvent('tryamm:streetverse-cruise-state',{detail:{active:false,source:'vehicle-exit'}}));const car=activeCar;leaveCompanion(car,STREETVERSE_HERO_CHARACTER_ID);driveSpeed=0;driveSteer=0;avatar.position.set(clamp(car.position.x+Math.sin(driveHeading)*3.5),0,clamp(car.position.z+Math.cos(driveHeading)*3.5));avatar.visible=true;activeCar=null;const firstJourneyNeedsGuide=firstJourneyActive&&car===repairCar&&firstJourneyDrove;if(firstJourneyNeedsGuide){firstJourneyBeacon.position.set(firstJourneyGuide.position.x,0,firstJourneyGuide.position.z);firstJourneyBeacon.visible=true};setStatus('MOBILE CITY • PLAYABLE');setMessage(firstJourneyNeedsGuide?'NEXT • walk to the glowing guide and tap TALK.':'Exited vehicle • walking controls restored. Your car stays parked for re-entry.');window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-controlled',{detail:{entered:false,mobileLite:true,x:avatar.position.x,z:avatar.position.z,vehicleType:'car'}}))}
  const showPrompt=(next:StreetVerseInteractionPrompt|null)=>{const prev=interactionRef.current;if(prev?.id===next?.id)return;interactionRef.current=next;setInteractionPrompt(next)}
  const compassBearing=(dx:number,dz:number)=>{const a=Math.atan2(dx,-dz)*180/Math.PI;const d=(a+360)%360;return d<22.5||d>=337.5?'N':d<67.5?'NE':d<112.5?'E':d<157.5?'SE':d<202.5?'S':d<247.5?'SW':d<292.5?'W':'NW'}
  const syncNativeRepairCar=()=>{repairCar.visible=!nativeRepairCar;if(nativeRepairCar){nativeRepairCar.position.copy(repairCar.position);nativeRepairCar.position.y=0;nativeRepairCar.rotation.y=repairCar.rotation.y;const hoodTarget=nativeRepairStep>0&&nativeRepairStep<3?-.9:0;if(nativeHoodPivot)nativeHoodPivot.rotation.z=THREE.MathUtils.lerp(nativeHoodPivot.rotation.z,hoodTarget,.14);if(nativeDriverDoorPivot)nativeDriverDoorPivot.rotation.y=THREE.MathUtils.lerp(nativeDriverDoorPivot.rotation.y,nativeDoorsOpen?-1.05:0,.14);if(nativePassengerDoorPivot)nativePassengerDoorPivot.rotation.y=THREE.MathUtils.lerp(nativePassengerDoorPivot.rotation.y,nativeDoorsOpen?1.05:0,.14)}}
  const syncNativeRealism=(now:number,moving:boolean)=>{
    if(nativeHero){avatar.visible=false;nativeHero.visible=true;if(activeCar){const driverOffset=new THREE.Vector3(-.36,.70,.42).applyAxisAngle(new THREE.Vector3(0,1,0),activeCar.rotation.y);nativeHero.position.copy(activeCar.position).add(driverOffset);nativeHero.rotation.y=activeCar.rotation.y-Math.PI/2}else{nativeHero.position.copy(avatar.position);nativeHero.rotation.y=avatar.rotation.y};const talking=now<heroConversationUntil;bjMeshyHero?.tick(now,{moving:moving&&!activeCar,running:moving&&!activeCar&&heroSprintAllowed,talking:talking||heroLiveTalkLevel>.025,liveTalkLevel:heroLiveTalkLevel});publishedHeroBody?.tick(now,{moving:moving&&!activeCar,running:moving&&!activeCar&&heroSprintAllowed});familyHeroHandle?.tick(now,{moving:moving&&!activeCar,running:moving&&!activeCar&&heroSprintAllowed});animateNativeHumanoid(nativeHeroRig,moving&&!activeCar,false,now,0,true,talking||heroLiveTalkLevel>.025,heroConversationFocusYaw,heroLiveTalkLevel,heroAffectBreathing,heroAffectPosture);if(activeCar)applySeatedDriverPose(nativeHeroRig);if(bjHeadRuntime){const t=now*.001,blinkClock=t%4.6,blink=blinkClock>4.36?Math.sin(((blinkClock-4.36)/.24)*Math.PI):0,synthetic=talking?THREE.MathUtils.clamp((Math.sin(t*12.4)+Math.sin(t*7.1+1.2)+1.0)/3,0,1):0,speech=Math.max(synthetic,heroLiveTalkLevel);bjHeadRuntime.applyPose({blinkLeft:blink,blinkRight:blink,jawOpen:speech*.82,browInnerUp:(talking||heroLiveTalkLevel>.05)?.10:0,lookLeft:heroConversationFocusYaw<0?Math.min(1,Math.abs(heroConversationFocusYaw)*1.8):0,lookRight:heroConversationFocusYaw>0?Math.min(1,Math.abs(heroConversationFocusYaw)*1.8):0,cheekRaise:talking?.04:0})}}
    if(nativeTrain){train.visible=false;nativeTrain.position.copy(train.position);nativeTrain.rotation.y=train.rotation.y}
    if(nativeStarterCar){starterCar.visible=false;nativeStarterCar.position.copy(starterCar.position);nativeStarterCar.rotation.y=starterCar.rotation.y}
    syncVisibleRiders(starterCar,now,nativeStarterCar);syncVisibleRiders(repairCar,now,nativeRepairCar)
    residents.forEach((resident,i)=>{const visual=nativeResidents[i];if(!visual)return;resident.group.visible=false;visual.position.copy(resident.group.position);visual.rotation.y=resident.group.rotation.y;const meshyHandle=meshyResidentHandles[i];if(meshyHandle)meshyHandle.tick(now,{moving:true,running:false});else{const facialDetail=visual.position.distanceTo(camera.position)<18;animateNativeHumanoid(nativeResidentRigs[i],true,false,now,i*.57,facialDetail,false,0,0,.15,'neutral')}})
    for(let i=0;i<14;i++){const visual=nativeTrafficCars[i],control=cars[i];if(!visual||!control)continue;control.visible=false;visual.position.copy(control.position);visual.rotation.y=control.rotation.y}
  }
  const updateMissionGuide=()=>{const focus=activeCar||avatar;if(reelReadyRef.current){setMissionGuide(null);return}if(activeWorldMission){const dx=activeWorldMission.x-focus.position.x,dz=activeWorldMission.z-focus.position.z;setMissionGuide({id:activeWorldMission.id,label:activeWorldMission.title,distance:Math.round(Math.hypot(dx,dz)),bearing:compassBearing(dx,dz),objective:'Reach the highlighted world-event marker and respond to the incident.'});return}let best:(typeof missionDefs)[number]|null=null,distance=Infinity;const focused=focusedMissionId.current?missionDefs.find(m=>m.id===focusedMissionId.current&&!reachedMissionCheckpoints.has(m.id)):undefined;if(focused){best=focused;distance=Math.hypot(focused.x-focus.position.x,focused.z-focus.position.z)}else{for(const mission of missionDefs){if(reachedMissionCheckpoints.has(mission.id))continue;const d=Math.hypot(mission.x-focus.position.x,mission.z-focus.position.z);if(d<distance){distance=d;best=mission}}}if(!best){setMissionGuide(null);return}setMissionGuide({id:best.id,label:best.label,distance:Math.round(distance),bearing:compassBearing(best.x-focus.position.x,best.z-focus.position.z),objective:best.objective})}
  const updateContextPrompt=()=>{if(activeCar){showPrompt({id:'vehicle-exit',label:'Current Vehicle',action:'EXIT VEHICLE',kind:'ride',x:activeCar.position.x,z:activeCar.position.z,distance:0});return}if(firstJourneyActive&&firstJourneyDrove&&repairedState()){const guideDistance=Math.hypot(firstJourneyGuide.position.x-avatar.position.x,firstJourneyGuide.position.z-avatar.position.z);if(guideDistance<=9){showPrompt({id:'first-journey-guide',label:'First Journey Guide',action:'TALK',kind:'talk',x:firstJourneyGuide.position.x,z:firstJourneyGuide.position.z,distance:guideDistance});return}}const nearest=nearestCar();if(nearest.car&&nearest.distance<=12){const broken=Boolean(nearest.car.userData.broken);const vehicleId=String(nearest.car.userData.vehicleId||'vehicle');if(broken){showPrompt({id:'vehicle-repair',label:String(nearest.car.userData.label||'Repair Mission Car'),action:'REPAIR CAR',kind:'ride',x:nearest.car.position.x,z:nearest.car.position.z,distance:nearest.distance});window.dispatchEvent(new CustomEvent('tryamm:streetverse-interaction-context',{detail:{kind:'vehicle',vehicleId,label:String(nearest.car.userData.label||'Vehicle'),broken:true,drivable:false,repairKit:true,missionId:`vehicle-repair:${vehicleId}`}}));return}showPrompt({id:'vehicle-enter',label:String(nearest.car.userData.label||'Nearby Vehicle'),action:'ENTER VEHICLE',kind:'ride',x:nearest.car.position.x,z:nearest.car.position.z,distance:nearest.distance});return}showPrompt(identityInteraction.getNearestInteraction(avatar.position.x,avatar.position.z))}
  const activateCurrentInteraction=()=>{const prompt=interactionRef.current;if(!prompt){activeCar?exitVehicle():enterVehicle();return}if(prompt.id==='vehicle-enter'){window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{entered:true}}));return}if(prompt.id==='vehicle-exit'){window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{entered:false}}));return}if(prompt.id==='first-journey-guide'){const detail={id:'first-journey-guide',label:'First Journey Guide',kind:'talk',action:'TALK',topic:'First Ride completion',source:'iphone-first-journey'};window.dispatchEvent(new CustomEvent('tryamm:streetverse-npc-dialogue',{detail}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-context-interaction',{detail}));setMessage('GUIDE CHECK-IN COMPLETE • tap COMPLETE FIRST RIDE.');setFirstJourneyReady(true);firstJourneyReadyRef.current=true;window.dispatchEvent(new CustomEvent('tryamm:streetverse-first-journey-ready-to-complete',{detail:{missionId:'iphone-first-journey',source:'streetverse-mobile-world'}}));return}if(prompt.id==='vehicle-repair'){window.dispatchEvent(new CustomEvent('tryamm:streetverse-interaction-context',{detail:{kind:'vehicle',vehicleId:'first-repair-car',label:'Repair Mission Car',broken:true,drivable:false,repairKit:true,missionId:'vehicle-repair:first-repair-car'}}));return}identityInteraction.activate(prompt.id)}
  const onInteract=(e:Event)=>{const d=(e as CustomEvent<{entered?:boolean}>).detail||{};if(d.entered===false)exitVehicle();else if(d.entered===true){if(adultImpairment>=.18){setMessage('DRIVING DISABLED • impaired adult-recreation state');window.dispatchEvent(new CustomEvent('tryamm:streetverse-dialogue',{detail:{speaker:'StreetVerse Safety',text:'Driving is disabled while your character is impaired. Recover first or use ride share.'}}));return}enterVehicle()}else activeCar?exitVehicle():enterVehicle()};addEventListener('tryamm:streetverse-vehicle-interact',onInteract)
  const onVehicleRepaired=(e:Event)=>{const d=(e as CustomEvent<{vehicleId?:string}>).detail||{};if(String(d.vehicleId||'')==='first-repair-car'){repairCar.userData.broken=false;firstJourneyBeacon.visible=false;setMessage('REPAIR VERIFIED • 5-SEAT CAR READY • driver + front passenger + 3 rear passengers • Tap ENTER VEHICLE.')}};addEventListener('tryamm:streetverse-vehicle-repaired',onVehicleRepaired)
  const onSchoolTravel=()=>{if(activeCar){setMessage('SCHOOL ROUTE • park and exit your vehicle first.');return}avatar.position.set(-46,0,48);setMessage('THOMAS JEFFERSON SCHOOL • FRONT ENTRANCE • walk forward into the campus.');window.dispatchEvent(new CustomEvent('tryamm:school-campus-route-arrived',{detail:{campusId:'thomas-jefferson-legacy-campus',x:-46,z:48,source:'streetverse-mobile-menu'}}))};addEventListener('tryamm:school-route-request',onSchoolTravel)
  const onWestSideRoute=(e:Event)=>{const d=(e as CustomEvent<{x?:number;z?:number;missionId?:string}>).detail||{};if(activeCar){setMessage('MISSION ROUTE • park and exit your vehicle first.');return}const x=clamp(Number(d.x||0)),z=clamp(Number(d.z||0));if(!canTraverse(x,z)){setMessage('MISSION ROUTE • objective entrance is blocked; routing to the nearest walkable point.');avatar.position.set(clamp(x+4),0,clamp(z+4))}else avatar.position.set(x,0,z);setMessage('WEST SIDE OBJECTIVE • '+String(d.missionId||'mission').replaceAll('-',' ').toUpperCase());window.dispatchEvent(new CustomEvent('tryamm:west-side-route-arrived',{detail:{missionId:d.missionId,x:avatar.position.x,z:avatar.position.z,source:'streetverse-mobile-world'}}))};addEventListener('tryamm:west-side-route-request',onWestSideRoute)
  const onDropToPlayer=(e:Event)=>{const d=(e as CustomEvent<{x?:number;z?:number;consent?:boolean;userId?:string}>).detail||{};if(!d.consent||!Number.isFinite(Number(d.x))||!Number.isFinite(Number(d.z)))return;if(activeCar){setMessage('DROP-IN READY • exit your vehicle, then request the player again.');return}const x=clamp(Number(d.x)+2.2),z=clamp(Number(d.z)+2.2);if(!canTraverse(x,z)){setMessage('DROP-IN BLOCKED • target is inside restricted geometry; move the host to a walkable area.');return}avatar.position.set(x,0,z);const place=nearestChicagoPlace(avatar.position.x,avatar.position.z);setMessage(`DROP-IN COMPLETE • ${place?.label||'Chicago'} • grid ${worldToChicagoGridCell(avatar.position.x,avatar.position.z)}`);window.dispatchEvent(new CustomEvent('tryamm:streetverse-drop-complete',{detail:{userId:d.userId,x:avatar.position.x,z:avatar.position.z,place:place?.id,gridCell:worldToChicagoGridCell(avatar.position.x,avatar.position.z),consent:true}}))};addEventListener('tryamm:streetverse-drop-to-player',onDropToPlayer)
  const onHeroDialogue=()=>{heroConversationUntil=performance.now()+6500;const prompt=interactionRef.current;if(prompt){const dx=prompt.x-avatar.position.x,dz=prompt.z-avatar.position.z;heroConversationFocusYaw=THREE.MathUtils.clamp(Math.atan2(dx,dz)-avatar.rotation.y,-.48,.48)}else heroConversationFocusYaw=0;window.dispatchEvent(new CustomEvent('tryamm:bj-v4-conversation-state',{detail:{active:true,until:heroConversationUntil,focusYaw:heroConversationFocusYaw,source:'streetverse-dialogue'}}))}
  addEventListener('tryamm:streetverse-npc-dialogue',onHeroDialogue)
  const onLiveTalkLevel=(event:Event)=>{const d=(event as CustomEvent<{characterId?:string;level?:number}>).detail||{};if(d.characterId&&d.characterId!==STREETVERSE_HERO_CHARACTER_ID)return;heroLiveTalkLevel=THREE.MathUtils.clamp(Number(d.level||0),0,1);if(heroLiveTalkLevel>.025)heroConversationUntil=Math.max(heroConversationUntil,performance.now()+450)}
  addEventListener('tryamm:bj-live-talk-level',onLiveTalkLevel)
  const onAffectVisual=(event:Event)=>{const d=(event as CustomEvent<{characterId?:string;breathing?:number;posture?:string}>).detail||{};if(d.characterId&&d.characterId!==STREETVERSE_HERO_CHARACTER_ID)return;heroAffectBreathing=THREE.MathUtils.clamp(Number(d.breathing??.15),0,1);heroAffectPosture=String(d.posture||'neutral')}
  addEventListener('tryamm:character-affect-visual',onAffectVisual)
  const onBodyEffects=(event:Event)=>{const d=(event as CustomEvent<{characterId?:string;movementScale?:number;sprintAllowed?:boolean;breathing?:number;posture?:string}>).detail||{};if(d.characterId&&d.characterId!==STREETVERSE_HERO_CHARACTER_ID)return;heroBodyMovementScale=THREE.MathUtils.clamp(Number(d.movementScale??1),.5,1);heroSprintAllowed=d.sprintAllowed!==false;if(Number.isFinite(Number(d.breathing)))heroAffectBreathing=Math.max(heroAffectBreathing,THREE.MathUtils.clamp(Number(d.breathing),0,1));if(d.posture&&String(d.posture)!=='neutral')heroAffectPosture=String(d.posture)}
  addEventListener('tryamm:character-body-effects',onBodyEffects)
  const onThreatAction=(event:Event)=>{const d=(event as CustomEvent<{characterId?:string;action?:string;kind?:string}>).detail||{};if(d.characterId&&d.characterId!==STREETVERSE_HERO_CHARACTER_ID)return;const kind=String(d.kind||'incident').toLowerCase();window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:`Threat response: ${String(d.action||'assess')} for ${kind}`}}));if(kind.includes('gunshot')||kind.includes('shooting')||kind.includes('shot-fired'))window.dispatchEvent(new CustomEvent('tryamm:circle-park-safety-incident',{detail:{kind:'gunshot',x:avatar.position.x,z:avatar.position.z,source:'streetverse-threat-response'}}))}
  addEventListener('tryamm:streetverse-threat-action',onThreatAction)
  const onWorldConsequenceOffer=(event:Event)=>{const mission=(event as CustomEvent<StreetVerseWorldConsequenceMission>).detail;if(!mission?.id)return;activeWorldMission=mission;worldMissionStarted=false;worldConsequenceBeacon.position.set(mission.x,0,mission.z);worldConsequenceBeacon.visible=true;const focus=activeCar||avatar;if(!firstJourneyActive)setMissionGuide({id:mission.id,label:mission.title,distance:Math.round(Math.hypot(mission.x-focus.position.x,mission.z-focus.position.z)),bearing:compassBearing(mission.x-focus.position.x,mission.z-focus.position.z)});setMessage(firstJourneyActive?`WORLD EVENT QUEUED • ${mission.title} • finish First Journey first.`:`WORLD EVENT • ${mission.title} • tap mission to respond.`);window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:`${mission.title} • environmental response mission available`}}))}
  const onWorldMissionStart=(event:Event)=>{const d=(event as CustomEvent<{missionId?:string;id?:string}>).detail||{};const id=String(d.missionId||d.id||'');if(!activeWorldMission||id!==activeWorldMission.id)return;worldMissionStarted=true;setMessage(`MISSION ACTIVE • ${activeWorldMission.objective}`)}
  const clearWorldMission=(reason:string)=>{if(!activeWorldMission)return;worldMissionStarted=false;activeWorldMission=null;worldConsequenceBeacon.visible=false;setMissionGuide(null);if(reason)setMessage(reason)}
  const onWorldMissionExpired=(event:Event)=>{const d=(event as CustomEvent<{id?:string}>).detail||{};if(activeWorldMission&&d.id===activeWorldMission.id)clearWorldMission('WORLD EVENT CLEARED • conditions improved.')}
  const onWorldConsequenceReward=(event:Event)=>{const d=(event as CustomEvent<{missionId?:string;reward?:number;xp?:number}>).detail||{};if(!activeWorldMission||d.missionId!==activeWorldMission.id)return;const cash=Math.max(0,Number(d.reward||0)),xp=Math.max(0,Number(d.xp||0));useGameStore.getState().earnCash(cash);useGameStore.getState().earnXp(xp);window.dispatchEvent(new CustomEvent('tryamm:reel-moment',{detail:{kind:'world-consequence-complete',missionId:d.missionId,reward:cash,xp,source:'streetverse-mobile-world'}}));window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:`WORLD RESPONSE COMPLETE • +${cash} • +${xp} XP`}}));clearWorldMission(`WORLD RESPONSE COMPLETE • +${cash} • +${xp} XP`)}
  const onEnvironmentSense=(event:Event)=>{const d=(event as CustomEvent<{hapticIntensity?:number;severity?:number;kind?:string;windIntensity?:number;gustIntensity?:number;windDirection?:number}>).detail||{};environmentWindIntensity=THREE.MathUtils.clamp(Number(d.windIntensity||0),0,1);environmentGustIntensity=THREE.MathUtils.clamp(Number(d.gustIntensity||0),0,1);environmentWindDirection=((Number(d.windDirection||0)%360)+360)%360;const intensity=THREE.MathUtils.clamp(Number(d.hapticIntensity||0),0,1),now=performance.now();if(intensity>.42&&now-lastEnvironmentHapticAt>2200){lastEnvironmentHapticAt=now;try{if(typeof navigator.vibrate==='function')navigator.vibrate(intensity>.75?[18,50,24]:[12])}catch{};window.dispatchEvent(new CustomEvent('tryamm:environment-feedback',{detail:{kind:d.kind,severity:d.severity,hapticAttempted:true,windDirection:environmentWindDirection,source:'streetverse-mobile-world'}}))}}
  addEventListener('tryamm:world-consequence-mission-offer',onWorldConsequenceOffer)
  addEventListener('tryamm:streetverse-mission-start',onWorldMissionStart)
  addEventListener('tryamm:world-consequence-mission-expired',onWorldMissionExpired)
  addEventListener('tryamm:world-consequence-reward',onWorldConsequenceReward)
  addEventListener('tryamm:streetverse-environment-sense',onEnvironmentSense)
  queueMicrotask(()=>{window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-breakdown',{detail:{vehicleId:'first-repair-car',label:'Repair Mission Car',reason:'starter repair mission',severity:'minor'}}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-repair-kit-acquired',{detail:{vehicleId:'first-repair-car',repairKitId:'starter-repair-kit'}}))})
  const resize=()=>{const w=mount.clientWidth||innerWidth,h=mount.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix()};resize();addEventListener('resize',resize)
  const key=(e:KeyboardEvent,v:boolean)=>{const k=e.key.toLowerCase();if(k==='w'||k==='arrowup')input.current.up=v;if(k==='s'||k==='arrowdown')input.current.down=v;if(k==='a'||k==='arrowleft')input.current.left=v;if(k==='d'||k==='arrowright')input.current.right=v;if(v&&k==='e'&&!e.repeat){e.preventDefault();activateCurrentInteraction()}};const kd=(e:KeyboardEvent)=>key(e,true),ku=(e:KeyboardEvent)=>key(e,false);addEventListener('keydown',kd);addEventListener('keyup',ku)
  const resetAllMovement=()=>{analogInput.current={x:0,y:0};directTouchInput.current={up:false,down:false,left:false,right:false};input.current={up:false,down:false,left:false,right:false};if(joystickKnobRef.current)joystickKnobRef.current.style.transform='translate3d(0,0,0)'}
  const onWindowBlur=()=>resetAllMovement()
  const onVisibilityChange=()=>{if(document.hidden)resetAllMovement()}
  addEventListener('blur',onWindowBlur);document.addEventListener('visibilitychange',onVisibilityChange)
  const onTouch=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};const throttle=THREE.MathUtils.clamp(Number(d.throttle||0),0,1),brake=THREE.MathUtils.clamp(Number(d.brake||0),0,1),steer=THREE.MathUtils.clamp(Number(d.steer||0),-1,1);analogInput.current={x:steer,y:brake-throttle};input.current.up=throttle>.05;input.current.down=brake>.05;input.current.left=steer<-.08;input.current.right=steer>.08;if(d.exit)exitVehicle()}
  const onMobileMovement=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};directTouchInput.current={up:Boolean(d.up),down:Boolean(d.down),left:Boolean(d.left),right:Boolean(d.right)};input.current={...directTouchInput.current};reportInput('mobile-movement')}
  const onWorldInput=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{},move=d.move||{},x=THREE.MathUtils.clamp(Number(move.x||0),-1,1),y=THREE.MathUtils.clamp(Number(move.y||0),-1,1);analogInput.current={x,y};input.current.up=y<-.08;input.current.down=y>.08;input.current.left=x<-.08;input.current.right=x>.08;if(d.interact)activateCurrentInteraction();reportInput('world-input')}
  const reportInput=(source:string)=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-input-health',{detail:{source,connected:true,at:new Date().toISOString()}}))
  const joystickWatchdog=window.setInterval(()=>{if(joystickLastMoveAt.current>0&&performance.now()-joystickLastMoveAt.current>900){joystickLastMoveAt.current=0;analogInput.current={x:0,y:0};directTouchInput.current={up:false,down:false,left:false,right:false};input.current={up:false,down:false,left:false,right:false};if(joystickKnobRef.current)joystickKnobRef.current.style.transform='translate3d(0,0,0)'}},250)
  addEventListener('tryamm:streetverse-vehicle-input',onTouch);addEventListener('tryamm:streetverse-mobile-movement',onMobileMovement);addEventListener('tryamm:streetverse-world-input',onWorldInput)
  const cameraFollowTarget=new THREE.Vector3()
  const cameraObstacles=buildingColliders.map(b=>new THREE.Box3(new THREE.Vector3(b.minX,0,b.minZ),new THREE.Vector3(b.maxX,45,b.maxZ)))
  const clearCamera=createStreetVerseCameraClearance(cameraObstacles,externalCollisionBoxes)
  let last=performance.now(),raf=0,saveAt=0,lastPromptAt=0,lastMissionGuideAt=0,lastPositionEventAt=0,lastWorldClockAt=0,lastQualityShiftAt=0,lastMovementBlockedAt=0,frameBudgetEwma=16.7
  let movementCertified=false
  const movementEvidenceOrigin=avatar.position.clone()
  let qseTier:'full'|'balanced'|'lite'='full'
  const applyQseTier=(tier:'full'|'balanced'|'lite')=>{if(tier===qseTier)return;qseTier=tier;const ratioCap=tier==='full'?1.35:tier==='balanced'?1.1:.9;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,ratioCap));resize();window.dispatchEvent(new CustomEvent('tryamm:streetverse-qse-health',{detail:{tier:qseTier,frameBudgetMs:Number(frameBudgetEwma.toFixed(2)),pixelRatio:renderer.getPixelRatio(),adaptiveResolution:true,at:new Date().toISOString()}}))}
  const animateEnvironmentalWind=(now:number)=>{
    const wind=THREE.MathUtils.clamp(environmentWindIntensity*.68+environmentGustIntensity*.52,0,1)
    const angle=THREE.MathUtils.degToRad(environmentWindDirection),wx=Math.sin(angle),wz=Math.cos(angle),pulse=.55+.45*Math.sin(now*.0027)
    const treeSway=wind*(.035+.055*pulse)
    streetTreePositions.forEach(([x,z],i)=>{const scale=.86+(i%5)*.055,phase=Math.sin(now*.0022+i*.83)*treeSway;treeMatrix.position.set(x,1.1,z);treeMatrix.rotation.set(wz*phase*.30,(i%8)*.36,wx*phase*.30);treeMatrix.scale.set(scale,scale,scale);treeMatrix.updateMatrix();streetTreeTrunks.setMatrixAt(i,treeMatrix.matrix);treeMatrix.position.set(x+wx*wind*.10,3.15,z+wz*wind*.10);treeMatrix.rotation.set(wz*(treeSway+phase),(i%7)*.41,wx*(treeSway+phase));treeMatrix.scale.set(scale*.92,scale*(.86+(i%3)*.08),scale*.92);treeMatrix.updateMatrix();streetTreeCrowns.setMatrixAt(i,treeMatrix.matrix)})
    streetTreeTrunks.instanceMatrix.needsUpdate=true;streetTreeCrowns.instanceMatrix.needsUpdate=true
    for(const [index,object] of [...fallbackWindLocs,...nativeWindLocs].entries()){const base=object.userData.windBaseRotation as {x:number;y:number;z:number}|undefined;if(!base)continue;const sway=wind*(.06+.08*Math.sin(now*.004+index*.61));object.rotation.x=base.x+wz*sway*.45;object.rotation.y=base.y;object.rotation.z=base.z-wx*sway}
    grillSmoke.forEach((puff,i)=>{const baseX=Number(puff.userData.baseX??puff.position.x),baseZ=Number(puff.userData.baseZ??puff.position.z),rise=((now*.001+i*.17)%1);puff.position.x=baseX+wx*wind*(.4+rise*1.5);puff.position.z=baseZ+wz*wind*(.4+rise*1.5)})
    windDebris.forEach((scrap,i)=>{const active=wind>.22;scrap.visible=active;if(!active)return;const speed=.012+wind*.045,seed=Number(scrap.userData.windSeed||0);scrap.position.x+=wx*speed*(1+environmentGustIntensity*.8);scrap.position.z+=wz*speed*(1+environmentGustIntensity*.8);scrap.position.y=.08+Math.abs(Math.sin(now*.004+seed))*wind*.34;scrap.rotation.z+=.015+wind*.04;scrap.rotation.y+=.01;if(Math.abs(scrap.position.x)>78||Math.abs(scrap.position.z)>78){scrap.position.set(-wx*65+(i%4)*3,.08,-wz*65+Math.floor(i/4)*4)}})
  }
    const tick=(now:number)=>{const frameMs=Math.min(80,Math.max(0,now-last)),dt=Math.min(.05,frameMs/1000);last=now;frameBudgetEwma=frameBudgetEwma*.92+frameMs*.08;if(now-lastQualityShiftAt>5000){if(frameBudgetEwma>34&&qseTier!=='lite'){applyQseTier('lite');lastQualityShiftAt=now}else if(frameBudgetEwma>24&&qseTier==='full'){applyQseTier('balanced');lastQualityShiftAt=now}else if(frameBudgetEwma<17.5&&qseTier==='lite'){applyQseTier('balanced');lastQualityShiftAt=now}else if(frameBudgetEwma<16.8&&qseTier==='balanced'){applyQseTier('full');lastQualityShiftAt=now}};const analog=analogInput.current;if(Math.abs(analog.x)>.05||Math.abs(analog.y)>.05){input.current={up:analog.y<-.05,down:analog.y>.05,left:analog.x<-.05,right:analog.x>.05}}else if(directTouchInput.current.up||directTouchInput.current.down||directTouchInput.current.left||directTouchInput.current.right)input.current={...directTouchInput.current};const moving=input.current.up||input.current.down||input.current.left||input.current.right||Boolean(activeCar&&oneHandCruise);if(activeCar){const analogSteer=Math.abs(analog.x)>.035?analog.x:((input.current.right?1:0)-(input.current.left?1:0));const analogThrottle=Math.abs(analog.y)>.035?-analog.y:(input.current.down?-1:(input.current.up?1:0));const requestedThrottle=oneHandCruise&&Math.abs(analogThrottle)<.05?.58:THREE.MathUtils.clamp(analogThrottle,-1,1);const maxForward=(oneHandDriveAssist?10.5:15.5)*weatherDriveMultiplier,maxReverse=(oneHandDriveAssist?5.5:7.5)*weatherDriveMultiplier,targetSpeed=requestedThrottle>=0?requestedThrottle*maxForward:requestedThrottle*maxReverse;const response=Math.abs(targetSpeed)>Math.abs(driveSpeed)?(oneHandDriveAssist?2.6:3.1):(oneHandDriveAssist?4.2:5.0);driveSpeed=THREE.MathUtils.lerp(driveSpeed,targetSpeed,Math.min(1,response*dt));if(Math.abs(requestedThrottle)<.035)driveSpeed=THREE.MathUtils.lerp(driveSpeed,0,Math.min(1,4.8*dt));if(Math.abs(driveSpeed)<.06)driveSpeed=0;driveSteer=THREE.MathUtils.lerp(driveSteer,THREE.MathUtils.clamp(analogSteer,-1,1),Math.min(1,(oneHandDriveAssist?4.0:5.4)*dt));const speedRatio=THREE.MathUtils.clamp(Math.abs(driveSpeed)/Math.max(.1,maxForward),0,1),turnRate=THREE.MathUtils.lerp(oneHandDriveAssist?1.05:1.24,oneHandDriveAssist ? .52 : .64,speedRatio);if(Math.abs(driveSpeed)>.12)driveHeading+=driveSteer*turnRate*dt*(driveSpeed<0?-1:1);activeCar.rotation.y=driveHeading;const driveNextX=clamp(activeCar.position.x+Math.cos(driveHeading)*driveSpeed*dt),driveNextZ=clamp(activeCar.position.z-Math.sin(driveHeading)*driveSpeed*dt);if(canDrive(driveNextX,activeCar.position.z))activeCar.position.x=driveNextX;else driveSpeed*=.35;if(canDrive(activeCar.position.x,driveNextZ))activeCar.position.z=driveNextZ;else driveSpeed*=.35;avatar.position.set(activeCar.position.x,0,activeCar.position.z);checkMissionProximity(avatar.position.x,avatar.position.z)}else if(underwaterPool.isActive()){}else{const s=11*heroBodyMovementScale*(1-adultImpairment*.18)*dt;const ax=Math.abs(analog.x)>.05?analog.x:((input.current.right?1:0)-(input.current.left?1:0));const ay=Math.abs(analog.y)>.05?analog.y:((input.current.down?1:0)-(input.current.up?1:0));const walkNextX=clamp(avatar.position.x+ax*s),walkNextZ=clamp(avatar.position.z+ay*s);const escapingExternal=blockedByExternal(avatar.position.x,avatar.position.z);const canWalk=(x:number,z:number)=>canTraverseStatic(x,z)&&(escapingExternal||!blockedByExternal(x,z));const xOpen=canWalk(walkNextX,avatar.position.z),zOpen=canWalk(avatar.position.x,walkNextZ);if(xOpen)avatar.position.x=walkNextX;if(zOpen)avatar.position.z=walkNextZ;if((Math.abs(ax)+Math.abs(ay)>.05)&&!xOpen&&!zOpen&&now-lastMovementBlockedAt>900){lastMovementBlockedAt=now;setMessage('PATH BLOCKED • use the road, sidewalk, or bridge to move around this obstacle.');window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:'Path blocked. Move around the obstacle using the road, sidewalk, or bridge.'}}))}if(Math.abs(ax)+Math.abs(ay)>.05)avatar.rotation.y=Math.atan2(ax,ay);checkMissionProximity(avatar.position.x,avatar.position.z)}syncNativeRepairCar();const focus=activeCar||avatar;const heroTalking=now<heroConversationUntil&&!activeCar&&!underwaterPool.isActive();const camY=activeCar?6.8:(heroTalking?3.5:5.6),camBack=activeCar?12.5:(heroTalking?5.8:9.2);const accessibilityCamY=activeCar?8.4:(heroTalking?4.8:5.8),accessibilityCamBack=activeCar?14.5:(heroTalking?6.2:8.8);const accessibilityReadableCamera=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;const finalCamY=accessibilityReadableCamera?accessibilityCamY:camY,finalCamBack=accessibilityReadableCamera?accessibilityCamBack:camBack;const vehicleCameraApplied=Boolean(activeCar&&applyVehicleCamera(activeCar,now));const playerFirstPersonApplied=Boolean(!activeCar&&playerCameraMode==='first-person'&&applyFirstPersonCamera(avatar));const playerThirdPersonApplied=Boolean(!activeCar&&playerCameraMode==='third-person'&&applyThirdPersonShoulderCamera(avatar));if(!vehicleCameraApplied&&!playerFirstPersonApplied&&!playerThirdPersonApplied){clearCamera(focus.position,finalCamY,finalCamBack,cameraFollowTarget);if(cameraObstacles.some(box=>box.containsPoint(camera.position)))camera.position.copy(cameraFollowTarget);else camera.position.lerp(cameraFollowTarget,heroTalking?.19:.14);camera.lookAt(focus.position.x,activeCar?1.25:(heroTalking?1.4:1.15),focus.position.z-(activeCar?3.0:(heroTalking?.45:1.05)));}
mobileWorldLabels.forEach(label=>{const distance=camera.position.distanceTo(label.position),material=label.material as THREE.SpriteMaterial,fade=THREE.MathUtils.clamp((distance-7)/8,0,.90);label.visible=distance>6.25;material.opacity=fade})
underwaterPool.tick(now);train.position.x=-92+((now*.018)%184);trafficLife.tick(now);pedestrianRoutines.tick(now);insectEcology.tick(now);rodentEcology.tick(now);{
    const age=Math.max(0,now-circleParkActivityStartedAt),active=age<2600,phase=age*.006
    if(activeCircleParkActivity==='basketball'&&active){
      if(basketballMove==='dunk'){
        const t=Math.min(1,age/1250),arc=Math.sin(Math.PI*t),orbit=Math.sin(Math.PI*2*t),orbit2=Math.cos(Math.PI*2*t)
        if(basketballDunkStyle==='windmill'){basketballBall.position.set(-48+orbit*1.25,.6+arc*3.45,61+t*3.8)}
        else if(basketballDunkStyle==='reverse-windmill'){basketballBall.position.set(-48-orbit*1.45,.6+arc*3.55,64.7-t*3.8)}
        else if(basketballDunkStyle==='360'){basketballBall.position.set(-48+orbit*1.4,.6+arc*3.6,61+t*3.7+orbit2*.45)}
        else if(basketballDunkStyle==='reverse'){basketballBall.position.set(-48+Math.sin(Math.PI*t)*.75,.6+arc*3.2,64.8-t*3.9)}
        else if(basketballDunkStyle==='double-clutch'){basketballBall.position.set(-48,.6+arc*(t<.55?3.9:3.2),61+t*3.65+Math.sin(Math.PI*2*t)*.45)}
        else if(basketballDunkStyle==='self-alley-oop'){basketballBall.position.set(-48+Math.sin(Math.PI*t)*.9,.8+Math.sin(Math.PI*Math.min(1,t*1.25))*4.7,60.2+t*4.5)}
        else if(basketballDunkStyle==='teammate-alley-oop'){basketballBall.position.set(-52+t*4,.9+arc*4.4,60+t*4.7)}
        else if(basketballDunkStyle==='off-backboard-alley-oop'){const bounce=t<.55?t/.55:(1-t)/.45;basketballBall.position.set(-48,.8+Math.max(0,bounce)*4.6,59.4+t*5.3)}
        else if(basketballDunkStyle==='tomahawk-one-hand'){basketballBall.position.set(-48,.7+arc*4.0,61+t*3.9-Math.sin(Math.PI*t)*.35)}
        else if(basketballDunkStyle==='ft-one-hand-1985'){basketballBall.position.set(-48,.65+arc*4.35,55.3+t*9.2)}
        else if(basketballDunkStyle==='ft-double-clutch-1988'){basketballBall.position.set(-48+Math.sin(Math.PI*t)*.45,.7+arc*4.55,55.1+t*9.4-Math.sin(Math.PI*2*t)*.28)}
        else{basketballBall.position.set(-48,.6+arc*3.35,61+t*3.7)}
      }
      else if(basketballMove==='layup'){basketballBall.position.x=-48+Math.sin(Math.min(Math.PI,age*.003))*1.2;basketballBall.position.y=.55+Math.sin(Math.min(Math.PI,age*.003))*2.6;basketballBall.position.z=61+Math.min(3.1,age*.0015)}
      else if(basketballMove==='three'){basketballBall.position.x=-48+Math.sin(Math.min(Math.PI,age*.0022))*2.5;basketballBall.position.y=.55+Math.sin(Math.min(Math.PI,age*.0022))*4.2;basketballBall.position.z=61+Math.min(4.4,age*.0018)}
      else{basketballBall.position.y=.5+Math.abs(Math.sin(phase))*3.1;basketballBall.position.z=61+Math.min(3.4,age*.0014)}
    }
    else{basketballBall.position.set(-48,.5,61)}
    if(activeCircleParkActivity==='tennis'&&active){tennisBall.position.x=22+Math.sin(phase*1.4)*7.2;tennisBall.position.y=.4+Math.abs(Math.sin(phase*2.1))*1.2}
    else{tennisBall.position.set(18,.45,61)}
    const swimActive=activeCircleParkActivity==='swimming'&&active
    ;(circleParkPool.material as THREE.MeshStandardMaterial).opacity=swimActive?.68+.10*Math.sin(phase):.78
    securityPatrols.forEach((patrol,i)=>{
      const patrolPhase=(now*.00018+i*.47)%1
      const a=patrolPhase*Math.PI*2
      const centerX=i===0?-37:-27,centerZ=i===0?47:61,radiusX=i===0?7:5,radiusZ=i===0?5:7
      const nextX=centerX+Math.cos(a)*radiusX,nextZ=centerZ+Math.sin(a)*radiusZ
      patrol.rotation.y=Math.atan2(nextX-patrol.position.x,nextZ-patrol.position.z)
      patrol.position.x=THREE.MathUtils.lerp(patrol.position.x,nextX,.06)
      patrol.position.z=THREE.MathUtils.lerp(patrol.position.z,nextZ,.06)
      patrol.userData.patrolIndex=i
    })
    const grillActive=activeCircleParkActivity==='barbecue'&&active
    grillSmoke.forEach((puff,i)=>{const mat=puff.material as THREE.MeshBasicMaterial;mat.opacity=grillActive?Math.max(0,.34-((age*.001+i*.18)%1)*.3):0;puff.position.y=1.45+i*.35+(grillActive?(age*.001+i*.15)%1:0)})
  }
    if(rescueFireRoot.visible){
      const fireScale=.72+rescueBurnProgress/100*1.45
      rescueFlames.forEach((flame,i)=>{const pulse=.78+.28*Math.sin(now*.012+i*.9);flame.scale.set(fireScale*pulse,fireScale*(.82+.32*Math.sin(now*.015+i)),fireScale*pulse);flame.rotation.y+=.025})
      rescueSmoke.forEach((puff,i)=>{const rise=((now*.00022+i*.17)%1);puff.position.y=2.5+rise*6.5;puff.position.x=(i%2-.5)*1.1+Math.sin(now*.0015+i)*.55;(puff.material as THREE.MeshBasicMaterial).opacity=.34*(1-rise)})
    }
  cars.forEach((c,i)=>{if(c===activeCar||c.userData.playerDrivable||c.userData.userDriven)return;const axis:StreetVerseTrafficAxis=c.userData.trafficAxis==='z'?'z':'x',direction:StreetVerseTrafficDirection=Number(c.userData.trafficDirection)<0?-1:1,speed=Number(c.userData.trafficSpeed||10),coordinate=axis==='z'?c.position.z:c.position.x,signalMultiplier=trafficLife.getTrafficMultiplier(axis,coordinate,direction,now),delta=direction*speed*dt*weatherDriveMultiplier*signalMultiplier;let next=coordinate+delta;if(next>84)next=-84;if(next<-84)next=84;if(axis==='z'){c.position.z=next;c.rotation.y=direction>0?-Math.PI/2:Math.PI/2}else{c.position.x=next;c.rotation.y=direction>0?0:Math.PI}c.userData.signalMultiplier=signalMultiplier;c.userData.trafficIndex=i});if(now-lastPromptAt>125){lastPromptAt=now;updateContextPrompt()}if(now-lastMissionGuideAt>350){lastMissionGuideAt=now;if(activeWorldMission&&worldMissionStarted){const focus=activeCar||avatar,dx=activeWorldMission.x-focus.position.x,dz=activeWorldMission.z-focus.position.z,distance=Math.hypot(dx,dz);setMissionGuide({id:activeWorldMission.id,label:activeWorldMission.title,distance:Math.round(distance),bearing:compassBearing(dx,dz)});if(distance<=7){const id=activeWorldMission.id;worldMissionStarted=false;setMessage('WORLD TARGET REACHED • resolving environmental response.');window.dispatchEvent(new CustomEvent('tryamm:world-consequence-mission-complete',{detail:{id,source:'streetverse-mobile-world'}}))}}else if(firstJourneyActive){if(!repairedState()){const dx=repairCar.position.x-avatar.position.x,dz=repairCar.position.z-avatar.position.z;setMissionGuide({id:'iphone-first-journey',label:'REPAIR CAR',distance:Math.round(Math.hypot(dx,dz)),bearing:compassBearing(dx,dz)})}else if(activeCar){const dx=firstJourneyDriveTarget.x-activeCar.position.x,dz=firstJourneyDriveTarget.z-activeCar.position.z,distance=Math.hypot(dx,dz);if(!firstJourneyDrove&&distance<=8){firstJourneyDrove=true;firstJourneyGuide.visible=true;firstJourneyBeacon.position.set(firstJourneyGuide.position.x,0,firstJourneyGuide.position.z);setMessage('ROOSEVELT ROAD REACHED ✓ • stop and EXIT VEHICLE to meet the guide.');window.dispatchEvent(new CustomEvent('tryamm:streetverse-first-journey-drive-complete',{detail:{missionId:'iphone-first-journey',from:'circle-park',to:'roosevelt-road',x:activeCar.position.x,z:activeCar.position.z,source:'streetverse-mobile-world'}}))}setMissionGuide({id:'iphone-first-journey',label:firstJourneyDrove?'EXIT AT ROOSEVELT':'DRIVE TO ROOSEVELT',distance:Math.round(distance),bearing:firstJourneyDrove?'STOP + EXIT':compassBearing(dx,dz),objective:'Drive the repaired car from Circle Park to the Roosevelt Road beacon.'})}else if(firstJourneyDrove){const dx=firstJourneyGuide.position.x-avatar.position.x,dz=firstJourneyGuide.position.z-avatar.position.z;setMissionGuide({id:'iphone-first-journey',label:firstJourneyReadyRef.current?'COMPLETE FIRST RIDE':'TALK TO ROOSEVELT GUIDE',distance:Math.round(Math.hypot(dx,dz)),bearing:firstJourneyReadyRef.current?'READY':compassBearing(dx,dz),objective:firstJourneyReadyRef.current?'Complete the mission to record reward and unlock Reel capture.':'Meet the guide after the Circle Park → Roosevelt drive.'})}else{const dx=repairCar.position.x-avatar.position.x,dz=repairCar.position.z-avatar.position.z;setMissionGuide({id:'iphone-first-journey',label:'ENTER REPAIRED CAR',distance:Math.round(Math.hypot(dx,dz)),bearing:compassBearing(dx,dz)})}}else updateMissionGuide()}tickMobileResidentPopulation(residents,now);syncNativeRealism(now,moving);alive.tick(now);fameFans.forEach((fan,i)=>{const visible=!activeCar&&i<fameFanCount;fan.visible=visible;if(!visible)return;const angle=(i/Math.max(1,fameFanCount))*Math.PI*2+now*.00008,radius=4.8+(i%2)*1.15;fan.position.set(avatar.position.x+Math.cos(angle)*radius,Math.sin(now*.004+i)*.025,avatar.position.z+Math.sin(angle)*radius);fan.rotation.y=Math.atan2(avatar.position.x-fan.position.x,avatar.position.z-fan.position.z)});const weatherVisual=weatherRenderer.getVisual();sun.intensity=1.8*weatherVisual.lightMultiplier;hemi.intensity=2.2*weatherVisual.lightMultiplier;weatherRenderer.tick(dt,focus.position);animateEnvironmentalWind(now);visualLife.tick(now,weatherVisual);renderer.render(scene,camera);if(!movementCertified&&avatar.position.distanceToSquared(movementEvidenceOrigin)>.25){movementCertified=true;advanceLiveWorldBuild('movement',true)}if(now-lastPositionEventAt>100){
  lastPositionEventAt=now
  const speed=moving?(activeCar?20:11):0
  const detail={x:avatar.position.x,z:avatar.position.z,speed,mobileLite:true,vehicle:!!activeCar,vehicleType:activeCar?'car':undefined,qseTier}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-position',{detail}))
  window.dispatchEvent(new CustomEvent('tryamm:world-player-signal',{detail:{
    position:{x:avatar.position.x,y:avatar.position.y,z:avatar.position.z},
    activeWorld:'streetverse-chicago',
    activeMission:activeWorldMission?.id||(firstJourneyActive?'iphone-first-journey':undefined),
    uiIntent:interactionRef.current?.kind||undefined,
  }}))
}
if(now-lastWorldClockAt>5000){
  lastWorldClockAt=now
  const hour=new Date().getHours()
  const phase=hour<6?'night':hour<9?'dawn':hour<18?'day':hour<21?'dusk':'night'
  window.dispatchEvent(new CustomEvent('tryamm:world-clock',{detail:{hour,source:'streetverse-mobile-world'}}))
  window.dispatchEvent(new CustomEvent('tryamm:world-day-phase',{detail:{phase,source:'streetverse-mobile-world'}}))
  const weatherState=weatherRenderer.getState()
  if(weatherState){
    const visual=weatherRenderer.getVisual()
    const weather=visual.kind==='storm'?'storm':visual.kind==='rain'?'rain':visual.kind==='fog'?'fog':visual.kind==='clear'?'clear':'clear'
    window.dispatchEvent(new CustomEvent('tryamm:world-weather',{detail:{weather,source:'streetverse-mobile-world'}}))
  }
}if(now-saveAt>1200){saveAt=now;try{const old=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');localStorage.setItem(SAVE_KEY,JSON.stringify({...old,x:avatar.position.x,z:avatar.position.z,updatedAt:new Date().toISOString(),mobileLite:true,vehicle:!!activeCar}))}catch{}}raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);setStatus('MOBILE CITY • CHICAGO ALIVE V6');setMessage(`${residents.length+alive.counts.ambientResidents+visualLife.counts.socialResidents+pedestrianRoutines.counts.crossingResidents} visible residents • ${pedestrianRoutines.counts.crossingResidents} signal-aware crossing residents • ${identityInteraction.counts.interactionTargets} contextual interactions • ${trafficLife.counts.intersections} signalized intersections.`);advanceLiveWorldBuild('mission',missionDefs.length>0);advanceLiveWorldBuild('performance',true);window.dispatchEvent(new CustomEvent('tryamm:streetverse-world-ready',{detail:{mode:'mobile-lite',canvas:true,drivableVehicles:true,residentCount:residents.length+alive.counts.ambientResidents+visualLife.counts.socialResidents+pedestrianRoutines.counts.crossingResidents,vehicleCount:cars.length,parkedVehicleCount:alive.counts.parkedVehicles,treeCount:streetTreePositions.length,cityBlockCount:blocks.length,missionCount:missionDefs.length,storefrontCount:alive.counts.storefronts,streetPropCount:alive.counts.streetProps+visualLife.counts.benches+visualLife.counts.curbBins+visualLife.counts.streetSigns,crosswalkStripeCount:alive.counts.crosswalkStripes,facadeAccentCount:visualLife.counts.facadeAccents,awningCount:visualLife.counts.awnings,busShelterCount:visualLife.counts.busShelters,socialResidentCount:visualLife.counts.socialResidents,crossingResidentCount:pedestrianRoutines.counts.crossingResidents,pedestrianWalkSignalCount:pedestrianRoutines.counts.walkSignals,pedestrianRoutineTypeCount:pedestrianRoutines.counts.routineTypes,pedestriansObeySignals:true,trafficIntersectionCount:trafficLife.counts.intersections,trafficSignalCount:trafficLife.counts.signalHeads,trafficObeysSignals:true,identityZoneCount:identityInteraction.counts.identityZones,interactionTargetCount:identityInteraction.counts.interactionTargets,districtMarkerCount:identityInteraction.counts.districtMarkers,ctaIdentityMarkers:identityInteraction.counts.ctaMarkers,contextualInteraction:true,chicagoIdentityPass:'v5',pedestrianLifePass:'v6',livingCity:true,visibleCityParity:'lightweight',visualDensity:'chicago-visual-v2',visualLifeDensity:'chicago-visual-v3',trafficLifeDensity:'chicago-traffic-v1',aliveDensity:'alive-v1',nightLighting:true,skylineTowerCount:skylineDefs.length,streetLampCount:lampPositions.length,fameReactiveCrowds:true,qsePerformanceGovernor:true,qseAdaptiveResolution:true,generatedGlbVisualAuthority:true,worldBuilderAssetFoundryLive:Boolean(worldBuild),worldBuilderStage:worldBuild?.stage||'unavailable',worldBuilderPublishable:worldBuild?canPublishWorld(worldBuild):false,nativeAssetGenerator:'tryamm-native-asset-foundry',nativeHumanoidRigAnimation:true,nativeCharacterRealismV4Max:true,bjCharacterRealismV4:true,bjFallbackRealismV4:true,bjConversationFaceMotion:true,bjConversationCamera:true,bjEyeFocus:true,bjHeadArchitectureV5:true,bjHotSwappableHead:true,bjPhotoMatchedHeadRequested:Boolean(bjPhotoMatch),bjPhotoMatchedHeadReady:bjPhotoMatchReady,bjPhotoMatchedAssetId:BJ_PHOTOMATCH_ASSET.id,bjPhotoReferenceTextureAuthority:Boolean(bjPhotoMatch),bjMeshyV6Priority:true,bjMeshyV6AssetId:BJ_MESHY_V6_ASSET.id,bjMeshyV6Active:Boolean(bjMeshyHero),bjFacialMorphChannelsV5:true,bjLiveMicLipSync:true,bjSpokenDialogue:true,bjFacialExpressionsV5:true,bjEmotionalIntelligenceV5:true,bjBlushAffect:true,bjPupilAffect:true,bjAffectBreathing:true,bjAffectPosture:true,bjBodyNeeds:true,bjThreatResponseAI:true,bjCivilianSafetyPriority:true,worldConsequenceEngine:true,weatherToMissionConsequences:true,environmentSenseFeedback:true,dynamicWorldEventMission:true,windReactiveTrees:true,windReactiveLocs:true,windReactiveSmoke:true,windReactiveDebris:true,nativeHumanoidBlinking:true,nativeHumanoidBreathing:true,nativeHumanoidEyeSaccade:true,nativeHumanoidExpressionMicroMotion:true,nativeHumanoidFacialLodMeters:18,namedHeroCharacterId:STREETVERSE_HERO_CHARACTER_ID,namedHeroCharacter:'BJ Stubbs',namedHeroContinuity:true,namedCharacterDevelopment:true,namedCharacterDevelopmentAuthority:'SERVER',nativeResidentVariantCount:nativeResidentCycle.length,nativeResidentReadabilityScaleVariants:nativeResidentVisualScale.length,characterCameraPass:'human-scale-third-person-v3',circleParkRealityLayer:true,circleParkRealityVersion:'reality-max-v2',mobileCameraPass:'closer-third-person-v2',mobileDaylightPass:'bright-circle-park-v1',mobileHudPass:'safe-area-separated-v3',oneHandHudSide:controlSide,circleParkTimeMachineLayer:true,circleParkHistoricalEras:3,circleParkActiveEra:activeCircleParkEra,circleParkHistoricalEvidenceLabels:true,circleParkRealitySource:'public-reference-reconstruction',circleParkAmenityCount:12,insectEcologySpecies:7,insectEcologyVisible:true,urbanRodentSpecies:2,urbanRodentVisibleAtNight:true,resourcePassport:true,pocketDimension:true,pocketDimensionQuickSlots:4,pocketDimensionServerValidatedActions:true,reelCanvasCapture:true,reelMaxSeconds:30,reelMomentMarkers:true,underwaterImmersiveSwimming:true,underwaterStrokeStyles:4,underwaterBubbles:true,underwaterFog:true,circleParkFacadeSystem:'1111-horizontal-glazing-ribbed-concrete',circleParkEntryDrive:true,circleParkHeritageMarker:true,circleParkStreetAnchorCount:CHICAGO_ROAD_CORRIDORS.length,driveActionAlwaysAvailable:true,vehicleTraversal:'road-aware-v2',vehicleControlPass:'stable-analog-v3',twoWayTrafficLanes:true,smoothedVehicleAcceleration:true,speedSensitiveSteering:true,nativeBuildingReplacementCount:nativeBuildings.length,primitiveBuildingFallbackCount:Math.max(0,blocks.length-nativeBuildings.length),playerPositionTelemetryHz:10,interactionPromptHz:8,qseTier,collisionGuard:true,spawnCollisionRecovery:true,joystickPointerCapture:true,joystickBlurFailsafe:true,vehiclePromptRadius:12,missionGuide:true,missionNav:true,missionLabels:true,defaultSpawn:CIRCLE_PARK_SPAWN,gridCell:worldToChicagoGridCell(avatar.position.x,avatar.position.z),nearestPlace:nearestChicagoPlace(avatar.position.x,avatar.position.z)?.id}}))
  return()=>{nativeCancelled=true;bjMeshyHero?.dispose();bjMeshyHero=null;publishedHeroBody?.dispose();publishedHeroBody=null;familyHeroHandle?.dispose();familyHeroHandle=null;meshyResidentHandles.forEach(handle=>handle?.dispose());meshyResidentHandles=Array(12).fill(null);bjPhotoMatch?.dispose();bjPhotoMatch=null;bjHeadRuntime?.dispose();bjHeadRuntime=null;if(nativeLayer){nativeLayer.removeFromParent();disposeNativeAssetLayer(nativeLayer);nativeLayer=null};cancelAnimationFrame(raf);clearInterval(joystickWatchdog);removeEventListener('resize',resize);removeEventListener('keydown',kd);removeEventListener('keyup',ku);removeEventListener('blur',onWindowBlur);document.removeEventListener('visibilitychange',onVisibilityChange);removeEventListener('tryamm:streetverse-vehicle-input',onTouch);removeEventListener('tryamm:streetverse-mobile-movement',onMobileMovement);removeEventListener('tryamm:streetverse-world-input',onWorldInput);removeEventListener('tryamm:streetverse-vehicle-interact',onInteract);removeEventListener('tryamm:streetverse-board-companion',onBoardCompanion);removeEventListener('tryamm:streetverse-leave-companion',onLeaveCompanion);removeEventListener('tryamm:streetverse-vehicle-camera',onVehicleCamera);removeEventListener('tryamm:streetverse-camera-look',onCameraLook);removeEventListener('tryamm:streetverse-toggle-player-camera',onTogglePlayerCamera);removeEventListener('tryamm:streetverse-switch-shoulder',onSwitchShoulder);removeEventListener('tryamm:streetverse-cycle-vehicle-camera',onCycleVehicleCamera);removeEventListener('tryamm:streetverse-vehicle-repaired',onVehicleRepaired);removeEventListener('tryamm:streetverse-drop-to-player',onDropToPlayer);removeEventListener('tryamm:school-route-request',onSchoolTravel);removeEventListener('tryamm:west-side-route-request',onWestSideRoute);if(onPlayerAssetSelect)removeEventListener('tryamm:streetverse-player-asset-select',onPlayerAssetSelect);removeEventListener('tryamm:streetverse-npc-dialogue',onHeroDialogue);removeEventListener('tryamm:bj-live-talk-level',onLiveTalkLevel);removeEventListener('tryamm:character-affect-visual',onAffectVisual);removeEventListener('tryamm:character-body-effects',onBodyEffects);removeEventListener('tryamm:streetverse-threat-action',onThreatAction);removeEventListener('tryamm:world-consequence-mission-offer',onWorldConsequenceOffer);removeEventListener('tryamm:streetverse-mission-start',onWorldMissionStart);removeEventListener('tryamm:world-consequence-mission-expired',onWorldMissionExpired);removeEventListener('tryamm:world-consequence-reward',onWorldConsequenceReward);removeEventListener('tryamm:streetverse-environment-sense',onEnvironmentSense);removeEventListener('tryamm:streetverse-control-mode',onControlMode);removeEventListener('tryamm:streetverse-cruise',onCruise);removeEventListener('tryamm:streetverse-repair-step',onRepairStep);removeEventListener('tryamm:streetverse-vehicle-door',onVehicleDoor);removeEventListener('tryamm:streetverse-first-journey-start',onFirstJourneyStart);removeEventListener('tryamm:streetverse-first-journey-complete',onFirstJourneyComplete);removeEventListener('tryamm:streetverse-weather-state',onWeather);removeEventListener('tryamm:streetverse-fame-state',onFameReaction);removeEventListener('tryamm:streetverse-gameplay-action',onGameplayAction);removeEventListener('tryamm:circle-park-activity',onCircleParkActivity);removeEventListener('tryamm:pool-open',onPoolOpen);removeEventListener('tryamm:senior-commons-open',onSeniorCommonsOpen);removeEventListener('tryamm:circle-park-basketball-play',onCircleParkBasketballPlay);removeEventListener('tryamm:circle-park-time-era',onCircleParkTimeEra);weatherRenderer.dispose();underwaterPool.dispose();reelCapture.dispose();communitySafetyRuntime();residentAccessRuntime();removeEventListener('tryamm:circle-park-access-result',onCircleParkAccessResult);resourcePassportRuntime.dispose();characterDevelopment.dispose();facialExpressions.dispose();emotionalIntelligence.dispose();bodyNeeds.dispose();threatResponse.dispose();aiCafeBridgeRuntime();soundBankRuntime();rescueIncidentRuntime();adultSubstanceRuntime();removeEventListener('tryamm:streetverse-impairment-state',onAdultImpairment);removeEventListener('tryamm:streetverse-structure-fire-state',onStructureFireState);worldConsequences.dispose();rodentEcology.dispose();insectEcology.dispose();identityInteraction.dispose();pedestrianRoutines.dispose();trafficLife.dispose();visualLife.dispose();alive.dispose();disposeMobileResidentPopulation(residents);interactionRef.current=null;setInteractionPrompt(null);fameFans.forEach(fan=>fan.removeFromParent());treeTrunkGeometry.dispose();treeCrownGeometry.dispose();windDebris.forEach(scrap=>scrap.removeFromParent());windDebrisGeometry.dispose();windDebrisMaterial.dispose();lampPoleGeometry.dispose();lampBulbGeometry.dispose();(streetTreeTrunks.material as THREE.Material).dispose();(streetTreeCrowns.material as THREE.Material).dispose();(lampPoles.material as THREE.Material).dispose();(lampBulbs.material as THREE.Material).dispose();windowWarm.dispose();windowCool.dispose();corridorMat.dispose();placeLabels.forEach(label=>{const texture=label.userData.disposeTexture as THREE.Texture|undefined;texture?.dispose();(label.material as THREE.Material).dispose()});circleParkReality.traverse(obj=>{if(obj instanceof THREE.Sprite){const texture=obj.userData.disposeTexture as THREE.Texture|undefined;texture?.dispose();(obj.material as THREE.Material).dispose()}else if(obj instanceof THREE.Mesh){obj.geometry.dispose()}});circleParkTimeLayers.traverse(obj=>{if(obj instanceof THREE.Sprite){const texture=obj.userData.disposeTexture as THREE.Texture|undefined;texture?.dispose();(obj.material as THREE.Material).dispose()}else if(obj instanceof THREE.Mesh){obj.geometry.dispose()}});pilsenArt.traverse(obj=>{if(obj instanceof THREE.Mesh){obj.geometry.dispose();(obj.material as THREE.Material).dispose()}});missionLabelTextures.forEach(texture=>texture.dispose());westSideVisibleWorld.dispose();unregisterScene();renderer.dispose();renderer.domElement.remove()}
 },[])
 const activateContextPrompt=()=>{const prompt=interactionRef.current;if(!prompt)return;if(prompt.id==='vehicle-enter'){window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{entered:true}}));return}if(prompt.id==='vehicle-exit'){window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{entered:false}}));return}if(prompt.id==='first-journey-guide'){const detail={id:'first-journey-guide',label:'First Journey Guide',kind:'talk',action:'TALK',topic:'First Ride completion',source:'iphone-first-journey'};window.dispatchEvent(new CustomEvent('tryamm:streetverse-npc-dialogue',{detail}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-context-interaction',{detail}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-first-journey-ready-to-complete',{detail:{missionId:'iphone-first-journey',source:'streetverse-mobile-world'}}));return}if(prompt.id==='vehicle-repair'){window.dispatchEvent(new CustomEvent('tryamm:streetverse-interaction-context',{detail:{kind:'vehicle',vehicleId:'first-repair-car',label:'Repair Mission Car',broken:true,drivable:false,repairKit:true,missionId:'vehicle-repair:first-repair-car'}}));return}window.dispatchEvent(new CustomEvent('tryamm:streetverse-context-action',{detail:{id:prompt.id}}))}
 const joystick=(e:React.PointerEvent<HTMLDivElement>)=>{e.preventDefault();joystickLastMoveAt.current=performance.now();const r=e.currentTarget.getBoundingClientRect(),x=THREE.MathUtils.clamp((e.clientX-(r.left+r.width/2))/(r.width*.38),-1,1),y=THREE.MathUtils.clamp((e.clientY-(r.top+r.height/2))/(r.height*.38),-1,1);analogInput.current={x,y};input.current={up:y<-.05,down:y>.05,left:x<-.05,right:x>.05};if(joystickKnobRef.current)joystickKnobRef.current.style.transform=`translate3d(${Math.round(x*25)}px,${Math.round(y*25)}px,0)`}
 const stopJoystick=()=>{analogInput.current={x:0,y:0};directTouchInput.current={up:false,down:false,left:false,right:false};input.current={up:false,down:false,left:false,right:false};if(joystickKnobRef.current)joystickKnobRef.current.style.transform='translate3d(0,0,0)'}
 const openShell=(target:string)=>{const params=new URLSearchParams({open:target,return:'/streetverse'});window.location.href='/?'+params.toString()}
 const quickAction=(target:'sparrow'|'holoverse'|'carousel'|'faithverse'|'resources'|'pocket'|'social'|'ride'|'emergency'|'rescue'|'time'|'hologpt'|'adult'|'school'|'west-side'|'left-hand'|'right-hand'|'home')=>{setMenuOpen(false);if(target==='pocket'){setPocketDimensionOpen(true);return}if(target==='time'){window.dispatchEvent(new CustomEvent('tryamm:time-machine-toggle',{detail:{source:'streetverse-mobile-menu'}}));return}if(target==='hologpt'){window.dispatchEvent(new CustomEvent('tryamm:open-hologpt',{detail:{source:'streetverse-mobile-menu'}}));return}if(target==='rescue'){window.dispatchEvent(new CustomEvent('tryamm:streetverse-rescue-director-open',{detail:{source:'streetverse-mobile-menu'}}));return}if(target==='emergency'){window.dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-call-open',{detail:{source:'streetverse-mobile-menu'}}));return}if(target==='adult'){window.dispatchEvent(new CustomEvent('tryamm:streetverse-adult-recreation-open',{detail:{source:'streetverse-mobile-menu'}}));return}if(target==='ride'){window.dispatchEvent(new CustomEvent('tryamm:holo-mobility-open',{detail:{source:'streetverse-mobile-menu'}}));return}if(target==='social'){const open=!socialToolsOpen;setSocialToolsOpen(open);window.dispatchEvent(new CustomEvent('tryamm:streetverse-social-tools-toggle',{detail:{open}}));return}if(target==='left-hand'||target==='right-hand'){const side=target==='left-hand'?'left':'right';setControlSide(side);try{localStorage.setItem('tryamm:streetverse-one-hand-side',side);localStorage.setItem('tryamm:streetverse-control-mode','one-hand')}catch{};window.dispatchEvent(new CustomEvent('tryamm:streetverse-control-mode',{detail:{mode:'one-hand',hand:side,source:'mobile-world-menu'}}));return}if(target==='school'){window.dispatchEvent(new CustomEvent('tryamm:school-route-request',{detail:{campusId:'thomas-jefferson-legacy-campus',source:'streetverse-mobile-menu'}}));return}if(target==='west-side'){window.dispatchEvent(new CustomEvent('tryamm:west-side-missions-open',{detail:{source:'streetverse-mobile-menu'}}));return}if(target==='resources'){setResourcePassportOpen(true);return}if(target==='faithverse'){window.location.href='/faithverse';return}if(target==='home'){window.location.href='/';return}openShell(target)}
 const completeMountedFirstJourney=()=>{if(!firstJourneyReady)return;const detail={id:'iphone-first-journey',missionId:'iphone-first-journey',title:'First Ride • Circle Park to Roosevelt',label:'First Ride',source:'streetverse-mobile-world',xp:500,rewardStatus:'pending',verified:false};window.dispatchEvent(new CustomEvent('tryamm:streetverse-first-journey-complete',{detail}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-xp-gain',{detail:{amount:500,missionId:'iphone-first-journey',source:'streetverse-mobile-world'}}));window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'FIRST RIDE COMPLETE • +500 XP • reward ledger + Reel ready'}}))}
 const openCompletedRouteReel=()=>{const first=firstJourneyReelReady&&!districtReelReady;window.dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{source:'streetverse-mobile-world',missionId:first?'iphone-first-journey':'west-side-route',missionLabel:first?'First Ride • Circle Park to Roosevelt':'West Side Route • Roosevelt → Taylor → Pilsen → Circle Park',rewardStatus:'recorded',verified:true}}));setFirstJourneyReelReady(false);setDistrictReelReady(false);reelReadyRef.current=false}
 return <div ref={mountRef} data-streetverse-world-root="true" data-control-side={controlSide} style={{position:'fixed',inset:0,background:'#07101d',overflow:'hidden'}}><UniversalMissionDirector defaultWorld="streetverse"/><StreetVerseReelCaptureOverlay/><StreetVerseInGamePanels/><StreetVerseLiveTalkControl/><StreetVerseDialogueHUD/><StreetVerseRescueMissionHUD/><HoloGPTAssistant showLauncher={false}/><CircleParkGuardCheckInHUD/><StreetVerseAdultRecreationHUD/><StreetVerseEmergencyCallHUD/><StreetVerseEmergencyFleetWorld/><StreetVerseEmergencyIncidentLifecycle/><StreetVerseResponderNPCController/><StreetVerseThomasJeffersonSchool/><StreetVerseSchoolLifeWorld/><StreetVerseSchoolLearningHUD/><StreetVerseWestSideMissionDirector/>{basketballOpen&&<CircleParkBasketballGame onClose={()=>setBasketballOpen(false)}/>} {poolSessionId&&<StreetVersePoolGame poolId={poolSessionId} onClose={()=>setPoolSessionId(null)}/>} {seniorCommonsOpen&&<CircleParkSeniorCommonsPanel onClose={()=>setSeniorCommonsOpen(false)}/>} {resourcePassportOpen&&<StreetVerseResourcePassport onClose={()=>setResourcePassportOpen(false)}/>} {pocketDimensionOpen&&<StreetVersePocketDimension onClose={()=>setPocketDimensionOpen(false)}/>}<button aria-label="Open Holo FON" onClick={()=>openShell('holofon')} style={{position:'fixed',top:'max(12px,calc(env(safe-area-inset-top) + 12px))',right:'max(14px,calc(env(safe-area-inset-right) + 14px))',zIndex:41010,width:48,height:48,borderRadius:24,border:'2px solid #69e9ff',background:'#061826ee',color:'#fff',fontSize:23,boxShadow:'0 0 16px #00d9ff66',touchAction:'manipulation'}}>📱</button><button aria-label="Open StreetVerse quick menu" aria-expanded={menuOpen} onClick={()=>setMenuOpen(v=>!v)} style={{position:'fixed',top:'max(12px,calc(env(safe-area-inset-top) + 12px))',right:'max(70px,calc(env(safe-area-inset-right) + 70px))',zIndex:41010,width:48,height:48,borderRadius:24,border:'2px solid #78ffb4',background:'#071c17ee',color:'#fff',fontSize:24,fontWeight:950,boxShadow:'0 0 16px #39ff9a44',touchAction:'manipulation'}}>⋯</button>{menuOpen&&<div role="menu" aria-label="StreetVerse quick navigation" style={{position:'fixed',top:'max(68px,calc(env(safe-area-inset-top) + 68px))',right:'max(12px,calc(env(safe-area-inset-right) + 12px))',zIndex:42000,width:184,maxHeight:'560px',overflowY:'auto',padding:7,borderRadius:16,border:'1px solid #69e9ff88',background:'rgba(3,13,22,.95)',boxShadow:'0 18px 46px #000c',display:'grid',gap:5}}>{([['sparrow','🗺 SCAN MAP'],['holoverse','🌐 HOLOVERSE'],['carousel','✦ ALL VERSES'],['faithverse','📖 FAITHVERSE'],['resources','🎒 RESOURCES'],['school','🏫 SCHOOL'],['west-side','🏙 WEST SIDE JOBS'],['pocket','♾️ POCKET DIMENSION'],['social',socialToolsOpen?'✓ SOCIAL / RP':'👥 SOCIAL / RP'],['emergency','🚨 GAME 911'],['rescue','🚒 RESCUE OPS'],['time','⏳ TIME MACHINE'],['hologpt','◈ HOLOGPT'],['adult','🌙 21+ ADULT'],['ride','🚕 RIDE SHARE'],['left-hand',controlSide==='left'?'✓ LEFT HAND':'✋ LEFT HAND'],['right-hand',controlSide==='right'?'✓ RIGHT HAND':'✋ RIGHT HAND'],['home','⌂ HOME']] as const).map(([target,label])=><button key={target} role="menuitem" onClick={()=>quickAction(target)} style={{minHeight:38,borderRadius:10,border:'1px solid #27485c',background:'#091923',color:'#fff',font:'900 10px system-ui',textAlign:'left',padding:'7px 10px',touchAction:'manipulation'}}>{label}</button>)}</div>}<div aria-label="StreetVerse mobile social shortcuts" style={{position:'fixed',...(controlSide==='left'?{right:'max(14px, env(safe-area-inset-right))'}:{left:'max(14px, env(safe-area-inset-left))'}),bottom:'max(24px, env(safe-area-inset-bottom))',zIndex:41005,display:'grid',gridTemplateColumns:'repeat(3,48px)',gap:6,pointerEvents:'auto'}}><button aria-label="Open StreetVerse social panel" onClick={()=>dispatchEvent(new CustomEvent('tryamm:mini-panel-open',{detail:{tab:'social',source:'streetverse-mobile-shortcuts'}}))} style={{width:48,height:48,borderRadius:14,border:'1px solid #ff9ecf88',background:'#1c0b18e8',color:'#fff',fontSize:19,touchAction:'manipulation'}}>❤️</button><button aria-label="Open StreetVerse people search" onClick={()=>dispatchEvent(new CustomEvent('tryamm:user-search-open',{detail:{source:'streetverse-mobile-shortcuts',scope:['people','live','families','agencies','games']}}))} style={{width:48,height:48,borderRadius:14,border:'1px solid #9fc8ff88',background:'#091525e8',color:'#fff',fontSize:19,touchAction:'manipulation'}}>🔎</button><button aria-label="Open StreetVerse stream tickets" onClick={()=>dispatchEvent(new CustomEvent('tryamm:stream-ticket-center-open',{detail:{source:'streetverse-mobile-shortcuts'}}))} style={{width:48,height:48,borderRadius:14,border:'1px solid #b7ffa288',background:'#0d1d10e8',color:'#fff',fontSize:19,touchAction:'manipulation'}}>🎟️</button></div>{missionGuide&&<button data-streetverse-mission="true" aria-live="polite" aria-label={`Start or focus mission ${missionGuide.label}`} onClick={()=>{if(missionGuide.id==='iphone-first-journey'&&firstJourneyReady){completeMountedFirstJourney();return}focusedMissionId.current=missionGuide.id;const objective=missionGuide.objective||'Reach the highlighted StreetVerse mission marker.';const detail={missionId:missionGuide.id,id:missionGuide.id,title:missionGuide.label,objective,source:'streetverse-mobile-world-marker'};window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail}));window.dispatchEvent(new CustomEvent('tryamm:city-navigation-target',{detail:{type:'mission',missionId:missionGuide.id,label:missionGuide.label}}));setMessage(`MISSION ACTIVE • ${missionGuide.label} • ${objective}`)}} style={{position:'fixed',left:'50%',transform:'translateX(-50%)',top:'max(88px,calc(env(safe-area-inset-top) + 80px))',zIndex:33500,minWidth:190,maxWidth:'78vw',padding:'9px 13px',borderRadius:14,border:'1px solid #f5d56baa',background:'rgba(8,14,22,.92)',color:'#fff',boxShadow:'0 0 20px #ffd65a33',pointerEvents:'auto',textAlign:'center',font:'900 11px system-ui',touchAction:'manipulation'}}><span style={{color:'#ffe47f'}}>MISSION • {missionGuide.label}</span><span style={{display:'block',marginTop:3,fontSize:10,opacity:.9}}>{missionGuide.distance}m • {missionGuide.bearing}</span>{missionGuide.objective&&<span style={{display:'block',marginTop:4,fontSize:9,lineHeight:1.25,opacity:.88}}>{missionGuide.objective}</span>}<span style={{display:'block',marginTop:4,fontSize:9,color:'#8effb7'}}>TAP TO START / FOCUS • LOCK ROUTE</span></button>}{(firstJourneyReelReady||districtReelReady)&&!missionGuide&&<button aria-label="Open Reel Creator for completed StreetVerse route" onClick={openCompletedRouteReel} style={{position:'fixed',left:'50%',transform:'translateX(-50%)',top:'max(88px,calc(env(safe-area-inset-top) + 80px))',zIndex:33500,minWidth:190,maxWidth:'78vw',padding:'10px 14px',borderRadius:14,border:'1px solid #ff8fd9aa',background:'rgba(28,8,28,.94)',color:'#fff',boxShadow:'0 0 22px #ff4fc755',pointerEvents:'auto',font:'950 11px system-ui',touchAction:'manipulation'}}>● REEL READY • {districtReelReady?'CAPTURE WEST SIDE RUN':'CAPTURE FIRST RIDE'}</button>}{!vehicleOccupied&&cameraUiMode==='third-person'&&<button aria-label="Switch third person shoulder" onClick={()=>dispatchEvent(new CustomEvent('tryamm:streetverse-switch-shoulder'))} style={{position:'fixed',left:'max(16px, env(safe-area-inset-left))',bottom:'max(24px, env(safe-area-inset-bottom))',zIndex:34009,minWidth:44,minHeight:44,borderRadius:22,border:'1px solid #9ee8ff77',background:'rgba(3,18,29,.88)',color:'#fff',font:'900 13px system-ui',touchAction:'manipulation'}}>↔</button>}{!vehicleOccupied&&<button aria-label="Toggle first person third person camera" onClick={()=>dispatchEvent(new CustomEvent('tryamm:streetverse-toggle-player-camera'))} style={{position:'fixed',left:'50%',transform:'translateX(-50%)',bottom:'max(24px, env(safe-area-inset-bottom))',zIndex:34010,minHeight:44,padding:'8px 14px',borderRadius:999,border:'1px solid #9ee8ff99',background:'rgba(3,18,29,.90)',color:'#fff',font:'900 10px system-ui',touchAction:'manipulation'}}>👁 {cameraUiMode==='first-person'?'1ST PERSON':'3RD PERSON'}</button>}{vehicleOccupied&&<button aria-label="Cycle vehicle camera" onClick={()=>dispatchEvent(new CustomEvent('tryamm:streetverse-cycle-vehicle-camera'))} style={{position:'fixed',left:'50%',transform:'translateX(-50%)',bottom:'max(24px, env(safe-area-inset-bottom))',zIndex:34010,minHeight:44,padding:'8px 14px',borderRadius:999,border:'1px solid #9ee8ff99',background:'rgba(3,18,29,.90)',color:'#fff',font:'900 10px system-ui',touchAction:'manipulation'}}>📷 {vehicleCameraUiMode.replaceAll('-',' ').toUpperCase()}</button>}{interactionPrompt&&<button data-streetverse-context="true" aria-label={`${interactionPrompt.action} ${interactionPrompt.label}`} onClick={activateContextPrompt} style={{position:'fixed',...(controlSide==='left'?{left:'max(18px, env(safe-area-inset-left))'}:{right:'max(18px, env(safe-area-inset-right))'}),bottom:'max(154px, calc(env(safe-area-inset-bottom) + 154px))',zIndex:34000,minWidth:148,maxWidth:190,minHeight:58,padding:'9px 12px',borderRadius:16,border:'2px solid #7be9ff',background:'rgba(3,18,29,.92)',color:'#fff',boxShadow:'0 0 22px #00d9ff55',font:'900 11px system-ui',touchAction:'manipulation',textAlign:'center'}}><span style={{display:'block',fontSize:12,color:'#9ef1ff'}}>{interactionPrompt.action}</span><span style={{display:'block',marginTop:3,fontSize:9,opacity:.8}}>{interactionPrompt.label}</span></button>}<div aria-label="StreetVerse analog joystick" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);joystick(e)}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))joystick(e)}} onPointerUp={stopJoystick} onPointerCancel={stopJoystick} onLostPointerCapture={stopJoystick} style={{position:'fixed',...(controlSide==='left'?{left:'max(18px, env(safe-area-inset-left))'}:{right:'max(18px, env(safe-area-inset-right))'}),bottom:'max(22px, env(safe-area-inset-bottom))',zIndex:33000,width:106,height:106,borderRadius:'50%',border:'2px solid #7be9ff',background:'rgba(2,12,22,.68)',boxShadow:'0 0 22px #00d9ff55',pointerEvents:'auto',touchAction:'none',display:'grid',placeItems:'center'}}><div ref={joystickKnobRef} style={{width:46,height:46,borderRadius:'50%',background:'rgba(123,233,255,.72)',border:'2px solid #dffaff',pointerEvents:'none',transition:'transform 45ms linear',willChange:'transform'}}/></div><div style={{position:'fixed',left:'max(8px, env(safe-area-inset-left))',top:'max(8px, env(safe-area-inset-top))',zIndex:17020,display:'flex',gap:5,alignItems:'center',pointerEvents:'none',font:'850 9px system-ui',maxWidth:'58vw'}}><div style={{padding:'5px 7px',borderRadius:999,background:'rgba(3,12,20,.70)',border:'1px solid #5be7ff55',color:'#fff',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:112}}>{status.replace('MOBILE CITY • ','').replace('CHICAGO ALIVE V6','CHICAGO')}</div><div data-streetverse-weather="true" aria-live="polite" style={{padding:'5px 7px',borderRadius:999,background:'rgba(3,12,20,.70)',border:'1px solid #5be7ff55',color:'#9ee8ff',whiteSpace:'nowrap',maxWidth:92,overflow:'hidden',textOverflow:'ellipsis'}}>{weatherStatus.includes('UNAVAILABLE')?'☁ WEATHER':weatherStatus.replace('WEATHER • ','')}</div><button aria-label="Exit StreetVerse" onClick={onClose} style={{pointerEvents:'auto',minWidth:44,minHeight:44,borderRadius:999,border:'1px solid #ffffff33',background:'rgba(18,25,35,.78)',color:'#fff',fontWeight:900}}>×</button></div><div aria-live="polite" style={{position:'fixed',left:8,right:8,top:'max(58px, calc(env(safe-area-inset-top) + 50px))',zIndex:17010,textAlign:'center',pointerEvents:'none',color:'#dffaff',font:'700 10px system-ui',textShadow:'0 1px 4px #000'}}>{(message.includes('No drivable')||message.includes('REPAIR'))?message:''}</div></div>
}