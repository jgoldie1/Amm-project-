const lanes=[
 ['📖','ETHIOPIAN BIBLE STUDY','Reading plans, study notes, cross-references and teaching layers built around source-verified Ethiopian biblical texts and canon metadata.'],
 ['🌍','METAVERSE BIBLE','Walkable study worlds for places, journeys, eras and teaching scenes. World scenes are educational visualizations, not claims that a reconstruction is historically exact.'],
 ['🎧','AUDIO + READ ALOUD','Accessible narration, chapter listening, adjustable speed and screen-reader friendly study controls.'],
 ['🌐','HOLOLingo','Translation-ready study UI with original-language/source labels preserved when verified text providers are connected.'],
 ['♿','HOLO ACCESS','Large text, high contrast, reduced motion, one-hand navigation, keyboard support, captions/transcripts and voice-ready controls.'],
 ['📝','KINGDOMS PRESS','Study guides, devotionals, teaching notes and HoloBook editions can move through the Kingdoms Press rights/editorial pipeline.'],
 ['⛪','SERVANTS OF CHRIST','Bible studies, reading plans, classes and LIVE teachings can publish into the ministry network with human review.'],
 ['🏙','STREETVERSE FAITH WORLD','Faith/community destinations, service missions and educational world portals can connect into StreetVerse without inventing real-world church locations.'],
]

export default function EthiopianBibleMetaverse(){
 return <main style={{minHeight:'100vh',padding:'26px 16px 90px',background:'radial-gradient(circle at top,#402b12,#100d08 42%,#020303)',color:'#fff',fontFamily:'system-ui,sans-serif'}}>
  <div style={{maxWidth:1120,margin:'0 auto'}}>
   <nav style={{display:'flex',gap:8,flexWrap:'wrap'}}><a href='/' style={pill}>TRYAMM HOME</a><a href='/servants-of-christ' style={pill}>SERVANTS OF CHRIST</a><a href='/kingdoms-press' style={pill}>KINGDOMS PRESS</a><a href='/streetverse' style={pill}>STREETVERSE</a><a href='/accessibility' style={pill}>ACCESSIBILITY</a></nav>
   <header style={{padding:'58px 0 26px'}}><div style={{fontSize:11,letterSpacing:3,fontWeight:950,color:'#e5c56a'}}>TRYAMM FAITH WORLD • SOURCE-VERIFIED STUDY</div><h1 style={{fontSize:'clamp(42px,8vw,88px)',lineHeight:.94,margin:'10px 0 16px'}}>ETHIOPIAN BIBLE<br/>METAVERSE</h1><p style={{maxWidth:850,fontSize:18,lineHeight:1.65,color:'#d9cfb3'}}>An immersive Bible-study world designed around Ethiopian biblical tradition, accessibility, teaching, translation and living-world exploration. Exact canon lists, translations and scripture text must come from verified/licensed or public-domain sources and remain clearly identified by edition.</p></header>
   <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(235px,1fr))',gap:12}}>{lanes.map(([icon,title,copy])=><article key={title} style={card}><div style={{fontSize:28}}>{icon}</div><h2 style={{fontSize:17}}>{title}</h2><p style={muted}>{copy}</p></article>)}</section>
   <section style={{...card,marginTop:18}}><h2 style={{marginTop:0}}>Study world architecture</h2><p style={muted}>BOOK → CHAPTER → VERSE / PASSAGE → NOTES → MAP / TIMELINE → AUDIO → TEACHING → DISCUSSION → LIVE CLASS → HOLOBOOK / STUDY GUIDE → STREETVERSE WORLD PORTAL</p></section>
   <section style={{...card,marginTop:14,borderColor:'#947c31',background:'#181408'}}><h2 style={{marginTop:0}}>Content integrity gate</h2><p style={{...muted,color:'#ffe9a4'}}>TRYAMM should never silently mix Bible editions, translations or canon traditions. Every text surface should identify source, edition, language and rights status. AI study assistance must distinguish scripture text from commentary and generated explanation.</p></section>
  </div>
 </main>
}
const card={border:'1px solid #55472c',borderRadius:18,padding:18,background:'#110f09d9'} as const
const pill={display:'inline-block',padding:'10px 13px',border:'1px solid #76623a',borderRadius:999,background:'#1a150c',color:'#fff',fontWeight:900,textDecoration:'none'} as const
const muted={color:'#d9cfb3',lineHeight:1.6} as const
