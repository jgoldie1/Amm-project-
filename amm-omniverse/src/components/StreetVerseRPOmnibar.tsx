import {useMemo,useState} from 'react'
import {compileRPGeniiWish} from '../runtime/StreetVerseAbracadabraGeniiRuntime'

const EMOJI=[
 ['👋','wave'],['😂','laugh'],['🙏','pray'],['👏','applause'],['💃','dance'],['🕺','dance'],['🎤','mic performance'],['🏆','victory'],
 ['🤝','handshake'],['❤️','hug'],['🔧','mechanic work'],['🏀','basketball'],['🚗','car'],['🚓','police'],['🚑','medical'],['🚒','firefighter']
] as const
const SFX=[
 ['👏','applause'],['🎉','crowd roar'],['🔔','church bell'],['🎤','mic check'],['🎵','beat drop'],['🚨','police siren'],['🚑','ambulance siren'],['🚒','firetruck siren'],['🌧️','rain'],['💨','wind'],['🚗','engine rev'],['🏁','tire screech']
] as const

export default function StreetVerseRPOmnibar({compact=false}:{compact?:boolean}){
 const [prompt,setPrompt]=useState('')
 const [status,setStatus]=useState('Emoji, SFX, or describe the RP moment you want.')
 const preview=useMemo(()=>prompt?compileRPGeniiWish({query:prompt}):null,[prompt])
 const wish=(query:string,mode:'emoji'|'sound'|'text'|'scene'='text')=>{
  const full=(query||prompt).trim();if(!full)return
  window.dispatchEvent(new CustomEvent('tryamm:rp-genii-request',{detail:{query:full,mode,worldId:location.pathname.includes('kingdom')?'kingdom-district':'streetverse'}}))
  setStatus('Abracadabra Genii compiled: '+full)
 }
 return <section aria-label="StreetVerse RP Omnibar" style={{marginTop:7,padding:8,borderRadius:14,border:'1px solid #9d6bff66',background:'linear-gradient(160deg,#120b20ee,#07101aee)',color:'#fff'}}>
  <div style={{fontSize:9,fontWeight:950,letterSpacing:1.2,color:'#d9c2ff'}}>🧞 ABRACADABRA GENII • RP OMNIBAR</div>
  <div style={{display:'flex',gap:4,overflowX:'auto',marginTop:6,paddingBottom:3}}>{EMOJI.map(([e,q])=><button key={e+q} onClick={()=>wish(q,'emoji')} aria-label={q} style={chip}>{e}</button>)}</div>
  <div style={{display:'flex',gap:4,overflowX:'auto',marginTop:5,paddingBottom:3}}>{SFX.map(([e,q])=><button key={e+q} onClick={()=>wish(q,'sound')} title={q} style={{...chip,borderColor:'#67e8f966'}}>{e}<span style={{fontSize:7,marginLeft:3}}>{q}</span></button>)}</div>
  <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:5,marginTop:6}}>
   <input value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')wish('', 'text')}} placeholder="Make BJ pray + bell + close-up + Reel…" style={input}/>
   <button onClick={()=>wish('', 'scene')} style={magic}>✨ MAKE IT</button>
  </div>
  {preview&&<div style={{fontSize:8,color:'#a9b8c6',marginTop:5}}>FOUND • {preview.actions.length} actions • {preview.sounds.length} sounds • {preview.missingKinds.length?'MAKE: '+preview.missingKinds.join(', '):'nothing missing'}</div>}
  <div role="status" style={{fontSize:8,color:'#d8c9ff',marginTop:4}}>{status}</div>
  {!compact&&<div style={{fontSize:8,color:'#778899',marginTop:4}}>Reuses owned actions/SFX first. Missing original assets go to Mind Over Matter + HoloForge and remain review-gated before production publication.</div>}
 </section>
}
const chip:React.CSSProperties={minHeight:34,whiteSpace:'nowrap',borderRadius:9,border:'1px solid #9d6bff66',background:'#120f21',color:'#fff',padding:'0 8px',fontWeight:900}
const input:React.CSSProperties={minHeight:40,borderRadius:10,border:'1px solid #9d6bff66',background:'#050912',color:'#fff',padding:'0 10px',fontSize:10}
const magic:React.CSSProperties={minHeight:40,borderRadius:10,border:'1px solid #f2b630',background:'#3b2b08',color:'#fff1ad',fontWeight:950,padding:'0 12px'}