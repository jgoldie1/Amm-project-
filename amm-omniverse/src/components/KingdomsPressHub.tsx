const stages=['AUTHOR','EDIT','RIGHTS','ACCESSIBILITY','TRANSLATION','FORMAT','PRINT / EBOOK / AUDIO','HOLOBOOK','PUBLISH','BOOK CLUB','AUTHOR EVENT','AI CAFE / LIVING WORLD','TRYAMM LIVE','ALL AMERICAN NETWORK','SALES / ROYALTY GATE']

export default function KingdomsPressHub(){
 return <main style={{minHeight:'100vh',padding:'28px 18px 100px',background:'radial-gradient(circle at top,#3b2418,#130d0a 45%,#050505)',color:'#fff',fontFamily:'system-ui,sans-serif'}}>
  <div style={{maxWidth:1120,margin:'0 auto'}}>
   <div style={{fontSize:12,fontWeight:950,letterSpacing:2,color:'#f0c27b'}}>TRYAMM PUBLISHING • KINGDOMS PRESS</div>
   <h1 style={{fontSize:'clamp(42px,8vw,84px)',lineHeight:.95,margin:'10px 0 14px'}}>KINGDOMS PRESS</h1>
   <p style={{maxWidth:850,fontSize:18,lineHeight:1.6,color:'#e0cdbd'}}>A creator-owned publishing pipeline connecting books, audiobooks, accessible editions, translations, HoloBooks, book clubs, author events, AI Café experiences, TRYAMM LIVE, All American Network distribution and verified royalties.</p>
   <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'18px 0'}}><a href='/workstation' style={pill}>CREATE / PUBLISH</a><a href='/live' style={pill}>AUTHOR LIVE</a><a href='/network' style={pill}>ALL AMERICAN NETWORK</a><a href='/omni-cash' style={pill}>OMNI CASH</a><a href='/accessibility' style={pill}>ACCESSIBILITY</a></div>
   <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10}}>{stages.map((s,i)=><article key={s} style={card}><div style={{fontSize:11,color:'#f0c27b',fontWeight:900}}>STEP {i+1}</div><strong>{s}</strong></article>)}</section>
   <section style={{...card,marginTop:18}}><h2 style={{marginTop:0}}>Creator economy</h2><p style={muted}>Book and audiobook sales, memberships, event tickets, merchandise and licensed adaptations can feed a verified creator ledger. Royalties become payable only after rights, refunds, provider settlement and split rules are verified.</p></section>
   <section style={{...card,marginTop:14}}><h2 style={{marginTop:0}}>Rights and adaptations</h2><p style={muted}>A successful book can become a Holo Drama series, Spectra studio project, audiobook, LIVE event, StreetVerse story world, classroom resource or licensed product only when the author/publisher has the required rights.</p></section>
   <section style={{...card,marginTop:14,borderColor:'#8c742f',background:'#1a160a'}}><strong>PRODUCTION GATE</strong><p style={{...muted,color:'#ffe6a8'}}>Print fulfillment, ISBN/metadata registration, retail distribution, audiobook stores and third-party rights/licensing remain provider-gated until verified partners are connected.</p></section>
  </div>
 </main>
}
const card={padding:17,border:'1px solid #5b4638',borderRadius:16,background:'#140e0bcc'} as const
const pill={display:'inline-block',padding:'10px 13px',border:'1px solid #8a674d',borderRadius:999,background:'#21150f',color:'#fff',fontWeight:900,textDecoration:'none'} as const
const muted={color:'#e0cdbd',lineHeight:1.6} as const
