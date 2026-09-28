import * as THREE from 'three'

export const activeNPCs=new Map()

export class NPCController{
 constructor(gltf,id){
  this.id=id;this.model=gltf.scene;this.mixer=new THREE.AnimationMixer(this.model)
  this.actions={};this.currentAction=null;this.finishedHandler=null
  for(const clip of gltf.animations||[])this.setupAction(String(clip.name||'').toLowerCase(),clip,!/acknowledge|wave|kiss|reaction|tip/.test(String(clip.name||'').toLowerCase()))
  this.fadeToAction('idle',0);activeNPCs.set(id,this)
 }
 setupAction(name,clip,isLooping=true){
  if(!name)return
  const action=this.mixer.clipAction(clip);action.setLoop(isLooping?THREE.LoopRepeat:THREE.LoopOnce,isLooping?Infinity:1);action.clampWhenFinished=!isLooping;this.actions[name]=action
 }
 fadeToAction(name,duration=.35,fallback='idle'){
  const next=this.actions[name];if(!next||next===this.currentAction)return false
  if(this.finishedHandler){this.mixer.removeEventListener('finished',this.finishedHandler);this.finishedHandler=null}
  next.reset().fadeIn(Math.max(0,duration)).play()
  if(this.currentAction)this.currentAction.crossFadeTo(next,Math.max(0,duration),true)
  this.currentAction=next
  if(next.loop===THREE.LoopOnce){
   this.finishedHandler=e=>{if(e.action!==next)return;this.mixer.removeEventListener('finished',this.finishedHandler);this.finishedHandler=null;this.currentAction=null;this.fadeToAction(this.actions[fallback]?fallback:'idle',.3)}
   this.mixer.addEventListener('finished',this.finishedHandler)
  }
  return true
 }
 update(dt){this.mixer.update(Math.min(.1,Math.max(0,Number(dt)||0)))}
 dispose(){
  if(this.finishedHandler)this.mixer.removeEventListener('finished',this.finishedHandler)
  this.mixer.stopAllAction();this.mixer.uncacheRoot(this.model);activeNPCs.delete(this.id)
 }
}
