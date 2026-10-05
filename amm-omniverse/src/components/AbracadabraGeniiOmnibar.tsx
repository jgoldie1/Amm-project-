import {useEffect,useRef,useState} from 'react'
import type {AbracadabraSpellPlan} from '../runtime/AbracadabraGeniiRuntime'

type SpeechRecognitionLike={
  lang:string
  interimResults:boolean
  continuous:boolean
  start:()=>void
  stop:()=>void
  onresult:((event:any)=>void)|null
  onerror:((event:any)=>void)|null
  onend:(()=>void)|null
}

export default function AbracadabraGeniiOmnibar(){
  const [open,setOpen]=useState(false)
  const [intent,setIntent]=useState('')
  const [plan,setPlan]=useState<AbracadabraSpellPlan|null>(null)
  const [listening,setListening]=useState(false)
  const [status,setStatus]=useState('Say or type what you want the world to become.')
  const recognitionRef=useRef<SpeechRecognitionLike|null>(null)

  useEffect(()=>{
    const onOpen=()=>setOpen(true)
    const onPlan=(event:Event)=>{
      const next=(event as CustomEvent<{plan?:AbracadabraSpellPlan}>).detail?.plan||null
      setPlan(next)
      if(next?.blocked?.length)setStatus('BLOCKED • '+next.blocked.join(' • '))
      else if(next)setStatus('SPELL COMPILED • preview-first • receipt saved')
    }
    const onExecuted=(event:Event)=>{
      const next=(event as CustomEvent<{plan?:AbracadabraSpellPlan}>).detail?.plan
      if(next)setStatus('ABRACADABRA • world systems activated')
    }
    const onBlocked=(event:Event)=>{
      const next=(event as CustomEvent<{plan?:AbracadabraSpellPlan}>).detail?.plan
      if(next)setStatus('BLOCKED BY WORLD POLICY • '+next.blocked.join(' • '))
    }
    addEventListener('tryamm:abracadabra-open',onOpen)
    addEventListener('tryamm:abracadabra-plan',onPlan)
    addEventListener('tryamm:abracadabra-executed',onExecuted)
    addEventListener('tryamm:abracadabra-blocked',onBlocked)
    return()=>{
      removeEventListener('tryamm:abracadabra-open',onOpen)
      removeEventListener('tryamm:abracadabra-plan',onPlan)
      removeEventListener('tryamm:abracadabra-executed',onExecuted)
      removeEventListener('tryamm:abracadabra-blocked',onBlocked)
      recognitionRef.current?.stop()
    }
  },[])

  const cast=()=>{
    const text=intent.trim()
    if(!text){setStatus('Describe the world, mission, business, history, Holo or AR scene first.');return}
    dispatchEvent(new CustomEvent('tryamm:abracadabra-cast',{detail:{intent:text,source:'abracadabra-omnibar'}}))
  }

  const voice=()=>{
    if(listening){recognitionRef.current?.stop();setListening(false);return}
    const w=window as any
    const Recognition=w.SpeechRecognition||w.webkitSpeechRecognition
    if(!Recognition){setStatus('Voice dictation is not available in this browser. Type the spell instead.');return}
    const recognition:SpeechRecognitionLike=new Recognition()
    recognition.lang='en-US'
    recognition.interimResults=false
    recognition.continuous=false
    recognition.onresult=(event:any)=>{
      const text=String(event?.results?.[0]?.[0]?.transcript||'').trim()
      if(text){setIntent(text);setStatus('VOICE CAPTURED • review or cast')}
    }
    recognition.onerror=()=>{setListening(false);setStatus('Voice capture stopped. You can type instead.')}
    recognition.onend=()=>setListening(false)
    recognitionRef.current=recognition
    setListening(true)
    setStatus('LISTENING…')
    recognition.start()
  }

  const examples=[
    'Make Circle Park 2048 at night with rain, BJ running security, businesses open and a Green Zone around the school.',
    'Turn a vacant storefront into a barber shop with jobs, delivery, a mission and a Reel.',
    'Show Circle Park in 1998 as a source-labeled Time Machine reconstruction and put the exhibit in the Holographic Gallery.',
  ]

  if(!open)return null
  return <div role="dialog" aria-modal="true" aria-label="Abracadabra GENII" style={backdrop}>
    <section style={panel}>
      <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'start'}}>
        <div>
          <div style={{fontSize:9,letterSpacing:2.4,color:'#f3d36a',fontWeight:950}}>ABRACADABRA GENII • REALITY SPELL COMPILER</div>
          <h2 style={{margin:'5px 0'}}>Speak it. Build it. Live it.</h2>
          <div style={{fontSize:10,color:'#9db2c1',lineHeight:1.45}}>Intent → policy → assets → world → NPCs → city/RPG consequences → Time Machine/Holo/AR/VR → Reel/Mod → receipt.</div>
        </div>
        <button aria-label="Close Abracadabra" onClick={()=>setOpen(false)} style={button}>×</button>
      </div>

      <textarea aria-label="Abracadabra world intent" value={intent} onChange={e=>setIntent(e.target.value)} placeholder="Example: Make Circle Park 2048 at night…" style={field}/>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1.5fr',gap:7,marginTop:8}}>
        <button onClick={voice} style={{...button,borderColor:listening?'#ff6acb':'#6ce8ff88'}}>{listening?'■ STOP':'🎙 VOICE'}</button>
        <button onClick={cast} style={{...button,borderColor:'#f3d36aaa',background:'linear-gradient(135deg,#55400a,#17212b)'}}>✨ ABRACADABRA</button>
      </div>

      <div aria-live="polite" style={{marginTop:8,fontSize:10,color:plan?.blocked?.length?'#ffb37c':'#9dffc1',lineHeight:1.45}}>{status}</div>

      {plan&&<section style={card}>
        <div style={{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}>
          <b>{plan.lane.replaceAll('-',' ').toUpperCase()}</b>
          <span style={{fontSize:9,color:'#86eaff'}}>{plan.outputs.join(' • ')}</span>
        </div>
        <div style={{fontSize:10,marginTop:6,lineHeight:1.45}}>{plan.intent}</div>
        <div style={{fontSize:9,color:'#9fb0bb',marginTop:7}}>
          Actors: {plan.actors.length?plan.actors.join(', '):'dynamic'} • Assets: {plan.requestedAssets.length} • City actions: {plan.cityActions.length}
        </div>
        {plan.era&&<div style={{fontSize:9,color:'#d8b8ff',marginTop:4}}>ERA: {plan.era}</div>}
        {(plan.weather||plan.timeOfDay)&&<div style={{fontSize:9,color:'#9fdfff',marginTop:4}}>ENV: {[plan.weather,plan.timeOfDay].filter(Boolean).join(' • ')}</div>}
        {plan.blocked.length>0&&<div style={{marginTop:7,padding:8,borderRadius:10,border:'1px solid #ff865c66',background:'#2a100b',fontSize:9,color:'#ffd1c2'}}>POLICY BLOCK: {plan.blocked.join(' • ')}</div>}
      </section>}

      <div style={{marginTop:10,fontSize:9,color:'#7f939f'}}>TRY ONE</div>
      <div style={{display:'grid',gap:6,marginTop:5}}>
        {examples.map(example=><button key={example} onClick={()=>setIntent(example)} style={{...button,textAlign:'left',minHeight:38,fontSize:9,fontWeight:750}}>{example}</button>)}
      </div>
    </section>
  </div>
}

const backdrop:React.CSSProperties={position:'fixed',inset:0,zIndex:49600,display:'grid',placeItems:'center',padding:12,background:'rgba(2,5,10,.91)',backdropFilter:'blur(6px)'}
const panel:React.CSSProperties={width:'min(94vw,600px)',maxHeight:'90dvh',overflowY:'auto',padding:14,borderRadius:20,border:'1px solid #f3d36a77',background:'#071019f8',color:'#fff',fontFamily:'system-ui',boxShadow:'0 28px 100px #000e'}
const field:React.CSSProperties={width:'100%',boxSizing:'border-box',minHeight:110,marginTop:12,padding:12,borderRadius:14,border:'1px solid #49697b',background:'#030a11',color:'#fff',fontSize:15,lineHeight:1.4,resize:'vertical'}
const button:React.CSSProperties={minHeight:44,padding:'8px 11px',borderRadius:11,border:'1px solid #45697e',background:'#0b202d',color:'#fff',fontWeight:900,touchAction:'manipulation'}
const card:React.CSSProperties={marginTop:10,padding:11,border:'1px solid #31526a',borderRadius:13,background:'#081722'}
