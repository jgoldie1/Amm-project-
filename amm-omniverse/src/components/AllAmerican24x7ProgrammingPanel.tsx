import {useEffect,useMemo,useState} from 'react'
import {ALL_AMERICAN_24H_TEMPLATE,ALL_AMERICAN_CHANNELS,CRYPTO_EDUCATION_TOPICS,CRYPTO_BROADCAST_RULES,type NetworkProgramSlot} from '../data/AllAmerican24x7Programming'

type ProgramState={slot:NetworkProgramSlot;status:string;hostIds:string[];sources:Array<{title:string;url:string;publisher?:string}>;fallback:string;updatedAt:string}

export default function AllAmerican24x7ProgrammingPanel(){
 const [state,setState]=useState<ProgramState|null>(null)
 const [selected,setSelected]=useState('crypto-classroom')
 const [topic,setTopic]=useState(CRYPTO_EDUCATION_TOPICS[0].id)
 const [notice,setNotice]=useState('Human hosts first. Replays and education fill gaps; the network never pretends a replay or AI segment is live.')
 useEffect(()=>{
  const onState=(event:Event)=>setState((event as CustomEvent<ProgramState>).detail||null)
  const onBlocked=(event:Event)=>{const d=(event as CustomEvent<{reason?:string}>).detail||{};if(d.reason)setNotice('START BLOCKED • '+d.reason.replaceAll('-',' '))}
  addEventListener('tryamm:all-american-24x7-state',onState)
  addEventListener('tryamm:broadcast-blocked',onBlocked)
  dispatchEvent(new Event('tryamm:all-american-24x7-request'))
  return()=>{removeEventListener('tryamm:all-american-24x7-state',onState);removeEventListener('tryamm:broadcast-blocked',onBlocked)}
 },[])
 const chosen=useMemo(()=>ALL_AMERICAN_24H_TEMPLATE.find(s=>s.id===selected)||ALL_AMERICAN_24H_TEMPLATE[0],[selected])
 const crypto=chosen.channelId==='aan-crypto-education'
 const start=()=>{
  dispatchEvent(new CustomEvent('tryamm:all-american-start-slot',{detail:{slotId:chosen.id,source:'24x7-programming-panel'}}))
  setNotice(crypto?'Crypto show requested. It remains educational, source-aware and non-advisory.':'Program requested through the broadcast control room.')
 }
 const aiRundown=()=>{
  const subject=CRYPTO_EDUCATION_TOPICS.find(x=>x.id===topic)||CRYPTO_EDUCATION_TOPICS[0]
  const prompt=[
   'You are HoloGPT acting as an assistant producer for All American Network.',
   'Create a broadcast rundown, not financial advice.',
   'Program: '+chosen.title+'.',
   'Crypto education topic: '+subject.label+'.',
   'Teach: '+subject.description+'.',
   'Include: cold open, definitions, examples, risk/scam warnings, source placeholders with timestamps, audience questions, 3 on-screen graphics, 3 Reel moments, and closing disclosure: Educational only — not financial advice.',
   'Do not provide personalized recommendations, guaranteed returns, undisclosed promotions, or fabricated current prices/news.'
  ].join(' ')
  dispatchEvent(new CustomEvent('tryamm:hologpt-study-context',{detail:{prompt,source:'all-american-crypto-education-producer'}}))
  setNotice('HoloGPT producer context opened for the crypto education rundown.')
 }
 return <section style={panel}>
  <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'start',flexWrap:'wrap'}}>
   <div><div style={eyebrow}>24/7 PROGRAMMING BRAIN</div><h2 style={{margin:'4px 0'}}>Human Hosts → Replays/Education → Full Network Clock</h2><div style={muted}>Current: {state?.slot?.title||'Loading clock…'} • {String(state?.status||'').replaceAll('-',' ')} {state?.fallback&&state.fallback!=='none'?'• fallback '+state.fallback:''}</div></div>
   <button onClick={()=>dispatchEvent(new Event('tryamm:all-american-24x7-request'))} style={button}>REFRESH CLOCK</button>
  </div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:7,marginTop:10}}>
   {ALL_AMERICAN_CHANNELS.map(ch=><div key={ch.id} style={channelCard}><b>{ch.label}</b><span style={{fontSize:9,color:'#8fa8b4',lineHeight:1.45,display:'block',marginTop:4}}>{ch.purpose}</span></div>)}
  </div>
  <div style={{display:'grid',gridTemplateColumns:'minmax(0,1.2fr) minmax(0,1fr)',gap:10,marginTop:10}}>
   <article style={subPanel}><div style={section}>TODAY'S 24-HOUR CLOCK</div><div style={{display:'grid',gap:5,marginTop:7,maxHeight:330,overflowY:'auto'}}>{ALL_AMERICAN_24H_TEMPLATE.map(s=><button key={s.id} onClick={()=>setSelected(s.id)} style={{...row,borderColor:selected===s.id?'#65e9ff':'#294654'}}><span><b>{String(Math.floor(s.startMinute/60)).padStart(2,'0')}:{String(s.startMinute%60).padStart(2,'0')} • {s.title}</b><small style={{display:'block',opacity:.68}}>{s.durationMinutes} min • {s.mode.replaceAll('-',' ')} • {s.channelId}</small></span><span style={{fontSize:8,color:s.hostRequired?'#ffd06e':'#78ffad'}}>{s.hostRequired?'HOST':'AUTO FILL'}</span></button>)}</div></article>
   <article style={subPanel}><div style={section}>PROGRAM CONTROL</div><div style={{fontSize:13,fontWeight:950,marginTop:7}}>{chosen.title}</div><div style={muted}>{chosen.mode.replaceAll('-',' ')} • {chosen.durationMinutes} min • {chosen.sourceRequired?'sources required':'sources optional'} • {chosen.hostRequired?'human host required':'no host required'}</div>{chosen.disclosure&&<div style={warning}>{chosen.disclosure}</div>}<button onClick={start} style={{...button,width:'100%',marginTop:8}}>START / PREP SLOT</button>
    {crypto&&<><div style={{marginTop:12,...section}}>CRYPTO EDUCATION DESK</div><select value={topic} onChange={e=>setTopic(e.target.value)} style={input}>{CRYPTO_EDUCATION_TOPICS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select><div style={warning}>Educational only • no personalized investment advice • no guaranteed returns • sources/timestamps required for news • sponsored tokens must be disclosed.</div><button onClick={aiRundown} style={{...button,width:'100%',marginTop:8,borderColor:'#9b75ff'}}>◈ BUILD HOLOGPT RUNDOWN</button></>}
   </article>
  </div>
  <div aria-live="polite" style={noticeBox}>{notice}</div>
  <div style={{fontSize:8,color:'#647986',marginTop:8}}>Crypto safeguards: {Object.entries(CRYPTO_BROADCAST_RULES).filter(([,v])=>v===true).map(([k])=>k).join(' • ')}</div>
 </section>
}

const panel:React.CSSProperties={marginTop:12,padding:12,borderRadius:16,border:'1px solid #2e6275',background:'linear-gradient(145deg,#07151e,#100c1d)',color:'#fff'}
const subPanel:React.CSSProperties={padding:10,borderRadius:12,border:'1px solid #294654',background:'#061018'}
const channelCard:React.CSSProperties={padding:9,borderRadius:11,border:'1px solid #284553',background:'#07131c'}
const row:React.CSSProperties={display:'flex',justifyContent:'space-between',gap:8,textAlign:'left',padding:8,borderRadius:9,border:'1px solid #294654',background:'#081821',color:'#fff'}
const eyebrow:React.CSSProperties={fontSize:8,letterSpacing:2.4,color:'#63eaff',fontWeight:950}
const section:React.CSSProperties={fontSize:9,letterSpacing:1.5,color:'#78eaff',fontWeight:950}
const muted:React.CSSProperties={fontSize:9,color:'#8ea6b1',lineHeight:1.5}
const warning:React.CSSProperties={marginTop:8,padding:8,borderRadius:9,border:'1px solid #8a6b3066',background:'#1d1608',fontSize:9,color:'#ffe1a1',lineHeight:1.45}
const input:React.CSSProperties={width:'100%',marginTop:7,padding:9,borderRadius:9,border:'1px solid #31576b',background:'#041019',color:'#fff'}
const button:React.CSSProperties={minHeight:38,padding:'7px 10px',borderRadius:9,border:'1px solid #3a7289',background:'#0b2633',color:'#fff',fontWeight:950,fontSize:9}
const noticeBox:React.CSSProperties={marginTop:9,padding:9,borderRadius:10,border:'1px solid #245b4a',background:'#071a14',fontSize:9,color:'#a7f6c5'}