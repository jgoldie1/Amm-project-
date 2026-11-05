import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

// Offline BJ V15 proof viewer: Three.js is bundled at build time. The model
// is embedded in index.html at release time, so no network/CORS is required.
const $=id=>document.getElementById(id)
const status=$('status')
const setStatus=(message,kind='good')=>{status.textContent=message;status.dataset.kind=kind}
const stage=$('stage')
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'})
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5))
renderer.outputColorSpace=THREE.SRGBColorSpace
renderer.toneMapping=THREE.ACESFilmicToneMapping
renderer.toneMappingExposure=1.35
stage.appendChild(renderer.domElement)
const scene=new THREE.Scene()
scene.background=new THREE.Color(0x182537)
scene.fog=new THREE.Fog(0x182537,30,90)
scene.add(new THREE.HemisphereLight(0xffffff,0x405b80,2.35))
const key=new THREE.DirectionalLight(0xffe2c4,3.0)
key.position.set(-4,10,7);scene.add(key)
const fill=new THREE.DirectionalLight(0x97bfff,1.25)
fill.position.set(4,5,-7);scene.add(fill)
const floor=new THREE.Mesh(new THREE.PlaneGeometry(140,140),new THREE.MeshStandardMaterial({color:0x374956,roughness:0.95}))
floor.rotation.x=-Math.PI/2;floor.position.y=-0.02;scene.add(floor)
const path=new THREE.Mesh(new THREE.PlaneGeometry(13,80),new THREE.MeshStandardMaterial({color:0x59606a,roughness:1}))
path.rotation.x=-Math.PI/2;path.position.y=0.001;scene.add(path)
const lawns=[-1,1].map(side=>{
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(15,80),new THREE.MeshStandardMaterial({color:0x1e513c,roughness:1}))
  mesh.rotation.x=-Math.PI/2;mesh.position.set(side*14,0,0);scene.add(mesh);return mesh
})
for(const x of [-20,20])for(const z of [-30,-10,10,30]){
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.17,.2,3,7),new THREE.MeshStandardMaterial({color:0x64432e,roughness:1}))
  trunk.position.set(x,1.5,z);scene.add(trunk)
  const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.8,1),new THREE.MeshStandardMaterial({color:0x226b49,roughness:1}))
  crown.position.set(x,3.55,z);scene.add(crown)
}
for(let i=0;i<4;i++){
  const z=i*8-12
  const bench=new THREE.Group()
  const material=new THREE.MeshStandardMaterial({color:0x7c4d35,roughness:0.8})
  for(let j=0;j<3;j++){
    const plank=new THREE.Mesh(new THREE.BoxGeometry(2.1,.12,.16),material)
    plank.position.set(0,j*.32+.42,-.25*(j===2?0:1));bench.add(plank)
  }
  bench.position.set(i%2?-6:6,0,z);scene.add(bench)
}
const camera=new THREE.PerspectiveCamera(49,1,.08,150)
let orbitYaw=0.35,orbitPitch=.23,distance=5.7,faceTurn=0
let player=null,mixer=null,clips=[],currentAction=null,currentName='',temporaryUntil=0,focusFace=false,lastNow=performance.now()
const held=new Set()
const match=name=>({idle:/idle|breath|stand/i,walk:/walk|locomotion/i,wave:/greet|wave/i,nod:/listen|nod/i,look:/observe|look/i,talk:/speaking|conversation|gesture/i}[name])
function play(name,temporary=false){
  if(!mixer||!clips.length)return false
  const clip=clips.find(x=>match(name)?.test(x.name))
  if(!clip){setStatus('BJ V15 does not contain a '+name+' clip. The real available animation list is shown below.','warn');return false}
  if(currentName===name&&currentAction?.isRunning())return true
  const next=mixer.clipAction(clip)
  next.enabled=true
  next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1)
  next.setLoop(temporary?THREE.LoopOnce:THREE.LoopRepeat,temporary?1:Infinity)
  next.clampWhenFinished=false
  next.fadeIn(.2).play()
  if(currentAction&&currentAction!==next)currentAction.fadeOut(.2)
  currentAction=next;currentName=name
  temporaryUntil=temporary?performance.now()+Math.min(12000,clip.duration*1000+170):0
  $('animation').textContent=clip.name
  return true
}
const keys={forward:['w','arrowup'],back:['s','arrowdown'],left:['a','arrowleft'],right:['d','arrowright']}
const down=(key)=>held.add(key),up=(key)=>held.delete(key)
window.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase()
  if(Object.values(keys).some(arr=>arr.includes(k))){e.preventDefault();down(k)}
  if(k==='r')reset()
})
window.addEventListener('keyup',e=>up(e.key.toLowerCase()))
window.addEventListener('blur',()=>held.clear())
for(const [id,key] of [['forward','w'],['back','s'],['left','a'],['right','d']]){
  const button=$(id)
  button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);down(key)})
  for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>up(key))
}
for(const name of ['idle','wave','nod','look','talk']){
  $(name).addEventListener('click',()=>{if(!player)return;play(name,name!=='idle')})
}
$('turn').addEventListener('click',()=>{faceTurn+=Math.PI; if(player)player.rotation.y+=Math.PI})
$('closeup').addEventListener('click',()=>{
  focusFace=!focusFace
  $('closeup').textContent=focusFace?'FULL BODY':'FACE CLOSE-UP'
})
$('reset').addEventListener('click',reset)
function reset(){held.clear();if(player){player.position.set(0,0,0);player.rotation.y=0};orbitYaw=.35;distance=5.7;focusFace=false;play('idle')}
let drag=false,lastX=0,lastY=0
renderer.domElement.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)})
renderer.domElement.addEventListener('pointerup',()=>{drag=false})
renderer.domElement.addEventListener('pointercancel',()=>{drag=false})
renderer.domElement.addEventListener('pointermove',e=>{
  if(!drag)return
  orbitYaw-=(e.clientX-lastX)*.007
  orbitPitch=THREE.MathUtils.clamp(orbitPitch+(e.clientY-lastY)*.003,-.1,.85)
  lastX=e.clientX;lastY=e.clientY
})
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance+e.deltaY*.007,2.2,11)},{passive:false})
function resize(){
  const w=stage.clientWidth,h=stage.clientHeight
  if(w<=0||h<=0)return
  const pixelRatio=renderer.getPixelRatio()
  if(renderer.domElement.width!==Math.floor(w*pixelRatio)||renderer.domElement.height!==Math.floor(h*pixelRatio)){
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()
  }
}
const clock=new THREE.Clock()
function frame(now){
  requestAnimationFrame(frame)
  resize()
  const dt=Math.min(clock.getDelta(),.055)
  if(player){
    const inputX=Number(keys.right.some(k=>held.has(k)))-Number(keys.left.some(k=>held.has(k)))
    const inputZ=Number(keys.forward.some(k=>held.has(k)))-Number(keys.back.some(k=>held.has(k)))
    const walking=Boolean(inputX||inputZ)
    if(walking){
      const forward=new THREE.Vector3(-Math.sin(orbitYaw),0,-Math.cos(orbitYaw))
      const right=new THREE.Vector3(Math.cos(orbitYaw),0,-Math.sin(orbitYaw))
      const dir=forward.multiplyScalar(inputZ).addScaledVector(right,inputX).normalize()
      player.position.addScaledVector(dir,1.9*dt)
      player.position.x=THREE.MathUtils.clamp(player.position.x,-23,23)
      player.position.z=THREE.MathUtils.clamp(player.position.z,-35,35)
      player.rotation.y=Math.atan2(-dir.x,-dir.z)+faceTurn
    }
    if(now>temporaryUntil||!temporaryUntil){
      const desired=walking?'walk':'idle'
      if(currentName!==desired)play(desired)
    }
    mixer?.update(dt)
  }
  const target=player?.position.clone()||new THREE.Vector3()
  const h=focusFace?1.55:1.05
  const radius=focusFace?1.65:distance
  const pitch=focusFace?.08:orbitPitch
  const targetPos=target.clone().add(new THREE.Vector3(Math.sin(orbitYaw)*Math.cos(pitch)*radius,h+Math.sin(pitch)*radius,Math.cos(orbitYaw)*Math.cos(pitch)*radius))
  camera.position.lerp(targetPos,.15)
  camera.lookAt(target.x,h,target.z)
  renderer.render(scene,camera)
}
requestAnimationFrame(frame)
async function loadBJ(){
  try{
    setStatus('Decoding ORIGINAL BJ Stubbs V15 GLB from this offline page...')
    const encoded=$('bj-original-binary').textContent.trim()
    if(encoded.length<1000)throw Error('Model bytes were not included in the downloaded page')
    const raw=atob(encoded)
    const bytes=new Uint8Array(raw.length)
    for(let offset=0;offset<raw.length;offset+=16384){
      const piece=raw.slice(offset,offset+16384)
      for(let i=0;i<piece.length;i++)bytes[offset+i]=piece.charCodeAt(i)
    }
    if(String.fromCharCode(...bytes.slice(0,4))!=='glTF')throw Error('GLB signature is invalid')
    const loader=new GLTFLoader()
    const gltf=await loader.parseAsync(bytes.buffer,'')
    const avatar=new THREE.Group()
    avatar.name='Playable BJ V15'
    const model=gltf.scene
    // Release V15 has zero-scale legacy meshes that create NaN bounding boxes.
    const invisible=[]
    model.traverse(node=>{if(node.isMesh&&node.scale.lengthSq()<1e-12)invisible.push(node)})
    invisible.forEach(node=>node.removeFromParent())
    const bounds=new THREE.Box3().setFromObject(model)
    const size=bounds.getSize(new THREE.Vector3())
    const center=bounds.getCenter(new THREE.Vector3())
    if(!Number.isFinite(size.y)||size.y<.1)throw Error('BJ model bounding box is not valid')
    const factor=1.85/size.y
    model.scale.multiplyScalar(factor)
    model.position.set(-center.x*factor,-bounds.min.y*factor,-center.z*factor)
    model.traverse(node=>{
      if(node.isMesh){node.castShadow=false;node.receiveShadow=false;node.frustumCulled=false}
    })
    avatar.add(model)
    scene.add(avatar)
    player=avatar
    clips=gltf.animations||[]
    mixer=clips.length?new THREE.AnimationMixer(model):null
    $('metadata').textContent='Original GLB • '+size.y.toFixed(2)+' source units • '+clips.length+' animations • '+invisible.length+' invisible legacy meshes skipped'
    $('clip-list').textContent=clips.map(x=>x.name).join('  •  ')
    setStatus('BJ V15 ORIGINAL LOADED. Use WASD or touch arrows to walk. Rotate camera with drag.','good')
    $('stage-tag').textContent='BJ V15 ORIGINAL • 3D'
    play('idle')
  }catch(error){
    setStatus('BJ V15 VIEWER ERROR: '+(error?.message||String(error)),'error')
    $('stage-tag').textContent='MODEL ERROR • NO GENERIC REPLACEMENT'
  }
}
loadBJ()
