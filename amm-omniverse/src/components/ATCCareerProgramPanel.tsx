import { useMemo, useState } from 'react'
import { ATC_CAREER_PROGRAM, AAU_CAREER_EXPANSION, AAU_GO_LIVE_CONTRACT } from '../education/ATCCareerProgram'

export default function ATCCareerProgramPanel(){
 const[level,setLevel]=useState(ATC_CAREER_PROGRAM.levels[0].id),[scenario,setScenario]=useState(0)
 const active=useMemo(()=>ATC_CAREER_PROGRAM.levels.find(x=>x.id===level)!,[level])
 const drills=[
  'Identify the runway/taxiway conflict before moving traffic.',
  'Sequence three arrivals while preserving safe simulated spacing.',
  'Handle a weather diversion and explain the coordination steps.',
  'Run an emergency-priority scenario, then complete a debrief.'
 ]
 return <section style={panel}><h2>✈️ ATC Career Preparation & Simulation</h2><p style={muted}>{ATC_CAREER_PROGRAM.purpose}</p>
  <div style={grid}>{ATC_CAREER_PROGRAM.levels.map(x=><button key={x.id} onClick={()=>setLevel(x.id)} style={{...card,borderColor:x.id===level?'#4fe3ff':'#26394d',color:'#fff',textAlign:'left'}}><b>{x.name}</b><small>{x.id.toUpperCase()}</small><span style={muted}>{x.sim}</span></button>)}</div>
  <article style={{...card,marginTop:10}}><h3>{active.name}</h3><p style={muted}><b>Modules:</b> {active.modules.join(' • ')}</p><p style={muted}><b>Simulation:</b> {active.sim}</p><button onClick={()=>setScenario((scenario+1)%drills.length)}>RUN AI INSTRUCTOR DRILL</button><p style={{...muted,color:'#7dffb0'}}><b>AAU ATC AI Instructor:</b> {drills[scenario]}</p><p style={muted}>The AI instructor can teach concepts, run oral drills, generate scenario briefs, score communication consistency, explain mistakes, adapt difficulty and support accessibility. It cannot issue real-world clearances or represent simulation scores as certification.</p></article>
  <h3>Career programs that expand our reach</h3><div style={grid}>{AAU_CAREER_EXPANSION.map(x=><article key={x.id} style={card}><b>{x.name}</b><p style={muted}>{x.labs.join(' • ')}</p></article>)}</div>
  <p style={{...muted,color:'#ffcf66'}}><b>Go-live contract:</b> {AAU_GO_LIVE_CONTRACT}</p>
 </section>
}
const panel={border:'1px solid #284158',borderRadius:18,padding:16,margin:'14px 0',background:'#08111b'} as const
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10} as const
const card={border:'1px solid #26394d',borderRadius:14,padding:13,background:'#0a1420',display:'grid',gap:7} as const
const muted={color:'#aab8ca',lineHeight:1.5} as const
