import {useMemo,useState} from 'react'
import {
  CHICAGO_WEST_SIDE_FORGE_CELLS,
  WORLD_FORGER_OUTPUTS,
  WORLD_FORGER_PIPELINE,
  WORLD_FORGER_SOURCE_RULES,
  createBuildingCadPlan,
  makeWorldForgeRecipe,
  validateCadPlan,
  validateForgeRecipe,
  type ForgeAssetKind,
  type ForgeSource,
} from '../game/forger/StreetVerseWorldForger'

const btn:React.CSSProperties={minHeight:44,borderRadius:12,border:'1px solid #4f7893',background:'#0a1c28',color:'#fff',fontWeight:900,padding:'9px 11px',touchAction:'manipulation'}
const input:React.CSSProperties={width:'100%',boxSizing:'border-box',minHeight:44,borderRadius:10,border:'1px solid #38576a',background:'#061019',color:'#fff',padding:'0 9px',marginTop:4}

function slug(value:string){
  return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,80)
}

export default function WorldForgerControlPanel(){
  const [districtId,setDistrictId]=useState('circle-park-abla')
  const [kind,setKind]=useState<ForgeAssetKind>('building')
  const [label,setLabel]=useState('West Side Building')
  const [prompt,setPrompt]=useState('photorealistic Chicago neighborhood building, game-ready PBR, realistic scale, clean mobile topology, no logos, no private interior assumptions')
  const [width,setWidth]=useState(18)
  const [depth,setDepth]=useState(28)
  const [floors,setFloors]=useState(3)
  const [elevator,setElevator]=useState(false)
  const [sourceKind,setSourceKind]=useState<ForgeSource['kind']>('conceptual')
  const [sourceUrl,setSourceUrl]=useState('')
  const [rights,setRights]=useState(false)
  const [message,setMessage]=useState('')
  const [lastPlan,setLastPlan]=useState<any>(null)

  const district=useMemo(()=>CHICAGO_WEST_SIDE_FORGE_CELLS.find(cell=>cell.id===districtId)!,[districtId])

  const makePlan=()=>{
    const id=`wf-${districtId}-${slug(label)||kind}`
    const source:ForgeSource={
      id:`${id}-source-1`,
      kind:sourceKind,
      uri:sourceUrl.trim()||undefined,
      rightsCleared:sourceKind==='street-view-reference'?false:rights,
      referenceOnly:sourceKind==='street-view-reference',
      notes:sourceKind==='street-view-reference'?'visual reference only; never texture-extraction source':undefined,
    }
    const cad=kind==='building'?createBuildingCadPlan({
      id:`${id}-cad`,label,widthM:width,depthM:depth,floors,sourceIds:[source.id],elevator,conceptualOnly:sourceKind==='conceptual'||sourceKind==='street-view-reference'
    }):undefined
    const recipe=makeWorldForgeRecipe({
      id,label,kind,districtId,sourceIds:[source.id],cadPlanId:cad?.id,prompt,
      target:kind==='character'?'rig':sourceKind==='owner-authorized-photo'||sourceKind==='user-capture'?'image-to-3d':'text-to-3d',
      textureWrap:sourceKind==='street-view-reference'||sourceKind==='conceptual'?'procedural':'hybrid',
    })
    const errors=[
      ...(cad?validateCadPlan(cad):[]),
      ...validateForgeRecipe(recipe,[source],cad),
    ]
    const plan={district,source,cad,recipe,errors,createdAt:new Date().toISOString()}
    setLastPlan(plan)
    try{localStorage.setItem('tryamm.world-forger.last-plan.v1',JSON.stringify(plan))}catch{}
    window.dispatchEvent(new CustomEvent('tryamm:world-forge-plan',{detail:plan}))
    setMessage(errors.length?`PLAN NEEDS REVIEW • ${errors.join(' • ')}`:'PLAN READY • founder preview before any credit-consuming generation')
  }

  const sendToFactory=()=>{
    if(!lastPlan||lastPlan.errors?.length){setMessage('Fix the plan errors before sending it to Meshy Factory.');return}
    try{localStorage.setItem('tryamm.world-forger.factory-handoff.v1',JSON.stringify(lastPlan))}catch{}
    window.dispatchEvent(new CustomEvent('tryamm:world-forge-factory-handoff',{detail:lastPlan}))
    window.location.href='/meshy-factory?source=world-forger'
  }

  const openStreetVerse=()=>{
    const params=new URLSearchParams({forgeDistrict:districtId})
    window.location.href=`/streetverse?${params.toString()}`
  }

  return <main aria-label="TRYAMM World Forger" style={{minHeight:'100dvh',background:'linear-gradient(#02060b,#071520)',color:'#fff',fontFamily:'system-ui,sans-serif',padding:'max(16px,env(safe-area-inset-top)) 12px max(32px,env(safe-area-inset-bottom))'}}>
    <section style={{maxWidth:980,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'flex-start',flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:10,letterSpacing:3,fontWeight:950,color:'#69e7ff'}}>TRYAMM • STREETVERSE</div>
          <h1 style={{margin:'5px 0',fontSize:'clamp(28px,8vw,48px)'}}>World Forger</h1>
          <p style={{maxWidth:780,fontSize:12,lineHeight:1.55,color:'#a9bcc8'}}>One build surface for neighborhoods, CAD-style building plans, Meshy asset recipes, character/vehicle/prop creation, texture policy, collisions, navigation, interactions and mobile LODs.</p>
        </div>
        <button onClick={()=>{window.location.href='/streetverse'}} style={btn}>OPEN STREETVERSE</button>
      </div>

      <section style={{marginTop:12,padding:12,border:'1px solid #2f5366',borderRadius:16,background:'#06121bdd'}}>
        <b style={{fontSize:12,color:'#8eeeff'}}>WEST SIDE BUILD CELLS</b>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:7,marginTop:8}}>
          {CHICAGO_WEST_SIDE_FORGE_CELLS.map(cell=><button key={cell.id} onClick={()=>setDistrictId(cell.id)} style={{...btn,textAlign:'left',background:districtId===cell.id?'#15364a':'#081923',borderColor:districtId===cell.id?'#72e5ff':'#345567'}}>
            <b>{cell.name}</b><span style={{display:'block',fontSize:8,opacity:.7,marginTop:3}}>{cell.firstWave?'FIRST WAVE':'EXPANSION'} • {cell.gameplay.missionTypes.slice(0,3).join(' • ')}</span>
          </button>)}
        </div>
        <div style={{fontSize:9,color:'#9fb4bf',marginTop:8}}>Selected anchors: {district.anchors.join(' • ')}</div>
      </section>

      <section style={{marginTop:12,padding:12,border:'1px solid #4d3f72',borderRadius:16,background:'#0c0916dd'}}>
        <b style={{fontSize:12,color:'#d0b5ff'}}>CREATE ANY GAME ASSET</b>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:8,marginTop:9}}>
          <label style={{fontSize:9,color:'#c5b9d7'}}>ASSET TYPE
            <select value={kind} onChange={e=>setKind(e.target.value as ForgeAssetKind)} style={input}>
              <option value="building">Building</option>
              <option value="character">Person / character</option>
              <option value="vehicle">Vehicle</option>
              <option value="prop">Prop</option>
              <option value="street-furniture">Street furniture</option>
              <option value="infrastructure">Road / infrastructure</option>
            </select>
          </label>
          <label style={{fontSize:9,color:'#c5b9d7'}}>NAME
            <input value={label} onChange={e=>setLabel(e.target.value)} style={input}/>
          </label>
          <label style={{fontSize:9,color:'#c5b9d7'}}>SOURCE TYPE
            <select value={sourceKind} onChange={e=>setSourceKind(e.target.value as ForgeSource['kind'])} style={input}>
              <option value="conceptual">Conceptual / original</option>
              <option value="owner-authorized-photo">Owner-authorized photo</option>
              <option value="user-capture">User capture</option>
              <option value="permissioned-scan">Permissioned scan</option>
              <option value="licensed-plan">Licensed plan / blueprint</option>
              <option value="open-gis">Open GIS footprint</option>
              <option value="open-data">Open data</option>
              <option value="street-view-reference">Street-view reference only</option>
            </select>
          </label>
        </div>

        <label style={{display:'block',fontSize:9,color:'#c5b9d7',marginTop:8}}>REFERENCE LINK / SOURCE POINTER
          <input value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="Optional link or internal asset pointer" style={input}/>
        </label>
        <label style={{display:'block',fontSize:9,color:'#c5b9d7',marginTop:8}}>FORGE PROMPT
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={4} style={{...input,padding:9}}/>
        </label>

        {kind==='building'&&<div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:6,marginTop:8}}>
          <label style={{fontSize:8,color:'#b8a9ca'}}>WIDTH M<input type="number" min={2} value={width} onChange={e=>setWidth(Number(e.target.value)||2)} style={input}/></label>
          <label style={{fontSize:8,color:'#b8a9ca'}}>DEPTH M<input type="number" min={2} value={depth} onChange={e=>setDepth(Number(e.target.value)||2)} style={input}/></label>
          <label style={{fontSize:8,color:'#b8a9ca'}}>FLOORS<input type="number" min={1} max={120} value={floors} onChange={e=>setFloors(Math.max(1,Number(e.target.value)||1))} style={input}/></label>
          <label style={{fontSize:8,color:'#b8a9ca',display:'grid',alignContent:'end'}}><span style={{minHeight:44,display:'flex',alignItems:'center',gap:6}}><input type="checkbox" checked={elevator} onChange={e=>setElevator(e.target.checked)}/> ELEVATOR</span></label>
        </div>}

        {sourceKind!=='street-view-reference'&&<label style={{display:'flex',gap:7,alignItems:'flex-start',fontSize:9,color:'#c6d4da',lineHeight:1.45,marginTop:9}}>
          <input type="checkbox" checked={rights} onChange={e=>setRights(e.target.checked)}/>
          <span>I have the rights/permission needed to use this source for the requested build. Real-person likenesses still require their separate likeness authorization.</span>
        </label>}
        {sourceKind==='street-view-reference'&&<div style={{fontSize:9,color:'#ffd596',lineHeight:1.45,marginTop:9}}>Street-view imagery stays reference-only. World Forger will not treat it as an owned texture or geometry source.</div>}

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:6,marginTop:10}}>
          <button onClick={makePlan} style={btn}>BUILD CAD / FORGE PLAN</button>
          <button onClick={sendToFactory} disabled={!lastPlan||Boolean(lastPlan?.errors?.length)} style={{...btn,borderColor:'#7d60a6'}}>SEND TO MESHY FACTORY</button>
          <button onClick={openStreetVerse} style={{...btn,borderColor:'#67a66f'}}>OPEN DISTRICT IN GAME</button>
        </div>
        {message&&<div aria-live="polite" style={{fontSize:9,color:message.includes('NEEDS')?'#ffbfaa':'#a4ffd0',marginTop:8}}>{message}</div>}
      </section>

      {lastPlan&&<section style={{marginTop:12,padding:12,border:'1px solid #345663',borderRadius:16,background:'#061019'}}>
        <b style={{fontSize:11,color:'#8eeeff'}}>LAST FORGE PLAN</b>
        <div style={{fontSize:9,color:'#a9bdc7',lineHeight:1.5,marginTop:5}}>
          {lastPlan.recipe.label} • {lastPlan.recipe.kind} • {lastPlan.district.name}<br/>
          Pipeline: {WORLD_FORGER_PIPELINE.join(' → ')}<br/>
          Output: {(WORLD_FORGER_OUTPUTS as any)[lastPlan.recipe.kind]?.join(' • ')||'mesh • materials • collision • LOD'}
        </div>
        {lastPlan.cad&&<div style={{fontSize:9,color:'#cbb8e5',lineHeight:1.5,marginTop:6}}>CAD: {lastPlan.cad.footprintM.width}m × {lastPlan.cad.footprintM.depth}m • {lastPlan.cad.levels.length} level(s) • {lastPlan.cad.verticalCores.filter((c:any)=>c.kind==='stairs').length} stair core(s) • {lastPlan.cad.verticalCores.some((c:any)=>c.kind==='elevator')?'elevator included':'no elevator'} • plumbing/electrical/HVAC graph included.</div>}
      </section>}

      <section style={{marginTop:12,padding:12,border:'1px solid #6c592d',borderRadius:16,background:'#151005'}}>
        <b style={{fontSize:10,color:'#ffe0a0'}}>SOURCE / REALISM RULE</b>
        <div style={{fontSize:9,color:'#cdbf9f',lineHeight:1.5,marginTop:4}}>Google/street-view style imagery helps a human understand a place, but it is not automatically a TRYAMM texture source. Use authorized photos, permissioned scans, licensed plans or appropriately licensed open data when the game needs persistent geometry/textures. Selected interiors require authorization rather than inference.</div>
        <div style={{fontSize:8,color:'#94866b',marginTop:5}}>{Object.entries(WORLD_FORGER_SOURCE_RULES).map(([k,v])=>`${k}: ${v}`).join(' • ')}</div>
      </section>
    </section>
  </main>
}
