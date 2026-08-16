import { useEffect, useState } from 'react'
import SafetyActionSheet from './SafetyActionSheet'
import type { ModerationTarget } from '../services/moderation'

type SafetyTarget={
  targetType:ModerationTarget
  targetId:string
  targetLabel?:string
  reportedUserId?:string|null
  roomName?:string
  messageIds?:string[]
  mediaRefs?:string[]
  context?:Record<string,unknown>
}

declare global{
  interface WindowEventMap{
    'tryamm:safety-open':CustomEvent<SafetyTarget>
  }
}

function fallbackTarget():SafetyTarget{
  const path=`${location.pathname}${location.search}${location.hash}`
  return {
    targetType:'other',
    targetId:`surface:${path||'/'}`,
    targetLabel:document.title||'TRYAMM surface',
    context:{path,href:location.href,title:document.title},
  }
}

export function openTryAMMSafety(target:SafetyTarget){
  window.dispatchEvent(new CustomEvent('tryamm:safety-open',{detail:target}))
}

export default function UniversalSafetyLauncher(){
  const [open,setOpen]=useState(false)
  const [target,setTarget]=useState<SafetyTarget>(()=>fallbackTarget())

  useEffect(()=>{
    const onOpen=(event:CustomEvent<SafetyTarget>)=>{
      setTarget({...fallbackTarget(),...(event.detail||{})})
      setOpen(true)
    }
    window.addEventListener('tryamm:safety-open',onOpen as EventListener)
    return ()=>window.removeEventListener('tryamm:safety-open',onOpen as EventListener)
  },[])

  return <>
    <button
      type="button"
      aria-label="Open TRYAMM Safety Center"
      title="Safety / Report / Block / Mute"
      onClick={()=>{setTarget(fallbackTarget());setOpen(true)}}
      style={{position:'fixed',left:14,bottom:84,zIndex:9998,width:48,height:48,borderRadius:16,border:'1px solid rgba(79,227,255,.5)',background:'rgba(4,5,14,.94)',color:'#fff',fontSize:22,boxShadow:'0 0 22px rgba(79,227,255,.22)',cursor:'pointer'}}
    >🛡</button>
    <SafetyActionSheet
      open={open}
      onClose={()=>setOpen(false)}
      targetType={target.targetType}
      targetId={target.targetId}
      targetLabel={target.targetLabel}
      reportedUserId={target.reportedUserId}
      roomName={target.roomName}
      messageIds={target.messageIds}
      mediaRefs={target.mediaRefs}
      context={target.context}
    />
  </>
}
