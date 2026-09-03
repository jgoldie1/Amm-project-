import { useMemo, useState } from 'react'

type AgentId='cohost'|'gift'|'moderator'|'translation'|'accessibility'|'debate'|'shopping'|'hype'
type Audience='all-ages'|'youth-safe'|'adult'|'senior-friendly'

const AGENTS:Array<{id:AgentId;label:string;description:string}>=[
  {id:'cohost',label:'AI Cohost',description:'Helps the host with prompts, selected questions, recaps and quiet-room support.'},
  {id:'gift',label:'Gift Reaction',description:'Reacts to verified gifts/tips, announces milestones and triggers matching visual events.'},
  {id:'moderator',label:'Moderator',description:'Flags spam/harassment, suggests slow mode and gives human moderators clear actions.'},
  {id:'translation',label:'Translation',description:'Creates multilingual captions and translation assistance where supported.'},
  {id:'accessibility',label:'Accessibility',description:'Captions, transcript cues, reduced-motion alternatives and clearer control guidance.'},
  {id:'debate',label:'Debate Assist',description:'Tracks speaking balance, interruptions, unanswered questions and equal-time reminders.'},
  {id:'shopping',label:'Shopping Assist',description:'Surfaces supported product context and disclosure reminders without inventing claims.'},
  {id:'hype',label:'Hype Agent',description:'Calls out real milestones, PK swings, goals and clip-worthy moments without faking viewers.'},
]

export default function LiveRoomAgents({format}:{format:string}){
  const [audience,setAudience]=useState<Audience>('all-ages')
  const [enabled,setEnabled]=useState<Record<AgentId,boolean>>({cohost:true,gift:true,moderator:true,translation:true,accessibility:true,debate:false,shopping:false,hype:true})
  const [autoSpeak,setAutoSpeak]=useState(false)
  const [readNames,setReadNames]=useState(false)
  const [frequency,setFrequency]=useState<'low'|'medium'|'high'>('low')

  const guardrail=useMemo(()=>{
    if(audience==='youth-safe')return 'Youth-safe mode: stronger contact limits, stricter moderation, safer defaults, and no automatic spoken username callouts.'
    if(audience==='senior-friendly')return 'Senior-friendly mode: larger controls, calmer pacing, clearer captions, fewer interruptions and simpler prompts.'
    if(audience==='adult')return 'Adult mode: full creator controls while moderation, accessibility and disclosure safeguards remain active.'
    return 'All-ages mode: accessible defaults for everyone, with the strongest applicable safety setting when youth are present.'
  },[audience])

  const modeNote=format==='debate'?'Debate Assist is recommended for this room.':format==='shopping'?'Shopping Assist is recommended for this room.':'Agents adapt to this room format without impersonating human viewers.'

  function toggle(id:AgentId){setEnabled(v=>({...v,[id]:!v[id]}))}

  return <section aria-label="AI room agents" style={s.card}>
    <div style={s.header}><div><div style={s.eyebrow}>STUBBS AI • ALL-AGES LIVE AGENTS</div><h2 style={s.title}>AI Production Team</h2></div><span style={s.badge}>AI-LABELED</span></div>
    <p style={s.note}>These agents are assistants, not fake viewers. They may moderate, translate, announce verified gifts and help the host, but must never fabricate audience size, donations, people or engagement.</p>

    <div style={s.row} role="group" aria-label="Audience safety profile">
      {(['all-ages','youth-safe','adult','senior-friendly'] as Audience[]).map(id=><button key={id} type="button" onClick={()=>setAudience(id)} style={{...s.chip,...(audience===id?s.active:{})}}>{id.replace('-',' ').toUpperCase()}</button>)}
    </div>
    <div role="status" style={s.guard}>{guardrail}</div>

    <div style={s.grid}>{AGENTS.map(agent=><button type="button" key={agent.id} onClick={()=>toggle(agent.id)} aria-pressed={enabled[agent.id]} style={{...s.agent,...(enabled[agent.id]?s.agentOn:{})}}><div style={s.agentTop}><strong>{agent.label}</strong><span>{enabled[agent.id]?'ON':'OFF'}</span></div><div style={s.agentText}>{agent.description}</div></button>)}</div>

    <div style={s.controls}>
      <label style={s.label}>Speaking frequency<select value={frequency} onChange={e=>setFrequency(e.target.value as typeof frequency)} style={s.select}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
      <label style={s.check}><input type="checkbox" checked={autoSpeak} onChange={e=>setAutoSpeak(e.target.checked)}/> Allow automatic AI voice reactions</label>
      <label style={s.check}><input type="checkbox" checked={readNames} disabled={audience==='youth-safe'} onChange={e=>setReadNames(e.target.checked)}/> Allow approved usernames to be read aloud</label>
    </div>

    <div style={s.eventBox}>
      <strong>Verified gift flow</strong>
      <span>Gift/tip verified → ledger event → holographic/Lottie effect → PK score update → AI reaction → replay highlight marker.</span>
      <small>{modeNote} Automatic speech remains host-controlled and should only react to server-verified events.</small>
    </div>
  </section>
}

const s:Record<string,React.CSSProperties>={
  card:{maxWidth:1200,margin:'16px auto 0',border:'1px solid rgba(232,185,68,.28)',borderRadius:20,background:'rgba(24,17,6,.72)',padding:16,color:'#fff'},
  header:{display:'flex',gap:12,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap'},
  eyebrow:{fontSize:10,letterSpacing:2.1,fontWeight:950,color:'#e8b944'},title:{margin:'4px 0 0',fontSize:19},badge:{fontSize:10,fontWeight:950,padding:'7px 9px',border:'1px solid #e8b94466',borderRadius:999,color:'#ffe6a3'},
  note:{fontSize:12,lineHeight:1.5,opacity:.76},row:{display:'flex',gap:7,flexWrap:'wrap'},chip:{minHeight:38,padding:'8px 10px',borderRadius:999,border:'1px solid #3c4350',background:'#10141d',color:'#fff',fontSize:10,fontWeight:900,cursor:'pointer'},active:{border:'1px solid #e8b944',background:'#2b210c'},
  guard:{marginTop:10,padding:11,borderRadius:12,background:'#0d1118',border:'1px solid #293341',fontSize:12,lineHeight:1.45},grid:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:8,marginTop:12},
  agent:{textAlign:'left',minHeight:106,padding:12,borderRadius:14,border:'1px solid #303844',background:'#0b1017',color:'#fff',cursor:'pointer'},agentOn:{border:'1px solid #66e7ff77',background:'#0b1b24'},agentTop:{display:'flex',justifyContent:'space-between',gap:8},agentText:{marginTop:7,fontSize:11,lineHeight:1.45,opacity:.7},
  controls:{display:'flex',gap:14,flexWrap:'wrap',alignItems:'end',marginTop:14},label:{display:'grid',gap:5,fontSize:11,fontWeight:800},select:{padding:'8px 10px',borderRadius:10,border:'1px solid #3b4551',background:'#090d13',color:'#fff'},check:{display:'flex',gap:7,alignItems:'center',fontSize:11,fontWeight:700},
  eventBox:{display:'grid',gap:5,marginTop:14,padding:12,borderRadius:14,border:'1px solid #315d4c',background:'#081813',fontSize:12,lineHeight:1.45}
}
