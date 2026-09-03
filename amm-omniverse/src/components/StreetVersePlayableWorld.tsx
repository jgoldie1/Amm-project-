import {lazy,Suspense,useMemo} from 'react'
import StreetVerseMobileWorld from './StreetVerseMobileWorld'
import StreetVerseMobilePlayableWorld from './StreetVerseMobilePlayableWorld'

const StreetVerseLivingWorld=lazy(()=>import('./StreetVerseLivingWorld'))

function isMobileDevice(){
 if(typeof navigator==='undefined')return false
 return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent||'')
}

function shouldUseSafeMode(){
 if(typeof navigator==='undefined')return false
 const ua=navigator.userAgent||''
 const mobile=isMobileDevice()
 const memory=Number((navigator as Navigator & {deviceMemory?:number}).deviceMemory||0)
 const cores=Number(navigator.hardwareConcurrency||0)
 return mobile&&(memory>0&&memory<=4||cores>0&&cores<=4||/iPhone OS 1[0-6]_/.test(ua))
}

export default function StreetVersePlayableWorld({onClose}:{onClose:()=>void}){
 const mobile=useMemo(isMobileDevice,[])
 const safe=useMemo(shouldUseSafeMode,[])
 if(mobile||safe)return <Suspense fallback={<StreetVerseMobilePlayableWorld onClose={onClose}/>}><StreetVerseMobileWorld onClose={onClose}/></Suspense>
 return <Suspense fallback={<StreetVerseMobilePlayableWorld onClose={onClose}/>}><StreetVerseLivingWorld onClose={onClose}/></Suspense>
}
