import { useEffect, useMemo, useState } from 'react'
import { useGameStore, type Screen } from '../game/state/useGameStore'
import { isSupabaseConfigured } from '../services/supabaseClient'
import {
  advanceProject,
  completeWorkforceRun,
  createProject,
  createPublication,
  listEntitlements,
  listProjects,
  listPublications,
  listWorlds,
  listWorkforceRuns,
  startWorkforceRun,
  type CreatorProject,
  type PublicationRecord,
  type WorldRecord,
  type WorkforceRun,
} from '../services/livingWorlds'
import { acquireStoreAsset, getStoreCatalog, isBackendConfigured, type AppStoreAsset } from '../services/omniverseApi'

interface Props { onClose: () => void }
type Tab = 'worlds' | 'cafe' | 'workforce' | 'press' | 'store'
const currentScreens: Screen[] = ['city','sports','marketplace','music','faith','blockchain']

function worldScreen(world: WorldRecord): Screen | null {
  const screen = world.metadata?.screen
  return typeof screen === 'string' && currentScreens.includes(screen as Screen) ? screen as Screen : null
}

const tabLabels: Record<Tab, string> = {
  worlds: '🌐 Worlds', cafe: '☕ AI Café', workforce: '💼 Workforce', press: '📚 Kingdoms Press', store: '🛍️ App Store'
}

interface ScenarioQuestion { prompt: string; options: string[]; correct: number; reason: string }
interface Scenario { key: string; title: string; questions: ScenarioQuestion[] }

const SCENARIOS: Scenario[] = [
  { key:'ai-call-center-v1', title:'AI Call Center', questions:[
    { prompt:'A customer says a delivery is late. What should you do first?', options:['Promise a refund immediately','Verify the order and shipment status','End the call','Blame the carrier'], correct:1, reason:'Verify facts before promising an outcome.' },
    { prompt:'You find a carrier delay. Best response?', options:['Give the customer the updated ETA and available options','Hide the delay','Transfer without notes','Tell them to call later'], correct:0, reason:'Give an accurate update and a clear resolution path.' },
    { prompt:'Before closing the case, what matters?', options:['Delete the notes','Document the resolution and next step','Ask for a tip','Open a second ticket'], correct:1, reason:'Good CRM documentation protects the customer and the team.' },
  ]},
  { key:'logistics-chicago-atlanta-v1', title:'Chicago → Atlanta Logistics', questions:[
    { prompt:'Before dispatching a load, what should be confirmed?', options:['Pickup/delivery requirements and capacity','Only the driver name','Social media posts','Nothing'], correct:0, reason:'Requirements and capacity are foundational to a valid dispatch.' },
    { prompt:'The truck is delayed by severe weather. Best action?', options:['Ignore it','Update ETA, customer and receiving appointment','Mark delivered','Cancel without notice'], correct:1, reason:'Exception management requires communication and replanning.' },
    { prompt:'After delivery, what closes the operational loop?', options:['Proof of delivery and record update','Delete shipment','Start another load without records','Change the price'], correct:0, reason:'Proof of delivery and accurate records complete the shipment.' },
  ]},
  { key:'business-operations-v1', title:'Business Operations', questions:[
    { prompt:'Sales are growing but cash is falling. What should you inspect?', options:['Cash flow, receivables, inventory and expenses','Logo color only','Follower count only','Nothing'], correct:0, reason:'Profit and cash are different; operating cash drivers must be reviewed.' },
    { prompt:'A product repeatedly runs out. Best next step?', options:['Improve demand forecasting and reorder points','Stop tracking stock','Raise every price blindly','Ignore customers'], correct:0, reason:'Forecasting and replenishment controls reduce preventable stockouts.' },
    { prompt:'What should an AI recommend before a consequential business action?', options:['Automatic execution without review','A clear recommendation with human approval','Hidden changes','No audit record'], correct:1, reason:'High-impact actions remain human-approved and auditable.' },
  ]},
]

export default function OmniverseCommandCenter({ onClose }: Props) {
  const setScreen = useGameStore(s => s.setScreen)
  const [tab, setTab] = useState<Tab>('worlds')
  const [worlds, setWorlds] = useState<WorldRecord[]>([])
  const [projects, setProjects] = useState<CreatorProject[]>([])
  const [runs, setRuns] = useState<WorkforceRun[]>([])
  const [publications, setPublications] = useState<PublicationRecord[]>([])
  const [entitlements, setEntitlements] = useState<any[]>([])
  const [catalog, setCatalog] = useState<AppStoreAsset[]>([])
  const [activeRun, setActiveRun] = useState<WorkforceRun | null>(null)
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const configured = useMemo(() => isSupabaseConfigured(), [])
  const backendConfigured = useMemo(() => isBackendConfigured(), [])

  async function refresh() {
    if (!configured) return
    const [w,p,r,pubs,e] = await Promise.all([listWorlds(), listProjects(), listWorkforceRuns(), listPublications(), listEntitlements()])
    setWorlds(w); setProjects(p); setRuns(r); setPublications(pubs); setEntitlements(e)
  }

  useEffect(() => {
    refresh().catch(error => setMessage(error instanceof Error ? error.message : String(error)))
    if (backendConfigured) getStoreCatalog().then(setCatalog).catch(error => setMessage(error instanceof Error ? error.message : String(error)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, backendConfigured])

  async function makeProject(type: string) {
    const title = window.prompt(`Name your ${type} project:`)
    if (!title) return
    setBusy(true)
    try { const created = await createProject(title, type); setProjects(p => [created, ...p]); setMessage(`Created “${created.title}”.`) }
    catch (error) { setMessage(error instanceof Error ? error.message : String(error)) }
    finally { setBusy(false) }
  }

  async function moveProject(project: CreatorProject) {
    setBusy(true)
    try { const updated = await advanceProject(project); setProjects(p => p.map(x => x.id===updated.id?updated:x)); setMessage(`${updated.title} advanced to ${updated.current_stage}.`) }
    catch (error) { setMessage(error instanceof Error ? error.message : String(error)) }
    finally { setBusy(false) }
  }

  async function startSimulation(scenario: Scenario) {
    setBusy(true)
    try {
      const run = await startWorkforceRun(scenario.key)
      setRuns(r => [run, ...r]); setActiveRun(run); setActiveScenario(scenario); setQuestionIndex(0); setCorrectAnswers(0)
      setMessage(`${scenario.title} started. Complete the three decisions to receive a score.`)
    } catch (error) { setMessage(error instanceof Error ? error.message : String(error)) }
    finally { setBusy(false) }
  }

  async function answerWorkforce(choice: number) {
    if (!activeScenario || !activeRun) return
    const q = activeScenario.questions[questionIndex]
    const nextCorrect = correctAnswers + (choice === q.correct ? 1 : 0)
    if (questionIndex < activeScenario.questions.length - 1) {
      setCorrectAnswers(nextCorrect); setQuestionIndex(i => i + 1); setMessage(q.reason); return
    }
    const score = Math.round((nextCorrect / activeScenario.questions.length) * 100)
    setBusy(true)
    try {
      const done = await completeWorkforceRun(activeRun, score, { correct: nextCorrect, total: activeScenario.questions.length, finalLesson: q.reason })
      setRuns(r => r.map(x => x.id===done.id?done:x)); setActiveRun(null); setActiveScenario(null); setMessage(`Simulation complete: ${score}/100. ${q.reason}`)
    } catch (error) { setMessage(error instanceof Error ? error.message : String(error)) }
    finally { setBusy(false) }
  }

  async function makePublication() {
    const book = projects.find(p => p.project_type === 'book')
    const title = window.prompt('Publication title:', book?.title || '')
    if (!title) return
    setBusy(true)
    try { const publication = await createPublication(title, book?.id, 'ebook'); setPublications(p => [publication, ...p]); setMessage(`Created draft edition “${title}”.`) }
    catch (error) { setMessage(error instanceof Error ? error.message : String(error)) }
    finally { setBusy(false) }
  }

  async function acquire(asset: AppStoreAsset) {
    setBusy(true)
    try { await acquireStoreAsset(asset.asset_key); await refresh(); setMessage(`${asset.name} added to your Living Worlds Passport.`) }
    catch (error) { setMessage(error instanceof Error ? error.message : String(error)) }
    finally { setBusy(false) }
  }

  const card: React.CSSProperties = { background:'#09091d', border:'1px solid #242456', borderRadius:12, padding:12 }
  const button: React.CSSProperties = { background:'#121235', border:'1px solid #00ffcc55', color:'#00ffcc', borderRadius:8, padding:'8px 12px', cursor:'pointer', fontFamily:'monospace' }

  return <div style={{position:'fixed',inset:0,zIndex:10020,background:'rgba(2,2,18,.98)',color:'#ddd',fontFamily:'monospace',overflowY:'auto'}}>
    <div style={{maxWidth:1100,margin:'0 auto',padding:16}}>
      <div style={{display:'flex',alignItems:'center',gap:12,position:'sticky',top:0,background:'#020212',padding:'10px 0',zIndex:2}}>
        <button onClick={onClose} style={button}>← Back</button>
        <div><div style={{fontSize:18,fontWeight:900,color:'#ffd700'}}>AMM OMNIVERSE COMMAND CENTER</div><div style={{fontSize:10,color:'#777'}}>Stubbs AI • Middleverse AI • Holo C • Where Heaven Meets Earth</div></div>
      </div>

      {!configured && <div style={{...card,borderColor:'#ffaa00',margin:'10px 0'}}>Cloud features need VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Existing demo gameplay remains available.</div>}
      {message && <div style={{...card,borderColor:'#00ffcc55',margin:'10px 0'}}>{message}</div>}
      <div style={{display:'flex',gap:6,flexWrap:'wrap',margin:'12px 0'}}>{(Object.keys(tabLabels) as Tab[]).map(t => <button key={t} onClick={()=>setTab(t)} style={{...button,background:tab===t?'#003c38':'#121235'}}>{tabLabels[t]}</button>)}</div>

      {tab==='worlds' && <section><h2 style={{color:'#00ffcc'}}>Living Worlds Registry</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:10}}>{worlds.map(world=><article key={world.id} style={card}><b>{world.name}</b><div style={{fontSize:10,color:'#00ffcc'}}>{world.kind} • {world.status}</div><p style={{fontSize:12,color:'#aaa'}}>{world.description}</p>{worldScreen(world)?<button style={button} onClick={()=>{setScreen(worldScreen(world)!);onClose()}}>Enter Existing Realm</button>:<span style={{fontSize:10,color:'#777'}}>Registered; dedicated runtime still to build</span>}</article>)}{!worlds.length&&<div style={card}>Apply the convergence migration to staging Supabase to load the registry.</div>}</div></section>}

      {tab==='cafe' && <section><h2 style={{color:'#ffd166'}}>AI Café • Creator Tables</h2><p style={{color:'#888'}}>Idea → learn → design → build → test → publish.</p><div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>{['business','book','game','world','music','app','course','research'].map(type=><button key={type} disabled={busy||!configured} style={button} onClick={()=>makeProject(type)}>+ {type}</button>)}</div><div style={{display:'grid',gap:8}}>{projects.map(p=><article key={p.id} style={card}><b>{p.title}</b><div style={{fontSize:10,color:'#00ffcc'}}>{p.project_type} • {p.current_stage}</div>{p.current_stage!=='published'&&<button disabled={busy} style={{...button,marginTop:8}} onClick={()=>moveProject(p)}>Advance project →</button>}</article>)}</div></section>}

      {tab==='workforce' && <section><h2 style={{color:'#78d5ff'}}>Workforce World</h2>{!activeScenario&&<div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>{SCENARIOS.map(s=><button key={s.key} disabled={busy||!configured} style={button} onClick={()=>startSimulation(s)}>Start {s.title}</button>)}</div>}{activeScenario&&activeRun&&<article style={{...card,borderColor:'#78d5ff'}}><div style={{fontSize:10,color:'#78d5ff'}}>QUESTION {questionIndex+1}/{activeScenario.questions.length}</div><h3>{activeScenario.questions[questionIndex].prompt}</h3><div style={{display:'grid',gap:8}}>{activeScenario.questions[questionIndex].options.map((option,i)=><button key={option} disabled={busy} style={button} onClick={()=>answerWorkforce(i)}>{option}</button>)}</div></article>}<div style={{display:'grid',gap:8,marginTop:12}}>{runs.slice(0,8).map(r=><article key={r.id} style={card}><b>{r.simulation_key}</b><div style={{fontSize:10,color:'#78d5ff'}}>{r.status}{r.score!=null?` • score ${r.score}`:''}</div></article>)}</div></section>}

      {tab==='press' && <section><h2 style={{color:'#ff9ee8'}}>Kingdoms Press</h2><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button disabled={busy||!configured} style={button} onClick={()=>makeProject('book')}>Start Book Project</button><button disabled={busy||!configured} style={button} onClick={makePublication}>Create Draft Edition</button></div><div style={{display:'grid',gap:8,marginTop:12}}>{publications.map(p=><article key={p.id} style={card}><b>{p.title}</b><div style={{fontSize:10,color:'#ff9ee8'}}>{p.format} • {p.status} • source check: {p.source_verification_status}</div></article>)}{!publications.length&&<div style={card}>No publication editions yet.</div>}</div></section>}

      {tab==='store' && <section><h2 style={{color:'#8cff98'}}>All American App Store</h2>{!backendConfigured&&<div style={card}>Set VITE_API_URL to load/acquire the server-controlled catalog.</div>}<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:10}}>{catalog.map(asset=>{const owned=entitlements.some((e:any)=>e.asset_key===asset.asset_key);return <article key={asset.id} style={card}><b>{asset.name}</b><div style={{fontSize:10,color:'#8cff98'}}>{asset.asset_type} • {asset.age_rating}</div><p style={{fontSize:12,color:'#aaa'}}>{asset.description}</p>{owned?<span style={{color:'#8cff98'}}>✓ In Passport</span>:<button disabled={busy||!configured} style={button} onClick={()=>acquire(asset)}>{asset.price_cents===0?'Add Free':'Purchase'}</button>}</article>})}</div></section>}
    </div>
  </div>
}
