import * as THREE from 'three'

/**
 * Short, visibly rig-driven RP gestures on the actual mounted BJ object.
 * This does not generate GLB clips or make unavailable catalogue animations
 * appear installed. Unrecognized/unsupported rigs return false.
 */
export type BJRPProceduralAction =
  'wave-friendly'|'victory'|'pray-standing'|'street-dance'|'two-step'|
  'creator-pose'|'security-scan'|'police-radio'|'mic-performance'

type ArmPose='wave'|'victory'|'pray'|'dance'|'pose'|'scan'|'radio'|'perform'
const POSES:Record<BJRPProceduralAction,ArmPose>={
  'wave-friendly':'wave',
  victory:'victory',
  'pray-standing':'pray',
  'street-dance':'dance',
  'two-step':'dance',
  'creator-pose':'pose',
  'security-scan':'scan',
  'police-radio':'radio',
  'mic-performance':'perform',
}

const findNode=(root:THREE.Object3D,patterns:readonly RegExp[])=>{
  let found:THREE.Object3D|null=null
  root.traverse(node=>{
    if(!found&&!(node instanceof THREE.Mesh)&&patterns.some(pattern=>pattern.test(node.name)))found=node
  })
  return found
}

export function createStreetVerseBJRPProceduralAnimator(root:THREE.Object3D){
  const right=findNode(root,[/rig[-_ ]?right[-_ ]?arm/i,/mixamorig.*rightarm/i,/rightupperarm/i,/right_arm/i,/upperarm[_ .-]?r$/i,/^arm[_ .-]?r$/i])
  const left=findNode(root,[/rig[-_ ]?left[-_ ]?arm/i,/mixamorig.*leftarm/i,/leftupperarm/i,/left_arm/i,/upperarm[_ .-]?l$/i,/^arm[_ .-]?l$/i])
  const spine=findNode(root,[/rig[-_ ]?spine/i,/spine2?/i,/upperchest/i,/chest/i,/torso/i])
  const relevant=[right,left,spine].filter((node):node is THREE.Object3D=>Boolean(node))
  const rest=new Map<THREE.Object3D,THREE.Euler>()
  let active:{pose:ArmPose;start:number;until:number;loop:boolean}|null=null

  const stop=()=>{
    for(const [node,rotation] of rest)node.rotation.copy(rotation)
    rest.clear()
    active=null
  }
  const play=(actionId:string,loop=false,durationMs=2600):boolean=>{
    stop()
    if(!Object.prototype.hasOwnProperty.call(POSES,actionId))return false
    const pose=POSES[actionId as BJRPProceduralAction]
    if((pose==='wave'||pose==='radio'||pose==='scan'||pose==='perform')&&!right)return false
    if((pose==='victory'||pose==='pray'||pose==='dance'||pose==='pose')&&(!left||!right))return false
    for(const node of relevant)rest.set(node,node.rotation.clone())
    const start=performance.now()
    // Loop requests last for a bounded preview; no indefinite unsolicited motion.
    active={pose,start,until:start+Math.min(9000,Math.max(600,loop?6500:durationMs)),loop}
    return true
  }
  const tick=(nowMs:number)=>{
    if(!active)return
    if(nowMs>=active.until){stop();return}
    const elapsed=(nowMs-active.start)/1000
    const phase=Math.sin(elapsed*8.4)
    const {pose}=active
    const set=(node:THREE.Object3D|null,x:number,z:number,y=0)=>{
      if(!node)return
      const base=rest.get(node)
      if(!base)return
      node.rotation.set(base.x+x,base.y+y,base.z+z,base.order)
    }
    if(pose==='wave'){set(right,-.55+phase*.22,-.88);return}
    if(pose==='victory'){set(right,-.92,-.64);set(left,-.92,.64);return}
    if(pose==='pray'){set(right,-.68,-.38);set(left,-.68,.38);return}
    if(pose==='scan'){set(right,-.40,-.18);set(spine,0,0,Math.sin(elapsed*1.8)*.22);return}
    if(pose==='radio'){set(right,-1.04,-.25);return}
    if(pose==='perform'){set(right,-.86,-.18);set(spine,0,Math.sin(elapsed*2.5)*.06);return}
    if(pose==='pose'){set(right,-.34,-.25);set(left,-.32,.25);return}
    if(pose==='dance'){
      set(right,-.42+phase*.23,-.36)
      set(left,-.42-phase*.23,.36)
      set(spine,0,Math.sin(elapsed*4.0)*.08)
    }
  }
  return{play,tick,stop,dispose:stop,hasArmRig:Boolean(right||left)}
}
