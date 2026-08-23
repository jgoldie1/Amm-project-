import { useEffect, useMemo, useState } from 'react'
import {
  advanceSpaceMission,
  completeCafeShift,
  completeWildernessRun,
  getCafeTwin,
  getGenerationsProfile,
  listCelestialBodies,
  listChronoScenarios,
  listCityDistricts,
  listGenerationsProgress,
  listSpaceMissions,
  listSpecies,
  startCafeShift,
  startChronoRun,
  startCityActivity,
  startSpaceMission,
  startWildernessRun,
  trainGenerationsPathway,
  type CafeInventoryItem,
  type CelestialBody,
  type ChronoScenario,
  type CityDistrict,
  type GenerationsProgress,
  type SpaceMission,
  type Species,
  type WildernessRun,
} from '../services/advancedWorlds'
import { isSupabaseConfigured } from '../services/supabaseClient'

type Tab='space'|'chrono'|'biosphere'|'city'|'cafe'|'generations'
interface Props { onClose:()=>void }

const labels:Record<Tab,string>={space:'🚀 Space',chrono:'⏳ Time Machine',biosphere:'🦋 Biosphere',city:'🌆 Global City',cafe:'☕ AI Café Ops',generations:'🧬 Generations'}

export default function AdvancedWorldSystems({onClose}:Props){
  const configured=useMemo(()=>isSupabaseConfigured(),[])
  const [tab,setTab]=useState<Tab>('space')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)
  const [bodies,setBodies]=useState<CelestialBody[]>([])
  const [missions,setMissions]=useState<SpaceMission[]>([])
  const [chrono,setChrono]=useState<ChronoScenario[]>([])
  const [species,setSpecies]=useState<Species[]>([])
  const [wildRun,setWildRun]=useState<WildernessRun|null>(null)
  const [districts,setDistricts]=useState<CityDistrict[]>([])
  const [cafe,setCafe]=useState<any>(null)
  const [inventory,setInventory]=useState<CafeInventoryItem[]>([])
  const [shift,setShift]=useState<any>(null)
  const [genProfile,setGenProfile]=useState<any>(null)
  const [genProgress,setGenProgress]=useState<GenerationsProgress[]>([])

  async function reload(){
    if(!configured)return
    try{
      const [b,m,c,s,d,cf,gp,pr]=await Promise.all([
        listCelestialBodies(),listSpaceMissions(),listChronoScenarios(),listSpecies(),listCityDistricts(),getCafeTwin(),getGenerationsProfile(),listGenerationsProgress()
      ])
      setBodies(b);setMissions(m);setChrono(c);setSpecies(s);setDistricts(d);setCafe(cf.cafe);setInventory(cf.inventory);setGenProfile(gp);setGenProgress(pr)
    }catch(e){setMessage(e instanceof Error?e.message:String(e))}
  }
  useEffect(()=>{reload()},[configured])

  async function act(fn:()=>Promise<void>){setBusy(true);setMessage('');try{await fn();await reload()}catch(e){setMessage(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}

  const panel:React.CSSProperties={background:'#09091d',border:'1px solid #292957',borderRadius:12,padding:12}
  const btn:React.CSSProperties={background:'#15153a',border:'1px solid #00ffcc55',color:'#00ffcc',borderRadius:8,padding:'8px 11px',cursor:'pointer',fontFamily:'monospace'}
  const muted:React.CSSProperties={color:'#8b8b9c',fontSize:12,lineHeight:1.5}

  return <div style={{position:'fixed',inset:0,zIndex:10040,background:'rgba(2,2,18,.985)',color:'#eee',fontFamily:'monospace',overflowY:'auto'}}>
    <div style={{maxWidth:1180,margin:'0 auto',padding:16}}>
      <div style={{display:'flex',gap:12,alignItems:'center',position:'sticky',top:0,zIndex:5,background:'#020212',padding:'10px 0'}}>
        <button style={btn} onClick={onClose}>← Omniverse</button>
        <div><div style={{fontWeight:900,color:'#ffd700',fontSize:18}}>LIVING WORLDS ADVANCED SYSTEMS</div><div style={{fontSize:10,color:'#777'}}>Space • Chrono • Biosphere • Global City • AI Café • Generations</div></div>
      </div>
      {!configured&&<div style={{...panel,borderColor:'#ffaa00'}}>Supabase is required for these persistent simulations. The UI is installed; apply migration 202608120003 and configure the staging keys to activate account persistence.</div>}
      {message&&<div style={{...panel,borderColor:'#00ffcc55',marginTop:10}}>{message}</div>}
      <div style={{display:'flex',gap:6,flexWrap:'wrap',margin:'12px 0'}}>{(Object.keys(labels) as Tab[]).map(t=><button style={{...btn,background:t===tab?'#003c38':'#15153a'}} key={t} onClick={()=>setTab(t)}>{labels[t]}</button>)}</div>

      {tab==='space'&&<section>
        <h2 style={{color:'#78d5ff'}}>Chrono-Space Exploration Engine</h2><p style={muted}>Real persistent mission state for the Moon, Mars, Saturn, Titan and Enceladus. Values are simulation rules; they do not claim physical spacecraft capability.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:10}}>{bodies.map(b=><article style={panel} key={b.id}><b>{b.name}</b><div style={{fontSize:10,color:'#78d5ff'}}>{b.body_type} • gravity {b.gravity}g • {b.atmosphere}</div><p style={muted}>{b.description}</p><button disabled={busy||!configured} style={btn} onClick={()=>act(async()=>{const m=await startSpaceMission(b.slug);setMessage(`Mission launched to ${b.name}.`);setMissions(x=>[m,...x])})}>Launch Mission</button></article>)}</div>
        <h3>Active / Recent Missions</h3><div style={{display:'grid',gap:8}}>{missions.map(m=><article style={panel} key={m.id}><b>{m.destination_slug.toUpperCase()}</b><div style={{fontSize:11,color:'#aaa'}}>fuel {m.fuel}% • oxygen {m.oxygen}% • supplies {m.supplies}% • science {m.science}% • {m.status}</div>{m.status==='active'&&<button style={{...btn,marginTop:8}} disabled={busy} onClick={()=>act(async()=>{const n=await advanceSpaceMission(m);setMissions(xs=>xs.map(x=>x.id===n.id?n:x));setMessage(`Mission advanced: science ${n.science}%.`)})}>Run Science / Advance</button>}</article>)}</div>
      </section>}

      {tab==='chrono'&&<section><h2 style={{color:'#d6a8ff'}}>Time Machine</h2><p style={muted}>Historical reconstructions label evidence separately from inference; future and alternate runs are simulations, not predictions.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:10}}>{chrono.map(c=><article style={panel} key={c.id}><b>{c.name}</b><div style={{fontSize:10,color:'#d6a8ff'}}>{c.era} • {c.scenario_type} • {c.evidence_level}</div><p style={muted}>{c.description}</p><button style={btn} disabled={busy||!configured} onClick={()=>act(async()=>{await startChronoRun(c.id);setMessage(`Timeline started: ${c.name}.`)})}>Enter Timeline</button></article>)}</div></section>}

      {tab==='biosphere'&&<section><h2 style={{color:'#8cff98'}}>Worldwide Biosphere Engine</h2><p style={muted}>Birds, fish, insects, arachnids, mammals and marine life share one catalog. Large populations are modeled statistically; direct encounters can become individual simulations.</p><div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>{['photography','tracking','fishing','hunting-simulation','conservation','marine-research'].map(a=><button style={btn} disabled={busy||!configured} key={a} onClick={()=>act(async()=>{const r=await startWildernessRun(a);setWildRun(r);setMessage(`${a} expedition started.`)})}>Start {a}</button>)}</div>{wildRun&&wildRun.status==='active'&&<div style={{...panel,marginBottom:12}}><b>Active: {wildRun.activity_type}</b><p style={muted}>Conservation scoring rewards responsible observation/management. Hunting is a regulated simulation lane, not the only wildlife interaction.</p><button style={btn} disabled={busy} onClick={()=>act(async()=>{const r=await completeWildernessRun(wildRun,90);setWildRun(r);setMessage('Expedition completed with conservation score 90.')})}>Complete Responsible Expedition</button></div>}<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:8}}>{species.map(s=><article style={panel} key={s.id}><b>{s.common_name}</b><div style={{fontSize:10,color:'#8cff98'}}>{s.category} • {s.conservation}</div><p style={muted}>Habitat: {s.habitat.join(', ')}<br/>Diet: {s.diet.join(', ')}</p></article>)}</div></section>}

      {tab==='city'&&<section><h2 style={{color:'#ffbd66'}}>Global Open-World City Runtime</h2><p style={muted}>Separate play lanes allow Street/action, Life & City, Kingdom, Business, Creator and Service play in one persistent city model. This is original AMM content, not copied Rockstar maps, characters or missions.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:10}}>{districts.map(d=><article style={panel} key={d.id}><b>{d.name}</b><div style={{fontSize:10,color:'#ffbd66'}}>{d.district_type} • crime {d.crime_enabled?'enabled in adult lane':'off'}</div><div style={{display:'flex',gap:5,flexWrap:'wrap',marginTop:9}}>{(['life-city','business','creator','service'] as const).map(p=><button style={btn} disabled={busy||!configured} key={p} onClick={()=>act(async()=>{await startCityActivity(d.id,`${p}-starter`,p);setMessage(`${p} activity started in ${d.name}.`)})}>{p}</button>)}{d.crime_enabled&&<button style={btn} disabled={busy||!configured} onClick={()=>act(async()=>{await startCityActivity(d.id,'street-story-starter','street');setMessage(`Adult Street World activity started in ${d.name}.`)})}>street</button>}</div></article>)}</div></section>}

      {tab==='cafe'&&<section><h2 style={{color:'#ffd166'}}>AI Café Restaurant + Digital Twin</h2><p style={muted}>Free Market Coffee, Earth Kitchen and Creator Tables now have inventory/shift persistence so café operations can become both a business simulator and workforce trainer.</p>{cafe?<><div style={panel}><b>{cafe.name}</b><div style={{fontSize:10,color:'#ffd166'}}>{cafe.city} • {cafe.format}</div><button style={{...btn,marginTop:8}} disabled={busy||!!shift} onClick={()=>act(async()=>{const s=await startCafeShift(cafe.id,'operator');setShift(s);setMessage('AI Café operations shift started.')})}>Start Café Shift</button>{shift&&shift.status==='active'&&<button style={{...btn,margin:'8px 0 0 8px'}} disabled={busy} onClick={()=>act(async()=>{const s=await completeCafeShift(shift.id,12,96,94);setShift(s);setMessage('Shift complete: 12 orders, waste 96, customer score 94.')})}>Complete Shift</button>}</div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:8,marginTop:10}}>{inventory.map(i=><article style={panel} key={i.id}><b>{i.name}</b><div style={{fontSize:10,color:'#ffd166'}}>{i.category}</div><p style={muted}>Stock {i.quantity} • reorder {i.reorder_level}<br/>unit ${i.unit_cost} • sell ${i.sell_price}</p></article>)}</div></>:<div style={panel}>AI Café digital twin appears after migration.</div>}</section>}

      {tab==='generations'&&<section><h2 style={{color:'#ff9ee8'}}>Generations World</h2><p style={muted}>A protected progression layer designed to grow from child/teen education into adult work, business, mentorship, inheritance and legacy. Age/guardian enforcement remains a server/policy responsibility.</p>{genProfile&&<div style={{...panel,marginBottom:10}}><b>Age lane: {genProfile.age_lane}</b><div style={{fontSize:10,color:'#ff9ee8'}}>guardian required: {String(genProfile.guardian_required)}</div></div>}<div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:12}}>{['reading','math','science','coding-ai','business','logistics','music','faith-history','financial-literacy','legacy'].map(p=><button style={btn} disabled={busy||!configured} key={p} onClick={()=>act(async()=>{const progress=await trainGenerationsPathway(p);setGenProgress(xs=>[...xs.filter(x=>x.pathway!==p),progress].sort((a,b)=>a.pathway.localeCompare(b.pathway)));setMessage(`${p}: +100 XP.`)})}>Train {p}</button>)}</div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:8}}>{genProgress.map(p=><article style={panel} key={p.id}><b>{p.pathway}</b><div style={{fontSize:10,color:'#ff9ee8'}}>level {p.level} • {p.xp} XP</div></article>)}</div></section>}
    </div>
  </div>
}
