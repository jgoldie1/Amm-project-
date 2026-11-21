import React,{useMemo,useState} from 'react'
import {createChicagoTimeSwitch,type ChicagoEra} from '../runtime/StreetVerseChicagoTimeSwitchRuntime'

/** Prototype scanner. A 3D scene listener must implement actual visual scene changes. */
export function StreetVerseChicagoTimeSwitchHUD(){
 const engine=useMemo(()=>createChicagoTimeSwitch(),[])
 const [era,setEra]=useState<ChicagoEra>('present')
 const [npc,setNpc]=useState('Chicago Resident')
 const [message,setMessage]=useState('Welcome to Chicago.')
 const [status,setStatus]=useState('Present timeline ready')
 const scene=engine.scene()
 const switchEra=(next:ChicagoEra)=>{
  const target=engine.switchTo(next)
  setEra(next)
  setStatus('Timeline selected: '+next+' • 3D scene load requested')
  window.dispatchEvent(new CustomEvent('tryamm:crossverse-scene-transition',{detail:{to:target.timelineId,scene:target,effect:'instant-era-switch',requiresSceneLoad:true}}))
 }
 const remember=()=>{engine.remember(npc,message);setStatus(npc+' remembers this in '+era+' Chicago')}
 return <section aria-label="CrossVerse Chicago timeline scanner" style={{background:'#0c1d2a',color:'white',border:'2px solid #69cdb8',borderRadius:14,padding:14,maxWidth:360,fontFamily:'system-ui'}}>
  <h3>MYCELIUM • CHICAGO TIME SCANNER</h3>
  <p role="status" aria-live="polite">{status}</p>
  <p>Active: <strong>{era.toUpperCase()}</strong> • {scene.architecture} • {scene.transport}</p>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{engine.scan().map(item=><button key={item.era} onClick={()=>switchEra(item.era)} aria-pressed={era===item.era} style={{minHeight:52,flex:'1 1 90px',borderRadius:10,background:era===item.era?'#83ead4':'#21445d',color:era===item.era?'#10251f':'white',fontWeight:800}}>{item.era.toUpperCase()}</button>)}</div>
  <p>Open locations: {scene.shopsOpen.join(', ')}</p>
  <label>NPC name<input value={npc} onChange={e=>setNpc(e.target.value)} style={{display:'block',width:'100%',minHeight:44,boxSizing:'border-box'}}/></label>
  <label>NPC memory<input value={message} onChange={e=>setMessage(e.target.value)} style={{display:'block',width:'100%',minHeight:44,boxSizing:'border-box'}}/></label>
  <button onClick={remember} style={{minHeight:52,width:'100%',marginTop:10}}>SAVE NPC MEMORY IN THIS TIMELINE</button>
  <p>Remembered here: {engine.recall(npc).join(' • ')||'None'}</p>
  <small>Prototype scanner and scene-transition request; not a rendered timeline swap.</small>
 </section>
}
