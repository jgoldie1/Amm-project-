import {useEffect,useRef,useState} from 'react'

type Position={x:number;z:number}

export default function StreetVerseEmergencyCallHUD(){
  const [open,setOpen]=useState(false)
  const position=useRef<Position>({x:0,z:0})

  useEffect(()=>{
    const onOpen=()=>setOpen(true)
    const onPosition=(event:Event)=>{
      const d=(event as CustomEvent<Partial<Position>>).detail||{}
      if(Number.isFinite(Number(d.x))&&Number.isFinite(Number(d.z)))position.current={x:Number(d.x),z:Number(d.z)}
    }
    addEventListener('tryamm:streetverse-emergency-call-open',onOpen)
    addEventListener('tryamm:streetverse-player-position',onPosition)
    return()=>{removeEventListener('tryamm:streetverse-emergency-call-open',onOpen);removeEventListener('tryamm:streetverse-player-position',onPosition)}
  },[])

  const dispatch=(kind:'police'|'ambulance'|'fire',severity:number,reason:string)=>{
    const {x,z}=position.current
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-response',{detail:{kind,x,z,severity,reason,source:'streetverse-game-emergency-call',gameplayOnly:true}}))
  }
  const call=(kind:'police'|'ambulance'|'fire',severity:number,reason:string)=>{
    dispatch(kind,severity,reason)
    setOpen(false)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-dialogue',{detail:{speaker:'Dispatch',text:`${kind.toUpperCase()} units are being sent to your location for ${reason}.`}}))
  }
  const shot=()=>{
    dispatch('ambulance',4,'person shot')
    dispatch('police',4,'person shot')
    setOpen(false)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-dialogue',{detail:{speaker:'Dispatch',text:'Police and EMS are being sent to your location for a person-shot emergency.'}}))
  }

  if(!open)return null
  return <div role="dialog" aria-modal="true" aria-label="StreetVerse game emergency call" style={backdrop}>
    <section style={panel}>
      <div style={{fontSize:10,letterSpacing:2,color:'#ff7b7b',fontWeight:950}}>GAME EMERGENCY SERVICES</div>
      <h2 style={{margin:'6px 0'}}>Call for Help</h2>
      <p style={{fontSize:12,lineHeight:1.5,color:'#c7d0d6'}}>This dispatches StreetVerse simulation responders only. For a real emergency, use your phone's real emergency service.</p>
      <div style={{display:'grid',gap:8}}>
        <button style={button} onClick={shot}>🚑 + 🚓 PERSON SHOT</button>
        <button style={button} onClick={()=>call('ambulance',3,'person hurt')}>🚑 PERSON HURT / MEDICAL</button>
        <button style={button} onClick={()=>call('police',2,'disturbance or fight')}>🚓 DISTURBANCE / FIGHT</button>
        <button style={button} onClick={()=>call('fire',3,'fire or smoke')}>🚒 FIRE / SMOKE</button>
        <button style={{...button,borderColor:'#526777',background:'#13202a'}} onClick={()=>setOpen(false)}>CANCEL</button>
      </div>
    </section>
  </div>
}

const backdrop:React.CSSProperties={position:'fixed',inset:0,zIndex:47100,display:'grid',placeItems:'center',padding:14,background:'rgba(5,6,9,.82)',backdropFilter:'blur(5px)'}
const panel:React.CSSProperties={width:'min(94vw,480px)',border:'1px solid #ff6b6b77',borderRadius:20,background:'#0c1117f8',color:'#fff',padding:16,fontFamily:'system-ui',boxShadow:'0 24px 80px #000d'}
const button:React.CSSProperties={minHeight:54,borderRadius:12,border:'1px solid #ff6b6b66',background:'#271216',color:'#fff',fontWeight:950,padding:'10px 12px',textAlign:'left',touchAction:'manipulation'}
