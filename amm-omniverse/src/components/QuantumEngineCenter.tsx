import { useMemo, useState } from 'react'
import { QUANTUM_TIERS, QuantumAdaptiveRuntime, type QuantumEntity, type PlayerSignal } from '../engine/quantum/QuantumAdaptiveRuntime'

export default function QuantumEngineCenter({ onClose }:{ onClose:()=>void }) {
  const runtime = useMemo(()=>new QuantumAdaptiveRuntime(),[])
  const [destination,setDestination]=useState('downtown')
  const [result,setResult]=useState<any>(null)
  const [busy,setBusy]=useState(false)

  async function simulate() {
    setBusy(true)
    try {
      const signal:PlayerSignal = {
        position:{x:0,y:0,z:0}, destination:{x:1200,y:0,z:700}, activeWorld:'global-city',
        activeMission:'living-world-demo', portalTarget: destination==='moon'?'moon':undefined,
        uiIntent: destination,
      }
      const entities:QuantumEntity[] = [
        {id:'player-car',kind:'vehicle',position:{x:8,y:0,z:4},currentTier:'T0_IMMEDIATE',lastActiveAt:Date.now()},
        {id:'near-npc',kind:'npc',position:{x:80,y:0,z:30},currentTier:'T1_NEAR',lastActiveAt:Date.now()},
        {id:'warehouse',kind:'business',position:{x:900,y:0,z:600},currentTier:'T2_DISTRICT',lastActiveAt:Date.now()},
        {id:'city-economy',kind:'economy',importance:.9,currentTier:'T3_CITY',lastActiveAt:Date.now()},
      ]
      setResult(await runtime.tick(signal,entities))
    } finally { setBusy(false) }
  }

  return <div style={{position:'fixed',inset:0,zIndex:10050,background:'#020611ee',color:'#eef6ff',overflow:'auto',fontFamily:'monospace'}}>
    <div style={{maxWidth:1100,margin:'0 auto',padding:24}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'center'}}>
        <div><div style={{color:'#62e7ff',fontWeight:900}}>QUANTUM ADAPTIVE GAMING RUNTIME</div><h1 style={{margin:'6px 0'}}>Multi-Tier Speed Engine</h1></div>
        <button onClick={onClose} style={{padding:'10px 14px'}}>Close</button>
      </div>
      <p style={{color:'#a8bfd5',maxWidth:900}}>Ten adaptive simulation tiers replace a fixed three-speed design. Entities are promoted to high-fidelity simulation as they become relevant and demoted to regional, planetary, omniverse, or archive state when they do not need frame-by-frame computation.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10}}>
        {QUANTUM_TIERS.map(t=><div key={t.id} style={{border:'1px solid #23526a',borderRadius:12,padding:12,background:'#071420'}}>
          <strong style={{color:'#73efff'}}>{t.id}</strong><div>{t.label}</div><small>{t.targetHz ? `${t.targetHz} Hz target` : 'event/on-demand'} • {t.radiusMeters ? `${t.radiusMeters.toLocaleString()} m` : 'logical scope'}</small>
          <div style={{fontSize:11,color:'#8ea9bd',marginTop:6}}>{t.simulation.join(' • ')}</div>
        </div>)}
      </div>
      <section style={{marginTop:22,border:'1px solid #44356f',borderRadius:14,padding:16,background:'#0a0920'}}>
        <h2 style={{marginTop:0}}>Quantum Predictive Scheduler</h2>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <select value={destination} onChange={e=>setDestination(e.target.value)} style={{padding:10}}>
            <option value="downtown">Drive toward downtown</option><option value="warehouse">Open logistics district</option><option value="moon">Enter Moon portal</option><option value="studio">Open Aniyah Studio</option>
          </select>
          <button onClick={simulate} disabled={busy} style={{padding:'10px 14px',fontWeight:900}}>{busy?'Scheduling…':'Run Prediction'}</button>
        </div>
        {result && <pre style={{whiteSpace:'pre-wrap',fontSize:12,color:'#bdeaff',background:'#030912',padding:12,borderRadius:10,marginTop:12}}>{JSON.stringify(result,null,2)}</pre>}
      </section>
      <section style={{marginTop:18}}>
        <h2>Quantum Seamless Transfer</h2>
        <p style={{color:'#a8bfd5'}}>Every transition follows snapshot → preload → handoff → activate → cleanup. Engine adapters can implement the visual/network handoff differently while preserving the same AMM world state.</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{['Unreal','Unity','Godot','WebGPU/Three.js','Native Mobile','Server Simulation'].map(x=><span key={x} style={{border:'1px solid #365c7d',borderRadius:999,padding:'6px 10px'}}>{x}</span>)}</div>
      </section>
    </div>
  </div>
}
