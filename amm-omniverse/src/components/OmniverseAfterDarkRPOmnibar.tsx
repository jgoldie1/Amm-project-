import {useMemo,useState} from 'react'
import {AFTER_DARK_EMOJI_TOKENS,AFTER_DARK_SCENE_TEMPLATES,classifyAfterDarkIntent} from '../data/OmniverseAfterDarkRP'

export default function OmniverseAfterDarkRPOmnibar({ageVerified,consentAccepted}:{ageVerified:boolean;consentAccepted:boolean}){
 const [prompt,setPrompt]=useState('')
 const [makeReel,setMakeReel]=useState(true)
 const [makeTv,setMakeTv]=useState(false)
 const [privateSession,setPrivateSession]=useState(false)
 const [status,setStatus]=useState('Adult-only mature storytelling. Non-explicit scenes; intimate moments fade to black.')
 const intents=useMemo(()=>classifyAfterDarkIntent(prompt),[prompt])
 const add=(token:string)=>setPrompt(p=>(p+' '+token).trim())
 const create=()=>{
  if(!ageVerified||!consentAccepted){setStatus('Age assurance and active consent are required.');return}
  if(!prompt.trim()){setStatus('Describe the mature RP scene first.');return}
  window.dispatchEvent(new CustomEvent('tryamm:after-dark-story-request',{detail:{prompt,ageVerified:true,consentAccepted:true,privateSession,createReel:makeReel,createTvEpisode:makeTv}}))
  setStatus('After Dark story compiled. Reel/TV outputs are drafts until reviewed and published.')
 }
 return <section aria-label="Omniverse After Dark RP Studio" style={panel}>
  <div style={{fontSize:9,letterSpacing:1.5,color:'#ff9bdc',fontWeight:950}}>🌙 OMNIVERSE AFTER DARK • 18+ RP STORY STUDIO</div>
  <div style={{fontSize:8,color:'#b9a6b5',marginTop:4}}>Separate from StreetVerse. Adult-coded emoji/GIF intent is allowed here, but explicit sex-act animation and pornographic GIF generation are not.</div>
  <div style={{display:'flex',gap:4,overflowX:'auto',marginTop:7,paddingBottom:3}}>{AFTER_DARK_EMOJI_TOKENS.map(t=><button key={t.emoji+t.label} onClick={()=>add(t.emoji)} title={t.meaning} style={chip}>{t.emoji}</button>)}</div>
  <div style={{display:'flex',gap:4,overflowX:'auto',marginTop:6}}>{AFTER_DARK_SCENE_TEMPLATES.map(t=><button key={t.id} onClick={()=>add(t.label)} style={{...chip,fontSize:8}}>{t.label}</button>)}</div>
  <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Example: nightclub date, playful flirting, couple dance, relationship twist, kiss, fade to black, next-morning scene…" style={textarea}/>
  <div style={{fontSize:8,color:'#9a89a1',marginTop:4}}>INTENT: {intents.join(' • ')}</div>
  <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:7}}>
   <label style={toggle}><input type="checkbox" checked={makeReel} onChange={e=>setMakeReel(e.target.checked)}/> REEL</label>
   <label style={toggle}><input type="checkbox" checked={makeTv} onChange={e=>setMakeTv(e.target.checked)}/> TV EPISODE</label>
   <label style={toggle}><input type="checkbox" checked={privateSession} onChange={e=>setPrivateSession(e.target.checked)}/> PRIVATE SESSION AUDIO</label>
  </div>
  <button onClick={create} disabled={!ageVerified||!consentAccepted} style={{...createBtn,opacity:ageVerified&&consentAccepted?1:.45}}>🎬 ACT OUT / CREATE STORY</button>
  <div role="status" style={{fontSize:8,color:'#ffd1ec',marginTop:5}}>{status}</div>
 </section>
}
const panel:React.CSSProperties={marginTop:12,padding:10,borderRadius:16,border:'1px solid #c66aa766',background:'linear-gradient(160deg,#190c18,#090711)',color:'#fff'}
const chip:React.CSSProperties={minWidth:38,minHeight:36,borderRadius:9,border:'1px solid #c66aa766',background:'#1d101d',color:'#fff',fontWeight:900,padding:'0 8px',whiteSpace:'nowrap'}
const textarea:React.CSSProperties={width:'100%',minHeight:82,marginTop:8,borderRadius:10,border:'1px solid #7f496b',background:'#08060b',color:'#fff',padding:9,fontSize:10,resize:'vertical'}
const toggle:React.CSSProperties={fontSize:8,padding:'6px 8px',borderRadius:999,border:'1px solid #5e3a55',background:'#120b12'}
const createBtn:React.CSSProperties={width:'100%',minHeight:42,marginTop:8,borderRadius:10,border:'1px solid #ff93d2',background:'#421635',color:'#fff',fontWeight:950}