import { lazy, Suspense, useEffect, useState } from 'react'

const JacobieVisionCenter = lazy(() => import('./JacobieVisionCenter'))

export default function JacobieVisionLauncher(){
  const [open,setOpen]=useState(false)

  useEffect(()=>{
    const show=()=>setOpen(true)
    ;(window as any).__showJacobieVision=show
    window.addEventListener('tryamm:jacobie-vision-open',show)
    return()=>{
      window.removeEventListener('tryamm:jacobie-vision-open',show)
      delete (window as any).__showJacobieVision
    }
  },[])

  if(!open)return null
  return <Suspense fallback={<div style={{position:'fixed',inset:0,zIndex:10120,background:'#03060d'}}/>}>
    <JacobieVisionCenter onClose={()=>setOpen(false)}/>
  </Suspense>
}
