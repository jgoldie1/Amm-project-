import {lazy,Suspense,useMemo} from 'react'
import {announceStreetVerseProductionMode} from '../config/streetverseProductionMode'

const StreetVerseMobilePlayableWorld=lazy(()=>import('./StreetVerseMobilePlayableWorld'))
const StreetVersePlayableWorld=lazy(()=>import('./StreetVersePlayableWorld'))
const StreetVerseFullWorldOverlays=lazy(()=>import('./StreetVerseFullWorldOverlays'))
const StreetVerseReelEventBridge=lazy(()=>import('./StreetVerseReelEventBridge'))

const DESTINATION_KEY='tryamm.streetverse.chicago-destination.v1',SAVE_KEY='tryamm.streetverse.living.v1'
const GAME_SPAWNS:Record<string,{x:number;z:number;label:string}>={loop:{x:0,z:0,label:'The Loop'},millennium:{x:38,z:38,label:'Millennium Park'},lakefront:{x:72,z:58,label:'Lakefront'},river:{x:28,z:-12,label:'Chicago River'},south:{x:-18,z:72,label:'South Side'},west:{x:-72,z:10,label:'West Side'},north:{x:12,z:-72,label:'North Side'},ohare:{x:-78,z:-78,label:"O'Hare Gateway"},midway:{x:-58,z:72,label:'Midway Gateway'}}
type Destination={id?:string;label?:string;lon?:number;lat?:number;city?:string}

function shouldUseIndependentSafeBoot(){
 if(typeof navigator==='undefined'||typeof window==='undefined')return false
 const ua=navigator.userAgent||''
 const appleMobile=/iPhone|iPad|iPod/i.test(ua)
 const olderIOS=/OS (1[0-6])[_\d]* like Mac OS X/i.test(ua)
 const memory=Number((navigator as Navigator & {deviceMemory?:number}).deviceMemory||0)
 const cores=Number(navigator.hardwareConcurrency||0)
 const narrow=Math.min(window.innerWidth||9999,window.innerHeight||9999)<=480
 return appleMobile&&(olderIOS||narrow||(cores>0&&cores<=4)||(memory>0&&memory<=4))
}

function prepareSpawn(){announceStreetVerseProductionMode();let destination:Destination|undefined;try{destination=JSON.parse(localStorage.getItem(DESTINATION_KEY)||'null')||undefined}catch{}const mapped=destination?.id?GAME_SPAWNS[destination.id]:undefined;if(mapped){try{const previous=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');localStorage.setItem(SAVE_KEY,JSON.stringify({...previous,x:mapped.x,z:mapped.z,geoDestination:destination,geoSpawnLabel:mapped.label,updatedAt:new Date().toISOString()}))}catch{}window.dispatchEvent(new CustomEvent('tryamm:streetverse-geo-spawn-ready',{detail:{destination,mapped}}))}return {destination,mapped}}

export default function StreetVerseGeoSpawnBridge({onClose}:{onClose:()=>void}){
 const prepared=useMemo(()=>prepareSpawn(),[])
 const safe=useMemo(shouldUseIndependentSafeBoot,[])
 if(safe)return <Suspense fallback={<div role='status' style={{position:'fixed',inset:0,display:'grid',placeItems:'center',background:'#07101b',color:'#fff',zIndex:16000}}>STREETVERSE CHICAGO • LOADING SAFE CITY…</div>}><StreetVerseMobilePlayableWorld onClose={onClose}/><StreetVerseReelEventBridge/></Suspense>
 return <Suspense fallback={<div role='status' style={{position:'fixed',inset:0,display:'grid',placeItems:'center',background:'#07101b',color:'#fff',zIndex:16000}}>STREETVERSE CHICAGO • LOADING…</div>}>
  <StreetVersePlayableWorld onClose={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-request-close'))}/>
  <Suspense fallback={null}><StreetVerseFullWorldOverlays onClose={onClose} mapped={prepared.mapped}/><StreetVerseReelEventBridge/></Suspense>
 </Suspense>
}
