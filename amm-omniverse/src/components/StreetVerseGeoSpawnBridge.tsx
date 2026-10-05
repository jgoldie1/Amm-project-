import {lazy,Suspense,useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react'
import {announceStreetVerseProductionMode} from '../config/streetverseProductionMode'
import {getStreetVerseCommunitySlice} from '../config/streetverseCommunitySlices'
import {installStreetVerseJourneyQARuntime} from '../runtime/StreetVerseJourneyQARuntime'
import {installStreetVerseHydeParkMissionRuntime} from '../runtime/StreetVerseHydeParkMissionRuntime'
import {installStreetVerseAfterDarkAlphaRuntime} from '../runtime/StreetVerseAfterDarkAlphaRuntime'
import {installStreetVerseMissionLedgerBridge} from '../runtime/StreetVerseMissionLedgerBridge'
import {installStreetVerseMissionDiscoveryRuntime} from '../runtime/StreetVerseMissionDiscoveryRuntime'
import {installStreetVerseFameRuntime} from '../runtime/StreetVerseFameRuntime'
import {installStreetVerseVehicleRepairStreamerRuntime} from '../runtime/StreetVerseVehicleRepairStreamerRuntime'
import {installStreetVerseFirstRideLoveStoryRuntime} from '../runtime/StreetVerseFirstRideLoveStoryRuntime'
import {installStreetVerseCabinLifeRuntime} from '../runtime/StreetVerseCabinLifeRuntime'
import {installStreetVersePhysicalVehicleRigRuntime} from '../runtime/StreetVersePhysicalVehicleRigRuntime'
import {installStreetVerseNPCSocialRuntime} from '../runtime/StreetVerseNPCSocialRuntime'
import {chooseAccessMode} from '../runtime/StreetVerseAccessBridge'
import {installStreetVersePerformanceDirector} from '../runtime/StreetVersePerformanceDirectorRuntime'
import {installHolographicInternetBridge} from '../runtime/HolographicInternetGoogloplexBridge'
import {installBennyCursorConstructBridge} from '../runtime/BennyCursorConstructBridge'
import {installUniversalLanguageBridge} from '../runtime/UniversalLanguageSignBridge'
import {installAccessibleConversationBridge} from '../runtime/AccessibleConversationBridge'
import {installUniversalAccessOrchestrator} from '../runtime/UniversalAccessOrchestrator'
import {installUniversalIntentRouter} from '../runtime/UniversalIntentRouter'
import {installAccessibilityControlIntentRuntime} from '../runtime/AccessibilityControlIntentRuntime'
import {installPassportAccessibilityHydrationRuntime} from '../runtime/PassportAccessibilityHydrationRuntime'
import {installOmniAccessibilityGlobalRuntime} from '../runtime/OmniAccessibilityGlobalRuntime'
import StreetVerseSafeWorld from './StreetVerseSafeWorld'
import StreetVerseWeatherSync from './StreetVerseWeatherSync'
import StreetVerseAfterDarkAlpha from './StreetVerseAfterDarkAlpha'
import StreetVerseWestSideWorldBuilder from './StreetVerseWestSideWorldBuilder'
import BuildSwarmControl from './BuildSwarmControl'
import {useGameStore} from '../game/state/useGameStore'
import {chooseQuantumSpeedMode,QUANTUM_SPEED_BUDGETS,type QuantumSpeedMode} from '../game/runtime/quantumSpeedEngine'
import {CIRCLE_PARK_SPAWN} from '../data/StreetVerseChicagoGrid'

const StreetVersePlayableWorld=lazy(()=>import('./StreetVersePlayableWorld'))
const StreetVerseFullWorldOverlays=lazy(()=>import('./StreetVerseFullWorldOverlays'))
const StreetVerseReelEventBridge=lazy(()=>import('./StreetVerseReelEventBridge'))
const StreetVerseActionCarousel=lazy(()=>import('./StreetVerseActionCarousel'))
const StreetVerseMobileProofDock=lazy(()=>import('./StreetVerseMobileProofDock'))
const StreetVerseCoreGameplayDock=lazy(()=>import('./StreetVerseCoreGameplayDock'))
const StreetVerseCreatorEarnDock=lazy(()=>import('./StreetVerseCreatorEarnDock'))
const StreetVerseMissionWorldBridge=lazy(()=>import('./StreetVerseMissionWorldBridge'))
const StreetVerseTouchDriveControls=lazy(()=>import('./StreetVerseTouchDriveControls'))
const HoloMobilityLauncher=lazy(()=>import('./HoloMobilityLauncher'))
const StreetVerseFaithChronoPortal=lazy(()=>import('./StreetVerseFaithChronoPortal'))
const StreetVerseNearWest3D=lazy(()=>import('./StreetVerseNearWest3D'))

const DESTINATION_KEY_V2='tryamm.streetverse.chicago-destination.v2'
const DESTINATION_KEY_V1='tryamm.streetverse.chicago-destination.v1'
const SAVE_KEY='tryamm.streetverse.living.v1'
const GAME_SPAWNS:Record<string,{x:number;z:number;label:string}>={'circle-park-abla':{x:CIRCLE_PARK_SPAWN.x,z:CIRCLE_PARK_SPAWN.z,label:CIRCLE_PARK_SPAWN.label},loop:{x:0,z:0,label:'The Loop'},millennium:{x:38,z:38,label:'Millennium Park'},lakefront:{x:72,z:58,label:'Lakefront'},river:{x:28,z:-12,label:'Chicago River'},south:{x:-18,z:72,label:'South Side'},west:{x:-72,z:10,label:'West Side'},north:{x:12,z:-72,label:'North Side'},ohare:{x:-78,z:-78,label:"O'Hare Gateway"},midway:{x:-58,z:72,label:'Midway Gateway'}}
type Destination={id?:string;label?:string;name?:string;lon?:number;lat?:number;city?:string;type?:string;communityAreaNumber?:string|number}

function hasUsableWebGL(){
 if(typeof document==='undefined')return false
 try{
  const canvas=document.createElement('canvas')
  const gl=canvas.getContext('webgl2',{failIfMajorPerformanceCaveat:true})||canvas.getContext('webgl',{failIfMajorPerformanceCaveat:true})||canvas.getContext('experimental-webgl')
  return !!gl
 }catch{return false}
}

function shouldUseIndependentSafeBoot(){
 if(typeof navigator==='undefined'||typeof window==='undefined')return false
 const params=new URLSearchParams(window.location.search)
 if(params.get('safe')==='1'||params.get('mode')==='safe')return true
 const ua=navigator.userAgent||''
 const appleMobile=/iPhone|iPad|iPod/i.test(ua)
 const memory=Number((navigator as Navigator & {deviceMemory?:number}).deviceMemory||0)
 const cores=Number(navigator.hardwareConcurrency||0)
 const narrow=Math.min(window.innerWidth||9999,window.innerHeight||9999)<=480
 const noWebGL=!hasUsableWebGL()
 const constrained=(memory>0&&memory<=4)||(cores>0&&cores<=4)
 // Do not force capable iPhones into the HTML-only SafeWorld solely because
 // they run iOS 16 or have a narrow screen. The playable world gets first
 // attempt whenever WebGL is genuinely available; SafeWorld remains the
 // fallback for devices that cannot create a usable WebGL context.
 return noWebGL||(!appleMobile&&narrow&&constrained)
}

function readDestination():Destination|undefined{
 try{
  const params=new URLSearchParams(window.location.search)
  const communityArea=params.get('communityArea')||params.get('community')
  if(communityArea&&/^\d{1,2}$/.test(communityArea)){
   const slice=getStreetVerseCommunitySlice(communityArea)
   if(slice)return {id:`ca-${communityArea}`,type:'community-area',communityAreaNumber:communityArea,name:slice.name,label:slice.name,city:'Chicago'}
  }
  const current=JSON.parse(localStorage.getItem(DESTINATION_KEY_V2)||'null')
  if(current)return current
  return JSON.parse(localStorage.getItem(DESTINATION_KEY_V1)||'null')||undefined
 }catch{return undefined}
}

function resolveCommunitySpawn(number:string){
 const slice=getStreetVerseCommunitySlice(number)
 if(!slice)return undefined
 if(number==='32')return {x:0,z:0,label:slice.name,certification:slice.status,communityAreaNumber:number,kind:'community-area' as const}
 if(number==='41')return {x:26,z:62,label:slice.name,certification:slice.status,communityAreaNumber:number,kind:'community-area' as const}
 const n=Number(number)
 const column=(n-1)%11
 const row=Math.floor((n-1)/11)
 return {x:(column-5)*16,z:(row-3)*18,label:slice.name,certification:slice.status,communityAreaNumber:number,kind:'community-area' as const}
}

function resolveSpawn(destination?:Destination){
 if(!destination)return undefined
 if(destination.type==='community-area'||destination.communityAreaNumber!==undefined){
  const number=String(destination.communityAreaNumber??destination.id?.replace(/^ca-/,''))
  const community=resolveCommunitySpawn(number)
  if(community)return community
 }
 if(destination.id&&GAME_SPAWNS[destination.id])return {...GAME_SPAWNS[destination.id],kind:'landmark' as const}
 return undefined
}

function prepareSpawn(){
 announceStreetVerseProductionMode()
 const destination=readDestination()??{id:CIRCLE_PARK_SPAWN.id,label:CIRCLE_PARK_SPAWN.label,name:CIRCLE_PARK_SPAWN.label,city:'Chicago',type:'streetverse-spawn'}
 const mapped=resolveSpawn(destination)
 if(mapped){
  try{
   const previous=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')
   localStorage.setItem(SAVE_KEY,JSON.stringify({...previous,x:mapped.x,z:mapped.z,geoDestination:destination,geoSpawnLabel:mapped.label,communityAreaNumber:'communityAreaNumber'in mapped?mapped.communityAreaNumber:previous.communityAreaNumber,communitySliceStatus:'certification'in mapped?mapped.certification:previous.communitySliceStatus,updatedAt:new Date().toISOString()}))
  }catch{}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-geo-spawn-ready',{detail:{destination,mapped}}))
  if(mapped.kind==='community-area')window.dispatchEvent(new CustomEvent('tryamm:streetverse-community-slice-ready',{detail:{communityAreaNumber:mapped.communityAreaNumber,name:mapped.label,status:mapped.certification,spawn:{x:mapped.x,z:mapped.z}}}))
 }else if(destination?.type==='community-area'){
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-community-slice-unmapped',{detail:{destination,status:'BUILDING'}}))
 }
 return {destination,mapped}
}

export default function StreetVerseGeoSpawnBridge({onClose}:{onClose:()=>void}){
 const prepared=useMemo(()=>prepareSpawn(),[])
 const safe=useMemo(shouldUseIndependentSafeBoot,[])
 const mobile=useMemo(()=>typeof navigator!=='undefined'&&/iPhone|iPad|iPod|Android/i.test(navigator.userAgent||''),[])
 const [enhancementsReady,setEnhancementsReady]=useState(false)
 const [nearWestOpen,setNearWestOpen]=useState(false)
 const [quantumMode,setQuantumMode]=useState<QuantumSpeedMode>('balanced')
 const setLocationContext=useGameStore(state=>state.setLocationContext)
 const applyCityConsequence=useGameStore(state=>state.applyCityConsequence)
 const closingRef=useRef(false)
 const closeStreetVerse=useCallback(()=>{
  if(closingRef.current)return
  closingRef.current=true
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-exit',{detail:{source:'streetverse-geo-spawn',safeMode:safe}}))
  onClose()
 },[onClose,safe])

 useLayoutEffect(()=>installStreetVerseJourneyQARuntime(),[])
 useLayoutEffect(()=>installStreetVerseHydeParkMissionRuntime(),[])
 useLayoutEffect(()=>installStreetVerseAfterDarkAlphaRuntime(),[])
 useLayoutEffect(()=>{installStreetVerseMissionLedgerBridge()},[])
 useLayoutEffect(()=>{installStreetVerseMissionDiscoveryRuntime()},[])
 useLayoutEffect(()=>{installStreetVerseFameRuntime()},[])
 useLayoutEffect(()=>{installStreetVerseVehicleRepairStreamerRuntime()},[])
 useLayoutEffect(()=>{installStreetVerseFirstRideLoveStoryRuntime()},[])
 useLayoutEffect(()=>{installStreetVerseCabinLifeRuntime()},[])
 useLayoutEffect(()=>{installStreetVersePhysicalVehicleRigRuntime()},[])
 useLayoutEffect(()=>{installStreetVerseNPCSocialRuntime()},[])
 useLayoutEffect(()=>installStreetVersePerformanceDirector(),[])
 useLayoutEffect(()=>installHolographicInternetBridge(),[])
 useLayoutEffect(()=>installBennyCursorConstructBridge(),[])
 useLayoutEffect(()=>installUniversalLanguageBridge(),[])
 useLayoutEffect(()=>installAccessibleConversationBridge(),[])
 useLayoutEffect(()=>installUniversalAccessOrchestrator(),[])
 useLayoutEffect(()=>installUniversalIntentRouter(),[])
 useLayoutEffect(()=>installAccessibilityControlIntentRuntime(),[])
 useLayoutEffect(()=>installOmniAccessibilityGlobalRuntime(),[])
 useLayoutEffect(()=>installPassportAccessibilityHydrationRuntime(),[])
 useEffect(()=>{
  const connection=(navigator as Navigator & {connection?:{downlink?:number}}).connection
  const mode=chooseAccessMode({webgl:hasUsableWebGL(),bandwidthMbps:connection?.downlink,ownedDevice:true})
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-access-mode',{detail:{...mode,source:'streetverse-geo-spawn'}}))
 },[])
 useEffect(()=>{
  const destination=prepared.destination
  const mapped=prepared.mapped
  if(!destination&&!mapped)return
  const label=(mapped?.label||destination?.name||destination?.label||'').toLowerCase()
  const neighborhoodId=label.includes('west')?'west-side':label.includes('loop')||label.includes('downtown')||label.includes('millennium')||label.includes('river')?'downtown':'south-side'
  setLocationContext('chicago',neighborhoodId)
  window.dispatchEvent(new CustomEvent('tryamm:lcs-location-context',{detail:{cityId:'chicago',neighborhoodId,source:'streetverse-geo-spawn'}}))
 },[prepared.destination,prepared.mapped,setLocationContext])
 useEffect(()=>{
  const onGameplayAction=(event:Event)=>{
   const detail=(event as CustomEvent).detail||{}
   if(!detail.action)return
   applyCityConsequence(detail.action)
   window.dispatchEvent(new CustomEvent('tryamm:lcs-gameplay-consequence-applied',{detail:{action:detail.action,missionId:detail.missionId,source:detail.source}}))
  }
  window.addEventListener('tryamm:streetverse-gameplay-action',onGameplayAction)
  return()=>window.removeEventListener('tryamm:streetverse-gameplay-action',onGameplayAction)
 },[applyCityConsequence])
 useEffect(()=>{
  const requestClose=()=>closeStreetVerse()
  window.addEventListener('tryamm:streetverse-request-close',requestClose)
  return()=>window.removeEventListener('tryamm:streetverse-request-close',requestClose)
 },[closeStreetVerse])
 useEffect(()=>{
  if(safe){setQuantumMode('eco');return}
  let frames=0
  let start=performance.now()
  let raf=0
  const sample=(now:number)=>{
   frames+=1
   const elapsed=now-start
   if(elapsed>=1000){
    const fps=frames*1000/elapsed
    const frameMs=elapsed/Math.max(frames,1)
    const mode=chooseQuantumSpeedMode({fps,frameMs})
    setQuantumMode(mode)
    window.dispatchEvent(new CustomEvent('tryamm:quantum-speed-mode',{detail:{mode,budget:QUANTUM_SPEED_BUDGETS[mode],fps,frameMs,source:'streetverse-geo-spawn'}}))
    frames=0;start=now
   }
   raf=requestAnimationFrame(sample)
  }
  raf=requestAnimationFrame(sample)
  return()=>cancelAnimationFrame(raf)
 },[safe])
 useEffect(()=>{
  if(!safe)return
  const frame=window.requestAnimationFrame(()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-world-ready',{detail:{mode:'mobile-safe',mobileSafeMode:true,htmlCity:true,canvas:false,playable:true,source:'streetverse-geo-spawn',communityArea:prepared.destination?.communityAreaNumber||null}})))
  return()=>window.cancelAnimationFrame(frame)
 },[safe,prepared.destination?.communityAreaNumber])
 useEffect(()=>{
  if(safe)return
  const delay=quantumMode==='boost'?250:quantumMode==='balanced'?650:1400
  const timer=window.setTimeout(()=>setEnhancementsReady(true),delay)
  return()=>window.clearTimeout(timer)
 },[safe,quantumMode])

 if(safe)return <>
  <StreetVerseWestSideWorldBuilder/>
  <BuildSwarmControl/>
  <StreetVerseWeatherSync/>
  <StreetVerseSafeWorld onClose={closeStreetVerse} communityAreaNumber={prepared.destination?.communityAreaNumber}/>
  <StreetVerseAfterDarkAlpha/>
  <Suspense fallback={null}><StreetVerseReelEventBridge/><StreetVerseCreatorEarnDock/><StreetVerseActionCarousel/><StreetVerseTouchDriveControls/><StreetVerseMissionWorldBridge/><HoloMobilityLauncher/><StreetVerseFaithChronoPortal/><StreetVerseCoreGameplayDock/><StreetVerseMobileProofDock/></Suspense>
 </>

 return <>
  <BuildSwarmControl/>
  {nearWestOpen&&<div style={{position:'fixed',inset:0,zIndex:14980,background:'#07101d'}}><Suspense fallback={null}><StreetVerseNearWest3D/></Suspense><button aria-label="Return to StreetVerse Chicago" onClick={()=>setNearWestOpen(false)} style={{position:'fixed',top:76,right:12,zIndex:14990,border:'1px solid #6ee7ff',borderRadius:12,background:'#07131f',color:'#fff',padding:'10px 12px',fontWeight:900}}>← CHICAGO</button></div>}
  {!nearWestOpen&&<button data-streetverse-travel="true" aria-label="Travel to Taylor Street UIC Medical District" onClick={()=>setNearWestOpen(true)} style={{position:'fixed',top:118,right:12,zIndex:14970,border:'1px solid #6ee7ff',borderRadius:12,background:'#062333e8',color:'#fff',padding:'10px 12px',fontWeight:900}}>TAYLOR / UIC</button>}
  <Suspense fallback={<div aria-label="StreetVerse playable world loading" style={{position:'fixed',inset:0,zIndex:14990,display:'grid',placeItems:'center',background:'#07101d',color:'#fff',fontFamily:'system-ui',fontWeight:900}}>STREETVERSE • LOADING PLAYABLE WORLD…</div>}>
   <StreetVersePlayableWorld onClose={closeStreetVerse}/>
  </Suspense>
  <StreetVerseAfterDarkAlpha/>
  <Suspense fallback={null}>{mobile?<><StreetVerseReelEventBridge/><StreetVerseActionCarousel/><StreetVerseCreatorEarnDock/></>:<><StreetVerseReelEventBridge/><StreetVerseActionCarousel/><StreetVerseTouchDriveControls/><StreetVerseMissionWorldBridge/><HoloMobilityLauncher/><StreetVerseFaithChronoPortal/><StreetVerseCoreGameplayDock/><StreetVerseCreatorEarnDock/></>}</Suspense>
  {enhancementsReady&&<Suspense fallback={null}><StreetVerseFullWorldOverlays onClose={closeStreetVerse} mapped={prepared.mapped}/></Suspense>}
 </>
}