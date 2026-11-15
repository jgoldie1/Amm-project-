import React,{useMemo,useState} from 'react'
import {createCrossVerseChicagoJourney,type TravelerSnapshot} from '../runtime/StreetVerseCrossVerseChicagoJourney'
import type {ChicagoEra} from '../runtime/StreetVerseChicagoTimeSwitchRuntime'
import {createHoloLabMotion,type HoloLabMotionStage} from '../runtime/StreetVerseHoloLabMotionRuntime'

const initial:TravelerSnapshot={x:0,y:0,z:0,missionId:'hololab-orientation',credits:0}
/** Self-contained HoloLab sales demo: illustrative scenes, not an actual 3D scene loader. */
export function StreetVerseHoloLabDemoHUD(){
 const journey=useMemo(()=>createCrossVerseChicagoJourney(),[])
 const motion=useMemo(()=>createHoloLabMotion(),[])
 const [motionStage,setMotionStage]=useState<HoloLabMotionStage>('outside')
 const [era,setEra]=useState<ChicagoEra>('present')
 const [snapshot,setSnapshot]=useState<TravelerSnapshot>(initial)
 const [status,setStatus]=useState('Welcome to HoloLab. Choose a destination.')
 const [visits,setVisits]=useState(0)
 const [npcText,setNpcText]=useState('')
 const [pending,setPending]=useState<ChicagoEra|null>(null)
 const scenes:Record<ChicagoEra,{label:string;sky:string;buildings:string;transport:string}>={
  past:{label:'Historic Chicago',sky:'linear-gradient(#b67b4a,#e9c28d)',buildings:'Brick storefronts and historic streets',transport:'Streetcars'},
  present:{label:'Present-day Chicago',sky:'linear-gradient(#4887b4,#c6e5f3)',buildings:'Modern neighborhood and businesses',transport:'City buses'},
  future:{label:'Future Chicago',sky:'linear-gradient(#302466,#a85ee1)',buildings:'Solar towers and holo storefronts',transport:'Autonomous shuttles'}
 }
 const move=()=>{try{setMotionStage(motion.advance())}catch(e){setStatus(e instanceof Error?e.message:'Motion unavailable')}}
 const request=(next:ChicagoEra)=>{
  if(motion.stage()!=='inside'&&motion.stage()!=='charging'){setStatus('Walk BJ into the HoloLab chamber first.');return}
  try{
   const p=journey.prepare(next,snapshot)
   setPending(next)
   if(motion.stage()==='inside')setMotionStage(motion.advance())
   setStatus('Destination selected. Charge the chamber and start warp motion.')
   window.dispatchEvent(new CustomEvent('tryamm:hololab-demo-scene-request',{detail:{to:p.to,era:next,simulation:true}}))
  }catch(e){setStatus(e instanceof Error?e.message:'Transition unavailable')}
 }
 const confirm=()=>{
  if(!pending)return
  if(!motion.canConfirmArrival()){setStatus('Complete warp motion before confirming arrival.');return}
  try{
   const destination=pending==='present'?'streetverse:chicago':'chicago:'+pending
   const result=journey.confirmSceneLoaded(destination)
   setMotionStage(motion.arrive())
   setEra(pending)
   setSnapshot(result.restore??{...snapshot,x:0,y:0,z:0})
   setVisits(v=>v+1)
   setPending(null)
   setStatus('SIMULATED arrival: '+scenes[pending].label+'. Your other timeline state is preserved.')
  }catch(e){setStatus(e instanceof Error?e.message:'Arrival unavailable')}
 }
 const saveMemory=()=>{
  if(!npcText.trim())return
  journey.remember('hololab-guide',npcText.trim())
  setNpcText('')
  setStatus('Guide memory saved to '+era+' timeline.')
 }
 return <section aria-label="HoloLab immersive time-machine demonstration" style={{padding:14,background:'#101b30',color:'#fff',borderRadius:14,border:'2px solid #85d9cf',fontFamily:'system-ui',maxWidth:390}}>
  <h3 style={{margin:'0 0 8px'}}>HOLOLAB • TIME MACHINE DEMO</h3>
  <p role="status" aria-live="polite">{status}</p>
  <div aria-label={scenes[era].label} style={{background:scenes[era].sky,borderRadius:12,padding:18,color:'#111b2b',minHeight:125}}>
   <strong>{scenes[era].label}</strong>
   <p>{scenes[era].buildings}</p>
   <p>Transport: {scenes[era].transport}</p>
  </div>
  <div aria-label="BJ chamber motion preview" style={{position:'relative',height:92,overflow:'hidden',borderRadius:10,background:'linear-gradient(90deg,#263c55,#294e63,#533878)',margin:'10px 0'}}>
   <div aria-hidden="true" style={{position:'absolute',right:35,top:8,width:70,height:74,border:'5px solid #89f3dd',borderRadius:'50%',boxShadow:motionStage==='warping'?'0 0 30px 12px #a9f3ff':'0 0 12px #73e2d3'}}/>
   <div aria-hidden="true" style={{position:'absolute',left:motionStage==='outside'?'8%':motionStage==='approaching'?'36%':'70%',bottom:8,fontSize:36,transition:'left 700ms ease'}}>🚶🏾</div>
   <span style={{position:'absolute',left:8,top:8,fontSize:12}}>BJ: {motionStage.toUpperCase()}</span>
  </div>
  <button onClick={move} disabled={motionStage==='arrived'||motionStage==='warping'||(motionStage==='charging'&&!pending)} style={{minHeight:56,width:'100%',fontWeight:800}}> {motionStage==='outside'?'WALK BJ TO CHAMBER':motionStage==='approaching'?'ENTER HOLOLAB CHAMBER':motionStage==='inside'?'CHARGE TIME MACHINE':motionStage==='charging'?'START WARP MOTION':'MOTION COMPLETE'} </button>
  {motionStage==='arrived'&&<button onClick={()=>{motion.reset();setMotionStage('outside');setStatus('Ready for the next HoloLab journey.')}} style={{minHeight:52,width:'100%',marginTop:6}}>RESTART CHAMBER MOTION</button>}
  <p>Mission: {snapshot.missionId} • Credits: {snapshot.credits} • Visits: {visits}</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:6}}>{(['past','present','future'] as ChicagoEra[]).map(target=><button key={target} disabled={pending!==null} onClick={()=>request(target)} style={{minHeight:56,fontWeight:800,borderRadius:10}}>{target.toUpperCase()}</button>)}</div>
  {pending&&<div style={{marginTop:10}}><p>Simulation destination: {scenes[pending].label}</p><button onClick={confirm} style={{minHeight:56,width:'100%',fontWeight:800}}>CONFIRM DEMO SCENE LOADED</button><button onClick={()=>{journey.cancel();setPending(null);motion.reset();setMotionStage('outside');setStatus('Travel cancelled.')}} style={{minHeight:48,width:'100%',marginTop:6}}>CANCEL</button></div>}
  <label style={{display:'block',marginTop:12}}>Guide NPC memory<input value={npcText} onChange={e=>setNpcText(e.target.value)} placeholder="What should the guide remember?" style={{width:'100%',boxSizing:'border-box',minHeight:48}}/></label>
  <button onClick={saveMemory} style={{minHeight:50,width:'100%',marginTop:6}}>SAVE GUIDE MEMORY</button>
  <p>Guide remembers: {journey.recall('hololab-guide').join(' • ')||'Nothing yet'}</p>
  <small>This is a browser demonstration with staged BJ motion and simulated arrival, not a rigged 3D character or real scene loader. It does not render 3D worlds, provide VR tracking, or save to cloud storage.</small>
 </section>
}
