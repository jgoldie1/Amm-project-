import { useEffect, useMemo, useState } from 'react'

type Props = { onClose: () => void }
type Mode = 'SOLO' | 'TEAM' | 'TIME SHIFT'

type Target = { id: number; x: number; y: number; value: number; phase: 'cyan' | 'violet' | 'gold' }

const phaseColor: Record<Target['phase'], string> = {
  cyan: '#42f5ff',
  violet: '#a66cff',
  gold: '#ffd45c',
}

function spawnTarget(id: number): Target {
  const phases: Target['phase'][] = ['cyan', 'violet', 'gold']
  const phase = phases[Math.floor(Math.random() * phases.length)]
  return {
    id,
    x: 8 + Math.random() * 78,
    y: 18 + Math.random() * 62,
    value: phase === 'gold' ? 3 : phase === 'violet' ? 2 : 1,
    phase,
  }
}

export default function QuantumTagArena({ onClose }: Props) {
  const [mode, setMode] = useState<Mode>('SOLO')
  const [running, setRunning] = useState(false)
  const [time, setTime] = useState(45)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('tryamm_quantum_tag_best') || 0))
  const [targets, setTargets] = useState<Target[]>(() => [0,1,2,3].map(spawnTarget))
  const [status, setStatus] = useState('Select a mode and start the round.')

  useEffect(() => {
    if (!running) return
    const t = window.setInterval(() => setTime(v => Math.max(0, v - 1)), 1000)
    return () => window.clearInterval(t)
  }, [running])

  useEffect(() => {
    if (time !== 0 || !running) return
    setRunning(false)
    setStatus(`Round complete — ${score} quantum points.`)
    if (score > best) {
      setBest(score)
      localStorage.setItem('tryamm_quantum_tag_best', String(score))
    }
  }, [time, running, score, best])

  const rank = useMemo(() => score >= 40 ? 'PHASE MASTER' : score >= 25 ? 'PORTAL RUNNER' : score >= 12 ? 'QUANTUM SCOUT' : 'ROOKIE', [score])

  const start = () => {
    setScore(0)
    setCombo(0)
    setTime(45)
    setTargets([0,1,2,3].map(spawnTarget))
    setStatus(mode === 'TIME SHIFT' ? 'Time Shift active: gold targets are worth 3.' : 'Tag every phase marker you can.')
    setRunning(true)
  }

  const tag = (target: Target) => {
    if (!running) return
    const multiplier = combo >= 8 ? 3 : combo >= 4 ? 2 : 1
    const modeBoost = mode === 'TIME SHIFT' && target.phase === 'gold' ? 2 : 1
    const earned = target.value * multiplier * modeBoost
    setScore(v => v + earned)
    setCombo(v => v + 1)
    setTargets(list => list.map(t => t.id === target.id ? spawnTarget(target.id) : t))
    setStatus(`+${earned} • ${target.phase.toUpperCase()} phase tagged`)
  }

  const miss = () => {
    if (!running) return
    setCombo(0)
    setStatus('Phase lost — combo reset.')
  }

  return (
    <div role="dialog" aria-label="Quantum Tag Arena" style={{position:'fixed',inset:0,zIndex:11000,background:'radial-gradient(circle at 50% 20%,#16234a 0,#080b19 42%,#02030a 100%)',color:'#fff',overflowY:'auto',fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{maxWidth:980,margin:'0 auto',padding:'18px 14px 40px'}}>
        <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:12}}>
          <div><div style={{fontSize:10,letterSpacing:4,color:'#42f5ff',fontWeight:900}}>TRYAMM • ORIGINAL GAME IP</div><h1 style={{margin:'4px 0 0',fontSize:'clamp(28px,7vw,62px)',lineHeight:.95}}>QUANTUM TAG</h1></div>
          <button onClick={onClose} aria-label="Close Quantum Tag" style={{width:42,height:42,borderRadius:'50%',border:'1px solid #6d7ca8',background:'#0d1324',color:'#fff',fontSize:22,cursor:'pointer'}}>×</button>
        </header>

        <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8,marginBottom:10}}>
          {[['TIME',time],['SCORE',score],['COMBO',`x${combo}`],['BEST',best]].map(([k,v]) => <div key={String(k)} style={{padding:10,border:'1px solid #23345c',borderRadius:14,background:'#091124cc'}}><div style={{fontSize:9,color:'#89a1d8',fontWeight:900}}>{k}</div><div style={{fontSize:20,fontWeight:950}}>{v}</div></div>)}
        </div>

        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10}}>
          {(['SOLO','TEAM','TIME SHIFT'] as Mode[]).map(m => <button key={m} onClick={()=>!running&&setMode(m)} aria-pressed={mode===m} style={{padding:'10px 13px',borderRadius:999,border:`1px solid ${mode===m?'#42f5ff':'#304164'}`,background:mode===m?'#0d3341':'#0b1020',color:'#fff',fontWeight:900,cursor:running?'not-allowed':'pointer'}}>{m}</button>)}
          <button onClick={start} style={{marginLeft:'auto',padding:'10px 18px',borderRadius:999,border:'1px solid #9cf9ff',background:'linear-gradient(135deg,#0e7180,#5f2db7)',color:'#fff',fontWeight:950,cursor:'pointer'}}>{running?'RESTART':'START ROUND'}</button>
        </div>

        <div onClick={miss} aria-label="Quantum Tag play field" style={{position:'relative',height:'min(58vh,520px)',minHeight:360,borderRadius:24,border:'1px solid #31508d',overflow:'hidden',background:'radial-gradient(circle at 50% 50%,#13284d 0,#070e22 46%,#030711 100%)',boxShadow:'inset 0 0 80px #03132b,0 20px 70px #0008'}}>
          <div aria-hidden="true" style={{position:'absolute',inset:'8%',border:'1px solid #42f5ff33',borderRadius:'50%'}} />
          <div aria-hidden="true" style={{position:'absolute',inset:'22%',border:'1px solid #a66cff33',borderRadius:'50%'}} />
          {targets.map(t => <button key={t.id} onClick={e=>{e.stopPropagation();tag(t)}} aria-label={`Tag ${t.phase} quantum target`} style={{position:'absolute',left:`${t.x}%`,top:`${t.y}%`,transform:'translate(-50%,-50%)',width:58,height:58,borderRadius:'50%',border:`2px solid ${phaseColor[t.phase]}`,background:`radial-gradient(circle,#ffffff 0,${phaseColor[t.phase]} 18%,#06101d 58%)`,boxShadow:`0 0 30px ${phaseColor[t.phase]}`,cursor:running?'crosshair':'default',opacity:running?1:.38}}><span style={{color:'#06101d',fontWeight:1000,fontSize:11}}>+{t.value}</span></button>)}
          {!running && <div style={{position:'absolute',inset:0,display:'grid',placeItems:'center',pointerEvents:'none'}}><div style={{textAlign:'center',padding:24}}><div style={{fontSize:12,letterSpacing:3,color:'#8ba5db'}}>AR • VR • MR READY CONCEPT</div><div style={{fontSize:30,fontWeight:1000,marginTop:8}}>TAG THE PHASE</div><div style={{maxWidth:480,color:'#a9b8d7',lineHeight:1.5,marginTop:8}}>Playable phone vertical slice. Spatial-device adapters can later project the same targets into AR, VR and mixed reality while preserving match state.</div></div></div>}
        </div>

        <div style={{marginTop:10,display:'grid',gridTemplateColumns:'2fr 1fr',gap:10}}>
          <div style={{padding:14,border:'1px solid #23345c',borderRadius:16,background:'#080e1dcc'}}><div style={{fontSize:10,color:'#42f5ff',fontWeight:950,letterSpacing:2}}>HOLOGPT MATCH FEED</div><div aria-live="polite" style={{marginTop:7,fontWeight:800}}>{status}</div></div>
          <div style={{padding:14,border:'1px solid #4b386f',borderRadius:16,background:'#100c20cc'}}><div style={{fontSize:10,color:'#c59cff',fontWeight:950}}>RANK</div><div style={{marginTop:7,fontWeight:1000}}>{rank}</div></div>
        </div>

        <div style={{marginTop:12,fontSize:11,lineHeight:1.55,color:'#91a4c9'}}>Prototype rules: tap glowing phase markers before time expires. Cyan = 1, violet = 2, gold = 3. Build combos for multipliers. Time Shift doubles gold target value. This vertical slice uses virtual scoring only—no real-money wagering or payout.</div>
      </div>
    </div>
  )
}
