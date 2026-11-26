import {useState,type CSSProperties} from 'react'

type Track='youth'|'teen'|'family'
const lessons={
 youth:[{title:'Kindness mission',verse:'Luke 10:25–37',question:'How can you help a neighbor?',choices:['Offer safe help with a trusted adult','Ignore someone who needs help'],answer:0},{title:'Courage and wisdom',verse:'1 Samuel 17',question:'What is a safe way to face a difficult task?',choices:['Take unnecessary risks','Ask for help and prepare carefully'],answer:1}],
 teen:[{title:'Digital citizenship',verse:'Ephesians 4:29',question:'What should you do before sharing a hurtful post?',choices:['Share it immediately','Stop, check the facts and consider the harm'],answer:1},{title:'Leadership through service',verse:'Mark 10:42–45',question:'What does service-centered leadership look like?',choices:['Listen and help others','Demand special treatment'],answer:0}],
 family:[{title:'Family service',verse:'1 Peter 4:10',question:'How can families serve their community?',choices:['Choose a safe volunteer activity together','Pressure others to participate'],answer:0}]
} as const
const button:CSSProperties={minHeight:56,padding:12,borderRadius:12,border:'1px solid #a9c8dc',background:'#132a40',color:'#fff',fontSize:16,cursor:'pointer',touchAction:'manipulation'}
const assets=[['StreetVerse Quantum V9.2 — KIT AI Integrated','https://drive.google.com/file/d/1bimUrIgW_beNnP07VpUNnNlxm9oLitk_/view'],['StreetVerse Quantum — Full Game','https://drive.google.com/file/d/16SnYJVU1tmlSrQOFTtLQjyDaiayYdTc3/view'],['Living City V8 — AR/VR','https://drive.google.com/file/d/1V1gfLxCFHU-FAvFqu_KblILrGtNmSnJn/view'],['Merged PR #744','https://github.com/jgoldie1/Amm-project-/pull/744']]
export default function FaithVerseMinistryStudio({onOpenBible,onOpenWorld}:{onOpenBible:()=>void;onOpenWorld:()=>void}){
 const [track,setTrack]=useState<Track>('youth')
 const [index,setIndex]=useState(0)
 const [choice,setChoice]=useState<number|null>(null)
 const lesson=lessons[track][index]!
 const [title,setTitle]=useState('')
 const [draft,setDraft]=useState('')
 const [status,setStatus]=useState('')
 const change=(t:Track)=>{setTrack(t);setIndex(0);setChoice(null);setTitle('');setDraft('');setStatus('')}
 const exportDraft=()=>{const blob=new Blob([title+'\n\n'+draft],{type:'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='faithverse-ministry-draft.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus('Download requested. No cloud upload or email sent.')}
 return <section aria-label="FaithVerse Quantum Ministry Studio" style={{display:'grid',gap:12,lineHeight:1.6}}>
 <h2>FaithVerse Quantum Ministry Studio</h2>
 <nav aria-label="Ministry learning tracks" style={{display:'grid',gap:8,gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))'}}>
 {(['youth','teen','family'] as const).map(t=><button key={t} style={button} aria-pressed={track===t} onClick={()=>change(t)}>{t==='youth'?'Youth Ministry · 5–12':t==='teen'?'Teen Ministry · 13–17':'Adult & Family Ministry'}</button>)}
 </nav>
 <p>Local learning preview. No account, messaging, donations, public profile or personal information is required. Children should explore with a trusted adult.</p>
 <article><h3>{lesson.title}</h3><p>Read and discuss: {lesson.verse}</p><p>{lesson.question}</p><div style={{display:'grid',gap:8}}>{lesson.choices.map((c,i)=><button key={c} style={button} aria-pressed={choice===i} onClick={()=>setChoice(i)}>{c}</button>)}</div><p role="status">{choice===null?'Choose an answer.':choice===lesson.answer?'Correct — discuss why with your group.':'Try again and think about safety and kindness.'}</p><button style={button} disabled={choice!==lesson.answer} onClick={()=>{setIndex((index+1)%lessons[track].length);setChoice(null)}}>Next lesson</button></article>
 {track==='family'&&<section style={{display:'grid',gap:8}}><h3>Adult leader resources</h3><p>External services require independent sign-in. These are links, not an authorized API connection. Do not enter private information about children. This learning track is not an authentication gate.</p><button style={button} onClick={onOpenBible}>Open Bible reader</button><button style={button} onClick={onOpenWorld}>Open biblical world</button><label>Teaching title<input style={{display:'block',width:'100%',boxSizing:'border-box',minHeight:48,fontSize:16}} value={title} onChange={e=>setTitle(e.target.value)}/></label><label>Teaching draft<textarea rows={5} style={{display:'block',width:'100%',boxSizing:'border-box',fontSize:16}} value={draft} onChange={e=>setDraft(e.target.value)}/></label><button style={button} disabled={!draft.trim()} onClick={exportDraft}>Download teaching draft</button><p role="status">{status}</p><a href="https://drive.google.com/" target="_blank" rel="noopener noreferrer">Open Google Drive</a><a href="https://docs.google.com/document/u/0/" target="_blank" rel="noopener noreferrer">Open Google Docs</a><a href="https://mail.google.com/mail/u/0/#drafts" target="_blank" rel="noopener noreferrer">Open Gmail Drafts</a></section>}
 </section>
}
export {assets as faithVerseRecoveryReferences}
