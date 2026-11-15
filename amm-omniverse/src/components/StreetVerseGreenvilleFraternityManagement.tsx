import {useEffect,useState} from 'react'
type Role='member'|'president'|'treasurer'|'events'|'house-manager'
type Application={id:string;name:string;reason:string;status:'pending'|'approved'|'declined'}
type Event={id:string;title:string;status:'planned'|'canceled'}
type State={applications:Application[];events:Event[];role:Role;budget:number;maintenance:number;duesPaid:number}
const KEY='streetverse:greenville-fraternity-management:v1'
const initial:State={applications:[],events:[],role:'member',budget:2500,maintenance:85,duesPaid:0}
function load():State{try{const v=JSON.parse(localStorage.getItem(KEY)||'null');return v&&Array.isArray(v.applications)&&Array.isArray(v.events)&&typeof v.budget==='number'?{...initial,...v}:initial}catch{return initial}}
export function StreetVerseGreenvilleFraternityManagement(){
 const [open,setOpen]=useState(false)
 const [state,setState]=useState<State>(load)
 const [name,setName]=useState('')
 const [reason,setReason]=useState('')
 const [eventTitle,setEventTitle]=useState('')
 const [notice,setNotice]=useState('CampusVerse fraternity house · fictional RP simulation.')
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}},[state])
 const canManage=state.role==='president'||state.role==='house-manager'
 const canFinance=state.role==='president'||state.role==='treasurer'
 const canEvents=state.role==='president'||state.role==='events'
 const update=(fn:(s:State)=>State,msg:string)=>{setState(fn);setNotice(msg)}
 const apply=()=>{
  if(name.trim().length<2||reason.trim().length<4){setNotice('Enter a name and a short reason to apply.');return}
  update(s=>({...s,applications:[...s.applications.slice(-29),{id:'APP-'+Date.now().toString(36),name:name.trim().slice(0,60),reason:reason.trim().slice(0,180),status:'pending'}]}),'Fictional application saved locally for review.')
  setName('');setReason('')
 }
 const button={minHeight:48,width:'100%',borderRadius:8,padding:8,fontSize:14} as const
 return <section aria-label="Greenville fraternity management" style={{position:'absolute',left:12,top:440,zIndex:44,width:'min(310px,65vw)',maxHeight:'65vh',overflowY:'auto',background:'rgba(22,29,40,.96)',color:'white',border:'1px solid #d7c48a',padding:10,borderRadius:12}}>
  <button type="button" style={button} onClick={()=>setOpen(v=>!v)}>{open?'CLOSE':'OPEN'} GREENVILLE FRAT HOUSE</button>
  {open&&<div style={{display:'grid',gap:8,fontSize:13}}>
   <strong>Campus Fraternity Management</strong>
   <p style={{margin:0}}>Fictional student organization. Membership is voluntary; no hazing or discriminatory admission requirements.</p>
   <label htmlFor="frat-role">Demo officer role</label>
   <select id="frat-role" style={button} value={state.role} onChange={e=>update(s=>({...s,role:e.target.value as Role}),'Demo role changed; production officer roles require authentication and authorization.')}>
    <option value="member">Member</option><option value="president">President</option><option value="treasurer">Treasurer</option><option value="events">Events Officer</option><option value="house-manager">House Manager</option>
   </select>
   <div>Fictional house budget: {state.budget} credits · Maintenance: {state.maintenance}/100</div>
   <label htmlFor="frat-app-name">Membership application name</label><input id="frat-app-name" style={button} maxLength={60} value={name} onChange={e=>setName(e.target.value)}/>
   <label htmlFor="frat-app-reason">Why join?</label><textarea id="frat-app-reason" style={{...button,minHeight:72}} maxLength={180} value={reason} onChange={e=>setReason(e.target.value)}/>
   <button type="button" style={button} onClick={apply}>SAVE APPLICATION</button>
   <strong>Applications ({state.applications.length})</strong>
   {state.applications.slice(-5).map(a=><div key={a.id} style={{border:'1px solid #63717b',padding:6,borderRadius:6}}>
    <strong>{a.name}</strong> · {a.status}<div>{a.reason}</div>
    {canManage&&a.status==='pending'&&<div style={{display:'flex',gap:4}}>
     {(['approved','declined'] as const).map(status=><button type="button" key={status} style={{...button,flex:1}} onClick={()=>update(s=>({...s,applications:s.applications.map(x=>x.id===a.id?{...x,status}:x)}),'Application '+status+' in this local RP demo.')}>{status.toUpperCase()}</button>)}
    </div>}
   </div>)}
   <strong>House operations</strong>
   <button type="button" style={button} disabled={!canFinance} onClick={()=>update(s=>({...s,budget:s.budget+50,duesPaid:s.duesPaid+1}),'Added 50 fictional credits; no real dues collected.')}>RECORD FICTIONAL DUES (+50)</button>
   <button type="button" style={button} disabled={!canManage||state.budget<100} onClick={()=>update(s=>({...s,budget:s.budget-100,maintenance:Math.min(100,s.maintenance+15)}),'House repair logged: -100 fictional credits.')}>MAINTENANCE REPAIR (-100)</button>
   <label htmlFor="frat-event">Campus event name</label><input id="frat-event" style={button} maxLength={80} value={eventTitle} onChange={e=>setEventTitle(e.target.value)}/>
   <button type="button" style={button} disabled={!canEvents||!eventTitle.trim()} onClick={()=>{update(s=>({...s,events:[...s.events.slice(-19),{id:'EV-'+Date.now().toString(36),title:eventTitle.trim().slice(0,80),status:'planned'}]}),'Fictional event planned; no real booking.');setEventTitle('')}}>PLAN CAMPUS EVENT</button>
   {state.events.slice(-5).map(e=><div key={e.id}>{e.title} · {e.status}</div>)}
   <div role="status" aria-live="polite">{notice}</div>
   <small>Local-only prototype. Officer permissions are simulated and must be server-enforced before multiplayer release. No real dues, employment, leases, or university affiliation.</small>
  </div>}
 </section>
}
