import {useMemo,useState} from 'react'
import {buildWorldForgePlan,TRYAMM_WORLD_FORGER,type WorldForgeKind,type WorldForgeSourceKind} from '../runtime/TRYAMMWorldForger'
import type {ForgeTarget} from '../ai/holoForgeGameEngine'

const KINDS:WorldForgeKind[]=['person','npc','vehicle','building','interior','street','neighborhood','prop','environment']
const TARGETS:ForgeTarget[]=['streetverse','holoverse','starverse','mobile-safe','cinematic']
const SOURCES:WorldForgeSourceKind[]=['prompt','photo','multi-view-photos','scan','blueprint','floor-plan','cad','glb','licensed-reference']

const box:React.CSSProperties={border:'1px solid #314b5c',borderRadius:13,background:'#06101a',padding:10}
const field:React.CSSProperties={width:'100%',boxSizing:'border-box',minHeight:44,border:'1px solid #345268',borderRadius:10,background:'#02080d',color:'#fff',padding:'9px 10px'}
const btn:React.CSSProperties={minHeight:44,border:'1px solid #64ddff88',borderRadius:11,background:'#0d2f3c',color:'#e9fbff',fontWeight:900,padding:'9px 12px',touchAction:'manipulation'}

export default function TRYAMMWorldForgerPanel(){
  const [name,setName]=useState('StreetVerse World Asset')
  const [kind,setKind]=useState<WorldForgeKind>('building')
  const [target,setTarget]=useState<ForgeTarget>('streetverse')
  const [prompt,setPrompt]=useState('Create a photorealistic, game-ready StreetVerse asset with real scale, clean materials, collisions, accessibility, LODs and mission hooks.')
  const [sources,setSources]=useState<WorldForgeSourceKind[]>(['prompt'])
  const [rights,setRights]=useState(false)
  const [realPerson,setRealPerson]=useState(false)
  const [likeness,setLikeness]=useState(false)
  const [needsInterior,setNeedsInterior]=useState(true)
  const [needsMEP,setNeedsMEP]=useState(true)
  const [needsRig,setNeedsRig]=useState(false)
  const [needsPhysics,setNeedsPhysics]=useState(true)
  const [needsMissions,setNeedsMissions]=useState(true)
  const [compiled,setCompiled]=useState(false)

  const plan=useMemo(()=>buildWorldForgePlan({
    name,kind,target,prompt,sources,rightsConfirmed:rights,realPerson,likenessAuthorized:likeness,
    needsInterior,needsMEP,needsRig,needsPhysics,needsMissions,
  }),[name,kind,target,prompt,sources,rights,realPerson,likeness,needsInterior,needsMEP,needsRig,needsPhysics,needsMissions])

  const toggleSource=(source:WorldForgeSourceKind)=>{
    setSources(prev=>prev.includes(source)?prev.filter(item=>item!==source):[...prev,source])
  }

  const compile=()=>{
    setCompiled(true)
    window.dispatchEvent(new CustomEvent('tryamm:world-forger-plan',{detail:plan}))
    window.dispatchEvent(new CustomEvent('tryamm:system-fabric-signal',{detail:{
      system:'world-forger',
      status:plan.publishBlockedReasons.length?'degraded':'ready',
      source:'TRYAMMWorldForgerPanel',
      reason:plan.publishBlockedReasons.join(', ')||undefined,
      evidence:{kind:plan.kind,target:plan.target,stages:plan.stages.length,architectureReady:plan.architectureReady},
    }}))
  }

  return <section aria-label="TRYAMM World Forger" style={{marginTop:12,padding:13,border:'1px solid #3b6f8b',borderRadius:17,background:'#07131f'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
      <div>
        <div style={{fontSize:10,letterSpacing:2.2,color:'#72e7ff',fontWeight:950}}>TRYAMM WORLD FORGER</div>
        <h2 style={{margin:'4px 0',fontSize:'clamp(20px,5vw,30px)'}}>People • vehicles • buildings • neighborhoods • worlds</h2>
        <div style={{fontSize:10,color:'#9db1bd',lineHeight:1.5,maxWidth:760}}>One production control plane connects HoloGPT, Stubbs AI, CAD, Construct, Holo Forge, Meshy, character/vehicle rigging, building reconstruction, texture wrapping, Game Ops and World Compiler. The goal is one source of truth from idea to validated game asset.</div>
      </div>
      <span style={{fontSize:9,padding:'5px 8px',border:'1px solid #48708a',borderRadius:999,color:'#a8efff'}}>V1 • PROVIDER-NEUTRAL</span>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:10,marginTop:11}}>
      <div style={box}>
        <b style={{fontSize:11}}>WHAT TO FORGE</b>
        <label style={{display:'block',fontSize:9,color:'#8fa8b5',marginTop:8}}>NAME<input value={name} onChange={e=>setName(e.target.value)} style={{...field,marginTop:4}}/></label>
        <label style={{display:'block',fontSize:9,color:'#8fa8b5',marginTop:8}}>TYPE<select value={kind} onChange={e=>setKind(e.target.value as WorldForgeKind)} style={{...field,marginTop:4}}>{KINDS.map(item=><option key={item} value={item}>{item.toUpperCase()}</option>)}</select></label>
        <label style={{display:'block',fontSize:9,color:'#8fa8b5',marginTop:8}}>TARGET<select value={target} onChange={e=>setTarget(e.target.value as ForgeTarget)} style={{...field,marginTop:4}}>{TARGETS.map(item=><option key={item} value={item}>{item}</option>)}</select></label>
        <label style={{display:'block',fontSize:9,color:'#8fa8b5',marginTop:8}}>HOLOGPT / ENGINEERING BRIEF<textarea rows={5} value={prompt} onChange={e=>setPrompt(e.target.value)} style={{...field,marginTop:4,minHeight:110}}/></label>
      </div>

      <div style={box}>
        <b style={{fontSize:11}}>SOURCE + RIGHTS</b>
        <div style={{display:'flex',gap:5,flexWrap:'wrap',marginTop:8}}>
          {SOURCES.map(source=><button type="button" key={source} onClick={()=>toggleSource(source)} style={{...btn,minHeight:34,padding:'6px 8px',fontSize:8,background:sources.includes(source)?'#13465a':'#081722'}}>{source.toUpperCase()}</button>)}
        </div>
        <label style={{display:'flex',gap:8,marginTop:10,fontSize:9,lineHeight:1.4,color:'#b7c5cc'}}><input type="checkbox" checked={rights} onChange={e=>setRights(e.target.checked)}/> I own or have permission to use the supplied references for this production.</label>
        <label style={{display:'flex',gap:8,marginTop:8,fontSize:9,lineHeight:1.4,color:'#b7c5cc'}}><input type="checkbox" checked={realPerson} onChange={e=>setRealPerson(e.target.checked)}/> This asset represents a real person.</label>
        {realPerson&&<label style={{display:'flex',gap:8,marginTop:8,fontSize:9,lineHeight:1.4,color:'#ffd9ad'}}><input type="checkbox" checked={likeness} onChange={e=>setLikeness(e.target.checked)}/> Verified likeness authorization is present.</label>}
        <div style={{fontSize:8,color:'#758894',lineHeight:1.45,marginTop:8}}>Generic fictional NPCs do not need a real-person likeness release. A real person stays blocked from a verified photo-match claim until authorization is verified.</div>
      </div>

      <div style={box}>
        <b style={{fontSize:11}}>BUILD SYSTEMS</b>
        {[
          ['Interior rooms',needsInterior,setNeedsInterior],
          ['Stairs / elevator / plumbing / utility graph',needsMEP,setNeedsMEP],
          ['Rig / moving parts',needsRig,setNeedsRig],
          ['Physics / collision',needsPhysics,setNeedsPhysics],
          ['Mission / interaction hooks',needsMissions,setNeedsMissions],
        ].map(([label,value,setter])=><label key={String(label)} style={{display:'flex',gap:8,marginTop:8,fontSize:9,color:'#b8c7cf'}}><input type="checkbox" checked={Boolean(value)} onChange={e=>(setter as (v:boolean)=>void)(e.target.checked)}/>{String(label)}</label>)}
        <button onClick={compile} style={{...btn,width:'100%',marginTop:12}}>COMPILE WORLD FORGER PLAN</button>
      </div>
    </div>

    {compiled&&<div style={{marginTop:11,...box}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}>
        <b>{plan.name} • {plan.kind.toUpperCase()}</b>
        <span style={{fontSize:9,color:plan.publishBlockedReasons.length?'#ffc590':'#8effbd'}}>{plan.publishBlockedReasons.length?'BLOCKED FROM PUBLISH':'PRODUCTION PLAN READY'}</span>
      </div>
      {plan.publishBlockedReasons.length>0&&<div style={{fontSize:9,color:'#ffc590',marginTop:5}}>Fix first: {plan.publishBlockedReasons.join(' • ')}</div>}
      <div style={{display:'grid',gap:6,marginTop:8}}>
        {plan.stages.map(stage=><div key={stage.id} style={{border:'1px solid #244051',borderRadius:10,padding:8}}>
          <div style={{fontSize:10,fontWeight:900,color:'#e8fbff'}}>{stage.label}</div>
          <div style={{fontSize:9,color:'#8fa6b2',lineHeight:1.45,marginTop:3}}>{stage.purpose}</div>
          <div style={{fontSize:8,color:'#6f8794',marginTop:3}}>Tech: {stage.technologies.join(' • ')}</div>
          <div style={{fontSize:8,color:'#78a99a',marginTop:2}}>Output: {stage.output.join(' • ')}</div>
        </div>)}
      </div>
      <div style={{fontSize:8,color:'#768d99',lineHeight:1.5,marginTop:8}}>World Forger does not claim that a plan alone creates a finished photoreal production asset. Final status requires real artifacts plus exact gameplay/device QA.</div>
    </div>}

    <div style={{fontSize:8,color:'#6f8591',lineHeight:1.45,marginTop:8}}>{TRYAMM_WORLD_FORGER.purpose}</div>
  </section>
}
