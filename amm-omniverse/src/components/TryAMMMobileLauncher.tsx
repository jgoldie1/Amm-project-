import { useEffect, useState } from 'react'
import TryAMMMobileHub from './TryAMMMobileHub'
import { mobileFeatureEnabled } from '../mobile/TryAMMMobilePlatform'

export default function TryAMMMobileLauncher(){
  const [open,setOpen]=useState(false)
  const enabled=mobileFeatureEnabled()
  useEffect(()=>{
    const fn=()=>setOpen(true)
    window.addEventListener('tryamm:mobile-open',fn)
    ;(window as any).__showTryAMMMobile=fn
    return()=>{window.removeEventListener('tryamm:mobile-open',fn);if((window as any).__showTryAMMMobile===fn)delete (window as any).__showTryAMMMobile}
  },[])
  if(!enabled)return null
  return <>
    <button type="button" aria-label="Open TRYAMM Mobile and All American Mobile" onClick={()=>setOpen(true)} style={{position:'fixed',right:18,bottom:176,zIndex:9050,border:'1px solid #4FE3FF88',borderRadius:999,padding:'10px 13px',background:'#07131f',color:'#fff',fontSize:10,fontWeight:900,cursor:'pointer',boxShadow:'0 0 18px #4FE3FF22'}}>📱 TRYAMM • ALL AMERICAN MOBILE</button>
    {open&&<TryAMMMobileHub onClose={()=>setOpen(false)}/>} 
  </>
}
