import {useMemo,useState} from 'react'
import {ETHIOPIAN_CANON_SOURCE,ETHIOPIAN_ORTHODOX_CANON_81,KJV_1611_STUDY_LAYER,PALEO_HEBREW_ALPHABET,PALEO_HEBREW_STUDY_RULES,STRONGS_STUDY,TRYAMM_88_BOOK_CURRICULUM} from '../data/FaithVerseStudyLibrary'

type Layer='canon81'|'curriculum88'|'strongs'|'hebrew'|'holo'|'network'
const options:[Layer,string][]=[
 ['canon81','ETHIOPIAN CANON • 81'],['curriculum88','TRYAMM CURRICULUM • 88'],['strongs',"STRONG'S"],['hebrew','HEBREW / PALEO SCRIPT'],['holo','HOLO LAB'],['network','SERVANTS OF CHRIST'],
]

function openHoloGPT(prompt:string){
 window.dispatchEvent(new CustomEvent('tryamm:hologpt-study-context',{detail:{prompt,source:'faith-holobook'}}))
}
function go(path:string){const nav=(window as any).__tryammNavigate;if(typeof nav==='function')nav(path);else window.location.href=path}

export default function FaithHoloBook(){
 const [layer,setLayer]=useState<Layer>('canon81')
 const [query,setQuery]=useState('')
 const [strong,setStrong]=useState('H7225')
 const books=useMemo(()=>ETHIOPIAN_ORTHODOX_CANON_81.filter(book=>book.title.toLowerCase().includes(query.trim().toLowerCase())),[query])
 return <section aria-label="FaithVerse HoloBook" style={shell}>
  <div style={{fontSize:10,letterSpacing:2.4,color:'#e5c56a',fontWeight:950}}>FAITHVERSE HOLOBOOK • ONE STUDY LAYER AT A TIME</div>
  <h2 style={{margin:'7px 0 4px'}}>Bible + language + concordance + immersive study</h2>
  <p style={muted}>Official canon metadata, current KJV reading, historical-edition study, lexical tools, Hebrew-script learning, AI assistance, Holo Lab and ministry publishing stay separated by source labels instead of being mixed together.</p>
  <label style={{display:'block',fontSize:11,fontWeight:900,color:'#e5c56a'}}>STUDY LAYER
   <select value={layer} onChange={e=>setLayer(e.target.value as Layer)} style={select}>{options.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select>
  </label>

  {layer==='canon81'&&<div style={panel}>
   <h3 style={h3}>Ethiopian Orthodox Tewahedo canon • 81</h3>
   <p style={muted}>The Church source lists 46 Old Testament books and 35 New Testament books, total 81. This index follows that source's own grouping and names.</p>
   <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a book…" aria-label="Find Ethiopian canon book" style={input}/>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(185px,1fr))',gap:7,maxHeight:380,overflowY:'auto'}}>{books.map((book,index)=><div key={book.id} style={bookRow}><b>{index+1}. {book.title}</b><small style={{color:book.readerStatus==='kjv-reader-available'?'#9cffb7':'#d4c9a8'}}>{book.testament} • {book.readerStatus==='kjv-reader-available'?'KJV reader lane available':'verified text source required'}</small></div>)}</div>
   <p style={{...muted,fontSize:11}}>Source manifest: {ETHIOPIAN_CANON_SOURCE.title}. Text is not invented for books whose verified corpus is not yet connected.</p>
  </div>}

  {layer==='curriculum88'&&<div style={panel}>
   <h3 style={h3}>TRYAMM 88-book curriculum</h3>
   <p style={muted}>This is a <b>custom study curriculum</b>, not a claim that the Ethiopian Orthodox canon is 88. It contains the official 81-book manifest plus seven source-pending study slots you can assign later.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:7,maxHeight:420,overflowY:'auto'}}>{TRYAMM_88_BOOK_CURRICULUM.map((item,index)=><div key={item.id} style={bookRow}><b>{index+1}. {item.title}</b><small style={{color:item.kind==='official-ethiopian-canon'?'#9cffb7':'#ffd97c'}}>{item.kind==='official-ethiopian-canon'?'OFFICIAL 81-CANON METADATA':'CUSTOM SLOT • SOURCE PENDING'}</small></div>)}</div>
  </div>}

  {layer==='strongs'&&<div style={panel}>
   <h3 style={h3}>{STRONGS_STUDY.title}</h3>
   <p style={muted}>KJV word → Strong's number → Hebrew/Greek lemma → transliteration → gloss → related words → occurrences. Strong's is a concordance/index layer, not another Bible canon.</p>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{STRONGS_STUDY.starters.map(id=><button key={id} onClick={()=>setStrong(id)} style={chip}>{id}</button>)}</div>
   <input value={strong} onChange={e=>setStrong(e.target.value.toUpperCase())} aria-label="Strong's number" style={input}/>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><a href={STRONGS_STUDY.sourceUrl(strong)} target="_blank" rel="noreferrer" style={button}>OPEN STRONG'S SOURCE</a><button onClick={()=>openHoloGPT(`Teach me how to study ${strong} using Strong's. Keep KJV wording, Hebrew/Greek lemma, transliteration, gloss, and AI explanation clearly separated and cite uncertainty.`)} style={button}>ASK HOLOGPT TUTOR</button></div>
   <p style={{...muted,fontSize:11}}>{STRONGS_STUDY.rule}</p>
  </div>}

  {layer==='hebrew'&&<div style={panel}>
   <h3 style={h3}>{PALEO_HEBREW_STUDY_RULES.title}</h3>
   <p style={muted}>Learn Biblical Hebrew letters with a modern Hebrew form and an ancient-script reference glyph. Paleo-Hebrew is handled as a script layer; translation and language analysis remain separate.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:7}}>{PALEO_HEBREW_ALPHABET.map(([name,modern,ancient,sound])=><button key={name} onClick={()=>openHoloGPT(`Teach me the Hebrew letter ${name}: modern form ${modern}, ancient-script study glyph ${ancient}, common transliteration ${sound}. Include reading practice and clearly label historical uncertainty.`)} style={{...bookRow,textAlign:'left',cursor:'pointer'}}><span style={{fontSize:30}}>{modern} {ancient}</span><b>{name}</b><small>{sound}</small></button>)}</div>
   <p style={{...muted,fontSize:11}}>{PALEO_HEBREW_STUDY_RULES.academicBoundary}</p>
  </div>}

  {layer==='holo'&&<div style={panel}>
   <h3 style={h3}>Holo Lab immersive scripture study</h3>
   <p style={muted}>BOOK → PASSAGE → LANGUAGE STUDY → MAP/TIMELINE → CLEARLY LABELED RECONSTRUCTION → IMMERSIVE MISSION → QUIZ → REFLECTION. Historical scenes remain reconstructions unless a detail is directly sourced.</p>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button onClick={()=>go('/holo-lab')} style={button}>OPEN HOLO LAB</button><button onClick={()=>openHoloGPT('Help me design a source-labeled immersive Bible study lesson using the Ethiopian canon, KJV comparison, Hebrew language study, and a clearly labeled Holo Lab reconstruction.')} style={button}>BUILD LESSON WITH HOLOGPT</button></div>
  </div>}

  {layer==='network'&&<div style={panel}>
   <h3 style={h3}>Servants of Christ Network</h3>
   <p style={muted}>Turn a study into a class, LIVE teaching, accessible replay, reading plan, quiz, youth lesson, community-service mission or ministry-network program. Human review remains required before public teaching is promoted as an official ministry resource.</p>
   <button onClick={()=>go('/servants-of-christ')} style={button}>OPEN SERVANTS OF CHRIST</button>
  </div>}

  <div style={{...panel,marginTop:10,borderColor:'#7d6732'}}><b>1611 KJV STUDY LAYER</b><p style={muted}>{KJV_1611_STUDY_LAYER.structure}. The current reader supplies a KJV lane; original-edition spelling/scans and Ethiopian-canon texts remain source-labeled instead of silently blended.</p></div>
 </section>
}
const shell:React.CSSProperties={marginTop:18,border:'2px solid #8d7435',borderRadius:20,padding:16,background:'#080806',color:'#fff'}
const panel:React.CSSProperties={marginTop:12,border:'1px solid #55472c',borderRadius:16,padding:14,background:'#110f09'}
const bookRow:React.CSSProperties={display:'flex',flexDirection:'column',gap:3,border:'1px solid #40361f',borderRadius:12,padding:10,background:'#0b0a06',color:'#fff'}
const muted:React.CSSProperties={color:'#d9cfb3',lineHeight:1.55}
const h3:React.CSSProperties={margin:'0 0 8px',color:'#fff8e5'}
const select:React.CSSProperties={display:'block',width:'100%',minHeight:52,marginTop:6,borderRadius:12,border:'1px solid #8d7435',background:'#17130b',color:'#fff',fontWeight:900,padding:'8px 10px'}
const input:React.CSSProperties={width:'100%',boxSizing:'border-box',minHeight:48,margin:'10px 0',borderRadius:11,border:'1px solid #76623a',background:'#17130b',color:'#fff',padding:'8px 10px',fontSize:16}
const button:React.CSSProperties={display:'inline-flex',alignItems:'center',justifyContent:'center',minHeight:46,borderRadius:12,border:'1px solid #8d7435',background:'#211a0d',color:'#fff',fontWeight:900,padding:'8px 12px',textDecoration:'none',cursor:'pointer'}
const chip:React.CSSProperties={...button,minHeight:38,padding:'5px 10px'}
