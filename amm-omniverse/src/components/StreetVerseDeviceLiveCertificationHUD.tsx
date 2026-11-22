import {useState} from 'react'
type Result={name:string;state:'pass'|'fail'|'needs-device'|'not-configured';detail:string}
const btn:React.CSSProperties={minHeight:50,padding:'9px 12px',border:'2px solid #fff',borderRadius:12,background:'#17465b',color:'#fff',fontWeight:900,touchAction:'manipulation'}
export default function StreetVerseDeviceLiveCertificationHUD(){
 const [open,setOpen]=useState(false)
 const [results,setResults]=useState<Result[]>([])
 const [working,setWorking]=useState(false)
 const probe=async()=>{
  setWorking(true)
  const a:Result[]=[]
  const add=(name:string,ok:boolean,detail:string):void=>{a.push({name,state:ok?'pass':'fail',detail})}
  add('Secure context',window.isSecureContext,'Needed for microphone, camera and most XR features')
  add('Pointer/touch controls',typeof PointerEvent!=='undefined','One-handed touch controller requires pointer events')
  add('TV keyboard navigation',typeof KeyboardEvent!=='undefined','Keyboard API present; physical remote requires separate test')
  const video=document.createElement('video')
  add('Video playback','canPlayType' in video,'Requires real codec/device playback verification')
  add('MediaRecorder',typeof MediaRecorder!=='undefined','Required for browser reels')
  add('Canvas streaming',typeof HTMLCanvasElement.prototype.captureStream==='function','Required for 30 sec game capture and canvas SFX')
  let gl:WebGLRenderingContext|WebGL2RenderingContext|null=null
  try{const c=document.createElement('canvas');gl=c.getContext('webgl2')||c.getContext('webgl')}catch{}
  add('WebGL rendering',!!gl,'A context was created; does not verify the main three-character scene')
  try{
   const response=await fetch('/api/live/status',{cache:'no-store'})
   if(!response.ok)throw new Error('HTTP '+response.status)
   const body=await response.json() as Record<string,unknown>
   const configured=body.configured===true
   a.push({name:'LIVE configuration',state:configured?'needs-device':'not-configured',detail:configured?'Server configured; device/OBS acceptance remains':'Server reports unconfigured'})
  }catch(e){a.push({name:'LIVE configuration',state:'fail',detail:e instanceof Error?e.message:'Status endpoint unavailable'})}
  a.push({name:'Real device acceptance',state:'needs-device',detail:'Needs actual Chromebook/iPhone host-viewer test'})
  a.push({name:'OBS ingest and LiveKit room',state:'needs-device',detail:'Needs private OBS and active room test'})
  setResults(a);setWorking(false)
 }
 const exportReport=()=>{
  const payload={schema:'streetverse.device-live-certification.v2',results,device:navigator.userAgent,viewport:{width:innerWidth,height:innerHeight},exportedAt:new Date().toISOString(),certified:false}
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}))
  const a=document.createElement('a');a.href=url;a.download='StreetVerse_Device_Live_Certification_Report.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)
 }
 return <aside style={{position:'fixed',left:8,top:'calc(env(safe-area-inset-top, 0px) + 8px)',zIndex:2147483647,color:'#fff',fontFamily:'system-ui',pointerEvents:'none'}}>
  {!open&&<button style={{...btn,pointerEvents:'auto',minHeight:46,fontSize:15,padding:'8px 12px',boxShadow:'0 6px 18px #000c'}} onClick={()=>setOpen(true)} aria-expanded={false}>📱 LIVE TEST</button>}
  {open&&<section role="region" aria-label="StreetVerse device and LIVE readiness" style={{pointerEvents:'auto',width:'min(360px,calc(100vw - 16px))',maxHeight:'58dvh',overflowY:'auto',background:'#081725f7',padding:10,borderRadius:14,border:'2px solid #fff',display:'grid',gap:8,boxShadow:'0 10px 30px #000c'}}>
   <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8,alignItems:'center'}}>
    <strong style={{fontSize:15}}>LIVE / DEVICE TEST</strong>
    <button style={{...btn,minHeight:40,padding:'6px 10px',fontSize:14,background:'#3a4650'}} onClick={()=>setOpen(false)}>— MINIMIZE</button>
   </div>
   <button style={btn} onClick={()=>{void probe()}} disabled={working}>{working?'CHECKING…':'▶ RUN ONE PUSH TEST'}</button>
   <button style={{...btn,background:'#2457a7'}} onClick={()=>{window.location.href='/live-test.html'}}>↗ OPEN FULL TEST PAGE</button>
   {results.map(x=><div key={x.name} style={{borderBottom:'1px solid #315365',paddingBottom:5,fontSize:12}}><b>{x.state==='pass'?'✓':x.state==='fail'?'✕':'○'} {x.name}</b><div>{x.detail}</div></div>)}
   <button style={{...btn,background:'#1f5fa8'}} onClick={exportReport} disabled={!results.length}>⬇ EXPORT REPORT</button>
  </section>}
 </aside>
}
