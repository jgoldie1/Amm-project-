import {useEffect,useRef,useState} from 'react'
import {STREETVERSE_STARTER_CITIES} from '../data/StreetVerseLivingCityGenerator'
import {runStreetVerseSubmissionTest,type SubmissionTestResult} from '../runtime/StreetVerseOneButtonSubmissionTest'
import {createStreetVerseWorldKernel} from '../runtime/StreetVerseOriginalOpenWorldKernel'

const control:React.CSSProperties={minHeight:48,padding:'10px 12px',borderRadius:10,border:'1px solid #6cd8ec',background:'#123d51',color:'white',fontWeight:800}
export default function StreetVerseMyceliumSubmissionPanel(){
 const [cityId,setCityId]=useState('chicago'),[running,setRunning]=useState(false),[result,setResult]=useState<SubmissionTestResult|null>(null)
 const [placement,setPlacement]=useState('No actual 3D placement attempted')
 const [engineCheck,setEngineCheck]=useState('Engine test not run')
 const awaitingRenderer=useRef(false)
 useEffect(()=>{
  const onPlacement=(e:Event)=>{
   const detail=(e as CustomEvent<{preset?:string;status?:string;placed?:number;requested?:number;count?:number}>).detail||{}
   if(detail.preset!=='street')return
   if(detail.status==='native-layer-loading'){awaitingRenderer.current=true;setPlacement('Waiting for native 3D asset layer to load; placement will retry once on renderer ready');return}
   awaitingRenderer.current=false
   const n=detail.placed||0
   setPlacement(n>0?`${n}/${detail.requested||n} native assets placed into the live 3D scene • saved locally`:`3D placement unavailable: ${detail.status||'unknown'}; inspect renderer and native asset loading`)
  }
  const onRendererReady=()=>{
   if(!awaitingRenderer.current)return
   awaitingRenderer.current=false
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-forge-placement-request',{detail:{preset:'street',source:'west-side-world-builder'}}))
  }
  window.addEventListener('tryamm:streetverse-forge-placement-result',onPlacement)
  window.addEventListener('tryamm:streetverse-forge-renderer-ready',onRendererReady)
  return()=>{window.removeEventListener('tryamm:streetverse-forge-placement-result',onPlacement);window.removeEventListener('tryamm:streetverse-forge-renderer-ready',onRendererReady)}
 },[])
 const submit=async()=>{
  if(running)return
  setRunning(true);setResult(null)
  setPlacement(cityId==='chicago'?'Requesting native geometry placement in the real StreetVerse 3D scene…':'Other cities: layout preview only; no Chicago assets placed')
  if(cityId==='chicago')window.dispatchEvent(new CustomEvent('tryamm:streetverse-forge-placement-request',{detail:{preset:'street',source:'west-side-world-builder'}}))
  try{setResult(await runStreetVerseSubmissionTest(cityId))}
  catch(e){setResult({status:'failed',checks:[],missing:[e instanceof Error?e.message:'Unexpected integration error'],cityId,featureCount:0,eventNodes:[]})}
  finally{setRunning(false)}
 }
 return <section data-streetverse-mycelium-submit="preview-only" aria-label="StreetVerse one-button city submission test" style={{border:'1px solid #6cd8ec88',padding:12,borderRadius:12,background:'#071e2a',color:'#fff',display:'grid',gap:10,margin:'10px 0'}}>
  <strong>🌆 LIVING CITY × MYCELIUM × AI CAFÉ</strong>
  <p style={{margin:0,fontSize:12,lineHeight:1.5}}>Chicago: request placement of four existing native 3D street objects, then run Mycelium, AI Café and backend verification. Other cities: generate a layout preview only. No paid generation or publishing.</p>
  <label htmlFor="mycelium-city-select" style={{fontSize:12}}>Starter city</label>
  <select id="mycelium-city-select" value={cityId} onChange={e=>setCityId(e.target.value)} style={{...control,background:'#071824'}}>
   {STREETVERSE_STARTER_CITIES.map(c=><option key={c.id} value={c.id}>{c.name} — {c.starterDistrict}</option>)}
  </select>
  <button type="button" onClick={submit} disabled={running} style={{...control,background:'#145b43',opacity:running?.65:1}}>{running?'RUNNING CHECKS…':'BUILD VISIBLE CHICAGO + TEST CONNECTIONS'}</button>
  <div role="status" aria-live="polite" style={{fontSize:12,color:'#b8f4e3'}}>{placement}</div>
  <button type="button" style={control} onClick={()=>{
   const kernel=createStreetVerseWorldKernel()
   kernel.startMission();kernel.step({enter:true})
   for(let i=0;i<120;i++)kernel.step({throttle:1,steer:.1})
   const moving=kernel.snapshot()
   const blockedExit=kernel.step({exit:true}).mode==='driving'
   for(let i=0;i<150;i++)kernel.step({brake:1})
   kernel.step({exit:true})
   const completed=kernel.finishMission()
   const report=blockedExit&&completed&&kernel.snapshot().missionRewards===1
   setEngineCheck(report?'PASS • 60Hz vehicle / brake / safe exit / mission simulation':'FAIL • investigate kernel inputs and events')
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-engine-diagnostic',{detail:{source:'streetverse-open-world-kernel',kind:'offline-simulation',passed:report,vehicleMovementMeters:Number(moving.distanceMeters.toFixed(2)),actual3DVerified:false,physicsVerified:false}}))
  }}>TEST OUR OPEN WORLD ENGINE</button>
  <div role="status" aria-live="polite" style={{fontSize:12,color:'#cbeaf9'}}>{engineCheck}</div>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
   <button type="button" style={control} onClick={()=>window.dispatchEvent(new Event('tryamm:open-hologpt'))}>ASK HOLOGPT</button>
   <button type="button" style={control} onClick={()=>window.dispatchEvent(new Event('tryamm:open-middleverse-ai'))}>MIDDLEVERSE AI</button>
  </div>
  {result&&<div role="status" aria-live="polite" style={{fontSize:12,lineHeight:1.5}}>
   <strong>{result.status==='backend-verified'?'✓ BACKEND VERIFIED':result.status==='preview-passed'?'✓ PREVIEW PASSED':result.status==='blocked'?'⚠ PREVIEW ONLY / BACKEND BLOCKED':'✕ TEST FAILED'}</strong>
   <div>{result.featureCount} generated layout markers • {result.eventNodes.length} Mycelium routing nodes</div>
   {result.jobId&&<div>Backend job ID: <code>{result.jobId}</code></div>}
   <ul style={{paddingLeft:20,margin:'8px 0'}}>{result.checks.map(c=><li key={c}>✓ {c}</li>)}{result.missing.map((m,i)=><li key={i}>○ {m}</li>)}</ul>
  </div>}
 </section>
}
