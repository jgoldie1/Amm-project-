import * as THREE from 'three'
import {STREETVERSE_RP_EXTRA_POSE_MAP,type RPExtraPose} from '../data/streetVerseRPExtra50'

/**
 * Visible, temporary gestures on the actual rendered BJ rig.
 * Never pretends to import or retarget a GLB animation.
 * A gesture only returns true when the bones it needs are present.
 * Combat/boxing and Shadow Box are intentionally out of scope.
 */
type GesturePose=RPExtraPose

export const BJ_RP_PROCEDURAL_POSES:Readonly<Record<string,GesturePose>>={
  'wave-friendly':'wave',
  handshake:'handshake',
  hug:'hug',
  laugh:'laugh',
  argue:'argue',
  'sit-relaxed':'sit',
  'street-dance':'dance',
  'two-step':'dance',
  victory:'victory',
  'pray-standing':'pray',
  'mechanic-work':'mechanic',
  'security-scan':'scan',
  'police-radio':'radio',
  'medical-assist':'medical',
  'basketball-dribble':'basketball',
  'creator-pose':'pose',
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
  const rightLeg=findNode(root,[/rig[-_ ]?right[-_ ]?leg/i,/mixamorig.*rightupleg/i,/rightupleg/i,/right_leg/i,/thigh[_ .-]?r$/i])
  const leftLeg=findNode(root,[/rig[-_ ]?left[-_ ]?leg/i,/mixamorig.*leftupleg/i,/leftupleg/i,/left_leg/i,/thigh[_ .-]?l$/i])
  const head=findNode(root,[/^rig[-_ ]?head$/i,/^head$/i,/mixamorig.*head/i])
  const spine=findNode(root,[/rig[-_ ]?spine/i,/spine2?/i,/upperchest/i,/chest/i,/torso/i])
  const relevant=[right,left,rightLeg,leftLeg,head,spine].filter((node):node is THREE.Object3D=>Boolean(node))
  const rest=new Map<THREE.Object3D,THREE.Euler>()
  let active:{pose:GesturePose;start:number;until:number;strength:number;speed:number;phase:number}|null=null

  const stop=()=>{
    for(const [node,rotation] of rest)node.rotation.copy(rotation)
    rest.clear()
    active=null
  }
  const play=(actionId:string,loop=false,durationMs=2600):boolean=>{
    stop()
    const recipe=STREETVERSE_RP_EXTRA_POSE_MAP[actionId]
    if(!recipe&&!Object.prototype.hasOwnProperty.call(BJ_RP_PROCEDURAL_POSES,actionId))return false
    const pose=recipe?.pose||BJ_RP_PROCEDURAL_POSES[actionId]
    if(['wave','handshake','scan','radio','perform'].includes(pose)&&!right)return false
    if(['hug','argue','dance','victory','pray','mechanic','medical','basketball','pose','clap'].includes(pose)&&(!left||!right))return false
    if(pose==='sit'&&(!leftLeg||!rightLeg||!spine))return false
    if((pose==='laugh'||pose==='bow')&&!spine&&!head)return false
    for(const node of relevant)rest.set(node,node.rotation.clone())
    const start=performance.now()
    active={pose,start,until:start+Math.min(9000,Math.max(600,loop?6500:durationMs)),strength:recipe?.strength||1,speed:recipe?.speed||1,phase:recipe?.phase||0}
    return true
  }
  const tick=(nowMs:number)=>{
    if(!active)return
    if(nowMs>=active.until){stop();return}
    const elapsed=(nowMs-active.start)/1000
    const phase=Math.sin(elapsed*8.4*active.speed+active.phase)*active.strength
    const sway=Math.sin(elapsed*4*active.speed+active.phase)*active.strength
    const {pose}=active
    const set=(node:THREE.Object3D|null,x:number,z:number,y=0)=>{
      if(!node)return
      const base=rest.get(node)
      if(!base)return
      node.rotation.set(base.x+x,base.y+y,base.z+z,base.order)
    }
    switch(pose){
      case 'wave':set(right,-.65+phase*.28,-.86);break
      case 'handshake':set(right,-.70+sway*.07,-.23);break
      case 'hug':set(right,-.55,-.85);set(left,-.55,.85);break
      case 'laugh':set(head,Math.sin(elapsed*7)*.12,0);set(spine,-.10+sway*.035,0);break
      case 'argue':set(right,-.38+phase*.22,-.30);set(left,-.30-phase*.24,.30);break
      case 'sit':set(leftLeg,-1.15,0);set(rightLeg,-1.15,0);set(spine,.09,0);break
      case 'victory':set(right,-.95,-.64);set(left,-.95,.64);break
      case 'pray':set(right,-.72,-.37);set(left,-.72,.37);break
      case 'mechanic':set(right,-.84+phase*.16,-.24);set(left,-.67,.28);set(spine,.18,0);break
      case 'scan':set(right,-.43,-.18);set(spine,0,0,Math.sin(elapsed*1.8)*.24);break
      case 'radio':set(right,-1.03,-.25);break
      case 'medical':set(right,-.82,-.20);set(left,-.82,.20);set(spine,.16,0);break
      case 'basketball':set(right,-.55+phase*.25,-.15);set(left,-.36,.14);break
      case 'perform':set(right,-.84,-.17);set(spine,0,sway*.06);break
      case 'pose':set(right,-.34,-.25);set(left,-.32,.25);break
      case 'clap':set(right,-.58+phase*.13,-.44+phase*.12);set(left,-.58-phase*.13,.44-phase*.12);break
      case 'bow':set(spine,.36+Math.abs(sway)*.08,0);set(head,.10,0);break
      case 'dance':set(right,-.42+phase*.23,-.36);set(left,-.42-phase*.23,.36);set(spine,0,sway*.08);break
    }
  }
  return{play,tick,stop,dispose:stop,hasArmRig:Boolean(right||left)}
}
