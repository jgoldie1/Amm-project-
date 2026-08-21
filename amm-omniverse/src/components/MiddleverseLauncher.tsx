import { lazy, Suspense, useEffect, useState } from 'react'

const MiddleverseWorkstation=lazy(()=>import('./MiddleverseWorkstation'))

export default function MiddleverseLauncher(){
  const [open,setOpen]=useState(false)

  useEffect(()=>{
    const show=()=>setOpen(true)
    ;(window as any).__showMiddleverseWorkstation=show
    window.addEventListener('tryamm:middleverse-open',show)
    return ()=>{
      window.removeEventListener('tryamm:middleverse-open',show)
      if((window as any).__showMiddleverseWorkstation===show) delete (window as any).__showMiddleverseWorkstation
    }
  },[])

  return <>
    <button type="button" aria-label="Open Middleverse AI Workforce and Developer Workstation" onClick={()=>setOpen(true)} style={{position:'fixed',right:12,bottom:222,zIndex:9001,background:'linear-gradient(135deg,#0b2839,#24143c)',color:'#4fe3ff',border:'1px solid #e8b94488',borderRadius:999,padding:'10px 14px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer',boxShadow:'0 8px 28px #0008'}}>◈ MIDDLEVERSE WORKSTATION</button>
    {open&&<Suspense fallback={null}><MiddleverseWorkstation onClose={()=>setOpen(false)}/></Suspense>}
  </>
}
