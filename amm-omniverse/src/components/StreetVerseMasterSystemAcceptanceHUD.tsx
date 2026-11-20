import {useEffect,useRef,useState} from 'react'
import {STREETVERSE_DIRECTOR_MISSIONS,validateStreetVerseDirectorCatalog} from '../data/StreetVerse100MissionDirector'
import {createVehicleState,stepVehicle} from '../runtime/StreetVerseVehicleDynamics.mjs'
import {createMultiMediumVehicleState,stepMultiMediumVehicle,safeMultiMediumTelemetry} from '../runtime/StreetVerseMultiMediumVehicleDynamics.mjs'

type Status='pass'|'fail'|'needs-device'|'not-configured'
type Check={id:string;label:string;status:Status;detail:string;critical:boolean}
type ThreeCastRow={loaded?:boolean;movement?:boolean;vehicle?:boolean;mission?:boolean;business?:boolean;reel?:boolean;returned?:boolean;loopComplete?:boolean;clips?:number;source?:string;name?:string}
const btn:React.CSSProperties={minHeight:58,borderRadius:13,padding:'10px 14px',border:'1px solid #9fe6ff',background:'#12465e',color:'#fff',fontWeight:900,fontSize:15,touchAction:'manipulation'}
const sleep=(ms:number)=>new Promise(resolve=>window.setTimeout(resolve,ms))
function readJson<T>(key:string,fallback:T):T{try{return JSON.parse(sessionStorage.getItem(key)||'null')||fallback}catch{return fallback}}
function readTerminalFailure():any{try{return JSON.parse(sessionStorage.getItem('tryamm.streetverse.acceptance-terminal-failure.v1')||'null')}catch{return null}}
function waitForEvent(name:string,timeout=5000):Promise<any>{return new Promise((resolve,reject)=>{const timer=window.setTimeout(()=>{window.removeEventListener(name,onEvent);reject(Error(name+' timed out'))},timeout);function onEvent(e:Event){window.clearTimeout(timer);window.removeEventListener(name,onEvent);resolve((e as CustomEvent<any>).detail||{})}window.addEventListener(name,onEvent)})}
function download(report:any){try{localStorage.setItem('tryamm.streetverse.master-system-report.v1',JSON.stringify(report))}catch{};const u=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='StreetVerse_Master_System_Acceptance_Report.json';document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(u),1200)}
export default function StreetVerseMasterSystemAcceptanceHUD(){
 const auto=new URLSearchParams(location.search).get('master')==='1'
 const [open,setOpen]=useState(auto),[running,setRunning]=useState(false),[checks,setChecks]=useState<Check[]>([]),[status,setStatus]=useState('WAITING • COMPLETE BJ → JACOBIE → LATEASIA FIRST'),[report,setReport]=useState<any>(null),[characterReady,setCharacterReady]=useState(false),[terminalFailure,setTerminalFailure]=useState<any>(()=>readTerminalFailure())
 const started=useRef(false)
 const add=(list:Check[],id:string,label:string,status:Status,detail:string,critical=true)=>{list.push({id,label,status,detail,critical});setChecks([...list])}
 const run=async()=>{
  if(running)return
  const seqNow=readJson<string[]>('tryamm.streetverse.acceptance-sequence.v1',[])
  const terminalNow=readTerminalFailure()
  if(seqNow.length!==3&&!terminalNow){setStatus('WAITING • FINISH THE 3-CHARACTER TEST FIRST');return}
  setRunning(true);setOpen(true);setChecks([]);setStatus('RUNNING • MASTER SYSTEM ACCEPTANCE')
  const out:Check[]=[]
  const three=readJson<Record<string,ThreeCastRow>>('tryamm.streetverse.three-cast-evidence.v1',{})
  const sequence=readJson<string[]>('tryamm.streetverse.acceptance-sequence.v1',[])
  const characterFailure=readTerminalFailure()
  const castIds=[['bj-stubbs','BJ Stubbs'],['jacobie-stubbs','Jacobie Stubbs'],['lateasia-monroe','LaTeasia Monroe']] as const
  for(const [id,name] of castIds){
    const r=three[id]||{}
    const done=Boolean(r.loaded&&r.movement&&r.vehicle&&r.mission&&r.business&&r.reel&&r.returned&&r.loopComplete)
    const failedCharacter=characterFailure&&String(characterFailure.character||'')===name
    if(failedCharacter){
      add(out,'cast-'+id,name+' 7/7 route','fail',`Exact acceptance failure: ${String(characterFailure.failedLabel||characterFailure.failedStep||'unknown step')}`)
    }else if(sequence.length===3){
      add(out,'cast-'+id,name+' 7/7 route',done?'pass':'fail',done?`Rig + movement + vehicle + mission + business + HoloReel + return verified. Clips: ${Number(r.clips||0)}.`:`Missing evidence: ${['loaded','movement','vehicle','mission','business','reel','returned','loopComplete'].filter(k=>!(r as any)[k]).join(', ')||'unknown'}`)
    }else{
      add(out,'cast-'+id,name+' 7/7 route','needs-device','Not reached because the character sequence stopped before this route completed',false)
    }
  }
  add(out,'cast-sequence','Three-character route order',sequence.length===3&&['bj','jacobie','lateasia'].every(x=>sequence.includes(x))?'pass':characterFailure?'fail':'needs-device',sequence.length===3?'BJ → Jacobie → LaTeasia sequence recorded':characterFailure?`Sequence stopped at ${String(characterFailure.character||'unknown')} • ${String(characterFailure.failedLabel||characterFailure.failedStep||'unknown step')}`:'Sequence not complete',Boolean(characterFailure))

  const canvas=document.querySelector('canvas')
  add(out,'canvas','StreetVerse gameplay canvas',canvas?'pass':'fail',canvas?'Gameplay canvas mounted':'No gameplay canvas found')
  let webgl=false
  try{webgl=Array.from(document.querySelectorAll('canvas')).some(c=>Boolean(c.getContext('webgl2')||c.getContext('webgl')))}catch{}
  add(out,'webgl','WebGL rendering capability',webgl?'pass':'fail',webgl?'WebGL context available on this browser':'WebGL unavailable')

  const catalog=validateStreetVerseDirectorCatalog()
  const catalogPass=STREETVERSE_DIRECTOR_MISSIONS.length===100&&Boolean(catalog.unique)
  add(out,'director100','Director 100 mission catalog',catalogPass?'pass':'fail',`${STREETVERSE_DIRECTOR_MISSIONS.length}/100 missions; unique catalog: ${Boolean(catalog.unique)}`,false)

  try{
    let car=createVehicleState('car')
    for(let i=0;i<240;i++)car=stepVehicle(car,{throttle:1,brake:0,steer:i<120?.25:0,gear:'D',parkingBrake:false,surface:'dry'},1/60)
    add(out,'ground-vehicle','Ground car dynamics',car.distance>5&&Math.abs(car.speed)>1?'pass':'fail',`Distance ${car.distance.toFixed(1)}m; speed ${(car.speed*3.6).toFixed(0)} km/h`)
  }catch(e){add(out,'ground-vehicle','Ground car dynamics','fail',String(e))}

  try{
    let fly=createMultiMediumVehicleState('flyingCar')
    for(let i=0;i<240;i++)fly=stepMultiMediumVehicle(fly,{throttle:.75,yaw:.15,roll:.2,vertical:1,flightMode:'flight'},1/60)
    const airborne=fly.y>1&&fly.flightMode==='flight'
    const peak=fly.y
    for(let i=0;i<360;i++)fly=stepMultiMediumVehicle(fly,{throttle:.25,vertical:-1,flightMode:'ground'},1/60)
    const landed=fly.flightMode==='ground'&&fly.y===0
    add(out,'flying-car','Flying-car drive / fly / land dynamics',airborne&&landed?'pass':'fail',`Peak altitude ${peak.toFixed(1)}m; final mode ${String(fly.flightMode)}; final altitude ${fly.y.toFixed(1)}m`)
  }catch(e){add(out,'flying-car','Flying-car drive / fly / land dynamics','fail',String(e))}

  for(const kind of ['helicopter','airplane','jet'] as const){
    try{
      let s=createMultiMediumVehicleState(kind)
      for(let i=0;i<300;i++)s=stepMultiMediumVehicle(s,{throttle:1,vertical:1,yaw:.1},1/60)
      const t=safeMultiMediumTelemetry(s)
      const pass=t.speedKmh>0&&(kind==='helicopter'?t.altitudeMeters>2:true)
      add(out,'air-'+kind,kind[0].toUpperCase()+kind.slice(1)+' gameplay dynamics',pass?'pass':'fail',`Speed ${t.speedKmh} km/h; altitude ${t.altitudeMeters}m; simplified gameplay physics`,false)
    }catch(e){add(out,'air-'+kind,kind+' gameplay dynamics','fail',String(e),false)}
  }
  for(const kind of ['boat','yacht','ship'] as const){
    try{
      let s=createMultiMediumVehicleState(kind)
      for(let i=0;i<300;i++)s=stepMultiMediumVehicle(s,{throttle:1,yaw:.2,roll:.2},1/60)
      const t=safeMultiMediumTelemetry(s)
      add(out,'water-'+kind,kind[0].toUpperCase()+kind.slice(1)+' gameplay dynamics',t.afloat&&t.speedKmh>0?'pass':'fail',`Speed ${t.speedKmh} km/h; afloat ${t.afloat}; simplified water physics`,false)
    }catch(e){add(out,'water-'+kind,kind+' gameplay dynamics','fail',String(e),false)}
  }

  try{
    const medical=waitForEvent('tryamm:streetverse-medical-rp-test-result',3500)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-medical-rp-test-all',{detail:{source:'master-system-test'}}))
    const m=await medical
    const complete=Array.isArray(m.completed)&&m.completed.length===10
    add(out,'medical-rp','Medical RP ten-scenario branch test',complete?'pass':'fail',complete?'10/10 fictional scenarios completed in preview':'Medical RP result did not report all ten scenarios',false)
  }catch(e){add(out,'medical-rp','Medical RP ten-scenario branch test','fail',String(e),false)}

  add(out,'reel-capability','HoloReel browser capability',typeof MediaRecorder!=='undefined'&&typeof HTMLCanvasElement.prototype.captureStream==='function'?'pass':'fail',typeof MediaRecorder!=='undefined'?'MediaRecorder and canvas capture available':'MediaRecorder unavailable')
  try{
    const feedback=waitForEvent('tryamm:streetverse-parkour-feedback',2500)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-parkour-action',{detail:{action:'jump',source:'master-system-test'}}))
    const p=await feedback
    add(out,'parkour','Parkour / jump runtime wiring','pass',String(p.message||'Runtime feedback event observed'),false)
  }catch(e){add(out,'parkour','Parkour / jump runtime wiring','fail',String(e),false)}

  add(out,'pointer','One-hand pointer controls',typeof PointerEvent!=='undefined'?'pass':'fail',typeof PointerEvent!=='undefined'?'PointerEvent supported':'PointerEvent unavailable')
  add(out,'secure-context','Secure browser context',window.isSecureContext?'pass':'fail',window.isSecureContext?'Secure context active':'Secure context unavailable')

  try{
    const controller=new AbortController(),timer=window.setTimeout(()=>controller.abort(),6000)
    try{
      const res=await fetch('/api/live/status',{cache:'no-store',signal:controller.signal})
      if(!res.ok)throw Error('HTTP '+res.status)
      const body=await res.json() as Record<string,unknown>
      add(out,'live-config','LIVE / OBS configuration',body.configured===true?'needs-device':'not-configured',body.configured===true?'Server reports configured; two-device LiveKit room and OBS ingest still require end-to-end test':'Server reports LIVE not configured',false)
    }finally{window.clearTimeout(timer)}
  }catch(e){add(out,'live-config','LIVE / OBS configuration','fail','Status endpoint failed: '+String(e),false)}

  add(out,'physical-device','Physical Chromebook / phone visual acceptance','needs-device','Human must confirm character likeness, controls, camera, audio, flying-car visuals and scene stability on the actual device',false)
  add(out,'rapier-flight','Full Rapier / aerodynamic / buoyancy certification','needs-device','Current air/water profiles are simplified gameplay physics; full collision/aerodynamics/buoyancy remain unverified',false)

  const firstFailure=out.find(c=>c.status==='fail')||null
  const blockers=out.filter(c=>c.status==='needs-device'||c.status==='not-configured')
  const automatedPass=!firstFailure
  const launchReady=automatedPass&&blockers.length===0
  const payload={schema:'streetverse.master-system-acceptance.v1',generatedAt:new Date().toISOString(),device:navigator.userAgent,route:location.href,automatedPass,launchReady,firstFailure,blockers,summary:{pass:out.filter(c=>c.status==='pass').length,fail:out.filter(c=>c.status==='fail').length,needsDevice:out.filter(c=>c.status==='needs-device').length,notConfigured:out.filter(c=>c.status==='not-configured').length,total:out.length},checks:out,note:'Master acceptance separates automated runtime evidence from physical-device, production-streaming, full aerodynamics and buoyancy certification. No unverified system is promoted to PASS.'}
  setReport(payload);download(payload);setStatus(firstFailure?'FIRST FAILURE • '+firstFailure.label.toUpperCase():blockers.length?'AUTOMATED PASS • '+blockers.length+' LAUNCH BLOCKER(S) REMAIN':'PASS • MASTER SYSTEM ACCEPTANCE');setRunning(false)
 }
 useEffect(()=>{
   if(!auto||started.current)return
   const check=()=>{
     const seq=readJson<string[]>('tryamm.streetverse.acceptance-sequence.v1',[])
     const failure=readTerminalFailure()
     setCharacterReady(seq.length===3)
     setTerminalFailure(failure)
     if(seq.length===3||failure){
       window.clearInterval(timer)
       started.current=true
       window.setTimeout(()=>void run(),500)
     }else{
       setStatus('WAITING • BJ → JACOBIE → LATEASIA ACCEPTANCE')
     }
   }
   const timer=window.setInterval(check,500)
   check()
   return()=>window.clearInterval(timer)
 },[auto])
 return <aside style={{position:'fixed',left:'50%',transform:'translateX(-50%)',top:'calc(env(safe-area-inset-top) + 70px)',zIndex:58000,fontFamily:'system-ui,sans-serif',pointerEvents:'none'}}>
  <div style={{pointerEvents:'auto'}}>
   {!open&&<button style={btn} onClick={()=>setOpen(true)}>🧪 MASTER TEST</button>}
   {open&&<section style={{width:'min(92vw,620px)',maxHeight:'76dvh',overflowY:'auto',display:'grid',gap:9,padding:14,borderRadius:18,border:'3px solid '+(report?.firstFailure?'#ff8f8f':report?'#8effb0':'#82cfff'),background:'rgba(5,16,27,.98)',color:'#fff',boxShadow:'0 18px 70px #000d'}}>
    <strong style={{fontSize:24,textAlign:'center'}}>STREETVERSE MASTER SYSTEM TEST</strong>
    <div role="status" aria-live="polite" style={{padding:10,borderRadius:10,background:'#101f2b',fontWeight:950,textAlign:'center'}}>{status}</div>
    <button style={btn} onClick={()=>{void run()}} disabled={running||(!characterReady&&!terminalFailure)}>{running?'RUNNING EVERYTHING…':characterReady?'▶ RUN BIG TEST + EXPORT REPORT':terminalFailure?'▶ BUILD MASTER REPORT FROM FIRST FAILURE':'WAITING FOR 3-CHARACTER TEST…'}</button>
    {checks.map(c=><div key={c.id} style={{fontSize:12,padding:'7px 8px',borderRadius:9,background:c.status==='pass'?'#123d29':c.status==='fail'?'#521f1f':'#39321a'}}><b>{c.status==='pass'?'✓':c.status==='fail'?'✕':'○'} {c.label} • {c.status.toUpperCase()}</b><div>{c.detail}</div></div>)}
    {report&&<div style={{padding:12,borderRadius:12,border:'2px solid '+(report.firstFailure?'#ff8f8f':'#8effb0'),fontWeight:900,textAlign:'center'}}>{report.firstFailure?'FIRST FAILURE: '+report.firstFailure.label:report.blockers.length?'AUTOMATED PASS • '+report.blockers.length+' BLOCKERS REMAIN':'MASTER PASS'}</div>}
    {report&&<button style={btn} onClick={()=>download(report)}>EXPORT MASTER REPORT AGAIN</button>}
    <button style={{...btn,background:'#27384a'}} onClick={()=>setOpen(false)} aria-label="Minimize master test and return to gameplay">▼ MINIMIZE • RETURN TO GAME</button>
   </section>}
  </div>
 </aside>
}
