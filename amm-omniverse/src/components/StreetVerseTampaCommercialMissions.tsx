import {useEffect,useState} from 'react'
const CHAPTERS=[
 {name:'Brand Outreach',tasks:['Meet a local merchant','Inspect a storefront','Identify a customer need','Explain the $450 website offer','Collect a business inquiry','Schedule a demo','Show a Holo Reel','Discuss brand identity','Review accessibility','Prepare a proposal']},
 {name:'Sales & Approvals',tasks:['Verify business contact','Review package deliverables','Confirm customer requirements','Prepare sample homepage','Explain fictional storefront options','Present a website preview','Request customer approval','Discuss payment methods safely','Record a sales inquiry','Send order for owner review']},
 {name:'World Builder Commerce',tasks:['Select a commercial lot','Inspect building condition','Choose storefront type','Plan shop signage','Place a demo display','Add a product category','Create a fictional business permit request','Connect a delivery mission','Assign a fictional NPC worker','Open a preview storefront']},
 {name:'Service & Community',tasks:['Welcome a salon customer','Recommend a hairstyle','Prepare a salon appointment demo','Visit the Riverwalk café','Assist a new entrepreneur','Explain rental options','Invite a business to the district','Plan a neighborhood event','Review storefront accessibility','Resolve a fictional customer complaint']},
 {name:'Growth & Leadership',tasks:['Inspect business demand','Review a fictional sales ledger','Prepare a brand partnership pitch','Discuss an approved commission plan','Host a small business showcase','Create a promotional reel concept','Plan a second storefront','Meet the business association','Review maintenance needs','Celebrate the district launch']}
] as const
export const TAMPA_COMMERCIAL_MISSIONS=CHAPTERS.flatMap((chapter,c)=>chapter.tasks.map((title,i)=>({id:'LC'+String(c*10+i+1).padStart(2,'0'),chapter:chapter.name,title,reward:25})))
const KEY='streetverse:tampa-commercial-missions:v1'
function load():string[]{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string'&&TAMPA_COMMERCIAL_MISSIONS.some(m=>m.id===x)):[]}catch{return []}}
export function StreetVerseTampaCommercialMissions(){
 const [open,setOpen]=useState(false)
 const [completed,setCompleted]=useState<string[]>(load)
 const [message,setMessage]=useState('Choose a mission. This is a fictional mission tracker, not proof of a real sale.')
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(completed))}catch{}},[completed])
 const next=TAMPA_COMMERCIAL_MISSIONS.find(m=>!completed.includes(m.id))
 const finish=()=>{
  if(!next)return
  setCompleted(s=>s.includes(next.id)?s:[...s,next.id])
  setMessage(next.id+' completed. +25 fictional RP XP. No real money, license, or customer order was created.')
  window.dispatchEvent(new CustomEvent('tryamm:tampa-commercial-mission-complete',{detail:{missionId:next.id,rewardXP:25}}))
 }
 return <section aria-label="LaTeasia commercial brand missions" style={{position:'absolute',left:12,top:280,zIndex:40,width:'min(290px,62vw)',background:'rgba(22,23,39,.96)',color:'white',border:'1px solid #edc0d7',padding:10,borderRadius:12}}>
  <button type="button" onClick={()=>setOpen(v=>!v)} style={{minHeight:48,width:'100%',fontSize:15,fontWeight:800,borderRadius:8}}> {open?'CLOSE':'OPEN'} LATEASIA • 50 MISSIONS</button>
  {open&&<div style={{fontSize:13}}>
   <p>Commercial brand representative · {completed.length}/50 missions</p>
   {next?<><strong>{next.id} · {next.chapter}</strong><p>{next.title}</p><button type="button" onClick={finish} style={{minHeight:52,width:'100%',fontWeight:800,borderRadius:8}}>COMPLETE RP MISSION (+25 XP)</button></>:<strong>All 50 missions completed!</strong>}
   <div role="status" aria-live="polite" style={{marginTop:8}}>{message}</div>
   <p style={{fontSize:11}}>This prototype tracks manual mission completion; NPC interactions and sales verification must be connected before production release.</p>
  </div>}
 </section>
}
