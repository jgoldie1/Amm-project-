import {Component,lazy,Suspense,useEffect,useMemo,useState,type ReactNode} from 'react'
import StreetVerseMobilePlayableWorld from './StreetVerseMobilePlayableWorld'
import StreetVerseMobileWalkControls from './StreetVerseMobileWalkControls'

// Heavy three.js worlds are lazy-loaded. This keeps the guaranteed safe-mode
// HTML city out of the Three.js/WebGL bundle on constrained devices.
const StreetVerseMobileWorld=lazy(()=>import('./StreetVerseMobileWorld'))
const StreetVerseLivingWorld=lazy(()=>import('./StreetVerseLivingWorld'))

function isMobileDevice(){
 if(typeof navigator==='undefined')return false
 return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent||'')
}

function hasUsableWebGL(){
 if(typeof document==='undefined')return false
 try{
  const canvas=document.createElement('canvas')
  return !!(canvas.getContext('webgl2',{failIfMajorPerformanceCaveat:true})||canvas.getContext('webgl',{failIfMajorPerformanceCaveat:true})||canvas.getContext('experimental-webgl'))
 }catch{return false}
}

export function shouldUseStreetVerseSafeMode(){
 if(typeof navigator==='undefined'||typeof window==='undefined')return false
 const ua=navigator.userAgent||''
 const appleMobile=/iPhone|iPad|iPod/i.test(ua)
 const olderIOS=/OS (1[0-6])[_\d]* like Mac OS X/i.test(ua)
 const memory=Number((navigator as Navigator & {deviceMemory?:number}).deviceMemory||0)
 const cores=Number(navigator.hardwareConcurrency||0)
 const narrow=Math.min(window.innerWidth||9999,window.innerHeight||9999)<=480
 const constrained=(memory>0&&memory<=4)||(cores>0&&cores<=4)
 if(!hasUsableWebGL())return true
 return appleMobile&&(olderIOS||narrow||constrained)||(!appleMobile&&narrow&&constrained)
}

class StreetVerseWorldBoundary extends Component<{onClose:()=>void;children:ReactNode},{failed:boolean}>{
 state={failed:false}
 static getDerivedStateFromError(){return {failed:true}}
 componentDidCatch(error:unknown){console.error('[StreetVerse] 3D world failed; keeping safe city visible',error)}
 render(){return this.state.failed?<StreetVerseMobilePlayableWorld onClose={this.props.onClose}/>:this.props.children}
}

function MobileRuntimeGuard({onClose,children}:{onClose:()=>void;children:ReactNode}){
 const [safeFallback,setSafeFallback]=useState(false)
 useEffect(()=>{
  if(safeFallback||typeof window==='undefined')return
  let healthy=false
  let lastHeartbeat=performance.now()
  let failed=false
  const report=(state:'healthy'|'fallback',reason:string)=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-runtime-health',{detail:{state,reason,mode:state==='fallback'?'mobile-safe':'mobile-lite',selfHealing:true,at:new Date().toISOString()}}))
  const markHealthy=()=>{healthy=true;lastHeartbeat=performance.now()}
  const fail=(reason:string)=>{
   if(failed||document.visibilityState==='hidden')return
   failed=true
   report('fallback',reason)
   window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'StreetVerse 3D recovery activated • safe city is keeping gameplay available.'}}))
   setSafeFallback(true)
  }
  const onReady=(event:Event)=>{
   const detail=(event as CustomEvent<Record<string,unknown>>).detail||{}
   if(detail.mode==='mobile-lite'&&detail.canvas===true&&detail.htmlCity!==true){markHealthy();report('healthy','world-ready')}
  }
  const onPosition=(event:Event)=>{
   const detail=(event as CustomEvent<Record<string,unknown>>).detail||{}
   if(detail.mobileLite===true&&detail.htmlCity!==true&&detail.mobileSafeMode!==true)markHealthy()
  }
  const onContextLost=(event:Event)=>{
   const target=event.target as HTMLElement|null
   if(target?.tagName==='CANVAS'){
    if('preventDefault' in event)event.preventDefault()
    fail('webgl-context-lost')
   }
  }
  window.addEventListener('tryamm:streetverse-world-ready',onReady)
  window.addEventListener('tryamm:streetverse-player-position',onPosition)
  window.addEventListener('webglcontextlost',onContextLost,true)
  const bootTimer=window.setTimeout(()=>{if(!healthy)fail('mobile-webgl-no-heartbeat')},8000)
  const stallTimer=window.setInterval(()=>{if(healthy&&document.visibilityState==='visible'&&performance.now()-lastHeartbeat>10000)fail('mobile-webgl-stalled')},2500)
  return()=>{
   window.clearTimeout(bootTimer);window.clearInterval(stallTimer)
   window.removeEventListener('tryamm:streetverse-world-ready',onReady)
   window.removeEventListener('tryamm:streetverse-player-position',onPosition)
   window.removeEventListener('webglcontextlost',onContextLost,true)
  }
 },[safeFallback])
 if(safeFallback)return <StreetVerseMobilePlayableWorld onClose={onClose}/>
 return <>{children}</>
}

export default function StreetVersePlayableWorld({onClose}:{onClose:()=>void}){
 const mobile=useMemo(isMobileDevice,[])
 const safe=useMemo(shouldUseStreetVerseSafeMode,[])
 if(safe)return <StreetVerseMobilePlayableWorld onClose={onClose}/>
 if(mobile)return <StreetVerseWorldBoundary onClose={onClose}><MobileRuntimeGuard onClose={onClose}><Suspense fallback={<StreetVerseMobilePlayableWorld onClose={onClose}/>}><StreetVerseMobileWorld onClose={onClose}/></Suspense><StreetVerseMobileWalkControls/></MobileRuntimeGuard></StreetVerseWorldBoundary>
 return <StreetVerseWorldBoundary onClose={onClose}><Suspense fallback={<StreetVerseMobilePlayableWorld onClose={onClose}/>}><StreetVerseLivingWorld onClose={onClose}/></Suspense></StreetVerseWorldBoundary>
}
