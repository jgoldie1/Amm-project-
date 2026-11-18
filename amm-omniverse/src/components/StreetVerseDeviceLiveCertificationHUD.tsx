import {useState} from 'react'
type Result={name:string;state:'pass'|'fail'|'needs-device'|'not-configured';detail:string}
const btn:React.CSSProperties={minHeight:56,padding:'10px 12px',border:'1px solid #8fcde1',borderRadius:12,background:'#17465b',color:'#fff',fontWeight:800,touchAction:'manipulation'}
export default function StreetVerseDeviceLiveCertificationHUD(){
 const [open,setOpen]=useState(false)
 const [results,setResults]=useState<Result[]>([])
 const [working,setWorking]=useState(false)
 const [error,setError]=useState('')
 const probe=async()=>{
  setWorking(true);setError('')
  const a:Result[]=[]
  const add=(name:string,ok:boolean,detail:string):void=>{a.push({name,state:ok?'pass':'fail',detail})}
  add('Secure context',window.isSecureContext,'Needed for microphone, camera and most XR features')
  add('Pointer/touch controls',typeof PointerEvent!=='undefined','One-handed touch controller requires pointer events')
  add('TV keyboard navigation',typeof KeyboardEvent!=='undefined','Keyboard API present; physical remote requires separate test')
  add('Video playback',!!document.createElement('video').canPlayType,'Requires real codec/device playback verification')
  add('MediaRecorder',typeof MediaRecorder!=='undefined','Required for browser reels')
  add('Canvas streaming',typeof HTMLCanvasElement.prototype.captureStream==='function','Required for 30 sec game capture and canvas SFX')
  let gl:WebGLRenderingContext|null=null
  try{const c=document.createElement('canvas');gl=c.getContext('webgl2')||c.getContext('webgl')}catch{}
  add('WebGL rendering',!!gl,'A context was created; does not verify the main three-character scene')
  const xr=navigator as Navigator & {xr?:{isSessionSupported:(mode:'immersive-ar'|'immersive-vr')=>Promise<boolean>}}
  for(const mode of ['immersive-ar','immersive-vr'] as const){
   let ok=false
   try{ok=!!xr.xr&&await xr.xr.isSessionSupported(mode)}catch{}
   a.push({name:mode==='immersive-ar'?'AR session support':'VR session support',state:ok?'needs-device':'fail',detail:ok?'Browser advertises support; a headset session still must be entered and tested':'No supported immersive session detected in this browser'})
  }
  try{
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6000)
   try{
    const response=await fetch('/api/live/status',{cache:'no-store',signal:controller.signal})
    if(!response.ok)throw new Error('HTTP '+response.status)
    const body=await response.json() as Record<string,unknown>
    const configured=body.configured===true
    a.push({name:'LIVE configuration',state:configured?'needs-device':'not-configured',detail:configured?'Server reports configured; private two-device session and OBS ingest remain unverified':'Server reports unconfigured; no stream credentials or live operation established'})
   }finally{clearTimeout(timer)}
  }catch(e){a.push({name:'LIVE configuration',state:'fail',detail:e instanceof Error?e.message:'Status endpoint unavailable'})}
  a.push({name:'Real device acceptance',state:'needs-device',detail:'Open actual iPhone/iPad/tablet/TV/AR/VR session; report controls, animation, audio and errors'})
  a.push({name:'OBS ingest and LiveKit room',state:'needs-device',detail:'Endpoint status does not establish working private OBS ingest or an active LiveKit host/viewer session'})
  a.push({name:'CGI and stunt certification',state:'needs-device',detail:'Canvas effects are simulated video postprocessing, not motion-captured stunts or validated character animation'})
  setResults(a);setWorking(false)
 }
 const exportReport=()=>{
  const payload={schema:'streetverse.device-live-certification.v1',results,device:navigator.userAgent,viewport:{width:innerWidth,height:innerHeight},exportedAt:new Date().toISOString(),certified:false,notes:'Browser capability checks are not production-device certification.'}
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}))
  const a=document.createElement('a');a.href=url;a.download='StreetVerse_Device_Live_Certification_Report.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)
 }
 return <aside style={{position:'fixed',right:8,top:'max(180px,env(safe-area-inset-top) + 160px)',zIndex:42017,color:'#fff',fontFamily:'system-ui'}}>
  <button style={btn} onClick={()=>setOpen(x=>!x)} aria-expanded={open}>📱 XR / LIVE TEST</button>
  {open&&<section role="region" aria-label="StreetVerse device and LIVE readiness" style={{marginTop:8,width:'min(420px,calc(100vw - 16px))',maxHeight:'65dvh',overflowY:'auto',background:'#081725f5',padding:12,borderRadius:14,border:'1px solid #689cb1',display:'grid',gap:9}}>
   <strong>Device, AR/VR and OBS/LIVE readiness</strong>
   <p style={{margin:0,fontSize:13}}>Run on each actual device. This diagnostic does not send personal information or connect to an unverified stream.</p>
   <button style={btn} onClick={()=>{void probe()}} disabled={working}>{working?'CHECKING…':'ONE PUSH DEVICE + LIVE TEST'}</button>
   {results.map(x=><div key={x.name} style={{borderBottom:'1px solid #315365',paddingBottom:5,fontSize:13}}><b>{x.state==='pass'?'✓':x.state==='fail'?'✕':'○'} {x.name} · {x.state}</b><div>{x.detail}</div></div>)}
   {error&&<p>{error}</p>}
   <button style={btn} onClick={exportReport} disabled={!results.length}>EXPORT TEST REPORT</button>
   <small>OBS RTMP ingest and LiveKit require secured server-side keys, authorized participants and actual end-to-end test. Never paste stream secrets into this form.</small>
  </section>}
 </aside>
}
