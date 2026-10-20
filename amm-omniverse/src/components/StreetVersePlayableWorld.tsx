import {Component,lazy,Suspense,useEffect,useMemo,useState,type ReactNode} from 'react'
import StreetVerseSafeWorld from './StreetVerseSafeWorld'
import StreetVerseWeatherSync from './StreetVerseWeatherSync'
import StreetVerseMobileGameShell from './StreetVerseMobileGameShell'

const StreetVerseMobileWorld=lazy(()=>import('./StreetVerseMobileWorld'))
const StreetVerseLivingWorld=lazy(()=>import('./StreetVerseLivingWorld'))

function isMobileDevice(){if(typeof navigator==='undefined')return false;return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent||'')}
function hasUsableWebGL(){
 if(typeof document==='undefined')return false
 const canvas=document.createElement('canvas')
 let gl:WebGLRenderingContext|WebGL2RenderingContext|null=null
 try{
  gl=(canvas.getContext('webgl2',{powerPreference:'low-power'})||
      canvas.getContext('webgl',{powerPreference:'low-power'})||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext|WebGL2RenderingContext|null
  return Boolean(gl)
 }catch{return false}
 finally{
  try{gl?.getExtension('WEBGL_lose_context')?.loseContext()}catch{}
  canvas.width=0;canvas.height=0
 }
}
export function shouldUseStreetVerseSafeMode(){
 if(typeof navigator==='undefined'||typeof window==='undefined')return false
 const ua=navigator.userAgent||''
 const appleMobile=/iPhone|iPad|iPod/i.test(ua)
 // Apple's capability probe can fail temporarily even when the Three.js renderer can start.
 if(appleMobile)return false
 const memory=Number((navigator as Navigator & {deviceMemory?:number}).deviceMemory||0)
 const cores=Number(navigator.hardwareConcurrency||0)
 const narrow=Math.min(window.innerWidth||9999,window.innerHeight||9999)<=480
 const constrained=(memory>0&&memory<=4)||(cores>0&&cores<=4)
 if(!hasUsableWebGL())return true
 return narrow&&constrained
}
class StreetVerseWorldBoundary extends Component<{onClose:()=>void;children:ReactNode},{failed:boolean}>{
 state={failed:false}
 static getDerivedStateFromError(){return {failed:true}}
 componentDidCatch(error:unknown){
  console.error('[StreetVerse] 3D world failed; recovery view available',error)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-runtime-health',{detail:{state:'fallback',reason:'3d-runtime-exception',mode:'mobile-safe',at:new Date().toISOString()}}))
 }
 render(){
  if(!this.state.failed)return this.props.children
  return <>
   <StreetVerseSafeWorld onClose={this.props.onClose}/>
   <div data-streetverse-render-mode="exception-fallback" role="status" style={{position:'fixed',top:75,left:12,zIndex:41000,maxWidth:'min(84vw,310px)',padding:12,borderRadius:14,background:'#101725f2',border:'1px solid #ff9f80',color:'#fff',fontFamily:'system-ui,sans-serif'}}>
    <div style={{fontWeight:900,fontSize:12,marginBottom:7}}>3D scene could not load. Your city is safe.</div>
    <button aria-label="Retry StreetVerse 3D scene" onClick={()=>this.setState({failed:false})} style={{minHeight:48,padding:'9px 15px',background:'#14545c',border:'1px solid #8fffe2',borderRadius:9,color:'#fff',fontWeight:900}}>RETRY 3D</button>
   </div>
  </>
 }
}
function MobileLoading(){return <div aria-label="StreetVerse 3D loading" style={{position:'fixed',inset:0,zIndex:14990,display:'grid',placeItems:'center',background:'#07101d',color:'#fff',fontFamily:'system-ui',fontWeight:900}}>STREETVERSE • STARTING 3D…</div>}
function MobileRuntimeGuard({onClose,children}:{onClose:()=>void;children:ReactNode}){const [safeFallback,setSafeFallback]=useState(false);const [failureReason,setFailureReason]=useState('webgl-context-lost');useEffect(()=>{if(safeFallback||typeof window==='undefined')return;let healthy=false,lastHeartbeat=performance.now(),failed=false;const report=(state:'healthy'|'fallback',reason:string)=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-runtime-health',{detail:{state,reason,mode:state==='fallback'?'mobile-safe':'mobile-lite',selfHealing:true,at:new Date().toISOString()}}));const markHealthy=()=>{healthy=true;lastHeartbeat=performance.now()};const fail=(reason:string)=>{if(failed||document.visibilityState==='hidden')return;failed=true;setFailureReason(reason);report('fallback',reason);window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'StreetVerse 3D recovery activated • safe city is keeping gameplay available.'}}));setSafeFallback(true)};const onReady=(event:Event)=>{const detail=(event as CustomEvent<Record<string,unknown>>).detail||{};if(detail.mode==='mobile-lite'&&detail.canvas===true&&detail.htmlCity!==true){markHealthy();report('healthy','world-ready')}};const onPosition=(event:Event)=>{const detail=(event as CustomEvent<Record<string,unknown>>).detail||{};if(detail.mobileLite===true&&detail.htmlCity!==true&&detail.mobileSafeMode!==true)markHealthy()};const onRendererFailed=(event:Event)=>{const detail=(event as CustomEvent<{reason?:string}>).detail;fail(detail?.reason||'webgl-renderer-failed')};const onContextLost=(event:Event)=>{const target=event.target as HTMLElement|null;if(target?.tagName==='CANVAS'&&target.parentElement?.matches('[data-streetverse-world-root="true"]')){if('preventDefault' in event)event.preventDefault();fail('webgl-context-lost')}};window.addEventListener('tryamm:streetverse-world-ready',onReady);window.addEventListener('tryamm:streetverse-player-position',onPosition);window.addEventListener('webglcontextlost',onContextLost,true);window.addEventListener('tryamm:streetverse-renderer-failed',onRendererFailed);const bootTimer=window.setTimeout(()=>{if(!healthy)console.warn('[StreetVerse] 3D startup remains unverified; waiting for real canvas readiness')},20000);const stallTimer=window.setInterval(()=>{if(healthy&&document.visibilityState==='visible'&&performance.now()-lastHeartbeat>30000)report('healthy','mobile-heartbeat-delayed')},5000);return()=>{window.clearTimeout(bootTimer);window.clearInterval(stallTimer);window.removeEventListener('tryamm:streetverse-world-ready',onReady);window.removeEventListener('tryamm:streetverse-player-position',onPosition);window.removeEventListener('webglcontextlost',onContextLost,true);window.removeEventListener('tryamm:streetverse-renderer-failed',onRendererFailed)}},[safeFallback]);if(safeFallback)return <><StreetVerseSafeWorld onClose={onClose}/><div data-streetverse-render-mode="context-loss-fallback" role="status" style={{position:'fixed',top:75,left:12,zIndex:41000,padding:'10px 12px',borderRadius:13,maxWidth:'min(84vw,300px)',background:'#33151bef',border:'1px solid #ffb58b',color:'#fff',fontFamily:'system-ui',fontSize:12}}><div style={{fontWeight:900,marginBottom:6}}>3D paused • {failureReason}</div><button aria-label="Retry StreetVerse 3D after graphics interruption" onClick={()=>setSafeFallback(false)} style={{minHeight:48,padding:'9px 15px',borderRadius:9,background:'#124f5b',border:'1px solid #90efea',color:'#fff',fontWeight:900}}>RETRY 3D</button></div></>;return <>{children}</>}
export default function StreetVersePlayableWorld({onClose}:{onClose:()=>void}){
 const safe=useMemo(shouldUseStreetVerseSafeMode,[])
 const mobile=useMemo(isMobileDevice,[])
 if(safe)return <><StreetVerseWeatherSync/><StreetVerseSafeWorld onClose={onClose}/><StreetVerseMobileGameShell onClose={onClose}/></>
 if(mobile)return <><StreetVerseWeatherSync/><StreetVerseWorldBoundary onClose={onClose}><MobileRuntimeGuard onClose={onClose}><Suspense fallback={<MobileLoading/>}><StreetVerseMobileWorld onClose={onClose}/></Suspense></MobileRuntimeGuard></StreetVerseWorldBoundary></>
 return <><StreetVerseWeatherSync/><StreetVerseWorldBoundary onClose={onClose}><Suspense fallback={<MobileLoading/>}><StreetVerseLivingWorld onClose={onClose}/></Suspense></StreetVerseWorldBoundary></>
}