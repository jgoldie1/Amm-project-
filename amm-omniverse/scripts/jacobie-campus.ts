import * as THREE from 'three'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'
import {GREENVILLE_CAMPUS_ZONES as zones,installGreenvilleCampusBirthdayWorld} from '../src/runtime/StreetVerseGreenvilleCampusBirthdayRuntime'
import {createBuildingCadPlan,validateCadPlan} from '../src/game/forger/StreetVerseWorldForger'
import {createAssetFactoryJob} from '../src/data/TryammAssetForge'
const el=(id:string)=>document.getElementById(id)!
const canvas=document.querySelector('canvas')!
const say=(value:string)=>{el('status').textContent=value}
const start=el('start') as HTMLButtonElement
let saved=0
try { saved=Number(localStorage.getItem('jacobie.campus.chapter.v1')) } catch {}
let stage=Number.isInteger(saved)&&saved>=0&&saved<=8?saved:0
const goal=()=>el('goal').textContent=stage===zones.length?'Campus chapter complete':(stage+1)+' / '+zones.length+' · '+zones[stage].label
goal()
start.onclick=async()=>{
 start.disabled=true
 let renderer:THREE.WebGLRenderer|undefined
 try {
  renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'low-power'})
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5))
  const scene=new THREE.Scene()
  scene.background=new THREE.Color(0xaed9df)
  scene.add(new THREE.HemisphereLight(0xfff6dc,0x97bea7,2.4))
  const sun=new THREE.DirectionalLight(0xffedbd,2);sun.position.set(15,28,10);scene.add(sun)
  installGreenvilleCampusBirthdayWorld(scene)
  const plan=createBuildingCadPlan({id:'studio',label:'Campus check-in studio',widthM:4,depthM:3,floors:2,sourceIds:['jacobie-campus-concept'],conceptualOnly:true})
  if(validateCadPlan(plan).length)throw Error('Studio plan failed validation')
  const booth=new THREE.Mesh(new THREE.BoxGeometry(plan.footprintM.width,2,plan.footprintM.depth),new THREE.MeshStandardMaterial({color:0x224573}))
  booth.position.set(6,1,58);scene.add(booth)
  const asset=createAssetFactoryJob('jacobie-greenville','character','mobile')
  const gltf=await new GLTFLoader().loadAsync('jacobie.glb')
  const actor=gltf.scene
  let bones=0; actor.traverse(o=>{if((o as THREE.Bone).isBone)bones++})
  const walkClip=THREE.AnimationClip.findByName(gltf.animations,'Walk')
  if(asset.requiresRig&&(!bones||!walkClip))throw Error('Character animation unavailable')
  const box=new THREE.Box3().setFromObject(actor)
  const scale=2.4/(box.max.y-box.min.y)
  actor.scale.multiplyScalar(scale);actor.position.y=-box.min.y*scale
  const player=new THREE.Group();player.add(actor);scene.add(player)
  const spawn=zones[Math.max(0,stage-1)];player.position.set(spawn.x,0,spawn.z+4)
  const mixer=new THREE.AnimationMixer(actor);const walk=mixer.clipAction(walkClip);walk.play();walk.paused=true
  const camera=new THREE.PerspectiveCamera(50,1,.1,300)
  const interval=new THREE.Clock(),keys=new Set<string>()
  let guided=false,previousMoving=false
  const moves:Record<string,[number,number]>={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}
  const keyMap:Record<string,string>={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'}
  for(const button of document.querySelectorAll<HTMLButtonElement>('[data-dir]')){
    const dir=button.dataset.dir!
    button.onpointerdown=e=>{guided=false;keys.add(dir);button.setPointerCapture(e.pointerId)}
    button.onlostpointercapture=()=>keys.delete(dir)
    button.onclick=e=>{if(e.detail===0){guided=false;player.position.x+=moves[dir][0];player.position.z+=moves[dir][1]}}
  }
  window.addEventListener('keydown',e=>{if(keyMap[e.key]){e.preventDefault();guided=false;keys.add(keyMap[e.key])}})
  window.addEventListener('keyup',e=>keys.delete(keyMap[e.key]))
  window.addEventListener('blur',()=>{guided=false;keys.clear()})
  el('guide').onclick=()=>{guided=stage<zones.length}
  el('check').onclick=()=>{
    if(stage>=zones.length)return
    const zone=zones[stage]
    if(Math.hypot(player.position.x-zone.x,player.position.z-zone.z-4)>3){say('Walk to '+zone.label+' before checking in.');return}
    stage++;guided=false;goal();say(stage===zones.length?'You completed the Greenville birthday tour.':'Checked in at '+zone.label+'.')
    try{localStorage.setItem('jacobie.campus.chapter.v1',String(stage))}catch{}
  }
  const resize=()=>{renderer!.setSize(canvas.clientWidth,canvas.clientHeight,false);camera.aspect=canvas.clientWidth/canvas.clientHeight;camera.updateProjectionMatrix()}
  new ResizeObserver(resize).observe(canvas);resize()
  const delta=new THREE.Vector2()
  renderer.setAnimationLoop(()=>{
    const dt=Math.min(interval.getDelta(),.1);delta.set(0,0)
    for(const k of keys){const [x,z]=moves[k];delta.x+=x;delta.y+=z}
    const zone=zones[stage]
    if(guided&&zone){delta.set(zone.x-player.position.x,zone.z+4-player.position.z);if(delta.length()<.6){guided=false;delta.set(0,0);say('At '+zone.label+'. Tap Check in.')} }
    const moving=delta.lengthSq()>0
    if(moving){const speed=guided?14:7;delta.normalize().multiplyScalar(dt*speed);player.position.x=THREE.MathUtils.clamp(player.position.x+delta.x,-65,65);player.position.z=THREE.MathUtils.clamp(player.position.z+delta.y,-62,70);actor.rotation.y=Math.atan2(delta.x,delta.y)}
    if(previousMoving!==moving){walk.paused=!moving;previousMoving=moving}
    mixer.update(dt);camera.position.set(player.position.x+4,player.position.y+5,player.position.z+9);camera.lookAt(player.position.x,1.4,player.position.z)
    renderer!.render(scene,camera)
    canvas.dataset.position=player.position.x.toFixed(2)+','+player.position.z.toFixed(2)
  })
  start.hidden=true;el('actions').hidden=false;say('Jacobie is ready. Use the direction buttons or Walk to stop.')
 }catch{renderer?.dispose();start.disabled=false;say('The 3D campus could not load. Retry or open Full StreetVerse.')}
}
