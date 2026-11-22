import {useEffect,useRef,useState} from 'react'
import {STREETVERSE_RECOVERED_THREE_CAST} from '../data/StreetVerseRecoveredThreeCast'

type Status='pass'|'fail'|'not-run'|'needs-visual'
type Evidence={check:string;status:Status;detail:string}
type CastEvent={status:string;actor?:string;action?:string;reason?:string;results?:Array<{name:string;status:string;clips:number;error?:string}>;allThreeMounted?:boolean;validatedObstacle?:boolean;matchingMotionClip?:boolean;verifiedLanding?:boolean}
const button:React.CSSProperties={minHeight:55,padding:'10px 14px',borderRadius:13,border:'1px solid #a5e6ff',background:'#16445a',color:'white',fontSize:15,fontWeight:800,touchAction:'manipulation'}
const EVENT='tryamm:streetverse-cast-stage-result'
const STAGE='tryamm:streetverse-cast-stage-open'
const ACTION='tryamm:streetverse-cast-stage-action'
const RESET='tryamm:streetverse-cast-stage-reset'
function waitFor(predicate:(ev:CastEvent)=>boolean,timeout=16000):Promise<CastEvent>{
 return new Promise((resolve,reject)=>{
  const timer=window.setTimeout(()=>{window.removeEventListener(EVENT,onEvent);reject(Error('Gameplay action timed out'))},timeout)
  function onEvent(evt:Event){const detail=(evt as CustomEvent<CastEvent>).detail
   if(predicate(detail)){clearTimeout(timer);window.removeEventListener(EVENT,onEvent);resolve(detail)}
  }
  window.addEventListener(EVENT,onEvent)
 })
}
function performanceSample(durationMs=2600):Promise<{fps:number;frames:number;longFrames:number}>{
 return new Promise(resolve=>{
  let count=0,longFrames=0,first=0,last=0
  const tick=(time:number)=>{
   if(!first)first=time
   if(last&&time-last>50)longFrames++
   last=time;count++
   if(time-first<durationMs)requestAnimationFrame(tick)
   else resolve({fps:Math.round((count-1)*1000/Math.max(1,time-first)),frames:count,longFrames})
  }
  requestAnimationFrame(tick)
 })
}
export default function StreetVerseMobileGameplayCertificationHUD(){
 const [open,setOpen]=useState(false),[running,setRunning]=useState(false)
 const [checks,setChecks]=useState<Evidence[]>([])
 const [visual,setVisual]=useState<'unverified'|'passed'|'failed'>('unverified')
 const [message,setMessage]=useState('')
 const runId=useRef(0)
 useEffect(()=>()=>{runId.current++},[])
 const run=async()=>{
  if(running)return
  const id=++runId.current
  setRunning(true);setVisual('unverified');setMessage('Checking original 3D models, movement and mobile frame rate')
  const evidence:Evidence[]=[]
  const add=(check:string,status:Status,detail:string)=>{
   evidence.push({check,status,detail});if(id===runId.current)setChecks([...evidence])
  }
  try{
   const canvas=document.querySelector('canvas')
   add('Real StreetVerse canvas',canvas?'pass':'fail',canvas?'A canvas is mounted in this page':'No gameplay canvas found')
   const hasWebgl=Array.from(document.querySelectorAll('canvas')).some(c=>Boolean(c.getContext('webgl2')||c.getContext('webgl')))
   add('WebGL',hasWebgl?'pass':'fail',hasWebgl?'WebGL context available in browser':'WebGL not available')
   const loaded=waitFor(e=>e.status==='done',22000)
   window.dispatchEvent(new CustomEvent(STAGE))
   let stage:CastEvent
   try{stage=await loaded}catch(e){add('Original three-character stage','fail',String(e));return}
   const result=stage.results||[]
   for(const character of STREETVERSE_RECOVERED_THREE_CAST){
    const match=result.find(r=>r.name===character.name)
    add(character.name+' rig and clips',match?.status==='mounted'&&match.clips>0?'pass':'fail',match?.status==='mounted'?match.clips+' animation clips loaded':match?.error||'GLB not mounted')
   }
   const motion=async(actor:string,action:string)=>{
    if(!result.some(r=>r.name===STREETVERSE_RECOVERED_THREE_CAST.find(c=>c.id===actor)?.name&&r.status==='mounted')){
     add(actor+' '+action,'fail','Original character missing');return
    }
    window.dispatchEvent(new CustomEvent(RESET))
    const onStart=waitFor(e=>e.actor===actor&&e.action===action&&(e.status==='action-started'||e.status==='action-blocked'),3000)
    window.dispatchEvent(new CustomEvent(ACTION,{detail:{actor,action}}))
    let first:CastEvent
    try{first=await onStart}catch(e){add(actor+' '+action,'fail',String(e));return}
    if(first.status==='action-blocked'){add(actor+' '+action,'fail',first.reason||'Action was blocked');return}
    const completion=waitFor(e=>e.action===action&&e.status==='action-complete',4200)
    try{await completion;add(actor+' '+action,'pass','Start and completion events observed in live 3D runtime')}
    catch(e){add(actor+' '+action,'fail','Action started but completion was not observed: '+String(e))}
   }
   await motion('bj-stubbs','walk')
   await motion('jacobie-stubbs','vault')
   await motion('lateasia-monroe','walk')
   const sample=await performanceSample()
   add('Frame scheduling',sample.fps>=24?'pass':'fail',sample.fps+' frames/second, '+sample.longFrames+' frames slower than 50ms; browser sample, not GPU rendering FPS')
   add('Visual likeness and camera', 'needs-visual','Player must confirm the three models are visible, recognizable and correctly animated on their own device')
   add('Mobile touch gameplay', 'needs-visual','Physical controls, camera, collisions and scene stability must be checked on real phone or Chromebook')
   add('Live production release','not-run','This is a preview branch; requires production deployment, visual acceptance and confirmed binary availability')
   setMessage('Automated checks finished. Inspect the scene and select the correct visual result.')
  }catch(error){add('Test execution','fail',String(error));setMessage('One or more tests could not complete')}
  finally{if(id===runId.current)setRunning(false)}
 }
 const exportReport=()=>{
  const report={
   schema:'streetverse.mobile-gameplay-certification.v1',headRevision:'client-reported',
   checkedAt:new Date().toISOString(),device:navigator.userAgent,viewport:{width:innerWidth,height:innerHeight},checks,
   visualConfirmation:visual,automatedChecksPass:checks.length>0&&checks.filter(c=>c.status!=='needs-visual'&&c.status!=='not-run').every(c=>c.status==='pass')&&checks.some(c=>c.check==='Jacobie Stubbs rig and clips'),
   productionCertified:false,
   notes:'Automated canvas, event and frame scheduling checks do not certify photorealism, player controller physics, live broadcast or production release. A human visual check is recorded separately.'
  }
  const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'})
  const u=URL.createObjectURL(blob),a=document.createElement('a')
  a.href=u;a.download='StreetVerse_Mobile_Gameplay_Certification.json';a.click()
  window.setTimeout(()=>URL.revokeObjectURL(u),1200)
 }
 return <aside style={{position:'fixed',right:8,bottom:'max(236px,env(safe-area-inset-bottom) + 210px)',zIndex:42019,color:'#fff',fontFamily:'system-ui'}}>
  <button style={button} aria-expanded={open} onClick={()=>setOpen(v=>!v)}>✓ GAMEPLAY CHECK</button>
  {open&&<section aria-label="StreetVerse mobile gameplay certification" style={{marginTop:8,width:'min(410px,calc(100vw - 16px))',maxHeight:'65dvh',overflowY:'auto',border:'1px solid #7db7c5',borderRadius:14,padding:12,background:'#071a2aeF',display:'grid',gap:9}}>
   <strong>Mobile gameplay certification — preview</strong>
   <small>Run after importing original BJ, Jacobie and LaTeasia GLBs. Tests actual in-scene movement events, not just button clicks. No production certification is automatic.</small>
   <button style={button} onClick={()=>{void run()}} disabled={running}>{running?'TESTING MOVEMENT…':'ONE PUSH TEST 3 CHARACTERS'}</button>
   {checks.map(c=><div key={c.check} style={{fontSize:12,borderBottom:'1px solid #385369',paddingBottom:5}}><b>{c.status==='pass'?'✓':c.status==='fail'?'✕':'○'} {c.check} — {c.status}</b><div>{c.detail}</div></div>)}
   <strong style={{fontSize:13}}>Did you personally see correctly animated characters and stable camera movement?</strong>
   <div style={{display:'flex',gap:8}}><button style={button} onClick={()=>setVisual('passed')}>YES</button><button style={button} onClick={()=>setVisual('failed')}>NO</button></div>
   <p role="status" style={{margin:0,fontSize:12}}>Visual check: {visual}. {message}</p>
   <button style={button} onClick={exportReport} disabled={!checks.length||running}>EXPORT GAMEPLAY REPORT</button>
  </section>}
 </aside>
}
