import { useMemo, useState } from 'react'
import { AGE_POLICIES, QUANTUM_GAME_SYSTEMS, type AgeLane } from '../engine/quantum/QuantumGameDesign'

const AGE_LABELS: Record<AgeLane,string> = {
  'pre-k':'Pre-K','child':'Child','tween':'Tween','teen':'Teen','family':'Family','adult':'Adult'
}

export default function QuantumGameDesignCenter({ onClose }:{ onClose:()=>void }) {
  const [ageLane,setAgeLane]=useState<AgeLane>('family')
  const policy=AGE_POLICIES[ageLane]
  const systems=useMemo(()=>Object.entries(QUANTUM_GAME_SYSTEMS),[])
  return <div style={{position:'fixed',inset:0,zIndex:10020,background:'radial-gradient(circle at 25% 15%,#10233c,#040510 60%)',color:'#f7fbff',overflow:'auto',fontFamily:'system-ui'}}>
    <div style={{maxWidth:1180,margin:'0 auto',padding:'28px 18px 60px'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}>
        <div><div style={{fontSize:12,letterSpacing:2,color:'#7ee7ff'}}>QUANTUM FORCE • QUANTUMVERSE</div><h1 style={{margin:'4px 0'}}>Game Design Center</h1><p style={{color:'#b9c9d8',maxWidth:780}}>One open-world technology base, dynamically adapted for different ages, play styles, worlds, learning goals and family settings.</p></div>
        <button onClick={onClose} style={{background:'#172337',color:'#fff',border:'1px solid #46617a',borderRadius:10,padding:'10px 14px'}}>Close</button>
      </div>

      <section style={{marginTop:22,background:'#0b1422',border:'1px solid #24415c',borderRadius:18,padding:18}}>
        <h2 style={{marginTop:0}}>Age-Adaptive World Policy</h2>
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{(Object.keys(AGE_LABELS) as AgeLane[]).map(k=><button key={k} onClick={()=>setAgeLane(k)} style={{padding:'8px 12px',borderRadius:999,border:'1px solid '+(k===ageLane?'#7ee7ff':'#38506a'),background:k===ageLane?'#163954':'#101a29',color:'#fff'}}>{AGE_LABELS[k]}</button>)}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:10,marginTop:14}}>
          {[
            ['Play lanes',policy.allowedPlayLanes.join(', ')],['Combat',policy.combatLevel],['Commerce',policy.commerce],['Chat',policy.chat],['Creator content',policy.userGeneratedContent],['AI mode',policy.aiMode],['Location',policy.locationSharing]
          ].map(([a,b])=><div key={a} style={{background:'#101d2e',borderRadius:12,padding:12}}><strong>{a}</strong><div style={{color:'#b9c9d8',marginTop:5,fontSize:13}}>{b}</div></div>)}
        </div>
      </section>

      <section style={{marginTop:20}}><h2>Open-World Systems</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12}}>{systems.map(([group,items])=><article key={group} style={{background:'#0b1422',border:'1px solid #233b52',borderRadius:16,padding:16}}><h3 style={{textTransform:'capitalize',marginTop:0,color:'#ffd166'}}>{group}</h3><ul style={{paddingLeft:18,color:'#c8d5e2'}}>{items.map(x=><li key={x} style={{margin:'5px 0'}}>{x.replaceAll('-',' ')}</li>)}</ul></article>)}</div></section>

      <section style={{marginTop:20,background:'#101a29',border:'1px solid #334e69',borderRadius:16,padding:16}}>
        <strong>Design rule:</strong> Children do not enter the adult economy/action lane simply because the same map exists. The engine changes mission availability, AI behavior, commerce, communication, content, combat intensity and privacy at the policy layer before the world activates.
      </section>
    </div>
  </div>
}
