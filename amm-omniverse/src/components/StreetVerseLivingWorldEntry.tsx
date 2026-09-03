import StreetVerseLivingWorld from './StreetVerseLivingWorld'
import StreetVerseMobileSafeWorld from './StreetVerseMobileSafeWorld'

function shouldUseMobileSafe(){
 if(typeof navigator==='undefined'||typeof window==='undefined')return false
 const ua=navigator.userAgent||''
 const appleMobile=/iPhone|iPad|iPod/i.test(ua)
 const olderIOS=/OS (1[0-6])[_\d]* like Mac OS X/i.test(ua)
 const smallScreen=Math.min(window.innerWidth||9999,window.innerHeight||9999)<=480
 const cores=Number(navigator.hardwareConcurrency||8)
 return appleMobile&&(olderIOS||smallScreen||cores<=4)
}

export default function StreetVerseLivingWorldEntry({onClose}:{onClose:()=>void}){
 return shouldUseMobileSafe()?<StreetVerseMobileSafeWorld onClose={onClose}/>:<StreetVerseLivingWorld onClose={onClose}/>
}
