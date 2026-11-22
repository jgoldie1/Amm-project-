import {useEffect,useState,type CSSProperties} from 'react'
type Action='talk'|'cook'|'work'|'help'|'drive'|'aim'|'fire'|'holster'
type Context='home'|'street'|'workplace'|'range'
type EventDetail={schema:'tryamm.action.local.v1';action:Action;context:Context;description:string;authoritative:false}
const ACTION_EVENT='tryamm:player-local-action'
const available:Record<Context,Action[]>={
 home:['cook','talk','help'],street:['talk','help','drive'],workplace:['work','talk','help'],range:['aim','fire','holster']
}
const desc:Record<Action,string>={
 talk:'NPC conversation opened (prototype).',cook:'Meal prepared in your virtual kitchen (prototype).',
 work:'Work shift completed in story mode (prototype).',help:'Offered assistance to an NPC (prototype).',
 drive:'Vehicle interaction requested (vehicle controller not yet connected).',
 aim:'Target practice aiming selected (fictional range only).',
 fire:'One virtual training target was tagged (no real weapon simulation connected).',
 holster:'Training tool put away.'
}
const btn:CSSProperties={minHeight:60,borderRadius:14,border:'2px solid #6dd3ff',background:'#183e59',color:'#fff',fontSize:17,fontWeight:800,padding:'12px',cursor:'pointer'}
export default function StreetVerseContextActions(){
 const [context,setContext]=useState<Context>('street')
 const [index,setIndex]=useState(0)
 const [open,setOpen]=useState(false)
 const [notice,setNotice]=useState('A = interact • B = back • ←/→ = select action. The 3D joystick remains separate.')
 const [actions,setActions]=useState(0)
 const menu=available[context]
 const emit=(action:Action)=>{
  if(action==='fire'&&context!=='range'){setNotice('Fire is only enabled in the clearly labeled fictional target-training range.');return}
  if(action==='fire'&&!open){setNotice('Open the range action menu first before selecting target practice.');return}
  const payload:EventDetail={schema:'tryamm.action.local.v1',action,context,description:desc[action],authoritative:false}
  window.dispatchEvent(new CustomEvent(ACTION_EVENT,{detail:payload}))
  setActions(x=>x+1);setNotice(desc[action]);setOpen(false)
 }
 const activate=()=>{if(!open){setOpen(true);setNotice('Action wheel open. Choose a task, then press A or INTERACT.')}else emit(menu[index]||menu[0])}
 const back=()=>{setOpen(false);setNotice('Closed the action wheel. Continue exploring.')}
 useEffect(()=>{
  const handle=(e:KeyboardEvent)=>{
   const target=e.target as HTMLElement|null
   if(target?.closest('input, textarea, select, [contenteditable]'))return
   const key=e.key.toLowerCase()
   if(key==='a'){e.preventDefault();activate()}
   else if(key==='b'||key==='escape'){e.preventDefault();back()}
   else if(open&&['arrowleft','arrowright'].includes(key)){e.preventDefault();setIndex(i=>(i+(key==='arrowright'?1:menu.length-1))%menu.length)}
  }
  window.addEventListener('keydown',handle)
  return ()=>window.removeEventListener('keydown',handle)
 },[open,index,context])
 return <section aria-label="StreetVerse original context action controls" style={{padding:16,border:'1px solid #578ca8',background:'#0b2237',borderRadius:16}}>
 <h2 style={{marginTop:0}}>StreetVerse A / B Interaction Controls</h2>
 <p style={{fontSize:15,lineHeight:1.6}}>Choose your location; the available actions change. This is a functional browser-level interaction prototype, not a wired 3D character animation or combat engine.</p>
 <label style={{display:'block',marginBottom:12,fontWeight:800}}>Action location:
 <select value={context} onChange={e=>{setContext(e.target.value as Context);setIndex(0);setOpen(false)}} style={{display:'block',width:'100%',marginTop:6,padding:14,borderRadius:10,background:'#152f4a',color:'#fff',fontSize:17,minHeight:58}}>
 <option value="street">Street / City</option><option value="home">Kitchen / Home</option><option value="workplace">Job / Workplace</option><option value="range">Fictional Training Range</option>
 </select></label>
 <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10}}>
 <button type="button" style={{...btn,background:'#215d48'}} onClick={activate}>A — {open?'INTERACT':'OPEN ACTIONS'}</button>
 <button type="button" style={btn} onClick={back}>B — BACK</button>
 </div>
 {open&&<div aria-label="Action wheel options" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:8,marginTop:14}}>
 {menu.map((action,i)=><button key={action} type="button" aria-pressed={i===index} onClick={()=>{setIndex(i);emit(action)}} style={{...btn,borderColor:i===index?'#ffd76d':'#6dd3ff',background:i===index?'#5b4576':'#183e59'}}>{action.toUpperCase()}</button>)}
 </div>}
 <p role="status" aria-live="polite" style={{color:'#ffe6a6',minHeight:42}}>{notice}</p>
 <p style={{fontSize:13,color:'#b9d1de'}}>Prototype actions triggered: {actions}. No firearms, injuries, real currency, authority, or real-life emergency services are controlled here. Game combat, if enabled in the 3D world later, needs a separate safety and accessibility acceptance test.</p>
 </section>
}
