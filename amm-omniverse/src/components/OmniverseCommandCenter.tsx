import { useEffect, useMemo, useState } from 'react'
import { useGameStore, type Screen } from '../game/state/useGameStore'
import { isSupabaseConfigured } from '../services/supabaseClient'
import {
  createProject,
  listEntitlements,
  listProjects,
  listPublications,
  listWorlds,
  listWorkforceRuns,
  startWorkforceRun,
  type CreatorProject,
  type WorldRecord,
  type WorkforceRun,
} from '../services/livingWorlds'

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

export default function OmniverseCommandCenter({ onClose }: Props) {
  const setScreen = useGameStore(s => s.setScreen)
  const [tab, setTab] = useState<Tab>('worlds')
  const [worlds, setWorlds] = useState<WorldRecord[]>([])
  const [projects, setProjects] = useState<CreatorProject[]>([])
  const [runs, setRuns] = useState<WorkforceRun[]>([])
  const [publications, setPublications] = useState<any[]>([])
  const [entitlements, setEntitlements] = useState<any[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const configured = useMemo(() => isSupabaseConfigured(), [])

  useEffect(() => {
    if (!configured) return
    Promise.all([listWorlds(), listProjects(), listWorkforceRuns(), listPublications(), listEntitlements()])
      .then(([w,p,r,pubs,e]) => { setWorlds(w); setProjects(p); setRuns(r); setPublications(pubs); setEntitlements(e) })
      .catch(error => setMessage(error instanceof Error ? error.message : String(error)))
  }, [configured])

  async function makeProject(type: string) {
    const title = window.prompt(`Name your ${type} project:`)
    if (!title) return
    setBusy(true)
    try {
      const created = await createProject(title, type)
      setProjects(p => [created, ...p])
      setMessage(`Created “${created.title}”. Your AI Café project is now persistent.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error))
    } finally { setBusy(false) }
  }

  async function startSimulation(key: string) {
    setBusy(true)
    try {
      const run = await startWorkforceRun(key)
      setRuns(r => [run, ...r])
      setMessage(`Started ${key}. The simulation state is now saved to your account.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error))
    } finally { setBusy(false) }
  }

  const card: React.CSSProperties = { background:'#09091d', border:'1px solid #242456', borderRadius:12, padding:12 }
  const button: React.CSSProperties = { background:'#121235', border:'1px solid #00ffcc55', color:'#00ffcc', borderRadius:8, padding:'8px 12px', cursor:'pointer', fontFamily:'monospace' }

  return <div style={{position:'fixed',inset:0,zIndex:10020,background:'rgba(2,2,18,.98)',color:'#ddd',fontFamily:'monospace',overflowY:'auto'}}>
    <div style={{maxWidth:1100,margin:'0 auto',padding:16}}>
      <div style={{display:'flex',alignItems:'center',gap:12,position:'sticky',top:0,background:'#020212',padding:'10px 0',zIndex:2}}>
        <button onClick={onClose} style={button}>← Back</button>
        <div><div style={{fontSize:18,fontWeight:900,color:'#ffd700'}}>AMM OMNIVERSE COMMAND CENTER</div><div style={{fontSize:10,color:'#777'}}>Stubbs AI • Middleverse AI • Holo C • Where Heaven Meets Earth</div></div>
      </div>

      {!configured && <div style={{...card,borderColor:'#ffaa00',margin:'10px 0'}}>Supabase is not configured in this browser build. The current game still runs, but Passport, cloud projects, workforce persistence, publishing and entitlements need <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.</div>}
      {message && <div style={{...card,borderColor:'#00ffcc55',margin:'10px 0'}}>{message}</div>}

      <div style={{display:'flex',gap:6,flexWrap:'wrap',margin:'12px 0'}}>
        {(Object.keys(tabLabels) as Tab[]).map(t => <button key={t} onClick={()=>setTab(t)} style={{...button,background:tab===t?'#003c38':'#121235'}}>{tabLabels[t]}</button>)}
      </div>

      {tab === 'worlds' && <section>
        <h2 style={{color:'#00ffcc'}}>Living Worlds Registry</h2>
        <p style={{color:'#888'}}>Existing realms stay intact. New worlds enter through the same registry and can receive dedicated runtimes later.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:10}}>
          {worlds.map(world => <article key={world.id} style={card}>
            <div style={{fontWeight:900,color:'#fff'}}>{world.name}</div>
            <div style={{fontSize:10,color:'#00ffcc',textTransform:'uppercase'}}>{world.kind} • {world.status}</div>
            <p style={{fontSize:12,color:'#aaa'}}>{world.description}</p>
            {worldScreen(world) ? <button style={button} onClick={()=>{setScreen(worldScreen(world)!); onClose()}}>Enter Existing Realm</button> : <span style={{fontSize:10,color:'#777'}}>Runtime scheduled after core convergence</span>}
          </article>)}
          {!worlds.length && <div style={card}>Worlds appear here after the convergence migration is applied.</div>}
        </div>
      </section>}

      {tab === 'cafe' && <section>
        <h2 style={{color:'#ffd166'}}>AI Café • Creator Tables</h2>
        <p style={{color:'#888'}}>Start with an idea; save it to your account; continue from café, phone or Living Worlds.</p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
          {['business','book','game','world','music','app','course','research'].map(type => <button key={type} disabled={busy||!configured} style={button} onClick={()=>makeProject(type)}>+ {type}</button>)}
        </div>
        <div style={{display:'grid',gap:8}}>{projects.map(p => <article key={p.id} style={card}><b>{p.title}</b><div style={{fontSize:10,color:'#00ffcc'}}>{p.project_type} • {p.status} • {p.current_stage}</div></article>)}</div>
      </section>}

      {tab === 'workforce' && <section>
        <h2 style={{color:'#78d5ff'}}>Workforce World</h2>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
          <button disabled={busy||!configured} style={button} onClick={()=>startSimulation('ai-call-center-v1')}>Start AI Call Center</button>
          <button disabled={busy||!configured} style={button} onClick={()=>startSimulation('logistics-chicago-atlanta-v1')}>Start Chicago → Atlanta Logistics</button>
          <button disabled={busy||!configured} style={button} onClick={()=>startSimulation('business-operations-v1')}>Start Business Operations</button>
        </div>
        <div style={{display:'grid',gap:8}}>{runs.map(r => <article key={r.id} style={card}><b>{r.simulation_key}</b><div style={{fontSize:10,color:'#78d5ff'}}>{r.status}{r.score != null ? ` • score ${r.score}` : ''}</div></article>)}</div>
      </section>}

      {tab === 'press' && <section>
        <h2 style={{color:'#ff9ee8'}}>Kingdoms Press</h2>
        <p style={{color:'#888'}}>Publications now have a dedicated persistent model. Create the manuscript/project in AI Café; editorial, source verification and publication workflows attach here.</p>
        <button disabled={busy||!configured} style={button} onClick={()=>makeProject('book')}>Start a Book Project</button>
        <div style={{display:'grid',gap:8,marginTop:12}}>{publications.map((p:any)=><article key={p.id} style={card}><b>{p.title}</b><div style={{fontSize:10,color:'#ff9ee8'}}>{p.format} • {p.status}</div></article>)}{!publications.length&&<div style={card}>No publication editions yet. Book projects can be promoted into editions by the backend workflow.</div>}</div>
      </section>}

      {tab === 'store' && <section>
        <h2 style={{color:'#8cff98'}}>All American App Store</h2>
        <p style={{color:'#888'}}>Account-level entitlements are separate from world inventory, so approved apps, books, AI agents, courses and worlds can follow the Passport across devices.</p>
        <div style={{display:'grid',gap:8}}>{entitlements.map((e:any)=><article key={e.id} style={card}><b>{e.asset_key}</b><div style={{fontSize:10,color:'#8cff98'}}>{e.asset_type} • {e.source}</div></article>)}{!entitlements.length&&<div style={card}>No entitlements yet. Purchases/grants appear here after the migration and backend grant endpoint are live.</div>}</div>
      </section>}
    </div>
  </div>
}
