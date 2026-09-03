import {lazy,Suspense,useMemo} from 'react'
import StreetVerseMobileWorld from './StreetVerseMobileWorld'
import StreetVerseMobilePlayableWorld from './StreetVerseMobilePlayableWorld'
import StreetVerseMobileWalkControls from './StreetVerseMobileWalkControls'

const StreetVerseLivingWorld=lazy(()=>import('./StreetVerseLivingWorld'))

function isMobileDevice(){
 if(typeof navigator==='undefined')return false
 return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent||'')
}

export function shouldUseStreetVerseSafeMode(){
 if(typeof navigator==='undefined'||typeof window==='undefined')return false
 const ua=navigator.userAgent||''
 const appleMobile=/iPhone|iPad|iPod/i.test(ua)
 const olderIOS=/OS (1[0-6])[_\d]* like Mac OS X/i.test(ua)
 const memory=Number((navigator as Navigator & {deviceMemory?:number}).deviceMemory||0)
 const cores=Number(navigator.hardwareConcurrency||0)
 const narrow=Math.min(window.innerWidth||9999,window.innerHeight||9999)<=480
 return appleMobile&&(olderIOS||narrow||cores>0&&cores<=4||memory>0&&memory<=4)
}

export default function StreetVersePlayableWorld({onClose}:{onClose:()=>void}){
 const mobile=useMemo(isMobileDevice,[])
 const safe=useMemo(shouldUseStreetVerseSafeMode,[])
 // Safe mode must never depend on Three.js/WebGL. Older iPhones can create a canvas
 // successfully but still fail to paint the scene, leaving users with a blank world.
 if(safe)return <StreetVerseMobilePlayableWorld onClose={onClose}/>
 if(mobile)return <><Suspense fallback={<StreetVerseMobilePlayableWorld onClose={onClose}/>}><StreetVerseMobileWorld onClose={onClose}/></Suspense><StreetVerseMobileWalkControls/></>
 return <Suspense fallback={<StreetVerseMobilePlayableWorld onClose={onClose}/>}><StreetVerseLivingWorld onClose={onClose}/></Suspense>
}
