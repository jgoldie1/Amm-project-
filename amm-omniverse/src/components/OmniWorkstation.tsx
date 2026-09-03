import { useEffect, useMemo, useState } from 'react'
import { omniWorkflowRecipes, omniWorkstation, type OmniRenderTarget, type OmniWorkstationState } from '../runtime/OmniWorkstationRuntime'

const card: React.CSSProperties = { border:'1px solid #25364a', borderRadius:18, background:'#0a111c', padding:16 }
const button: React.CSSProperties = { border:'1px solid #385470', borderRadius:12, background:'#101a29', color:'#fff', padding:'11px 13px', fontWeight:900, cursor:'pointer' }

export default function OmniWorkstation() {
  const [state,setState] = useState<OmniWorkstationState>(()=>omniWorkstation.getState())
  const [name,setName] = useState('My TRYAMM Project')
  const active = useMemo(()=>state.projects.find(p=>p.id===state.activeProjectId) || null,[state])

  useEffect(()=>{
    const sync = ()=>setState(omniWorkstation.getState())
    window.addEventListener('tryamm:workstation:state',sync)
    return ()=>window.removeEventListener('tryamm:workstation:state',sync)
  },[])

  const create = (workflow?: string) => {
    setState(omniWorkstation.createProject(name.trim() || 'Untitled project', workflow))
  }
  const target = (value: OmniRenderTarget) => setState(omniWorkstation.setRenderTarget(value))

  return <main style={{minHeight:'100vh',background:'radial-gradient(circle at top,#10243c 0,#05070d 48%,#020308 100%)',color:'#fff',fontFamily:'system-ui,sans-serif',padding:'20px clamp(14px,3vw,34px) 48px',overflowY:'auto'}}>
    <header style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'center',flexWrap:'wrap',marginBottom:18}}>
      <div><div style={{fontSize:11,letterSpacing:4,color:'#70e4ff',fontWeight:950}}>TRYAMM</div><h1 style={{margin:'5px 0 4px',fontSize:'clamp(28px,5vw,52px)'}}>Omni Workstation</h1><div style={{color:'#94a7bd'}}>Create anywhere. Hand off anywhere. Render where the power is.</div></div>
      <button style={button} onClick={()=>location.href='/'}>← TRYAMM HOME</button>
    </header>

    <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:14,marginBottom:14}}>
      <div style={card}><div style={{color:'#70e4ff',fontSize:11,fontWeight:900}}>THIS DEVICE</div><h2 style={{margin:'6px 0 4px'}}>{state.deviceLabel}</h2><div style={{color:'#8799ad',fontSize:13}}>Device ID: {state.deviceId.slice(0,14)}…</div><div style={{marginTop:10,color:'#b9c7d6'}}>Your project state persists locally and is ready for cloud/account sync.</div></div>
      <div style={card}><div style={{color:'#70e4ff',fontSize:11,fontWeight:900}}>ACTIVE PROJECT</div><h2 style={{margin:'6px 0 4px'}}>{active?.name || 'No project yet'}</h2><div style={{color:'#8799ad',fontSize:13}}>{active ? `${active.assets.length} saved assets • ${active.renderTarget}` : 'Create a project to start a portable workflow.'}</div></div>
    </section>

    <section style={{...card,marginBottom:14}}>
      <h2 style={{marginTop:0}}>Start a project</h2>
      <div style={{display:'flex',gap:9,flexWrap:'wrap'}}><input aria-label="Project name" value={name} onChange={e=>setName(e.target.value)} style={{flex:'1 1 220px',minWidth:0,border:'1px solid #30455d',borderRadius:12,background:'#060b13',color:'#fff',padding:'12px 13px',fontSize:15}}/><button style={button} onClick={()=>create()}>NEW PROJECT</button></div>
    </section>

    <section style={{marginBottom:14}}><h2>Workflow Recipes</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>{omniWorkflowRecipes.map(recipe=><article key={recipe.id} style={card}><div style={{fontSize:17,fontWeight:950}}>{recipe.name}</div><ol style={{paddingLeft:20,color:'#9fb1c5',lineHeight:1.6,fontSize:13}}>{recipe.steps.map(step=><li key={step}>{step}</li>)}</ol><button style={button} onClick={()=>create(recipe.id)}>USE RECIPE</button></article>)}</div></section>

    <section style={{...card,marginBottom:14}}><h2 style={{marginTop:0}}>Render Power</h2><p style={{color:'#9fb1c5'}}>Choose where heavy AI, video, audio or 3D work should run. Phone creation stays lightweight while cloud or your workstation can do the heavy render.</p><div style={{display:'flex',gap:9,flexWrap:'wrap'}}>{([['this-device','THIS DEVICE'],['cloud','CLOUD POWER'],['workstation','MY WORKSTATION']] as const).map(([value,label])=><button key={value} style={{...button,outline:active?.renderTarget===value?'2px solid #70e4ff':'none'}} disabled={!active} onClick={()=>target(value)}>{label}</button>)}</div></section>

    <section style={{marginBottom:14}}><h2>Creator Launchpad</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10}}>
      <button style={button} onClick={()=>omniWorkstation.launch('omnireel')}>🎬 OmniReel AI</button>
      <button style={button} onClick={()=>omniWorkstation.launch('streetverse')}>🌆 StreetVerse Creator</button>
      <button style={button} onClick={()=>omniWorkstation.launch('holo')}>◈ Holo Screen</button>
      <button style={button} onClick={()=>omniWorkstation.launch('audio')}>♫ Pro Audio / 64-Track</button>
      <button style={button} onClick={()=>omniWorkstation.launch('live')}>● LIVE / PK Studio</button>
    </div></section>

    <section style={card}><h2 style={{marginTop:0}}>What this absorbs</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10,color:'#aebed0',lineHeight:1.55,fontSize:13}}><div><b style={{color:'#fff'}}>Creative agent</b><br/>Outcome-first multi-step creation instead of tool hunting.</div><div><b style={{color:'#fff'}}>Reusable elements</b><br/>Characters, locations, brand assets and scenes stay with the project.</div><div><b style={{color:'#fff'}}>Workflow recipes</b><br/>Repeatable pipelines for Reels, campaigns, LIVE highlights and world scenes.</div><div><b style={{color:'#fff'}}>Device handoff</b><br/>Start on phone and continue on Chromebook, PC or workstation.</div><div><b style={{color:'#fff'}}>Remote render targets</b><br/>Keep lightweight devices responsive while stronger compute handles heavy jobs.</div><div><b style={{color:'#fff'}}>Publish destinations</b><br/>One project can feed TRYAMM Reels, LIVE, StreetVerse, marketplace and Omni Box.</div></div></section>
  </main>
}
