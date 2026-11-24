import {StreetVerseBuildingPin} from './StreetVerseBuildingPin'
import {useEffect,useRef,useState} from 'react'
import {STREETVERSE_STARTER_CITIES} from '../data/StreetVerseLivingCityGenerator'
import {runStreetVerseSubmissionTest,type SubmissionTestResult} from '../runtime/StreetVerseOneButtonSubmissionTest'
import {createStreetVerseWorldKernel} from '../runtime/StreetVerseOriginalOpenWorldKernel'
import {chicagoMapReference} from '../config/streetverseChicagoMapReferences'
import {CHICAGO_77_SLICES,readSelectedCommunityArea} from '../config/streetverseCommunitySlices'
import {preflightBJLocalGLB} from '../runtime/StreetVerseBJLocalAssetPreflight'

const control:React.CSSProperties={minHeight:48,padding:'10px 12px',borderRadius:10,border:'1px solid #6cd8ec',background:'#123d51',color:'white',fontWeight:800}
export default function StreetVerseMyceliumSubmissionPanel(){
 const [cityId,setCityId]=useState('chicago'),[running,setRunning]=useState(false),[result,setResult]=useState<SubmissionTestResult|null>(null)
 const [areaNumber,setAreaNumber]=useState(()=>CHICAGO_77_SLICES.find(a=>a.communityAreaNumber===readSelectedCommunityArea())?.communityAreaNumber ?? '')
 const referenceArea=CHICAGO_77_SLICES.find(area=>area.communityAreaNumber===(areaNumber||'28'))
 const reference=cityId==='chicago' && referenceArea ? chicagoMapReference(referenceArea.communityAreaNumber,referenceArea.name) : null
 const [placement,setPlacement]=useState('No actual 3D placement attempted')
 const [engineCheck,setEngineCheck]=useState('Engine test not run')
 const [districtVisual,setDistrictVisual]=useState('District 3D preview not requested')
 const [bjEvidence,setBjEvidence]=useState('BJ animated rig not verified on this device')
 const [rendererEvidence,setRendererEvidence]=useState('3D renderer not verified on this device')
 const [reportMessage,setReportMessage]=useState('')
 const [gestureResult,setGestureResult]=useState('BJ gesture test not run')
 const [localBJResult,setLocalBJResult]=useState('Optional: select your V15 GLB from Files to test inside the 3D game')
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
  const onDistrictVisual=(e:Event)=>{
   const d=(e as CustomEvent<{rendered?:boolean;reason?:string;count?:number;cleared?:boolean}>).detail||{}
   setDistrictVisual(d.cleared?'PREVIEW CLEARED':d.rendered?`VISIBLE 3D • ${d.count||0} original mesh objects in active renderer • collision-free preview`:`3D PREVIEW BLOCKED • ${d.reason||'renderer unavailable'}`)
  }
  const onBJ=(e:Event)=>{
   const d=(e as CustomEvent<{rigReady?:boolean;renderableSkinnedMeshes?:number;bones?:number;clipCount?:number;trackCount?:number;reason?:string}>).detail||{}
   setBjEvidence(d.rigReady?`BJ rig structure FOUND • ${d.bones||0} bones, ${d.clipCount||0} clips • visual playback still unverified`:`BJ RIG BLOCKED • ${d.reason||'missing verified skeleton/animation'}`)
  }
  const onRenderer=(e:Event)=>{
   const d=(e as CustomEvent<{renderer?:string;nativeAssets?:number;missingAssets?:number}>).detail||{}
   setRendererEvidence(`3D renderer event: ${d.renderer||'unknown'} • ${d.nativeAssets||0} loaded assets • device visual test pending`)
  }
  const cachedBJ=(window as any).__TRYAMM_BJ_RIG_AUDIT__
  if(cachedBJ)onBJ(new CustomEvent('tryamm:streetverse-bj-rig-audit',{detail:cachedBJ}))
  const onGestureResult=(e:Event)=>{
   const d=(e as CustomEvent<{gesture?:string;clipFound?:boolean}>).detail||{}
   setGestureResult(d.clipFound?`BJ ${d.gesture||'gesture'} clip started in game mixer • visually verify character movement`:`BJ ${d.gesture||'gesture'} unavailable • check V15 loading/clip mappings`)
  }
  window.addEventListener('tryamm:bj-gesture-result',onGestureResult)
  window.addEventListener('tryamm:streetverse-bj-rig-audit',onBJ)
  window.addEventListener('tryamm:streetverse-forge-renderer-ready',onRenderer)
  window.addEventListener('tryamm:streetverse-district-preview-result',onDistrictVisual)
  window.addEventListener('tryamm:streetverse-forge-placement-result',onPlacement)
  window.addEventListener('tryamm:streetverse-forge-renderer-ready',onRendererReady)
  return()=>{window.removeEventListener('tryamm:bj-gesture-result',onGestureResult);window.removeEventListener('tryamm:streetverse-bj-rig-audit',onBJ);window.removeEventListener('tryamm:streetverse-forge-renderer-ready',onRenderer);window.removeEventListener('tryamm:streetverse-district-preview-result',onDistrictVisual);window.removeEventListener('tryamm:streetverse-forge-placement-result',onPlacement);window.removeEventListener('tryamm:streetverse-forge-renderer-ready',onRendererReady)}
 },[])
 const loadBJFromDevice=async(file:File|undefined)=>{
  if(!file)return
  if(!/\.glb$/i.test(file.name)||file.size<20000||file.size>30000000){
   setLocalBJResult('FILE BLOCKED • choose a 20 KB–30 MB .glb character model')
   return
  }
  try{
   const evidence=preflightBJLocalGLB(await file.arrayBuffer())
   const prior=(window as any).__TRYAMM_BJ_LOCAL_PREVIEW_URL__
   const next=URL.createObjectURL(file)
   ;(window as any).__TRYAMM_BJ_LOCAL_PREVIEW_URL__=next
   setLocalBJResult(`LOCAL BJ GLB VALIDATED • ${evidence.joints} joints, ${evidence.animationNames.length} clips • loading without upload`)
   window.dispatchEvent(new Event('tryamm:streetverse-bj-v15-preview'))
   if(typeof prior==='string'&&prior.startsWith('blob:'))URL.revokeObjectURL(prior)
  }catch(error){setLocalBJResult('LOCAL GLB REJECTED • '+String(error instanceof Error?error.message:'invalid asset'))}
 }
 const runEngineDiagnostic=()=>{
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
 }
 const submit=async()=>{
  if(running)return
  setRunning(true);setResult(null)
  runEngineDiagnostic()
  setPlacement(cityId==='chicago'?'Requesting native geometry placement in the real StreetVerse 3D scene…':'Other cities: layout preview only; no Chicago assets placed')
  if(cityId==='chicago' && areaNumber && areaNumber!==readSelectedCommunityArea())setPlacement('District preview beside player. Travel to this community area to place saved street props.')
  else if(cityId==='chicago')window.dispatchEvent(new CustomEvent('tryamm:streetverse-forge-placement-request',{detail:{preset:'street',source:'west-side-world-builder'}}))
  try{setResult(await runStreetVerseSubmissionTest(cityId,cityId==='chicago' ? areaNumber || undefined : undefined))}
  catch(e){setResult({status:'failed',checks:[],missing:[e instanceof Error?e.message:'Unexpected integration error'],cityId,featureCount:0,eventNodes:[]})}
  finally{setRunning(false)}
 }
 return <section data-streetverse-mycelium-submit="preview-only" aria-label="StreetVerse one-button city submission test" style={{border:'1px solid #6cd8ec88',padding:12,borderRadius:12,background:'#071e2a',color:'#fff',display:'grid',gap:10,margin:'10px 0'}}>
  <strong>🌆 LIVING CITY × MYCELIUM × AI CAFÉ</strong>
  <div role="status" aria-live="polite" style={{fontSize:12,color:'#f4cc8c'}}>{rendererEvidence}</div>
  <div role="status" aria-live="polite" style={{fontSize:12,color:'#f4cc8c'}}>{bjEvidence}</div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>
   {([
     ['greet','WAVE'],['nod','NOD'],['look-around','LOOK AROUND'],['acknowledge','CONVERSATION']
   ] as const).map(([gesture,label])=><button key={gesture} type="button" style={control} onClick={()=>{
    setGestureResult('Requesting BJ '+label+' in active game…')
    window.dispatchEvent(new CustomEvent('tryamm:bj-gesture',{detail:{characterId:'bj-stubbs',gesture}}))
   }}>BJ {label}</button>)}
  </div>
  <div role="status" aria-live="polite" style={{fontSize:12,color:'#e6d5fb'}}>{gestureResult}</div>
  <label htmlFor="bj-v15-local-preview-file" style={{...control,display:'block',cursor:'pointer',textAlign:'center'}}>SELECT BJ V15 GLB FROM FILES • LOCAL GAME TEST</label>
  <input id="bj-v15-local-preview-file" type="file" accept=".glb,model/gltf-binary" aria-label="Choose your BJ V15 GLB for local StreetVerse preview" onChange={e=>{void loadBJFromDevice(e.currentTarget.files?.[0])}} style={{width:'100%',minHeight:44,fontSize:14}} />
  <div role="status" aria-live="polite" style={{fontSize:12,color:'#d8f2c1'}}>{localBJResult}</div>
  <p style={{margin:0,fontSize:12,lineHeight:1.5}}>Chicago: request placement of four existing native 3D street objects, then run Mycelium, AI Café and backend verification. Other cities: generate a layout preview only. No paid generation or publishing.</p>
  <label htmlFor="mycelium-city-select" style={{fontSize:12}}>Starter city</label>
  <select id="mycelium-city-select" disabled={running} value={cityId} onChange={e=>setCityId(e.target.value)} style={{...control,background:'#071824'}}>
   {STREETVERSE_STARTER_CITIES.map(c=><option key={c.id} value={c.id}>{c.name} — {c.starterDistrict}</option>)}
  </select>
  {cityId==='chicago' && <label>Chicago community area
   <select disabled={running} value={areaNumber} onChange={e=>{setAreaNumber(e.target.value);setResult(null);setPlacement('Run the build to test placement');window.dispatchEvent(new Event('tryamm:streetverse-district-preview-clear'))}} style={{...control,width:'100%'}}>
    <option value="">Circle Park / Taylor Street starter</option>
    {CHICAGO_77_SLICES.map(area=><option key={area.communityAreaNumber} value={area.communityAreaNumber}>{area.communityAreaNumber}. {area.name}</option>)}
   </select>
  </label>}
  {reference && referenceArea && <nav aria-label="Neighborhood map references" style={{display:'grid',gap:8}}>
   <a href={reference.map} target="_blank" rel="noopener noreferrer" style={control}>Google Maps · {referenceArea.name}</a>
   <a href={reference.streetView} target="_blank" rel="noopener noreferrer" style={control}>Street View · {referenceArea.name}</a>
   <small>Opens Google in a new tab near an interior point in this area. Use the map to choose another street if imagery is unavailable.</small>
  </nav>}
  {cityId==='chicago' && <StreetVerseBuildingPin key={areaNumber} area={areaNumber}/>}
  <button type="button" onClick={submit} disabled={running} aria-label="One-button StreetVerse build and integration test" style={{...control,background:'#145b43',opacity:running?.65:1}}>{running?'RUNNING CHECKS…':'ONE BUTTON • BUILD 3D + TEST MYCELIUM / AI / BACKEND'}</button>
  <div role="status" aria-live="polite" style={{fontSize:12,color:'#b8f4e3'}}>{placement}</div>
  <div role="status" aria-live="polite" style={{fontSize:12,color:'#9ee7ff'}}>{districtVisual}</div>
  <button type="button" style={{...control,background:'#34304d'}} onClick={()=>window.dispatchEvent(new Event('tryamm:streetverse-district-preview-clear'))}>CLEAR GENERATED 3D DISTRICT PREVIEW</button>
  <button type="button" style={control} onClick={runEngineDiagnostic}>RETEST OPEN WORLD DRIVING SIMULATION</button>
  <div role="status" aria-live="polite" style={{fontSize:12,color:'#cbeaf9'}}>{engineCheck}</div>
  <button type="button" style={control} onClick={async()=>{
   const lines=[
    'STREETVERSE DEVICE QA • user-observed report',
    'Timestamp: '+new Date().toISOString(),
    'Browser: '+navigator.userAgent.slice(0,240),
    'Viewport: '+window.innerWidth+' × '+window.innerHeight,
    'Renderer event: '+rendererEvidence,
    'BJ rig structure: '+bjEvidence,
    'BJ gesture event: '+gestureResult,
    'Local BJ asset test: '+localBJResult,
    'District preview: '+districtVisual,
    'Native placement: '+placement,
    'Driving simulation: '+engineCheck,
    'Backend test: '+(result?.status||'not-run'),
    'This report does not certify iPhone, Chromebook, live server, gameplay or paid integrations.',
   ]
   try{await navigator.clipboard.writeText(lines.join('\n'));setReportMessage('DEVICE REPORT COPIED • paste it into ChatGPT for QA')}
   catch{setReportMessage('CLIPBOARD UNAVAILABLE • use browser copy or screenshot the results above')}
  }}>COPY DEVICE QA REPORT</button>
  {reportMessage&&<div role="status" style={{fontSize:12,color:'#ffddad'}}>{reportMessage}</div>}
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
