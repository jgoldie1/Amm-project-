import {CAMPUSVERSE_CAMPUSES,CAMPUSVERSE_COLLEGEBOOK_LIBRARY,JACOBIE_CAMPUS_PATH} from '../data/campusVerseUicGreenvilleBridge'
export default function CampusVerseCollegeBookBridge(){
 return <section aria-label="UIC Greenville CollegeBook" style={{padding:12,borderRadius:14,background:'#091725ee',color:'#fff'}}>
  <strong>CAMPUSVERSE • COLLEGEBOOK</strong>
  <div style={{fontSize:12,opacity:.8,marginTop:4}}>{CAMPUSVERSE_CAMPUSES.uic.name} ⇄ {CAMPUSVERSE_CAMPUSES.greenville.name}</div>
  <div style={{marginTop:10,fontWeight:800}}>JACOBIE • {JACOBIE_CAMPUS_PATH.milestone}</div>
  {CAMPUSVERSE_COLLEGEBOOK_LIBRARY.map(b=><button key={b.id} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:collegebook-open',{detail:b}))} style={{display:'block',width:'100%',marginTop:7,padding:9,textAlign:'left',borderRadius:9}}>{b.title}<small style={{display:'block'}}>{b.subject} • {b.access}</small></button>)}
 </section>
}
