import * as THREE from 'three'
import {applyBJInjury,initialBJInjuryState,type BJInjuryKind,type BJInjuryState} from './StreetVerseBJInjuryBridgeRuntime'
import {createBJInjuryReaction} from './StreetVerseBJInjuryReactionRuntime'
import {installStreetVerseBJAnatomy,type BJAnatomyHandle} from './StreetVerseBJAnatomyRuntime'

// All characters use the same fictional injury rules; no real-world anatomy claims.
// BJ's existing world health system remains authoritative for BJ and is not replaced.
export type CastMedicalId='jacobie-stubbs'|'lateasia-monroe'
export type CastMedicalAction='healthy'|'injured'|'xray'|'tear-apart'
export type CastMedicalMode='hidden'|'xray'|'tear-apart'
export type CastMedicalStatus={characterId:CastMedicalId;health:number;injured:boolean;mode:CastMedicalMode;fictional:true}

type CharacterMedicalHandle={
 object:THREE.Object3D;anatomy:BJAnatomyHandle;health:BJInjuryState;reaction:ReturnType<typeof createBJInjuryReaction>;
 mode:CastMedicalMode;reactionUntil:number;lastTilt:number
}
const VALID_INJURIES=new Set<BJInjuryKind>(['shot','stab','blunt','fall','recovery','hospital-discharge'])
const VALID_MODES=new Set<CastMedicalMode>(['hidden','xray','tear-apart'])
export function createSharedCastMedicalRuntime(){
 const characters=new Map<CastMedicalId,CharacterMedicalHandle>()
 const stored=new Map<CastMedicalId,BJInjuryState>()
 const key='tryamm.streetverse.shared-cast-medical.v1'
 try{
  const source=JSON.parse(localStorage.getItem(key)||'{}') as Record<string,{health?:number;lastInjury?:string}>
  for(const id of ['jacobie-stubbs','lateasia-monroe'] as const){
   const data=source[id];if(!data||!Number.isSafeInteger(data.health)||data.health<0||data.health>100)continue
   stored.set(id,{health:data.health,injured:data.health<100,lastInjury:VALID_INJURIES.has(data.lastInjury as BJInjuryKind)?data.lastInjury as BJInjuryKind:null})
  }
 }catch{/* New or untrusted saves use healthy defaults. */}
 const publish=(id:CastMedicalId,handle:CharacterMedicalHandle)=>{
  const status:CastMedicalStatus={characterId:id,health:handle.health.health,injured:handle.health.injured,mode:handle.mode,fictional:true}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-cast-medical-status',{detail:status}))
 }
 const persist=()=>{try{localStorage.setItem(key,JSON.stringify(Object.fromEntries([...stored].map(([id,v])=>[id,{health:v.health,lastInjury:v.lastInjury}]))) )}catch{}}
 const register=(id:CastMedicalId,object:THREE.Object3D)=>{
  characters.get(id)?.anatomy.dispose()
  const health=stored.get(id)||initialBJInjuryState()
  const anatomy=installStreetVerseBJAnatomy(object)
  // The BJ overlay is reused as a simplified fictional seven-organ visualization,
  // not as anatomically accurate organs fitted to another person's body.
  anatomy.root.userData.sharedCastCharacter=id
  anatomy.root.userData.fittedToBody=false
  anatomy.setCondition(health.injured?'injured':'healthy')
  anatomy.setVisible(false)
  const handle:CharacterMedicalHandle={object,anatomy,health,reaction:createBJInjuryReaction(),mode:'hidden',reactionUntil:0,lastTilt:0}
  characters.set(id,handle);publish(id,handle)
 }
 const onInjury=(event:Event)=>{
  const detail=(event as CustomEvent<{characterId?:string;kind?:BJInjuryKind;fictional?:boolean}>).detail
  if(detail?.fictional!==true||!detail.characterId||!VALID_INJURIES.has(detail.kind as BJInjuryKind))return
  if(detail.characterId==='bj-stubbs'){
   // Existing BJ game logic already owns his health, haptics, rescue, and anatomy.
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-injury',{detail:{kind:detail.kind}}))
   return
  }
  if(detail.characterId!=='jacobie-stubbs'&&detail.characterId!=='lateasia-monroe')return
  const id=detail.characterId,handle=characters.get(id)
  const previous=handle?.health||stored.get(id)||initialBJInjuryState()
  const result=applyBJInjury(previous,detail.kind!)
  stored.set(id,result.state)
  if(handle){
   handle.health=result.state;handle.reaction.onInjury(detail.kind!,performance.now())
   handle.anatomy.setCondition(result.state.injured?'injured':'healthy')
   handle.reactionUntil=performance.now()+1300
   publish(id,handle)
  }
  persist()
  if(result.requiresMedicalHelp)window.dispatchEvent(new CustomEvent('tryamm:streetverse-cast-rescue-request',{detail:{characterId:id,fictional:true,health:result.state.health}}))
 }
 const onAnatomy=(event:Event)=>{
  const detail=(event as CustomEvent<{characterId?:string;mode?:CastMedicalMode;fictional?:boolean}>).detail
  if(detail?.fictional!==true||!detail.characterId||!VALID_MODES.has(detail.mode as CastMedicalMode))return
  if(detail.characterId!=='jacobie-stubbs'&&detail.characterId!=='lateasia-monroe')return
  const id=detail.characterId,handle=characters.get(id)
  if(!handle)return
  handle.mode=detail.mode!
  handle.anatomy.setXRay(detail.mode==='xray')
  handle.anatomy.setExploded(detail.mode==='tear-apart')
  if(detail.mode==='hidden'){handle.anatomy.setXRay(false);handle.anatomy.setExploded(false);handle.anatomy.setVisible(false)}
  publish(id,handle)
 }
 window.addEventListener('tryamm:streetverse-cast-injury',onInjury)
 window.addEventListener('tryamm:streetverse-cast-anatomy-mode',onAnatomy)
 return {
  register,
  tick(nowMs:number){
   for(const h of characters.values()){
    h.anatomy.tick(nowMs*.001)
    const frame=h.reaction.frame(h.health,nowMs)
    // Light, non-graphic posture effects only; preserve animation/vehicle handling.
    const target=h.mode!=='hidden'?0:frame.tilt
    h.object.rotation.z=THREE.MathUtils.lerp(h.object.rotation.z,target,.16)
   }
  },
  dispose(){
   window.removeEventListener('tryamm:streetverse-cast-injury',onInjury)
   window.removeEventListener('tryamm:streetverse-cast-anatomy-mode',onAnatomy)
   for(const h of characters.values()){h.object.rotation.z=0;h.anatomy.dispose()}
   characters.clear()
  },
 }
}
