import {useEffect,useMemo,useState} from 'react'
import {AI_FACTORY_LANES,factorySnapshotFromHealth,localFactorySnapshot,type AIFactorySnapshot} from '../ai/stubbsAIFactory'
import {assessMovieReadiness,makeProjectBible,planFullMovie,type MoviePlan} from '../ai/holoMovieDirector'

const API=(import.meta as any).env?.VITE_API_URL??''

export default function PoyoMovieFactoryPanel(){
  const [factory,setFactory]=useState<AIFactorySnapshot>(()=>localFactorySnapshot())
  const [healthNote,setHealthNote]=useState('Software lanes are installed. Compute/provider health has not been confirmed by the server yet.')
  const [title,setTitle]=useState('TRYAMM Holo Movie')
  const [duration,setDuration]=useState(90)
  const [logline,setLogline]=useState('A feature-length story that keeps the same characters, wardrobe, locations, voices, camera language and music continuity from shot to shot.')
  const [characterName,setCharacterName]=useState('Lead Character')
  const [wardrobe,setWardrobe]=useState('Locked hero wardrobe until an explicit scene change')
  const [voice,setVoice]=useState('Locked lead voice profile')
  const [plan,setPlan]=useState<MoviePlan|null>(null)

  useEffect(()=>{
    let live=true
    fetch(`${API}/api/ai-factory/health`).then(async response=>{if(!response.ok)throw new Error(`health ${response.status}`);return response.json()}).then(data=>{if(!live)return;const next=factorySnapshotFromHealth(data);setFactory(next);setHealthNote(next.source==='server-health'?'AI Factory server health received. Software readiness and compute readiness are shown separately.':'AI Factory architecture is installed; provider execution remains unverified.')}).catch(()=>{if(live){setFactory(localFactorySnapshot());setHealthNote('AI Factory architecture is installed. Backend/GPU/provider execution is not connected on this frontend session.')}})
    return()=>{live=false}
  },[])

  const readiness=useMemo(()=>plan?assessMovieReadiness(plan,factory):null,[plan,factory])
  const panel:React.CSSProperties={background:'#07111b',border:'1px solid #274153',borderRadius:18,padding:14}
  const input:React.CSSProperties={width:'100%',boxSizing:'border-box',minHeight:44,background:'#03080e',border:'1px solid #2a4151',borderRadius:10,color:'#fff',padding:'10px 11px'}
  const button:React.CSSProperties={minHeight:44,borderRadius:11,border:'1px solid #4fe3ff88',background:'linear-gradient(135deg,#0f3546,#251c36)',color:'#e9fbff',padding:'10px 13px',fontWeight:900,cursor:'pointer'}

  function buildPlan(){
    const bible=makeProjectBible({title,genre:'cinematic feature',logline,characters:[{id:'lead-1',name:characterName,identity:'Identity, face, body proportions and age stay locked to the approved character reference.',voice,wardrobe,emotionalBaseline:'Carry emotional state forward from the prior scene.'}],locations:['Primary StreetVerse / story set'],props:[],vehicles:[],storyTime:'continuous chronology'})
    setPlan(planFullMovie({durationMinutes:duration,bible}))
  }

  return <section aria-label="Stubbs AI Factory and Holo Movie Director" style={{marginTop:14,...panel}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',flexWrap:'wrap'}}>
      <div><div style={{fontSize:10,letterSpacing:2.5,color:'#4fe3ff',fontWeight:950}}>STUBBS AI MODEL ROUTER / AI FACTORY</div><h2 style={{margin:'4px 0 5px',fontSize:'clamp(20px,4vw,30px)'}}>Holo Movie Director • 30–120 minute continuity layer</h2><div style={{fontSize:11,color:'#9cafbd',lineHeight:1.55}}>Poyo AI Studio → HoloGPT Director → Stubbs AI Factory → specialist lanes → continuity checker → shot queue → audio/edit/composite.</div></div>
      <div style={{minWidth:190,padding:10,border:'1px solid #334250',borderRadius:12,background:'#05090f'}}><div style={{fontSize:9,color:'#7e91a1'}}>OWNED HOLOGPT GPU</div><b style={{color:factory.ownedGpuConnected?'#78ffb4':'#ffc96b'}}>{factory.ownedGpuConnected?'CONNECTED':'NOT CONNECTED'}</b><div style={{fontSize:9,color:'#718392',marginTop:4}}>Architecture ready ≠ physical GPU ready.</div></div>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:8,marginTop:12}}>
      {AI_FACTORY_LANES.map(meta=>{const lane=factory.lanes.find(x=>x.id===meta.id);const available=lane?.execution==='available';return <div key={meta.id} style={{border:'1px solid #223746',borderRadius:12,padding:10,background:'#050b12'}}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><b style={{fontSize:10}}>{meta.label}</b><span style={{fontSize:9,color:available?'#78ffb4':'#ffc96b'}}>{available?'EXECUTION READY':'SOFTWARE READY'}</span></div><div style={{fontSize:9,color:'#8295a4',lineHeight:1.45,marginTop:5}}>{meta.purpose}</div><div style={{fontSize:9,color:'#637886',marginTop:5}}>{available?`Provider: ${lane?.selectedProvider||'configured'}`:'Provider/compute not confirmed'}</div></div>})}
    </div>
    <div aria-live="polite" style={{fontSize:10,color:'#91a7b6',marginTop:9}}>{healthNote}</div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:12,marginTop:14}}>
      <div style={{border:'1px solid #223746',borderRadius:14,padding:12,background:'#050b12'}}>
        <b>FULL MOVIE PROJECT BIBLE</b>
        <label style={{display:'block',fontSize:9,color:'#8ea2b1',marginTop:10}}>PROJECT TITLE</label><input value={title} onChange={e=>setTitle(e.target.value)} style={input}/>
        <label style={{display:'block',fontSize:9,color:'#8ea2b1',marginTop:9}}>DURATION: {duration} MINUTES</label><input aria-label="Movie duration in minutes" type="range" min={30} max={120} step={5} value={duration} onChange={e=>setDuration(Number(e.target.value))} style={{width:'100%',minHeight:44}}/>
        <label style={{display:'block',fontSize:9,color:'#8ea2b1',marginTop:9}}>LOGLINE / STORY NORTH STAR</label><textarea value={logline} onChange={e=>setLogline(e.target.value)} rows={4} style={{...input,minHeight:96}}/>
        <label style={{display:'block',fontSize:9,color:'#8ea2b1',marginTop:9}}>LEAD CHARACTER</label><input value={characterName} onChange={e=>setCharacterName(e.target.value)} style={input}/>
        <label style={{display:'block',fontSize:9,color:'#8ea2b1',marginTop:9}}>WARDROBE LOCK</label><input value={wardrobe} onChange={e=>setWardrobe(e.target.value)} style={input}/>
        <label style={{display:'block',fontSize:9,color:'#8ea2b1',marginTop:9}}>VOICE LOCK</label><input value={voice} onChange={e=>setVoice(e.target.value)} style={input}/>
        <button onClick={buildPlan} style={{...button,width:'100%',marginTop:12}}>BUILD COHERENT {duration}-MINUTE SHOT PLAN</button>
      </div>

      <div style={{border:'1px solid #223746',borderRadius:14,padding:12,background:'#050b12'}}>
        <b>CONTINUITY + SHOT QUEUE</b>
        {!plan?<div style={{fontSize:11,color:'#8295a4',lineHeight:1.6,marginTop:10}}>Build the project bible first. The Director will split the movie into scenes and shots while carrying character identity, wardrobe, voice, story time, location, camera language, music language and continuity rules into every shot.</div>:<>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7,marginTop:10}}><div style={{padding:9,border:'1px solid #223746',borderRadius:10}}><div style={{fontSize:9,color:'#8194a3'}}>SCENES</div><b>{plan.scenes.length}</b></div><div style={{padding:9,border:'1px solid #223746',borderRadius:10}}><div style={{fontSize:9,color:'#8194a3'}}>SHOTS</div><b>{plan.shotCount}</b></div><div style={{padding:9,border:'1px solid #223746',borderRadius:10}}><div style={{fontSize:9,color:'#8194a3'}}>MINUTES</div><b>{plan.durationMinutes}</b></div></div>
          <div style={{fontSize:9,color:'#7f93a3',marginTop:9}}>MASTER CONTINUITY: <span style={{color:'#4fe3ff'}}>{plan.continuityFingerprint}</span></div>
          <div style={{maxHeight:225,overflowY:'auto',display:'grid',gap:6,marginTop:9}}>{plan.scenes.map(scene=><div key={scene.id} style={{padding:8,border:'1px solid #1d303e',borderRadius:9}}><div style={{display:'flex',justifyContent:'space-between',gap:8,fontSize:10}}><b>{scene.title}</b><span>{Math.round(scene.durationSeconds/60)}m • {scene.shots.length} shots</span></div><div style={{fontSize:9,color:'#748a99',marginTop:3}}>Next-shot continuity fingerprint: {scene.shots[0]?.continuity.fingerprint}</div></div>)}</div>
          <div style={{marginTop:10,padding:10,border:'1px solid '+(readiness?.renderReady?'#2d7653':'#725f31'),borderRadius:10,background:'#04090d'}}><b style={{fontSize:10,color:readiness?.renderReady?'#78ffb4':'#ffc96b'}}>{readiness?.renderReady?'FULL MOVIE RENDER PIPELINE READY':'PLAN READY • RENDER PROVIDERS STILL BLOCKED'}</b><div style={{fontSize:9,color:'#879aa8',lineHeight:1.5,marginTop:5}}>{readiness?.blockers.length?readiness.blockers.join(' '):'All required execution lanes report available.'}</div></div>
          <button disabled={!readiness?.renderReady} style={{...button,width:'100%',marginTop:10,opacity:readiness?.renderReady?1:.48,cursor:readiness?.renderReady?'pointer':'not-allowed'}}>{readiness?.renderReady?'QUEUE MOVIE RENDER':'RENDER LOCKED UNTIL COMPUTE / PROVIDERS CONNECT'}</button>
        </>}
      </div>
    </div>
  </section>
}
