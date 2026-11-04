import {useEffect,useMemo,useRef,useState,type CSSProperties} from 'react'
import {createPortal} from 'react-dom'
import * as THREE from 'three'
import {checkHoloCADXRSupport,getXRAPI,type HoloCADXRMode,type HoloCADXRSupport} from '../game/holocad/holocadXRSupport'
import {
 HOLOCAD_LIVING_PRESETS,HOLOCAD_SUBJECT_ORDER,layoutHoloCAD,
 type HoloCADSubject,type HoloCADPart,type HoloCADLayer
} from '../game/holocad/livingSystemsPresets'

const control:CSSProperties={
 minHeight:44,border:'1px solid #68d8fb77',borderRadius:11,
 background:'#13263b',color:'#eaf8ff',padding:'8px 10px',
 font:'800 12px system-ui',touchAction:'manipulation'
}
const clamp=(n:number,a:number,b:number)=>Math.min(b,Math.max(a,n))
const displayLayer=(s:string)=>s.replaceAll('-',' ').toUpperCase()
const safeLabel=(id:string)=>id.replaceAll('-',' ')

export default function StreetVerseHoloCADLivingSystemsLab({onClose}:{onClose:()=>void}){
 const [subject,setSubject]=useState<HoloCADSubject>('human')
 const [explode,setExplode]=useState(0)
 const [detached,setDetached]=useState<string[]>([])
 const [damaged,setDamaged]=useState<string[]>([])
 const [selected,setSelected]=useState<string>('heart')
 const [layers,setLayers]=useState<HoloCADLayer[]>(['shell','muscle','skeleton','organs','circulation'])
 const [status,setStatus]=useState('Choose a part, inspect it, separate it, or practice a simulated repair.')
 const [renderStatus,setRenderStatus]=useState('Starting HoloCAD 3D…')
 const [xrSupport,setXRSupport]=useState<HoloCADXRSupport>({ar:false,vr:false,reason:'Checking device WebXR support…'})
 const [xrMode,setXRMode]=useState<HoloCADXRMode|null>(null)
 const [xrStatus,setXRStatus]=useState('AR and VR require a supported device and a secure HTTPS page.')
 const [revealOnly,setRevealOnly]=useState(false)
 const host=useRef<HTMLDivElement|null>(null)
 const runtime=useRef<{
  draw:()=>void
  meshById:Map<string,THREE.Mesh>
  dispose:()=>void
  enterXR:(mode:HoloCADXRMode)=>Promise<void>
  exitXR:()=>Promise<void>
 }|null>(null)
 const data=HOLOCAD_LIVING_PRESETS[subject]
 const part=useMemo(()=>data.parts.find(p=>p.id===selected)||data.parts[0],[data,selected])
 const layerOptions=useMemo(()=>[...new Set(data.parts.map(p=>p.layer))],[data])
 const hiddenCount=data.parts.filter(p=>!layers.includes(p.layer)).length
 const damagedCount=damaged.filter(id=>data.parts.some(p=>p.id===id)).length

 useEffect(()=>{
  let alive=true
  void checkHoloCADXRSupport(navigator,window.isSecureContext).then(support=>{
   if(alive)setXRSupport(support)
  })
  return()=>{alive=false}
 },[])

 useEffect(()=>{
  setSelected(HOLOCAD_LIVING_PRESETS[subject].parts.find(p=>p.layer==='organs')?.id||
    HOLOCAD_LIVING_PRESETS[subject].parts.find(p=>p.layer==='mechanical')?.id||
    HOLOCAD_LIVING_PRESETS[subject].parts[0].id)
  setExplode(0)
  setDetached([])
  setDamaged([])
  setLayers([...new Set(HOLOCAD_LIVING_PRESETS[subject].parts.map(p=>p.layer))])
  setStatus('Loaded '+HOLOCAD_LIVING_PRESETS[subject].title+'. Schematic training environment only.')
 },[subject])

 useEffect(()=>{
  const element=host.current
  if(!element)return
  let renderer:THREE.WebGLRenderer
  try{
   renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'low-power',alpha:true})
  }catch{
   setRenderStatus('3D graphics unavailable on this device. Use the accessible parts list below.')
   return
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.25))
  renderer.outputColorSpace=THREE.SRGBColorSpace
  renderer.setClearAlpha(1)
  const scene=new THREE.Scene()
  scene.background=new THREE.Color('#071321')
  const camera=new THREE.PerspectiveCamera(43,1,.1,120)
  const sceneCenter=subject==='building'?1.5:subject==='human'?1.3:subject==='canine'?.9:1.0
  camera.position.set(5,3.3,7)
  camera.lookAt(0,sceneCenter,0)
  const root=new THREE.Group()
  scene.add(root)
  scene.add(new THREE.HemisphereLight(0xc7ebff,0x2f354e,2.5))
  const mainLight=new THREE.DirectionalLight(0xffffff,2.1)
  mainLight.position.set(4,8,6);scene.add(mainLight)
  const fillLight=new THREE.DirectionalLight(0x72caff,1.15)
  fillLight.position.set(-4,3,-6);scene.add(fillLight)
  const floor=new THREE.GridHelper(10,20,0x3c718c,0x17314c)
  floor.position.y=-.22;scene.add(floor)
  const meshById=new Map<string,THREE.Mesh>()
  const geometryCache=new Map<string,THREE.BufferGeometry>()
  const getGeometry=(type:HoloCADPart['shape'])=>{
    const cached=geometryCache.get(type)
    if(cached)return cached
    const geometry=type==='sphere'?new THREE.SphereGeometry(.5,20,12)
      :type==='box'?new THREE.BoxGeometry(1,1,1)
      :type==='cylinder'?new THREE.CylinderGeometry(.5,.5,1,16)
      :new THREE.CapsuleGeometry(.34,.33,4,12)
    geometryCache.set(type,geometry)
    return geometry
  }
  for(const part of data.parts){
    const material=new THREE.MeshStandardMaterial({
      color:part.color,
      transparent:part.opacity<1,
      opacity:part.opacity,
      roughness:.55,metalness:subject==='automobile'?.28:.04,
      depthWrite:part.opacity>=.8,side:THREE.DoubleSide
    })
    const mesh=new THREE.Mesh(getGeometry(part.shape),material)
    mesh.name=part.id
    mesh.scale.set(...part.size)
    if(subject==='automobile'&&part.id.includes('wheel'))mesh.rotation.x=Math.PI/2
    mesh.userData.part=part
    root.add(mesh);meshById.set(part.id,mesh)
  }
  const selectRay=new THREE.Raycaster(),mouse=new THREE.Vector2()
  let dragX=0,dragY=0,moved=false,down=false
  let yaw=subject==='canine'?.12:.28,pitch=0
  let distance=subject==='building'?9.6:subject==='automobile'?8.2:7.1
  let animationFrame=0
  let disposed=false
  const draw=()=>{
    if(disposed)return
    const w=Math.max(250,element.clientWidth),h=Math.max(210,element.clientHeight)
    renderer.setSize(w,h,false)
    camera.aspect=w/h
    camera.updateProjectionMatrix()
    const x=Math.sin(yaw)*Math.cos(pitch)*distance
    const z=Math.cos(yaw)*Math.cos(pitch)*distance
    camera.position.set(x,sceneCenter+Math.sin(pitch)*distance,z)
    camera.lookAt(0,sceneCenter,0)
    if(!renderer.xr.isPresenting)renderer.render(scene,camera)
  }
  const updatePointer=(event:PointerEvent)=>{
    const rect=element.getBoundingClientRect()
    mouse.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1)
  }
  const onDown=(e:PointerEvent)=>{
    down=true;dragX=e.clientX;dragY=e.clientY;moved=false
    element.setPointerCapture?.(e.pointerId)
  }
  const onMove=(e:PointerEvent)=>{
    if(!down)return
    const dx=e.clientX-dragX,dy=e.clientY-dragY
    if(Math.abs(dx)+Math.abs(dy)>4)moved=true
    if(moved){
      yaw-=dx*.008
      pitch=clamp(pitch-dy*.006,-.6,1.1)
      dragX=e.clientX;dragY=e.clientY
      draw()
    }
  }
  const onUp=(e:PointerEvent)=>{
    if(!down)return
    down=false
    if(moved)return
    updatePointer(e);selectRay.setFromCamera(mouse,camera)
    const hit=selectRay.intersectObjects([...meshById.values()].filter(x=>x.visible),false)[0]
    if(hit?.object?.name)setSelected(hit.object.name)
  }
  const onWheel=(e:WheelEvent)=>{
    e.preventDefault();distance=clamp(distance+e.deltaY*.008,3.4,14);draw()
  }
  const onResize=()=>draw()
  element.appendChild(renderer.domElement)
  element.addEventListener('pointerdown',onDown)
  element.addEventListener('pointermove',onMove)
  element.addEventListener('pointerup',onUp)
  element.addEventListener('pointercancel',onUp)
  element.addEventListener('wheel',onWheel,{passive:false})
  window.addEventListener('resize',onResize)
  // Real WebXR sessions are opt-in and only requested from user clicks.
  // No desktop-camera imitation is presented as augmented reality.
  type Session=EventTarget&{end:()=>Promise<void>}
  type XRControllerGroup=THREE.Group&{
    addEventListener:(type:'select'|'squeeze',listener:()=>void)=>void
    removeEventListener:(type:'select'|'squeeze',listener:()=>void)=>void
  }
  let activeSession:Session|null=null
  let controllers:Array<{
   controller:XRControllerGroup
   onSelect:()=>void
   onSqueeze:()=>void
   beam:THREE.Line
  }>=[]
  const releaseControllers=()=>{
   for(const item of controllers){
    item.controller.removeEventListener('select',item.onSelect)
    item.controller.removeEventListener('squeeze',item.onSqueeze)
    item.controller.remove(item.beam)
    item.beam.geometry.dispose()
    ;(item.beam.material as THREE.Material).dispose()
    scene.remove(item.controller)
   }
   controllers=[]
  }
  const resetXR=()=>{
   activeSession?.removeEventListener('end',onSessionEnd)
   activeSession=null
   renderer.setAnimationLoop(null)
   renderer.xr.enabled=false
   releaseControllers()
   root.scale.setScalar(1)
   root.position.set(0,0,0)
   scene.background=new THREE.Color('#071321')
   floor.visible=true
   renderer.setClearAlpha(1)
   if(!disposed){
    setXRMode(null)
    setXRStatus('Immersive session ended. 3D teardown and all part controls are preserved.')
    draw()
   }
  }
  const onSessionEnd=()=>resetXR()
  const enterXR=async(mode:HoloCADXRMode)=>{
   if(disposed||activeSession)return
   if(!window.isSecureContext){
    setXRStatus('WebXR requires HTTPS or localhost. Standard 3D is still available.')
    return
   }
   const api=getXRAPI(navigator)
   if(!api){
    setXRStatus('WebXR unsupported here. Rotate and inspect the 3D parts on this device instead.')
    return
   }
   const features=mode==='immersive-ar'
    ?{optionalFeatures:['local-floor','dom-overlay'],domOverlay:{root:document.body}}
    :{optionalFeatures:['local-floor','bounded-floor']}
   let requested:Session|null=null
   try{
    // This call happens synchronously from the real user click before the first await.
    requested=await api.requestSession(mode,features) as Session
    if(disposed){void requested.end();return}
    renderer.xr.enabled=true
    await renderer.xr.setSession(requested as Parameters<typeof renderer.xr.setSession>[0])
    activeSession=requested
    activeSession.addEventListener('end',onSessionEnd)
    const ar=mode==='immersive-ar'
    root.scale.setScalar(ar?.29:.46)
    root.position.set(0,ar?-.48:-.45,ar?-1.45:-2.2)
    floor.visible=!ar
    scene.background=ar?null:new THREE.Color('#071321')
    renderer.setClearAlpha(ar?0:1)
    controllers=[0,1].map(index=>{
     const controller=renderer.xr.getController(index) as XRControllerGroup
     scene.add(controller)
     const beam=new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,0,-4)]),
      new THREE.LineBasicMaterial({color:0x6ee7ff,transparent:true,opacity:.78})
     )
     controller.add(beam)
     const onSelect=()=>{
      controller.updateMatrixWorld(true)
      const ray=new THREE.Raycaster()
      ray.ray.origin.setFromMatrixPosition(controller.matrixWorld)
      ray.ray.direction.set(0,0,-1).transformDirection(controller.matrixWorld)
      const hit=ray.intersectObjects([...meshById.values()].filter(mesh=>mesh.visible),false)[0]
      if(hit?.object.name){
       setSelected(hit.object.name)
       setXRStatus('Selected '+safeLabel(hit.object.name)+'. Use normal controls after exiting XR.')
      }
     }
     const onSqueeze=()=>{
      setExplode(previous=>previous>=1.65?0:Math.min(1.7,Math.round((previous+.25)*100)/100))
     }
     controller.addEventListener('select',onSelect)
     controller.addEventListener('squeeze',onSqueeze)
     return{controller,onSelect,onSqueeze,beam}
    })
    renderer.setAnimationLoop(()=>renderer.render(scene,camera))
    setXRMode(mode)
    setXRStatus(ar
     ?'AR active: a small illustrative model appears in front of you, not a world-anchored medical hologram. Use controller/select to inspect.'
     :'VR active: look around the schematic model. Trigger selects a component; squeeze cycles teardown separation.')
   }catch(err){
    if(requested&&!activeSession){try{await requested.end()}catch{}}
    resetXR()
    const name=err instanceof Error?err.name:'WebXR error'
    setXRStatus('Could not start '+(mode==='immersive-ar'?'AR':'VR')+' ('+name+'). Use regular 3D or another compatible browser/headset.')
   }
  }
  const exitXR=async()=>{
   if(!activeSession)return
   try{await activeSession.end()}catch{resetXR()}
  }
  const dispose=()=>{
    disposed=true
    if(activeSession){const oldSession=activeSession;activeSession.removeEventListener('end',onSessionEnd);activeSession=null;void oldSession.end().catch(()=>{})}
    renderer.setAnimationLoop(null)
    releaseControllers()
    cancelAnimationFrame(animationFrame)
    element.removeEventListener('pointerdown',onDown)
    element.removeEventListener('pointermove',onMove)
    element.removeEventListener('pointerup',onUp)
    element.removeEventListener('pointercancel',onUp)
    element.removeEventListener('wheel',onWheel)
    window.removeEventListener('resize',onResize)
    meshById.forEach(mesh=>(mesh.material as THREE.Material).dispose())
    geometryCache.forEach(g=>g.dispose())
    floor.geometry.dispose()
    ;(floor.material as THREE.Material).dispose()
    renderer.dispose()
    if(renderer.domElement.parentElement===element)element.removeChild(renderer.domElement)
  }
  runtime.current={draw,meshById,dispose,enterXR,exitXR}
  animationFrame=requestAnimationFrame(()=>{draw();setRenderStatus('3D scene ready • drag to orbit • tap to inspect • scroll to zoom')})
  return()=>{dispose();runtime.current=null}
 },[data,subject])

 useEffect(()=>{
  const r=runtime.current
  if(!r)return
  for(const p of layoutHoloCAD(subject,explode,new Set(detached))){
    const mesh=r.meshById.get(p.id)
    if(!mesh)continue
    mesh.position.set(...p.positionNow)
    mesh.visible=layers.includes(p.layer)&&(!revealOnly||p.id===selected)
    const mat=mesh.material as THREE.MeshStandardMaterial
    mat.emissive.setHex(p.id===selected?0x34a7ce:damaged.includes(p.id)?0x9d2525:0x000000)
    mat.emissiveIntensity=p.id===selected?.7:damaged.includes(p.id)?.42:0
    const alpha=p.opacity<1?p.opacity:1
    mat.transparent=alpha<1
    mat.opacity=alpha
  }
  r.draw()
 },[data,subject,explode,detached,selected,layers,damaged,revealOnly])

 const toggleDetached=()=>{
  setDetached(current=>current.includes(part.id)?current.filter(x=>x!==part.id):[...current,part.id])
  setStatus(detached.includes(part.id)?'Reassembled '+part.label:'Separated '+part.label+'. This changes only the model display.')
 }
 const toggleDamage=()=>{
  setDamaged(current=>current.includes(part.id)?current.filter(id=>id!==part.id):[...current,part.id])
  setStatus(damaged.includes(part.id)?'Simulated repair complete: '+part.label:'Simulated damage flagged: '+part.label+'. No real object affected.')
 }
 const reset=()=>{
  setExplode(0);setDetached([]);setDamaged([]);setRevealOnly(false)
  setLayers([...new Set(data.parts.map(p=>p.layer))])
  setStatus('Reassembled the digital teaching model. No save or gameplay mutation.')
 }
 const exportManifest=()=>{
  const manifest={
    schemaVersion:1,kind:'streetverse-holocad-illustrative',subject,
    educationalSchematic:true,
    certifiableMedicalDevice:false,certifiedVehicleRepair:false,engineeredConstructionDrawing:false,
    generatedAt:new Date().toISOString(),explosion:explode,
    detachedIds:detached,trainingDamageIds:damaged,visibleLayers:layers,
    parts:data.parts.map(({id,label,layer,shape,position,size,explode,description})=>({
      id,label,layer,shape,position,size,explode,description
    }))
  }
  const blob=new Blob([JSON.stringify(manifest,null,2)],{type:'application/json'})
  const href=URL.createObjectURL(blob)
  const link=document.createElement('a')
  link.href=href
  link.download='StreetVerse_HoloCAD_'+subject+'_schematic.json'
  document.body.appendChild(link)
  link.click();link.remove()
  window.setTimeout(()=>URL.revokeObjectURL(href),1000)
  setStatus('Exported design manifest for '+data.title+'. This is NOT a printable manufacturing file.')
 }
 const visible= data.parts.filter(p=>layers.includes(p.layer))
 return createPortal(<div role="dialog" aria-modal="true" aria-label="StreetVerse Holographic CAD living systems teardown lab"
  style={{position:'fixed',inset:0,zIndex:78000,background:'linear-gradient(150deg,#051220,#0b0d1e 70%,#12192c)',color:'#edf9ff',overflowY:'auto',padding:'max(12px,env(safe-area-inset-top)) 12px max(24px,env(safe-area-inset-bottom))',fontFamily:'system-ui'}}>
  <div style={{maxWidth:1020,margin:'0 auto'}}>
   <header style={{display:'flex',alignItems:'start',justifyContent:'space-between',gap:10}}>
    <div><div style={{fontWeight:900,fontSize:10,color:'#7de4ff',letterSpacing:2}}>STREETVERSE ENGINEERING / HOLOGRAPHIC CAD</div>
     <h2 style={{fontSize:24,margin:'4px 0'}}>🧬 LIVING SYSTEMS LAB</h2>
     <p style={{fontSize:11,color:'#b4d7ed',margin:'5px 0'}}>81 selectable parts across four original 3D schematic subjects • Chromebook/one-hand friendly</p>
    </div>
    <button aria-label="Close HoloCAD Lab" onClick={onClose} style={control}>CLOSE ×</button>
   </header>
   <div style={{display:'flex',gap:7,overflowX:'auto',padding:'12px 0'}}>
    {HOLOCAD_SUBJECT_ORDER.map(key=><button key={key} aria-pressed={subject===key} onClick={()=>setSubject(key)}
      style={{...control,minWidth:100,background:subject===key?'#14567c':'#13263b'}}>{
      key==='human'?'🧍 HUMAN':key==='canine'?'🐕 ANIMAL':key==='automobile'?'🚘 VEHICLE':'🏠 BUILDING'
    }</button>)}
   </div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,360px),1fr))',gap:12}}>
    <div style={{minWidth:0}}>
     <div style={{border:'1px solid #2d6b85',borderRadius:16,overflow:'hidden',background:'#071321'}}>
      <div ref={host} role="img" aria-label={'Interactive rotatable 3D '+data.title+' exploded diagram'} style={{height:'min(45dvh,390px)',minHeight:235,touchAction:'none',cursor:'grab'}}/>
      <div style={{fontSize:10,color:'#a6dff0',padding:9}}>{renderStatus}</div>
     </div>
     <section aria-label="HoloCAD augmented and virtual reality" style={{marginTop:10,padding:10,borderRadius:12,border:'1px solid #4fc8ed77',background:'#071b2b'}}>
      <div style={{fontWeight:900,fontSize:12,marginBottom:7}}>🥽 IMMERSIVE HOLOGRAPHIC CAD • AR / VR</div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
       <button type="button" aria-label="Enter HoloCAD augmented reality" disabled={!xrSupport.ar||Boolean(xrMode)}
        onClick={()=>{void runtime.current?.enterXR('immersive-ar')}} style={{...control,opacity:xrSupport.ar&&!xrMode?1:.5}}>📱 ENTER AR</button>
       <button type="button" aria-label="Enter HoloCAD virtual reality" disabled={!xrSupport.vr||Boolean(xrMode)}
        onClick={()=>{void runtime.current?.enterXR('immersive-vr')}} style={{...control,opacity:xrSupport.vr&&!xrMode?1:.5}}>🥽 ENTER VR</button>
       <button type="button" aria-label="Exit HoloCAD immersive session" disabled={!xrMode}
        onClick={()=>{void runtime.current?.exitXR()}} style={{...control,opacity:xrMode?1:.5}}>EXIT XR</button>
      </div>
      <div role="status" aria-label="WebXR compatibility" style={{fontSize:10,lineHeight:1.5,color:'#add8e5',marginTop:7}}>{xrSupport.reason}</div>
      <div role="status" aria-label="HoloCAD immersive session status" style={{fontSize:11,lineHeight:1.5,color:'#e5f9ff',marginTop:5}}>{xrStatus}</div>
      <div style={{fontSize:10,color:'#a3c5d2',marginTop:5}}>AR is an illustrative floating object, not depth-aware placement. In supported headsets, select a part with a trigger and change teardown distance with squeeze. Chromebook mouse/touch 3D works without XR.</div>
     </section>
     <label style={{fontWeight:900,fontSize:12,display:'block',marginTop:13}} htmlFor="holocad-teardown">EXPLODE / TEAR APART • {Math.round(explode/1.7*100)}%</label>
     <input id="holocad-teardown" type="range" min="0" max="1.7" step=".05" value={explode}
      onChange={event=>setExplode(Number(event.target.value))}
      style={{display:'block',width:'100%',height:46,touchAction:'pan-x'}}/>
     <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
      <button style={control} onClick={()=>setExplode(1.7)}>EXPLODE ALL</button>
      <button style={control} onClick={reset}>REASSEMBLE / RESET</button>
      <button style={control} onClick={exportManifest}>EXPORT PARTS MANIFEST</button>
     </div>
     <p style={{fontSize:10,color:'#9bc9dd',lineHeight:1.5}}>{data.subtitle}. Shapes are illustrative, not measured medical anatomy or certified engineering drawings.</p>
    </div>
    <section style={{minWidth:0,background:'#0c1d2c',border:'1px solid #2b5879',padding:12,borderRadius:16}}>
      <h3 style={{fontSize:16,margin:'0 0 7px'}}>{data.title} • {data.parts.length} PARTS</h3>
      <div aria-label="HoloCAD layer visibility controls" style={{display:'flex',gap:6,flexWrap:'wrap'}}>
       {layerOptions.map(layer=><button key={layer} aria-pressed={layers.includes(layer)}
        onClick={()=>setLayers(current=>current.includes(layer)?current.filter(x=>x!==layer):[...current,layer])}
        style={{...control,fontSize:10,background:layers.includes(layer)?'#175d6a':'#1b2433'}}>
        {displayLayer(layer)}</button>)}
       <button onClick={()=>setRevealOnly(v=>!v)} aria-pressed={revealOnly} style={control}>
        {revealOnly?'SHOW LAYERS':'ISOLATE PART'}</button>
      </div>
      <div style={{fontSize:10,color:'#a7cada',padding:'7px 0'}}>
       {visible.length} visible • {hiddenCount} filtered • {detached.length} detached • {damagedCount} simulated faults
      </div>
      <div aria-label="Selectable HoloCAD parts" style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:5,maxHeight:200,overflowY:'auto'}}>
       {visible.map(p=><button key={p.id} onClick={()=>setSelected(p.id)} aria-pressed={selected===p.id}
        style={{...control,textAlign:'left',fontSize:10,minHeight:45,padding:7,
          background:selected===p.id?'#145d81':'#172a3c',borderColor:damaged.includes(p.id)?'#f87171':'#39718b'}}>
        {p.label}{detached.includes(p.id)?' • OUT':''}{damaged.includes(p.id)?' • FAULT':''}
       </button>)}
      </div>
      <div style={{borderTop:'1px solid #36738a',marginTop:12,paddingTop:12}}>
       <div style={{fontSize:16,fontWeight:900}}>{part.label}</div>
       <div style={{fontSize:10,color:'#8ceaff',padding:'4px 0'}}>PART ID {part.id} • {displayLayer(part.layer)}</div>
       <p style={{fontSize:12,lineHeight:1.5,color:'#e2f0f8'}}>{part.description}</p>
       <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
        <button style={control} onClick={toggleDetached}>
         {detached.includes(part.id)?'↩ INSTALL PART':'↗ REMOVE PART'}</button>
        <button style={control} onClick={toggleDamage}>
         {damaged.includes(part.id)?'✓ SIMULATED REPAIR':'⚠ MARK FAULT'}</button>
       </div>
      </div>
      <div role="status" aria-live="polite" style={{marginTop:12,border:'1px solid #3a758b',borderRadius:10,padding:10,fontSize:11}}>
       {status}
      </div>
    </section>
   </div>
   <p style={{color:'#aac8d6',fontSize:10,lineHeight:1.55,marginTop:12}}>
    HoloCAD Living Systems: learning and game-prototyping only. No living being is scanned,
    diagnosed, physically altered or harmed. Damage and repair are reversible simulations;
    parts are not purchasable or owned inventory. For anatomical, veterinary, electrical,
    building-code or vehicle-service decisions use verified professional sources and supervision.
    VR/AR, physics, full-body rig bindings, accurate tissue simulation, manufacturing toolpaths
    and mission rewards require future validation.
   </p>
  </div>
 </div>,document.body)
}
