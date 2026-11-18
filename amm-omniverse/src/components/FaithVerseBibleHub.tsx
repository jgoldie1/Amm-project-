import {useEffect,useState,type CSSProperties} from 'react'

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
type Tab='read'|'world'|'press'|'library'
function readBookmark(){try{return localStorage.getItem(KEY)||'matthew-6-33'}catch{return'matthew-6-33'}}
export default function FaithVerseBibleHub({onClose,onOpenFaith,onOpenPress}:{onClose:()=>void;onOpenFaith:()=>void;onOpenPress:()=>void}){
 const [tab,setTab]=useState<Tab>('read')
 const [selected,setSelected]=useState(readBookmark)
 const [large,setLarge]=useState(false)
 const [query,setQuery]=useState('')
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
 const filtered=PASSAGES.filter(p=>(p.reference+' '+p.chapter+' '+p.text).toLowerCase().includes(query.toLowerCase()))
 return <section role="dialog" aria-modal="true" aria-label="FaithVerse Metaverse Bible and Kingdoms Press" style={{position:'fixed',inset:0,zIndex:2147483600,background:'#07101b',color:'#fff',overflowY:'auto',padding:'max(16px,env(safe-area-inset-top)) 14px max(32px,env(safe-area-inset-bottom))'}}>
 <main style={{maxWidth:790,margin:'0 auto',display:'grid',gap:14}}>
 <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:15}}><div><div style={{fontSize:12,color:'#e9cf9b',letterSpacing:2,fontWeight:900}}>TRYAMM · KINGDOMS PRESS</div><h1 style={{fontSize:29,margin:'4px 0'}}>FaithVerse · Metaverse Bible</h1></div><button style={btn} onClick={onClose}>Close</button></header>
 <p style={{fontSize:14,color:'#d2dbeb',lineHeight:1.6,margin:0}}>One accessible reading and roleplay entrance connected to the existing Faith Realm and Kingdoms Press publishing tools.</p>
 <p role="status" aria-live="polite" style={{background:'#222d35',borderRadius:12,padding:12,lineHeight:1.55,margin:0}}>{notice}</p>
 <nav aria-label="FaithVerse sections" style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>
 {(['read','world','press','library'] as Tab[]).map(k=><button key={k} style={{...btn,background:tab===k?'#435d64':'#132a40'}} aria-pressed={tab===k} onClick={()=>setTab(k)}>{k==='read'?'Read the Bible':k==='world'?'FaithVerse RP':k==='press'?'Kingdoms Press':'Edition Library'}</button>)}
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
 {tab==='world'&&<section style={{display:'grid',gap:12,lineHeight:1.65}}><h2 style={{fontSize:23}}>Continue your existing FaithVerse world</h2><p>The existing Faith Realm has sanctuary, prayer, ministry and other roleplay views. The StreetVerse Faith Chrono portal also points to Metaverse Bible. The next milestone is verifying the entire StreetVerse-to-FaithVerse handoff and save/reload.</p><button style={btn} onClick={onOpenFaith}>Open existing Faith Realm</button><p>FaithVerse conversations, prayers, donations and ministry activity must respect participants' privacy and consent. No claims of real human ministry moderation or permanent cloud storage until verified.</p></section>}
 {tab==='press'&&<section style={{display:'grid',gap:12,lineHeight:1.65}}><h2>Kingdoms Press publishing</h2><p>Open the existing editorial rights, translation, accessibility, print editions, royalty and author-event module. Its operations require configured Supabase and an authenticated user. They are not automatically complete when you open this page.</p><button style={btn} onClick={onOpenPress}>Open existing Kingdoms Press</button><p>Before publishing the complete Metaverse Bible, verify the text edition's rights, canonical table of contents, scripture source, editorial review, cross-references, audio licensing and print/export proof.</p></section>}
 {tab==='library'&&<section style={{display:'grid',gap:12,lineHeight:1.7}}><h2>Bible and living-book editions</h2><div style={{border:'1px solid #648296',borderRadius:14,padding:15}}><strong>KJV starter passages</strong><p>Available locally in this preview: {PASSAGES.length} verse excerpts, searchable with voice and device bookmark.</p></div><div style={{border:'1px solid #648296',borderRadius:14,padding:15}}><strong>Full Metaverse Bible</strong><p>Existing project concept recovered. A complete versioned scripture corpus, book/chapter index, reference lookup, and verified download/print assets still need to be connected.</p></div><div style={{border:'1px solid #648296',borderRadius:14,padding:15}}><strong>Ethiopian Bible / additional canon</strong><p>Planned category. No complete verified translation has been imported. Public-domain or licensed sources and canon/translation attribution are required; do not invent missing books or verse text.</p></div></section>}
 <footer style={{fontSize:12,color:'#b3c5d4',lineHeight:1.55}}>FaithVerse is an interactive study and creative world; this preview does not represent a completed Bible publication, verified scripture audio collection, paid publication or cloud backup.</footer>
 </main></section>
}
