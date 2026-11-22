import {useEffect,useState,type CSSProperties} from 'react'
import FaithGalileePlayfield from './FaithGalileePlayfield'
import FaithVerseYeshuaPortrait from './FaithVerseYeshuaPortrait'
import FaithVerseMiraclesTheater from './FaithVerseMiraclesTheater'

type Moment='shore'|'boat'|'fishing'|'dialogue'|'reflection'
type Question='calling'|'compassion'|'work'
type Checkpoint={moment:Moment;fishCaught:number;questions:Question[];at:string}
const KEY='tryamm:faithverse:galilee-yeshua-visit:v1'
const MYCELIUM_KEY='tryamm:faithverse:mycelium:local-progress:v1'
type RPGMilestone='arrived_shore'|'boarded_boat'|'fishing_completed'|'studied_gospel'|'reflected'|'returned_streetverse'
const MILESTONES:readonly RPGMilestone[]=['arrived_shore','boarded_boat','fishing_completed','studied_gospel','reflected']
function readMycelium():RPGMilestone[]{try{const a=JSON.parse(localStorage.getItem(MYCELIUM_KEY)||'[]');return Array.isArray(a)?a.filter((x:unknown):x is RPGMilestone=>typeof x==='string'&&[...MILESTONES,'returned_streetverse'].includes(x as RPGMilestone)):[]}catch{return[]}}
const SOURCES=[
 {reference:'Mark 1:16–20',note:'Calling of fishermen by the Sea of Galilee'},
 {reference:'Luke 5:1–11',note:'Fishing, the boats, and a call to follow'},
 {reference:'John 21:1–14',note:'A later fishing account by the Sea of Tiberias'}
]
const QUESTIONS:Record<Question,{question:string;reply:string;reference:string}>={
 calling:{question:'What can following your calling mean?',reply:'This dramatized study dialogue invites you to consider responsibility, discipleship, and serving others. Read the cited Gospel passage and decide how it speaks to your life.',reference:'Mark 1:16–20'},
 compassion:{question:'How should I treat other people?',reply:'This dramatized study dialogue encourages kindness and care. Use Gospel accounts for the actual recorded teachings, and keep this reconstruction separate from scripture.',reference:'Matthew 22:37–40'},
 work:{question:'What can fishing teach me about work?',reply:'This dramatized study dialogue invites reflection on cooperation, patience, and a calling larger than daily work. Compare the fishing narratives for their actual wording.',reference:'Luke 5:1–11'}
}
const button:CSSProperties={minHeight:60,padding:'12px 16px',borderRadius:14,border:'1px solid #b0c7c6',background:'#18374a',color:'#fff',fontSize:16,fontWeight:800,cursor:'pointer',touchAction:'manipulation'}
function initial():Checkpoint{try{const d=JSON.parse(localStorage.getItem(KEY)||'{}');return{moment:['shore','boat','fishing','dialogue','reflection'].includes(d.moment)?d.moment:'shore',fishCaught:Number.isInteger(d.fishCaught)?Math.min(Math.max(d.fishCaught,0),3):0,questions:Array.isArray(d.questions)?d.questions.filter((q:unknown)=>q==='calling'||q==='compassion'||q==='work').slice(0,3):[],at:String(d.at||'')}}catch{return{moment:'shore',fishCaught:0,questions:[],at:''}}}
export default function FaithGalileeRoleplay({onClose,onOpenScripture,onReturnStreetVerse}:{onClose:()=>void;onOpenScripture:()=>void;onReturnStreetVerse:()=>void}){
 const [data,setData]=useState<Checkpoint>(initial)
 const [showMiracles,setShowMiracles]=useState(false)
 const [milestones,setMilestones]=useState<RPGMilestone[]>(readMycelium)
 const recordMilestone=(kind:RPGMilestone)=>{
  if(milestones.includes(kind))return
  const next=[...milestones,kind];setMilestones(next)
  try{localStorage.setItem(MYCELIUM_KEY,JSON.stringify(next))}catch{}
  // Local event only: Mycelium has not acknowledged or persisted a server transaction.
  window.dispatchEvent(new CustomEvent('tryamm:faithverse-mycelium-local-milestone',{detail:{eventId:'galilee:'+kind,missionId:'faith-galilee-v1',kind,source:'faithverse-galilee',isSimulation:true,hasFinancialValue:false,cloudPersisted:false}}))
 }
 const [selected,setSelected]=useState<Question>('calling')
 const [voice,setVoice]=useState(false)
 const [notice,setNotice]=useState('Educational, fictional reconstruction of first-century Galilee, not literal time travel or direct communication with Yeshua.')
 const update=(patch:Partial<Checkpoint>)=>{const next={...data,...patch,at:new Date().toISOString()};setData(next);try{localStorage.setItem(KEY,JSON.stringify(next))}catch{setNotice('Local checkpoint could not be saved.')}return next}
 const go=(moment:Moment)=>{update({moment});if(moment==='shore')recordMilestone('arrived_shore');if(moment==='boat')recordMilestone('boarded_boat');if(moment==='reflection'&&milestones.includes('studied_gospel'))recordMilestone('reflected');setNotice('Moved to '+moment+'. This is a narrated roleplay scene; a verified 3D world is not mounted here.')}
 const cast=()=>{if(data.moment!=='fishing')go('fishing');else if(data.fishCaught<3){const n=data.fishCaught+1;update({fishCaught:n});if(n===3)recordMilestone('fishing_completed');setNotice(n===3?'Fishing mission complete in this roleplay. Continue to the conversation and reflection.':'Net cast, fictional catch '+n+' of 3.')}else setNotice('Fishing is complete. Open the study conversation.')}
 const talk=()=>{const q=QUESTIONS[selected];update({moment:'dialogue',questions:Array.from(new Set([...data.questions,selected]))});recordMilestone('studied_gospel');setNotice('Scripture-guided fictional dialogue: '+q.reply);if(voice&&'speechSynthesis'in window){window.speechSynthesis.cancel();let utterance=new SpeechSynthesisUtterance('Educational simulation, not scripture quotation. '+q.reply);utterance.rate=.9;window.speechSynthesis.speak(utterance)}}
 const exportReport=()=>{const file={schema:'tryamm.faithverse.galilee-roleplay.v1',experience:'Galilee Fishing and Yeshua Study',checkpoint:data,localMyceliumMilestones:milestones,completedMyceliumRPG:MILESTONES.every(m=>milestones.includes(m)),completedFishing:data.fishCaught===3,sourceReferences:SOURCES,claims:{physicalTimeTravel:false,realDivineContact:false,real3dAvatarVerified:false,aiGeneratedDialogueNotScripture:true,cloudPersisted:false}}
 const blob=new Blob([JSON.stringify(file,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='FaithVerse_Galilee_Visit_Report.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);setNotice('Local roleplay receipt exported. No live game rewards or cloud save claimed.')}
 useEffect(()=>()=>{if('speechSynthesis'in window)window.speechSynthesis.cancel()},[])
 return <section role="dialog" aria-modal="true" aria-label="Galilee fishing and Yeshua time-machine roleplay" style={{position:'fixed',inset:0,zIndex:2147483610,overflow:'auto',background:'#071724',color:'#fff',padding:'max(16px,env(safe-area-inset-top)) 14px max(34px,env(safe-area-inset-bottom))'}}>
  <main style={{maxWidth:800,margin:'auto',display:'grid',gap:14}}>
   <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}><div><div style={{fontSize:12,letterSpacing:2,color:'#bde5f2'}}>FAITHVERSE CHRONO • FIRST-CENTURY GALILEE</div><h1 style={{margin:'6px 0',fontSize:28}}>Walk, Fish & Learn with Yeshua</h1></div><button style={button} onClick={onClose}>Close</button></header>
   <p style={{margin:0,border:'1px solid #d9b96c',borderRadius:12,padding:14,lineHeight:1.65}}>This is an educational reconstruction. Historical details are approximations; the Yeshua dialogue is an explicitly fictional, scripture-guided teaching simulation. It is not literal time travel, a verified recording of Jesus, a new scripture quotation, or contact with the divine.</p>
   <div aria-label="Roleplay scene" style={{minHeight:215,border:'2px solid #5e9caf',borderRadius:20,background:'linear-gradient(180deg,#233e58,#548696 60%,#174355 61%,#102c3e)',textAlign:'center',display:'grid',placeItems:'center',padding:20}}>
    <div><div style={{fontSize:56}} aria-hidden="true">{data.moment==='boat'||data.moment==='fishing'?'⛵':data.moment==='dialogue'?'📖':data.moment==='reflection'?'🕊️':'🌅'}</div><h2 style={{fontSize:23,margin:'8px 0'}}>{data.moment==='shore'?'The Galilee shoreline':data.moment==='boat'?'Board a reconstructed fishing boat':data.moment==='fishing'?'Cast a fishing net':data.moment==='dialogue'?'Ask a scripture-guided question':'Reflection and return'}</h2><p style={{margin:0}}>Fictional catch progress: {data.fishCaught} / 3</p></div>
   </div>
   <FaithGalileePlayfield onReach={go}/>
   <button style={{...button,background:'#55466e'}} onClick={()=>setShowMiracles(true)}>OPEN MIRACLE STORIES · WALK ON WATER</button>
   <nav aria-label="Time machine stages" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:8}}>
   {([{id:'shore',label:'Explore shore'},{id:'boat',label:'Board boat'},{id:'fishing',label:'Go fishing'},{id:'dialogue',label:'Talk / study'},{id:'reflection',label:'Reflect'}] as {id:Moment;label:string}[]).map(x=><button key={x.id} style={{...button,background:data.moment===x.id?'#386875':'#18374a'}} aria-pressed={data.moment===x.id} onClick={()=>go(x.id)}>{x.label}</button>)}</nav>
   {data.moment==='fishing'&&<button style={{...button,background:'#2a6358'}} onClick={cast}>{data.fishCaught>=3?'Fishing completed':'CAST NET · CATCH FISH'}</button>}
   {data.moment==='dialogue'&&<section style={{display:'grid',gap:10}}><h2 style={{fontSize:21,margin:0}}>Talk with Yeshua — dramatized learning conversation</h2><FaithVerseYeshuaPortrait /><p style={{fontSize:13,lineHeight:1.6}}>TRYAMM's artistic portrayal presents Yeshua as a Black Hebrew high-priest figure. The appearance and ceremonial garment are a devotional interpretation, not an authenticated historical portrait or a claim that this is how Yeshua dressed while fishing in Galilee.</p><label htmlFor="galilee-question">Choose a question</label><select id="galilee-question" style={button} value={selected} onChange={e=>setSelected(e.target.value as Question)}>{(Object.keys(QUESTIONS) as Question[]).map(q=><option key={q} value={q}>{QUESTIONS[q].question}</option>)}</select><button style={button} onClick={talk}>Hear simulated teaching response</button><label style={{display:'flex',alignItems:'center',gap:11}}><input type="checkbox" checked={voice} onChange={e=>setVoice(e.target.checked)} style={{width:22,height:22}}/>Read roleplay response aloud</label><p style={{color:'#e5cc8e'}}>Scripture reference: {QUESTIONS[selected].reference} (read actual text separately)</p></section>}
   <p role="status" aria-live="polite" style={{borderRadius:12,padding:12,background:'#132b3c',lineHeight:1.6,margin:0}}>{notice}</p>
   <section aria-label="Mycelium roleplay quest journal" style={{padding:15,border:'1px solid #77aa9f',borderRadius:15,background:'#103138',display:'grid',gap:7}}><h2 style={{fontSize:20,margin:0}}>Mycelium RPG · Mission journal</h2><p style={{fontSize:13,margin:0,lineHeight:1.5}}>The mushroom network quest path records local fictional accomplishments, not blockchain credits, public achievements, or server-confirmed mission rewards.</p>{MILESTONES.map(m=><div key={m} style={{padding:'7px 10px',borderBottom:'1px solid #385a60'}}>{milestones.includes(m)?'✓':'○'} {m.replaceAll('_',' ')}</div>)}<p role="status" style={{margin:0,color:'#e2dcbb'}}>Completed {MILESTONES.filter(m=>milestones.includes(m)).length} of {MILESTONES.length} quest steps</p></section>
   <article style={{display:'grid',gap:7}}><h2 style={{fontSize:19,margin:0}}>Source references for this reconstruction</h2>{SOURCES.map(x=><p key={x.reference} style={{margin:0}}><strong>{x.reference}</strong> — {x.note}</p>)}</article>
   <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:9}}><button style={button} onClick={onOpenScripture}>Open Metaverse Bible</button><button style={button} onClick={()=>{recordMilestone('returned_streetverse');onReturnStreetVerse()}}>Return to StreetVerse</button><button style={button} onClick={exportReport}>Export mission receipt</button><button style={button} onClick={()=>{update({moment:'shore',fishCaught:0,questions:[]});setMilestones([]);try{localStorage.removeItem(MYCELIUM_KEY)}catch{};setNotice('Started a new local educational visit.')}}>Restart visit</button></div>
   {showMiracles&&<FaithVerseMiraclesTheater onClose={()=>setShowMiracles(false)} onOpenBible={()=>{setShowMiracles(false);onOpenScripture()}} onReturnToGalilee={()=>setShowMiracles(false)}/>}
   <p style={{fontSize:12,color:'#c8d3da',lineHeight:1.65}}>Full production still requires original rigged 3D assets, animations, scene renderer, actual voice/NPC pipeline, persistent missions and independent Chromebook/iPhone acceptance.</p>
  </main>
 </section>
}
