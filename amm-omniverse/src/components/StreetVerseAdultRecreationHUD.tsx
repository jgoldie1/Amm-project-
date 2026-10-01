import {useEffect,useState} from 'react'
import {readStoredAudienceBand} from './SocialAgeSafetyGate'

type State={combined:number;drivingBlocked:boolean;alcohol:number;cannabis:number}
const empty:State={combined:0,drivingBlocked:false,alcohol:0,cannabis:0}

export default function StreetVerseAdultRecreationHUD(){
  const [open,setOpen]=useState(false)
  const [state,setState]=useState<State>(empty)
  const adult=readStoredAudienceBand()==='adult'

  useEffect(()=>{
    const onOpen=()=>setOpen(true)
    const onState=(event:Event)=>{const d=(event as CustomEvent<Partial<State>>).detail||{};setState(s=>({...s,...d}))}
    addEventListener('tryamm:streetverse-adult-recreation-open',onOpen)
    addEventListener('tryamm:streetverse-impairment-state',onState)
    return()=>{removeEventListener('tryamm:streetverse-adult-recreation-open',onOpen);removeEventListener('tryamm:streetverse-impairment-state',onState)}
  },[])

  if(!open)return null
  if(!adult)return <div role="dialog" aria-modal="true" style={backdrop}><section style={panel}><h2>Adult Lane</h2><p style={copy}>This simulated recreation menu is only available after the app has a verified adult audience band.</p><button style={button} onClick={()=>setOpen(false)}>CLOSE</button></section></div>

  const consume=(substance:'alcohol'|'cannabis')=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-adult-consume',{detail:{substance,amount:.18,ageVerified:true,gameplayOnly:true}}))
  return <div role="dialog" aria-modal="true" aria-label="StreetVerse adult recreation" style={backdrop}>
    <section style={panel}>
      <div style={{fontSize:10,letterSpacing:2,color:'#d98cff',fontWeight:950}}>21+ ADULT LANE • GAMEPLAY SIMULATION</div>
      <h2 style={{margin:'6px 0'}}>Adult Recreation</h2>
      <p style={copy}>Adults can role-play drinking alcohol or cannabis use. Effects change the character state; this menu does not provide real-world buying, dosing, or consumption instructions.</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        <button style={button} onClick={()=>consume('alcohol')}>🍷 DRINK • GAME</button>
        <button style={button} onClick={()=>consume('cannabis')}>🌿 CANNABIS • GAME</button>
      </div>
      <div style={{marginTop:12,padding:11,borderRadius:12,background:'#100f18',fontSize:11}}>
        EFFECT LEVEL • {Math.round(state.combined*100)}%<br/>
        <span style={{color:state.drivingBlocked?'#ff9f8f':'#8dffb7',fontWeight:900}}>{state.drivingBlocked?'DRIVING DISABLED WHILE IMPAIRED':'DRIVING AVAILABLE'}</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}>
        <button style={button} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-adult-recover'))}>RECOVER / CLEAR</button>
        <button style={button} onClick={()=>setOpen(false)}>CLOSE</button>
      </div>
    </section>
  </div>
}

const backdrop:React.CSSProperties={position:'fixed',inset:0,zIndex:47020,display:'grid',placeItems:'center',padding:14,background:'rgba(5,3,9,.82)',backdropFilter:'blur(5px)'}
const panel:React.CSSProperties={width:'min(94vw,500px)',border:'1px solid #9d69b4',borderRadius:20,background:'#0d0912f8',color:'#fff',padding:16,fontFamily:'system-ui',boxShadow:'0 24px 80px #000d'}
const copy:React.CSSProperties={fontSize:12,lineHeight:1.55,color:'#c9bacf'}
const button:React.CSSProperties={minHeight:52,borderRadius:12,border:'1px solid #795788',background:'#18101f',color:'#fff',fontWeight:950,padding:'10px 12px',touchAction:'manipulation'}
