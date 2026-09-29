import * as THREE from 'three'

export const STREETVERSE_HUMAN_HEIGHT_METERS={
 adultHero:1.82,
 adultResident:1.76,
 adultMin:1.62,
 adultMax:1.95,
 teen:1.62,
 child:1.32,
} as const

export function normalizeStreetVerseHumanHeight<T extends THREE.Object3D>(object:T,targetMeters:number){
 object.updateMatrixWorld(true)
 const box=new THREE.Box3().setFromObject(object)
 const size=new THREE.Vector3()
 box.getSize(size)
 const measured=size.y
 if(!Number.isFinite(measured)||measured<=0.01)return object
 const safeTarget=THREE.MathUtils.clamp(targetMeters,.9,2.1)
 const factor=safeTarget/measured
 object.scale.multiplyScalar(factor)
 object.updateMatrixWorld(true)
 return object
}

export function residentHeight(index:number){
 const variation=[-.08,-.04,0,.03,.06,.1][Math.abs(index)%6]
 return THREE.MathUtils.clamp(STREETVERSE_HUMAN_HEIGHT_METERS.adultResident+variation,STREETVERSE_HUMAN_HEIGHT_METERS.adultMin,STREETVERSE_HUMAN_HEIGHT_METERS.adultMax)
}
