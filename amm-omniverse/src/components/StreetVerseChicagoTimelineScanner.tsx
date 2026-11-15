import React,{useMemo,useState} from 'react'
import {createChicagoTimeSwitch,type ChicagoEra} from '../runtime/StreetVerseChicagoTimeSwitchRuntime'
/** Prototype scanner and instant scene-switch requests. Renderer must subscribe to events. */
export function StreetVerseChicagoTimelineScanner(){
 const engine=useMemo(()=>createChicagoTimeSwitch(),[])
 const [scene,setScene]=useState(engine.scene())
 const [open,setOpen]=useState(false)
 const switchEra=(era:ChicagoEra)=>{
  const next=engine.switchTo(era)
  setScene(next)
  window.dispatchEvent(new CustomEvent('tryamm:crossverse-chicago-era-switch',{detail:{...next,transition:'instant',requiresSceneLoad:true}}))
 }
 return <section aria-label="CrossVerse Chicago timeline scanner" style={{padding:12,background:'#10232c',color:'white',border:'1px solid #78d7ce',borderRadius:12}}>
  <button onClick={()=>setOpen(v=>!v)} style={{minHeight:52,width:'100%',background:'#226a70',color:'white',border:0,borderRadius:8,fontWeight:800}}>MYCELIUM TIME SCANNER {open?'−':'+'}</button>
  {open&&<div>
   <p role="status">Chicago • {scene.era.toUpperCase()} • {scene.architecture}</p>
   <p>Transport: {scene.transport} • Shops: {scene.shopsOpen.join(', ')}</p>
   <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
    {engine.scan().map(candidate=><button key={candidate.era} onClick={()=>switchEra(candidate.era)} disabled={scene.era===candidate.era} style={{minHeight:52,minWidth:88,flex:1,borderRadius:8,border:'1px solid #90d5cd',background:scene.era===candidate.era?'#33535a':'#e0fbf6',color:scene.era===candidate.era?'white':'#082c2a',fontWeight:700}}>{candidate.era.toUpperCase()}</button>)}
   </div>
   <small>Prototype: sends a timeline scene-switch request. The 3D renderer must load the corresponding environment.</small>
  </div>}
 </section>
}
