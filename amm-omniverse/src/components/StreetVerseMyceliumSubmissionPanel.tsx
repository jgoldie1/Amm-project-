import {useState} from 'react'
import {STREETVERSE_STARTER_CITIES} from '../data/StreetVerseLivingCityGenerator'
import {runStreetVerseSubmissionTest,type SubmissionTestResult} from '../runtime/StreetVerseOneButtonSubmissionTest'

const control:React.CSSProperties={minHeight:48,padding:'10px 12px',borderRadius:10,border:'1px solid #6cd8ec',background:'#123d51',color:'white',fontWeight:800}
export default function StreetVerseMyceliumSubmissionPanel(){
 const [cityId,setCityId]=useState('chicago'),[running,setRunning]=useState(false),[result,setResult]=useState<SubmissionTestResult|null>(null)
 const submit=async()=>{
  if(running)return
  setRunning(true);setResult(null)
  try{setResult(await runStreetVerseSubmissionTest(cityId))}
  catch(e){setResult({status:'failed',checks:[],missing:[e instanceof Error?e.message:'Unexpected integration error'],cityId,featureCount:0,eventNodes:[]})}
  finally{setRunning(false)}
 }
 return <section data-streetverse-mycelium-submit="preview-only" aria-label="StreetVerse one-button city submission test" style={{border:'1px solid #6cd8ec88',padding:12,borderRadius:12,background:'#071e2a',color:'#fff',display:'grid',gap:10,margin:'10px 0'}}>
  <strong>🌆 LIVING CITY × MYCELIUM × AI CAFÉ</strong>
  <p style={{margin:0,fontSize:12,lineHeight:1.5}}>One-button simulation and authorized backend submission TEST. No live 3D publishing, payments or paid generation.</p>
  <label htmlFor="mycelium-city-select" style={{fontSize:12}}>Starter city</label>
  <select id="mycelium-city-select" value={cityId} onChange={e=>setCityId(e.target.value)} style={{...control,background:'#071824'}}>
   {STREETVERSE_STARTER_CITIES.map(c=><option key={c.id} value={c.id}>{c.name} — {c.starterDistrict}</option>)}
  </select>
  <button type="button" onClick={submit} disabled={running} style={{...control,background:'#145b43',opacity:running?.65:1}}>{running?'RUNNING CHECKS…':'RUN ONE-BUTTON SUBMISSION TEST'}</button>
  {result&&<div role="status" aria-live="polite" style={{fontSize:12,lineHeight:1.5}}>
   <strong>{result.status==='backend-verified'?'✓ BACKEND VERIFIED':result.status==='preview-passed'?'✓ PREVIEW PASSED':result.status==='blocked'?'⚠ PREVIEW ONLY / BACKEND BLOCKED':'✕ TEST FAILED'}</strong>
   <div>{result.featureCount} generated layout markers • {result.eventNodes.length} Mycelium routing nodes</div>
   {result.jobId&&<div>Backend job ID: <code>{result.jobId}</code></div>}
   <ul style={{paddingLeft:20,margin:'8px 0'}}>{result.checks.map(c=><li key={c}>✓ {c}</li>)}{result.missing.map((m,i)=><li key={i}>○ {m}</li>)}</ul>
  </div>}
 </section>
}
