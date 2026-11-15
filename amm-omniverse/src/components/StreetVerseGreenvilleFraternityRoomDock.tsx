import {useState} from 'react'
import {GREENVILLE_FRAT_INTERACTION_EVENT,GREENVILLE_FRAT_ROOMS} from './StreetVerseGreenvilleFratMansion'
export function StreetVerseGreenvilleFraternityRoomDock(){
 const [open,setOpen]=useState(false)
 const [roomId,setRoomId]=useState(GREENVILLE_FRAT_ROOMS[0].id)
 const [notice,setNotice]=useState('Select a room to highlight its furnished 3D gallery.')
 const action=(action:string)=>{window.dispatchEvent(new CustomEvent(GREENVILLE_FRAT_INTERACTION_EVENT,{detail:{action,roomId}}));setNotice(action==='toggle-door'?'Front door toggled in 3D scene.':'Selected '+GREENVILLE_FRAT_ROOMS.find(r=>r.id===roomId)?.label+' in the 3D gallery.')}
 const button={minHeight:48,width:'100%',borderRadius:8,padding:8,fontSize:14} as const
 return <section aria-label="Greenville mansion room controls" style={{position:'absolute',left:12,top:600,zIndex:45,width:'min(280px,62vw)',padding:10,background:'rgba(26,32,42,.96)',color:'white',border:'1px solid #d2b883',borderRadius:12}}>
  <button type="button" style={button} onClick={()=>setOpen(v=>!v)}>{open?'CLOSE':'OPEN'} FRAT HOUSE ROOMS</button>
  {open&&<div style={{display:'grid',gap:8,fontSize:13}}>
   <button type="button" style={button} onClick={()=>action('toggle-door')}>OPEN / CLOSE FRONT DOOR</button>
   <label htmlFor="greenville-room">Student suite</label>
   <select id="greenville-room" style={button} value={roomId} onChange={e=>setRoomId(e.target.value)}>{GREENVILLE_FRAT_ROOMS.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}</select>
   <button type="button" style={button} onClick={()=>action('visit-room')}>INSPECT SUITE IN 3D</button>
   <div role="status" aria-live="polite">{notice}</div>
   <small>Visual room gallery and clickable door only. No collision, room teleport, multiplayer access control, or walkable interiors yet.</small>
  </div>}
 </section>
}
