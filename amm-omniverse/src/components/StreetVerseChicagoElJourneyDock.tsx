import {useMemo,useState} from 'react'
import {CHICAGO_EL_JOURNEY_STAGES,CHICAGO_EL_JOURNEY_SCHEMA,advanceChicagoElJourney,newChicagoElJourney,runChicagoElOnePushTest,saveRestoreChicagoElJourney,validateChicagoElJourney,type JourneyState} from '../runtime/StreetVerseChicagoElJourney.mjs'
import {detectTryammCrossPlatformRuntime} from '../runtime/TryammCrossPlatformRuntime'
const btn:React.CSSProperties={minHeight:50,padding:'10px 14px',borderRadius:12,border:'1px solid #60dce9',background:'#0d3c51',color:'white',fontWeight:850,touchAction:'manipulation',cursor:'pointer'}
const load=():JourneyState=>{try{const x=JSON.parse(localStorage.getItem(CHICAGO_EL_JOURNEY_SCHEMA)||'null');if(validateChicagoElJourney(x))return x}catch{}return newChicagoElJourney()}
const download=(body:unknown,file:string)=>{const blob=new Blob([JSON.stringify(body,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
type Evidence={platform:string;webgl:boolean;micPermission:'not-requested'|'granted'|'denied-or-unavailable';localSave:boolean;networkOnline:boolean;livekitReconnectTested:false;threeDBoardingCertified:false;deviceManuallyVerified:false}
export default function StreetVerseChicagoElJourneyDock({onClose}:{onClose:()=>void}){
 const [state,setState]=useState<JourneyState>(load),[pose,setPose]=useState<'sit'|'hold-rail'>('hold-rail')
 const [notice,setNotice]=useState('Start at the fictional West Side platform. This is a real interactive mission-state simulator, not live 3D boarding.')
 const [evidence,setEvidence]=useState<Evidence|null>(null)
 const step=CHICAGO_EL_JOURNEY_STAGES[state.stage]
 const runtime=useMemo(()=>detectTryammCrossPlatformRuntime(),[])
 const save=(next:JourneyState)=>{setState(next);try{localStorage.setItem(CHICAGO_EL_JOURNEY_SCHEMA,JSON.stringify(next))}catch{setNotice('In-memory only: browser storage unavailable.')}}
 const act=()=>{if(!step)return;const r=advanceChicagoElJourney(state,step.action,{pose,eventId:'manual-step-'+state.stage});if(r.ok){save(r.state);setNotice(r.reason)}else setNotice(r.reason)}
 const onSave=()=>{const result=saveRestoreChicagoElJourney(state,localStorage);setState(result.state);setNotice(result.reason)}
 const test=()=>{const report=runChicagoElOnePushTest(localStorage);const next=load();setState(next);setNotice(report.passed?'7/7 simulated actions + local save/reload passed. Real train boarding and device approval remain unverified.':'One-push acceptance test failed. Check device storage permissions.');try{download(report,'streetverse-chicago-el-journey-acceptance.json')}catch{setNotice('Test finished; browser download unavailable.')}}
 const deviceTest=()=>{let localSave=false;try{const k='tryamm:native-release-write-test';localStorage.setItem(k,'yes');localSave=localStorage.getItem(k)==='yes';localStorage.removeItem(k)}catch{}const next:Evidence={platform:runtime.shell,webgl:runtime.webgl,micPermission:'not-requested',localSave,networkOnline:navigator.onLine,livekitReconnectTested:false,threeDBoardingCertified:false,deviceManuallyVerified:false};setEvidence(next);try{download({schema:'tryamm.streetverse.native-release-gate.v1',createdAt:new Date().toISOString(),...next,notes:['This checks only the device currently in use, not all three devices.','WebGL is a presence check, not a 3D frame-rate test.','Mic consent and LiveKit reconnect need separate real tests.']},'streetverse-current-device-release-evidence.json')}catch{}}
 const micTest=async()=>{try{if(!navigator.mediaDevices?.getUserMedia)throw Error('Microphone API unavailable');const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});stream.getTracks().forEach(t=>t.stop());setEvidence(v=>({...v,platform:runtime.shell,webgl:runtime.webgl,localSave:false,networkOnline:navigator.onLine,livekitReconnectTested:false,threeDBoardingCertified:false,deviceManuallyVerified:false,micPermission:'granted'}));setNotice('Microphone access granted and stopped. LIVE room/agent connection remains unverified.')}catch{setEvidence(v=>({...v,platform:runtime.shell,webgl:runtime.webgl,localSave:false,networkOnline:navigator.onLine,livekitReconnectTested:false,threeDBoardingCertified:false,deviceManuallyVerified:false,micPermission:'denied-or-unavailable'}));setNotice('Microphone access denied or unavailable. No recording started.')}}
 const progress=state.stage/CHICAGO_EL_JOURNEY_STAGES.length
 return <section role="dialog" aria-modal="true" aria-label="StreetVerse Chicago L Journey and Native Release Test" style={{position:'fixed',inset:0,zIndex:20000,background:'#051422fa',overflowY:'auto',color:'#fff',fontFamily:'system-ui',padding:'max(12px,env(safe-area-inset-top)) 14px 45px'}}>
 <div style={{display:'grid',gap:14,maxWidth:800,margin:'auto'}}>
  <header style={{display:'flex',justifyContent:'space-between',alignItems:'start',gap:10}}>
   <div><strong style={{color:'#8ee6ff'}}>STREETVERSE • CHICAGO WEST SIDE</strong><h1 style={{fontSize:24,margin:'6px 0'}}>🚆 Chicago L: Board → Ride → Exit → Save</h1></div><button style={btn} onClick={onClose}>CLOSE</button>
  </header>
  <p style={{lineHeight:1.5,fontSize:14,margin:0}}>Playable mission-state preview with a moving train visualization and one-hand controls. The main Three.js BJ model, train passenger seat transforms, real station doors and server save still require wiring and acceptance tests.</p>
  <svg role="img" aria-label="Animated fictional West Side L scene with moving train and BJ position" viewBox="0 0 760 275" style={{width:'100%',height:'auto',border:'2px solid #1f6480',borderRadius:16,background:'#081b30'}}>
   <rect x="0" y="195" width="760" height="80" fill="#1a3045"/>
   <path d="M0 165H760M0 171H760" stroke="#77818b" strokeWidth="5"/>
   {Array.from({length:9},(_,i)=><rect key={i} x={i*95} y="171" width="13" height="56" fill="#65727d"/>)}
   <text x="22" y="38" fontSize="18" fill="#e9eff9">WEST SIDE → MEDICAL DISTRICT (FICTIONAL TEST ROUTE)</text>
   <rect x="25" y="70" width="150" height="80" rx="8" fill="#334a6a"/><text x="42" y="103" fontSize="14" fill="white">WEST SIDE</text><text x="42" y="124" fontSize="11" fill="#d9e8ff">PREVIEW STOP</text>
   <rect x="575" y="70" width="165" height="80" rx="8" fill="#334a6a"/><text x="586" y="103" fontSize="14" fill="white">MEDICAL DIST.</text><text x="586" y="124" fontSize="11" fill="#d9e8ff">PREVIEW STOP</text>
   <g transform={`translate(${state.trainPosition*345+210},87)`}>
    <rect width="220" height="90" rx="15" fill="#cbd6df" stroke="#477d99" strokeWidth="4"/>
    <rect x="15" y="12" width="55" height="28" rx="5" fill="#16415d"/>
    <rect x="145" y="12" width="55" height="28" rx="5" fill="#16415d"/>
    <rect x="83" y="8" width="51" height="68" fill={state.doorOpen?'#64c7cf':'#768796'} stroke="#31516a" strokeWidth="3"/>
    <text x="18" y="67" fontSize="16" fontWeight="bold" fill="#122d43">TRYAMM L</text>
    <circle cx="45" cy="93" r="10" fill="#20242b"/><circle cx="178" cy="93" r="10" fill="#20242b"/>
   </g>
   <g transform={`translate(${state.boarded?(state.trainPosition*345+310):state.exited?640:188},${state.boarded?107:191})`}>
    <circle cx="0" cy="-21" r="9" fill="#b78466"/><path d="M0 -11V13 M0 -5L-12 5 M0 -5L12 5 M0 13L-9 28 M0 13L9 28" stroke="#a280c8" strokeWidth="6" fill="none" strokeLinecap="round"/>
    <text x="-14" y="-38" fontSize="12" fill="#fff">BJ</text>
   </g>
   <text x="22" y="250" fontSize="14" fill="#d8f8ff">Stage {state.stage} / 7  •  {state.boarded?'ON TRAIN':state.exited?'EXITED':'PLATFORM'}  •  {state.pose||'NO POSE'}</text>
  </svg>
  <div style={{background:'#102940',padding:14,borderRadius:14,border:'1px solid #2b6177',display:'grid',gap:8}}>
   <strong>{step?step.title:'✓ SIMULATED JOURNEY COMPLETE'}</strong><p style={{margin:0}}>{step?.instruction||'Use SAVE / RELOAD to confirm character continuity, then export the acceptance receipt.'}</p>
   <div aria-label="Mission completion" role="progressbar" aria-valuemin={0} aria-valuemax={7} aria-valuenow={state.stage} style={{height:12,borderRadius:10,background:'#0a1723'}}><div style={{width:Math.round(progress*100)+'%',height:'100%',borderRadius:10,background:'#64e3ca'}}/></div>
   {step?.id==='pose'&&<div style={{display:'flex',gap:8}}><button onClick={()=>setPose('sit')} aria-pressed={pose==='sit'} style={{...btn,opacity:pose==='sit'?1:.6}}>SIT</button><button onClick={()=>setPose('hold-rail')} aria-pressed={pose==='hold-rail'} style={{...btn,opacity:pose==='hold-rail'?1:.6}}>HOLD RAIL</button></div>}
   {step&&<button style={btn} onClick={act}>ONE PUSH • {step.action}</button>}
   <div role="status" aria-live="polite">{notice}</div>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
    <button style={btn} onClick={test}>TEST ALL 7 STEPS + EXPORT JSON</button>
    <button style={btn} onClick={onSave}>SAVE + VERIFY RELOAD</button>
    <button style={btn} onClick={()=>{const s=load();setState(s);setNotice('Local journey state reloaded.')}}>RESTORE LAST SAVE</button>
    <button style={btn} onClick={()=>{save(newChicagoElJourney());setNotice('Fictional mission reset. No currency change.')}}>REPLAY</button>
   </div>
  </div>
  <div style={{display:'grid',gap:10,border:'1px solid #41556a',borderRadius:14,padding:14}}>
   <strong>NATIVE RELEASE GATE • THIS DEVICE</strong>
   <p style={{fontSize:13,margin:0}}>Test the device currently in use. Repeat separately on Chromebook, Android and iPhone. Automatic passes cannot certify microphones, LiveKit reconnect, BJ's actual rig, rail boarding or app-store packaging.</p>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button style={btn} onClick={deviceTest}>TEST DEVICE + EXPORT JSON</button><button style={btn} onClick={micTest}>ASK MICROPHONE PERMISSION</button></div>
   <small aria-live="polite">Detected shell: {runtime.shell} • WebGL context available: {runtime.webgl?'YES':'NO'} • Mic: {evidence?.micPermission||'not requested'} • Native streaming: NOT VERIFIED</small>
   <small>Reference geography: <a style={{color:'#9be3ff'}} href="https://www.transitchicago.com/station/polk/" target="_blank" rel="noreferrer">Polk Pink Line</a> and <a style={{color:'#9be3ff'}} href="https://www.transitchicago.com/station/ilmd/" target="_blank" rel="noreferrer">Illinois Medical District Blue Line</a>. The illustrated game stops are fictional, and the train route shown is not an actual CTA service.</small>
  </div>
 </div>
 </section>
}
