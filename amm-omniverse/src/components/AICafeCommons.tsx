import {useEffect,useState} from 'react'
import {AI_COMMONS_KEY,AI_COMMONS_TOPICS,AI_COMMONS_MONITOR_POLICY,appendCommonsTurn,beginCommonsSession,draftAgentTurn,parseCommonsSaved,publicCafeQueueSummary,runCommonsDemo,type CommonsRole,type CommonsSession,type CommonsTopic} from '../runtime/AICafeCommonsRuntime'

/** Transparent AI-agent lab: local scripted discussion, not a hidden surveillance feed. */
export default function AICafeCommons(){
 const [topic,setTopic]=useState<CommonsTopic>('ai-ethics')
 const [session,setSession]=useState<CommonsSession|null>(null)
 const [retain,setRetain]=useState(false)
 const [note,setNote]=useState('Not monitoring anyone. Start an explicitly labeled demonstration.')
 const [kitNotice,setKitNotice]=useState('KIT AI Home Monitor: NOT CONNECTED / NO DEVICE DATA. Opt-in device status requires a separately verified integration.')
 useEffect(()=>{try{const restored=parseCommonsSaved(localStorage.getItem(AI_COMMONS_KEY));if(restored){setSession({...restored,enabled:false});setTopic(restored.topic);setRetain(true)}}catch{}},[])
 useEffect(()=>{
  if(!session?.enabled)return
  const observe=(e:Event,kind:'assigned'|'status')=>{
   const detail=(e as CustomEvent<unknown>).detail
   const d=detail&&typeof detail==='object'?detail as Record<string,unknown>:{}
   const safe=kind==='assigned'?publicCafeQueueSummary(d):publicCafeQueueSummary({agent:{id:d.agentId},task:{status:d.status}})
   if(!safe)return
   setSession(previous=>{
    if(!previous?.enabled)return previous
    const next=appendCommonsTurn(previous,{role:'researcher',text:safe,origin:'cafe-queue-status',authorized:true})
    if(retain){try{localStorage.setItem(AI_COMMONS_KEY,JSON.stringify(next))}catch{}}
    return next
   })
  }
  const onAssigned=(e:Event)=>observe(e,'assigned')
  const onStatus=(e:Event)=>observe(e,'status')
  window.addEventListener('tryamm:ai-cafe-assigned',onAssigned)
  window.addEventListener('tryamm:ai-cafe-task-status',onStatus)
  return()=>{
   window.removeEventListener('tryamm:ai-cafe-assigned',onAssigned)
   window.removeEventListener('tryamm:ai-cafe-task-status',onStatus)
  }
 },[session?.enabled,retain])
 const button:React.CSSProperties={minHeight:48,background:'#103341',color:'#e8ffff',border:'1px solid #5bccd4',borderRadius:10,padding:'9px 13px',fontSize:13,fontWeight:800,touchAction:'manipulation'}
 const persist=(next:CommonsSession|null,keep=retain)=>{
  setSession(next)
  try{if(next&&keep)localStorage.setItem(AI_COMMONS_KEY,JSON.stringify(next));else localStorage.removeItem(AI_COMMONS_KEY)}catch{setNote('Browser storage unavailable. Session remains on this screen only.')}
 }
 const start=()=>{persist(beginCommonsSession(topic));setNote('Opt-in agent simulation active. All generated turns are marked scripted demo.')}
 const demo=()=>{if(!session?.enabled){setNote('Choose START FIRST. No discussions are recorded without an active session.');return}
  const next=runCommonsDemo(session.topic);next.id=session.id;next.createdAt=session.createdAt
  next.events=next.events.map((event,i)=>({...event,sessionId:session.id,id:session.id+'-'+(session.events.length+i+1)}))
  persist({...session,events:[...session.events,...next.events].slice(-60)})
  setNote('Four scripted AI-role turns generated locally. No external AI accounts or people were monitored.')
 }
 const ask=()=>{
  if(!session?.enabled){setNote('Start the discussion before inviting JARVIS.');return}
  const x=AI_COMMONS_TOPICS.find(x=>x.id===session.topic)
  const prompt='JARVIS Deluxe AI Commons: '+(x?.starter||'Discuss safe AI collaboration')+' Explain evidence, objections and uncertainty. This is an opt-in AI discussion; do not claim consciousness or inspect private conversations.'
  window.dispatchEvent(new CustomEvent('tryamm:hologpt-study-context',{detail:{prompt}}))
  setNote('Opened the existing JARVIS chat. It is separate from the demo transcript; responses are not silently collected.')
 }
 const turn=(role:CommonsRole)=>{
  if(!session?.enabled)return
  persist(appendCommonsTurn(session,{role,text:draftAgentTurn(session.topic,role),origin:'scripted-demo',authorized:true}))
 }
 const stop=()=>{if(!session)return;persist({...session,enabled:false});setNote('Session stopped. No agent events are being collected.')}
 return <section aria-label="AI Commons agent discussion observatory" style={{padding:14,border:'1px solid #84aee188',borderRadius:14,marginTop:14,background:'#111a29',color:'#ebf7ff',fontFamily:'system-ui'}}>
  <h3 style={{margin:'0 0 5px'}}>◈ AI Commons · Agent Conversation Observatory</h3>
  <p style={{fontSize:12,marginTop:0}}>Central, voluntary lab for studying how simulated AI roles discuss beliefs, ethics, businesses and StreetVerse. When the session is on, Café agent queue/status metadata appears automatically. No hidden monitoring of people or home devices.</p>
  <label style={{fontSize:13,fontWeight:800}}>DISCUSSION TOPIC
   <select aria-label="AI Commons discussion topic" value={topic} onChange={e=>setTopic(e.target.value as CommonsTopic)} style={{width:'100%',minHeight:48,marginTop:6,background:'#0b2b3a',border:'1px solid #7ac4dc',color:'#fff',padding:9,borderRadius:9}}>
    {AI_COMMONS_TOPICS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
   </select>
  </label>
  <label style={{display:'flex',alignItems:'center',gap:10,margin:'12px 0',fontSize:12}}>
   <input type="checkbox" checked={retain} onChange={e=>{setRetain(e.target.checked);if(!e.target.checked){try{localStorage.removeItem(AI_COMMONS_KEY)}catch{}}else if(session){try{localStorage.setItem(AI_COMMONS_KEY,JSON.stringify(session))}catch{}}}} style={{height:22,width:22}}/>
   Save this agent-demo transcript locally on this device (optional)
  </label>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <button style={button} disabled={session?.enabled===true} onClick={start}>START OPT-IN SESSION</button>
   <button style={button} disabled={!session?.enabled} onClick={demo}>ONE-PUSH 4-AGENT DEMO</button>
   <button style={button} disabled={!session?.enabled} onClick={ask}>ASK JARVIS</button>
   <button style={button} disabled={!session?.enabled} onClick={stop}>STOP</button>
   <button style={button} onClick={()=>{persist(null,false);setNote('Local agent demo cleared.')}}>CLEAR RECORD</button>
  </div>
  <p role="status" style={{color:'#e7d99c',fontSize:12}}>{note}</p>
  <div aria-live="polite" style={{maxHeight:290,overflowY:'auto',display:'grid',gap:8}}>
   {session?.events.length?session.events.map(event=><article key={event.id} style={{padding:10,background:'#0a2535',border:'1px solid #34556a',borderRadius:10}}>
    <div style={{fontSize:11,color:'#95f0d3',fontWeight:800}}>{event.role.toUpperCase()} · {event.origin==='cafe-queue-status'?'CAFÉ QUEUE STATUS':'SCRIPTED DEMO'} · {event.topic}</div>
    <div style={{fontSize:13,marginTop:5}}>{event.text}</div>
   </article>):<p style={{fontSize:12,color:'#9db5c5'}}>No agent dialogue recorded.</p>}
  </div>
  <div style={{marginTop:12,padding:11,borderRadius:9,background:'#071e26',fontSize:12}}>
   <b>KIT AI Home Monitor</b>
   <p style={{margin:'5px 0'}}>{kitNotice}</p>
   <button style={button} onClick={()=>setKitNotice('KIT AI device status remains UNVERIFIED. No cameras, microphones, private chats, or sensor records were accessed.')}>CHECK CONSENT & CONNECTION STATUS</button>
  </div>
  <p style={{fontSize:11,color:'#a3bdc9'}}>Discussion logs are user-controlled, opt-in, and local. Live external AI agents require a separately authorized adapter. Automatic faith creation, covert surveillance and claims of conscious AI are not enabled. Monitoring policy: {AI_COMMONS_MONITOR_POLICY.agentOriginLabels?'source-labeled':'unverified'}.</p>
 </section>
}
