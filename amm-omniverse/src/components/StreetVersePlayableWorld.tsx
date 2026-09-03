import {lazy,Suspense,useMemo} from 'react'
import StreetVerseMobilePlayableWorld from './StreetVerseMobilePlayableWorld'

const StreetVerseLivingWorld=lazy(()=>import('./StreetVerseLivingWorld'))

function shouldUseSafeMode(){
 if(typeof navigator==='undefined')return false
 const ua=navigator.userAgent||''
 const mobile=/iPhone|iPad|iPod|Android/i.test(ua)
 const memory=Number((navigator as Navigator & {deviceMemory?:number}).deviceMemory||0)
 const cores=Number(navigator.hardwareConcurrency||0)
 return mobile&&(memory>0&&memory<=4||cores>0&&cores<=4||/iPhone OS 1[0-6]_/.test(ua))
}

export default function StreetVersePlayableWorld({onClose}:{onClose:()=>void}){
 const safe=useMemo(shouldUseSafeMode,[])
 if(safe)return <StreetVerseMobilePlayableWorld onClose={onClose}/>
 return <Suspense fallback={<StreetVerseMobilePlayableWorld onClose={onClose}/>}><StreetVerseLivingWorld onClose={onClose}/></Suspense>
}
