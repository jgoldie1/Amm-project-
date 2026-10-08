import * as THREE from 'three'

// Keep the follow camera out of facades, including at restored saved positions.
export function createStreetVerseCameraClearance(boxes:THREE.Box3[],external:THREE.Box3[]){
  const origin=new THREE.Vector3(),direction=new THREE.Vector3(),hit=new THREE.Vector3()
  const candidate=new THREE.Vector3(),ray=new THREE.Ray()
  return (focus:THREE.Vector3,height:number,back:number,target:THREE.Vector3)=>{
    origin.set(focus.x,1.15,focus.z)
    let bestDistance=-1
    for(const angle of [0,Math.PI/2,-Math.PI/2,Math.PI]){
      candidate.set(focus.x+Math.sin(angle)*back,height,focus.z+Math.cos(angle)*back)
      direction.subVectors(candidate,origin)
      const length=direction.length()
      direction.normalize();ray.set(origin,direction)
      let clearance=length
      for(const obstacles of [boxes,external])for(const box of obstacles){
        // An interior volume surrounding the player is not a camera wall.
        if(box.containsPoint(origin))continue
        if(ray.intersectBox(box,hit))clearance=Math.min(clearance,Math.max(.5,origin.distanceTo(hit)-.6))
      }
      if(clearance>bestDistance){
        bestDistance=clearance
        target.copy(origin).addScaledVector(direction,clearance)
      }
      if(clearance>=length-.01)break
    }
    return target
  }
}


/**
 * Resolve the camera AFTER smoothing. A valid desired camera point does not
 * guarantee the interpolated camera is clear when changing shoulders/turning
 * corners, especially on low-frame-rate mobile devices.
 *
 * Collision input uses building/vehicle bounds rather than renderer meshes,
 * so this is conservative protection, not a claim of perfect occlusion.
 */
export function enforceStreetVerseCameraClearance(
  focus:THREE.Vector3,
  cameraPosition:THREE.Vector3,
  buildings:readonly THREE.Box3[],
  external:readonly THREE.Box3[],
  vehicles:readonly THREE.Box3[]=[],
):boolean{
  const direction=new THREE.Vector3().subVectors(cameraPosition,focus)
  const distance=direction.length()
  if(!Number.isFinite(distance)||distance<.001)return false
  direction.multiplyScalar(1/distance)
  const ray=new THREE.Ray(focus,direction),hit=new THREE.Vector3(),padded=new THREE.Box3()
  let clearDistance=distance
  for(const group of [buildings,external,vehicles])for(const obstacle of group){
    padded.copy(obstacle).expandByScalar(.28)
    // Ignore containing shells: spawning indoors should not pin the camera.
    if(padded.containsPoint(focus))continue
    if(!ray.intersectBox(padded,hit))continue
    const hitDistance=focus.distanceTo(hit)
    if(hitDistance<=distance+.0001)clearDistance=Math.min(clearDistance,Math.max(.12,hitDistance-.12))
  }
  if(clearDistance>=distance-.0001)return false
  cameraPosition.copy(focus).addScaledVector(direction,clearDistance)
  return true
}
