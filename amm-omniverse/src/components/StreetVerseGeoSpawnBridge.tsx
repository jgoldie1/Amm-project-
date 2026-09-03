import {lazy,Suspense,useMemo} from 'react'
import StreetVersePlayableWorld,{shouldUseStreetVerseSafeMode} from './StreetVersePlayableWorld'
import {announceStreetVerseProductionMode} from '../config/streetverseProductionMode'

// Keep the safe-mode route lightweight. The full overlay/mission/multiplayer
// stack is loaded only for the full world, so constrained iOS devices do not
// have to parse the Three.js-heavy graph before the HTML city can paint.
const StreetVerseFullWorldOverlays=lazy(()=>import('./StreetVerseFullWorldOverlays'))

const DESTINATION_KEY='tryamm.streetverse.chicago-destination.v1',SAVE_KEY='tryamm.streetverse.living.v1'
const GAME_SPAWNS:Record<string,{x:number;z:number;label:string}>={loop:{x:0,z:0,label:'The Loop'},millennium:{x:38,z:38,label:'Millennium Park'},lakefront:{x:72,z:58,label:'Lakefront'},river:{x:28,z:-12,label:'Chicago River'},south:{x:-18,z:72,label:'South Side'},west:{x:-72,z:10,label:'West Side'},north:{x:12,z:-72,label:'North Side'},ohare:{x:-78,z:-78,label:"O'Hare Gateway"},midway:{x:-58,z:72,label:'Midway Gateway'}}
type Destination={id?:string;label?:string;lon?:number;lat?:number;city?:string}

function prepareSpawn(){announceStreetVerseProductionMode();let destination:Destination|undefined;try{destination=JSON.parse(localStorage.getItem(DESTINATION_KEY)||'null')||undefined}catch{}const mapped=destination?.id?GAME_SPAWNS[destination.id]:undefined;if(mapped){try{const previous=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');localStorage.setItem(SAVE_KEY,JSON.stringify({...previous,x:mapped.x,z:mapped.z,geoDestination:destination,geoSpawnLabel:mapped.label,updatedAt:new Date().toISOString()}))}catch{}window.dispatchEvent(new CustomEvent('tryamm:streetverse-geo-spawn-ready',{detail:{destination,mapped}}))}return {destination,mapped}}

export default function StreetVerseGeoSpawnBridge({onClose}:{onClose:()=>void}){
 const prepared=useMemo(()=>prepareSpawn(),[])
 const safe=useMemo(shouldUseStreetVerseSafeMode,[])
 if(safe)return <StreetVersePlayableWorld onClose={onClose}/>
 return <>
  <StreetVersePlayableWorld onClose={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-request-close'))}/>
  <Suspense fallback={null}>
   <StreetVerseFullWorldOverlays onClose={onClose} mapped={prepared.mapped}/>
  </Suspense>
 </>
}
