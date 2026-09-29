import {useEffect,useMemo,useState} from 'react'

const BOOKS=['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'] as const

type Verse={book_name?:string;chapter?:number;verse?:number;text?:string}
type Payload={reference?:string;translation_id?:string;translation_name?:string;verses?:Verse[];text?:string}

export default function FaithScriptureReader(){
 const [book,setBook]=useState('Genesis')
 const [chapter,setChapter]=useState(1)
 const [data,setData]=useState<Payload|null>(null)
 const [loading,setLoading]=useState(false)
 const [error,setError]=useState('')
 const [fontSize,setFontSize]=useState(19)

 const load=async(nextBook=book,nextChapter=chapter)=>{
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
 return <section id="reader" style={{marginTop:18,border:'2px solid #e5c56a',borderRadius:20,padding:16,background:'#080806'}}>
   <div style={{fontSize:10,letterSpacing:2.2,color:'#e5c56a',fontWeight:950}}>WORKING SCRIPTURE READER • SOURCE-LABELED</div>
   <h2 style={{margin:'7px 0'}}>Read the Bible now</h2>
   <p style={{color:'#d9cfb3',fontSize:12,lineHeight:1.55}}>Current connected reading source: <b>King James Version (KJV)</b> through bible-api.com. Ethiopian-canon books outside this connected KJV dataset remain source-pending until a verified text corpus is connected; they are not fabricated here.</p>
   <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 90px',gap:8}}>
    <select value={book} onChange={e=>setBook(e.target.value)} style={control}>{BOOKS.map(x=><option key={x}>{x}</option>)}</select>
    <input aria-label="Bible chapter" type="number" min={1} max={150} value={chapter} onChange={e=>setChapter(Math.max(1,Number(e.target.value)||1))} style={control}/>
   </div>
   <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:8}}>
    <button onClick={()=>void load()} style={button}>LOAD CHAPTER</button>
    <button onClick={()=>{setChapter(c=>Math.max(1,c-1));setTimeout(()=>void load(book,Math.max(1,chapter-1)),0)}} style={button}>← PREVIOUS</button>
    <button onClick={()=>{setChapter(c=>c+1);setTimeout(()=>void load(book,chapter+1),0)}} style={button}>NEXT →</button>
    <button onClick={readAloud} style={button}>🔊 READ ALOUD</button>
    <button onClick={()=>setFontSize(v=>Math.min(32,v+2))} style={button}>A+</button>
    <button onClick={()=>setFontSize(v=>Math.max(16,v-2))} style={button}>A−</button>
   </div>
   {loading&&<div role="status" style={{padding:'20px 0',color:'#8fdcff'}}>Loading scripture…</div>}
   {error&&<div role="alert" style={{marginTop:10,padding:12,border:'1px solid #b75d5d',borderRadius:12,color:'#ffd7d7'}}>{error}<br/><small>The rest of FaithVerse still works; retry when online.</small></div>}
   {data&&<article aria-label={data.reference||`${book} ${chapter}`} style={{marginTop:14,padding:14,border:'1px solid #55472c',borderRadius:16,background:'#110f09'}}>
     <div style={{fontSize:11,color:'#e5c56a',fontWeight:950}}>{data.reference||`${book} ${chapter}`} • {data.translation_name||'King James Version'} • KJV</div>
     <div style={{marginTop:12,fontFamily:'Georgia,serif',fontSize,lineHeight:1.75,color:'#fff8e5'}}>{data.verses?.map(v=><p key={`${v.chapter}:${v.verse}`} style={{margin:'0 0 10px'}}><sup style={{color:'#e5c56a',fontWeight:900}}>{v.verse}</sup> {String(v.text||'').trim()}</p>)}</div>
   </article>}
 </section>
}
const control:React.CSSProperties={minHeight:48,borderRadius:11,border:'1px solid #76623a',background:'#17130b',color:'#fff',padding:'8px 10px',fontSize:15}
const button:React.CSSProperties={minHeight:44,borderRadius:999,border:'1px solid #8d7435',background:'#211a0d',color:'#fff',fontWeight:900,padding:'8px 12px',touchAction:'manipulation'}
