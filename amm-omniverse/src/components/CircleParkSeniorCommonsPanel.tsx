import {CIRCLE_PARK_SENIOR_COMMONS,requestSeniorCommonsActivity} from '../data/circleParkSeniorCommons'
export default function CircleParkSeniorCommonsPanel({onClose}:{onClose:()=>void}){
 return <section aria-label="Circle Park Senior Commons" style={{position:'fixed',inset:12,zIndex:46000,overflow:'auto',padding:14,borderRadius:18,background:'#0a1715f5',color:'#fff'}}>
  <button onClick={onClose} style={{minHeight:44,borderRadius:12,fontWeight:900}}>← NEIGHBORHOOD</button>
  <h2>CIRCLE PARK SENIOR COMMONS</h2>
  <p>Accessible social, family, learning and storytelling hub.</p>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
   {CIRCLE_PARK_SENIOR_COMMONS.activities.map(a=><button key={a.id} onClick={()=>requestSeniorCommonsActivity(a.id)} style={{minHeight:54,borderRadius:12,fontWeight:900,textAlign:'left'}}>{a.label}</button>)}
  </div>
  <small style={{display:'block',marginTop:10}}>Large controls • seated mode • reduced motion • voice-ready. StreetVerse Roosevelt-side placement; not a surveyed building map.</small>
 </section>
}
