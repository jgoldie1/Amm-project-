import {useEffect,useState} from 'react'
import {installVerseRadioRuntime,VERSE_RADIO_STATIONS,type VerseRadioState} from '../runtime/VerseRadioRuntime'

export default function VerseRadioDock(){
 const [state,setState]=useState<VerseRadioState|null>(null)
 const [expanded,setExpanded]=useState(false)
 useEffect(()=>{
  const dispose=installVerseRadioRuntime()
  const onState=(event:Event)=>{const next=(event as CustomEvent<VerseRadioState>).detail;setState(next);if(next?.open)setExpanded(true)}
  addEventListener('tryamm:verse-radio-state',onState)
  const api=(window as typeof window&{__TRYAMM_VERSE_RADIO__?:{getState:()=>VerseRadioState}}).__TRYAMM_VERSE_RADIO__
  if(api)setState(api.getState())
  return()=>{removeEventListener('tryamm:verse-radio-state',onState);dispose()}
 },[])
 if(!state||(state.open===false&&!state.track))return null
 const toggle=()=>state.playing?dispatchEvent(new Event('tryamm:verse-radio-pause')):dispatchEvent(new Event('tryamm:verse-radio-resume'))
 if(!expanded)return <button aria-label="Open Verse Radio" onClick={()=>setExpanded(true)} style={bubble}>♫</button>
 return <aside aria-label="Verse Radio" style={dock}>
  <div style={{display:'flex',alignItems:'center',gap:8}}>
   <button aria-label={state.playing?'Pause Verse Radio':'Play Verse Radio'} onClick={toggle} style={round}>{state.playing?'Ⅱ':'▶'}</button>
   <div style={{minWidth:0,flex:1}}><div style={{fontSize:8,letterSpacing:1.5,color:'#6cecff',fontWeight:950}}>VERSE RADIO • {state.platform.toUpperCase()}</div><div style={{fontSize:11,fontWeight:950,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{state.track?.title||'Choose music in MusicVerse'}</div><div style={{fontSize:9,color:'#93a7b2',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{state.track?.artist||state.station.replaceAll('-',' ')}</div></div>
   <button aria-label="Collapse Verse Radio" onClick={()=>setExpanded(false)} style={round}>−</button>
  </div>
  {state.needsTap&&<div style={{marginTop:7,padding:7,borderRadius:9,background:'#2b1e08',border:'1px solid #f0b64d66',fontSize:9,color:'#ffd78f'}}>Tap ▶ to resume audio after entering this Verse.</div>}
  <div style={{display:'flex',gap:5,overflowX:'auto',marginTop:7,paddingBottom:2}}>{VERSE_RADIO_STATIONS.map(st=><button key={st.id} onClick={()=>dispatchEvent(new CustomEvent('tryamm:verse-radio-station',{detail:{station:st.id}}))} style={{...chip,borderColor:state.station===st.id?'#68edff':'#294355'}}>{st.label}</button>)}</div>
  <div style={{display:'flex',gap:7,marginTop:7}}><button onClick={()=>{window.location.href='/musicverse'}} style={{...chip,flex:1}}>OPEN MUSICVERSE</button><button onClick={()=>{dispatchEvent(new Event('tryamm:verse-radio-pause'));dispatchEvent(new Event('tryamm:verse-radio-close'));setExpanded(false)}} style={chip}>STOP</button></div>
 </aside>
}

const dock:React.CSSProperties={position:'fixed',right:10,top:'calc(env(safe-area-inset-top, 0px) + 64px)',zIndex:2147482500,width:'min(88vw,340px)',padding:10,borderRadius:15,border:'1px solid #3abedb77',background:'linear-gradient(145deg,#06111cf5,#100a1bf5)',color:'#fff',boxShadow:'0 12px 45px #000b',backdropFilter:'blur(10px)',fontFamily:'system-ui'}
const bubble:React.CSSProperties={position:'fixed',right:10,top:'calc(env(safe-area-inset-top, 0px) + 70px)',zIndex:2147482500,width:44,height:44,borderRadius:'50%',border:'1px solid #5ce8ff99',background:'radial-gradient(circle,#123c50,#090a19)',color:'#fff',fontSize:20,boxShadow:'0 0 22px #4fe3ff55'}
const round:React.CSSProperties={width:38,height:38,flex:'0 0 38px',borderRadius:'50%',border:'1px solid #4fe3ff66',background:'#0b2431',color:'#fff',fontWeight:950}
const chip:React.CSSProperties={minHeight:34,padding:'6px 9px',borderRadius:9,border:'1px solid #294355',background:'#091821',color:'#fff',fontSize:8,fontWeight:900,whiteSpace:'nowrap',touchAction:'manipulation'}