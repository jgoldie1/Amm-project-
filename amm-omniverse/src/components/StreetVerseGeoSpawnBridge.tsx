import {lazy,Suspense,useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react'
import {announceStreetVerseProductionMode} from '../config/streetverseProductionMode'
import {installStreetVerseJourneyQARuntime} from '../runtime/StreetVerseJourneyQARuntime'
import StreetVerseMobilePlayableWorld from './StreetVerseMobilePlayableWorld'

const StreetVersePlayableWorld=lazy(()=>import('./StreetVersePlayableWorld'))
const StreetVerseFullWorldOverlays=lazy(()=>import('./StreetVerseFullWorldOverlays'))
const StreetVerseReelEventBridge=lazy(()=>import('./StreetVerseReelEventBridge'))

const DESTINATION_KEY='tryamm.streetverse.chicago-destination.v1',SAVE_KEY='tryamm.streetverse.living.v1'
const GAME_SPAWNS:Record<string,{x:number;z:number;label:string}>={loop:{x:0,z:0,label:'The Loop'},millennium:{x:38,z:38,label:'Millennium Park'},lakefront:{x:72,z:58,label:'Lakefront'},river:{x:28,z:-12,label:'Chicago River'},south:{x:-18,z:72,label:'South Side'},west:{x:-72,z:10,label:'West Side'},north:{x:12,z:-72,label:'North Side'},ohare:{x:-78,z:-78,label:"O'Hare Gateway"},midway:{x:-58,z:72,label:'Midway Gateway'}}
type Destination={id?:string;label?:string;lon?:number;lat?:number;city?:string}

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

function prepareSpawn(){announceStreetVerseProductionMode();let destination:Destination|undefined;try{destination=JSON.parse(localStorage.getItem(DESTINATION_KEY)||'null')||undefined}catch{}const mapped=destination?.id?GAME_SPAWNS[destination.id]:undefined;if(mapped){try{const previous=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');localStorage.setItem(SAVE_KEY,JSON.stringify({...previous,x:mapped.x,z:mapped.z,geoDestination:destination,geoSpawnLabel:mapped.label,updatedAt:new Date().toISOString()}))}catch{}window.dispatchEvent(new CustomEvent('tryamm:streetverse-geo-spawn-ready',{detail:{destination,mapped}}))}return {destination,mapped}}

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
 useEffect(()=>{
  const requestClose=()=>closeStreetVerse()
  window.addEventListener('tryamm:streetverse-request-close',requestClose)
  return()=>window.removeEventListener('tryamm:streetverse-request-close',requestClose)
 },[closeStreetVerse])
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
