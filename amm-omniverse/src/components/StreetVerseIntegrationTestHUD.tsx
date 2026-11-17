import {useEffect,useState} from 'react'
/** Non-graphic fictional roleplay test driver; never calls real emergency services. */
type RescueStage='idle'|'requested'|'dispatched'|'arrived'|'treatment'|'recovered'
const button:React.CSSProperties={minHeight:48,minWidth:130,borderRadius:11,padding:'9px 12px',border:'1px solid #8fdef1',background:'#133c50',color:'white',font:'700 12px system-ui',touchAction:'manipulation'}
export default function StreetVerseIntegrationTestHUD(){
 const [open,setOpen]=useState(false),[stage,setStage]=useState<RescueStage>('idle'),[health,setHealth]=useState(100)
 const [position,setPosition]=useState<{x:number;z:number}|null>(null)
 const [note,setNote]=useState('SIMULATION ONLY • no real emergency dispatch')
 const [visited,setVisited]=useState(false)
 useEffect(()=>{
  const onStage=(e:Event)=>setStage((e as CustomEvent<{stage:RescueStage}>).detail?.stage||'idle')
  const onHealth=(e:Event)=>{const h=(e as CustomEvent<{health?:number}>).detail?.health;if(typeof h==='number'&&Number.isFinite(h))setHealth(h)}
  const onPosition=(e:Event)=>{const d=(e as CustomEvent<{x:number;z:number}>).detail;if(d&&Number.isFinite(d.x)&&Number.isFinite(d.z))setPosition({x:d.x,z:d.z})}
  const onMini=(e:Event)=>{const d=(e as CustomEvent<{reason?:string;ok?:boolean;state?:{visited?:boolean}}>).detail;setNote(d?.reason||'Mini-city check-in not verified');if(d?.ok)setVisited(Boolean(d.state?.visited))}
  window.addEventListener('tryamm:streetverse-bj-rescue-stage',onStage)
  window.addEventListener('tryamm:streetverse-bj-health-changed',onHealth)
  window.addEventListener('tryamm:streetverse-player-location',onPosition)
  window.addEventListener('tryamm:streetverse-mini-city-checkin-result',onMini)
  return()=>{window.removeEventListener('tryamm:streetverse-bj-rescue-stage',onStage);window.removeEventListener('tryamm:streetverse-bj-health-changed',onHealth);window.removeEventListener('tryamm:streetverse-player-location',onPosition);window.removeEventListener('tryamm:streetverse-mini-city-checkin-result',onMini)}
 },[])
 const injury=(kind:'shot'|'stab')=>{
  if(stage!=='idle'&&stage!=='recovered'){setNote('Finish the existing medical simulation first.');return}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-injury',{detail:{kind,fictional:true,nonGraphic:true,source:'integration-test'}}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-anatomy-mode',{detail:{xray:true,injured:true,source:'integration-test'}}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-rescue-request',{detail:{source:'integration-test',fictional:true}}))
  setNote(kind==='shot'?'Fictional gunshot simulation started • dispatch requested':'Fictional stab simulation started • dispatch requested')
 }
 const advance=()=>{if(stage==='idle'||stage==='recovered')return;window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-rescue-advance',{detail:{source:'integration-test',fictional:true}}))}
 const checkIn=()=>{if(!position){setNote('Waiting for real in-game player position.');return}window.dispatchEvent(new CustomEvent('tryamm:streetverse-mini-city-checkin-request',{detail:{...position,source:'integration-test'}}))}
 return <aside aria-label="StreetVerse one-button integration tests" style={{position:'fixed',left:8,top:'calc(env(safe-area-inset-top) + 144px)',zIndex:43010,maxWidth:'min(330px,calc(100vw - 16px))',fontFamily:'system-ui'}}>
  <button style={button} aria-expanded={open} onClick={()=>setOpen(v=>!v)}>🧪 ONE PUSH TEST</button>
  {open&&<section style={{padding:11,marginTop:5,display:'grid',gap:8,maxHeight:'52dvh',overflowY:'auto',background:'rgba(5,22,35,.98)',color:'white',borderRadius:12,border:'1px solid #83dbec'}}>
   <strong>StreetVerse • gameplay test</strong>
   <small>Fictional, non-graphic injury simulation. No real medical advice, emergency calls, or automatic hospital teleport.</small>
   <div aria-live="polite">BJ HEALTH {health}/100 • RESCUE {stage.toUpperCase()}</div>
   <button style={button} onClick={()=>injury('shot')}>TEST SHOT → HOSPITAL</button>
   <button style={button} onClick={()=>injury('stab')}>TEST STAB → HOSPITAL</button>
   <button style={button} disabled={stage==='idle'||stage==='recovered'} onClick={advance}>NEXT MEDICAL STAGE</button>
   <button style={button} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-anatomy-mode',{detail:{xray:false,tearApart:false,source:'integration-test'}}))}>HIDE X-RAY</button>
   <button style={button} onClick={checkIn}>CHECK IN MINI CITY</button>
   <small>Mini-city courtyard: (62,62). Walk there in the real 3D world. Saved locally: {visited?'yes':'not confirmed'}. No free credits or teleport.</small>
   <div aria-live="polite" role="status">{note}</div>
   <button style={button} onClick={()=>setOpen(false)}>CLOSE</button>
  </section>}
 </aside>
}
