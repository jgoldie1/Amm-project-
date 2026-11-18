import {lazy,Suspense,useEffect,useState,type CSSProperties} from 'react'
const FaithHoloBook = lazy(() => import('./FaithHoloBook'))
const FaithScriptureReader = lazy(() => import('./FaithScriptureReader'))
const FaithVerseWebReader = lazy(() => import('./FaithVerseWebReader'))
const FaithVerseLanguageAcademy = lazy(() => import('./FaithVerseLanguageAcademy'))
const FaithVerseScrollsApocrypha = lazy(() => import('./FaithVerseScrollsApocrypha'))
const FaithVerseBusinessFunnel = lazy(() => import('./FaithVerseBusinessFunnel'))
const FaithChronoLauncher = lazy(() => import('./FaithChronoLauncher'))
const FaithGalileeRoleplay = lazy(() => import('./FaithGalileeRoleplay'))
const FaithVerseMiraclesTheater = lazy(() => import('./FaithVerseMiraclesTheater'))
const EthiopianBibleMetaverse = lazy(() => import('./EthiopianBibleMetaverse'))
import {validateBibleEdition,type BibleEdition} from '../runtime/FaithVerseBibleEdition'

type Passage={id:string;reference:string;text:string;chapter:string}
const PASSAGES:readonly Passage[]=[
 {id:'genesis-1-1',reference:'Genesis 1:1',chapter:'Creation',text:'In the beginning God created the heaven and the earth.'},
 {id:'psalm-23-1',reference:'Psalm 23:1',chapter:'Psalms',text:'The LORD is my shepherd; I shall not want.'},
 {id:'matthew-6-33',reference:'Matthew 6:33',chapter:'Kingdom',text:'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.'},
 {id:'matthew-28-19',reference:'Matthew 28:19',chapter:'Mission',text:'Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:'},
 {id:'matthew-28-20',reference:'Matthew 28:20',chapter:'Mission',text:'Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the world. Amen.'},
 {id:'john-1-1',reference:'John 1:1',chapter:'Word',text:'In the beginning was the Word, and the Word was with God, and the Word was God.'},
 {id:'peter-4-10',reference:'1 Peter 4:10',chapter:'Service',text:'As every man hath received the gift, even so minister the same one to another, as good stewards of the manifold grace of God.'},
 {id:'corinthians-4-2',reference:'1 Corinthians 4:2',chapter:'Stewardship',text:'Moreover it is required in stewards, that a man be found faithful.'}
]
// Short KJV excerpts, public domain in the US. This is not a complete Bible text.
const KEY='tryamm:faithverse:bible:bookmark:v1'
type Tab='landing'|'read'|'web'|'chapters'|'study'|'languages'|'scrolls'|'chrono'|'miracles'|'immersive'|'world'|'press'|'library'|'edition'
function readBookmark(){try{return localStorage.getItem(KEY)||'matthew-6-33'}catch{return'matthew-6-33'}}
export default function FaithVerseBibleHub({onClose,onOpenFaith,onOpenPress}:{onClose:()=>void;onOpenFaith:()=>void;onOpenPress:()=>void}){
 const [tab,setTab]=useState<Tab>('landing')
 const [showGalilee,setShowGalilee]=useState(false)
 useEffect(()=>{window.dispatchEvent(new CustomEvent('tryamm:world-portal',{detail:{to:'faithverse',source:'faithverse-bible',nonFinancial:true}}))},[])
 const [selected,setSelected]=useState(readBookmark)
 const [large,setLarge]=useState(false)
 const [query,setQuery]=useState('')
 const [edition,setEdition]=useState<BibleEdition|null>(null)
 const [bookIndex,setBookIndex]=useState(0)
 const [chapterIndex,setChapterIndex]=useState(0)
 const [notice,setNotice]=useState('A few verified KJV passages are available offline. Complete canonical editions are not yet imported.')
 const passage=PASSAGES.find(p=>p.id===selected)||PASSAGES[0]
 const btn:CSSProperties={minHeight:56,borderRadius:14,padding:'12px 16px',border:'1px solid #a9c8dc',background:'#132a40',color:'#fff',fontSize:16,fontWeight:800,cursor:'pointer',touchAction:'manipulation'}
 const speak=()=>{
  if(!('speechSynthesis'in window)){setNotice('This browser does not support read-aloud.');return}
  window.speechSynthesis.cancel()
  const utterance=new SpeechSynthesisUtterance(passage.reference+'. '+passage.text)
  utterance.lang='en-US';utterance.rate=.9
  window.speechSynthesis.speak(utterance)
  setNotice('Reading selected passage using the device voice; no audio is uploaded.')
 }
 useEffect(()=>()=>{if('speechSynthesis'in window)window.speechSynthesis.cancel()},[])
 const bookmark=()=>{try{localStorage.setItem(KEY,passage.id);setNotice('Bookmark saved on this device. Cloud sync is not verified.')}catch{setNotice('Device storage unavailable; bookmark not saved.')}}
 const importEdition=async(file:File|undefined)=>{
  if(!file)return
  if(file.size>15*1024*1024){setNotice('Edition exceeds 15 MB. Split volumes or use an approved managed publication source.');return}
  try{const data=JSON.parse(await file.text());const valid=validateBibleEdition(data)
   if(!valid.ok||!valid.edition){setNotice('Edition rejected: '+valid.errors.join('; '));return}
   setEdition(valid.edition);setBookIndex(0);setChapterIndex(0);setTab('edition')
   setNotice('Loaded '+valid.edition.title+' into this browser session. Publisher rights and accuracy still require independent review. No text uploaded.')
  }catch{setNotice('Invalid JSON file. Use a documented rights-cleared book/chapter/verse edition.')}
 }
 const filtered=PASSAGES.filter(p=>(p.reference+' '+p.chapter+' '+p.text).toLowerCase().includes(query.toLowerCase()))
 return <section role="dialog" aria-modal="true" aria-label="FaithVerse Metaverse Bible and Kingdoms Press" style={{position:'fixed',inset:0,zIndex:2147483600,background:'#07101b',color:'#fff',overflowY:'auto',padding:'max(16px,env(safe-area-inset-top)) 14px max(32px,env(safe-area-inset-bottom))'}}>
 <main style={{maxWidth:790,margin:'0 auto',display:'grid',gap:14}}>
 <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:15}}><div><div style={{fontSize:12,color:'#e9cf9b',letterSpacing:2,fontWeight:900}}>TRYAMM · KINGDOMS PRESS</div><h1 style={{fontSize:29,margin:'4px 0'}}>FaithVerse · Metaverse Bible</h1></div><button style={btn} onClick={onClose}>Close</button></header>
 <p style={{fontSize:14,color:'#d2dbeb',lineHeight:1.6,margin:0}}>One accessible reading and roleplay entrance connected to the existing Faith Realm and Kingdoms Press publishing tools.</p>
 <p role="status" aria-live="polite" style={{background:'#222d35',borderRadius:12,padding:12,lineHeight:1.55,margin:0}}>{notice}</p>
 <nav aria-label="FaithVerse sections" style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>
 {(['landing','web','read','chapters','study','languages','scrolls','chrono','miracles','immersive','world','press','library','edition'] as Tab[]).map(k=><button key={k} style={{...btn,background:tab===k?'#435d64':'#132a40'}} aria-pressed={tab===k} onClick={()=>setTab(k)}>{k==='landing'?'Start Here · Study':k==='web'?'Full WEB Bible':k==='read'?'Starter Verses':k==='chapters'?'Full KJV Chapters':k==='study'?'Ethiopian Canon + 88':k==='languages'?'Paleo-Hebrew · Strong’s':k==='scrolls'?'Dead Sea Scrolls + Apocrypha':k==='chrono'?'Time Machine · Yeshua & Fishing':k==='miracles'?'Miracles · Walk on Water':k==='immersive'?'Metaverse Bible World':k==='world'?'FaithVerse RP':k==='press'?'Kingdoms Press':k==='library'?'Edition Library':'Import & Read Edition'}</button>)}
 </nav>
 {tab==='read'&&<section style={{display:'grid',gap:12}}>
 <label htmlFor="tryamm-bible-search">Find a passage in the available starter selections</label>
 <input id="tryamm-bible-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Reference or words" style={{fontSize:18,minHeight:54,padding:12,borderRadius:12,color:'#fff',background:'#12283b',border:'1px solid #8dacc4'}}/>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(135px,1fr))',gap:7}}>{filtered.map(p=><button key={p.id} style={{...btn,background:selected===p.id?'#466f75':'#132a40',minHeight:52}} onClick={()=>setSelected(p.id)} aria-pressed={selected===p.id}>{p.reference}</button>)}</div>
 {filtered.length===0&&<p>No match among the starter passages. Complete text search requires a verified licensed/public-domain Bible corpus.</p>}
 <article style={{border:'1px solid #749a91',background:'#102a30',borderRadius:17,padding:20}}>
 <div style={{fontSize:12,color:'#eacb83'}}>King James Version · Starter excerpts</div><h2 style={{fontSize:23}}>{passage.reference}</h2>
 <blockquote style={{fontSize:large?25:20,lineHeight:1.7,margin:'12px 0'}}>{passage.text}</blockquote>
 <p style={{color:'#c1d9cf',fontSize:12}}>For study and accessibility. Excerpts are not the complete chapter.</p></article>
 <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:9}}><button style={btn} onClick={speak}>Read aloud</button><button style={btn} onClick={()=>{window.speechSynthesis?.cancel();setNotice('Read-aloud stopped.')}}>Stop voice</button><button style={btn} onClick={bookmark}>Save bookmark</button><button style={btn} onClick={()=>setLarge(v=>!v)}>{large?'Standard text':'Large text'}</button></div>
 </section>}
 {tab==='landing'&&<Suspense fallback={<p>Loading the FaithVerse learning entrance…</p>}><FaithVerseBusinessFunnel onOpenBible={()=>setTab('chapters')} onOpenHebrew={()=>setTab('languages')} onOpenScrolls={()=>setTab('scrolls')} onOpenPress={onOpenPress}/></Suspense>}
 {tab==='scrolls'&&<Suspense fallback={<p>Loading Dead Sea Scrolls and Apocrypha study…</p>}><FaithVerseScrollsApocrypha onOpenHoloBook={()=>setTab('study')}/></Suspense>}
 {tab==='web'&&<section aria-label="World English Bible full edition"><Suspense fallback={<p>Loading full-edition reader…</p>}><FaithVerseWebReader onOpenPress={onOpenPress} /></Suspense></section>}
 {tab==='chapters'&&<section aria-label="Existing complete chapter reader"><p style={{lineHeight:1.6}}>Existing live KJV chapter reader. Chapters load from its existing Bible API when internet access is available; offline text packs are a separate import.</p><Suspense fallback={<p>Loading chapter reader…</p>}><FaithScriptureReader /></Suspense></section>}
 {tab==='study'&&<section aria-label="Existing Ethiopian canon and study layers"><Suspense fallback={<p>Loading existing FaithVerse HoloBook…</p>}><FaithHoloBook /></Suspense></section>}
 {tab==='languages'&&<section aria-label="Paleo-Hebrew Strong's and etymology classroom"><Suspense fallback={<p>Loading Hebrew language classroom…</p>}><FaithVerseLanguageAcademy onOpenHoloBook={()=>setTab('study')} /></Suspense></section>}
 {tab==='chrono'&&<Suspense fallback={<p>Loading existing Faith Chrono portal…</p>}><FaithChronoLauncher onOpenGalilee={()=>setShowGalilee(true)} /></Suspense>}
 {showGalilee&&<Suspense fallback={<p>Loading Galilee fishing mission…</p>}><FaithGalileeRoleplay onClose={()=>setShowGalilee(false)} onOpenScripture={()=>{setShowGalilee(false);setTab('chapters')}} onReturnStreetVerse={()=>{window.location.href='/streetverse'}} /></Suspense>}
 {tab==='miracles'&&<Suspense fallback={<p>Loading the Gospel miracle stories…</p>}><FaithVerseMiraclesTheater onOpenBible={()=>setTab('chapters')} onReturnToGalilee={()=>setTab('chrono')}/></Suspense>}
 {tab==='immersive'&&<section aria-label="Original Ethiopian Bible Metaverse"><Suspense fallback={<p>Loading existing Bible Metaverse…</p>}><EthiopianBibleMetaverse /></Suspense></section>}
 {tab==='world'&&<section style={{display:'grid',gap:12,lineHeight:1.65}}><h2 style={{fontSize:23}}>Continue your existing FaithVerse world</h2><p>The existing Faith Realm has sanctuary, prayer, ministry and other roleplay views. The StreetVerse Faith Chrono portal also points to Metaverse Bible. The next milestone is verifying the entire StreetVerse-to-FaithVerse handoff and save/reload.</p><button style={btn} onClick={onOpenFaith}>Open existing Faith Realm</button><p>FaithVerse conversations, prayers, donations and ministry activity must respect participants' privacy and consent. No claims of real human ministry moderation or permanent cloud storage until verified.</p></section>}
 {tab==='press'&&<section style={{display:'grid',gap:12,lineHeight:1.65}}><h2>Kingdoms Press publishing</h2><p>Open the existing editorial rights, translation, accessibility, print editions, royalty and author-event module. Its operations require configured Supabase and an authenticated user. They are not automatically complete when you open this page.</p><button style={btn} onClick={onOpenPress}>Open existing Kingdoms Press</button><p>Before publishing the complete Metaverse Bible, verify the text edition's rights, canonical table of contents, scripture source, editorial review, cross-references, audio licensing and print/export proof.</p></section>}
 {tab==='edition'&&<section style={{display:'grid',gap:12,lineHeight:1.7}}><h2>Full edition reader (local import)</h2><p>Import only a complete public-domain or publisher-approved JSON Bible edition with title, language, source, rights and books containing chapters of verse strings. Content is held in this browser session only; no server upload or permanent storage.</p><label htmlFor="faithverse-import">Select rights-cleared edition JSON file</label><input type="file" id="faithverse-import" accept=".json,application/json" onChange={e=>void importEdition(e.target.files?.[0])} style={{minHeight:56,fontSize:16}} />
 {edition&&<><p><strong>{edition.title}</strong> · {edition.language} · Source: {edition.source} · Rights statement: {edition.rights} (unverified)</p><label htmlFor="faith-book">Book</label><select id="faith-book" value={bookIndex} onChange={e=>{setBookIndex(Number(e.target.value));setChapterIndex(0)}} style={{...btn}}>{edition.books.map((b,i)=><option key={i} value={i}>{b.name}</option>)}</select><label htmlFor="faith-chapter">Chapter</label><select id="faith-chapter" value={chapterIndex} onChange={e=>setChapterIndex(Number(e.target.value))} style={{...btn}}>{edition.books[bookIndex].chapters.map((_,i)=><option key={i} value={i}>Chapter {i+1}</option>)}</select><article style={{background:'#102a30',border:'1px solid #749a91',borderRadius:15,padding:18}}><h3>{edition.books[bookIndex].name} {chapterIndex+1}</h3>{edition.books[bookIndex].chapters[chapterIndex].map((verse,i)=><p key={i} style={{fontSize:large?23:19,lineHeight:1.65}}><small style={{color:'#e9cb90',marginRight:8}}>{i+1}</small>{verse}</p>)}</article><button style={btn} onClick={()=>setLarge(v=>!v)}>{large?'Standard text':'Large text'}</button></>}
 </section>}
 {tab==='library'&&<section style={{display:'grid',gap:12,lineHeight:1.7}}><h2>Bible and living-book editions</h2><div style={{border:'1px solid #648296',borderRadius:14,padding:15}}><strong>KJV starter passages</strong><p>Available locally in this preview: {PASSAGES.length} verse excerpts, searchable with voice and device bookmark.</p></div><div style={{border:'1px solid #648296',borderRadius:14,padding:15}}><strong>Full Metaverse Bible</strong><p>Existing project concept recovered. A complete versioned scripture corpus, book/chapter index, reference lookup, and verified download/print assets still need to be connected.</p></div><div style={{border:'1px solid #648296',borderRadius:14,padding:15}}><strong>Ethiopian Bible / additional canon</strong><p>Planned category. No complete verified translation has been imported. Public-domain or licensed sources and canon/translation attribution are required; do not invent missing books or verse text.</p></div></section>}
 <footer style={{fontSize:12,color:'#b3c5d4',lineHeight:1.55}}>FaithVerse is an interactive study and creative world; this preview does not represent a completed Bible publication, verified scripture audio collection, paid publication or cloud backup.</footer>
 </main></section>
}
