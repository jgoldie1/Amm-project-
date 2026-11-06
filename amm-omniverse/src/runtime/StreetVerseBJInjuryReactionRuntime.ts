import type {BJInjuryKind,BJInjuryState} from './StreetVerseBJInjuryBridgeRuntime'

/** Fictional, non-medical character response; deliberately avoids graphic effects. */
export type BJReactionPose='neutral'|'stagger'|'guard'|'limp'|'recover'
export interface BJReactionFrame {pose:BJReactionPose;tilt:number;speedMultiplier:number;requestRescue:boolean}
export function createBJInjuryReaction(){
  let hitAt=-Infinity
  let lastKind:BJInjuryKind|null=null
  let rescueSent=false
  return {
    onInjury(kind:BJInjuryKind,atMs:number){hitAt=atMs;lastKind=kind;if(kind==='recovery')rescueSent=false},
    movementMultiplier(state:BJInjuryState){return state.health<=20?.48:state.health<=40?.65:state.health<100?.85:1},
    frame(state:BJInjuryState,nowMs:number):BJReactionFrame{
      const elapsed=Math.max(0,nowMs-hitAt)
      const acute=elapsed<1100
      let pose:BJReactionPose='neutral'
      let tilt=0
      if(lastKind==='recovery'&&elapsed<1300)pose='recover'
      else if(acute&&lastKind==='shot'){pose='stagger';tilt=.11*Math.sin(elapsed*.012)}
      else if(acute&&lastKind==='stab'){pose='guard';tilt=.07}
      else if(state.injured){pose='limp';tilt=.025*Math.sin(nowMs*.009)}
      const speedMultiplier=state.health<=20?.48:state.health<=40?.65:state.health<100?.85:1
      const requestRescue=state.health<=40&&!rescueSent
      if(requestRescue)rescueSent=true
      return {pose,tilt,speedMultiplier,requestRescue}
    },
  }
}
