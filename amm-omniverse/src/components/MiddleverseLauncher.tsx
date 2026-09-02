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

  return open?<Suspense fallback={null}><MiddleverseWorkstation onClose={()=>setOpen(false)}/></Suspense>:null
}
