import * as THREE from 'three'
import {applyStreetVerseOrganImpact,createStreetVerseOrganState,type StreetVerseBodyZone} from './StreetVerseAnatomySimulation'
import {calculateLivingBodyFeedback} from './StreetVerseLivingBodyFeedback'

export type StreetVerseInjuryPhase='healthy'|'wounded'|'defeated'
export type StreetVerseRigReaction='idle'|'hit-react'|'hurt'|'downed'|'seated'
export type StreetVerseInjuryView='off'|'minimal'|'standard'
export type StreetVerseInjuryState={health:number;phase:StreetVerseInjuryPhase;visuals:StreetVerseInjuryView;demoOnly:true}
export type StreetVerseDamageRequest={amount:number;characterId?:string;source?:string;zone?:StreetVerseBodyZone;bleeding?:boolean}
const START_HEALTH=100
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v))
export function applyStreetVerseDemoDamage(state:StreetVerseInjuryState,request:StreetVerseDamageRequest):StreetVerseInjuryState{
 if(state.phase==='defeated'||!Number.isFinite(request.amount)||request.amount<=0)return state
 const health=clamp(state.health-clamp(request.amount,0,100),0,START_HEALTH)
 return {...state,health,phase:health===0?'defeated':health<START_HEALTH?'wounded':'healthy'}
}
export function createStreetVerseInjuryRuntime(scene:THREE.Scene,getHero:()=>THREE.Object3D|null,characterId='bj-stubbs',isSeated:()=>boolean=()=>false){
 let currentCharacterId=characterId
 let organs=createStreetVerseOrganState(characterId)
 let state:StreetVerseInjuryState={health:START_HEALTH,phase:'healthy',visuals:'minimal',demoOnly:true}
 let lastHit=-Infinity
 let lean=0
 let animatedHero:THREE.Object3D|null=null
 let baselineRoll=0
 let lastReaction:StreetVerseRigReaction='idle'
 let bleedingStatus=false
 const effectRoot=new THREE.Group()
 effectRoot.name='streetverse-demo-injury-fx'
 scene.add(effectRoot)
 const drops:Array<{mesh:THREE.Mesh;velocity:THREE.Vector3;started:number}>=[]
 const geometry=new THREE.SphereGeometry(.035,5,4)
 const material=new THREE.MeshBasicMaterial({color:0x9d121f,transparent:true,opacity:.8,depthWrite:false})
 const publish=()=>{
  if(typeof window!=='undefined'){
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-injury-state',{detail:{...state,characterId:currentCharacterId,authoritative:false,source:'local-cosmetic-demo'}}))
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-organ-state',{detail:{...organs,authoritative:false,source:'fictional-anatomy-demo'}}))
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-living-body-feedback',{detail:{characterId:currentCharacterId,...calculateLivingBodyFeedback(organs),authoritative:false,source:'fictional-anatomy-demo'}}))
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-vitals',{detail:{characterId:currentCharacterId,health:state.health,stamina:organs.stamina,mobility:organs.mobility,knockedOut:state.phase==='defeated',hasBleedingStatus:bleedingStatus,limping:organs.mobility<75,injuryCount:state.phase==='healthy'?0:1,source:'streetverse-original-anatomy-runtime',fictional:true}}))
  }
 }
 const removeDrops=()=>{for(const item of drops)effectRoot.remove(item.mesh);drops.length=0}
 const onDamage=(event:Event)=>{
  const req=(event as CustomEvent<StreetVerseDamageRequest>).detail
  if(!req||req.characterId&&req.characterId!==currentCharacterId)return
  const previous=state
  state=applyStreetVerseDemoDamage(state,req)
  if(previous!==state){
   bleedingStatus=bleedingStatus||req.bleeding===true
   organs=applyStreetVerseOrganImpact(organs,{amount:req.amount,zone:req.zone})
   // Health defeat and body-system incapacitation must not disagree.
   if(state.phase==='defeated'||organs.consciousness==='downed'){
    state={...state,phase:'defeated',health:0}
    organs={...organs,consciousness:'downed',needsRescue:true}
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-local-rescue-needed',{detail:{characterId:currentCharacterId,source:'fictional-anatomy-demo',authoritative:false}}))
   }
  }
  if(previous===state)return
  const now=performance.now()
  lastHit=now
  // Bound visual work on low-memory phones and prevent event-spam particle growth.
  if(drops.length>24)removeDrops()
  if(state.visuals!=='off'&&getHero()){
   const hero=getHero()!
   const count=state.visuals==='standard'?9:3
   const origin=new THREE.Vector3()
   hero.getWorldPosition(origin)
   for(let i=0;i<count;i++){
    const mesh=new THREE.Mesh(geometry,material)
    mesh.position.set(origin.x+(i%3-1)*.1,origin.y+1.45,origin.z+Math.sin(i*2.2)*.12)
    effectRoot.add(mesh)
    drops.push({mesh,started:now,velocity:new THREE.Vector3(Math.sin(i*4.1)*.005,.003+Math.cos(i)*.004,Math.cos(i*2.7)*.005)})
   }
  }
  publish()
 }
 const onRecover=()=>{
  state={...state,health:START_HEALTH,phase:'healthy'}
  organs=createStreetVerseOrganState(currentCharacterId)
  bleedingStatus=false
  removeDrops()
  lastHit=-Infinity
  lastReaction='idle'
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:streetverse-rig-reaction',{detail:{characterId:currentCharacterId,reaction:'idle',authoritative:false,source:'local-injury-demo'}}))
  publish()
 }
 const onCharacterSelect=(event:Event)=>{const id=(event as CustomEvent<{id?:string}>).detail?.id;if(!id||!/^[a-z0-9._-]{2,80}$/i.test(id))return;currentCharacterId=id;state={...state,health:START_HEALTH,phase:'healthy'};organs=createStreetVerseOrganState(id);bleedingStatus=false;removeDrops();lastHit=-Infinity;publish()}
 const onVisual=(event:Event)=>{
  const value=(event as CustomEvent<{mode?:StreetVerseInjuryView}>).detail?.mode
  if(value!=='off'&&value!=='minimal'&&value!=='standard')return
  state={...state,visuals:value}
  if(value==='off')removeDrops()
  publish()
 }
 window.addEventListener('tryamm:streetverse-character-select',onCharacterSelect)
 window.addEventListener('tryamm:streetverse-local-damage-demo',onDamage)
 window.addEventListener('tryamm:streetverse-local-respawn-demo',onRecover)
 window.addEventListener('tryamm:streetverse-injury-visual-mode',onVisual)
 publish()
 return{
  getState:()=>({...state}),
  getOrgans:()=>({...organs,integrity:{...organs.integrity}}),
  tick:(now:number)=>{
   const hero=getHero()
   if(animatedHero!==hero){
    if(animatedHero)animatedHero.rotation.z=baselineRoll
    animatedHero=hero
    baselineRoll=hero?.rotation.z??0
    lean=0
   }
   if(hero){
    const seated=isSeated()
    const hitPulse=clamp(1-(now-lastHit)/480,0,1)
    const response=calculateLivingBodyFeedback(organs)
    const limpPulse=response.limpStrength>0?Math.sin(now*.006)*response.limpStrength*.035:0
    const target=seated?0:state.phase==='defeated'?.48:hitPulse>0?hitPulse*Math.sin((now-lastHit)*.05)*.18:limpPulse
    lean=THREE.MathUtils.lerp(lean,target,.16)
    hero.rotation.z=baselineRoll+lean
    const reaction:StreetVerseRigReaction=seated?'seated':state.phase==='defeated'?'downed':hitPulse>0?'hit-react':state.phase==='wounded'?'hurt':'idle'
    // The animation director can use this label to blend GLB hit / collapse clips.
    // Existing skeleton mixers continue running; never tear bones from the model.
    if(reaction!==lastReaction){
     lastReaction=reaction
     window.dispatchEvent(new CustomEvent('tryamm:streetverse-rig-reaction',{detail:{characterId:currentCharacterId,reaction,authoritative:false,source:'local-injury-demo'}}))
    }
   }
   for(let i=drops.length-1;i>=0;i--){
    const p=drops[i],age=now-p.started
    if(age>800){effectRoot.remove(p.mesh);drops.splice(i,1);continue}
    p.mesh.position.add(p.velocity)
    p.velocity.y-=.00035
    p.mesh.scale.setScalar(Math.max(.1,1-age/800))
   }
  },
  dispose:()=>{
   window.removeEventListener('tryamm:streetverse-character-select',onCharacterSelect)
   window.removeEventListener('tryamm:streetverse-local-damage-demo',onDamage)
   window.removeEventListener('tryamm:streetverse-local-respawn-demo',onRecover)
   window.removeEventListener('tryamm:streetverse-injury-visual-mode',onVisual)
   if(animatedHero)animatedHero.rotation.z=baselineRoll
   removeDrops();scene.remove(effectRoot);geometry.dispose();material.dispose()
  }
 }
}
