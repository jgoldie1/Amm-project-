import {useEffect,useRef,useState} from 'react'
import {JACOBIE_CAMPUS_PATH,CAMPUSVERSE_COLLEGEBOOK_LIBRARY} from '../data/campusVerseUicGreenvilleBridge'
import IllinoisCampusVerseNetwork from './IllinoisCampusVerseNetwork'
import GreenvilleWalkableCampus,{GREENVILLE_CAMPUS_STOPS} from './GreenvilleWalkableCampus'
import {
 GREENVILLE_CAMPUS_MEMORY_SAVE_KEY,GREENVILLE_CAMPUS_MEMORY_EVENT,
 chooseGreenvilleCampusAction,greenvilleCampusGreeting,greenvilleCampusNPCDialogue,greenvilleCampusReputation,greenvilleCampusXp,
 initialGreenvilleCampusLivingMemory,readGreenvilleCampusLivingMemory,serializeGreenvilleCampusLivingMemory,
 type GreenvilleCampusChoice,type GreenvilleCampusLivingMemory,
} from '../runtime/GreenvilleCampusLivingMemory'

const GREENVILLE_HUBS=[
 {id:'student-union',label:'Student Union',kind:'student life'},
 {id:'hogue-lawn',label:'Hogue Lawn',kind:'campus commons'},
 {id:'burritt-hall',label:'Burritt Hall',kind:'residence'},
 {id:'blankenship-tower',label:'Tower / Blankenship',kind:'residence'},
 {id:'scott-field',label:'Scott Field',kind:'athletics'},
] as const

export default function GreenvilleCampusVerseScene({onReturn}:{onReturn:()=>void}){
 const [activeTrack,setActiveTrack]=useState<string|null>(null)
 const [activeHub,setActiveHub]=useState<(typeof GREENVILLE_HUBS)[number]|null>(null)
 const [selectedBook,setSelectedBook]=useState<(typeof CAMPUSVERSE_COLLEGEBOOK_LIBRARY)[number]|null>(null)
 const [status,setStatus]=useState('Greenville CampusVerse live • use the movement pad and walk to a glowing campus stop.')
 const [arrivedHubId,setArrivedHubId]=useState<string|null>(null)
 const [withinHub,setWithinHub]=useState(false)
 const withinHubRef=useRef(false)
 const [dialogue,setDialogue]=useState<ReturnType<typeof greenvilleCampusNPCDialogue>|null>(null)
 const [campusMemory,setCampusMemory]=useState<GreenvilleCampusLivingMemory>(()=>{
  try{return readGreenvilleCampusLivingMemory(localStorage.getItem(GREENVILLE_CAMPUS_MEMORY_SAVE_KEY))}
  catch{return initialGreenvilleCampusLivingMemory()}
 })
 const move=useRef({x:0,z:0})
 const reached=useRef(new Set<string>())
 useEffect(()=>{window.dispatchEvent(new CustomEvent('tryamm:campusverse-scene-ready',{detail:{campus:'greenville',character:'Jacobie',source:'greenville-campus-scene'}}))},[])
 useEffect(()=>{
  try{localStorage.setItem(GREENVILLE_CAMPUS_MEMORY_SAVE_KEY,serializeGreenvilleCampusLivingMemory(campusMemory))}catch{}
  window.dispatchEvent(new CustomEvent(GREENVILLE_CAMPUS_MEMORY_EVENT,{detail:{
   campus:'greenville',character:'Jacobie',fictional:true,source:'greenville-campus-local-rp',
   changes:campusMemory.entries.map(entry=>({...entry})),xp:greenvilleCampusXp(campusMemory),
  }}))
 },[campusMemory])
 const books=CAMPUSVERSE_COLLEGEBOOK_LIBRARY.filter(b=>b.campus==='greenville')
 const startTrack=(track:string)=>{
  const stop=/athletic/i.test(track)?GREENVILLE_CAMPUS_STOPS[4]:/cyber/i.test(track)?GREENVILLE_CAMPUS_STOPS[0]:/international/i.test(track)?GREENVILLE_CAMPUS_STOPS[2]:GREENVILLE_CAMPUS_STOPS[1]
  setActiveTrack(track);setActiveHub(GREENVILLE_HUBS.find(h=>h.id===stop.id)||null);setArrivedHubId(null);reached.current.delete(stop.id);setDialogue(null);withinHubRef.current=false;setWithinHub(false);setStatus(`MISSION ACTIVE • ${track} • walk to ${stop.label}`)
  const detail={missionId:`greenville:${track.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,title:`Greenville • ${track}`,objective:`Reach ${stop.label} and complete the ${track} CampusVerse chapter with Jacobie.`,campus:'greenville',character:'Jacobie',hubId:stop.id,x:stop.x,z:stop.z,source:'greenville-campus-3d'}
  window.dispatchEvent(new CustomEvent('tryamm:campusverse-mission-open',{detail}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail}))
 }
 const routeHub=(hub:(typeof GREENVILLE_HUBS)[number])=>{
  const stop=GREENVILLE_CAMPUS_STOPS.find(s=>s.id===hub.id);setActiveTrack(null);setActiveHub(hub);setArrivedHubId(null);reached.current.delete(hub.id);setDialogue(null);withinHubRef.current=false;setWithinHub(false);setStatus(`CAMPUS ROUTE • walk to ${hub.label}`)
  window.dispatchEvent(new CustomEvent('tryamm:campusverse-destination',{detail:{campus:'greenville',hubId:hub.id,label:hub.label,kind:hub.kind,x:stop?.x,z:stop?.z,character:'Jacobie',source:'greenville-campus-3d'}}))
 }
 const openBook=(book:(typeof books)[number])=>{setSelectedBook(book);setStatus(`COLLEGEBOOK OPEN • ${book.title}`);window.dispatchEvent(new CustomEvent('tryamm:collegebook-open',{detail:book}))}
 const startBook=()=>{if(!selectedBook)return;startTrack(`CollegeBook • ${selectedBook.subject}`)}
 const publishDialogue=(line:ReturnType<typeof greenvilleCampusNPCDialogue>)=>{
  setDialogue(line)
  window.dispatchEvent(new CustomEvent('tryamm:campusverse-npc-dialogue',{detail:{
   campus:'greenville',character:'Jacobie',hubId:line.hubId,
   speaker:line.speaker,text:line.text,remembered:line.remembered,
   fictional:true,scripted:true,source:'greenville-campus-local-npc',
  }}))
 }
 const talkToCampusMentor=()=>{
  if(!activeHub||arrivedHubId!==activeHub.id||!withinHub)return
  const line=greenvilleCampusNPCDialogue(campusMemory,activeHub.id)
  publishDialogue(line)
  setStatus(line.speaker+' • '+line.text)
 }
 const chooseCampusAction=(choice:GreenvilleCampusChoice)=>{
  if(!activeHub||arrivedHubId!==activeHub.id||!withinHub)return
  const result=chooseGreenvilleCampusAction(campusMemory,activeHub.id,choice)
  setStatus(result.message)
  if(result.ok){
   setCampusMemory(result.state)
   publishDialogue(greenvilleCampusNPCDialogue(result.state,activeHub.id))
  }
 }
 const setMove=(x:number,z:number)=>{move.current={x,z}}
 const stopMove=()=>{move.current={x:0,z:0}}
 const sensePosition=(x:number,z:number)=>{
  if(!activeHub)return
  const stop=GREENVILLE_CAMPUS_STOPS.find(s=>s.id===activeHub.id)
  if(!stop)return
  const d=Math.hypot(stop.x-x,stop.z-z)
  const near=d<5
  if(near!==withinHubRef.current){
   withinHubRef.current=near
   setWithinHub(near)
   if(!near)setDialogue(null)
  }
  if(d<5&&!reached.current.has(stop.id)){
   reached.current.add(stop.id)
   setArrivedHubId(stop.id)
   setStatus(`ARRIVED • ${stop.label} ✓ • ${greenvilleCampusGreeting(campusMemory,activeHub.id)}`)
   window.dispatchEvent(new CustomEvent('tryamm:campusverse-checkpoint',{detail:{campus:'greenville',hubId:stop.id,label:stop.label,character:'Jacobie',source:'greenville-campus-3d'}}))
   if(activeTrack)window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{id:`greenville:${activeTrack.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,title:activeTrack,campus:'greenville',checkpoint:stop.id}}))
  }
 }
 return <main aria-label="Greenville CampusVerse Jacobie scene" style={{position:'fixed',inset:0,zIndex:33000,overflow:'hidden',background:'#081725',color:'#fff',fontFamily:'system-ui'}}>
  <div style={{position:'absolute',inset:0}}><GreenvilleWalkableCampus move={move} onPosition={sensePosition} memory={campusMemory}/></div>
  <button onClick={onReturn} aria-label="Return to UIC StreetVerse" style={{position:'fixed',top:'calc(env(safe-area-inset-top) + 12px)',left:14,zIndex:33020,minHeight:46,padding:'10px 12px',borderRadius:12,fontWeight:900}}>← UIC • CHICAGO</button>
  <section style={{position:'absolute',left:12,top:'calc(env(safe-area-inset-top) + 72px)',zIndex:33010,width:'min(330px,72vw)',maxHeight:'58vh',overflow:'auto',padding:12,borderRadius:16,background:'#07131ae8',border:'1px solid #456'}}>
   <div style={{fontSize:12,fontWeight:900,letterSpacing:1.4}}>CAMPUSVERSE • GREENVILLE UNIVERSITY</div>
   <h1 style={{margin:'8px 0'}}>JACOBIE CAMPUS CHAPTER</h1>
   <p style={{marginTop:0,opacity:.88}}>Persistent CollegeBook identity • launch milestone {JACOBIE_CAMPUS_PATH.milestone}</p>
   <div aria-live="polite" style={{padding:'10px 11px',borderRadius:12,background:'#0b3140',border:'1px solid #63d8ff',fontWeight:850,fontSize:12}}>{status}</div>
   <div role="status" aria-label="CampusVerse saved character impact" style={{padding:'8px 10px',borderRadius:9,marginTop:8,background:'#17382d',color:'#bbfada',fontWeight:800,fontSize:12}}>
    Campus XP {greenvilleCampusXp(campusMemory)} • Neighborhood changes {campusMemory.entries.length}/5 • Trust {greenvilleCampusReputation(campusMemory)}
   </div>
   {activeHub&&arrivedHubId===activeHub.id&&withinHub&&<div aria-label="CampusVerse real checkpoint choice" style={{marginTop:9,padding:10,border:'1px solid #8ae7b8',borderRadius:11,background:'#0d2830',display:'grid',gap:7}}>
    <strong>YOU REACHED {activeHub.label.toUpperCase()}</strong>
    <div style={{fontSize:12}}>{greenvilleCampusGreeting(campusMemory,activeHub.id)}</div>
    <button type="button" aria-label="Talk to Greenville campus mentor" onClick={talkToCampusMentor} style={{minHeight:48,border:'1px solid #eac77f',borderRadius:9,background:'#534121',color:'#fff',fontWeight:850}}>TALK TO CAMPUS NPC</button>
    {dialogue&&dialogue.hubId===activeHub.id&&<div data-campusverse-npc-subtitles="true" role="status" aria-live="polite" style={{padding:10,border:'1px solid #719faa',borderRadius:9,background:'#102b37',fontSize:13,lineHeight:1.5}}>
     <strong>{dialogue.speaker}</strong>
     <div>{dialogue.text}</div>
     <small>Fictional scripted NPC • {dialogue.remembered?'remembers your past choice':'first meeting'} • captions on</small>
    </div>}
    {!campusMemory.entries.some(entry=>entry.hubId===activeHub.id)&&<div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:6}}>
     {(['help','learn','create'] as const).map(choice=><button key={choice} type="button" onClick={()=>chooseCampusAction(choice)} style={{minHeight:48,border:'1px solid #a2e5d5',borderRadius:9,background:'#164452',color:'#fff',fontWeight:850,fontSize:12}}>{choice.toUpperCase()}</button>)}
    </div>}
    <small>One fictional impact decision per location. Your choice is saved and changes the visible 3D campus; no real academic records are affected.</small>
   </div>}

   <h2 style={{marginBottom:8}}>Campus map • connected stops</h2>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(135px,1fr))',gap:8}}>
    {GREENVILLE_HUBS.map(hub=><button key={hub.id} onClick={()=>routeHub(hub)} style={{minHeight:64,padding:10,borderRadius:12,fontWeight:850,textAlign:'left',border:activeHub?.id===hub.id?'2px solid #7be9ff':'1px solid #5f7885'}}><span style={{display:'block'}}>{hub.label}</span><small>{hub.kind}</small></button>)}
   </div>

   <h2 style={{marginBottom:8}}>Jacobie mission tracks</h2>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:8}}>
    {JACOBIE_CAMPUS_PATH.tracks.map(track=><button key={track} onClick={()=>startTrack(track)} style={{minHeight:66,padding:12,borderRadius:12,fontWeight:850,textAlign:'left',border:activeTrack===track?'2px solid #ffd86d':'1px solid #657'}}>START • {track}</button>)}
   </div>

   <h2 style={{marginBottom:8}}>CollegeBook • open + learn</h2>
   {books.map(book=><button key={book.id} onClick={()=>openBook(book)} style={{display:'block',width:'100%',margin:'7px 0',padding:12,borderRadius:10,textAlign:'left',border:selectedBook?.id===book.id?'2px solid #7be9ff':'1px solid #667'}}><strong>{book.title}</strong><small style={{display:'block',marginTop:3}}>{book.subject} • {book.access}</small></button>)}
   {selectedBook&&<button onClick={startBook} style={{width:'100%',minHeight:46,borderRadius:11,fontWeight:950,marginTop:4}}>START THIS COLLEGEBOOK MISSION</button>}

   <h2>Illinois University Network</h2><IllinoisCampusVerseNetwork/>
   <h2>Connected progression</h2>
   <div style={{padding:11,borderRadius:12,background:'#0b1d25',border:'1px solid #36515f',fontWeight:800,lineHeight:1.55}}>{JACOBIE_CAMPUS_PATH.flow.join(' → ')}</div>
  </section>
  <div aria-label="Greenville movement controls" style={{position:'absolute',right:12,bottom:'calc(env(safe-area-inset-bottom) + 14px)',zIndex:33018,display:'grid',gridTemplateColumns:'52px 52px 52px',gridTemplateRows:'52px 52px 52px',gap:5,touchAction:'none'}}>
   <span/><button aria-label="Walk forward" onPointerDown={()=>setMove(0,-1)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{gridColumn:2,borderRadius:14,fontSize:22}}>▲</button><span/>
   <button aria-label="Walk left" onPointerDown={()=>setMove(-1,0)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{borderRadius:14,fontSize:22}}>◀</button><button aria-label="Stop walking" onClick={stopMove} style={{borderRadius:14,fontSize:10,fontWeight:900}}>STOP</button><button aria-label="Walk right" onPointerDown={()=>setMove(1,0)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{borderRadius:14,fontSize:22}}>▶</button>
   <span/><button aria-label="Walk backward" onPointerDown={()=>setMove(0,1)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{gridColumn:2,borderRadius:14,fontSize:22}}>▼</button><span/>
  </div>
 </main>
}
