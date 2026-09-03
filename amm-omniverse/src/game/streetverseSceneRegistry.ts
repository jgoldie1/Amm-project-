import * as THREE from 'three'

type StreetVerseSceneHandle={
  scene:THREE.Scene
  collisionBoxes:THREE.Box3[]
}

let current:StreetVerseSceneHandle|null=null
const listeners=new Set<(handle:StreetVerseSceneHandle|null)=>void>()

export function registerStreetVerseScene(handle:StreetVerseSceneHandle){
  current=handle
  listeners.forEach(listener=>listener(current))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-native-scene-ready',{detail:{ready:true}}))
  return()=>{
    if(current===handle){
      current=null
      listeners.forEach(listener=>listener(null))
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-native-scene-ready',{detail:{ready:false}}))
    }
  }
}

export function getStreetVerseScene(){return current}

export function subscribeStreetVerseScene(listener:(handle:StreetVerseSceneHandle|null)=>void){
  listeners.add(listener)
  listener(current)
  return()=>listeners.delete(listener)
}
