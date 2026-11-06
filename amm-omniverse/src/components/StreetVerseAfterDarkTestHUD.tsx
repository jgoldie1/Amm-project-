import {useEffect,useRef,useState} from 'react'
import {advanceAfterDarkTest,createAfterDarkSound,initialAfterDarkTestState,type AfterDarkTestAction} from '../runtime/StreetVerseAfterDarkTestRuntime'
/** Compact optional nightlife test panel; adult partner interactions remain gated elsewhere. */
export default function StreetVerseAfterDarkTestHUD(){
 const [open,setOpen]=useState(false)
 const [state,setState]=useState(initialAfterDarkTestState)
 const [muted,setMuted]=useState(false)
 const [message,setMessage]=useState('Nightlife preview: solo dancing, sitting and ambience')
 const sound=useRef<ReturnType<typeof createAfterDarkSound>|null>(null)
 useEffect(()=>()=>{sound.current?.dispose();sound.current=null},[])
 const act=(action:AfterDarkTestAction)=>{
  const result=advanceAfterDarkTest(state,action)
  if(!result.ok){setMessage(result.reason||'Unavailable');return}
  setState(result.state)
  if(!sound.current)sound.current=createAfterDarkSound()
  sound.current.mute(muted)
  if(result.sound)sound.current.play(result.sound)
  if(result.animation)window.dispatchEvent(new CustomEvent('tryamm:streetverse-life-animation',{detail:{action,animation:result.animation,species:'human',mode:'after-dark'}}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-after-dark-test',{detail:{action,active:result.state.active}}))
  setMessage(result.animation?result.animation+' action queued; skeletal clip playback not verified':action==='enter'?'After Dark preview entered':action==='exit'?'Returned to Chicago':'Ambient sound cue requested')
 }
 const buttonStyle={minHeight:46,padding:'8px 10px',borderRadius:9,border:'1px solid #ba9eff',background:'#352153',color:'#fff',font:'700 12px system-ui',touchAction:'manipulation' as const}
 return <div data-streetverse-after-dark-test="true" style={{position:'fixed',right:'max(8px,env(safe-area-inset-right))',top:'calc(env(safe-area-inset-top) + 140px)',zIndex:43000,width:open?240:'auto',maxWidth:'calc(100vw - 20px)',padding:open?10:0,borderRadius:12,background:open?'rgba(25,12,40,.97)':'transparent',color:'#fff',font:'700 12px system-ui'}}>
  <button type="button" onClick={()=>setOpen(v=>!v)} aria-expanded={open} style={buttonStyle}>🌙 AFTER DARK</button>
  {open&&<div style={{display:'grid',gap:8,marginTop:8}}>
   <div aria-live="polite">{message}</div>
   {!state.active?<button style={buttonStyle} onClick={()=>act('enter')}>ENTER NIGHTLIFE PREVIEW</button>:<>
    <button style={buttonStyle} onClick={()=>act('dance')}>DANCE + MUSIC</button>
    <button style={buttonStyle} onClick={()=>act('sit')}>SIT + CHAIR SOUND</button>
    <button style={buttonStyle} onClick={()=>act('ambient')}>NIGHT AMBIENCE</button>
    <button style={buttonStyle} onClick={()=>act('exit')}>EXIT AFTER DARK</button>
   </>}
   <label style={{minHeight:44,display:'flex',alignItems:'center',gap:8}}><input type="checkbox" checked={muted} onChange={e=>{setMuted(e.target.checked);sound.current?.mute(e.target.checked)}}/> Mute sound effects</label>
   <small>Solo, non-explicit test. Partner interactions require real adult verification and mutual consent. Not a complete nightclub scene.</small>
  </div>}
 </div>
}
