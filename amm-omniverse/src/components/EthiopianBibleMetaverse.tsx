const lanes=[
 ['📖','ETHIOPIAN BIBLE STUDY','Reading plans, study notes, cross-references and teaching layers built around source-verified Ethiopian biblical texts and canon metadata.'],
 ['✡️','HEBREW SCHOOL','Alphabet, vowel points, roots, vocabulary, transliteration, pronunciation practice, quizzes and passage-based lessons.'],
 ['🔎','STRONG’S CONCORDANCE','Strong’s-number lookup for KJV-linked Hebrew and Greek words, with lemma, transliteration, gloss, root relationships and occurrence links when a verified concordance dataset is connected.'],
 ['👑','KING JAMES 1611 STUDY','A source-labeled 1611 KJV study lane with original-edition comparison, spelling-aware reading support, Apocrypha visibility and modern-readable comparison tools.'],
 ['📚','TRYAMM 88-BOOK CURRICULUM','A configurable 88-book learning collection. The app must display the exact manifest and source/edition for every included book rather than claiming one universal Ethiopian 88-book canon.'],
 ['🌍','METAVERSE BIBLE','Walkable study worlds for places, journeys, eras and teaching scenes. World scenes are educational visualizations, not claims that a reconstruction is historically exact.'],
 ['🎧','AUDIO + READ ALOUD','Accessible narration, chapter listening, adjustable speed and screen-reader friendly study controls.'],
 ['🌐','HOLOLingo','Translation-ready study UI with original-language/source labels preserved when verified text providers are connected.'],
 ['♿','HOLO ACCESS','Large text, high contrast, reduced motion, one-hand navigation, keyboard support, captions/transcripts and voice-ready controls.'],
 ['📝','KINGDOMS PRESS','Study guides, devotionals, teaching notes and HoloBook editions can move through the Kingdoms Press rights/editorial pipeline.'],
 ['⛪','SERVANTS OF CHRIST','Bible studies, reading plans, classes and LIVE teachings can publish into the ministry network with human review.'],
 ['🏙','STREETVERSE FAITH WORLD','Faith/community destinations, service missions and educational world portals can connect into StreetVerse without inventing real-world church locations.'],
]

const hebrewPath=[
 ['1','ALEPH-BET','Learn all Hebrew letters, final forms, names, sounds and right-to-left reading.'],
 ['2','VOWELS','Learn niqqud/vowel points, syllables and common reading patterns.'],
 ['3','ROOTS','Study three-consonant roots and how related words connect.'],
 ['4','STRONG’S','Open a KJV word → Strong’s number → Hebrew lemma → transliteration → gloss → root → occurrences.'],
 ['5','PASSAGE LAB','Compare KJV wording with source-language study data while keeping translation and commentary clearly separated.'],
 ['6','QUIZ + MEMORY','Flash cards, listening practice, matching, spelling and passage vocabulary review.'],
]

const integrity=[
 'SCRIPTURE TEXT — exact source/edition',
 'HEBREW / GREEK LEMMA — lexical source',
 'STRONG’S ENTRY — concordance metadata',
 'TRANSLITERATION — learner aid',
 'COMMENTARY — named human/source commentary',
 'AI EXPLANATION — clearly generated assistance',
]

export default function EthiopianBibleMetaverse(){
 return <main style={{minHeight:'100vh',padding:'26px 16px 90px',background:'radial-gradient(circle at top,#402b12,#100d08 42%,#020303)',color:'#fff',fontFamily:'system-ui,sans-serif'}}>
  <div style={{maxWidth:1120,margin:'0 auto'}}>
   <nav style={{display:'flex',gap:8,flexWrap:'wrap'}}><a href='/' style={pill}>TRYAMM HOME</a><a href='/servants-of-christ' style={pill}>SERVANTS OF CHRIST</a><a href='/kingdoms-press' style={pill}>KINGDOMS PRESS</a><a href='/streetverse' style={pill}>STREETVERSE</a><a href='/accessibility' style={pill}>ACCESSIBILITY</a></nav>
   <header style={{padding:'58px 0 26px'}}><div style={{fontSize:11,letterSpacing:3,fontWeight:950,color:'#e5c56a'}}>TRYAMM FAITH WORLD • SOURCE-VERIFIED STUDY</div><h1 style={{fontSize:'clamp(42px,8vw,88px)',lineHeight:.94,margin:'10px 0 16px'}}>ETHIOPIAN BIBLE<br/>METAVERSE</h1><p style={{maxWidth:900,fontSize:18,lineHeight:1.65,color:'#d9cfb3'}}>An immersive Bible-study school combining Ethiopian biblical tradition, Hebrew learning, KJV 1611 comparison, Strong’s-style concordance study, accessibility, teaching, translation and living-world exploration. Exact canon lists, translations and scripture text must come from verified/licensed or public-domain sources and remain clearly identified by edition.</p></header>

   <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(235px,1fr))',gap:12}}>{lanes.map(([icon,title,copy])=><article key={title} style={card}><div style={{fontSize:28}}>{icon}</div><h2 style={{fontSize:17}}>{title}</h2><p style={muted}>{copy}</p></article>)}</section>

   <section style={{...card,marginTop:18,borderColor:'#8d7435'}}><div style={{fontSize:11,letterSpacing:2,color:'#e5c56a',fontWeight:900}}>TEACH PEOPLE HEBREW</div><h2>Hebrew learning path</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10}}>{hebrewPath.map(([n,title,copy])=><article key={title} style={{...card,background:'#0b0a06'}}><div style={{color:'#e5c56a',fontWeight:950}}>LESSON {n}</div><h3>{title}</h3><p style={muted}>{copy}</p></article>)}</div></section>

   <section style={{...card,marginTop:18}}><h2 style={{marginTop:0}}>Strong’s study flow</h2><p style={muted}>KJV WORD → STRONG’S NUMBER → HEBREW / GREEK LEMMA → TRANSLITERATION → PRONUNCIATION → GLOSS → ROOT / RELATED WORDS → OTHER OCCURRENCES → NOTES → QUIZ</p><p style={{...muted,fontSize:13}}>Strong’s indexing should be used where the concordance actually maps to the KJV text. Ethiopian-canon books outside that dataset need their own source-specific lexical indexing instead of fabricated Strong’s numbers.</p></section>

   <section style={{...card,marginTop:18}}><h2 style={{marginTop:0}}>88-book curriculum manifest</h2><p style={muted}>The curriculum target is 88 books, but the production app will not hide or guess the list. Each book entry must include: canonical/tradition label, book title, language, edition/translation, rights status, chapters, audio availability and lexical-study availability. This lets your chosen 88-book program remain explicit and auditable.</p></section>

   <section style={{...card,marginTop:18}}><h2 style={{marginTop:0}}>Study world architecture</h2><p style={muted}>BOOK → CHAPTER → VERSE / PASSAGE → HEBREW / GREEK WORD STUDY → STRONG’S / LEXICON → NOTES → MAP / TIMELINE → AUDIO → TEACHING → QUIZ → DISCUSSION → LIVE CLASS → HOLOBOOK / STUDY GUIDE → STREETVERSE WORLD PORTAL</p></section>

   <section style={{...card,marginTop:14,borderColor:'#947c31',background:'#181408'}}><h2 style={{marginTop:0}}>Content integrity gate</h2><p style={{...muted,color:'#ffe9a4'}}>TRYAMM should never silently mix Bible editions, translations or canon traditions. Every study card identifies what kind of material the learner is seeing.</p><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{integrity.map(x=><span key={x} style={pill}>{x}</span>)}</div></section>
  </div>
 </main>
}
const card={border:'1px solid #55472c',borderRadius:18,padding:18,background:'#110f09d9'} as const
const pill={display:'inline-block',padding:'10px 13px',border:'1px solid #76623a',borderRadius:999,background:'#1a150c',color:'#fff',fontWeight:900,textDecoration:'none'} as const
const muted={color:'#d9cfb3',lineHeight:1.6} as const
