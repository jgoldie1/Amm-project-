import {ILLINOIS_CAMPUSVERSE_NETWORK} from '../data/campusVerseIllinoisUniversityNetwork'
export default function IllinoisCampusVerseNetwork(){
 return <section aria-label="Illinois CampusVerse university network" style={{padding:12,borderRadius:14,background:'#071725ee',color:'#fff'}}>
  <strong>ILLINOIS CAMPUSVERSE</strong><div style={{fontSize:11,opacity:.8}}>CollegeBook • PK • Holo LIVE • Skills Passport</div>
  {ILLINOIS_CAMPUSVERSE_NETWORK.map(c=><button key={c.id} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:campusverse-travel',{detail:{to:c.id,campus:c,source:'illinois-campusverse-network'}}))} style={{display:'block',width:'100%',marginTop:7,padding:10,borderRadius:10,textAlign:'left'}}>
   <strong>{c.name}</strong><small style={{display:'block'}}>{c.region} • {c.missionFamilies.slice(0,4).join(' • ')}</small>
  </button>)}
 </section>
}
