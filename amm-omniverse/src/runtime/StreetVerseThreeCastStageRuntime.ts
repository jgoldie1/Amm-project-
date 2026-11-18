import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {STREETVERSE_RECOVERED_THREE_CAST} from '../data/StreetVerseRecoveredThreeCast'
import {readLocalCastAsset} from './StreetVerseCharacterLocalRecovery'

type Action='walk'|'run'|'jump'|'hop'|'vault'
type CastKey=typeof STREETVERSE_RECOVERED_THREE_CAST[number]['id']
type Actor={name:string;root:THREE.Object3D;mixer:THREE.AnimationMixer;clips:THREE.AnimationClip[];active:THREE.AnimationAction|null;moving:{kind:Action;elapsed:number;duration:number;startZ:number;endZ:number}|null}
const START_Z=-8
const HURDLE_Z=-9.75
const HURDLE_HEIGHT=.62
const HURDLE_WIDTH=1.2
const HURDLE_DEPTH=.42
/** Independent, bounded in-world obstacle course. The city's own player controller is unchanged.
 * A successful stage action is not proof that all city collisions or mobile devices are certified. */
export function installStreetVerseThreeCastStage(scene:THREE.Scene,cityCollisionBoxes:THREE.Box3[]=[],getPlayerPosition?:()=>THREE.Vector3){
 const stage=new THREE.Group();stage.name='streetverse-three-cast-stage';scene.add(stage)
 const loader=new GLTFLoader()
 const actors=new Map<CastKey,Actor>(),roots:THREE.Object3D[]=[]
 const obstacleMaterial=new THREE.MeshStandardMaterial({color:0xf2a34d,roughness:.75})
 const obstacleGeometry=new THREE.BoxGeometry(HURDLE_WIDTH,HURDLE_HEIGHT,HURDLE_DEPTH)
 const hurdle=new THREE.Mesh(obstacleGeometry,obstacleMaterial)
 hurdle.position.set(0,HURDLE_HEIGHT/2,HURDLE_Z);hurdle.name='streetverse-verified-low-hurdle';hurdle.visible=false;stage.add(hurdle)
 const result=(status:string,detail:Record<string,unknown>={})=>{if(!disposed)window.dispatchEvent(new CustomEvent('tryamm:streetverse-cast-stage-result',{detail:{status,...detail}}))}
 let disposed=false,loading=false,frame=0,last=performance.now(),lastFrame=0
 const choose=(actor:Actor,kind:Action)=>{
  const pattern=kind==='jump'||kind==='vault'||kind==='hop'?/jumprun|jump|vault|hop/i:kind==='run'?/run|jog/i:/walk|locomotion/i
  const clip=actor.clips.find(c=>pattern.test(c.name))||actor.clips.find(c=>/idle|stand/i.test(c.name))||actor.clips[0]
  if(!clip)return false
  const action=actor.mixer.clipAction(clip);action.enabled=true
  action.reset().play()
  if(actor.active&&actor.active!==action)actor.active.crossFadeTo(action,.12,false)
  actor.active=action
  return pattern.test(clip.name)
 }
 const clear=()=>{
  for(const a of actors.values())a.mixer.stopAllAction()
  actors.clear()
  for(const root of roots){root.removeFromParent();root.traverse(node=>{
   if(node instanceof THREE.Mesh){node.geometry?.dispose();(Array.isArray(node.material)?node.material:[node.material]).forEach(m=>m?.dispose())}
  })}
  roots.length=0;hurdle.visible=false
 }
 const destinationClear=(x:number,z:number)=>{
  const body=new THREE.Box3(new THREE.Vector3(x+stage.position.x-.3,0,z+stage.position.z-.3),new THREE.Vector3(x+stage.position.x+.3,1.9,z+stage.position.z+.3))
  return !cityCollisionBoxes.some(b=>b.intersectsBox(body))
 }
 const action=(id:CastKey,kind:Action)=>{
  const a=actors.get(id)
  if(!a){result('action-blocked',{actor:id,action:kind,reason:'Original rigged GLB is not loaded'});return}
  if(a.moving){result('action-blocked',{actor:id,action:kind,reason:'Previous animation still playing'});return}
  const x=a.root.position.x,z=a.root.position.z
  const isCrossing=kind==='vault'
  if(isCrossing){
   if(id!=='jacobie-stubbs'){result('action-blocked',{actor:id,action:kind,reason:'Obstacle course vault is enabled for Jacobie first'});return}
   const nearObstacle=z>=HURDLE_Z+.55&&z<=HURDLE_Z+2.5&&Math.abs(x)<=.45
   const low=HURDLE_HEIGHT<=.9&&HURDLE_DEPTH<=.6
   const landingZ=HURDLE_Z-1.15
   const clear=destinationClear(x,landingZ)
   if(!hurdle.visible||!nearObstacle||!low||!clear){result('action-blocked',{actor:id,action:kind,reason:'Low obstacle or landing zone not validated'});return}
   const hasJump=choose(a,'jump')
   if(!hasJump){result('action-blocked',{actor:id,action:kind,reason:'JumpRun / jump animation not found'});return}
   a.moving={kind,elapsed:0,duration:1.05,startZ:z,endZ:landingZ}
   result('action-started',{actor:id,action:kind,verifiedObstacle:true,verifiedLanding:true,animation:'JumpRun or jump'})
   return
  }
  const endZ=kind==='walk'?z-.85:kind==='run'?z-1.4:z
  if(endZ!==z&&(!destinationClear(x,endZ)||hurdle.visible&&Math.abs(x)<.9&&z>HURDLE_Z&&endZ<HURDLE_Z+.4)){
   result('action-blocked',{actor:id,action:kind,reason:'Blocked path or stage obstacle'});return
  }
  const hasMotion=choose(a,kind)
  a.moving={kind,elapsed:0,duration:kind==='walk'?1:kind==='run'?.65:kind==='hop'?.5:.82,startZ:z,endZ}
  result('action-started',{actor:id,action:kind,matchingMotionClip:hasMotion,reason:hasMotion?'':'Using fallback animation with root motion only'})
 }
 const tick=(now:number)=>{
  if(disposed)return
  // Use the elapsed time between actual animation updates, not skipped RAF frames.
  // Otherwise 30ms throttling on a 60Hz phone makes all character motion half speed.
  if(document.visibilityState!=='hidden'&&now-lastFrame>=30){
   const dt=THREE.MathUtils.clamp((now-last)/1000,0,.05)
   last=now;lastFrame=now
   for(const a of actors.values()){
    a.mixer.update(dt)
    if(!a.moving)continue
    const m=a.moving;m.elapsed+=dt
    const t=Math.min(1,m.elapsed/m.duration)
    a.root.position.z=THREE.MathUtils.lerp(m.startZ,m.endZ,t)
    a.root.position.y=(m.kind==='jump'||m.kind==='hop'||m.kind==='vault')?Math.sin(t*Math.PI)*(m.kind==='vault'?HURDLE_HEIGHT+.38:m.kind==='hop'?.35:.7):0
    if(t>=1){a.root.position.y=0;a.moving=null;result('action-complete',{actor:a.name,action:m.kind,validatedObstacle:m.kind==='vault'})}
   }
  }
  frame=requestAnimationFrame(tick)
 }
 frame=requestAnimationFrame(tick)
 const open=async()=>{
  if(loading||disposed)return
  loading=true;clear()
  const player=getPlayerPosition?.()
  if(player)stage.position.set(player.x,0,player.z)
  const outcomes:Array<{name:string;status:string;clips:number;url:string;error?:string}>=[]
  for(const [i,entry] of STREETVERSE_RECOVERED_THREE_CAST.entries()){
   if(disposed)break
   try{
    let data=await readLocalCastAsset(entry.id).catch(()=>null)
    if(!data){
     const response=await fetch(entry.url,{cache:'no-store'})
     if(!response.ok||(response.headers.get('content-type')||'').includes('text/html'))throw new Error('Original GLB missing in app. Import the recovered ZIP or GLB files.')
     data=await response.arrayBuffer()
    }
    if(data.byteLength<20||new DataView(data).getUint32(0,true)!==0x46546c67)throw new Error('Not a GLB')
    const gltf=await loader.parseAsync(data,new URL('.',new URL(entry.url,window.location.href)).href)
    const skins=gltf.scene.getObjectsByProperty('type','SkinnedMesh').length
    if(!skins||!gltf.animations.length)throw new Error('Skinned rig or animations missing')
    const root=gltf.scene
    root.name='restored-'+entry.id
    root.position.set(i*2.7-2.7,0,START_Z)
    stage.add(root);roots.push(root)
    const a:Actor={name:entry.name,root,mixer:new THREE.AnimationMixer(root),clips:gltf.animations,active:null,moving:null}
    actors.set(entry.id,a);choose(a,'walk')
    outcomes.push({name:entry.name,status:'mounted',clips:gltf.animations.length,url:entry.url})
   }catch(error){outcomes.push({name:entry.name,status:'not-mounted',clips:0,url:entry.url,error:String(error)})}
   result('progress',{results:outcomes})
  }
  hurdle.visible=actors.has('jacobie-stubbs')
  loading=false
  result('done',{results:outcomes,allThreeMounted:outcomes.length===3&&outcomes.every(o=>o.status==='mounted'),mobileCertified:false,visualAppearanceCertified:false,obstacleCourse:hurdle.visible?'available-for-test':'unavailable'})
 }
 const onOpen=()=>{void open()}
 const onAction=(e:Event)=>{
  const detail=(e as CustomEvent<{actor?:CastKey;action?:Action}>).detail
  if(!detail?.actor||!detail.action)return
  action(detail.actor,detail.action)
 }
 const onReset=()=>{
  for(const [id,a] of actors){const i=STREETVERSE_RECOVERED_THREE_CAST.findIndex(x=>x.id===id);a.root.position.set(i*2.7-2.7,0,START_Z);a.moving=null;choose(a,'walk')}
  result('reset',{message:'All three actors reset to original stage positions'})
 }
 window.addEventListener('tryamm:streetverse-cast-stage-open',onOpen)
 window.addEventListener('tryamm:streetverse-cast-stage-action',onAction)
 window.addEventListener('tryamm:streetverse-cast-stage-reset',onReset)
 return{dispose:()=>{disposed=true;window.removeEventListener('tryamm:streetverse-cast-stage-open',onOpen);window.removeEventListener('tryamm:streetverse-cast-stage-action',onAction);window.removeEventListener('tryamm:streetverse-cast-stage-reset',onReset);cancelAnimationFrame(frame);clear();hurdle.removeFromParent();obstacleGeometry.dispose();obstacleMaterial.dispose();stage.removeFromParent()}}
}
