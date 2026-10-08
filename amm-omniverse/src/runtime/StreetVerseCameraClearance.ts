import * as THREE from 'three'

export const STREETVERSE_CAMERA_MIN_DISTANCE=2.8
export const STREETVERSE_CAMERA_SPHERE_RADIUS=.42
export const STREETVERSE_CAMERA_OCCLUSION_PASS='sphere-cast-rescue-v10'

export type StreetVerseCameraSafetyResult={
  position:THREE.Vector3
  clearance:number
  targetDistance:number
  obstructed:boolean
  insideGeometry:boolean
  honoredMinDistance:boolean
}

const scratchBox=new THREE.Box3()
const scratchRay=new THREE.Ray()
const scratchDirection=new THREE.Vector3()
const scratchHit=new THREE.Vector3()
const scratchCandidate=new THREE.Vector3()
const scratchAxis=new THREE.Vector3(0,1,0)

function pointBlocked(point:THREE.Vector3,origin:THREE.Vector3,obstacles:THREE.Box3[],radius:number){
  for(const box of obstacles){
    scratchBox.copy(box).expandByScalar(radius)
    // A volume containing the player origin may describe an interior shell; it is not
    // automatically a camera wall, but the camera endpoint still may not occupy it.
    if(scratchBox.containsPoint(point)&&!scratchBox.containsPoint(origin))return true
  }
  return false
}

function rayClearance(origin:THREE.Vector3,candidate:THREE.Vector3,obstacles:THREE.Box3[],radius:number){
  scratchDirection.subVectors(candidate,origin)
  const length=scratchDirection.length()
  if(length<=1e-6)return 0
  scratchDirection.normalize()
  scratchRay.set(origin,scratchDirection)
  let clearance=length
  for(const box of obstacles){
    scratchBox.copy(box).expandByScalar(radius)
    // Preserve existing interior behavior: a shell already surrounding the player is
    // ignored as a ray wall. Endpoint validation below still prevents camera embedding.
    if(scratchBox.containsPoint(origin))continue
    if(scratchRay.intersectBox(scratchBox,scratchHit)){
      clearance=Math.min(clearance,Math.max(0,origin.distanceTo(scratchHit)-.16))
    }
  }
  return clearance
}

export function resolveStreetVerseThirdPersonCameraSafety(
  origin:THREE.Vector3,
  desired:THREE.Vector3,
  current:THREE.Vector3,
  obstacles:THREE.Box3[],
  options?:{minDistance?:number;radius?:number;smoothing?:number},
):StreetVerseCameraSafetyResult{
  const minDistance=options?.minDistance??STREETVERSE_CAMERA_MIN_DISTANCE
  const radius=options?.radius??STREETVERSE_CAMERA_SPHERE_RADIUS
  const smoothing=THREE.MathUtils.clamp(options?.smoothing??.28,0,1)
  const targetDistance=origin.distanceTo(desired)
  const primaryClearance=rayClearance(origin,desired,obstacles,radius)
  const obstructed=primaryClearance<targetDistance-.01

  let safeTarget:THREE.Vector3|null=null
  let safeClearance=primaryClearance
  if(primaryClearance>=minDistance&&!pointBlocked(desired,origin,obstacles,radius)){
    safeTarget=desired.clone()
    safeClearance=Math.min(primaryClearance,targetDistance)
  }else{
    const base=desired.clone().sub(origin)
    // Stay near the requested shoulder first; progressively orbit/climb only when a wall
    // leaves less than the hard 2.8-unit safety radius.
    const angleCandidates=[0,.42,-.42,.78,-.78,1.16,-1.16,Math.PI]
    const liftCandidates=[0,.72,1.35,2.05,2.85]
    outer:for(const lift of liftCandidates){
      for(const angle of angleCandidates){
        scratchCandidate.copy(base).applyAxisAngle(scratchAxis,angle).add(origin)
        scratchCandidate.y+=lift
        const distance=origin.distanceTo(scratchCandidate)
        const clearance=rayClearance(origin,scratchCandidate,obstacles,radius)
        if(distance>=minDistance&&clearance>=distance-.01&&!pointBlocked(scratchCandidate,origin,obstacles,radius)){
          safeTarget=scratchCandidate.clone()
          safeClearance=clearance
          break outer
        }
      }
    }
  }

  // Last-resort vertical rescue. This path is intentionally unsmoothed if the previous
  // camera position would be unsafe; it is preferable to a single inside-wall frame.
  if(!safeTarget){
    for(const lift of [minDistance,3.6,4.8,6.2]){
      scratchCandidate.set(origin.x,origin.y+lift,origin.z)
      if(!pointBlocked(scratchCandidate,origin,obstacles,radius)){
        safeTarget=scratchCandidate.clone()
        safeClearance=origin.distanceTo(safeTarget)
        break
      }
    }
  }
  if(!safeTarget){
    safeTarget=desired.clone()
    const direction=safeTarget.sub(origin)
    if(direction.lengthSq()<1e-6)direction.set(0,1,0)
    direction.setLength(Math.max(minDistance,targetDistance))
    safeTarget.copy(origin).add(direction)
    safeClearance=rayClearance(origin,safeTarget,obstacles,radius)
  }

  const next=current.clone().lerp(safeTarget,smoothing)
  const nextDistance=origin.distanceTo(next)
  const nextClearance=rayClearance(origin,next,obstacles,radius)
  const nextSafe=nextDistance>=minDistance-.001&&
    nextClearance>=nextDistance-.01&&
    !pointBlocked(next,origin,obstacles,radius)

  const position=(nextSafe?next:safeTarget).clone()
  let finalDistance=origin.distanceTo(position)
  if(finalDistance<minDistance-.001){
    const direction=position.clone().sub(origin)
    if(direction.lengthSq()<1e-6)direction.set(0,1,0)
    direction.setLength(minDistance)
    position.copy(origin).add(direction)
    finalDistance=origin.distanceTo(position)
  }

  const insideGeometry=pointBlocked(position,origin,obstacles,radius)
  return{
    position,
    clearance:safeClearance,
    targetDistance,
    obstructed,
    insideGeometry,
    honoredMinDistance:finalDistance>=minDistance-.001,
  }
}

// Keep the general follow camera out of facades, including at restored saved positions.
// V10 routes it through the same minimum-distance / sphere-clearance safety resolver used
// by the third-person shoulder camera so fallback modes cannot reintroduce sub-2.8 frames.
export function createStreetVerseCameraClearance(boxes:THREE.Box3[],external:THREE.Box3[]){
  const origin=new THREE.Vector3(),desired=new THREE.Vector3()
  return (focus:THREE.Vector3,height:number,back:number,target:THREE.Vector3)=>{
    origin.set(focus.x,1.15,focus.z)
    desired.set(focus.x,height,focus.z+back)
    const result=resolveStreetVerseThirdPersonCameraSafety(
      origin,
      desired,
      desired,
      [...boxes,...external],
      {smoothing:1},
    )
    target.copy(result.position)
    return target
  }
}
