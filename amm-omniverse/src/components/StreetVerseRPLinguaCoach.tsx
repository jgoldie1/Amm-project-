import {useMemo,useState} from 'react'

const TERMS=[
 {term:'IC',label:'IN CHARACTER',meaning:'You are speaking or acting as your StreetVerse character inside the story.'},
 {term:'OOC',label:'OUT OF CHARACTER',meaning:'You are speaking as yourself, outside the role-play story.'},
 {term:'EMOTE',label:'EMOTE / ACTION',meaning:'Describe a safe character action, expression, pose or reaction instead of only dialogue.'},
 {term:'SCENE',label:'SCENE',meaning:'A shared role-play moment with a place, people, goal and beginning/end.'},
 {term:'LORE',label:'LORE',meaning:'The established history, people, places and rules of the StreetVerse world.'},
 {term:'CANON',label:'CANON',meaning:'Story events that count as official history for this character or world.'},
 {term:'CONSENT',label:'CONSENT CHECK',meaning:'Ask before entering private, intense or mature role-play. Respect stop, leave, block and report.'},
 {term:'DROP-IN',label:'DROP-IN',meaning:'Request permission to spawn near another player. The other player must accept.'},
 {term:'CREW',label:'CREW',meaning:'A player group that can travel, create, compete or run missions together.'},
 {term:'MISSION',label:'MISSION',meaning:'A structured objective with checkpoints, consequences and verified rewards.'},
 {term:'TRADE',label:'TRADE',meaning:'Exchange an item or service only through the game transaction flow; do not self-award value.'},
 {term:'SAFE ZONE',label:'SAFE ZONE',meaning:'A place where combat or high-intensity role-play is restricted and players can regroup.'},
 {term:'FADE',label:'FADE TO BLACK',meaning:'Skip private or mature details and resume after the scene without explicit depiction.'},
 {term:'REPORT',label:'REPORT / MOD',meaning:'Use moderation tools when another player breaks rules, harasses, scams or ignores boundaries.'},
] as const

export default function StreetVerseRPLinguaCoach(){
 const [open,setOpen]=useState(false)
 const [query,setQuery]=useState('')
 const [selected,setSelected]=useState<(typeof TERMS)[number]|null>(null)
 const terms=useMemo(()=>TERMS.filter(t=>(t.term+' '+t.label+' '+t.meaning).toLowerCase().includes(query.toLowerCase())),[query])
 const teach=(term:(typeof TERMS)[number])=>{setSelected(term);window.dispatchEvent(new CustomEvent('tryamm:translation-request',{detail:{sourceTag:'en-US',targetTag:navigator.language||'en-US',preferred:['captions','text','speech'],contentType:'rp-lingua'}}));window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:`${term.label}. ${term.meaning}`}}))}
 return <>
  <button aria-expanded={open} aria-label="Open RP Lingua coach" onClick={()=>setOpen(v=>!v)} style={{position:'fixed',left:96,top:108,zIndex:42050,minWidth:72,minHeight:44,borderRadius:12,border:'1px solid #b58cff88',background:'#151024dd',color:'#fff',font:'950 9px system-ui'}}>💬 RP</button>
  {open&&<section aria-label="StreetVerse RP Lingua coach" style={{position:'fixed',left:10,right:10,bottom:'max(12px,env(safe-area-inset-bottom))',zIndex:42070,maxHeight:'58vh',overflow:'auto',padding:12,borderRadius:18,background:'#0a0812f5',border:'1px solid #b58cff77',color:'#fff',fontFamily:'system-ui',boxShadow:'0 18px 50px #000d'}}>
   <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><div><b>RP LINGUA • STREETVERSE 101</b><div style={{fontSize:10,opacity:.72}}>Plain language first • translation/sign routing when certified</div></div><button onClick={()=>setOpen(false)} aria-label="Close RP Lingua" style={btn}>×</button></div>
   <input value={query} onChange={e=>setQuery(e.target.value)} aria-label="Search role-play terms" placeholder="Search IC, OOC, consent, crew…" style={{width:'100%',boxSizing:'border-box',minHeight:44,marginTop:10,borderRadius:11,border:'1px solid #51466b',background:'#100d19',color:'#fff',padding:'0 11px'}}/>
   {selected&&<div aria-live="polite" style={{marginTop:9,padding:10,borderRadius:12,background:'#211a34',border:'1px solid #b58cff66'}}><b>{selected.label}</b><div style={{fontSize:11,lineHeight:1.45,marginTop:4}}>{selected.meaning}</div></div>}
   <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7,marginTop:10}}>{terms.map(term=><button key={term.term} onClick={()=>teach(term)} style={{...btn,minHeight:58,textAlign:'left'}}><b>{term.term}</b><span style={{display:'block',fontSize:8,opacity:.68,marginTop:3}}>{term.label}</span></button>)}</div>
  </section>}
 </>
}
const btn:React.CSSProperties={minHeight:40,borderRadius:10,border:'1px solid #7b69a1',background:'#171225',color:'#fff',fontWeight:900,padding:'7px 10px'}
