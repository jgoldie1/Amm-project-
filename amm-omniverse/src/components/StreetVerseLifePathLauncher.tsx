import { useMemo, useState } from 'react'
import { CHARACTER_CLAIM_RULES, CHARACTER_CREATION_FLOW, CHARACTER_PORTABLE_STATE } from '../game/avatar/StreetVerseCharacterClaim'
import { EDUCATION_INSTITUTIONS, EDUCATION_PROGRESS_PATH, EDUCATION_SAFETY_RULES } from '../game/education/StreetVerseEducation'
import { CALIFORNIA_REGIONAL_CLUSTERS, INTERSTATE_ECONOMY_LOOP, INTERSTATE_HUBS } from '../game/economy/InterstateEconomy'
import { CHICAGO_ORIGIN_CONTEXT, CHICAGO_ORIGIN_MISSIONS, CHICAGO_ORIGIN_TITLE, STUBBS_AI_ORIGIN_LINES } from '../game/story/StreetVerseChicagoOrigin'
import { ASSET_APPROVAL_PIPELINE, ASSET_FORGE_PACKS, STREETVERSE_RENDER_PROFILE } from '../game/assets/StreetVerseAssetForge'

type Tab = 'prologue' | 'character' | 'education' | 'travel' | 'forge'

type DraftCharacter = {
  displayName: string
  homeRegion: string
  archetype: string
  outfit: string
  oneHanded: boolean
  reducedMotion: boolean
  captions: boolean
}

const STORAGE_KEY = 'tryamm.streetverse.character.v1'
const starter: DraftCharacter = {
  displayName: '',
  homeRegion: 'Chicago',
  archetype: 'entrepreneur',
  outfit: 'StreetVerse Starter',
  oneHanded: false,
  reducedMotion: false,
  captions: true,
}

export default function StreetVerseLifePathLauncher() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('prologue')
  const [character, setCharacter] = useState<DraftCharacter>(() => {
    try { return { ...starter, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } }
    catch { return starter }
  })
  const [claimed, setClaimed] = useState(() => Boolean(localStorage.getItem(`${STORAGE_KEY}.claimed`)))
  const [schoolId, setSchoolId] = useState(EDUCATION_INSTITUTIONS[0].id)
  const school = useMemo(() => EDUCATION_INSTITUTIONS.find(item => item.id === schoolId) ?? EDUCATION_INSTITUTIONS[0], [schoolId])

  const claimCharacter = () => {
    if (!character.displayName.trim()) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character))
    localStorage.setItem(`${STORAGE_KEY}.claimed`, '1')
    setClaimed(true)
  }

  return <>
    <button type="button" aria-label="Open StreetVerse life path" onClick={() => setOpen(true)} style={{position:'fixed',left:12,bottom:180,zIndex:8998,border:'1px solid #e8b94488',borderRadius:999,background:'linear-gradient(135deg,#21170b,#102333)',color:'#fff',padding:'10px 14px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer',boxShadow:'0 8px 28px #0008'}}>
      🦁 MEET THE STUBBS
    </button>

    {open && <div role="dialog" aria-modal="true" aria-label="Meet the Stubbs StreetVerse Life Path" style={{position:'fixed',inset:0,zIndex:10110,overflowY:'auto',background:'radial-gradient(circle at top,#172536,#05070d 55%,#020204)',color:'#fff',padding:16}}>
      <div style={{maxWidth:1180,margin:'0 auto'}}>
        <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <div>
            <div style={{color:'#4fe3ff',fontSize:10,fontWeight:900,letterSpacing:3}}>STREETVERSE • CHICAGO EDITION • ORIGIN STORY</div>
            <h1 style={{fontSize:'clamp(2.4rem,8vw,5rem)',margin:'8px 0'}}>{CHICAGO_ORIGIN_TITLE}</h1>
            <p style={{color:'#b2c0cf',maxWidth:900,lineHeight:1.6}}>Stubbs AI opens the game through memory instead of a generic mission marker. Your character begins in a privacy-safe fictionalized Near West Side chapter inspired by Madden Park, Circle Park and the ABLA/Village surroundings, then grows through school, work, music, sports, business, travel and legacy.</p>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close life path" style={{width:48,height:48,borderRadius:'50%',background:'#0d1420',border:'1px solid #46566a',color:'#fff',fontSize:24}}>×</button>
        </header>

        <nav style={{display:'flex',gap:8,flexWrap:'wrap',margin:'18px 0'}}>
          {(['prologue','character','education','travel','forge'] as Tab[]).map(item => <button key={item} onClick={() => setTab(item)} style={tabButton(tab===item)}>{item.toUpperCase()}</button>)}
        </nav>

        {tab === 'prologue' && <section style={panel}>
          <h2>Opening story: the city remembers</h2>
          <p style={muted}><strong>Stubbs AI:</strong> “{STUBBS_AI_ORIGIN_LINES[0]}”</p>
          <p style={mutedSmall}>{CHICAGO_ORIGIN_CONTEXT.framing}</p>
          <div style={grid}>{CHICAGO_ORIGIN_MISSIONS.map((mission,index)=><article style={card} key={mission.id}>
            <div style={{fontSize:10,color:'#4fe3ff'}}>CHAPTER {index+1} • {mission.district}</div>
            <h3>{mission.title}</h3>
            <p style={mutedSmall}>{mission.objective}</p>
            <strong>WORLD MEMORY</strong><p style={mutedSmall}>{mission.worldMemory}</p>
            <strong>UNLOCKS</strong><div style={chips}>{mission.unlocks.map(x=><span style={chip} key={x}>{x}</span>)}</div>
            <strong>IMMERSION</strong><p style={mutedSmall}>{mission.presentation.join(' • ')}</p>
          </article>)}</div>
          <p style={muted}><strong>Privacy rule:</strong> {CHICAGO_ORIGIN_CONTEXT.privateHomeAnchorPolicy}</p>
          <div style={chips}>{STUBBS_AI_ORIGIN_LINES.map(line=><span style={chip} key={line}>{line}</span>)}</div>
        </section>}

        {tab === 'character' && <section style={panel}>
          <h2>Create + claim your StreetVerse character</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12}}>
            <label style={field}>Display name<input value={character.displayName} onChange={e=>setCharacter(c=>({...c,displayName:e.target.value}))} placeholder="Your StreetVerse name" style={input}/></label>
            <label style={field}>Home region<select value={character.homeRegion} onChange={e=>setCharacter(c=>({...c,homeRegion:e.target.value}))} style={input}>{['Chicago','Mount Vernon','Herrin','Peoria','Greenville','Detroit','St. Louis','Tennessee','San Diego','Hollywood','Silver Lake','Northern California','Southern California','Atlanta','Florida','New York City','Nigeria','South Africa','Haiti'].map(x=><option key={x}>{x}</option>)}</select></label>
            <label style={field}>Starter path<select value={character.archetype} onChange={e=>setCharacter(c=>({...c,archetype:e.target.value}))} style={input}>{['student','worker','entrepreneur','creator','athlete','public-service','driver-logistics','tech-builder','custom'].map(x=><option key={x}>{x}</option>)}</select></label>
            <label style={field}>Starter outfit<input value={character.outfit} onChange={e=>setCharacter(c=>({...c,outfit:e.target.value}))} style={input}/></label>
          </div>
          <div style={{display:'flex',gap:14,flexWrap:'wrap',margin:'14px 0'}}>
            <label><input type="checkbox" checked={character.oneHanded} onChange={e=>setCharacter(c=>({...c,oneHanded:e.target.checked}))}/> One-handed mode</label>
            <label><input type="checkbox" checked={character.reducedMotion} onChange={e=>setCharacter(c=>({...c,reducedMotion:e.target.checked}))}/> Reduced motion</label>
            <label><input type="checkbox" checked={character.captions} onChange={e=>setCharacter(c=>({...c,captions:e.target.checked}))}/> Captions</label>
          </div>
          <button disabled={!character.displayName.trim()} onClick={claimCharacter} style={{minHeight:48,padding:'0 18px',borderRadius:12,border:'1px solid #78ffb4',background:'#0d2b20',color:'#fff',fontWeight:900}}>{claimed ? 'CHARACTER CLAIMED ✓' : 'CLAIM MY CHARACTER'}</button>
          <h3>Claim flow</h3><ol>{CHARACTER_CREATION_FLOW.map(x=><li key={x}>{x}</li>)}</ol>
          <h3>Portable state</h3><div style={chips}>{CHARACTER_PORTABLE_STATE.map(x=><span style={chip} key={x}>{x}</span>)}</div>
          <h3>Identity rules</h3><ul>{CHARACTER_CLAIM_RULES.map(x=><li key={x}>{x}</li>)}</ul>
        </section>}

        {tab === 'education' && <section style={panel}>
          <h2>Visit + attend school, high school, college and university</h2>
          <p style={muted}>Education is part of the life economy: classes build skills; skills qualify jobs; jobs build references and income; experience can lead to entrepreneurship.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8}}>{EDUCATION_INSTITUTIONS.map(item=><button key={item.id} onClick={()=>setSchoolId(item.id)} style={regionButton(item.id===school.id)}>{item.name}</button>)}</div>
          <article style={{...card,marginTop:14}}><h3>{school.name}</h3><p style={mutedSmall}>{school.region} • {school.level} • {school.publicIdentity==='real-reference'?'REFERENCE-ONLY REAL INSTITUTION':'FICTIONALIZED SAFE CAMPUS'}</p><div style={chips}>{school.programs.map(x=><span style={chip} key={x}>{x}</span>)}</div><h4>Campus jobs</h4><div style={chips}>{school.jobs.map(x=><span style={chip} key={x}>{x}</span>)}</div><h4>Missions</h4><ol>{school.missions.map(x=><li key={x}>{x}</li>)}</ol></article>
          <h3>Education → career pathway</h3><div style={chips}>{EDUCATION_PROGRESS_PATH.map(x=><span style={chip} key={x}>{x}</span>)}</div>
          <h3>School safety</h3><ul>{EDUCATION_SAFETY_RULES.map(x=><li key={x}>{x}</li>)}</ul>
        </section>}

        {tab === 'travel' && <section style={panel}>
          <h2>Interstate + global economy</h2>
          <p style={muted}>Airports, rail, buses, trucking/freight, rideshare, hotels, moving companies and touring create jobs and make every city economically connected.</p>
          <div style={grid}>{INTERSTATE_HUBS.map(hub=><article style={card} key={hub.id}><h3>{hub.name}</h3><div style={chips}>{hub.regions.map(x=><span style={chip} key={x}>{x}</span>)}</div><p style={mutedSmall}>Jobs: {hub.jobs.join(' • ')}</p><p style={mutedSmall}>Missions: {hub.missionLoops.join(' • ')}</p></article>)}</div>
          <h3>California expansion</h3><div style={grid}>{CALIFORNIA_REGIONAL_CLUSTERS.map(cluster=><article style={card} key={cluster.id}><strong>{cluster.name}</strong><p style={mutedSmall}>{cluster.identity}</p><div style={chips}>{cluster.includes.map(x=><span style={chip} key={x}>{x}</span>)}</div></article>)}</div>
          <h3>Contract loop</h3><div style={chips}>{INTERSTATE_ECONOMY_LOOP.map(x=><span style={chip} key={x}>{x}</span>)}</div>
        </section>}

        {tab === 'forge' && <section style={panel}>
          <h2>StreetVerse Asset Forge</h2>
          <p style={muted}>This is the production quality gate for making the origin, holograms and Chicago worlds photoreal and immersive. A request is not considered finished until it reaches approved status after rights, visual, performance and accessibility review.</p>
          <div style={grid}>{ASSET_FORGE_PACKS.map(asset=><article style={card} key={asset.id}><div style={{fontSize:10,color:'#e8b944'}}>{asset.kind.toUpperCase()} • {asset.status.toUpperCase()}</div><h3>{asset.name}</h3><p style={mutedSmall}>{asset.scene}</p><strong>QUALITY</strong><div style={chips}>{asset.quality.map(x=><span style={chip} key={x}>{x}</span>)}</div><strong>MATERIALS</strong><p style={mutedSmall}>{asset.materials.join(' • ')}</p><strong>LIGHTING</strong><p style={mutedSmall}>{asset.lighting.join(' • ')}</p></article>)}</div>
          <h3>Render profile</h3><div style={chips}>{Object.entries(STREETVERSE_RENDER_PROFILE).filter(([,value])=>value===true).map(([key])=><span style={chip} key={key}>{key}</span>)}</div>
          <h3>Approval pipeline</h3><ol>{ASSET_APPROVAL_PIPELINE.map(step=><li key={step}>{step}</li>)}</ol>
        </section>}
      </div>
    </div>}
  </>
}

const panel={border:'1px solid #26384d',borderRadius:20,padding:18,background:'linear-gradient(150deg,#08121d,#070811)'} as const
const card={border:'1px solid #2b3d52',borderRadius:14,padding:12,background:'#0b121d'} as const
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:10} as const
const chips={display:'flex',gap:7,flexWrap:'wrap'} as const
const chip={border:'1px solid #36516a',borderRadius:999,padding:'6px 9px',fontSize:10,background:'#0b1824'} as const
const muted={color:'#aab8c8',lineHeight:1.6} as const
const mutedSmall={color:'#8395aa',fontSize:11,lineHeight:1.5} as const
const field={display:'grid',gap:6,fontSize:11,fontWeight:900} as const
const input={minHeight:44,borderRadius:10,border:'1px solid #36516a',background:'#07101a',color:'#fff',padding:'0 10px'} as const
const tabButton=(active:boolean)=>({minHeight:42,padding:'0 14px',borderRadius:999,border:active?'2px solid #4fe3ff':'1px solid #35485e',background:active?'#123449':'#09111b',color:'#fff',fontWeight:900,cursor:'pointer'} as const)
const regionButton=(active:boolean)=>({minHeight:58,padding:9,borderRadius:12,border:active?'2px solid #e8b944':'1px solid #2c3e52',background:active?'#2b210f':'#09111b',color:'#fff',fontWeight:900,cursor:'pointer'} as const)
