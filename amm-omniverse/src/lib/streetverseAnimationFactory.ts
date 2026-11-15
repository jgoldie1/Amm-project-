/**
 * StreetVerse Animation Factory
 * Engine-independent animation registry and event planner.
 * An adapter (e.g. Three.js AnimationMixer) owns playback and bone retargeting.
 */
export type AnimationRole = 'idle'|'walk'|'run'|'wave'|'talk'|'nod'|'salon'|'sit'|'drive'|'enterVehicle'|'exitVehicle'|'carry'|'injured'|'recover'|'dance'
export type AnimationClipRecord = {name:string;duration?:number;tracks?:readonly string[]}
export type AnimationBinding = {role:AnimationRole;clip:string;diagnostic:boolean}
export type CharacterAnimationManifest = {id:string;source:string;bindings:AnimationBinding[];missing:AnimationRole[];jointCount:number;warnings:string[]}
export type PlaybackRequest = {characterId:string;role:AnimationRole;clip:string;fadeSeconds:number;loop:boolean}
export type AnimationAdapter = {play:(request:PlaybackRequest)=>void;stop?:(characterId:string)=>void}
export const REQUIRED_JOINTS = 15
export const ROLES:readonly AnimationRole[] = ['idle','walk','run','wave','talk','nod','salon','sit','drive','enterVehicle','exitVehicle','carry','injured','recover','dance']
const candidates:Record<AnimationRole,readonly string[]> = {
  idle:['idle','stand'],walk:['walking','walk'],run:['running','run'],wave:['wave'],talk:['talkgesture','talk','speaking'],
  nod:['headnod','nod'],salon:['salonstyle','salon'],sit:['sitting','sit'],drive:['driving','drive'],
  enterVehicle:['entervehicle','carenter'],exitVehicle:['exitvehicle','carexit'],carry:['carrying','carry'],
  injured:['injured','hurt'],recover:['recover','recovery'],dance:['dancing','dance']
}
const normalize=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,'')
export function inspectAnimations(id:string,source:string,clips:readonly AnimationClipRecord[],jointCount:number):CharacterAnimationManifest {
  if(!id.trim())throw new Error('Character id required')
  const names=new Set<string>()
  const warnings:string[]=[]
  const valid=clips.filter(c=>{
    if(!c.name?.trim()){warnings.push('Unnamed clip ignored');return false}
    const key=normalize(c.name)
    if(names.has(key)){warnings.push('Duplicate clip ignored: '+c.name);return false}
    names.add(key)
    if(c.duration!==undefined&&(!Number.isFinite(c.duration)||c.duration<=0)){warnings.push('Invalid duration: '+c.name);return false}
    return true
  })
  const bindings:AnimationBinding[]=[]
  const missing:AnimationRole[]=[]
  for(const role of ROLES){
    const found=valid.find(c=>candidates[role].some(prefix=>normalize(c.name).startsWith(prefix)))
    if(found)bindings.push({role,clip:found.name,diagnostic:/diagnostic/i.test(found.name)})
    else missing.push(role)
  }
  if(jointCount<REQUIRED_JOINTS)warnings.push('Limited skeleton ('+jointCount+' joints); production humanoid rig review required')
  if(bindings.some(b=>b.diagnostic))warnings.push('Diagnostic clips require visual acceptance testing')
  return {id,source,bindings,missing,jointCount,warnings}
}
export class StreetVerseAnimationFactory {
  private manifests=new Map<string,CharacterAnimationManifest>()
  private current=new Map<string,AnimationRole>()
  constructor(private adapter:AnimationAdapter){}
  register(manifest:CharacterAnimationManifest){this.manifests.set(manifest.id,manifest);return manifest}
  getManifest(id:string){return this.manifests.get(id)}
  play(characterId:string,role:AnimationRole,fadeSeconds=0.2):{ok:boolean;reason?:string}{
    const manifest=this.manifests.get(characterId)
    if(!manifest)return {ok:false,reason:'Character not registered'}
    const binding=manifest.bindings.find(b=>b.role===role)
    if(!binding)return {ok:false,reason:'Missing '+role+' clip for '+characterId}
    this.adapter.play({characterId,role,clip:binding.clip,fadeSeconds:Math.max(0,Math.min(1,fadeSeconds)),loop:!['wave','nod','enterVehicle','exitVehicle','recover'].includes(role)})
    this.current.set(characterId,role)
    return {ok:true}
  }
  onRPEvent(characterId:string,event:'move'|'sprint'|'greet'|'conversation'|'salon-service'|'injury'|'hospital-recovery'|'vehicle-drive'|'vehicle-exit'|'package-pickup'){
    const map:Record<typeof event,AnimationRole>={'move':'walk','sprint':'run','greet':'wave','conversation':'talk','salon-service':'salon','injury':'injured','hospital-recovery':'recover','vehicle-drive':'drive','vehicle-exit':'exitVehicle','package-pickup':'carry'}
    return this.play(characterId,map[event])
  }
  stop(id:string){this.adapter.stop?.(id);this.current.delete(id)}
}
export const LATEASIA_V1_DIAGNOSTIC=inspectAnimations('lateasia-monroe','LaTeasia_V1_Rig_Salvage_Animated_Diagnostic.glb',[
{name:'Running'},{name:'Walking'},{name:'Idle_DIAGNOSTIC'},{name:'Wave_LeftArm_DIAGNOSTIC'},
{name:'TalkGesture_LeftArm_DIAGNOSTIC'},{name:'HeadNod_DIAGNOSTIC'},{name:'SalonStyle_LeftArm_DIAGNOSTIC'}],9)
