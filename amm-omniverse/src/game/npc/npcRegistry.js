import * as THREE from 'three'

export const activeNPCs=new Map()

export class NPCController{
 constructor(gltf,id){
  this.id=id;this.model=gltf.scene;this.mixer=new THREE.AnimationMixer(this.model)
  this.actions={};this.aliases={};this.currentAction=null;this.finishedHandler=null
  for(const clip of gltf.animations||[])this.setupAction(String(clip.name||'').toLowerCase(),clip,!/acknowledge|wave|kiss|reaction|tip/.test(String(clip.name||'').toLowerCase()))
  this.fadeToAction('idle',0);activeNPCs.set(id,this)
 }
 setupAction(name,clip,isLooping=true){
  if(!name)return
  const action=this.mixer.clipAction(clip);action.setLoop(isLooping?THREE.LoopRepeat:THREE.LoopOnce,isLooping?Infinity:1);action.clampWhenFinished=!isLooping;this.actions[name]=action
 }
 registerAlias(alias,clipName){const a=String(alias||'').toLowerCase(),n=String(clipName||'').toLowerCase();if(a&&this.actions[n])this.aliases[a]=n;return this}
 resolveAction(name){const n=String(name||'').toLowerCase();if(this.actions[n])return n;if(this.aliases[n]&&this.actions[this.aliases[n]])return this.aliases[n];const fuzzy=Object.keys(this.actions).find(k=>k.includes(n)||n.includes(k));return fuzzy||''}
 fadeToAction(name,duration=.35,fallback='idle'){
  const resolved=this.resolveAction(name),next=this.actions[resolved];if(!next||next===this.currentAction)return false
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


let animationBridgeInstalled=false
export function installNPCAnimationBridge(){
 if(animationBridgeInstalled||typeof window==='undefined')return;animationBridgeInstalled=true
 window.addEventListener('tryamm:streetverse-npc-animation',event=>{
  const d=event.detail||{},id=String(d.npcId||''),animation=String(d.animation||'').toLowerCase()
  const npc=activeNPCs.get(id)
  if(!npc||!animation)return
  const played=npc.fadeToAction(animation,.3)
  window.dispatchEvent(new CustomEvent(played?'tryamm:streetverse-npc-animation-started':'tryamm:streetverse-npc-animation-missing',{detail:{npcId:id,animation,assetId:d.assetId||null}}))
 })
}
installNPCAnimationBridge()
