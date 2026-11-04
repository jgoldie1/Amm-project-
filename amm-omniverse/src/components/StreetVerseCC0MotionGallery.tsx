import {useEffect,useMemo,useRef,useState} from 'react'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {STREETVERSE_CC0_GESTURES_50,STREETVERSE_CC0_GESTURE_PACKS,type StreetVerseCC0Pack} from '../data/StreetVerseCC0GestureClips50'

type PackModel=Awaited<ReturnType<GLTFLoader['loadAsync']>>
const normalize=(s:string)=>s.toLowerCase().replace(/_loop$/,'').replace(/[^a-z0-9]/g,'')

/** On-demand preview of source CC0 GLBs, NOT a BJ retarget or gameplay import.
 * Two 7-8 MB packs are downloaded only after the user opens the gallery and picks a clip.
 */
export default function StreetVerseCC0MotionGallery({onClose}:{onClose:()=>void}){
 const [selected,setSelected]=useState('cc0-idle-loop')
 const [query,setQuery]=useState('')
 const [status,setStatus]=useState('Select a motion to inspect the original Quaternius GLB.')
 const [clipNames,setClipNames]=useState<string[]>([])
 const viewport=useRef<HTMLDivElement|null>(null)
 const scene=useRef<THREE.Scene|null>(null)
 const camera=useRef<THREE.PerspectiveCamera|null>(null)
 const mixer=useRef<THREE.AnimationMixer|null>(null)
 const model=useRef<THREE.Object3D|null>(null)
 const sourceCache=useRef(new Map<StreetVerseCC0Pack,PackModel>())
 const requestId=useRef(0)
 const selectedClip=STREETVERSE_CC0_GESTURES_50.find(c=>c.id===selected)||STREETVERSE_CC0_GESTURES_50[0]
 const filtered=useMemo(()=>STREETVERSE_CC0_GESTURES_50.filter(x=>
  [x.label,x.clip,x.category,x.pack].join(' ').toLowerCase().includes(query.toLowerCase())
 ),[query])

 useEffect(()=>{
  const host=viewport.current
  if(!host)return
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'low-power'})}
  catch{setStatus('WebGL preview unavailable on this device. Source catalog remains accessible.');return}
  renderer.outputColorSpace=THREE.SRGBColorSpace
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5))
  const world=new THREE.Scene()
  world.background=new THREE.Color('#172535')
  scene.current=world
  const cam=new THREE.PerspectiveCamera(48,1,.02,200)
  camera.current=cam
  cam.position.set(2,1.9,4.5)
  cam.lookAt(0,1.1,0)
  world.add(new THREE.HemisphereLight(0xc8eaff,0x434a55,2.2))
  const sunlight=new THREE.DirectionalLight(0xffffff,2.0)
  sunlight.position.set(4,8,5);world.add(sunlight)
  world.add(new THREE.GridHelper(10,10,0x4f7b91,0x395161))
  host.appendChild(renderer.domElement)
  const resize=()=>{const w=Math.max(200,host.clientWidth),h=Math.max(190,host.clientHeight);renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
  resize()
  window.addEventListener('resize',resize)
  const clock=new THREE.Clock()
  let frame=0
  const tick=()=>{const delta=Math.min(.05,clock.getDelta());mixer.current?.update(delta);renderer.render(world,cam);frame=requestAnimationFrame(tick)}
  frame=requestAnimationFrame(tick)
  return()=>{
   ++requestId.current
   cancelAnimationFrame(frame)
   window.removeEventListener('resize',resize)
   mixer.current?.stopAllAction();mixer.current=null
   scene.current=null;camera.current=null;model.current=null
   sourceCache.current.clear()
   renderer.dispose()
   if(renderer.domElement.parentElement===host)host.removeChild(renderer.domElement)
  }
 },[])

 useEffect(()=>{
  const selectedId=++requestId.current
  const pack=STREETVERSE_CC0_GESTURE_PACKS[selectedClip.pack]
  if(!scene.current)return
  let active=true
  const start=async()=>{
   setStatus('Loading '+selectedClip.pack+' source model only on demand (~'+Math.round(pack.bytes/1000000)+' MB). BJ not modified.')
   let gltf=sourceCache.current.get(selectedClip.pack)
   if(!gltf){
    try{gltf=await new GLTFLoader().loadAsync(pack.url)}
    catch{if(active&&selectedId===requestId.current)setStatus('Source GLB unavailable (network/CORS). Nothing imported into BJ.');return}
    if(!active||selectedId!==requestId.current)return
    sourceCache.current.set(selectedClip.pack,gltf)
   }
   if(!active||selectedId!==requestId.current||!scene.current)return
   mixer.current?.stopAllAction();mixer.current=null
   if(model.current)scene.current.remove(model.current)
   if(!gltf.scene.userData.streetverseCC0PreviewNormalized){
    const box=new THREE.Box3().setFromObject(gltf.scene)
    const dimensions=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3())
    const maxDim=Math.max(dimensions.x,dimensions.y,dimensions.z,.01)
    const scale=2.8/maxDim
    gltf.scene.scale.setScalar(scale)
    gltf.scene.position.set(-center.x*scale,.15-(center.y-dimensions.y*.5)*scale,-center.z*scale)
    gltf.scene.userData.streetverseCC0PreviewNormalized=true
   }
   model.current=gltf.scene
   scene.current.add(gltf.scene)
   setClipNames(gltf.animations.map(clip=>clip.name))
   const clip=gltf.animations.find(x=>normalize(x.name)===normalize(selectedClip.clip))||
    gltf.animations.find(x=>normalize(x.name).includes(normalize(selectedClip.clip)))
   if(!clip){
    setStatus('Clip '+selectedClip.clip+' not found in this GLB. Source track names verified; no invented animation.')
    return
   }
   mixer.current=new THREE.AnimationMixer(gltf.scene)
   mixer.current.clipAction(clip).reset().setLoop(THREE.LoopRepeat,Infinity).play()
   setStatus('PLAYING SOURCE MANNEQUIN • '+clip.name+' • CC0. BJ retarget not yet certified.')
  }
  void start()
  return()=>{active=false}
 },[selected])

 return <section role="dialog" aria-label="StreetVerse 50 CC0 GLB motion gallery" style={{position:'fixed',inset:0,zIndex:70000,background:'#08111df9',color:'#eefaff',padding:'max(12px,env(safe-area-inset-top)) 12px max(18px,env(safe-area-inset-bottom))',overflowY:'auto',fontFamily:'system-ui,sans-serif'}}>
  <header style={{display:'flex',alignItems:'start',justifyContent:'space-between',gap:10}}>
   <div><strong style={{fontSize:18}}>🎞 50 CC0 MOTIONS</strong><div style={{fontSize:11,color:'#9bc6d9',marginTop:4}}>Two source GLBs • preview mannequin • not yet retargeted to BJ</div></div>
   <button type="button" aria-label="Close StreetVerse CC0 gesture gallery" onClick={onClose} style={{minHeight:44,minWidth:54,borderRadius:12,border:'1px solid #91eaff',background:'#132c39',color:'#fff',fontWeight:900}}>CLOSE</button>
  </header>
  <div ref={viewport} role="img" aria-label="3D mannequin motion preview from CC0 Quaternius GLB" style={{width:'100%',height:'min(34dvh,300px)',minHeight:190,border:'1px solid #28485e',borderRadius:15,overflow:'hidden',marginTop:10}}/>
  <div role="status" aria-label="CC0 GLB clip verification" style={{padding:10,background:'#102537',borderRadius:10,fontSize:11,marginTop:8}}>{status}</div>
  <div style={{fontSize:10,color:'#9bb8cb',marginTop:5}}>Imported names from source pack: {clipNames.length?clipNames.length+' tracks loaded':'none yet'}. Source and BJ skeletons differ; preview does not equip, transfer, or grant anything.</div>
  <input type="search" aria-label="Search 50 CC0 GLB motions" placeholder="Search: dance, walk, repair, phone, jump..." value={query} onChange={event=>setQuery(event.target.value)} style={{width:'100%',minHeight:48,marginTop:11,borderRadius:11,padding:'0 12px',fontSize:16,color:'#fff',background:'#111e30',border:'1px solid #5f8bad'}}/>
  <div aria-label="Source motion choices" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(142px,1fr))',gap:7,marginTop:10,paddingBottom:16}}>
   {filtered.map(item=><button key={item.id} aria-label={'Preview '+item.label+' CC0 source clip'} aria-pressed={selected===item.id} onClick={()=>setSelected(item.id)} style={{minHeight:53,borderRadius:11,padding:7,textAlign:'left',background:selected===item.id?'#18475b':'#122031',border:selected===item.id?'2px solid #8fe9ff':'1px solid #3c5a72',color:'#fff',touchAction:'manipulation'}}>
    <div style={{fontSize:11,fontWeight:850}}>{item.label}</div>
    <div style={{fontSize:9,color:'#a7bdcd',marginTop:4}}>{item.pack} · {item.clip}</div>
   </button>)}
  </div>
  <div style={{fontSize:10,color:'#9db7ca',paddingBottom:12}}>License: Quaternius CC0 1.0. Each GLB loads only after opening this gallery; source files require retargeting and mobile performance testing before BJ use.</div>
 </section>
}
