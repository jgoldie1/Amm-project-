import {useState} from 'react'
import {startFreePlayJourney,advanceFreePlayJourney} from '../runtime/StreetVerseFreePlayJourney'
import type {JourneyStep} from '../runtime/StreetVerseFreePlayJourney'
const labels:Record<JourneyStep,string>={
 'enter-chicago':'Enter Chicago demo','play-bj':'Play as BJ (simulated)','complete-mission':'Complete delivery mission','earn-credits':'Claim fictional mission credits','open-studio':'Open Creator Studio demo','customize-jacket':'Customize jacket','submit-review':'Submit for review','approve-demo':'Simulate independent review','find-approved':'Find approved jacket','buy-cosmetic':'Buy with fictional credits','complete':'Journey complete'
}
const colors=['#ff69b4','#151515','#2845a7','#a31b30','#e0b64b']
export default function StreetVerseFreePlayJourneyTest(){
 const [state,setState]=useState(startFreePlayJourney)
 const [color,setColor]=useState(colors[0])
 const [error,setError]=useState('')
 const advance=()=>{
  try{setState(s=>advanceFreePlayJourney(s,s.step,color));setError('')}
  catch(e){setError(e instanceof Error?e.message:String(e))}
 }
 return <section aria-label="StreetVerse offline end-to-end acceptance test" style={{border:'1px solid #7a8aa4',borderRadius:14,padding:16,marginTop:20}}>
  <h2>Chicago → Creator Marketplace: Guided Test</h2>
  <p><strong>Offline simulation only.</strong> This tests economy and approval transitions; it does not prove real BJ 3D movement, a live Chicago mission, production moderation or real sales.</p>
  <p>Step {Math.min(11,1+['enter-chicago','play-bj','complete-mission','earn-credits','open-studio','customize-jacket','submit-review','approve-demo','find-approved','buy-cosmetic','complete'].indexOf(state.step))} of 11</p>
  <p role="status" aria-live="polite">{error||state.message}</p>
  <p>BJ fictional credits: <strong>{state.player.credits}</strong> | Creator demo credits: <strong>{state.creator.credits}</strong></p>
  {state.step==='customize-jacket'&&<div role="group" aria-label="Choose jacket color" style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:12}}>{colors.map(c=><button key={c} type="button" onClick={()=>setColor(c)} aria-label={'Select '+c} aria-pressed={color===c} style={{width:52,height:52,background:c,border:color===c?'4px solid white':'2px solid #999',borderRadius:10}}/>)}</div>}
  {state.submission&&<p>Jacket: {state.submission.draft.title} | Review status: {state.submission.status} {state.listed?'| Visible in demo marketplace':''}</p>}
  {state.step!=='complete'?<button type="button" onClick={advance} style={{minHeight:56,padding:'12px 18px',fontWeight:700,width:'100%'}}>{labels[state.step]}</button>:<p><strong>Demo journey complete.</strong> BJ owns the jacket; replay is available without a public transaction.</p>}
  <button type="button" onClick={()=>{setState(startFreePlayJourney());setError('')}} style={{minHeight:48,padding:'10px 16px',marginTop:12}}>Reset offline test</button>
 </section>
}
