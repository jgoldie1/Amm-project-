import {useEffect,useRef,useState} from 'react'
import {advanceHoloFon,HOLOFON_CONTACTS,initialHoloFonState,type HoloFonContact,type HoloFonAction} from '../runtime/StreetVerseHoloFonRuntime'
import {HOLOFON_MISSIONS,getHoloFonMission,speakHoloFonLine,stopHoloFonSpeech} from '../runtime/StreetVerseHoloFonMissionRuntime'
/** In-world fictional NPC calls; no microphone, phone network, or real users. */
export default function StreetVerseHoloFonHUD(){
 const [open,setOpen]=useState(false),[call,setCall]=useState(initialHoloFonState),[soundEnabled,setSoundEnabled]=useState(true)
 const ctx=useRef<AudioContext|null>(null)
 const [missionId,setMissionId]=useState<string|null>(null)
 const [voiceEnabled,setVoiceEnabled]=useState(true)
 const [subtitle,setSubtitle]=useState('')
 useEffect(()=>()=>{void ctx.current?.close();ctx.current=null;stopHoloFonSpeech()},[])
 useEffect(()=>{const onMission=(event:Event)=>{const id=(event as CustomEvent<{missionId?:string}>).detail?.missionId;const mission=id?getHoloFonMission(id):null;if(!mission)return;setMissionId(mission.id);setOpen(true);setCall(current=>current.status==='idle'?advanceHoloFon(current,'dial',mission.caller):current);setSubtitle('Incoming mission call: '+mission.title)};window.addEventListener('tryamm:streetverse-holofon-incoming-mission',onMission);return()=>window.removeEventListener('tryamm:streetverse-holofon-incoming-mission',onMission)},[])
 const tone=()=>{if(!soundEnabled)return;try{ctx.current??=new AudioContext();if(ctx.current.state==='suspended')void ctx.current.resume();const now=ctx.current.currentTime;for(const [index,freq] of [440,554,659].entries()){const o=ctx.current.createOscillator(),g=ctx.current.createGain(),start=now+index*.16;o.frequency.value=freq;o.type='sine';g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(.025,start+.01);g.gain.exponentialRampToValueAtTime(.0001,start+.13);o.connect(g);g.connect(ctx.current.destination);o.start(start);o.stop(start+.14)}}catch{/* audio unavailable */}}
 const act=(action:HoloFonAction,contact?:HoloFonContact)=>{
  const next=advanceHoloFon(call,action,contact);if(next===call)return
  setCall(next)
  if(action==='dial')tone()
  if(action==='answer'||action==='dial')window.dispatchEvent(new CustomEvent('tryamm:streetverse-holofon-hand-pose',{detail:{visible:true,pose:'phone'}}))
  if(action==='end'||action==='reject')window.dispatchEvent(new CustomEvent('tryamm:streetverse-holofon-hand-pose',{detail:{visible:false,pose:'idle'}}))
  if(action==='end'||action==='reject'){stopHoloFonSpeech();setSubtitle('');setMissionId(null)}
  if(action==='dial'&&contact)setMissionId(null)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-holofon-call',{detail:{action,status:next.status,contact:next.contact,fictional:true}}))
  if(action==='answer'&&next.contact){const mission=missionId?getHoloFonMission(missionId):null;const line=mission?.line||HOLOFON_CONTACTS[next.contact].line;setSubtitle(line);if(voiceEnabled)speakHoloFonLine(line);window.dispatchEvent(new CustomEvent('tryamm:streetverse-holofon-dialogue',{detail:{contact:next.contact,text:line,source:'npc-script',missionId:mission?.id}}))}
 }
 const btn={minHeight:46,borderRadius:9,border:'1px solid #69e5f9',background:'#113c53',color:'white',font:'700 12px system-ui',padding:'8px 12px'}
 return <div data-streetverse-holofon="true" style={{position:'fixed',right:8,bottom:'calc(env(safe-area-inset-bottom) + 150px)',zIndex:44000,width:open?'min(360px, calc(100vw - 24px))':'auto',maxWidth:'calc(100vw - 16px)',maxHeight:open?'min(72dvh, 610px)':undefined,overflowY:open?'auto':undefined,padding:open?14:0,background:open?'linear-gradient(155deg,rgba(7,37,68,.98),rgba(29,9,62,.97))':'transparent',border:open?'1px solid rgba(106,234,255,.85)':undefined,boxShadow:open?'0 0 0 2px rgba(62,203,255,.15),0 0 36px rgba(70,142,255,.48),0 16px 42px rgba(0,0,0,.65)':undefined,backdropFilter:open?'blur(18px)':undefined,borderRadius:16,color:'#dffaff',font:'600 13px system-ui'}}>
 <button type="button" style={btn} onClick={()=>setOpen(v=>!v)} aria-expanded={open}>📱 HOLO FON</button>
 {open&&<div style={{display:'grid',gap:8,marginTop:8}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}><strong style={{letterSpacing:2,color:'#81f3ff',textShadow:'0 0 12px #21d9ff'}}>◈ HOLO FON • LIVE DISPLAY</strong><button type="button" aria-label="Close Holo FON hologram" onClick={()=>setOpen(false)} style={{...btn,minWidth:46}}>✕</button></div><div aria-hidden="true" style={{height:3,borderRadius:10,background:'linear-gradient(90deg,#42e9ff,#aa78ff,#42e9ff)',boxShadow:'0 0 14px #40e7ff'}}/><div aria-live="polite">{call.status==='idle'?'Contacts':call.status.toUpperCase()+' • '+(call.contact?HOLOFON_CONTACTS[call.contact].name:'')}</div>
 {call.status==='idle'&&<><div>Incoming mission call test</div>{HOLOFON_MISSIONS.map(m=><button key={m.id} style={btn} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-holofon-incoming-mission',{detail:{missionId:m.id}}))}>INCOMING: {m.title}</button>)}<div>Contacts</div>{(Object.keys(HOLOFON_CONTACTS) as HoloFonContact[]).map(id=><button key={id} style={btn} onClick={()=>act('dial',id)}>CALL {HOLOFON_CONTACTS[id].name}</button>)}</>}
 {call.status==='ringing'&&<><button style={btn} onClick={()=>act('answer')}>ANSWER</button><button style={btn} onClick={()=>act('reject')}>DECLINE</button></>}
 {call.status==='connected'&&<><div role="status" aria-live="polite">{subtitle|| (call.contact?HOLOFON_CONTACTS[call.contact].line:'')}</div>{missionId&&getHoloFonMission(missionId)&&<button style={btn} onClick={()=>{const mission=getHoloFonMission(missionId);if(mission)window.dispatchEvent(new CustomEvent('tryamm:streetverse-holofon-destination',{detail:{missionId:mission.id,destination:mission.destination}}))}}>SHOW MISSION DESTINATION: {getHoloFonMission(missionId)?.destination}</button>}<button style={btn} onClick={()=>act('toggle-mute')}>{call.muted?'UNMUTE':'MUTE'} (demo)</button><button style={btn} onClick={()=>act('end')}>END CALL</button></>}
 <label style={{minHeight:44,display:'flex',alignItems:'center',gap:8}}><input type="checkbox" checked={voiceEnabled} onChange={e=>{setVoiceEnabled(e.target.checked);if(!e.target.checked)stopHoloFonSpeech()}}/> NPC voice (device speech)</label><label style={{minHeight:44,display:'flex',alignItems:'center',gap:8}}><input type="checkbox" checked={soundEnabled} onChange={e=>setSoundEnabled(e.target.checked)}/> Ring sound</label>
 <small>NPC scripted voice uses built-in device speech, not ElevenLabs or cloned voices. Destination button emits a map-request event; an actual map marker requires world integration.</small>
 </div>}
 </div>
}
