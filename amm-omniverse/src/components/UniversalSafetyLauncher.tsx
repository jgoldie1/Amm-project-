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

function validTargetType(value:string|undefined):ModerationTarget{
  const allowed:ModerationTarget[]=['user','live','reel','post','comment','dm','game','marketplace','ride','delivery','business','other']
  return allowed.includes(value as ModerationTarget)?value as ModerationTarget:'other'
}

function fromElement(element:HTMLElement):SafetyTarget|null{
  const safety=element.closest<HTMLElement>('[data-safety-target-id]')
  if(safety){
    const targetId=safety.dataset.safetyTargetId
    if(!targetId)return null
    return {
      targetType:validTargetType(safety.dataset.safetyTargetType),
      targetId,
      targetLabel:safety.dataset.safetyTargetLabel||undefined,
      reportedUserId:safety.dataset.safetyUserId||null,
      roomName:safety.dataset.safetyRoomName||undefined,
      context:{source:'rich-target-binding',path:location.pathname},
    }
  }

  const media=element.closest<HTMLElement>('[data-participant]')
  if(media&&media.dataset.local!=='true'){
    const participant=media.dataset.participant
    if(!participant)return null
    return {
      targetType:'user',
      targetId:participant,
      targetLabel:`LIVE participant ${participant}`,
      reportedUserId:participant,
      context:{source:'live-media-participant',path:location.pathname},
    }
  }
  return null
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
    const openBoundTarget=(element:HTMLElement)=>{
      const next=fromElement(element)
      if(!next)return false
      setTarget({...fallbackTarget(),...next})
      setOpen(true)
      return true
    }
    const onContextMenu=(event:MouseEvent)=>{
      if(!(event.target instanceof HTMLElement))return
      if(openBoundTarget(event.target))event.preventDefault()
    }
    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key!=='F10'||!event.shiftKey)return
      if(!(document.activeElement instanceof HTMLElement))return
      if(openBoundTarget(document.activeElement))event.preventDefault()
    }
    const onSafetyRequest=(event:Event)=>{
      const custom=event as CustomEvent<SafetyTarget>
      if(custom.detail)onOpen(custom)
    }

    window.addEventListener('tryamm:safety-open',onOpen as EventListener)
    document.addEventListener('contextmenu',onContextMenu)
    document.addEventListener('keydown',onKeyDown)
    document.addEventListener('tryamm:safety-request',onSafetyRequest)
    return ()=>{
      window.removeEventListener('tryamm:safety-open',onOpen as EventListener)
      document.removeEventListener('contextmenu',onContextMenu)
      document.removeEventListener('keydown',onKeyDown)
      document.removeEventListener('tryamm:safety-request',onSafetyRequest)
    }
  },[])

  return <SafetyActionSheet
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
}
