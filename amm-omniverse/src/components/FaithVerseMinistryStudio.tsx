import {useState,type CSSProperties} from 'react'
const button:CSSProperties={minHeight:56,padding:12,borderRadius:12,border:'1px solid #a9c8dc',background:'#132a40',color:'#fff',fontSize:16,touchAction:'manipulation'}
const assets=[
 ['KIT AI Integrated V9.2','https://drive.google.com/file/d/1bimUrIgW_beNnP07VpUNnNlxm9oLitk_/view'],
 ['Full Game V9.2','https://drive.google.com/file/d/16SnYJVU1tmlSrQOFTtLQjyDaiayYdTc3/view'],
 ['Living City V8 AR/VR','https://drive.google.com/file/d/1V1gfLxCFHU-FAvFqu_KblILrGtNmSnJn/view'],
 ['Merged release PR #744','https://github.com/jgoldie1/Amm-project-/pull/744']
] as const
const lessons={
 youth:[{title:'Kindness',verse:'Ephesians 4:32',question:'How can you help a friend today?',choices:['Include someone who feels left out','Make fun of someone'],answer:0},{title:'Courage',verse:'Joshua 1:9',question:'What can you do when you feel worried?',choices:['Hide every worry','Ask a trusted adult for help'],answer:1}],
 teen:[{title:'Leadership through service',verse:'1 Peter 4:10',question:'Which action shows responsible leadership?',choices:['Listen and share responsibility','Demand that everyone agree'],answer:0},{title:'Digital citizenship',verse:'Proverbs 12:18',question:'What should you do before sharing someone’s story?',choices:['Post it without asking','Get permission and respect privacy'],answer:1}]
} as const
type Lane=keyof typeof lessons
export default function FaithVerseMinistryStudio({onStudy,onWorld,onPress}:{onStudy:()=>void;onWorld:()=>void;onPress:()=>void}){
 const [lane,setLane]=useState<Lane>('youth')
 const [index,setIndex]=useState(0)
 const [choice,setChoice]=useState<number|null>(null)
 const [draft,setDraft]=useState('')
 const [status,setStatus]=useState('')
 const lesson=lessons[lane][index]
 function select(next:Lane){setLane(next);setIndex(0);setChoice(null)}
 function download(){const blob=new Blob([JSON.stringify({studio:'FaithVerse',lane,lesson:lesson.title,reference:lesson.verse,leaderDraft:draft},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='faithverse-ministry-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus('Local export requested. Nothing uploaded or sent.')}
 return <section aria-label="FaithVerse Quantum Ministry Studio" style={{display:'grid',gap:12}}>
 <h2>FaithVerse Quantum Ministry Studio</h2>
 <nav aria-label="Ministry age tracks" style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>
 <button style={button} aria-pressed={lane==='youth'} onClick={()=>select('youth')}>Youth Ministry (6–12)</button>
 <button style={button} aria-pressed={lane==='teen'} onClick={()=>select('teen')}>Teen Ministry (13–17)</button></nav>
 <p>Parent or leader supervised learning. No private messaging, public profiles, donations or live broadcasts for minors in this studio. No personal information is required.</p>
 <article><h3>{lesson.title}</h3><p>Read with a trusted adult: {lesson.verse}</p><p>{lesson.question}</p><div style={{display:'grid',gap:8}}>{lesson.choices.map((label,i)=><button key={label} style={button} aria-pressed={choice===i} onClick={()=>setChoice(i)}>{label}</button>)}</div><p role="status">{choice===null?'Choose an answer.':choice===lesson.answer?'Correct! Discuss how to put this into practice.':'Try again and discuss with a trusted adult.'}</p><button style={button} onClick={()=>{setIndex((index+1)%lessons[lane].length);setChoice(null)}}>Next lesson</button></article>
 <button style={button} onClick={onStudy}>Open Bible reader</button>
 <button style={button} onClick={onWorld}>Open existing biblical world with an adult</button>
 <button style={button} onClick={onPress}>Open publishing studio (adult leader)</button>
 <details><summary>Adult leader workspace — Google tools</summary><p>Manual links only. Google OAuth, role verification and automated sync are not connected. Do not enter children's names or private information. Review all materials before sharing.</p><label htmlFor="faith-ministry-draft">Lesson or sermon draft</label><textarea id="faith-ministry-draft" rows={5} value={draft} onChange={e=>setDraft(e.target.value)} style={{width:'100%',boxSizing:'border-box',fontSize:16}}/><button style={button} onClick={download}>Export local draft</button><p role="status">{status}</p><div style={{display:'grid',gap:8}}>{[['Google Drive','https://drive.google.com/'],['Google Docs','https://docs.google.com/'],['Gmail Drafts','https://mail.google.com/mail/u/0/#drafts']].map(([label,url])=><a key={url} href={url} target="_blank" rel="noopener noreferrer" style={button}>{label}</a>)}</div></details>
 <details><summary>Original asset references — adult developer review</summary><p>Preserved originals; these links do not import or execute legacy code. Review rights, safety, dependencies and compatibility before reuse.</p><div style={{display:'grid',gap:8}}>{assets.map(([label,url])=><a key={url} href={url} target="_blank" rel="noopener noreferrer" style={button}>{label}</a>)}</div></details>
 </section>
}
