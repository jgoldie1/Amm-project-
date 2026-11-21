import {useEffect,useState} from 'react'
export const LUXURY_LIFESTYLE_CAREERS=[
 {id:'butler',title:'Butler Training',tasks:['Welcome an arriving guest','Prepare a formal dining service','Complete hospitality assessment']},
 {id:'housekeeping',title:'Housekeeping Management',tasks:['Inspect guest suites','Assign cleaning shifts','Review room readiness']},
 {id:'chef',title:'Private Chef',tasks:['Plan a menu','Prepare a fictional meal','Serve a private dinner']},
 {id:'security',title:'Estate Security',tasks:['Check guest list','Inspect entry points','Complete a safety patrol']},
 {id:'events',title:'Event Planning',tasks:['Choose an event theme','Set up the venue','Welcome attendees']},
 {id:'design',title:'Interior Design',tasks:['Choose a room palette','Select furnishings','Present a room makeover']},
 {id:'maintenance',title:'Property Maintenance',tasks:['Inspect utilities','Complete a repair checklist','Sign off maintenance']}
] as const
const KEY='streetverse:luxury-lifestyle-careers:v1'
type Location='tampa'|'chicago'|'greenville'
function load():string[]{try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a.filter(x=>typeof x==='string'):[]}catch{return []}}
export function StreetVerseLuxuryLifestyleCareers(){
 const [open,setOpen]=useState(false)
 const [location,setLocation]=useState<Location>('greenville')
 const [career,setCareer]=useState<string>('butler')
 const [completed,setCompleted]=useState<string[]>(load)
 const [notice,setNotice]=useState('Choose a career and complete fictional training tasks.')
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(completed))}catch{}},[completed])
 const role=LUXURY_LIFESTYLE_CAREERS.find(c=>c.id===career)!
 const next=role.tasks.findIndex((_,i)=>!completed.includes(location+':'+career+':'+i))
 const finish=()=>{
  if(next<0)return
  const key=location+':'+career+':'+next
  setCompleted(s=>s.includes(key)?s:[...s,key])
  setNotice('Training step completed: +20 fictional career XP. No real employment or certification issued.')
  window.dispatchEvent(new CustomEvent('tryamm:luxury-career-task-complete',{detail:{location,career,taskIndex:next,rewardXP:20}}))
 }
 const field={width:'100%',minHeight:48,padding:8,borderRadius:8,fontSize:14} as const
 return <section aria-label="Luxury Lifestyle Career System" style={{position:'absolute',left:12,bottom:275,zIndex:43,width:'min(285px,62vw)',padding:10,background:'rgba(24,28,42,.96)',color:'white',border:'1px solid #d7c58b',borderRadius:12}}>
  <button type="button" style={field} onClick={()=>setOpen(v=>!v)}>{open?'CLOSE':'OPEN'} LUXURY CAREERS</button>
  {open&&<div style={{display:'grid',gap:7,fontSize:13}}>
   <label htmlFor="career-property">Estate</label>
   <select id="career-property" style={field} value={location} onChange={e=>setLocation(e.target.value as Location)}><option value="tampa">LaTeasia Tampa Mansion</option><option value="chicago">Jacobie Chicago Mansion</option><option value="greenville">Greenville Fraternity Mansion</option></select>
   <label htmlFor="career-role">Career</label>
   <select id="career-role" style={field} value={career} onChange={e=>setCareer(e.target.value)}>{LUXURY_LIFESTYLE_CAREERS.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select>
   <strong>{role.title}</strong>
   <p>{next<0?'Training chapter complete':role.tasks[next]}</p>
   <button type="button" style={field} disabled={next<0} onClick={finish}>{next<0?'COMPLETE':'COMPLETE TRAINING TASK (+20 XP)'}</button>
   <div role="status" aria-live="polite">{notice}</div>
   <small>21 training tasks per estate, 63 tracked estate-task combinations. Manual prototype progression; actual NPC interactions, wages, certification and employment contracts are not connected.</small>
  </div>}
 </section>
}
