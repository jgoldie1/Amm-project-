import {useState,type CSSProperties} from 'react'
import {KJV_1611_APOCRYPHA_BOOKS,KJV_1611_SOURCE_MANIFEST} from '../data/FaithVerseStudyLibrary'

type StudyTab='scrolls'|'apocrypha'|'compare'
const DOCS=[
 {id:'1QIsa-a',label:'Great Isaiah Scroll',category:'Biblical manuscript',context:'Isaiah manuscript often studied for Second Temple textual comparison',reference:'Israel Antiquities Authority digital library'},
 {id:'1QS',label:'Community Rule',category:'Non-biblical community text',context:'Rules and practices attributed to a community; not an additional Bible chapter',reference:'Israel Antiquities Authority digital library'},
 {id:'1QpHab',label:'Habakkuk Commentary',category:'Biblical interpretation',context:'A pesher commentary on Habakkuk, distinct from the biblical book itself',reference:'Library of Congress scrolls exhibition'},
 {id:'11QPs-a',label:'Great Psalms Scroll',category:'Biblical collection',context:'Psalms and additional hymnic materials in a different arrangement',reference:'Library of Congress scrolls exhibition'},
 {id:'4QMMT',label:'Some Works of the Law',category:'Non-biblical legal text',context:'A manuscript group important for Second Temple halakhic study',reference:'Israel Antiquities Authority digital library'}
] as const
const btn:CSSProperties={minHeight:56,padding:'12px 16px',fontSize:16,fontWeight:800,borderRadius:13,border:'1px solid #c4ab72',background:'#243449',color:'white',cursor:'pointer',touchAction:'manipulation'}
export default function FaithVerseScrollsApocrypha({onOpenHoloBook}:{onOpenHoloBook:()=>void}){
 const [tab,setTab]=useState<StudyTab>('scrolls')
 const [term,setTerm]=useState('')
 const [selected,setSelected]=useState('1QIsa-a')
 const [book,setBook]=useState('1-esdras')
 const [status,setStatus]=useState('Manuscript catalog references only. No unlicensed scans, facsimiles or translations have been copied into TRYAMM.')
 const current=DOCS.find(x=>x.id===selected)||DOCS[0]
 const currentBook=KJV_1611_APOCRYPHA_BOOKS.find(x=>x.id===book)||KJV_1611_APOCRYPHA_BOOKS[0]
 const research=(url:string)=>{window.open(url,'_blank','noopener,noreferrer');setStatus('Opened source archive. Verify its reproduction and translation permissions before importing content.')}
 return <section aria-label="Dead Sea Scrolls and Apocrypha research" style={{background:'#0e1b28',border:'1px solid #7d794f',borderRadius:18,padding:'clamp(12px,3vw,22px)',display:'grid',gap:14,color:'#fff'}}>
  <h2 style={{margin:0,fontSize:24}}>Dead Sea Scrolls & Apocrypha Study</h2>
  <p style={{lineHeight:1.6,margin:0}}>Manuscripts, historical editions and scripture belong to related but distinct study collections. The Dead Sea Scrolls are a collection of biblical and non-biblical manuscripts, <strong>not a single additional Bible edition</strong>. The 1611 KJV Apocrypha list is an existing study layer, not the Ethiopian Orthodox 81-book canon.</p>
  <nav aria-label="Choose manuscript study" style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:7}}>{(['scrolls','apocrypha','compare'] as StudyTab[]).map(x=><button key={x} aria-pressed={tab===x} onClick={()=>setTab(x)} style={{...btn,background:tab===x?'#526245':'#243449',fontSize:14}}>{x==='scrolls'?'Scrolls':x==='apocrypha'?'1611 Apocrypha':'Compare sources'}</button>)}</nav>
  {tab==='scrolls'&&<>
   <label htmlFor="scroll-search">Search referenced scrolls</label><input id="scroll-search" value={term} onChange={e=>setTerm(e.target.value)} style={{...btn,fontWeight:400}} placeholder="Isaiah, Psalms, Rule…"/>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(165px,1fr))',gap:8}}>{DOCS.filter(x=>(x.id+' '+x.label+' '+x.category).toLowerCase().includes(term.toLowerCase())).map(x=><button key={x.id} style={{...btn,textAlign:'left',background:selected===x.id?'#475b5a':'#243449'}} aria-pressed={selected===x.id} onClick={()=>setSelected(x.id)}>{x.id} · {x.label}</button>)}</div>
   <article style={{padding:16,background:'#172d38',borderRadius:14,lineHeight:1.6}}><h3 style={{margin:'0 0 7px'}}>{current.label} ({current.id})</h3><p><strong>Classification:</strong> {current.category}</p><p>{current.context}</p><p><strong>Reference:</strong> {current.reference}</p><p style={{fontSize:13}}>Transcription, artifact image and translation rights have not been cleared for copying into Kingdoms Press.</p></article>
   <button style={btn} onClick={()=>research('https://www.deadseascrolls.org.il/home?locale=en_US')}>Open Israel Antiquities Authority archive</button>
   <button style={btn} onClick={()=>research('https://www.loc.gov/exhibits/scrolls/')}>Open Library of Congress exhibition</button>
  </>}
  {tab==='apocrypha'&&<>
   <p style={{lineHeight:1.5,margin:0}}>The existing KJV 1611 historical-study manifest lists {KJV_1611_APOCRYPHA_BOOKS.length} Apocrypha entries. These catalog descriptions are not a verified full-text import.</p>
   <label htmlFor="apocrypha-book">Select Apocrypha book</label><select id="apocrypha-book" value={book} onChange={e=>setBook(e.target.value)} style={btn}>{KJV_1611_APOCRYPHA_BOOKS.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select>
   <article style={{background:'#172d38',padding:15,borderRadius:14}}><h3>{currentBook.title}</h3><p>Historical KJV 1611 title: {currentBook.historical1611Title}</p><p>Listed chapter count: {currentBook.chapters}</p><p>Source: {KJV_1611_SOURCE_MANIFEST.title}. Its text and edition status must be verified separately.</p></article>
   <a href={KJV_1611_SOURCE_MANIFEST.url} target="_blank" rel="noopener noreferrer" style={{...btn,textDecoration:'none',textAlign:'center'}}>View historical KJV source</a>
   <button style={btn} onClick={onOpenHoloBook}>Open original FaithHoloBook Apocrypha layer</button>
  </>}
  {tab==='compare'&&<article style={{lineHeight:1.75,background:'#172d38',padding:16,borderRadius:14}}><h3>Keep sources and claims separate</h3><p><strong>Denotation:</strong> A word's dictionary or context-established meaning, documented from the language source.</p><p><strong>Connotation:</strong> Its associated emotional, cultural or theological implications, identified as interpretations rather than literal dictionary definitions.</p><p><strong>Etymology:</strong> Historically evidenced development of a word, not a meaning invented from Paleo-Hebrew glyphs.</p><p><strong>Textual variant:</strong> A difference between manuscript witnesses that must be attributed to specific witnesses, editions and scholarly sources.</p><p>Never substitute modern KJV wording for a fragmentary ancient scroll and label it an exact original translation. Historical reconstructed scenes and AI explanations must remain labeled simulations.</p></article>}
  <p role="status" aria-live="polite" style={{fontSize:13,color:'#e0dfc4'}}>{status}</p>
 </section>
}
