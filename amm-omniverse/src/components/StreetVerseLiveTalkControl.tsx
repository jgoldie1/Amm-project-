import {useEffect,useRef,useState} from 'react'
import {installStreetVerseLiveTalkRuntime,type StreetVerseLiveTalkSnapshot} from '../runtime/StreetVerseLiveTalkRuntime'

const INITIAL:StreetVerseLiveTalkSnapshot={state:'idle',level:0,transcript:'',interim:'',speechRecognitionAvailable:false}

export default function StreetVerseLiveTalkControl(){
 const runtimeRef=useRef<ReturnType<typeof installStreetVerseLiveTalkRuntime>|null>(null)
 const [snap,setSnap]=useState<StreetVerseLiveTalkSnapshot>(INITIAL)
 const listening=snap.state==='listening'

 useEffect(()=>{
  const runtime=installStreetVerseLiveTalkRuntime('bj-stubbs')
  runtimeRef.current=runtime
  const onState=(event:Event)=>setSnap((event as CustomEvent<StreetVerseLiveTalkSnapshot>).detail||INITIAL)
  window.addEventListener('tryamm:live-talk-state',onState)
  return()=>{window.removeEventListener('tryamm:live-talk-state',onState);runtime.dispose();runtimeRef.current=null}
 },[])

 const toggle=()=>{
  const runtime=runtimeRef.current
  if(!runtime)return
  if(listening||snap.state==='requesting')runtime.stop()
  else void runtime.start()
 }

 const label=snap.state==='requesting'?'MIC…':listening?'TALKING':'TALK'
 const status=snap.state==='denied'?'MIC PERMISSION DENIED':snap.state==='unsupported'?'MIC NOT AVAILABLE':snap.state==='error'?'MIC ERROR':listening?(snap.speechRecognitionAvailable?'VOICE + DIALOGUE':'VOICE LIP-SYNC'):'TAP TO TALK IRL'
 const spoken=(snap.interim||snap.transcript.split(/(?<=[.!?])\s+/).slice(-1)[0]||'').trim()

 return <>
  <button
   aria-label={listening?'Stop live BJ microphone':'Start live BJ microphone'}
   aria-pressed={listening}
   onClick={toggle}
   style={{
    position:'fixed',
    top:'max(12px,calc(env(safe-area-inset-top) + 12px))',
    right:'max(126px,calc(env(safe-area-inset-right) + 126px))',
    zIndex:43020,
    minWidth:listening?86:48,
    height:48,
    padding:listening?'0 12px':'0',
    borderRadius:24,
    border:listening?'2px solid #ff6a7e':'2px solid #d9a7ff',
    background:listening?'#45131cee':'#161126ee',
    color:'#fff',
    font:'950 11px system-ui',
    boxShadow:listening?'0 0 20px #ff315766':'0 0 16px #b46cff55',
    touchAction:'manipulation',
   }}
  >{listening?'🎙 '+label:'🎙'}</button>
  {(listening||['requesting','denied','unsupported','error'].includes(snap.state))&&<aside
   aria-live="polite"
   aria-label="BJ live talk status"
   style={{
    position:'fixed',
    top:'max(68px,calc(env(safe-area-inset-top) + 68px))',
    right:'max(12px,calc(env(safe-area-inset-right) + 12px))',
    zIndex:43010,
    width:220,
    padding:10,
    borderRadius:14,
    border:'1px solid #875cc988',
    background:'rgba(6,10,18,.93)',
    color:'#fff',
    boxShadow:'0 14px 34px #000a',
    pointerEvents:'none',
   }}
  >
   <div style={{font:'950 10px system-ui',color:listening?'#ff9aaa':'#d9a7ff'}}>{status}</div>
   {listening&&<div style={{height:7,marginTop:7,borderRadius:99,background:'#252231',overflow:'hidden'}}><div style={{height:'100%',width:Math.round(snap.level*100)+'%',background:'linear-gradient(90deg,#b86cff,#ff6a7e)',transition:'width 60ms linear'}}/></div>}
   {spoken&&<div style={{marginTop:7,font:'700 11px/1.35 system-ui',color:'#dce6ee'}}>“{spoken.slice(-160)}”</div>}
   {listening&&!snap.speechRecognitionAvailable&&<small style={{display:'block',marginTop:6,color:'#96a8b6'}}>Lip-sync is live. Speech-to-text is unavailable in this browser.</small>}
  </aside>}
 </>
}
