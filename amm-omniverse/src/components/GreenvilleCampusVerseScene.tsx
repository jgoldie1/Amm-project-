import {useEffect} from 'react'
import {JACOBIE_CAMPUS_PATH,CAMPUSVERSE_COLLEGEBOOK_LIBRARY} from '../data/campusVerseUicGreenvilleBridge'

export default function GreenvilleCampusVerseScene({onReturn}:{onReturn:()=>void}){
 useEffect(()=>{window.dispatchEvent(new CustomEvent('tryamm:campusverse-scene-ready',{detail:{campus:'greenville',character:'Jacobie',source:'greenville-campus-scene'}}))},[])
 const books=CAMPUSVERSE_COLLEGEBOOK_LIBRARY.filter(b=>b.campus==='greenville')
 return <main aria-label="Greenville CampusVerse Jacobie scene" style={{position:'fixed',inset:0,zIndex:15010,overflow:'auto',background:'linear-gradient(#081725,#102b36)',color:'#fff',padding:'72px 14px 28px',fontFamily:'system-ui'}}>
  <button onClick={onReturn} aria-label="Return to UIC StreetVerse" style={{position:'fixed',top:14,left:14,zIndex:15020,padding:'10px 12px',borderRadius:12,fontWeight:900}}>← UIC • CHICAGO</button>
  <section style={{maxWidth:720,margin:'0 auto'}}>
   <div style={{fontSize:12,fontWeight:900,letterSpacing:1.4}}>CAMPUSVERSE • GREENVILLE UNIVERSITY</div>
   <h1 style={{margin:'8px 0'}}>JACOBIE CAMPUS CHAPTER</h1>
   <p>Persistent CollegeBook identity • launch milestone {JACOBIE_CAMPUS_PATH.milestone}</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:8}}>
    {JACOBIE_CAMPUS_PATH.tracks.map(track=><button key={track} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:campusverse-mission-open',{detail:{campus:'greenville',character:'Jacobie',track}}))} style={{padding:14,borderRadius:12,fontWeight:850,textAlign:'left'}}>{track}</button>)}
   </div>
   <h2>CollegeBook</h2>
   {books.map(book=><button key={book.id} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:collegebook-open',{detail:book}))} style={{display:'block',width:'100%',margin:'7px 0',padding:12,borderRadius:10,textAlign:'left'}}><strong>{book.title}</strong><small style={{display:'block'}}>{book.subject} • {book.access}</small></button>)}
   <h2>Progression</h2><p>{JACOBIE_CAMPUS_PATH.flow.join(' → ')}</p>
  </section>
 </main>
}
