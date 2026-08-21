import { useMemo, useState } from 'react'

const SUMMER = [
  'Track & field','Swimming','Gymnastics','Basketball','3x3 basketball','Boxing','Football / soccer','Cycling','Rowing','Wrestling','Judo','Taekwondo','Fencing','Tennis','Volleyball','Beach volleyball','Handball','Rugby sevens','Weightlifting','Archery','Shooting','Table tennis','Badminton','Skateboarding','Sport climbing','Surfing','Triathlon','Canoe sprint','Canoe slalom','Diving','Water polo','Field hockey','Golf','Modern pentathlon'
]
const WINTER = [
  'Alpine skiing','Cross-country skiing','Ski jumping','Nordic combined','Freestyle skiing','Snowboard','Figure skating','Speed skating','Short-track skating','Ice hockey','Curling','Bobsleigh','Skeleton','Luge','Biathlon'
]
const SYSTEMS = [
  'Athlete + avatar creation','Country / region team selection','Qualifying rounds','Heats, brackets and finals','Individual + team events','Medal table','Personal + world records','Opening + closing ceremonies','Torch-style world relay mission','Coach / training mode','Career progression','Clubs + national teams','AI opponents','Local + online multiplayer hooks','Spectator mode','Broadcast camera package','Replay + highlight clips','CREATE A MOVIE handoff','Live commentary hooks','Accessibility presets','One-handed controls','Captions + visual cues','Reduced motion','Difficulty assists','Anti-cheat / authoritative score hooks','Seasonal rankings','Global leaderboards','Creator challenges','School / youth pathway','Diaspora team/community support'
]
const REGIONS = ['United States','Canada','Mexico','United Kingdom','Caribbean','West Africa','East Africa','Southern Africa','North Africa','Latin America','Europe','Middle East','South Asia','East Asia','Southeast Asia','Oceania','Global Diaspora']

type Season='summer'|'winter'

export default function GlobalGamesHub({onClose}:{onClose:()=>void}){
  const [season,setSeason]=useState<Season>('summer')
  const [sport,setSport]=useState(SUMMER[0])
  const [region,setRegion]=useState(REGIONS[0])
  const [attempts,setAttempts]=useState<{sport:string;score:number}[]>([])
  const sports=season==='summer'?SUMMER:WINTER
  const best=useMemo(()=>Math.max(0,...attempts.filter(a=>a.sport===sport).map(a=>a.score)),[attempts,sport])
  const switchSeason=(s:Season)=>{setSeason(s);setSport((s==='summer'?SUMMER:WINTER)[0])}
  const compete=()=>setAttempts(a=>[{sport,score:Math.floor(500+Math.random()*9500)},...a].slice(0,20))

  return <div role="dialog" aria-modal="true" aria-label="TRYAMM Summer and Winter Global Games" style={{position:'fixed',inset:0,zIndex:12250,overflowY:'auto',background:'radial-gradient(circle at top,#173557,#050812 56%,#020205)',color:'#fff',padding:16,fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:1180,margin:'0 auto'}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'center',flexWrap:'wrap'}}><div><div style={{fontSize:10,color:'#4FE3FF',fontWeight:950,letterSpacing:3}}>TRYAMM • LIVING SPORTS • GLOBAL GAMES</div><h1 style={{fontSize:'clamp(36px,7vw,72px)',margin:'6px 0'}}>Summer + Winter Games</h1><p style={{color:'#aebed0',maxWidth:880,lineHeight:1.6}}>A global multi-sport competition layer for TRYAMM. It carries the Olympic-style event structure you designed while keeping TRYAMM branding independent unless official Olympic marks, footage, athlete likenesses or data are separately licensed.</p></div><button aria-label="Close Global Games" onClick={onClose} style={close}>×</button></header>

      <section style={panel}><div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}><button onClick={()=>switchSeason('summer')} style={tab(season==='summer')}>☀️ SUMMER GAMES</button><button onClick={()=>switchSeason('winter')} style={tab(season==='winter')}>❄️ WINTER GAMES</button><select aria-label="Global Games region" value={region} onChange={e=>setRegion(e.target.value)} style={select}>{REGIONS.map(x=><option key={x}>{x}</option>)}</select></div></section>

      <section style={panel}><h2>{season==='summer'?'Summer':'Winter'} sport program</h2><div style={grid}>{sports.map(x=><button key={x} onClick={()=>setSport(x)} style={sportButton(x===sport)}>{x}</button>)}</div></section>

      <section style={panel}><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14}}><article style={card}><div style={{fontSize:11,color:'#4FE3FF',fontWeight:900}}>ACTIVE EVENT</div><h2>{sport}</h2><p style={muted}>Team / region: {region}</p><p style={muted}>Prototype competition loop proves event selection, scoring, personal best state and highlight handoff while deeper sport-specific physics are built per event.</p><button onClick={compete} style={action}>COMPETE / RECORD ATTEMPT</button><p><b>Personal best:</b> {best||'—'}</p></article><article style={card}><div style={{fontSize:11,color:'#E8B944',fontWeight:900}}>MEDAL + CAREER LOOP</div><p style={muted}>TRAIN → QUALIFY → HEAT / BRACKET → FINAL → MEDAL → RECORD → HIGHLIGHT → WORLD RANK → NEXT SEASON.</p><div style={chips}>{['GOLD','SILVER','BRONZE','PB','WORLD RANK','TEAM RANK'].map(x=><span key={x} style={chip}>{x}</span>)}</div></article></div></section>

      <section style={panel}><h2>Full Games feature contract</h2><div style={grid}>{SYSTEMS.map(x=><div key={x} style={feature}>✓ {x}</div>)}</div></section>
      <section style={panel}><h2>Global participation</h2><div style={chips}>{REGIONS.map(x=><span key={x} style={chip}>{x}</span>)}</div><p style={muted}>Competition identity can represent a country, local club, school, creator team or diaspora community. Country eligibility and official federation status must not be implied without real governing-body data.</p></section>
    </div>
  </div>
}
const panel={border:'1px solid #28435d',borderRadius:20,padding:16,margin:'14px 0',background:'#07111c'} as const
const card={border:'1px solid #29415a',borderRadius:16,padding:16,background:'#0a1521'} as const
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:8} as const
const chips={display:'flex',gap:7,flexWrap:'wrap'} as const
const chip={border:'1px solid #36516a',borderRadius:999,padding:'6px 9px',fontSize:10,background:'#0b1824'} as const
const feature={border:'1px solid #20364a',borderRadius:11,padding:10,background:'#09131e',fontSize:11} as const
const muted={color:'#aab8c8',lineHeight:1.6} as const
const action={minHeight:46,borderRadius:12,border:'1px solid #4FE3FF',background:'#0e2a39',color:'#fff',padding:'0 16px',fontWeight:950,cursor:'pointer'} as const
const close={width:46,height:46,borderRadius:'50%',border:'1px solid #46566a',background:'#0d1420',color:'#fff',fontSize:24,cursor:'pointer'} as const
const tab=(active:boolean)=>({minHeight:44,borderRadius:999,border:active?'2px solid #E8B944':'1px solid #40516a',background:active?'#30240e':'#0b1420',color:'#fff',padding:'0 16px',fontWeight:950,cursor:'pointer'} as const)
const sportButton=(active:boolean)=>({minHeight:48,borderRadius:12,border:active?'2px solid #4FE3FF':'1px solid #263b50',background:active?'#0d2a38':'#09131d',color:'#fff',padding:10,fontWeight:850,cursor:'pointer'} as const)
const select={minHeight:44,borderRadius:12,border:'1px solid #40516a',background:'#08121c',color:'#fff',padding:'0 10px'} as const
