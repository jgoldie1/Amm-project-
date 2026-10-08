import * as THREE from 'three'
import {XRHandModelFactory} from 'three/addons/webxr/XRHandModelFactory.js'
import {XRControllerModelFactory} from 'three/addons/webxr/XRControllerModelFactory.js'

export type StreetVerseXRPresentation='immersive-vr'|'immersive-ar'|null

type GrabState={pinching:boolean;grabbed:THREE.Object3D|null}
type XRReachHandle={
  tick:(now:number,frame?:unknown)=>void
  setPresentation:(mode:StreetVerseXRPresentation)=>void
  dispose:()=>void
}

const PINCH_START_METERS=.032
const PINCH_RELEASE_METERS=.050
const DIRECT_GRAB_RADIUS_METERS=.12

function grabbableRoot(object:THREE.Object3D|null){
  let current=object
  while(current){
    if(current.userData?.xrGrabbable)return current
    current=current.parent
  }
  return null
}

function makeInteractable(name:string,geometry:THREE.BufferGeometry,color:number,position:[number,number,number]){
  const material=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.12,roughness:.38,metalness:.08})
  const mesh=new THREE.Mesh(geometry,material)
  mesh.name=name
  mesh.position.set(...position)
  mesh.userData={...mesh.userData,xrGrabbable:true,xrReachV1:true}
  return mesh
}

export function installStreetVerseXRReach({
  renderer,
  scene,
  worldRoot,
}:{
  renderer:THREE.WebGLRenderer
  scene:THREE.Scene
  worldRoot:THREE.Group
}):XRReachHandle{
  const handFactory=new XRHandModelFactory()
  const controllerFactory=new XRControllerModelFactory()
  const hands:[THREE.Group,THREE.Group]=[renderer.xr.getHand(0),renderer.xr.getHand(1)]
  const handStates:[GrabState,GrabState]=[{pinching:false,grabbed:null},{pinching:false,grabbed:null}]
  const controllers:[THREE.Group,THREE.Group]=[renderer.xr.getController(0),renderer.xr.getController(1)]
  const grips:[THREE.Group,THREE.Group]=[renderer.xr.getControllerGrip(0),renderer.xr.getControllerGrip(1)]
  const controllerGrabbed:[THREE.Object3D|null,THREE.Object3D|null]=[null,null]
  const originalBackground=scene.background
  let currentPresentation:StreetVerseXRPresentation=null
  const tabletopWorldInteractables:THREE.Object3D[]=[]
  const raycaster=new THREE.Raycaster()
  const rayOrigin=new THREE.Vector3()
  const rayDirection=new THREE.Vector3()
  const tmpThumb=new THREE.Vector3(),tmpIndex=new THREE.Vector3(),tmpPinch=new THREE.Vector3(),tmpObject=new THREE.Vector3()

  hands.forEach((hand,index)=>{
    hand.name=`streetverse-xr-hand-${index}`
    try{hand.add(handFactory.createHandModel(hand,'mesh'))}catch{}
    scene.add(hand)
  })
  grips.forEach((grip,index)=>{
    grip.name=`streetverse-xr-controller-grip-${index}`
    try{grip.add(controllerFactory.createControllerModel(grip))}catch{}
    scene.add(grip)
  })
  controllers.forEach((controller,index)=>{
    controller.name=`streetverse-xr-controller-${index}`
    scene.add(controller)
  })

  // Oversized tabletop interaction pieces remain easy to touch after the Chicago world is miniaturized in AR.
  const staticInteractables=[
    makeInteractable('streetverse-xr-mission-token',new THREE.CylinderGeometry(2.0,2.0,.9,24),0xffc84d,[0,2.0,49]),
    makeInteractable('streetverse-xr-creator-cube',new THREE.BoxGeometry(3.4,3.4,3.4),0x65e8ff,[-6,2.1,47]),
    makeInteractable('streetverse-xr-holo-ball',new THREE.SphereGeometry(2.0,24,18),0x9c77ff,[6,2.2,47]),
  ]
  staticInteractables.forEach(object=>worldRoot.add(object))
  const refreshTabletopWorldInteractables=()=>{
    tabletopWorldInteractables.length=0
    worldRoot.traverse(object=>{
      if(object.userData?.xrTabletopGrabbable===true)tabletopWorldInteractables.push(object)
    })
    window.dispatchEvent(new CustomEvent('tryamm:xr-reach-world-scan',{detail:{tabletopGrabbables:tabletopWorldInteractables.length,source:'streetverse-xr-reach-v2'}}))
  }
  const activeInteractables=()=>currentPresentation==='immersive-ar'
    ?[...staticInteractables,...tabletopWorldInteractables]
    :staticInteractables
  const allowedForCurrentPresentation=(object:THREE.Object3D|null)=>{
    if(!object)return false
    const scope=String(object.userData?.xrGrabScope||'all')
    return scope==='all'||scope===currentPresentation
  }

  const releaseToWorld=(object:THREE.Object3D|null)=>{
    if(!object)return
    worldRoot.attach(object)
    window.dispatchEvent(new CustomEvent('tryamm:xr-reach-release',{detail:{name:object.name,kind:object.userData?.xrGrabKind||'prop',presentation:currentPresentation||'3d',source:'streetverse-xr-reach-v2'}}))
  }
  const grabInto=(space:THREE.Object3D,object:THREE.Object3D)=>{
    space.attach(object)
    window.dispatchEvent(new CustomEvent('tryamm:xr-reach-grab',{detail:{name:object.name,kind:object.userData?.xrGrabKind||'prop',presentation:currentPresentation||'3d',grabOffsetPreserved:true,source:'streetverse-xr-reach-v2'}}))
  }
  const nearestDirect=(point:THREE.Vector3)=>{
    let best:THREE.Object3D|null=null,bestDistance=DIRECT_GRAB_RADIUS_METERS
    for(const object of activeInteractables()){
      object.getWorldPosition(tmpObject)
      const distance=tmpObject.distanceTo(point)
      if(distance<bestDistance&&allowedForCurrentPresentation(object)){best=object;bestDistance=distance}
    }
    return best
  }
  const handJoint=(hand:THREE.Group,name:string)=>{
    const joints=(hand as unknown as {joints?:Record<string,THREE.Object3D>}).joints
    return joints?.[name]||hand.getObjectByName(name)||null
  }
  const tickHand=(hand:THREE.Group,state:GrabState)=>{
    const thumb=handJoint(hand,'thumb-tip'),index=handJoint(hand,'index-finger-tip')
    if(!thumb||!index)return
    thumb.getWorldPosition(tmpThumb);index.getWorldPosition(tmpIndex)
    const distance=tmpThumb.distanceTo(tmpIndex)
    tmpPinch.copy(tmpThumb).add(tmpIndex).multiplyScalar(.5)
    if(!state.pinching&&distance<=PINCH_START_METERS){
      state.pinching=true
      const candidate=nearestDirect(tmpPinch)
      if(candidate){state.grabbed=candidate;grabInto(hand,candidate)}
    }else if(state.pinching&&distance>=PINCH_RELEASE_METERS){
      state.pinching=false
      releaseToWorld(state.grabbed)
      state.grabbed=null
    }
  }

  const onControllerSelectStart=(index:number)=>{
    const controller=controllers[index]
    rayOrigin.setFromMatrixPosition(controller.matrixWorld)
    rayDirection.set(0,0,-1).transformDirection(controller.matrixWorld)
    raycaster.set(rayOrigin,rayDirection)
    const hits=raycaster.intersectObjects(activeInteractables(),true)
    const candidate=grabbableRoot(hits[0]?.object||null)
    if(candidate&&allowedForCurrentPresentation(candidate)){controllerGrabbed[index]=candidate;grabInto(controller,candidate)}
  }
  const onControllerSelectEnd=(index:number)=>{
    releaseToWorld(controllerGrabbed[index])
    controllerGrabbed[index]=null
  }
  const controllerListeners=controllers.map((controller,index)=>{
    const start=()=>onControllerSelectStart(index),end=()=>onControllerSelectEnd(index)
    ;(controller as unknown as EventTarget).addEventListener('selectstart',start)
    ;(controller as unknown as EventTarget).addEventListener('selectend',end)
    return {controller,start,end}
  })

  const setPresentation=(mode:StreetVerseXRPresentation)=>{
    currentPresentation=mode
    refreshTabletopWorldInteractables()
    if(mode==='immersive-ar'){
      worldRoot.scale.setScalar(.012)
      worldRoot.position.set(0,.72,-1.20)
      scene.background=null
      worldRoot.rotation.set(0,0,0)
    }else if(mode==='immersive-vr'){
      worldRoot.scale.setScalar(1)
      worldRoot.position.set(0,0,-49)
      worldRoot.rotation.set(0,0,0)
      scene.background=originalBackground
    }else{
      worldRoot.scale.setScalar(1)
      worldRoot.position.set(0,0,0)
      worldRoot.rotation.set(0,0,0)
      scene.background=originalBackground
    }
    window.dispatchEvent(new CustomEvent('tryamm:xr-reach-presentation',{detail:{mode:mode||'3d',tabletop:mode==='immersive-ar',handTrackingRequested:true,source:'streetverse-xr-reach-v2'}}))
  }

  return{
    tick:()=>{tickHand(hands[0],handStates[0]);tickHand(hands[1],handStates[1])},
    setPresentation,
    dispose:()=>{
      handStates.forEach(state=>{releaseToWorld(state.grabbed);state.grabbed=null})
      controllerGrabbed.forEach(object=>releaseToWorld(object))
      controllerListeners.forEach(({controller,start,end})=>{
        ;(controller as unknown as EventTarget).removeEventListener('selectstart',start)
        ;(controller as unknown as EventTarget).removeEventListener('selectend',end)
      })
      hands.forEach(hand=>hand.removeFromParent())
      controllers.forEach(controller=>controller.removeFromParent())
      grips.forEach(grip=>grip.removeFromParent())
      staticInteractables.forEach(object=>{
        object.removeFromParent()
        if(object instanceof THREE.Mesh){
          object.geometry.dispose()
          const materials=Array.isArray(object.material)?object.material:[object.material]
          materials.forEach(material=>material.dispose())
        }
      })
    },
  }
}
