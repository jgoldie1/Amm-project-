import {useEffect,useMemo,useState,type CSSProperties} from 'react'
import {PALEO_HEBREW_ALPHABET,PALEO_HEBREW_STUDY_RULES,STRONGS_STUDY} from '../data/FaithVerseStudyLibrary'

type Lesson='alphabet'|'concordance'|'etymology'|'quiz'
type Receipt={date:string;lesson:Lesson;completed:boolean;selectedLetter:string;strongId:string}
const KEY='tryamm:faithverse:language-academy:v1'
const STAGES:readonly {name:string;summary:string;detail:string}[]=[
 {name:'Script',summary:'Identify the letterforms',detail:'Compare modern square Hebrew and ancient-script reference glyphs. Script history is different from a claim about a new spoken language.'},
 {name:'Sound',summary:'Practice the sounds',detail:'Transliterations are learning conventions. Historical pronunciation is not fully recoverable for every time and place.'},
 {name:'Strong’s number',summary:'Find the lexical index',detail:'Use a verified Hebrew H-number or Greek G-number linked to the source text. Strong’s is an index, not a direct translation or proof of etymology.'},
 {name:'Root and meaning',summary:'Check scholarly word origins',detail:'Compare a lexicon’s root, grammatical form, historical usage and semantic range. Do not derive word meanings from pictures of letters or invent a root.'},
 {name:'Context',summary:'Read the passage',detail:'Check which sense fits the sentence and translation. Keep scripture, lexicon, interpretation and AI explanation separately attributed.'}
]
const EXAMPLE = [
 {id:'H7225',word:'רֵאשִׁית',transliteration:'rēʾšît',context:'Genesis 1:1',description:'Often rendered “beginning.” Review the source lexicon for noun form, derivation and usage.'},
 {id:'H430',word:'אֱלֹהִים',transliteration:'ʾĕlōhîm',context:'Genesis 1:1',description:'A grammatical plural form used with context-dependent reference. Consult the linked lexicon and grammar.'},
 {id:'G3056',word:'λόγος',transliteration:'logos',context:'John 1:1',description:'Greek word commonly translated “word”; historical meaning varies with context.'}
]
const btn:CSSProperties={minHeight:56,padding:'12px 16px',borderRadius:14,border:'1px solid #bc9c63',background:'#1b2c40',color:'#fff',fontSize:16,fontWeight:800,cursor:'pointer',touchAction:'manipulation'}
function readReceipt():Receipt[]{try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x.filter(v=>v&&typeof v.lesson==='string').slice(-30):[]}catch{return[]}}
function validStrongId(value:string):boolean{const id=value.toUpperCase().trim();const m=/^([HG])(\d{1,4})$/.exec(id);if(!m)return false;const n=Number(m[2]);return n>=1&&n<=(m[1]==='H'?8674:5624)}
export default function FaithVerseLanguageAcademy({onOpenHoloBook}:{onOpenHoloBook?:()=>void}){
 const [lesson,setLesson]=useState<Lesson>('alphabet')
 const [letter,setLetter]=useState(0)
 const [strong,setStrong]=useState('H7225')
 const [large,setLarge]=useState(false)
 const [receipts,setReceipts]=useState<Receipt[]>(readReceipt)
 const [quizChoice,setQuizChoice]=useState<number|null>(null)
 const [notice,setNotice]=useState('Existing FaithVerse Paleo-Hebrew, Strong’s and etymology study connected. Verified lexical entries still require attributed source data.')
 const row=PALEO_HEBREW_ALPHABET[letter]
 const source=useMemo(()=>validStrongId(strong)?STRONGS_STUDY.sourceUrl(strong):'',[strong])
 const example=EXAMPLE.find(x=>x.id===strong.toUpperCase().trim())
 const mark=()=>{
  const next=[...receipts,{date:new Date().toISOString(),lesson,completed:true,selectedLetter:row[0],strongId:strong}].slice(-30)
  setReceipts(next);try{localStorage.setItem(KEY,JSON.stringify(next));setNotice('Study checkpoint saved locally; this is not a school certification or cloud grade.')}catch{setNotice('Device storage unavailable; no checkpoint saved.')}
 }
 const askTutor=()=>{
  const prompt=lesson==='alphabet'? `Teach the Hebrew letter ${row[0]} (modern ${row[1]}, reference Paleo-Hebrew glyph ${row[2]}). Explain its historical script, transliteration and uncertainty; give one simple practice quiz. Do not claim ancient pictograms establish word etymologies.`:
   `Help me study Strong's ${strong} through a cited lexical source, original lemma, grammatical form, historical etymology, semantic range and one biblical example. Separate verified lexicon facts from generated interpretation; state when the data is unavailable. No fabricated Hebrew or Greek roots.`
  window.dispatchEvent(new CustomEvent('tryamm:hologpt-study-context',{detail:{prompt,source:'faithverse-language-academy',verifiedLexiconEntry:false}}))
  setNotice('Study context sent to the existing HoloGPT event path. An actual assistant reply has not been independently verified.')
 }
 useEffect(()=>{if(lesson!=='quiz')setQuizChoice(null)},[lesson])
 return <section aria-label="Paleo-Hebrew and Strong's etymology academy" style={{display:'grid',gap:13,background:'#0a1927',border:'1px solid #8b784e',borderRadius:18,padding:'clamp(12px,3vw,20px)',color:'#fff'}}>
  <h2 style={{margin:0,fontSize:24}}>Language of Creation · Hebrew & Strong’s Academy</h2>
  <p style={{lineHeight:1.6,margin:0}}>Learn Hebrew letterforms, Strong’s reference numbers, and word etymology through the original FaithVerse study systems. The phrase “Language of Creation” is your faith-study title, not a historical proof about language origins.</p>
  <nav aria-label="Choose language lesson" style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>{(['alphabet','concordance','etymology','quiz'] as Lesson[]).map(id=><button key={id} style={{...btn,background:lesson===id?'#496454':'#1b2c40'}} aria-pressed={lesson===id} onClick={()=>setLesson(id)}>{id==='alphabet'?'Paleo-Hebrew':id==='concordance'?'Strong’s Concordance':id==='etymology'?'Word Etymology':'Practice Quiz'}</button>)}</nav>
  {lesson==='alphabet'&&<>
   <p style={{fontSize:13,lineHeight:1.6,margin:0}}>{PALEO_HEBREW_STUDY_RULES.glyphBoundary}</p>
   <div aria-label="Letter practice" style={{background:'#132d3a',padding:20,borderRadius:15,textAlign:'center'}}>
    <div style={{fontSize:large?76:60}}>{row[1]} · {row[2]}</div><h3 style={{fontSize:23,margin:'5px 0'}}>{row[0]}</h3><p style={{fontSize:17}}>Conventional transliteration: {row[3]}</p>
    <p style={{fontSize:12}}>{letter+1} of {PALEO_HEBREW_ALPHABET.length} letters</p>
   </div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}><button style={btn} onClick={()=>setLetter(n=>(n+PALEO_HEBREW_ALPHABET.length-1)%PALEO_HEBREW_ALPHABET.length)}>Previous letter</button><button style={btn} onClick={()=>setLetter(n=>(n+1)%PALEO_HEBREW_ALPHABET.length)}>Next letter</button></div>
   <button style={btn} onClick={()=>setLarge(x=>!x)}>{large?'Standard glyph size':'Enlarge glyphs'}</button>
   <p style={{fontSize:13,lineHeight:1.6}}>{PALEO_HEBREW_STUDY_RULES.academicBoundary}</p>
  </>}
  {(lesson==='concordance'||lesson==='etymology')&&<>
   <p style={{lineHeight:1.6,margin:0}}>{lesson==='concordance'?STRONGS_STUDY.rule:'Etymology is a research question, not a guess from ancient letter drawings. Use attested forms, dated sources, language history and verified lexicon citations.'}</p>
   <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>{STRONGS_STUDY.starters.map(id=><button key={id} style={{...btn,minHeight:45,fontSize:14}} onClick={()=>setStrong(id)}>{id}</button>)}</div>
   <label htmlFor="faithverse-strong-input">Strong’s reference number (H1–H8674 / G1–G5624)</label>
   <input id="faithverse-strong-input" value={strong} onChange={e=>setStrong(e.target.value.toUpperCase().slice(0,5))} style={{...btn,fontWeight:400}} aria-invalid={!validStrongId(strong)}/>
   {!validStrongId(strong)&&<p role="alert">Enter a supported H-number or G-number before opening the source.</p>}
   {example?<article style={{background:'#152f31',borderRadius:13,padding:15}}><strong>{example.id} · {example.word} · {example.transliteration}</strong><p>Example context: {example.context}. {example.description}</p><small>Illustrative starting point only; verify the original source entry for full etymology.</small></article>:<p>Full lexical entry is not bundled for this number. Open the linked source; do not substitute AI-created definitions.</p>}
   <div style={{display:'grid',gap:9}}>{STAGES.map((step,i)=><article key={step.name} style={{borderBottom:'1px solid #496376',padding:'8px 0'}}><strong>{i+1}. {step.name} — {step.summary}</strong><p style={{margin:'5px 0',fontSize:14,lineHeight:1.5}}>{step.detail}</p></article>)}</div>
   {source&&<a href={source} target="_blank" rel="noreferrer noopener" style={{...btn,display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none'}}>Open Strong’s source for {strong}</a>}
  </>}
  {lesson==='quiz'&&<section style={{background:'#142c39',borderRadius:13,padding:14,display:'grid',gap:10}}>
   <h3 style={{fontSize:20}}>Quick practice</h3><p>What does a Strong’s number identify?</p>
   {['An indexed Hebrew or Greek lexical entry','A complete translation of a verse','Proof that ancient glyph shapes define every word'].map((answer,i)=><button key={i} onClick={()=>setQuizChoice(i)} aria-pressed={quizChoice===i} style={{...btn,textAlign:'left'}}>{answer}</button>)}
   {quizChoice!==null&&<p role="status">{quizChoice===0?'Correct. Strong’s numbers are lookup identifiers, so the source text and context still matter.':'Not quite. A number indexes a lexical entry; it does not itself prove a translation or etymology.'}</p>}
  </section>}
  <button style={{...btn,background:'#26515c'}} onClick={askTutor}>ASK HOLOGPT TO TEACH THIS LESSON</button>
  {onOpenHoloBook&&<button style={btn} onClick={onOpenHoloBook}>Open original FaithHoloBook study layers</button>}
  <button style={btn} onClick={mark}>SAVE STUDY CHECKPOINT ({receipts.length})</button>
  <p role="status" aria-live="polite" style={{fontSize:13,lineHeight:1.55}}>{notice}</p>
 </section>
}
