import { lazy, Suspense, useEffect, useState } from 'react'
import {installPocketEdgeWorker} from '../runtime/TryammPocketEdgeWorker'

const MiddleverseWorkstation=lazy(()=>import('./MiddleverseWorkstation'))

export default function MiddleverseLauncher(){
  const [open,setOpen]=useState(false)

  useEffect(()=>{
    const uninstallEdge=installPocketEdgeWorker()
    const show=()=>setOpen(true)
    ;(window as any).__showMiddleverseWorkstation=show
    window.addEventListener('tryamm:middleverse-open',show)
    return ()=>{
      window.removeEventListener('tryamm:middleverse-open',show)
      if((window as any).__showMiddleverseWorkstation===show) delete (window as any).__showMiddleverseWorkstation
      uninstallEdge()
    }
  },[])

  return open?<Suspense fallback={null}><MiddleverseWorkstation onClose={()=>setOpen(false)}/></Suspense>:null
}