import { lazy, Suspense, useState } from 'react'

const HoloSearchCenter = lazy(() => import('./HoloSearchCenter'))

export default function HoloSearchLauncher(){
  const [open,setOpen]=useState(false)
  ;(window as any).__showHoloSearch=()=>setOpen(true)
  return <>
    <button type="button" onClick={()=>setOpen(true)} aria-label="Open Holo Search and OmniNet" style={{position:'fixed',left:'50%',top:12,transform:'translateX(-50%)',zIndex:9100,borderRadius:999,border:'1px solid #4fe3ffaa',background:'#061522e8',color:'#8ff5ff',padding:'9px 15px',font:'900 11px monospace',boxShadow:'0 0 20px #4fe3ff22',cursor:'pointer'}}>⌕ HOLO SEARCH · OMNINET™</button>
    {open&&<Suspense fallback={null}><HoloSearchCenter onClose={()=>setOpen(false)}/></Suspense>}
  </>
}
