import type { PropsWithChildren, ReactNode } from 'react'
import { openTryAMMSafety } from './UniversalSafetyLauncher'
import type { ModerationTarget } from '../services/moderation'

export type SafetyTargetProps={
  targetType:ModerationTarget
  targetId:string
  targetLabel?:string
  reportedUserId?:string|null
  roomName?:string
  context?:Record<string,unknown>
}

export function SafetyTarget({children,...target}:PropsWithChildren<SafetyTargetProps>){
  return <span
    data-safety-target-type={target.targetType}
    data-safety-target-id={target.targetId}
    data-safety-target-label={target.targetLabel}
    data-safety-user-id={target.reportedUserId||undefined}
    data-safety-room-name={target.roomName}
    style={{display:'contents'}}
  >{children}</span>
}

export function SafetyButton({target,children='🛡 Safety',className}:{target:SafetyTargetProps;children?:ReactNode;className?:string}){
  return <button
    type="button"
    className={className}
    aria-label={typeof children==='string'?children:'Open safety actions'}
    onClick={()=>openTryAMMSafety(target)}
    style={className?undefined:{border:'1px solid rgba(79,227,255,.4)',background:'rgba(4,5,14,.88)',color:'#fff',borderRadius:10,padding:'8px 10px',fontWeight:700,cursor:'pointer'}}
  >{children}</button>
}
