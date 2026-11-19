import {useEffect,useMemo,useState} from 'react'

type CastId='bj-stubbs'|'jacobie-stubbs'|'lateasia-monroe'
type Row={id:CastId;name:string;loaded:boolean;clips:number;source:string;movement:boolean;vehicle:boolean;mission:boolean;reel:boolean}
type StepKey='rig'|'movement'|'vehicle'|'mission'|'reel'|'fullLoop'

const ORDER:CastId[]=['bj-stubbs','jacobie-stubbs','lateasia-monroe']
const STEP_LABEL:Record<StepKey,string>={rig:'character rig',movement:'movement',vehicle:'vehicle entry',mission:'mission completion',reel:'HoloReel',fullLoop:'complete 7/7 loop including business and return-to-game'}

function readRows():Record<string,Row>{
 try{return JSON.parse(sessionStorage.getItem('tryamm.streetverse.three-cast-evidence.v1')||'{}')}catch{return{}}
}
function readSequence():string[]{
 try{return JSON.parse(sessionStorage.getItem('tryamm.streetverse.acceptance-sequence.v1')||'[]')}catch{return[]}
}

export default function StreetVerseAcceptanceSummaryHUD(){
 const [rows,setRows]=useState<Record<string,Row>>(()=>readRows())
 const [sequence,setSequence]=useState<string[]>(()=>readSequence())
 const [open,setOpen]=useState(()=>new URLSearchParams(location.search).get('autorun')==='1')
 const [sequenceDone,setSequenceDone]=useState(()=>readSequence().length===ORDER.length)
 useEffect(()=>{
  const refresh=()=>{const nextSequence=readSequence();setRows(readRows());setSequence(nextSequence);setSequenceDone(nextSequence.length===3)}
  const t=window.setInterval(refresh,800)
  addEventListener('storage',refresh)
  addEventListener('tryamm:streetverse-recovered-playable-ready',refresh)
  addEventListener('tryamm:streetverse-bj-visible-version',refresh)
  addEventListener('tryamm:streetverse-mission-complete',refresh)
  addEventListener('tryamm:reel-capture-ready',refresh)
  return()=>{clearInterval(t);removeEventListener('storage',refresh);removeEventListener('tryamm:streetverse-recovered-playable-ready',refresh);removeEventListener('tryamm:streetverse-bj-visible-version',refresh);removeEventListener('tryamm:streetverse-mission-complete',refresh);removeEventListener('tryamm:reel-capture-ready',refresh)}
 },[])
 const result=useMemo(()=>{
  const failures:Array<{character:string;step:StepKey}>=[]
  const loopIds:Record<CastId,string>={'bj-stubbs':'bj','jacobie-stubbs':'jacobie','lateasia-monroe':'lateasia'}
  for(const id of ORDER){
   const r=rows[id]
   if(!r?.loaded){failures.push({character:r?.name||id,step:'rig'});continue}
   if(!r.movement){failures.push({character:r.name,step:'movement'});continue}
   if(!r.vehicle){failures.push({character:r.name,step:'vehicle'});continue}
   if(!r.mission){failures.push({character:r.name,step:'mission'});continue}
   if(!r.reel){failures.push({character:r.name,step:'reel'});continue}
   if(!sequence.includes(loopIds[id])){failures.push({character:r.name,step:'fullLoop'});continue}
  }
  return{passed:failures.length===0,failures,first:failures[0]||null}
 },[rows,sequence])
 useEffect(()=>{
  if(new URLSearchParams(location.search).get('autorun')!=='1')return
  setOpen(true)
 },[result.passed,result.first?.character,result.first?.step])
 type AcceptanceReport={
  generatedAt:string
  device:string
  route:string
  passed:boolean
  firstFailure:{character:string;step:StepKey}|null
  failures:Array<{character:string;step:StepKey}>
  characters:Record<string,Row>
  note:string
 }
 const buildSummary=():AcceptanceReport=>({
  generatedAt:new Date().toISOString(),
  device:navigator.userAgent,
  route:location.href,
  passed:result.passed,
  firstFailure:result.first,
  failures:result.failures,
  characters:rows,
  note:'Runtime acceptance summary. Visual likeness and target-device rendering still require human review.'
 })
 const persistSummary=():AcceptanceReport=>{
  const report=buildSummary()
  try{
   localStorage.setItem('tryamm.streetverse.last-acceptance-summary.v1',JSON.stringify(report))
   localStorage.setItem('tryamm.streetverse.last-three-cast-summary.v1',JSON.stringify(report))
  }catch{}
  return report
 }
 useEffect(()=>{persistSummary()},[result.passed,result.failures.length,rows,sequence])
 const exportSummary=()=>{
  const report=persistSummary()
  const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'})
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='StreetVerse_Acceptance_Summary.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
 }
 useEffect(()=>{
  const auto=new URLSearchParams(location.search).get('autorun')==='1'
  if(!auto||!sequenceDone)return
  const timer=window.setTimeout(()=>{setOpen(true);exportSummary()},500)
  return()=>window.clearTimeout(timer)
 },[sequenceDone,result.passed])
 return <aside style={sequenceDone?{position:'fixed',inset:'max(12px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left))',zIndex:56000,display:'grid',placeItems:'center',fontFamily:'system-ui,sans-serif',pointerEvents:'none'}:{position:'fixed',right:'max(10px,env(safe-area-inset-right))',top:'calc(env(safe-area-inset-top) + 8px)',zIndex:54001,fontFamily:'system-ui,sans-serif'}}>
  {!sequenceDone&&<button type="button" onClick={()=>setOpen(v=>!v)} style={{minHeight:46,padding:'8px 12px',borderRadius:13,border:'2px solid '+(result.passed?'#86ffb0':'#ffb56f'),background:result.passed?'#0e3320ee':'#3a210bee',color:'#fff',fontWeight:950}}>{result.passed?'✓ ACCEPTANCE PASS':'⚠ ACCEPTANCE CHECK'}</button>}
  {(open||sequenceDone)&&<div style={{marginTop:7,width:sequenceDone?'min(92vw,560px)':340,maxWidth:'calc(100vw - 20px)',display:'grid',gap:10,padding:sequenceDone?18:12,borderRadius:18,border:'3px solid '+(result.passed?'#86ffb0':'#ff8e8e'),background:result.passed?'rgba(8,55,31,.98)':'rgba(70,18,18,.98)',color:'#fff',boxShadow:'0 18px 60px #000b',pointerEvents:'auto'}}>
   <strong style={{fontSize:sequenceDone?28:18,textAlign:sequenceDone?'center':'left'}}>{result.passed?'✓ ALL THREE CHARACTER TESTS PASSED':'⚠ FULL TEST STOPPED'}</strong>
   {result.first?<div style={{fontSize:sequenceDone?18:13,lineHeight:1.45,textAlign:sequenceDone?'center':'left'}}><b>{result.first.character}</b><br/>FIRST FAILURE: {STEP_LABEL[result.first.step]}</div>:<div style={{fontSize:sequenceDone?16:12,color:'#bfffd2',textAlign:sequenceDone?'center':'left'}}>BJ Stubbs, Jacobie Stubbs and LaTeasia Monroe have the required runtime acceptance evidence.</div>}
   {result.failures.slice(0,6).map((f,i)=><div key={i} style={{fontSize:sequenceDone?13:11,color:'#d8dde8',textAlign:sequenceDone?'center':'left'}}>{f.character} • {STEP_LABEL[f.step]}</div>)}
   <button type="button" onClick={exportSummary} style={{minHeight:52,borderRadius:12,border:'1px solid #75e7b0',background:'#123d2a',color:'#fff',fontWeight:950,fontSize:15}}>EXPORT PASS / FAIL SUMMARY AGAIN</button>
  </div>}
 </aside>
}
