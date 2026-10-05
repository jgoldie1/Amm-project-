import {useEffect,useMemo,useState} from 'react'
import {KJV_1611_APOCRYPHA_BOOKS,KJV_1611_SOURCE_MANIFEST,KJV_1611_80_BOOK_STUDY_INDEX} from '../data/FaithVerseStudyLibrary'

const BOOKS=['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'] as const

type ReaderMode='kjv-current'|'kjv1611-index'|'kjv1611-apocrypha'
type Verse={book_name?:string;chapter?:number;verse?:number;text?:string}
type Payload={reference?:string;translation_id?:string;translation_name?:string;verses?:Verse[];text?:string}

function askHoloGPT(prompt:string){window.dispatchEvent(new CustomEvent('tryamm:hologpt-study-context',{detail:{prompt,source:'faith-scripture-reader'}}))}
function requestImmersive(title:string,section:string){
 window.dispatchEvent(new CustomEvent('tryamm:faithverse-immersive-study-request',{detail:{title,section,source:'faith-scripture-reader',sourceLabelsRequired:true}}))
 askHoloGPT(`Build an immersive FaithVerse study for ${title} from the ${section} lane. Keep scripture text, historical edition facts, canon metadata, commentary, reconstruction and AI explanation separately labeled. Never invent missing scripture text.`)
}

export default function FaithScriptureReader(){
 const [mode,setMode]=useState<ReaderMode>('kjv-current')
 const [book,setBook]=useState('Genesis')
 const [chapter,setChapter]=useState(1)
 const [selectedApocrypha,setSelectedApocrypha]=useState(KJV_1611_APOCRYPHA_BOOKS[0].id)
 const [data,setData]=useState<Payload|null>(null)
 const [loading,setLoading]=useState(false)
 const [error,setError]=useState('')
 const [fontSize,setFontSize]=useState(19)

 const load=async(nextBook=book,nextChapter=chapter)=>{
   if(mode!=='kjv-current'){setError('');return}
   setLoading(true);setError('')
   try{
     const ref=encodeURIComponent(`${nextBook} ${nextChapter}`)
     const response=await fetch(`https://bible-api.com/${ref}?translation=kjv&single_chapter_book_matching=indifferent`,{headers:{Accept:'application/json'}})
     if(!response.ok)throw new Error(`Scripture provider returned ${response.status}`)
     const payload=await response.json() as Payload
     if(!Array.isArray(payload.verses)||payload.verses.length===0)throw new Error('No verses returned for this chapter')
     setData(payload)
   }catch(e){setError(e instanceof Error?e.message:'Scripture could not be loaded')}
   finally{setLoading(false)}
 }
 useEffect(()=>{void load('Genesis',1)},[])
 const chapterText=useMemo(()=>data?.verses?.map(v=>`${v.verse}. ${String(v.text||'').trim()}`).join(' ')||'',[data])
 const readAloud=()=>{if(!chapterText||!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(`${book} chapter ${chapter}. ${chapterText}`);utterance.rate=.92;window.speechSynthesis.speak(utterance)}
 const markScriptureStudied=()=>{if(!data?.verses?.length)return;window.dispatchEvent(new CustomEvent('tryamm:metaverse-bible-scripture-studied',{detail:{reference:data.reference||`${book} ${chapter}`,book,chapter,translation:data.translation_name||'King James Version',source:'faith-scripture-reader'}}))}
 const selected=KJV_1611_APOCRYPHA_BOOKS.find(x=>x.id===selectedApocrypha)||KJV_1611_APOCRYPHA_BOOKS[0]

 return <section id="reader" style={{marginTop:18,border:'2px solid #e5c56a',borderRadius:20,padding:16,background:'#080806'}}>
   <div style={{fontSize:10,letterSpacing:2.2,color:'#e5c56a',fontWeight:950}}>SCRIPTURE READER • CURRENT KJV + 1611 HISTORICAL / APOCRYPHA STUDY</div>
   <h2 style={{margin:'7px 0'}}>Read, compare and enter the Bible world</h2>
   <p style={{color:'#d9cfb3',fontSize:12,lineHeight:1.55}}>The live text provider currently supplies the standard 66-book KJV lane. The historical 1611 lane separately exposes its 80-book structure and 14-book Apocrypha with a source link. Missing historical text is never generated or silently substituted.</p>

   <div style={{display:'flex',gap:7,flexWrap:'wrap',margin:'10px 0 12px'}}>
    <button onClick={()=>setMode('kjv-current')} style={{...button,borderColor:mode==='kjv-current'?'#e5c56a':'#5d5137'}}>KJV • CONNECTED TEXT</button>
    <button onClick={()=>setMode('kjv1611-index')} style={{...button,borderColor:mode==='kjv1611-index'?'#e5c56a':'#5d5137'}}>KJV 1611 • 80 BOOKS</button>
    <button onClick={()=>setMode('kjv1611-apocrypha')} style={{...button,borderColor:mode==='kjv1611-apocrypha'?'#e5c56a':'#5d5137'}}>1611 APOCRYPHA • 14</button>
   </div>

   {mode==='kjv-current'&&<>
    <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 90px',gap:8}}>
     <select value={book} onChange={e=>setBook(e.target.value)} style={control}>{BOOKS.map(x=><option key={x}>{x}</option>)}</select>
     <input aria-label="Bible chapter" type="number" min={1} max={150} value={chapter} onChange={e=>setChapter(Math.max(1,Number(e.target.value)||1))} style={control}/>
    </div>
    <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:8}}>
     <button onClick={()=>void load()} style={button}>LOAD CHAPTER</button>
     <button onClick={()=>{const n=Math.max(1,chapter-1);setChapter(n);setTimeout(()=>void load(book,n),0)}} style={button}>← PREVIOUS</button>
     <button onClick={()=>{const n=chapter+1;setChapter(n);setTimeout(()=>void load(book,n),0)}} style={button}>NEXT →</button>
     <button onClick={readAloud} style={button}>🔊 READ ALOUD</button>
     <button onClick={markScriptureStudied} disabled={!data?.verses?.length} style={button}>✓ MARK CHAPTER STUDIED</button>
     <button onClick={()=>requestImmersive(`${book} ${chapter}`,'connected KJV')} style={button}>🌐 IMMERSIVE STUDY</button>
     <button onClick={()=>setFontSize(v=>Math.min(32,v+2))} style={button}>A+</button>
     <button onClick={()=>setFontSize(v=>Math.max(16,v-2))} style={button}>A−</button>
    </div>
    {loading&&<div role="status" style={{padding:'20px 0',color:'#8fdcff'}}>Loading scripture…</div>}
    {error&&<div role="alert" style={{marginTop:10,padding:12,border:'1px solid #b75d5d',borderRadius:12,color:'#ffd7d7'}}>{error}<br/><small>The rest of FaithVerse still works; retry when online.</small></div>}
    {data&&<article aria-label={data.reference||`${book} ${chapter}`} style={{marginTop:14,padding:14,border:'1px solid #55472c',borderRadius:16,background:'#110f09'}}>
      <div style={{fontSize:11,color:'#e5c56a',fontWeight:950}}>{data.reference||`${book} ${chapter}`} • {data.translation_name||'King James Version'} • CONNECTED KJV TEXT</div>
      <div style={{marginTop:12,fontFamily:'Georgia,serif',fontSize,lineHeight:1.75,color:'#fff8e5'}}>{data.verses?.map(v=><p key={`${v.chapter}:${v.verse}`} style={{margin:'0 0 10px'}}><sup style={{color:'#e5c56a',fontWeight:900}}>{v.verse}</sup> {String(v.text||'').trim()}</p>)}</div>
    </article>}
   </>}

   {mode==='kjv1611-index'&&<div style={panel}>
    <div style={{fontSize:10,color:'#e5c56a',fontWeight:950}}>AUTHORIZED VERSION 1611 • HISTORICAL STUDY INDEX</div>
    <h3>80-book structure • 39 Old Testament + 14 Apocrypha + 27 New Testament</h3>
    <p style={muted}>This historical-edition lane is separate from the standard KJV provider above and separate from the Ethiopian Orthodox 81-book canon. The linked 1611 transcription is a historical study source and may be incomplete.</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(165px,1fr))',gap:6,maxHeight:430,overflowY:'auto'}}>{KJV_1611_80_BOOK_STUDY_INDEX.map((item,index)=><button key={item.id} onClick={()=>requestImmersive(item.title,`KJV 1611 ${item.section}`)} style={bookCard}><b>{index+1}. {item.title}</b><small>{item.section}</small></button>)}</div>
    <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:10}}><a href={KJV_1611_SOURCE_MANIFEST.url} target="_blank" rel="noreferrer" style={button}>OPEN 1611 HISTORICAL SOURCE</a><button onClick={()=>askHoloGPT('Teach me how the KJV 1611 80-book structure is organized, including the 14-book Apocrypha between the Old and New Testaments. Keep historical facts, scripture, commentary and AI explanation separately labeled.')} style={button}>ASK HOLOGPT 1611 TUTOR</button></div>
   </div>}

   {mode==='kjv1611-apocrypha'&&<div style={panel}>
    <div style={{fontSize:10,color:'#e5c56a',fontWeight:950}}>THE BOOKES CALLED APOCRYPHA • KJV 1611 HISTORICAL LANE</div>
    <h3>14-book Apocrypha study library</h3>
    <p style={muted}>Select a book to enter a source-labeled immersive study. TRYAMM does not invent a historical verse corpus when the connected 1611 source is incomplete.</p>
    <select value={selectedApocrypha} onChange={e=>setSelectedApocrypha(e.target.value)} style={{...control,width:'100%'}}>{KJV_1611_APOCRYPHA_BOOKS.map(x=><option key={x.id} value={x.id}>{x.title} • {x.chapters} chapter{x.chapters===1?'':'s'}</option>)}</select>
    <div style={{...bookCard,marginTop:8,cursor:'default'}}><b>{selected.title}</b><span>1611 title: {selected.historical1611Title}</span><small>{selected.chapters} chapter{selected.chapters===1?'':'s'} • historical KJV 1611 Apocrypha lane</small></div>
    <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:10}}><button onClick={()=>requestImmersive(selected.title,'KJV 1611 Apocrypha')} style={button}>🌐 ENTER IMMERSIVE STUDY</button><button onClick={()=>askHoloGPT(`Tutor me through ${selected.title} in the KJV 1611 Apocrypha. Keep the KJV historical source, Ethiopian-canon overlap, commentary and AI explanation separately labeled, and do not fabricate missing source text.`)} style={button}>ASK HOLOGPT</button><a href={KJV_1611_SOURCE_MANIFEST.url} target="_blank" rel="noreferrer" style={button}>OPEN SOURCE</a></div>
   </div>}
 </section>
}
const control:React.CSSProperties={minHeight:48,borderRadius:11,border:'1px solid #76623a',background:'#17130b',color:'#fff',padding:'8px 10px',fontSize:15}
const button:React.CSSProperties={minHeight:44,borderRadius:999,border:'1px solid #8d7435',background:'#211a0d',color:'#fff',fontWeight:900,padding:'8px 12px',touchAction:'manipulation',display:'inline-flex',alignItems:'center',textDecoration:'none',cursor:'pointer'}
const panel:React.CSSProperties={marginTop:10,padding:12,border:'1px solid #65562f',borderRadius:14,background:'#110f09'}
const muted:React.CSSProperties={color:'#d9cfb3',fontSize:12,lineHeight:1.55}
const bookCard:React.CSSProperties={display:'flex',flexDirection:'column',gap:4,textAlign:'left',padding:9,border:'1px solid #493c22',borderRadius:10,background:'#0b0a06',color:'#fff',cursor:'pointer'}
