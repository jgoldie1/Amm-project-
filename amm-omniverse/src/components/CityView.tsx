import { useEffect, useRef, useState } from 'react'
import StreetVerseGeoSpawnBridge from './StreetVerseGeoSpawnBridge'
import { useGameStore } from '../game/state/useGameStore'

const STREETVERSE_HANDOFF_KEY = 'tryamm:streetverse-handoff:v1'

/**
 * StreetVerse has one authoritative production entry: /streetverse.
 * Preserve the legacy PWA screen as an offline fallback, but converge online
 * sessions onto the canonical route without dropping player economy/progression.
 */
export default function CityView(){
  const setScreen=useGameStore(s=>s.setScreen)
  const [offline,setOffline]=useState(()=>typeof navigator !== 'undefined' && !navigator.onLine)
  const cancelled=useRef(false)

  useEffect(()=>{
    const onOnline=()=>setOffline(false)
    const onOffline=()=>setOffline(true)
    window.addEventListener('online',onOnline)
    window.addEventListener('offline',onOffline)

    if(window.location.pathname.startsWith('/streetverse') || !navigator.onLine){
      return ()=>{
        window.removeEventListener('online',onOnline)
        window.removeEventListener('offline',onOffline)
      }
    }

    const timer=window.setTimeout(()=>{
      if(cancelled.current) return
      const state=useGameStore.getState()
      try{
        sessionStorage.setItem(STREETVERSE_HANDOFF_KEY,JSON.stringify({
          player:state.player,
          missions:state.missions,
          vehicles:state.vehicles,
          walletConnected:state.walletConnected,
          walletAddress:state.walletAddress,
          nftCount:state.nftCount,
          savedAt:Date.now(),
        }))
      }catch{}
      window.location.assign('/streetverse')
    },350)

    return ()=>{
      cancelled.current=true
      window.clearTimeout(timer)
      window.removeEventListener('online',onOnline)
      window.removeEventListener('offline',onOffline)
    }
  },[])

  if(offline){
    return <StreetVerseGeoSpawnBridge onClose={()=>setScreen('intro')}/>
  }

  return <div role="status" aria-live="polite" style={{width:'100%',height:'100dvh',display:'grid',placeItems:'center',background:'#050505',color:'#fff',fontFamily:'system-ui,sans-serif',fontWeight:900}}>
    <div style={{textAlign:'center'}}>
      <div>ENTERING STREETVERSE…</div>
      <button type="button" onClick={()=>{cancelled.current=true;setScreen('intro')}} style={{marginTop:16,minHeight:44,padding:'10px 16px',borderRadius:999,border:'1px solid #ffffff55',background:'#111827',color:'#fff',fontWeight:800}}>CANCEL</button>
    </div>
  </div>
}
