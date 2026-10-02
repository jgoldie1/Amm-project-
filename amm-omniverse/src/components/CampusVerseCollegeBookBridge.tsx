import {useState} from 'react'
import {CAMPUSVERSE_CAMPUSES,CAMPUSVERSE_COLLEGEBOOK_LIBRARY,JACOBIE_CAMPUS_PATH} from '../data/campusVerseUicGreenvilleBridge'

type Props={onClose?:()=>void}
const UIC_HUBS=[
 {id:'student-center-east',label:'Student Center East',district:'East Campus'},
 {id:'daley-library',label:'Richard J. Daley Library',district:'East Campus'},
 {id:'taylor-street-building',label:'Taylor Street Building',district:'Taylor Street'},
 {id:'roosevelt-road-building',label:'Roosevelt Road Building',district:'Roosevelt Road'},
] as const

export default function CampusVerseCollegeBookBridge({onClose}:Props){
 const [selectedBook,setSelectedBook]=useState<(typeof CAMPUSVERSE_COLLEGEBOOK_LIBRARY)[number]|null>(null)
 const [activeHub,setActiveHub]=useState<(typeof UIC_HUBS)[number]|null>(null)
 const [status,setStatus]=useState('Choose a UIC destination, CollegeBook item, or travel to Greenville.')
 const openHub=(hub:(typeof UIC_HUBS)[number])=>{
  setActiveHub(hub);setStatus(`UIC ROUTE READY • ${hub.label}`)
  window.dispatchEvent(new CustomEvent('tryamm:campusverse-destination',{detail:{campus:'uic',hubId:hub.id,label:hub.label,district:hub.district,source:'campusverse-collegebook'}}))
  window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:`UIC CampusVerse • ${hub.label} route ready`}}))
 }
 const openBook=(book:(typeof CAMPUSVERSE_COLLEGEBOOK_LIBRARY)[number])=>{
  setSelectedBook(book);setStatus(`COLLEGEBOOK OPEN • ${book.title}`)
  window.dispatchEvent(new CustomEvent('tryamm:collegebook-open',{detail:book}))
 }
 const startStudy=()=>{
  if(!selectedBook)return
  const detail={missionId:`collegebook:${selectedBook.id}`,id:`collegebook:${selectedBook.id}`,title:selectedBook.title,objective:`Complete the ${selectedBook.subject} CampusVerse study mission.`,campus:selectedBook.campus,source:'campusverse-collegebook'}
  window.dispatchEvent(new CustomEvent('tryamm:campusverse-mission-open',{detail}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail}))
  setStatus(`MISSION STARTED • ${selectedBook.title}`)
 }
 const travelGreenville=()=>{
  window.dispatchEvent(new CustomEvent('tryamm:campusverse-travel',{detail:{from:'uic',to:'greenville',character:'Jacobie',source:'campusverse-collegebook'}}))
  setStatus('TRAVEL • GREENVILLE CAMPUSVERSE')
 }
 return <section aria-label="UIC Greenville CollegeBook" style={{position:'fixed',left:12,right:12,top:'calc(env(safe-area-inset-top) + 70px)',bottom:'calc(env(safe-area-inset-bottom) + 82px)',zIndex:32050,padding:12,borderRadius:18,background:'#07131af5',color:'#fff',border:'1px solid #77e6ff88',boxShadow:'0 18px 60px #000c',overflow:'auto',fontFamily:'system-ui'}}>
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,position:'sticky',top:-12,background:'#07131af5',padding:'6px 0 10px',zIndex:2}}>
   <div><strong style={{display:'block'}}>CAMPUSVERSE • COLLEGEBOOK</strong><small style={{opacity:.78}}>{CAMPUSVERSE_CAMPUSES.uic.name} ⇄ {CAMPUSVERSE_CAMPUSES.greenville.name}</small></div>
   {onClose&&<button onClick={onClose} aria-label="Close CampusVerse" style={{width:44,height:44,borderRadius:12,fontWeight:950}}>×</button>}
  </div>
  <div aria-live="polite" style={{padding:'9px 10px',borderRadius:12,background:'#10283a',border:'1px solid #4b91ac',fontSize:12,fontWeight:800}}>{status}</div>

  <h3 style={{margin:'14px 0 7px'}}>UIC • CONNECTED DESTINATIONS</h3>
  <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7}}>
   {UIC_HUBS.map(hub=><button key={hub.id} onClick={()=>openHub(hub)} style={{minHeight:58,padding:9,borderRadius:11,textAlign:'left',fontWeight:850,border:activeHub?.id===hub.id?'2px solid #7be9ff':'1px solid #456'}}><span style={{display:'block'}}>{hub.label}</span><small>{hub.district}</small></button>)}
  </div>

  <h3 style={{margin:'14px 0 7px'}}>COLLEGEBOOK • OPEN + START</h3>
  {CAMPUSVERSE_COLLEGEBOOK_LIBRARY.map(book=><button key={book.id} onClick={()=>openBook(book)} style={{display:'block',width:'100%',marginTop:7,padding:10,textAlign:'left',borderRadius:10,border:selectedBook?.id===book.id?'2px solid #ffd76a':'1px solid #667',fontWeight:800}}>{book.title}<small style={{display:'block',marginTop:2}}>{book.subject} • {book.access}</small></button>)}
  {selectedBook&&<div style={{marginTop:9,padding:10,borderRadius:12,background:'#102317',border:'1px solid #65dd8a'}}><b>{selectedBook.title}</b><div style={{fontSize:12,marginTop:4}}>{selectedBook.subject}</div><button onClick={startStudy} style={{width:'100%',minHeight:44,marginTop:8,borderRadius:10,fontWeight:950}}>START STUDY MISSION</button></div>}

  <h3 style={{margin:'14px 0 7px'}}>GREENVILLE • JACOBIE</h3>
  <div style={{fontSize:12,opacity:.85,marginBottom:8}}>Launch milestone {JACOBIE_CAMPUS_PATH.milestone} • {JACOBIE_CAMPUS_PATH.tracks.join(' • ')}</div>
  <button onClick={travelGreenville} style={{width:'100%',minHeight:48,borderRadius:12,fontWeight:950}}>ENTER GREENVILLE CAMPUSVERSE →</button>
 </section>
}
