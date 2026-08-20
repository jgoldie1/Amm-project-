import type { CharacterState, CharacterIntent } from '../game/ai/characterIntelligenceDirector'

type Props = {
  character: CharacterState
  intent?: CharacterIntent
  serverApproved?: boolean
  onClose?: () => void
}

const pct=(n:number)=>`${Math.round(n*100)}%`

export default function CharacterIntelligenceHUD({character,intent,serverApproved,onClose}:Props){
  const emotions=Object.entries(character.emotion).sort((a,b)=>b[1]-a[1]).slice(0,4)
  const goal=[...character.goals].sort((a,b)=>b.priority-a.priority)[0]
  return <aside aria-label="Character intelligence inspector" style={{position:'fixed',right:12,bottom:12,zIndex:14000,width:'min(390px,calc(100vw - 24px))',maxHeight:'72vh',overflowY:'auto',background:'#050912ee',color:'#fff',border:'1px solid #274766',borderRadius:18,padding:14,fontFamily:'system-ui,sans-serif',boxShadow:'0 18px 60px #000a'}}>
    <header style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'start'}}><div><div style={{fontSize:9,letterSpacing:2,color:'#4fe3ff',fontWeight:900}}>CHARACTER INTELLIGENCE</div><div style={{fontSize:20,fontWeight:950}}>{character.displayName}</div><div style={{fontSize:11,color:'#8da4be'}}>{character.role} • {character.brain.toUpperCase()} • REV {character.revision}</div></div>{onClose&&<button onClick={onClose} aria-label="Close intelligence inspector" style={{border:'1px solid #34485e',background:'#0d1622',color:'#fff',borderRadius:999,width:34,height:34}}>×</button>}</header>
    <section style={{marginTop:12}}><div style={{fontSize:10,color:'#7f96ae',fontWeight:900}}>TOP EMOTIONS</div><div style={{display:'grid',gap:5,marginTop:6}}>{emotions.map(([k,v])=><div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:12}}><span>{k}</span><strong>{pct(v)}</strong></div>)}</div></section>
    <section style={{marginTop:12,paddingTop:10,borderTop:'1px solid #1b2b3c'}}><div style={{fontSize:10,color:'#7f96ae',fontWeight:900}}>CURRENT GOAL</div><div style={{marginTop:5,fontSize:13}}>{goal?.description??'No active goal'}</div></section>
    <section style={{marginTop:12,paddingTop:10,borderTop:'1px solid #1b2b3c'}}><div style={{fontSize:10,color:'#7f96ae',fontWeight:900}}>AWARENESS</div><div style={{marginTop:5,fontSize:12,lineHeight:1.55,color:'#c5d2e0'}}>World: {character.awareness.currentWorld}<br/>World Pulse: {character.awareness.worldPulse??'—'}<br/>Nearby players: {character.awareness.nearbyPlayerIds.length}<br/>Nearby characters: {character.awareness.nearbyCharacterIds.length}<br/>Danger: {pct(character.awareness.dangerLevel)}</div></section>
    <section style={{marginTop:12,paddingTop:10,borderTop:'1px solid #1b2b3c'}}><div style={{fontSize:10,color:'#7f96ae',fontWeight:900}}>INTENT</div><div style={{marginTop:5,fontSize:13}}>{intent?.action??character.currentAction}</div>{intent&&<div style={{fontSize:11,color:'#9fb0c2',marginTop:5,lineHeight:1.45}}>{intent.reason}<br/>Confidence: {pct(intent.confidence)}<br/>Server validation: {intent.requiresServerValidation?'required':'not required'}</div>}<div style={{marginTop:7,fontSize:10,fontWeight:950,color:serverApproved===true?'#7fffb5':serverApproved===false?'#ff8ca0':'#ffe17a'}}>{serverApproved===true?'SERVER APPROVED':serverApproved===false?'SERVER REJECTED':'AWAITING / NOT APPLICABLE'}</div></section>
    <section style={{marginTop:12,paddingTop:10,borderTop:'1px solid #1b2b3c'}}><div style={{fontSize:10,color:'#7f96ae',fontWeight:900}}>MEMORY / RELATIONSHIPS</div><div style={{fontSize:11,color:'#9fb0c2',marginTop:5}}>Memories: {character.memory.length} • Relationships: {character.relationships.length} • Goals: {character.goals.length}</div></section>
  </aside>
}
