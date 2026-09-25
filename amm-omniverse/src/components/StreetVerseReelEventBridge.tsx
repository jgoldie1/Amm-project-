import {lazy,Suspense,useEffect,useState} from 'react'
const StreetVerseReelRecorder=lazy(()=>import('./StreetVerseReelRecorder'))

export default function StreetVerseReelEventBridge(){
 const [open,setOpen]=useState(false)
 useEffect(()=>{const handler=(event:Event)=>{const detail=(event as CustomEvent<{source?:string}>).detail||{};if(detail.source==='streetverse-community-mobile')return;setOpen(true)};window.addEventListener('tryamm:open-reel-creator',handler);return()=>window.removeEventListener('tryamm:open-reel-creator',handler)},[])
 return <Suspense fallback={null}><StreetVerseReelRecorder open={open} onClose={()=>setOpen(false)}/></Suspense>
}
