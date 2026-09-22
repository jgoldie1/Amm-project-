import { useEffect } from 'react'
import { useGameStore } from '../game/state/useGameStore'

/**
 * StreetVerse has one authoritative production entry: /streetverse.
 * The legacy in-app "city" screen now converges onto that route so PWA,
 * Home Screen, Safari, and direct links all receive the same game shell,
 * controls, missions, and release diagnostics.
 */
export default function CityView(){
  const setScreen=useGameStore(s=>s.setScreen)

  useEffect(()=>{
    if(window.location.pathname.startsWith('/streetverse')) return
    window.location.assign('/streetverse')
  },[])

  return <div role="status" aria-live="polite" style={{width:'100%',height:'100dvh',display:'grid',placeItems:'center',background:'#050505',color:'#fff',fontFamily:'system-ui,sans-serif',fontWeight:900}}>
    <div style={{textAlign:'center'}}>
      <div>ENTERING STREETVERSE…</div>
      <button type="button" onClick={()=>setScreen('intro')} style={{marginTop:16,minHeight:44,padding:'10px 16px',borderRadius:999,border:'1px solid #ffffff55',background:'#111827',color:'#fff',fontWeight:800}}>CANCEL</button>
    </div>
  </div>
}
