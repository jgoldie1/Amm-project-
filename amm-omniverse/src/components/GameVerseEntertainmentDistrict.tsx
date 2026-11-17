import {useCallback,useEffect,useState} from 'react'
import {ENTERTAINMENT_DISTRICT_KEY,ENTERTAINMENT_VENUES,ENTERTAINMENT_MONEY_RULES,safeDistrictState,visitEntertainmentVenue} from '../runtime/GameVerseEntertainmentDistrict.mjs'

const action:React.CSSProperties={minHeight:48,padding:'10px 14px',borderRadius:12,border:'1px solid #7edfff',background:'#113049',color:'#fff',fontWeight:800,fontSize:14,touchAction:'manipulation',cursor:'pointer'}

export default function GameVerseEntertainmentDistrict({onClose}:{onClose:()=>void}){
 const [state,setState]=useState(()=>{try{return safeDistrictState(JSON.parse(localStorage.getItem(ENTERTAINMENT_DISTRICT_KEY)||'{}'))}catch{return safeDistrictState(null)}})
 const [message,setMessage]=useState('Select a venue for a free roleplay tour. No wagers, tickets or money movement.')
 const [selected,setSelected]=useState<string|null>(null)
 const [dialogue,setDialogue]=useState('')
 const save=useCallback((next:ReturnType<typeof safeDistrictState>)=>{setState(next);try{localStorage.setItem(ENTERTAINMENT_DISTRICT_KEY,JSON.stringify(next))}catch{setMessage('Visit recorded for this session, but local save was unavailable.')}},[])
 const enter=(id:string)=>{
  const result=visitEntertainmentVenue(state,id)
  if(!result.ok||!result.venue)return
  save(result.state);setSelected(id);setDialogue(result.venue.dialogue)
  setMessage(result.duplicate?'Welcome back. Your visit is already counted.':'Visit completed (simulation only). No reward or purchase was created.')
  window.dispatchEvent(new CustomEvent('tryamm:gameverse-entertainment-visit',{detail:{venueId:id,roleplayOnly:true,currencyAwarded:0,transactionCreated:false,source:'gameverse-entertainment'}}))
 }
 useEffect(()=>{const listener=()=>{try{save(safeDistrictState(JSON.parse(localStorage.getItem(ENTERTAINMENT_DISTRICT_KEY)||'{}')));setMessage('Local tour data reloaded.')}catch{setMessage('Local data could not be reloaded.')}};window.addEventListener('tryamm:gameverse-entertainment-reload',listener);return()=>window.removeEventListener('tryamm:gameverse-entertainment-reload',listener)},[save])
 return <section role="dialog" aria-modal="true" aria-label="All American Entertainment District" style={{position:'fixed',inset:0,zIndex:18000,overflowY:'auto',background:'radial-gradient(circle at 50% 0,#1a214e,#050a15 65%)',color:'#f5fbff',fontFamily:'system-ui',padding:'max(14px,env(safe-area-inset-top)) 16px 48px'}}>
  <div style={{maxWidth:900,margin:'0 auto',display:'grid',gap:14}}>
   <header style={{display:'flex',gap:12,justifyContent:'space-between',alignItems:'center',flexWrap:'wrap'}}><div><div style={{fontSize:11,color:'#ffd482',letterSpacing:2,fontWeight:900}}>GAMEVERSE • CHICAGO DISTRICT PREVIEW</div><h1 style={{fontSize:26,margin:'5px 0'}}>All American Entertainment District</h1></div><button style={action} onClick={onClose}>CLOSE</button></header>
   <p style={{fontSize:14,lineHeight:1.6,color:'#bbd4ea',margin:0}}>Four fictional roleplay venues with an accessible one-push concierge interaction. This is a UI and mission-state prototype, not a navigable 3D casino, hotel, nightclub or theater.</p>
   <div role="note" style={{border:'1px solid #ffcc77',borderRadius:12,padding:12,color:'#ffdda0',fontWeight:700}}>FREE PLAY ONLY • No gambling, wagering, purchased chips, lotteries, sweepstakes, prizes, payouts, hotel booking or real-money transactions.</div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(245px,1fr))',gap:12}}>
    {ENTERTAINMENT_VENUES.map(venue=><article key={venue.id} style={{border:'1px solid #33516d',background:'#081a2a',borderRadius:15,padding:16,display:'grid',gap:9}}><h2 style={{fontSize:18,margin:0}}>{venue.name}</h2><p style={{fontSize:13,color:'#c6d7e3',lineHeight:1.5,margin:0}}>{venue.activity}</p><small>MISSION: {venue.mission}</small><button style={action} onClick={()=>enter(venue.id)}>ONE PUSH • TALK / TOUR</button><small>{state.visited.includes(venue.id)?'✓ Visited (local simulation)':'Not visited yet'}</small></article>)}
   </div>
   <section style={{border:'1px solid #365574',borderRadius:12,padding:14,background:'#071421'}}>
    <strong>Concierge dialogue</strong><p aria-live="polite" style={{minHeight:35,fontSize:15}}>{dialogue||'Choose a venue and press TALK / TOUR.'}</p>
    <div role="status" aria-live="polite" style={{fontSize:13,color:'#a8edcf'}}>{message}</div>
    <p style={{fontSize:12,color:'#bcd1e5'}}>Visited {state.visited.length} of {ENTERTAINMENT_VENUES.length} • Last venue: {selected||state.lastVenue||'none'}</p>
    <button style={action} onClick={()=>{try{save(safeDistrictState(JSON.parse(localStorage.getItem(ENTERTAINMENT_DISTRICT_KEY)||'{}')));setMessage('Local tour data reloaded.')}catch{setMessage('Local data could not be reloaded.')}}}>RELOAD VISITS</button>
   </section>
   <small>Safety policy: {ENTERTAINMENT_MONEY_RULES.mode}. Visits are device-local and cannot authorize payments or claim cloud synchronization.</small>
  </div>
 </section>
}
