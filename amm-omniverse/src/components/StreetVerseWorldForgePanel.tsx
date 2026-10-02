import {useEffect,useMemo,useState} from 'react'
import {cloneWorldForgePreset,STREET_VIEW_REFERENCE_RULE,WEST_SIDE_WORLD_FORGE_PRESETS,type WorldForgePlan,type WorldForgeSource} from '../runtime/StreetVerseChicagoWorldForge'

type Props={onClose:()=>void}

const btn:React.CSSProperties={minHeight:46,borderRadius:12,border:'1px solid #4fc9ff77',background:'#09202b',color:'#fff',fontWeight:950,fontSize:10,padding:'9px 11px',touchAction:'manipulation'}
const panel:React.CSSProperties={padding:12,border:'1px solid #294a5f',borderRadius:14,background:'#07131bdd'}

export default function StreetVerseWorldForgePanel({onClose}:Props){
  const [presetId,setPresetId]=useState(WEST_SIDE_WORLD_FORGE_PRESETS[0].id)
  const [sources,setSources]=useState<WorldForgeSource[]>([])
  const [plan,setPlan]=useState<WorldForgePlan|null>(null)
  const [message,setMessage]=useState('')
  const preset=useMemo(()=>cloneWorldForgePreset(presetId),[presetId])

  useEffect(()=>{
    const onPlan=(event:Event)=>{
      const detail=(event as CustomEvent<{plan?:WorldForgePlan}>).detail||{}
      if(detail.plan)setPlan(detail.plan)
    }
    addEventListener('tryamm:streetverse-world-forge-plan',onPlan)
    return()=>removeEventListener('tryamm:streetverse-world-forge-plan',onPlan)
  },[])

  const createPlan=()=>{
    const request={...preset,sources}
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-world-forge-request',{detail:request}))
    setMessage('Build plan created. No paid provider generation or production mutation started.')
  }

  const addSource=(kind:WorldForgeSource['kind'])=>{
    const id=`${kind}-${Date.now()}`
    const referenceOnly=kind==='street-view-reference'
    setSources(current=>[...current,{
      id,kind,authorized:referenceOnly?true:false,
      rights:referenceOnly?'reference-only':'unknown',
      mayUseAsTexture:false,
      note:referenceOnly?STREET_VIEW_REFERENCE_RULE.role:'Attach source and rights/provenance before production use.',
    }])
  }

  const approveProviderProposal=()=>{
    window.dispatchEvent(new Event('tryamm:streetverse-world-forge-provider-proposal-request'))
    setMessage('Provider task proposal emitted for review. This still does not spend Meshy credits or mutate production automatically.')
  }

  return <div role="dialog" aria-modal="true" aria-label="StreetVerse Chicago World Forge" style={{position:'fixed',inset:0,zIndex:13050,background:'radial-gradient(circle at 20% 0%,#123346,#050913 48%,#020307)',color:'#fff',overflowY:'auto',fontFamily:'system-ui,sans-serif'}}>
    <header style={{position:'sticky',top:0,zIndex:2,display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',padding:'13px 15px',background:'#050a12ee',borderBottom:'1px solid #4fc9ff44',backdropFilter:'blur(12px)'}}>
      <div><div style={{fontSize:9,letterSpacing:3,color:'#72e3ff',fontWeight:950}}>STREETVERSE • CHICAGO WORLD FORGE</div><h1 style={{margin:'4px 0',fontSize:'clamp(22px,6vw,38px)'}}>CAD → Holographic Build → Photoreal World</h1><div style={{fontSize:11,color:'#9eb4c0'}}>One build plan connects CAD, structure, interiors, utilities, facade wrap, Meshy, Construct, missions, Game Ops and mobile QA.</div></div>
      <button onClick={onClose} style={btn}>CLOSE</button>
    </header>

    <main style={{maxWidth:1050,margin:'0 auto',padding:14,display:'grid',gap:12}}>
      <section style={panel}>
        <b style={{fontSize:11,color:'#9eeaff'}}>1 • CHOOSE WHAT TO BUILD</b>
        <select value={presetId} onChange={e=>{setPresetId(e.target.value);setPlan(null)}} style={{display:'block',width:'100%',minHeight:48,marginTop:7,borderRadius:11,border:'1px solid #315a70',background:'#06111a',color:'#fff',padding:'0 10px'}}>
          {WEST_SIDE_WORLD_FORGE_PRESETS.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <div style={{fontSize:10,lineHeight:1.5,color:'#aebec7',marginTop:7}}>Preset includes structure, interiors, stairs, elevator where requested, plumbing, electrical, HVAC, fire/egress, collision, navmesh, gameplay anchors, traffic/population and photoreal mobile optimization.</div>
      </section>

      <section style={panel}>
        <b style={{fontSize:11,color:'#9eeaff'}}>2 • ADD REFERENCE / CAD SOURCES</b>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:8}}>
          {(['owner-photo','licensed-photo','scan','floor-plan','blueprint','open-data','street-view-reference','manual-measurement'] as const).map(kind=><button key={kind} onClick={()=>addSource(kind)} style={{...btn,minHeight:38,fontSize:9}}>{kind.replaceAll('-',' ').toUpperCase()}</button>)}
        </div>
        {sources.length===0?<div style={{fontSize:9,color:'#8fa3ad',marginTop:8}}>No references attached yet. You can still generate a procedural blockout plan, but not call it a verified photoreal reconstruction.</div>:<div style={{display:'grid',gap:5,marginTop:8}}>{sources.map(source=><div key={source.id} style={{padding:8,border:'1px solid #223d4d',borderRadius:9,fontSize:9,color:'#b8c7ce'}}><b>{source.kind.toUpperCase()}</b> • rights {source.rights} • texture use {source.mayUseAsTexture?'YES':'NO'}<div style={{opacity:.65,marginTop:2}}>{source.note}</div></div>)}</div>}
        <div style={{fontSize:9,color:'#d8bd87',marginTop:8}}>Street-view imagery is treated as reference-only by this pipeline unless a separate license/authorization supports the intended reuse. The game should create its own geometry and authorized textures.</div>
      </section>

      <section style={panel}>
        <b style={{fontSize:11,color:'#9eeaff'}}>3 • COMPILE ONE BUILD PLAN</b>
        <button onClick={createPlan} style={{...btn,width:'100%',marginTop:8,borderColor:'#6df0b088',background:'#08271b'}}>BUILD WEST SIDE PLAN</button>
        {plan&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:7,marginTop:10}}>
          <div style={panel}><b>CAD / BUILDING</b><div style={{fontSize:9,lineHeight:1.55,marginTop:5,color:'#abbcc5'}}>{plan.pipeline.cad.join(' → ')}</div></div>
          <div style={panel}><b>PHOTOREAL</b><div style={{fontSize:9,lineHeight:1.55,marginTop:5,color:'#abbcc5'}}>{plan.pipeline.photoreal.slice(0,9).join(' → ')} → …</div></div>
          <div style={panel}><b>GAMEPLAY</b><div style={{fontSize:9,lineHeight:1.55,marginTop:5,color:'#abbcc5'}}>{plan.pipeline.gameplay.join(' → ')}</div></div>
          <div style={panel}><b>OUTPUTS</b><div style={{fontSize:9,lineHeight:1.55,marginTop:5,color:'#abbcc5'}}>{[...plan.outputs.cadSource,...plan.outputs.runtime].join(' • ')}</div></div>
        </div>}
      </section>

      {plan&&<section style={panel}>
        <b style={{fontSize:11,color:'#e4c5ff'}}>4 • CURSOR / CONSTRUCT / MESHY HANDOFF</b>
        <div style={{fontSize:10,lineHeight:1.5,color:'#b9aeca',marginTop:5}}>Cursor/Construct can write and repair the scene integration, CAD/geometry tasks, collisions, doors, stairs, elevators and gameplay anchors. Meshy can generate/retopologize approved visual assets. Paid provider generation remains approval-gated.</div>
        <button onClick={approveProviderProposal} style={{...btn,width:'100%',marginTop:8,borderColor:'#b98cff77',background:'#1b1029'}}>CREATE PROVIDER TASK PROPOSAL</button>
      </section>}

      {plan&&<section style={panel}>
        <b style={{fontSize:11,color:'#9fffc5'}}>5 • RELEASE GATES</b>
        <div style={{fontSize:9,lineHeight:1.55,color:'#adc0b5',marginTop:5}}>Nothing becomes “done” because the AI generated it. Required gates include collision, spawn, movement, accessibility, traffic, missions, persistence, performance, provenance, founder preview, Game Ops end-to-end and physical iPhone visual proof.</div>
        {plan.warnings.length>0&&<div style={{fontSize:9,lineHeight:1.5,color:'#ffd099',marginTop:6}}>Warnings: {plan.warnings.join(' • ')}</div>}
      </section>}

      {message&&<div aria-live="polite" style={{padding:10,border:'1px solid #345566',borderRadius:11,fontSize:10,color:'#9eeaff'}}>{message}</div>}
    </main>
  </div>
}
