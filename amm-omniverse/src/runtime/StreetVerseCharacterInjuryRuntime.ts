import * as THREE from 'three'

export type StreetVerseInjuryPhase='healthy'|'wounded'|'defeated'
export type StreetVerseInjuryView='off'|'minimal'|'standard'
export type StreetVerseInjuryState={health:number;phase:StreetVerseInjuryPhase;visuals:StreetVerseInjuryView;demoOnly:true}
export type StreetVerseDamageRequest={amount:number;characterId?:string;source?:string}
const START_HEALTH=100
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v))
export function applyStreetVerseDemoDamage(state:StreetVerseInjuryState,request:StreetVerseDamageRequest):StreetVerseInjuryState{
 if(state.phase==='defeated'||!Number.isFinite(request.amount)||request.amount<=0)return state
 const health=clamp(state.health-clamp(request.amount,0,100),0,START_HEALTH)
 return {...state,health,phase:health===0?'defeated':health<START_HEALTH?'wounded':'healthy'}
}
export function createStreetVerseInjuryRuntime(scene:THREE.Scene,getHero:()=>THREE.Object3D|null,characterId='bj-stubbs'){
 let currentCharacterId=characterId
 let state:StreetVerseInjuryState={health:START_HEALTH,phase:'healthy',visuals:'minimal',demoOnly:true}
 let lastHit=-Infinity
 let lean=0
 const effectRoot=new THREE.Group()
 effectRoot.name='streetverse-demo-injury-fx'
 scene.add(effectRoot)
 const drops:Array<{mesh:THREE.Mesh;velocity:THREE.Vector3;started:number}>=[]
 const geometry=new THREE.SphereGeometry(.035,5,4)
 const material=new THREE.MeshBasicMaterial({color:0x9d121f,transparent:true,opacity:.8,depthWrite:false})
 const publish=()=>{
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:streetverse-injury-state',{detail:{...state,characterId:currentCharacterId,authoritative:false,source:'local-cosmetic-demo'}}))
 }
 const removeDrops=()=>{for(const item of drops)effectRoot.remove(item.mesh);drops.length=0}
 const onDamage=(event:Event)=>{
  const req=(event as CustomEvent<StreetVerseDamageRequest>).detail
  if(!req||req.characterId&&req.characterId!==currentCharacterId)return
  const previous=state
  state=applyStreetVerseDemoDamage(state,req)
  if(previous===state)return
  const now=performance.now()
  lastHit=now
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
  removeDrops()
  lastHit=-Infinity
  publish()
 }
 const onCharacterSelect=(event:Event)=>{const id=(event as CustomEvent<{id?:string}>).detail?.id;if(!id||!/^[a-z0-9._-]{2,80}$/i.test(id))return;currentCharacterId=id;state={...state,health:START_HEALTH,phase:'healthy'};removeDrops();lastHit=-Infinity;publish()}
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
  tick:(now:number)=>{
   const hero=getHero()
   if(hero){
    const hitPulse=clamp(1-(now-lastHit)/480,0,1)
    const target=state.phase==='defeated'?.40:hitPulse*Math.sin((now-lastHit)*.05)*.14
    lean=THREE.MathUtils.lerp(lean,target,.18)
    hero.rotation.z=lean
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
   removeDrops();scene.remove(effectRoot);geometry.dispose();material.dispose()
  }
 }
}
