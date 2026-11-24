import {assessChicagoJourney,emptyChicagoJourney,JOURNEY_STEPS,STEP_LABELS} from '../foundation/chicagoHoloJourneyEvidence'

const linkStyle:React.CSSProperties={display:'inline-flex',alignItems:'center',justifyContent:'center',minHeight:52,padding:'12px 14px',borderRadius:12,border:'1px solid #6997ae',background:'#13354b',color:'#fff',fontSize:15,fontWeight:800,textDecoration:'none'}
const buttonStyle:React.CSSProperties={...linkStyle,cursor:'pointer'}
export default function ChicagoHoloJourneyStatus(){
 // This is intentionally pending until an authenticated server reports evidence.
 // Client-side navigation events must NEVER mark a purchase or delivery complete.
 const progress=assessChicagoJourney(emptyChicagoJourney())
 const openAgent=(key:'__showMiddleverseWorkstation'|'__showBennie')=>{
  const fn=(window as unknown as Record<string,unknown>)[key]
  if(typeof fn==='function'){(fn as ()=>void)();return}
  window.dispatchEvent(new CustomEvent('tryamm:assistant-unavailable',{detail:{agent:key,reason:'integration_not_ready'}}))
 }
 return <section aria-label="Chicago journey and AI tools" style={{padding:16,border:'1px solid #446c80',borderRadius:16,background:'#0b2132',color:'#fff',marginTop:14}}>
  <h3 style={{fontSize:20,margin:'0 0 8px'}}>Chicago → Farm → Holo Gallery → Purchase → HoloServices Delivery</h3>
  <p role="status" style={{color:'#ffe4a7'}}>Evidence status: {progress.passed} of {progress.total} steps independently verified by this pilot. This is not an estimate of overall app completion.</p>
  <ol style={{lineHeight:1.8,paddingLeft:24}}>{JOURNEY_STEPS.map(step=><li key={step}>{STEP_LABELS[step]} — pending trusted evidence</li>)}</ol>
  <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
   <a href="/chicago77" style={linkStyle}>Chicago Geo Atlas</a>
   <a href="/holo-gallery" style={linkStyle}>Holo Gallery</a>
   <a href="/holo-ride" style={linkStyle}>Holo Ride</a>
   <a href="/holo-delivery" style={linkStyle}>Holo Delivery</a>
   <a href="/holo-logistics" style={linkStyle}>Holo Logistics</a>
   <a href="/holo-drone" style={linkStyle}>Holo Drone (Simulation)</a>
   <button type="button" style={buttonStyle} onClick={()=>openAgent('__showMiddleverseWorkstation')}>Middleverse AI — Coordinate</button>
   <button type="button" style={buttonStyle} onClick={()=>openAgent('__showBennie')}>Stubbs AI — Assist</button>
  </div>
  <p style={{color:'#b5ccda',fontSize:13,lineHeight:1.5}}>Middleverse coordinates existing platform tools; Stubbs AI helps with guidance and accessibility. Neither is allowed to grant supplier consent, settle payment, or invent delivery events. HoloServers and Googloplex Memory availability require separate authenticated checks.</p>
 </section>
}
