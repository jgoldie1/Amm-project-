import {Component,lazy,Suspense,useMemo,type ReactNode} from 'react'
import StreetVerseMobilePlayableWorld from './StreetVerseMobilePlayableWorld'
import StreetVerseMobileWalkControls from './StreetVerseMobileWalkControls'

// Heavy three.js worlds are lazy-loaded. This keeps the guaranteed safe-mode
// HTML city out of the Three.js/WebGL bundle on constrained mobile Safari.
const StreetVerseMobileWorld=lazy(()=>import('./StreetVerseMobileWorld'))
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

class StreetVerseWorldBoundary extends Component<{onClose:()=>void;children:ReactNode},{failed:boolean}>{
 state={failed:false}
 static getDerivedStateFromError(){return {failed:true}}
 componentDidCatch(error:unknown){console.error('[StreetVerse] 3D world failed; keeping safe city visible',error)}
 render(){return this.state.failed?<StreetVerseMobilePlayableWorld onClose={this.props.onClose}/>:this.props.children}
}

export default function StreetVersePlayableWorld({onClose}:{onClose:()=>void}){
 const mobile=useMemo(isMobileDevice,[])
 const safe=useMemo(shouldUseStreetVerseSafeMode,[])
 if(safe)return <StreetVerseMobilePlayableWorld onClose={onClose}/>
 if(mobile)return <StreetVerseWorldBoundary onClose={onClose}><Suspense fallback={<StreetVerseMobilePlayableWorld onClose={onClose}/>}><StreetVerseMobileWorld onClose={onClose}/></Suspense><StreetVerseMobileWalkControls/></StreetVerseWorldBoundary>
 return <StreetVerseWorldBoundary onClose={onClose}><Suspense fallback={<StreetVerseMobilePlayableWorld onClose={onClose}/>}><StreetVerseLivingWorld onClose={onClose}/></Suspense></StreetVerseWorldBoundary>
}
