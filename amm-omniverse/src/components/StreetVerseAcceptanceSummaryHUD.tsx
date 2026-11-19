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
 useEffect(()=>{
  const refresh=()=>{setRows(readRows());setSequence(readSequence())}
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
 const persistSummary=()=>{
  const report=persistSummary()
  try{localStorage.setItem('tryamm.streetverse.last-acceptance-summary.v1',JSON.stringify(report))}catch{}
  return report
 }
 useEffect(()=>{persistSummary()},[result.passed,result.failures.length,rows,sequence])
 const exportSummary=()=>{
  const report={generatedAt:new Date().toISOString(),device:navigator.userAgent,route:location.href,passed:result.passed,firstFailure:result.first,failures:result.failures,characters:rows,note:'Runtime acceptance summary. Visual likeness and target-device rendering still require human review.'}
  const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'})
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='StreetVerse_Acceptance_Summary.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
 }
 return <aside style={{position:'fixed',right:'max(10px,env(safe-area-inset-right))',top:'calc(env(safe-area-inset-top) + 8px)',zIndex:54001,fontFamily:'system-ui,sans-serif'}}>
  <button type="button" onClick={()=>setOpen(v=>!v)} style={{minHeight:46,padding:'8px 12px',borderRadius:13,border:'2px solid '+(result.passed?'#86ffb0':'#ffb56f'),background:result.passed?'#0e3320ee':'#3a210bee',color:'#fff',fontWeight:950}}>{result.passed?'✓ ACCEPTANCE PASS':'⚠ ACCEPTANCE CHECK'}</button>
  {open&&<div style={{marginTop:7,width:340,maxWidth:'calc(100vw - 20px)',display:'grid',gap:8,padding:12,borderRadius:16,border:'2px solid '+(result.passed?'#86ffb0':'#ffb56f'),background:'rgba(7,13,20,.98)',color:'#fff',boxShadow:'0 12px 38px #000a'}}>
   <strong style={{fontSize:18}}>{result.passed?'✓ FULL TEST PASSED':'⚠ FULL TEST STOPPED'}</strong>
   {result.first?<div style={{fontSize:13,lineHeight:1.4}}><b>{result.first.character}</b><br/>Needs: {STEP_LABEL[result.first.step]}</div>:<div style={{fontSize:12,color:'#bfffd2'}}>BJ, Jacobie and LaTeasia have rig, movement, vehicle, mission and Reel evidence.</div>}
   {result.failures.slice(0,6).map((f,i)=><div key={i} style={{fontSize:11,color:'#d8dde8'}}>{f.character} • {STEP_LABEL[f.step]}</div>)}
   <button type="button" onClick={exportSummary} style={{minHeight:44,borderRadius:10,border:'1px solid #75e7b0',background:'#123d2a',color:'#fff',fontWeight:900}}>EXPORT PASS / FAIL SUMMARY</button>
  </div>}
 </aside>
}
