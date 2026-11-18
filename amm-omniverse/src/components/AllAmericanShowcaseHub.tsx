import { useState } from 'react'

type Target = 'studio'|'network'|'live'|'music'|'academy'|'stage'|'raymond'
const PROGRAM = [
  {name:'All American Showcase',detail:'Auditions, artist profiles, performances, filmmaker and producer collaboration, original talent programming.'},
  {name:'Soul Ascension',detail:'Original soul/R&B/funk dance-line and live performance concept. A spiritual and cultural evolution of the dance-show format, without asserting franchise affiliation.'},
  {name:'All American Awards',detail:'Creator showcase, red-carpet events, audience awards and juried excellence. No association with the Academy Awards implied.'}
]
const checkpoints=[
  'Artist and performer release signed',
  'Music composition, master and sync licenses cleared',
  'Minor performer guardian consent and child safety reviewed',
  'Filming location, appearance and privacy consent verified',
  'Stream and recording permissions, moderation and copyright review completed',
  'Ticket/refund, sponsor disclosure and payout agreements approved',
  'Captioning, one-hand control, audio description and low-bandwidth playback verified',
  'Official trademark/title clearance and legal review completed'
]
export default function AllAmericanShowcaseHub({onClose,onOpen}:{onClose:()=>void;onOpen:(target:Target)=>void}){
  const [view,setView] = useState<'program'|'rights'>('program')
  const btn:React.CSSProperties={background:'#1c3149',border:'1px solid #d0ad6a',borderRadius:14,padding:'14px 17px',minHeight:54,color:'#fff',fontWeight:800,fontSize:15,cursor:'pointer'}
  return <section role="dialog" aria-modal="true" aria-label="All American Showcase and Soul Ascension" style={{position:'fixed',inset:0,zIndex:2147483550,overflowY:'auto',background:'#100b18',color:'#fff',padding:'clamp(16px,4vw,38px)'}}>
    <main style={{maxWidth:800,margin:'0 auto',display:'grid',gap:16}}>
      <header style={{display:'flex',gap:12,justifyContent:'space-between',alignItems:'center'}}>
        <h1 style={{fontSize:27,margin:0}}>All American Showcase</h1>
        <button style={btn} onClick={onClose}>Close</button>
      </header>
      <p style={{fontSize:17,color:'#f4d7a6',margin:0}}>Soul Ascension · Next-generation soul, dance, music, storytelling and awards</p>
      <p style={{lineHeight:1.65}}>One production pipeline connected to your existing Star Studio, Isaiah AI TV, TRYAMM LIVE, music tools and All American University. This is a program-planning gateway, not proof that a broadcast, licensed music event or ticket service is currently live.</p>
      <nav aria-label="Showcase views" style={{display:'flex',gap:9,flexWrap:'wrap'}}><button style={btn} aria-pressed={view==='program'} onClick={()=>setView('program')}>Programs</button><button style={btn} aria-pressed={view==='rights'} onClick={()=>setView('rights')}>Production rights and safety</button></nav>
      {view==='program' ? <div style={{display:'grid',gap:12}}>{PROGRAM.map(item=><article key={item.name} style={{padding:15,border:'1px solid #6c5279',borderRadius:14,background:'#20142c'}}><h2 style={{margin:'0 0 8px',fontSize:19}}>{item.name}</h2><p style={{margin:0,lineHeight:1.65}}>{item.detail}</p></article>)}</div> :
      <div style={{display:'grid',gap:8}}><p style={{color:'#ffcca0'}}>Evidence status: not verified. This is an uncompleted release checklist, not a license registry.</p>{checkpoints.map((item,i)=><div key={item} style={{padding:12,border:'1px solid #584f67',borderRadius:10}}>{i+1}. {item} — Not verified</div>)}</div>}
      <h2 style={{fontSize:20,margin:'12px 0 0'}}>Connect existing production tools</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(205px,1fr))',gap:9}}>
        {([{id:'stage',label:'Soul Ascension Mobile RP Stage'},{id:'raymond',label:'Raymond Jarreau Website Preview'},{id:'studio',label:'Star Studio + Auditions'},{id:'network',label:'Isaiah AI TV + Network'},{id:'live',label:'TRYAMM LIVE Studio'},{id:'music',label:'Music Production'},{id:'academy',label:'All American University'}] as {id:Target;label:string}[]).map(item=><button key={item.id} style={btn} onClick={()=>onOpen(item.id)}>{item.label}</button>)}
      </div>
      <p style={{color:'#d7c5de',fontSize:12,lineHeight:1.6}}>Soul Ascension is an original proposed program and is not authorized or endorsed by the owners of the Soul Train trademark. Clear title, likeness and music rights before marketing a show.</p>
    </main>
  </section>
}
