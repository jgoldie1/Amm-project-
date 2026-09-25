import {lazy,Suspense,useEffect,useState} from 'react'
import type {StreetVerseReelContext} from './StreetVerseReelRecorder'
const StreetVerseReelRecorder=lazy(()=>import('./StreetVerseReelRecorder'))

export default function StreetVerseReelEventBridge(){
 const [open,setOpen]=useState(false)
 const [context,setContext]=useState<StreetVerseReelContext>({})
 useEffect(()=>{
  const openHandler=(event:Event)=>{
   const detail=(event as CustomEvent<StreetVerseReelContext>).detail||{}
   if(detail.source==='streetverse-community-mobile')return
   setContext(detail)
   setOpen(true)
  }
  const rewardHandler=(event:Event)=>{
   const detail=(event as CustomEvent<StreetVerseReelContext>).detail||{}
   setContext(current=>current.missionId&&detail.missionId===current.missionId?{...current,...detail,verified:true,rewardStatus:'verified'}:current)
  }
  window.addEventListener('tryamm:open-reel-creator',openHandler)
  window.addEventListener('tryamm:streetverse-reel-reward-update',rewardHandler)
  return()=>{window.removeEventListener('tryamm:open-reel-creator',openHandler);window.removeEventListener('tryamm:streetverse-reel-reward-update',rewardHandler)}
 },[])
 return <Suspense fallback={null}><StreetVerseReelRecorder open={open} context={context} onClose={()=>setOpen(false)}/></Suspense>
}
