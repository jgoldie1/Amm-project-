import {useEffect,useState} from 'react'
import {JACOBIE_CAMPUS_PATH,CAMPUSVERSE_COLLEGEBOOK_LIBRARY} from '../data/campusVerseUicGreenvilleBridge'
import IllinoisCampusVerseNetwork from './IllinoisCampusVerseNetwork'

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
 const [status,setStatus]=useState('Greenville CampusVerse ready • choose a campus stop, study mission, or Jacobie track.')
 useEffect(()=>{window.dispatchEvent(new CustomEvent('tryamm:campusverse-scene-ready',{detail:{campus:'greenville',character:'Jacobie',source:'greenville-campus-scene'}}))},[])
 const books=CAMPUSVERSE_COLLEGEBOOK_LIBRARY.filter(b=>b.campus==='greenville')
 const startTrack=(track:string)=>{
  setActiveTrack(track);setStatus(`MISSION ACTIVE • ${track}`)
  const detail={missionId:`greenville:${track.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,title:`Greenville • ${track}`,objective:`Complete the ${track} CampusVerse chapter with Jacobie.`,campus:'greenville',character:'Jacobie',source:'greenville-campus-scene'}
  window.dispatchEvent(new CustomEvent('tryamm:campusverse-mission-open',{detail}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail}))
 }
 const routeHub=(hub:(typeof GREENVILLE_HUBS)[number])=>{
  setActiveHub(hub);setStatus(`CAMPUS ROUTE • ${hub.label} • ${hub.kind}`)
  window.dispatchEvent(new CustomEvent('tryamm:campusverse-destination',{detail:{campus:'greenville',hubId:hub.id,label:hub.label,kind:hub.kind,character:'Jacobie',source:'greenville-campus-scene'}}))
 }
 const openBook=(book:(typeof books)[number])=>{setSelectedBook(book);setStatus(`COLLEGEBOOK OPEN • ${book.title}`);window.dispatchEvent(new CustomEvent('tryamm:collegebook-open',{detail:book}))}
 const startBook=()=>{if(!selectedBook)return;startTrack(`CollegeBook • ${selectedBook.subject}`)}
 return <main aria-label="Greenville CampusVerse Jacobie scene" style={{position:'fixed',inset:0,zIndex:33000,overflow:'auto',background:'linear-gradient(#081725,#102b36 54%,#102419)',color:'#fff',padding:'calc(env(safe-area-inset-top) + 74px) 14px calc(env(safe-area-inset-bottom) + 28px)',fontFamily:'system-ui'}}>
  <button onClick={onReturn} aria-label="Return to UIC StreetVerse" style={{position:'fixed',top:'calc(env(safe-area-inset-top) + 12px)',left:14,zIndex:33020,minHeight:46,padding:'10px 12px',borderRadius:12,fontWeight:900}}>← UIC • CHICAGO</button>
  <section style={{maxWidth:760,margin:'0 auto'}}>
   <div style={{fontSize:12,fontWeight:900,letterSpacing:1.4}}>CAMPUSVERSE • GREENVILLE UNIVERSITY</div>
   <h1 style={{margin:'8px 0'}}>JACOBIE CAMPUS CHAPTER</h1>
   <p style={{marginTop:0,opacity:.88}}>Persistent CollegeBook identity • launch milestone {JACOBIE_CAMPUS_PATH.milestone}</p>
   <div aria-live="polite" style={{padding:'10px 11px',borderRadius:12,background:'#0b3140',border:'1px solid #63d8ff',fontWeight:850,fontSize:12}}>{status}</div>

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
 </main>
}
