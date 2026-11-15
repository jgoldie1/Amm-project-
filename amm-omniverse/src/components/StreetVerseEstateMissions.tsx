import {useEffect,useState} from 'react'
export type EstateKey='lateasia'|'bj'|'greenville'
export type EstateAction='arrive'|'housekeeping'|'maintenance'|'staff'|'event'|'security'|'chef'|'butler'|'design'|'inspect'
export const ESTATE_MISSION_EVENT='tryamm:estate-mission-action'
const TASKS:{action:EstateAction;title:string}[]=[
 {action:'arrive',title:'Arrive at the estate entrance'},
 {action:'inspect',title:'Inspect the estate and grounds'},
 {action:'staff',title:'Start the household staff shift'},
 {action:'housekeeping',title:'Complete the housekeeping inspection'},
 {action:'butler',title:'Prepare a butler guest welcome'},
 {action:'chef',title:'Organize private chef service'},
 {action:'security',title:'Complete the estate security check'},
 {action:'maintenance',title:'Repair and inspect estate facilities'},
 {action:'design',title:'Plan an interior design upgrade'},
 {action:'event',title:'Schedule an estate gathering'}
]
export const ESTATE_MISSIONS:Record<EstateKey,{id:string;title:string;action:EstateAction}[]>={
 lateasia:TASKS.map((t,i)=>({...t,id:'TM'+String(i+1).padStart(2,'0')})),
 bj:TASKS.map((t,i)=>({...t,id:'CM'+String(i+1).padStart(2,'0')})),
 greenville:TASKS.map((t,i)=>({...t,id:'GM'+String(i+1).padStart(2,'0')}))
}
const KEY='streetverse:estate-missions:v1'
function load():string[]{try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a.filter(v=>typeof v==='string'):[]}catch{return []}}
export function StreetVerseEstateMissions({onTravel}:{onTravel?:(estate:EstateKey)=>void}){
 const [open,setOpen]=useState(false)
 const [estate,setEstate]=useState<EstateKey>('greenville')
 const [completed,setCompleted]=useState<string[]>(load)
 const [notice,setNotice]=useState('Select an estate. Perform the matching action to finish each mission.')
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(completed))}catch{}},[completed])
 const current=ESTATE_MISSIONS[estate].find(m=>!completed.includes(m.id))
 useEffect(()=>{
  const handler=(event:Event)=>{
   const detail=(event as CustomEvent<{estate:EstateKey;action:EstateAction}>).detail
   if(!detail)return
   const mission=ESTATE_MISSIONS[detail.estate].find(m=>!completed.includes(m.id))
   if(mission&&mission.action===detail.action){
    setCompleted(s=>s.includes(mission.id)?s:[...s,mission.id])
    setNotice(mission.id+' completed through '+detail.action+' action. +30 fictional XP.')
    window.dispatchEvent(new CustomEvent('tryamm:estate-mission-complete',{detail:{estate:detail.estate,missionId:mission.id,rewardXP:30}}))
   }
  }
  window.addEventListener(ESTATE_MISSION_EVENT,handler)
  return()=>window.removeEventListener(ESTATE_MISSION_EVENT,handler)
 },[completed])
 const emit=(action:EstateAction)=>window.dispatchEvent(new CustomEvent(ESTATE_MISSION_EVENT,{detail:{estate,action}}))
 const btn={minHeight:48,width:'100%',borderRadius:8,padding:8,fontSize:14} as const
 return <section aria-label="Mansion missions" style={{position:'absolute',right:12,top:590,zIndex:46,width:'min(300px,65vw)',background:'rgba(21,29,41,.97)',color:'white',border:'1px solid #dbbf7b',borderRadius:12,padding:10}}>
  <button type="button" style={btn} onClick={()=>setOpen(v=>!v)}>{open?'CLOSE':'OPEN'} MANSION MISSIONS</button>
  {open&&<div style={{display:'grid',gap:8,fontSize:13}}>
   <label htmlFor="estate-mission-property">Estate</label>
   <select id="estate-mission-property" style={btn} value={estate} onChange={e=>setEstate(e.target.value as EstateKey)}><option value="lateasia">LaTeasia · Tampa</option><option value="bj">BJ Stubbs · Chicago</option><option value="greenville">Greenville · Fraternity Mansion</option></select>
   <strong>{ESTATE_MISSIONS[estate].filter(m=>completed.includes(m.id)).length}/10 completed</strong>
   {current?<><p>{current.id}: {current.title}</p>
    {current.action==='arrive'?<button type="button" style={btn} onClick={()=>{onTravel?.(estate);emit('arrive')}}>TRAVEL TO ESTATE</button>:<button type="button" style={btn} onClick={()=>emit(current.action)}>PERFORM {current.action.toUpperCase()} ACTION</button>}
   </>:<strong>All ten estate missions completed!</strong>}
   <div role="status" aria-live="polite">{notice}</div>
   <small>30 missions across three estates. RP actions trigger mission completion and local saves; this does not establish physical NPC interaction, real employment or verified multiplayer gameplay.</small>
  </div>}
 </section>
}
