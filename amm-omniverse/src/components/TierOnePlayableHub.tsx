import {useMemo,useState} from 'react'
import {TIER_ONE_RELEASE_GAMES} from '../game/release/PlayableReleaseCatalog'

type Score={progress:number;score:number;choice?:string}
const initial:Score={progress:0,score:0}
export default function TierOnePlayableHub(){
 const [open,setOpen]=useState(false),[gameId,setGameId]=useState('streetverse'),[state,setState]=useState<Record<string,Score>>({})
 const game=useMemo(()=>TIER_ONE_RELEASE_GAMES.find(g=>g.id===gameId)!,[gameId]);const s=state[gameId]||initial;const level=game.levels[Math.min(s.progress,game.levels.length-1)]
 const act=(label:string,points:number)=>setState(prev=>({...prev,[gameId]:{progress:Math.min((prev[gameId]?.progress||0)+1,game.levels.length),score:(prev[gameId]?.score||0)+points,choice:label}}))
 const reset=()=>setState(prev=>({...prev,[gameId]:initial}))
 return <><button onClick={()=>setOpen(true)} aria-label="Open Tier One playable release games" style={launcher}>🎮 TIER‑1 PLAY</button>{open&&<div role="dialog" aria-label="Tier One Playable Release Hub" style={overlay}><div style={shell}><header style={{display:'flex',justifyContent:'space-between',gap:12}}><div><small style={{color:'#4fe3ff',fontWeight:900,letterSpacing:2}}>RELEASE-FIRST • PLAYABLE VERTICAL SLICES</small><h1 style={{margin:'6px 0'}}>StreetVerse + Court Kings + Volcano + Battle Deck</h1><p style={muted}>These are compact browser proof loops. They increase playable coverage without pretending the full AAA worlds are finished.</p></div><button onClick={()=>setOpen(false)} aria-label="Close Tier One hub">×</button></header>
 <nav style={grid}>{TIER_ONE_RELEASE_GAMES.map(g=><button key={g.id} onClick={()=>setGameId(g.id)} style={{...card,borderColor:g.id===gameId?'#4fe3ff':'#26394d'}}><b>{g.name}</b><small>{g.status}</small><span>{(state[g.id]?.progress||0)}/{g.levels.length} levels</span></button>)}</nav>
 <section style={panel}><div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><div><small>LEVEL {Math.min(s.progress+1,game.levels.length)} / {game.levels.length}</small><h2>{s.progress>=game.levels.length?'SLICE COMPLETE':level.name}</h2></div><strong>SCORE {s.score}</strong></div>{s.progress<game.levels.length?<><p>{level.objective}</p><p style={muted}>Proof target: {level.proof}</p><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{actions(game.id,s.progress).map(a=><button key={a.label} onClick={()=>act(a.label,a.points)}>{a.label} +{a.points}</button>)}</div></>:<><p>Vertical slice complete. Result is ready to hand off to the real persistence/E2E gate.</p><button onClick={reset}>REPLAY SLICE</button></>} {s.choice&&<p style={muted}>Last action: {s.choice}</p>}</section>
 <section style={panel}><h3>Release gates</h3><div style={grid}>{game.releaseGates.map(x=><span key={x} style={chip}>{x}</span>)}</div></section></div></div>}</>
}
function actions(id:string,level:number){const map:Record<string,string[][]>={
 streetverse:[['Help the block','Take the job'],['Tell the truth','Protect a friend'],['Open storefront','Join a crew'],['Return home','Visit old school']],
 'court-kings':[['Perfect release','Drive lane'],['Pass assist','Take three'],['Draw foul','Fast break'],['Save season win','Call rematch']],
 volcano:[['Evacuate family','Secure lab'],['Build bridge','Find high ground'],['Place beacon','Guide teammate'],['Stabilize core','Order evacuation']],
 'battle-deck':[['Summon unit','Bank energy'],['Counter attack','Control zone'],['Adapt deck','Trigger combo'],['Break shield','Finish champion']]
 };return (map[id]?.[level]||['Advance']).map((label,i)=>({label,points:i?75:100}))}
const overlay={position:'fixed',inset:0,zIndex:12400,overflowY:'auto',background:'radial-gradient(circle at top,#132a3d,#03050b 60%)',color:'#fff',padding:18} as const
const shell={maxWidth:1050,margin:'0 auto'} as const
const panel={border:'1px solid #24405a',borderRadius:18,padding:16,marginTop:14,background:'#08111b'} as const
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:9,marginTop:14} as const
const card={border:'1px solid #26394d',borderRadius:14,padding:12,background:'#0b1420',color:'#fff',display:'grid',gap:5,textAlign:'left',cursor:'pointer'} as const
const chip={border:'1px solid #2c4053',borderRadius:999,padding:'8px 10px',fontSize:11,color:'#b9c8d8'} as const
const muted={color:'#9fb0c3',lineHeight:1.55} as const
const launcher={position:'fixed',left:12,bottom:164,zIndex:9002,border:'1px solid #e8b94488',borderRadius:999,padding:'10px 14px',background:'#201807',color:'#ffe49b',fontWeight:900,cursor:'pointer'} as const
