import {useEffect,useMemo,useState} from 'react'
import {factorySnapshotFromHealth,localFactorySnapshot,type AIFactorySnapshot} from '../ai/stubbsAIFactory'
import {buildForgePlan,GAME_ENGINE_CELLS,type ForgeAssetKind,type ForgePlan,type ForgeTarget} from '../ai/holoForgeGameEngine'

const API=(import.meta as any).env?.VITE_API_URL??''
const KINDS:ForgeAssetKind[]=['character','vehicle','prop','building','environment','animation','vfx','audio','npc','mission']
const TARGETS:ForgeTarget[]=['streetverse','holoverse','starverse','mobile-safe','cinematic']

export default function HoloForgeGameFactoryPanel(){
  const [factory,setFactory]=useState<AIFactorySnapshot>(()=>localFactorySnapshot())
  const [name,setName]=useState('StreetVerse Production Asset')
  const [kind,setKind]=useState<ForgeAssetKind>('character')
  const [target,setTarget]=useState<ForgeTarget>('streetverse')
  const [prompt,setPrompt]=useState('Create a production-ready StreetVerse asset with realistic scale, optimized geometry, clean materials, collision, LODs and mobile fallback.')
  const [role,setRole]=useState('Interactive world asset')
  const [rights,setRights]=useState(false)
  const [plan,setPlan]=useState<ForgePlan|null>(null)
  const [health,setHealth]=useState('Checking AI Factory execution lanes…')

  useEffect(()=>{let live=true;fetch(`${API}/api/ai-factory/health`).then(async r=>{if(!r.ok)throw new Error(String(r.status));return r.json()}).then(data=>{if(!live)return;const next=factorySnapshotFromHealth(data);setFactory(next);setHealth('AI Factory health received. Holo Forge shows software readiness separately from actual model/compute readiness.')}).catch(()=>{if(live){setFactory(localFactorySnapshot());setHealth('Holo Forge software architecture is installed. Backend/provider execution is not confirmed in this session.')}});return()=>{live=false}},[])

  const readyCount=useMemo(()=>factory.lanes.filter(l=>l.execution==='available').length,[factory])
  const card:React.CSSProperties={background:'#050b12',border:'1px solid #243a49',borderRadius:14,padding:12}
  const field:React.CSSProperties={width:'100%',boxSizing:'border-box',minHeight:44,background:'#02070c',border:'1px solid #2a4253',borderRadius:10,color:'#fff',padding:'10px 11px'}
  const btn:React.CSSProperties={minHeight:44,border:'1px solid #4fe3ff88',background:'linear-gradient(135deg,#0e3948,#261b36)',color:'#ecfbff',borderRadius:11,padding:'10px 13px',fontWeight:900,cursor:'pointer'}

  function compile(){setPlan(buildForgePlan({name,kind,target,prompt,references:[],rightsConfirmed:rights,gameplayRole:role},factory))}

  return <section aria-label="Holo Forge game asset generator" style={{marginTop:14,background:'#07111b',border:'1px solid #31576c',borderRadius:18,padding:14}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><div><div style={{fontSize:10,letterSpacing:2.5,color:'#4fe3ff',fontWeight:950}}>HOLO FORGE • GAME PRODUCTION ENGINE</div><h2 style={{margin:'4px 0',fontSize:'clamp(21px,4vw,31px)'}}>Prompt → validated game asset → world ingest</h2><div style={{fontSize:11,color:'#9aafbd',lineHeight:1.55}}>HoloGPT writes the spec. AI Factory picks specialist lanes. Holo Forge enforces rights, geometry, materials, rigging, physics, LOD, mobile fallback and production QA before StreetVerse ingest.</div></div><div style={{...card,minWidth:190}}><div style={{fontSize:9,color:'#8297a5'}}>EXECUTION LANES</div><b style={{color:readyCount?'#78ffb4':'#ffc96b'}}>{readyCount}/{factory.lanes.length} CONNECTED</b><div style={{fontSize:9,color:'#708492',marginTop:4}}>Software pipeline remains usable for planning even when render compute is offline.</div></div></div>
    <div aria-live="polite" style={{fontSize:10,color:'#8fa5b4',marginTop:8}}>{health}</div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:12,marginTop:12}}>
      <div style={card}><b>ASSET BRIEF</b><label style={{display:'block',fontSize:9,color:'#8ba0ae',marginTop:10}}>ASSET NAME</label><input value={name} onChange={e=>setName(e.target.value)} style={field}/><label style={{display:'block',fontSize:9,color:'#8ba0ae',marginTop:9}}>TYPE</label><select value={kind} onChange={e=>setKind(e.target.value as ForgeAssetKind)} style={field}>{KINDS.map(x=><option key={x}>{x}</option>)}</select><label style={{display:'block',fontSize:9,color:'#8ba0ae',marginTop:9}}>TARGET</label><select value={target} onChange={e=>setTarget(e.target.value as ForgeTarget)} style={field}>{TARGETS.map(x=><option key={x}>{x}</option>)}</select><label style={{display:'block',fontSize:9,color:'#8ba0ae',marginTop:9}}>GAMEPLAY ROLE</label><input value={role} onChange={e=>setRole(e.target.value)} style={field}/><label style={{display:'block',fontSize:9,color:'#8ba0ae',marginTop:9}}>HOLOGPT DESIGN PROMPT</label><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={5} style={{...field,minHeight:120}}/><label style={{display:'flex',gap:8,marginTop:10,fontSize:10,color:'#adbbc5'}}><input type="checkbox" checked={rights} onChange={e=>setRights(e.target.checked)}/> I own or have permission to use any references supplied to Holo Forge.</label><button onClick={compile} disabled={!rights} style={{...btn,width:'100%',marginTop:12,opacity:rights?1:.5}}>COMPILE HOLO FORGE PRODUCTION PLAN</button></div>

      <div style={card}><b>PRODUCTION PIPELINE</b>{!plan?<div style={{fontSize:11,color:'#8296a4',lineHeight:1.6,marginTop:10}}>Compile an asset brief to generate the production stages, device budget, validation gates and StreetVerse/Holoverse handoff.</div>:<><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7,marginTop:10}}><div style={card}><div style={{fontSize:8,color:'#8295a3'}}>TRIANGLES</div><b>{plan.budget.maxTriangles.toLocaleString()}</b></div><div style={card}><div style={{fontSize:8,color:'#8295a3'}}>TEXTURE</div><b>{plan.budget.maxTextureSize}px</b></div><div style={card}><div style={{fontSize:8,color:'#8295a3'}}>LODS</div><b>{plan.budget.lodCount}</b></div></div><div style={{display:'grid',gap:6,marginTop:9,maxHeight:370,overflowY:'auto'}}>{plan.stages.map(stage=><div key={stage.id} style={{border:'1px solid #1f3543',borderRadius:10,padding:9}}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><b style={{fontSize:10}}>{stage.label}</b><span style={{fontSize:8,color:stage.state==='execution-ready'?'#78ffb4':stage.state==='blocked'?'#ffc96b':'#83a3b5'}}>{stage.state.toUpperCase()}</span></div><div style={{fontSize:9,color:'#8093a1',lineHeight:1.45,marginTop:4}}>{stage.purpose}</div></div>)}</div><div style={{marginTop:9,border:'1px solid '+(plan.executionReady?'#2d7653':'#735e31'),borderRadius:10,padding:9,fontSize:10,color:plan.executionReady?'#78ffb4':'#ffc96b'}}>{plan.executionReady?'ALL REQUIRED EXECUTION LANES CONNECTED':'PLAN READY • ONE OR MORE GENERATION/QA LANES STILL NEED COMPUTE OR PROVIDER CONFIGURATION'}</div></>}</div>
    </div>

    <div style={{...card,marginTop:12}}><b>BETTER GAME DEVELOPMENT ENGINE — 8 PRODUCTION CELLS</b><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:7,marginTop:9}}>{GAME_ENGINE_CELLS.map(cell=><div key={cell.id} style={{border:'1px solid #1e3441',borderRadius:10,padding:9}}><div style={{fontSize:10,fontWeight:900,color:'#dff8ff'}}>{cell.label}</div><div style={{fontSize:9,color:'#7f93a1',lineHeight:1.45,marginTop:4}}>{cell.purpose}</div></div>)}</div></div>
  </section>
}
