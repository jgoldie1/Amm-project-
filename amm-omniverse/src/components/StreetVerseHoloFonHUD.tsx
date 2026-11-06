import {useEffect,useRef,useState} from 'react'
import {advanceHoloFon,HOLOFON_CONTACTS,initialHoloFonState,type HoloFonContact,type HoloFonAction} from '../runtime/StreetVerseHoloFonRuntime'
/** In-world fictional NPC calls; no microphone, phone network, or real users. */
export default function StreetVerseHoloFonHUD(){
 const [open,setOpen]=useState(false),[call,setCall]=useState(initialHoloFonState),[soundEnabled,setSoundEnabled]=useState(true)
 const ctx=useRef<AudioContext|null>(null)
 useEffect(()=>()=>{void ctx.current?.close();ctx.current=null},[])
 const tone=()=>{if(!soundEnabled)return;try{ctx.current??=new AudioContext();if(ctx.current.state==='suspended')void ctx.current.resume();const now=ctx.current.currentTime;for(const [index,freq] of [440,554,659].entries()){const o=ctx.current.createOscillator(),g=ctx.current.createGain(),start=now+index*.16;o.frequency.value=freq;o.type='sine';g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(.025,start+.01);g.gain.exponentialRampToValueAtTime(.0001,start+.13);o.connect(g);g.connect(ctx.current.destination);o.start(start);o.stop(start+.14)}}catch{/* audio unavailable */}}
 const act=(action:HoloFonAction,contact?:HoloFonContact)=>{
  const next=advanceHoloFon(call,action,contact);if(next===call)return
  setCall(next)
  if(action==='dial')tone()
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-holofon-call',{detail:{action,status:next.status,contact:next.contact,fictional:true}}))
  if(action==='answer'&&next.contact)window.dispatchEvent(new CustomEvent('tryamm:streetverse-holofon-dialogue',{detail:{contact:next.contact,text:HOLOFON_CONTACTS[next.contact].line,source:'npc-script'}}))
 }
 const btn={minHeight:46,borderRadius:9,border:'1px solid #69e5f9',background:'#113c53',color:'white',font:'700 12px system-ui',padding:'8px 12px'}
 return <div data-streetverse-holofon="true" style={{position:'fixed',right:8,bottom:'calc(env(safe-area-inset-bottom) + 150px)',zIndex:44000,width:open?248:'auto',maxWidth:'calc(100vw - 16px)',padding:open?10:0,background:open?'rgba(4,19,39,.96)':'transparent',borderRadius:16,color:'#dffaff',font:'600 13px system-ui'}}>
 <button type="button" style={btn} onClick={()=>setOpen(v=>!v)} aria-expanded={open}>📱 HOLO FON</button>
 {open&&<div style={{display:'grid',gap:8,marginTop:8}}><strong>STREETVERSE • HOLO FON</strong><div aria-live="polite">{call.status==='idle'?'Contacts':call.status.toUpperCase()+' • '+(call.contact?HOLOFON_CONTACTS[call.contact].name:'')}</div>
 {call.status==='idle'&&<>{(Object.keys(HOLOFON_CONTACTS) as HoloFonContact[]).map(id=><button key={id} style={btn} onClick={()=>act('dial',id)}>CALL {HOLOFON_CONTACTS[id].name}</button>)}</>}
 {call.status==='ringing'&&<><button style={btn} onClick={()=>act('answer')}>ANSWER</button><button style={btn} onClick={()=>act('reject')}>DECLINE</button></>}
 {call.status==='connected'&&<><div>{call.contact?HOLOFON_CONTACTS[call.contact].line:''}</div><button style={btn} onClick={()=>act('toggle-mute')}>{call.muted?'UNMUTE':'MUTE'} (demo)</button><button style={btn} onClick={()=>act('end')}>END CALL</button></>}
 <label style={{minHeight:44,display:'flex',alignItems:'center',gap:8}}><input type="checkbox" checked={soundEnabled} onChange={e=>setSoundEnabled(e.target.checked)}/> Ring sound</label>
 <small>NPC script demo only. Calls do not connect to real people or phone numbers.</small>
 </div>}
 </div>
}
