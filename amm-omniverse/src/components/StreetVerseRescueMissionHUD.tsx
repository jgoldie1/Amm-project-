import {useEffect,useState} from 'react'
import {STREETVERSE_RESCUE_INCIDENTS,type StreetVerseRescueIncidentKind} from '../data/StreetVerseRescueIncidentCatalog'
import type {StreetVerseRescueIncidentState} from '../runtime/StreetVerseRescueIncidentRuntime'

const incidentOrder:StreetVerseRescueIncidentKind[]=[
  'structure-fire','house-fire','car-wreck','stroke-emergency','gunshot-victim','cat-in-tree','assault','robbery','sexual-assault-survivor'
]

export default function StreetVerseRescueMissionHUD(){
  const [directorOpen,setDirectorOpen]=useState(false)
  const [state,setState]=useState<StreetVerseRescueIncidentState|null>(null)
  const [position,setPosition]=useState({x:0,z:0})

  useEffect(()=>{
    const onOpen=()=>setDirectorOpen(true)
    const onPosition=(event:Event)=>{
      const d=(event as CustomEvent<{x?:number;z?:number}>).detail||{}
      if(Number.isFinite(Number(d.x))&&Number.isFinite(Number(d.z)))setPosition({x:Number(d.x),z:Number(d.z)})
    }
    const onState=(event:Event)=>setState((event as CustomEvent<StreetVerseRescueIncidentState>).detail||null)
    addEventListener('tryamm:streetverse-rescue-director-open',onOpen)
    addEventListener('tryamm:streetverse-player-position',onPosition)
    addEventListener('tryamm:streetverse-rescue-incident-state',onState)
    return()=>{
      removeEventListener('tryamm:streetverse-rescue-director-open',onOpen)
      removeEventListener('tryamm:streetverse-player-position',onPosition)
      removeEventListener('tryamm:streetverse-rescue-incident-state',onState)
    }
  },[])

  const start=(kind:StreetVerseRescueIncidentKind)=>{
    setDirectorOpen(false)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-rescue-incident-start',{detail:{kind,x:position.x,z:position.z,source:'rescue-director'}}))
  }
  const act=(objective:string)=>{
    if(!state)return
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-rescue-action',{detail:{incidentId:state.id,action:objective,source:'rescue-mission-hud'}}))
  }

  return <>
    {directorOpen&&<div role="dialog" aria-modal="true" aria-label="StreetVerse Rescue Operations" style={backdrop}>
      <section style={panel}>
        <div style={{fontSize:10,letterSpacing:2,color:'#ffb46a',fontWeight:950}}>STREETVERSE • RESCUE OPERATIONS</div>
        <h2 style={{margin:'6px 0'}}>Start an Incident</h2>
        <p style={copy}>Launch a gameplay emergency near your current location. Sexual-assault response is non-graphic and survivor-centered.</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {incidentOrder.map(kind=>{
            const def=STREETVERSE_RESCUE_INCIDENTS[kind]
            return <button key={kind} onClick={()=>start(kind)} style={button}>{def.label}</button>
          })}
        </div>
        <button onClick={()=>setDirectorOpen(false)} style={{...button,width:'100%',marginTop:10}}>CLOSE</button>
      </section>
    </div>}

    {state&&!state.resolved&&<div aria-live="polite" style={{position:'fixed',left:8,right:8,bottom:282,zIndex:34500,pointerEvents:'none',display:'grid',placeItems:'center'}}>
      <section style={{width:'min(94vw,430px)',border:'1px solid #ff974f77',borderRadius:16,background:'rgba(10,12,16,.94)',padding:10,color:'#fff',fontFamily:'system-ui',pointerEvents:'auto',boxShadow:'0 12px 38px #000b'}}>
        <div style={{fontSize:9,fontWeight:950,color:'#ffb46a'}}>RESCUE MISSION • {state.label}</div>
        {state.fire&&<div style={{fontSize:9,marginTop:3,color:'#ff8c72'}}>FIRE DAMAGE • {state.burnProgress}%</div>}
        <div style={{fontSize:9,marginTop:3,color:'#9adfff'}}>PEOPLE {state.rescuedPeople}/{state.victimCount} • ANIMALS {state.rescuedAnimals}/{state.animalCount}</div>
        <div style={{display:'grid',gap:6,marginTop:7}}>
          {state.objectives.slice(0,4).map(objective=>{
            const done=state.completed.includes(objective)
            return <button key={objective} disabled={done} onClick={()=>act(objective)} style={{...button,minHeight:40,opacity:done?.55:1,fontSize:9}}>{done?'✓ ':''}{objective}</button>
          })}
        </div>
      </section>
    </div>}
  </>
}

const backdrop:React.CSSProperties={position:'fixed',inset:0,zIndex:47200,display:'grid',placeItems:'center',padding:14,background:'rgba(5,7,10,.84)',backdropFilter:'blur(5px)'}
const panel:React.CSSProperties={width:'min(94vw,560px)',maxHeight:'88dvh',overflowY:'auto',border:'1px solid #ff9e5d77',borderRadius:20,background:'#0d1117f8',color:'#fff',padding:16,fontFamily:'system-ui',boxShadow:'0 24px 80px #000d'}
const copy:React.CSSProperties={fontSize:12,lineHeight:1.5,color:'#c5d0d8'}
const button:React.CSSProperties={minHeight:48,borderRadius:11,border:'1px solid #7a4f35',background:'#20150f',color:'#fff',fontWeight:900,padding:'9px 10px',touchAction:'manipulation'}
