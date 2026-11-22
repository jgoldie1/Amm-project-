import {useEffect,useState} from 'react'
import {
  compileConstruct,
  getConstructHardwareReadiness,
  installSECSConstructRuntime,
  runConstructSelfTest,
  sendConstructToPrototype,
  type ConstructFrame,
} from '../runtime/SECSConstructRuntime'

export default function SECSConstructCenter({onClose}:{onClose?:()=>void}){
  const [status,setStatus]=useState('SECS Construct software prototype ready.')
  const [frame,setFrame]=useState<ConstructFrame|null>(null)
  const [hardware,setHardware]=useState(()=>getConstructHardwareReadiness())

  useEffect(()=>{
    installSECSConstructRuntime()
    const onReady=()=>setHardware(getConstructHardwareReadiness())
    addEventListener('tryamm:secs:hardware-readiness',onReady)
    return()=>removeEventListener('tryamm:secs:hardware-readiness',onReady)
  },[])

  const buildCube=()=>{
    const next=compileConstruct({
      id:'secs-ui-cube-'+Date.now().toString(36),
      shape:'cube',
      sizeMm:{x:100,y:100,z:100},
      positionMm:{x:0,y:0,z:250},
      haptics:{enabled:true,intensity:.15},
      mode:'simulation',
    })
    setFrame(next)
    setStatus(next.safety.allowed?'Cube construct compiled in simulation mode.':'Construct blocked by software safety gate.')
  }
  const selfTest=()=>{
    const result=runConstructSelfTest()
    setStatus(result.passed?`Software self-test PASS • ${result.count} constructs.`:'Software self-test FAILED.')
  }
  const send=()=>{
    if(!frame){setStatus('Compile a construct first.');return}
    const result=sendConstructToPrototype(frame)
    setHardware(getConstructHardwareReadiness())
    const blockedReason='reason' in result?String(result.reason||'readiness gate'):'readiness gate'
    setStatus(result.sent?'Prototype command emitted with verified hardware telemetry.':'Hardware send blocked • '+blockedReason)
  }

  return <div role="dialog" aria-label="SECS Construct Center" style={{position:'fixed',inset:0,zIndex:12400,overflowY:'auto',background:'radial-gradient(circle at 50% 0,#173345,#050812 55%,#020306)',color:'#fff',fontFamily:'system-ui,sans-serif'}}>
    <header style={{position:'sticky',top:0,zIndex:2,display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,padding:14,background:'#050812ee',borderBottom:'1px solid #5ce8ff55'}}>
      <div><div style={{fontSize:10,letterSpacing:2.4,color:'#5ce8ff',fontWeight:950}}>TRYAMM • HOLO LAB</div><h1 style={{margin:'3px 0'}}>SECS Construct</h1><div style={{fontSize:11,color:'#9eb0c3'}}>Software + bench prototype • fail-closed hardware gateway</div></div>
      {onClose&&<button onClick={onClose} style={btn}>CLOSE</button>}
    </header>
    <main style={{maxWidth:900,margin:'0 auto',padding:16,display:'grid',gap:12}}>
      <section style={panel}><strong>STATUS</strong><p style={copy}>{status}</p><div style={{display:'flex',gap:7,flexWrap:'wrap'}}><span style={pill}>MODE • SOFTWARE PROTOTYPE</span><span style={pill}>MAX SIZE • 610 MM</span><span style={pill}>HAPTIC MAX • 0.35</span><span style={pill}>E-STOP • REQUIRED</span></div></section>
      <section style={panel}><strong>HARDWARE READINESS</strong><p style={copy}>{hardware.ready?'READY • fresh telemetry and safety checks passed.':'BLOCKED • '+hardware.reasons.join(', ')}</p><p style={{...copy,color:'#ffd79a'}}>Physical performance is not claimed until a real prototype is connected and validated.</p></section>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:9}}>
        <button onClick={buildCube} style={btn}>COMPILE 100 MM CUBE</button>
        <button onClick={selfTest} style={btn}>RUN SOFTWARE SELF-TEST</button>
        <button onClick={send} style={{...btn,borderColor:hardware.ready?'#7cffb0':'#ffb45c88'}}>SEND TO PROTOTYPE</button>
      </section>
      <section style={panel}><strong>LATEST CONSTRUCT</strong>{frame?<pre style={{whiteSpace:'pre-wrap',wordBreak:'break-word',fontSize:11,color:'#cfeaff'}}>{JSON.stringify(frame,null,2)}</pre>:<p style={copy}>No construct compiled in this session.</p>}</section>
      <section style={panel}><strong>SUPPORTED SHAPES</strong><p style={copy}>Cube • Sphere • Button • Steering Wheel. Visual simulation continues when hardware is absent; prototype commands remain blocked until telemetry is current, E-stop is clear, and firmware capability matches.</p></section>
    </main>
  </div>
}
const panel:React.CSSProperties={padding:15,border:'1px solid #315a70',borderRadius:15,background:'#07131ddd'}
const btn:React.CSSProperties={minHeight:46,padding:'0 14px',border:'1px solid #5ce8ff88',borderRadius:11,background:'#0a2937',color:'#fff',fontWeight:950,cursor:'pointer'}
const copy:React.CSSProperties={fontSize:12,lineHeight:1.55,color:'#b8c6d4'}
const pill:React.CSSProperties={padding:'6px 8px',borderRadius:999,border:'1px solid #42677d',fontSize:9,color:'#bceeff'}
