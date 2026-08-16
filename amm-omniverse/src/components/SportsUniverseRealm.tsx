import { useState } from 'react'
import { useGameStore } from '../game/state/useGameStore'
import SportsGameplayPanel from './games/SportsGameplayPanel'

const games = [
  {id:'basketball',label:'🏀 Court Kings / Court Queens',desc:'Men · Women · Mixed · 5v5 basketball core',color:'#ff8a32'},
  {id:'boxing',label:'🥊 Fight Kingdom Boxing',desc:'Men + Women divisions · 12-round rules core',color:'#ff5353'},
  {id:'mma',label:'🥋 Combat Arena MMA',desc:'Men + Women · striking · takedowns · grappling',color:'#a47aff'},
  {id:'football',label:'🏈 Gridiron Kingdom',desc:'Shared athlete foundation · football engine next',color:'#45d37c'},
  {id:'baseball',label:'⚾ Diamond Kingdom',desc:'Pitching · batting · fielding pipeline',color:'#71d9ff'},
  {id:'soccer',label:'⚽ Global Kings Soccer',desc:'Men · Women · Mixed football/soccer pipeline',color:'#73e993'},
  {id:'hockey',label:'🏒 Ice Kingdom Hockey',desc:'Skating · puck · checking · goalie pipeline',color:'#8ad8ff'},
  {id:'track',label:'🏃 Track & Field World',desc:'Sprints · relay · hurdles · jumps · throws',color:'#ffd166'},
] as const

type Playable='basketball'|'boxing'|'mma'

export default function SportsUniverseRealm(){
  const store=useGameStore()
  const [active,setActive]=useState<Playable|null>(null)
  if(active) return <div style={{width:'100%',height:'100%',background:'#040714',overflowY:'auto',padding:18,boxSizing:'border-box'}}><SportsGameplayPanel game={active} onExit={()=>setActive(null)}/></div>
  return <div style={{width:'100%',height:'100%',background:'radial-gradient(circle at top,#172238,#040714 60%)',color:'#fff',fontFamily:'monospace',overflowY:'auto'}}>
    <div style={{position:'sticky',top:0,zIndex:5,display:'flex',alignItems:'center',gap:12,padding:'12px 18px',background:'#050917ee',borderBottom:'1px solid #4fe3ff33',backdropFilter:'blur(12px)'}}>
      <button onClick={()=>store.setScreen('city')} style={{background:'#102036',border:'1px solid #4fe3ff66',color:'#9ff7ff',borderRadius:8,padding:'8px 12px'}}>← CITY</button>
      <div><div style={{fontWeight:900,fontSize:18,letterSpacing:2,color:'#9ff7ff'}}>TRYAMM SPORTS UNIVERSE</div><div style={{fontSize:10,color:'#75859c'}}>Original leagues · shared recovered athlete foundation · Holo ready</div></div>
    </div>
    <div style={{padding:20}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:12}}>{games.map(g=><div key={g.id} style={{border:`1px solid ${g.color}55`,borderRadius:14,padding:16,background:'#071020cc',boxShadow:`inset 0 0 25px ${g.color}0c`}}>
        <div style={{color:g.color,fontWeight:900,fontSize:16}}>{g.label}</div><div style={{color:'#9aa7b8',fontSize:12,minHeight:38,margin:'8px 0 12px'}}>{g.desc}</div>
        {(['basketball','boxing','mma'] as string[]).includes(g.id)?<button onClick={()=>setActive(g.id as Playable)} style={{width:'100%',background:`${g.color}20`,border:`1px solid ${g.color}`,color:g.color,borderRadius:8,padding:9,fontWeight:900}}>▶ PLAY CORE</button>:<button disabled style={{width:'100%',background:'#111522',border:'1px solid #ffffff22',color:'#667080',borderRadius:8,padding:9}}>SHARED ENGINE QUEUED</button>}
      </div>)}</div>
      <div style={{marginTop:18,border:'1px solid #e8b94455',borderRadius:12,padding:14,background:'#211a0c55',color:'#ffe493',fontSize:12}}>Recovered athlete.glb, animation clips and arena SFX are the preferred runtime assets. No NBA/WNBA/2K/EA logos, real rosters or protected likenesses are used.</div>
    </div>
  </div>
}
