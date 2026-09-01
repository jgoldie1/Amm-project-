import {useEffect,useMemo,useState} from 'react'
import type {OmniverseEventChannel,OmniverseFabricState} from '../runtime/OmniverseEventFabricRuntime'
import {executeAutomanCommand,installAutomanOrchestrationRuntime,type AutomanReceipt} from '../runtime/AutomanOrchestrationRuntime'

const labels:Record<OmniverseEventChannel,string>={
  game:'GAME',mission:'MISSION',live:'LIVE',reel:'REEL',creator:'CREATOR',ads:'HOLO ADS',marketplace:'MARKETPLACE',ledger:'LEDGER',broadcast:'CTV/OTT'
}

export default function OmniverseCoreLoopHUD(){
  const [state,setState]=useState<OmniverseFabricState>({receipts:[],completedChannels:[]})
  const [open,setOpen]=useState(false)
  const [command,setCommand]=useState('')
  const [automan,setAutoman]=useState<AutomanReceipt|null>(null)

  useEffect(()=>{
    installAutomanOrchestrationRuntime()
    const onState=(event:Event)=>setState((event as CustomEvent<OmniverseFabricState>).detail)
    const onAutoman=(event:Event)=>setAutoman((event as CustomEvent<AutomanReceipt>).detail)
    window.addEventListener('tryamm:omniverse-fabric-state',onState)
    window.addEventListener('tryamm:automan-receipt',onAutoman)
    window.dispatchEvent(new CustomEvent('tryamm:omniverse-submit',{detail:{type:'system.ready',title:'TRYAMM Omniverse fabric ready',source:'core-loop'}}))
    return()=>{window.removeEventListener('tryamm:omniverse-fabric-state',onState);window.removeEventListener('tryamm:automan-receipt',onAutoman)}
  },[])

  const ready=useMemo(()=>new Set(state.completedChannels),[state.completedChannels])
  const runAutoman=()=>{const q=command.trim();if(!q)return;setAutoman(executeAutomanCommand(q));setCommand('')}
  return <div style={{position:'fixed',right:12,bottom:88,zIndex:16020,fontFamily:'system-ui,sans-serif'}}>
    <button onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-label="Open Omniverse core loop status" style={{border:'1px solid #e8b94488',borderRadius:999,padding:'10px 14px',background:'#0f0d08ee',color:'#fff',fontWeight:900,cursor:'pointer',boxShadow:'0 8px 30px #0008'}}>OMNIVERSE LOOP {ready.size}/9 • AUTOMAN</button>
    {open&&<section aria-label="Omniverse event fabric" style={{width:'min(380px,calc(100vw - 24px))',marginTop:8,padding:14,border:'1px solid #e8b94466',borderRadius:16,background:'#0b0b0bec',color:'#fff',backdropFilter:'blur(14px)',boxShadow:'0 18px 55px #000b'}}>
      <div style={{fontWeight:950,fontSize:16}}>ONE EVENT → WHOLE PLATFORM</div>
      <div style={{fontSize:12,opacity:.72,margin:'4px 0 12px'}}>A StreetVerse event can become gameplay, a mission, LIVE, Reel, creator content, advertising, commerce, ledger activity and broadcast programming.</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
        {(Object.keys(labels) as OmniverseEventChannel[]).map(channel=><div key={channel} style={{padding:'7px 6px',borderRadius:10,border:'1px solid #ffffff20',textAlign:'center',fontSize:10,fontWeight:900,opacity:ready.has(channel)?1:.45}}>{ready.has(channel)?'✓ ':''}{labels[channel]}</div>)}
      </div>
      {state.lastEvent&&<div style={{fontSize:11,marginTop:10,opacity:.75}}>Last event: <b>{state.lastEvent.title}</b></div>}
      <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid #ffffff18'}}>
        <div style={{fontSize:10,fontWeight:950,color:'#65e9ff',letterSpacing:1}}>TRYAMM AUTOMAN • ACTION ORCHESTRATOR</div>
        <div style={{display:'flex',gap:6,marginTop:7}}><input value={command} onChange={e=>setCommand(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')runAutoman()}} placeholder="Race, drift, Reel, Benny, Holo, SportVerse…" aria-label="Automan command" style={{minWidth:0,flex:1,border:'1px solid #4fe3ff44',borderRadius:9,background:'#06151d',color:'#fff',padding:'9px 10px',fontSize:11}}/><button onClick={runAutoman} style={{border:'1px solid #4fe3ff66',borderRadius:9,background:'#0b2634',color:'#aef5ff',fontWeight:900,padding:'0 10px',cursor:'pointer'}}>RUN</button></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5,marginTop:7}}>{['start a race','start drift','record Reel','show Benny'].map(q=><button key={q} onClick={()=>setAutoman(executeAutomanCommand(q))} style={{border:'1px solid #ffffff18',borderRadius:8,background:'#11151a',color:'#d8edf4',fontSize:8,padding:'7px 3px',cursor:'pointer'}}>{q.toUpperCase()}</button>)}</div>
        {automan&&<div style={{fontSize:10,marginTop:8,color:automan.accepted?'#78ffb4':'#e8b944'}}>{automan.accepted?'✓ EXECUTED':'⚠ GATED'} • {automan.action}{automan.reason?` • ${automan.reason}`:''}</div>}
      </div>
    </section>}
  </div>
}
