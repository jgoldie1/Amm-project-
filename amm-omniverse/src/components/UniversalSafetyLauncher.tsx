import { useEffect, useState } from 'react'
import SafetyActionSheet from './SafetyActionSheet'
import SafeJourneyPanel from './SafeJourneyPanel'
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
    'tryamm:safe-journey-open':CustomEvent<void>
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

export function openTryAMMSafeJourney(){
  window.dispatchEvent(new CustomEvent('tryamm:safe-journey-open'))
}

export default function UniversalSafetyLauncher(){
  const [open,setOpen]=useState(false)
  const [journeyOpen,setJourneyOpen]=useState(false)
  const [target,setTarget]=useState<SafetyTarget>(()=>fallbackTarget())

  useEffect(()=>{
    const onOpen=(event:CustomEvent<SafetyTarget>)=>{
      setTarget({...fallbackTarget(),...(event.detail||{})})
      setOpen(true)
    }
    const onJourneyOpen=()=>setJourneyOpen(true)
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
    window.addEventListener('tryamm:safe-journey-open',onJourneyOpen as EventListener)
    document.addEventListener('contextmenu',onContextMenu)
    document.addEventListener('keydown',onKeyDown)
    document.addEventListener('tryamm:safety-request',onSafetyRequest)
    return ()=>{
      window.removeEventListener('tryamm:safety-open',onOpen as EventListener)
      window.removeEventListener('tryamm:safe-journey-open',onJourneyOpen as EventListener)
      document.removeEventListener('contextmenu',onContextMenu)
      document.removeEventListener('keydown',onKeyDown)
      document.removeEventListener('tryamm:safety-request',onSafetyRequest)
    }
  },[])

  return <>
    <div style={{position:'fixed',left:14,bottom:84,zIndex:9998,display:'grid',gap:8}}>
      <button
        type="button"
        aria-label="Open TRYAMM Safety Center"
        title="Safety / Report / Block / Mute"
        onClick={()=>{setTarget(fallbackTarget());setOpen(true)}}
        style={{width:48,height:48,borderRadius:16,border:'1px solid rgba(79,227,255,.5)',background:'rgba(4,5,14,.94)',color:'#fff',fontSize:22,boxShadow:'0 0 22px rgba(79,227,255,.22)',cursor:'pointer'}}
      >🛡</button>
      <button
        type="button"
        aria-label="Open Safe Journey"
        title="Safe Journey / Check-in / Route support"
        onClick={()=>setJourneyOpen(true)}
        style={{width:48,height:48,borderRadius:16,border:'1px solid rgba(232,185,68,.55)',background:'rgba(4,5,14,.94)',color:'#fff',fontSize:20,boxShadow:'0 0 22px rgba(232,185,68,.18)',cursor:'pointer'}}
      >🧭</button>
    </div>
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
    <SafeJourneyPanel open={journeyOpen} onClose={()=>setJourneyOpen(false)} />
  </>
}