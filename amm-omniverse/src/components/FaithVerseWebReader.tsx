import {useEffect,useState,type CSSProperties} from 'react'

type BookMeta={id:string;name:string;file:string;chapterCount:number;verseCount:number}
type Manifest={schema:string;id:string;title:string;source:string;rights:string;bookCount:number;chapterCount:number;verseCount:number;epub:string;books:BookMeta[]}
type BookData={id:string;name:string;chapters:(string|null)[][]}
const ROOT='/faithverse-bibles/engwebp/'
const KEY='tryamm:faithverse:web:checkpoint:v1'
const bigButton:CSSProperties={minHeight:56,padding:'12px 14px',border:'1px solid #719daf',borderRadius:14,background:'#152e41',color:'#fff',fontSize:16,fontWeight:750,cursor:'pointer'}
function storedCheckpoint(){try{const raw=JSON.parse(localStorage.getItem(KEY)||'{}');return{book:typeof raw.book==='string'?raw.book:'GEN',chapter:Number.isInteger(raw.chapter)&&raw.chapter>0?raw.chapter:1}}catch{return{book:'GEN',chapter:1}}}
export default function FaithVerseWebReader({onOpenPress}:{onOpenPress?:()=>void}){
 const [manifest,setManifest]=useState<Manifest|null>(null)
 const [bookId,setBookId]=useState(()=>storedCheckpoint().book)
 const [chapter,setChapter]=useState(()=>storedCheckpoint().chapter)
 const [book,setBook]=useState<BookData|null>(null)
 const [loading,setLoading]=useState(true)
 const [error,setError]=useState('')
 const [large,setLarge]=useState(false)
 const [search,setSearch]=useState('')
 const [notice,setNotice]=useState('The full 66-book WEB source is available only after the official import passes publication checks.')
 useEffect(()=>{
  const controller=new AbortController()
  fetch(ROOT+'manifest.json',{signal:controller.signal,cache:'no-store'}).then(async r=>{if(!r.ok)throw new Error('Full edition has not been packaged in this deployment');return r.json()}).then(m=>{
   if(m.schema!=='tryamm.faithverse.bible.manifest.v1'||m.bookCount!==66||m.chapterCount!==1189||!Array.isArray(m.books)||m.books.length!==66)throw new Error('Incomplete or unexpected edition manifest')
   setManifest(m as Manifest);setLoading(false)
  }).catch(e=>{if(!controller.signal.aborted){setError(e.message||'Edition unavailable');setLoading(false)}})
  return()=>controller.abort()
 },[])
 useEffect(()=>{
  if(!manifest)return
  const target=manifest.books.find(x=>x.id===bookId)||manifest.books[0]
  if(!target||!/^[0-9A-Z]{3}$/.test(target.id)||target.file!==`books/${target.id}.json`){setError('Edition file path failed validation');return}
  const controller=new AbortController()
  setLoading(true);setError('')
  fetch(ROOT+target.file,{signal:controller.signal}).then(async r=>{if(!r.ok)throw new Error('Book download unavailable');return r.json()}).then(value=>{
   if(value.id!==target.id||!Array.isArray(value.chapters)||value.chapters.length!==target.chapterCount)throw new Error('Book data failed validation')
   setBook(value as BookData);setChapter(old=>Math.min(Math.max(old,1),value.chapters.length));setLoading(false)
  }).catch(e=>{if(!controller.signal.aborted){setError(e.message||'Book unavailable');setBook(null);setLoading(false)}})
  return()=>controller.abort()
 },[manifest,bookId])
 const verses=book?.chapters[chapter-1]||[]
 const readAloud=()=>{
  if(!book||!('speechSynthesis'in window)){setNotice('Read aloud is unavailable on this device.');return}
  window.speechSynthesis.cancel()
  const message=new SpeechSynthesisUtterance(book.name+' chapter '+chapter+'. '+verses.map((v,i)=>v===null?'':(i+1)+'. '+v).filter(Boolean).join(' '))
  message.lang='en';message.rate=.9
  window.speechSynthesis.speak(message)
  setNotice('Using device read-aloud; voice output is local to this browser.')
 }
 const saveCheckpoint=()=>{
  try{localStorage.setItem(KEY,JSON.stringify({book:bookId,chapter}));setNotice('Chapter checkpoint saved on this device. Cloud backup is not verified.')}
  catch{setNotice('Device storage is unavailable; checkpoint was not saved.')}
 }
 const exportPressManifest=()=>{
  if(!manifest)return
  const evidence={type:'kingdoms-press-bible-source-review',edition:manifest.id,title:manifest.title,source:manifest.source,rightsClaim:manifest.rights,sourceArchiveSHA256:(manifest as Manifest & {sourceArchiveSHA256?:string}).sourceArchiveSHA256||null,bookCount:manifest.bookCount,chapterCount:manifest.chapterCount,verseCount:manifest.verseCount,reviewStatus:'not-approved',contentAttached:false,note:'Review source, territorial rights, book counts, EPUB/PDF QA and editorial approvals before registration or publication.'}
  const blob=new Blob([JSON.stringify(evidence,null,2)],{type:'application/json'})
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='KingdomsPress_WEB_Source_Review.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500)
  setNotice('Kingdoms Press source-review metadata exported. No publication record was created.')
 }
 const downloadChapter=()=>{
  if(!book||!verses.length)return
  const text=[manifest?.title||'World English Bible',book.name+' '+chapter,'',...verses.map((v,i)=>v===null?'':(i+1)+'. '+v).filter(Boolean),'', 'Source: '+(manifest?.source||'')].join('\n')
  const object=new Blob([text],{type:'text/plain;charset=utf-8'})
  const url=URL.createObjectURL(object),a=document.createElement('a')
  a.href=url;a.download='FaithVerse_'+book.id+'_'+chapter+'.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500)
 }
 const filtered=verses.map((text,i)=>({text,n:i+1})).filter((item):item is {text:string;n:number}=>typeof item.text==='string'&&item.text.length>0).filter(({text,n})=>!search.trim()||String(n)===search.trim()||text.toLowerCase().includes(search.toLowerCase()))
 return <section aria-label="World English Bible complete chapter reader" style={{display:'grid',gap:12,color:'#fff'}}>
  <style>{'@media print{body *{visibility:hidden!important}#tryamm-bible-print,#tryamm-bible-print *{visibility:visible!important}#tryamm-bible-print{position:absolute!important;left:0!important;top:0!important;color:#111!important;background:#fff!important;width:100%!important;max-width:100%!important;height:auto!important;overflow:visible!important;box-shadow:none!important;font:12pt Georgia,serif!important}#tryamm-bible-print p{page-break-inside:avoid}}'}</style>
  <h2 style={{fontSize:22,margin:'4px 0'}}>Full 66-book Bible — World English Bible</h2>
  <p style={{lineHeight:1.6,margin:0}}>Independent public-domain translation, distinct from the KJV and the Ethiopian 81-book canon. Source: eBible.org. This reader activates only after the source archive is imported, its 66 books verified and the text packaged into the deployment.</p>
  {loading&&<p role="status">Loading source and book…</p>}
  {error&&<p role="alert" style={{padding:12,borderRadius:12,background:'#402b20'}}>{error}. You can still use the existing online KJV reader or import a rights-cleared edition in the local reader.</p>}
  {manifest&&<><p style={{color:'#e1d0a2',fontSize:13,margin:0}}>Source verified: {manifest.bookCount} books, {manifest.chapterCount} chapters, {manifest.verseCount.toLocaleString()} verses · {manifest.rights}</p>
   <label htmlFor="web-book">Book</label>
   <select id="web-book" value={bookId} onChange={e=>{setBookId(e.target.value);setChapter(1);setSearch('')}} style={bigButton}>{manifest.books.map(meta=><option key={meta.id} value={meta.id}>{meta.name}</option>)}</select>
   {book&&<><label htmlFor="web-chapter">Chapter</label>
    <select id="web-chapter" value={chapter} onChange={e=>{setChapter(Number(e.target.value));setSearch('')}} style={bigButton}>{book.chapters.map((_,i)=><option key={i} value={i+1}>Chapter {i+1}</option>)}</select>
    <label htmlFor="web-search">Find within chapter</label><input id="web-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search words or verse number" style={{...bigButton,fontWeight:400}}/>
    <article id="tryamm-bible-print" style={{borderRadius:18,border:'1px solid #607e88',background:'#102a2d',padding:'15px 20px'}}>
     <h3 style={{fontSize:24}}>{book.name} {chapter}</h3>
     {filtered.map(({text,n})=><p key={n} style={{fontSize:large?24:19,lineHeight:1.8,margin:'12px 0'}}><sup style={{marginRight:7,fontSize:12}}>{n}</sup>{text}</p>)}
     {filtered.length===0&&<p>No verses match the search in this chapter.</p>}
     <footer style={{fontSize:11,marginTop:16}}>World English Bible. Source: {manifest.source}</footer>
    </article>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>
      <button style={bigButton} disabled={chapter===1} onClick={()=>setChapter(c=>Math.max(1,c-1))}>Previous chapter</button>
      <button style={bigButton} disabled={chapter>=book.chapters.length} onClick={()=>setChapter(c=>Math.min(book.chapters.length,c+1))}>Next chapter</button>
      <button style={bigButton} onClick={readAloud}>Read aloud</button>
      <button style={bigButton} onClick={()=>window.speechSynthesis?.cancel()}>Stop voice</button>
      <button style={bigButton} onClick={saveCheckpoint}>Save checkpoint</button>
      <button style={bigButton} onClick={()=>setLarge(x=>!x)}>{large?'Standard text':'Large text'}</button>
      <button style={bigButton} onClick={downloadChapter}>Save chapter .txt</button>
      <button style={bigButton} onClick={()=>window.print()}>Print / Save PDF</button>
    </div>
   </>}
   <a href={ROOT+manifest.epub} download="FaithVerse_World_English_Bible.epub" style={{...bigButton,display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none'}}>Download complete WEB EPUB</a>
   <button style={bigButton} onClick={exportPressManifest}>Export Kingdoms Press source-review record</button>
   {onOpenPress&&<button style={bigButton} onClick={onOpenPress}>Open existing Kingdoms Press approval workflow</button>}
  </>}
  <p role="status" aria-live="polite" style={{fontSize:13,color:'#d4e6ec'}}>{notice}</p>
 </section>
}
