import {useEffect,useState} from 'react'
import {installAllAmericanAITwinHostRuntime,type AITwinHostState} from '../runtime/AllAmericanAITwinHostRuntime'

export default function AllAmericanAITwinHostStage({humanHostIds=[]}:{humanHostIds?:string[]}){
 const [state,setState]=useState<AITwinHostState|null>(null)
 const [title,setTitle]=useState('All American Network Update')
 const [formatId,setFormatId]=useState('all-american-news')
 const [script,setScript]=useState('')
 const [sourceTitle,setSourceTitle]=useState('')
 const [sourceUrl,setSourceUrl]=useState('')
 const [notice,setNotice]=useState('Temporary synthetic host. A real human host takes priority whenever one is cast.')
 useEffect(()=>{
  const dispose=installAllAmericanAITwinHostRuntime()
  const onState=(event:Event)=>setState((event as CustomEvent<AITwinHostState>).detail||null)
  const onBlocked=(event:Event)=>{const d=(event as CustomEvent<{reason?:string}>).detail||{};setNotice('AI TWIN BLOCKED • '+String(d.reason||'requirements not met').replaceAll('-',' '))}
  addEventListener('tryamm:aan-ai-twin-state',onState)
  addEventListener('tryamm:aan-ai-twin-blocked',onBlocked)
  dispatchEvent(new Event('tryamm:aan-ai-twin-request'))
  return()=>{removeEventListener('tryamm:aan-ai-twin-state',onState);removeEventListener('tryamm:aan-ai-twin-blocked',onBlocked);dispose()}
 },[])
 useEffect(()=>{dispatchEvent(new CustomEvent('tryamm:aan-human-hosts',{detail:{hostIds:humanHostIds}}))},[humanHostIds.join('|')])
 const sources=sourceTitle.trim()&&sourceUrl.trim()?[{title:sourceTitle.trim(),url:sourceUrl.trim()}]:[]
 const prep=()=>{dispatchEvent(new CustomEvent('tryamm:aan-ai-twin-prepare',{detail:{title,formatId,script,sources,approved:false}}));setNotice('Segment prepared. Review the script and sources, then approve it before the AI Twin speaks.')}
 const approve=()=>{dispatchEvent(new Event('tryamm:aan-ai-twin-approve'));setNotice('Segment approved for the disclosed synthetic host.')}
 const speak=()=>{dispatchEvent(new Event('tryamm:aan-ai-twin-speak'));setNotice('AI Twin speaking with SYNTHETIC HOST disclosure and captions.')}
 const aiDraft=()=>{
  const factual=/news|crypto|business|finance|sports/i.test(formatId)
  const prompt=[
   'You are HoloGPT producing a script for the All American Network temporary AI Twin host.',
   'The host must be clearly disclosed as synthetic/AI-assisted.',
   'Title: '+title+'. Format: '+formatId+'.',
   factual?'This is a factual segment. Use only source-backed claims; do not invent current facts. Include source callouts and timestamps.':'Keep claims factual and clearly separate commentary from reported facts.',
   formatId==='crypto-education'?'This is cryptocurrency education only. No personalized investment advice, price pumps, guaranteed returns, or undisclosed token promotion. Include risk and scam warnings.':'',
   'Write a 60-90 second teleprompter script with a cold open, 3 concise points, one audience question, and closing CTA.',
   'End with: This segment is presented by the All American Network AI Twin, a synthetic host.'
  ].filter(Boolean).join(' ')
  dispatchEvent(new CustomEvent('tryamm:hologpt-study-context',{detail:{prompt,source:'aan-ai-twin-producer'}}))
  setNotice('HoloGPT opened with the AI Twin script brief. Paste the reviewed script here, attach sources if factual, then PREP.')
 }
 return <section style={panel}>
  <div style={{display:'grid',gridTemplateColumns:'120px minmax(0,1fr)',gap:12,alignItems:'center'}}>
   <div style={avatarWrap}><style>{'@keyframes twinFloat{50%{transform:translateY(-7px)}}@keyframes twinScan{from{transform:translateY(-110%)}to{transform:translateY(280%)}}@keyframes twinPulse{50%{box-shadow:0 0 38px #59eaffaa,inset 0 0 28px #7d57ff66}}'}</style><div style={avatar}><div style={head}/><div style={body}/><div style={scan}/></div><div style={badge}>AI TWIN</div></div>
   <div><div style={eyebrow}>TEMPORARY SYNTHETIC ANCHOR</div><h2 style={{margin:'4px 0'}}>All American Network AI Twin Host</h2><div style={muted}>Synthetic/AI-assisted • captions ON • source-gated factual segments • human host takes priority.</div><div style={{marginTop:7,fontSize:9,color:state?.mode==='speaking'?'#7affad':'#8ecbd9'}}>STATUS • {(state?.mode||'standby').toUpperCase()} {humanHostIds.length?'• HUMAN HOST CAST — HANDOFF ACTIVE':''}</div></div>
  </div>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginTop:10}}><input value={title} onChange={e=>setTitle(e.target.value)} style={input} placeholder="Segment title"/><select value={formatId} onChange={e=>setFormatId(e.target.value)} style={input}><option value="all-american-news">News Desk</option><option value="crypto-education">Crypto Education</option><option value="business-showcase">Business</option><option value="streetverse-live">StreetVerse</option><option value="sports-desk">Sports</option><option value="faith-community">Faith & Community</option><option value="creator-spotlight">Creator Spotlight</option></select></div>
  <textarea value={script} onChange={e=>setScript(e.target.value)} rows={7} placeholder="Reviewed teleprompter script…" style={{...input,marginTop:7,resize:'vertical'}}/>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginTop:7}}><input value={sourceTitle} onChange={e=>setSourceTitle(e.target.value)} style={input} placeholder="Source title (required for factual news/crypto)"/><input value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} style={input} placeholder="https://source…"/></div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:6,marginTop:8}}><button onClick={aiDraft} style={button}>◈ AI DRAFT</button><button onClick={prep} style={button}>PREP</button><button onClick={approve} style={button}>APPROVE</button><button onClick={speak} disabled={!state?.currentSegment?.approved||humanHostIds.length>0} style={{...button,borderColor:'#6df7a4',opacity:(!state?.currentSegment?.approved||humanHostIds.length>0)?.5:1}}>▶ SPEAK</button></div>
  <div style={disclosure}>ON-AIR LOWER THIRD: <b>AAN AI TWIN • SYNTHETIC HOST</b><br/>A real host can take over at any time. This AI Twin must not impersonate a person or hide that its voice/avatar is synthetic.</div>
  <div aria-live="polite" style={noticeBox}>{notice}</div>
 </section>
}

const panel:React.CSSProperties={marginTop:12,padding:12,borderRadius:16,border:'1px solid #765bff66',background:'linear-gradient(145deg,#07151f,#160d25)',color:'#fff'}
const avatarWrap:React.CSSProperties={display:'grid',placeItems:'center'}
const avatar:React.CSSProperties={position:'relative',overflow:'hidden',width:96,height:118,borderRadius:22,border:'1px solid #62eaffaa',background:'radial-gradient(circle at 50% 22%,#73f6ff44,#37246544 48%,#050812)',boxShadow:'0 0 28px #57e6ff55,inset 0 0 24px #7d57ff44',animation:'twinFloat 2.4s ease-in-out infinite,twinPulse 1.8s ease-in-out infinite'}
const head:React.CSSProperties={position:'absolute',left:31,top:17,width:34,height:38,borderRadius:'48% 48% 46% 46%',border:'2px solid #78efff',boxShadow:'0 0 14px #78efff',background:'#7f5cff22'}
const body:React.CSSProperties={position:'absolute',left:18,top:56,width:60,height:74,borderRadius:'45% 45% 18% 18%',border:'2px solid #9b73ff',boxShadow:'0 0 18px #9b73ff88',background:'linear-gradient(180deg,#63eaff22,#9b73ff22)'}
const scan:React.CSSProperties={position:'absolute',left:0,right:0,top:0,height:32,background:'linear-gradient(180deg,transparent,#86f6ff55,transparent)',animation:'twinScan 2.2s linear infinite'}
const badge:React.CSSProperties={marginTop:6,fontSize:8,fontWeight:1000,letterSpacing:1.7,color:'#91f4ff'}
const eyebrow:React.CSSProperties={fontSize:8,letterSpacing:2.2,color:'#8aefff',fontWeight:950}
const muted:React.CSSProperties={fontSize:9,color:'#91a9b5',lineHeight:1.5}
const input:React.CSSProperties={width:'100%',boxSizing:'border-box',padding:9,borderRadius:9,border:'1px solid #355a6e',background:'#04101a',color:'#fff',fontSize:10}
const button:React.CSSProperties={minHeight:38,padding:'7px 8px',borderRadius:9,border:'1px solid #506d8a',background:'#0a2230',color:'#fff',fontSize:8,fontWeight:950}
const disclosure:React.CSSProperties={marginTop:8,padding:8,borderRadius:9,border:'1px solid #816cd666',background:'#160e27',fontSize:8,color:'#d9cdff',lineHeight:1.45}
const noticeBox:React.CSSProperties={marginTop:8,padding:8,borderRadius:9,border:'1px solid #30596c',background:'#071621',fontSize:9,color:'#a7dfee'}