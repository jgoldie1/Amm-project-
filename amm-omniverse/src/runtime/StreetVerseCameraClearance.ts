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
