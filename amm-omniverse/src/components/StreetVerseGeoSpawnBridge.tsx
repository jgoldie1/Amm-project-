import {lazy,Suspense,useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react'
import {announceStreetVerseProductionMode} from '../config/streetverseProductionMode'
import {installStreetVerseJourneyQARuntime} from '../runtime/StreetVerseJourneyQARuntime'
import {installStreetVerseHydeParkMissionRuntime} from '../runtime/StreetVerseHydeParkMissionRuntime'
import StreetVerseMobilePlayableWorld from './StreetVerseMobilePlayableWorld'

const StreetVersePlayableWorld=lazy(()=>import('./StreetVersePlayableWorld'))
const StreetVerseFullWorldOverlays=lazy(()=>import('./StreetVerseFullWorldOverlays'))
const StreetVerseReelEventBridge=lazy(()=>import('./StreetVerseReelEventBridge'))

const DESTINATION_KEY_V2='tryamm.streetverse.chicago-destination.v2'
const DESTINATION_KEY_V1='tryamm.streetverse.chicago-destination.v1'
const SAVE_KEY='tryamm.streetverse.living.v1'
const GAME_SPAWNS:Record<string,{x:number;z:number;label:string}>={loop:{x:0,z:0,label:'The Loop'},millennium:{x:38,z:38,label:'Millennium Park'},lakefront:{x:72,z:58,label:'Lakefront'},river:{x:28,z:-12,label:'Chicago River'},south:{x:-18,z:72,label:'South Side'},west:{x:-72,z:10,label:'West Side'},north:{x:12,z:-72,label:'North Side'},ohare:{x:-78,z:-78,label:"O'Hare Gateway"},midway:{x:-58,z:72,label:'Midway Gateway'}}
const COMMUNITY_AREA_SPAWNS:Record<string,{x:number;z:number;label:string;certification:'BUILDING'|'CERTIFIED'}>={
 '41':{x:26,z:62,label:'Hyde Park',certification:'BUILDING'},
}
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
 const ua=navigator.userAgent||''
 const appleMobile=/iPhone|iPad|iPod/i.test(ua)
 const olderIOS=/OS (1[0-6])[_\d]* like Mac OS X/i.test(ua)
 const memory=Number((navigator as Navigator & {deviceMemory?:number}).deviceMemory||0)
 const cores=Number(navigator.hardwareConcurrency||0)
 const narrow=Math.min(window.innerWidth||9999,window.innerHeight||9999)<=480
 const noWebGL=!hasUsableWebGL()
 const constrained=(memory>0&&memory<=4)||(cores>0&&cores<=4)
 return noWebGL||(appleMobile&&(olderIOS||narrow||constrained))||(!appleMobile&&narrow&&constrained)
}

function readDestination():Destination|undefined{
 try{
  const current=JSON.parse(localStorage.getItem(DESTINATION_KEY_V2)||'null')
  if(current)return current
  return JSON.parse(localStorage.getItem(DESTINATION_KEY_V1)||'null')||undefined
 }catch{return undefined}
}

function resolveSpawn(destination?:Destination){
 if(!destination)return undefined
 if(destination.type==='community-area'||destination.communityAreaNumber!==undefined){
  const number=String(destination.communityAreaNumber??destination.id?.replace(/^ca-/,''))
  const community=COMMUNITY_AREA_SPAWNS[number]
  if(community)return {...community,communityAreaNumber:number,kind:'community-area' as const}
 }
 if(destination.id&&GAME_SPAWNS[destination.id])return {...GAME_SPAWNS[destination.id],kind:'landmark' as const}
 return undefined
}

function prepareSpawn(){
 announceStreetVerseProductionMode()
 const destination=readDestination()
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
 const [enhancementsReady,setEnhancementsReady]=useState(false)
 const closingRef=useRef(false)
 const closeStreetVerse=useCallback(()=>{
  if(closingRef.current)return
  closingRef.current=true
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-exit',{detail:{source:'streetverse-geo-spawn',safeMode:safe}}))
  onClose()
 },[onClose,safe])

 useLayoutEffect(()=>installStreetVerseJourneyQARuntime(),[])
 useLayoutEffect(()=>installStreetVerseHydeParkMissionRuntime(),[])
 useEffect(()=>{
  const requestClose=()=>closeStreetVerse()
  window.addEventListener('tryamm:streetverse-request-close',requestClose)
  return()=>window.removeEventListener('tryamm:streetverse-request-close',requestClose)
 },[closeStreetVerse])
 useEffect(()=>{
  if(!safe)return
  const frame=window.requestAnimationFrame(()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-world-ready',{detail:{mode:'mobile-safe',mobileSafeMode:true,htmlCity:true,canvas:false,playable:true,source:'streetverse-geo-spawn',communityArea:prepared.destination?.communityAreaNumber||null}})))
  return()=>window.cancelAnimationFrame(frame)
 },[safe,prepared.destination?.communityAreaNumber])
 useEffect(()=>{
  if(safe)return
  const timer=window.setTimeout(()=>setEnhancementsReady(true),650)
  return()=>window.clearTimeout(timer)
 },[safe])

 if(safe)return <>
  <StreetVerseMobilePlayableWorld onClose={closeStreetVerse}/>
  <Suspense fallback={null}><StreetVerseReelEventBridge/></Suspense>
 </>

 return <>
  <Suspense fallback={<StreetVerseMobilePlayableWorld onClose={closeStreetVerse}/>}>
   <StreetVersePlayableWorld onClose={closeStreetVerse}/>
  </Suspense>
  {enhancementsReady&&<Suspense fallback={null}><StreetVerseFullWorldOverlays onClose={closeStreetVerse} mapped={prepared.mapped}/><StreetVerseReelEventBridge/></Suspense>}
 </>
}
