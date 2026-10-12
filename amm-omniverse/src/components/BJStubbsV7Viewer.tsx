import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {BJ_PHOTOMATCH_TEXTURE_DATA_URI,installBJPhotoMatchedHead,type BJPhotoMatchedHeadHandle} from '../runtime/StreetVerseBJPhotoMatchRuntime'

const BJ_REVIEW_ASSETS=[
 {name:'V15',url:'/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V15.glb'},
 {name:'V12',url:'/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V12.glb'},
 {name:'V7',url:'/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V7.glb'},
 {name:'V6',url:'/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V6.glb'},
] as const

export default function BJStubbsV7Viewer({onClose}:{onClose:()=>void}){
  const mountRef=useRef<HTMLDivElement|null>(null)
  const modelRef=useRef<THREE.Object3D|null>(null)
  const cameraRef=useRef<THREE.PerspectiveCamera|null>(null)
  const controlsRef=useRef<OrbitControls|null>(null)
  const likenessHandleRef=useRef<BJPhotoMatchedHeadHandle|null>(null)
  const modelHeightRef=useRef(1.88)
  const loadedModelVersionRef=useRef('V15')
  // An automatic turntable obscures facial comparisons. Start in still frontal close-up.
  const autoRotateRef=useRef(false)
  const [status,setStatus]=useState('Loading BJ V15 face review…')
  const [autoRotate,setAutoRotate]=useState(false)
  const [likenessEnabled,setLikenessEnabled]=useState(true)
  const [cameraMode,setCameraMode]=useState<'full'|'face'>('face')
  const [referenceCompare,setReferenceCompare]=useState(true)
  const [modelVersion,setModelVersion]=useState('V15')
  const [advancedOpen,setAdvancedOpen]=useState(false)

  useEffect(()=>{autoRotateRef.current=autoRotate},[autoRotate])

  useEffect(()=>{
    const mount=mountRef.current
    if(!mount)return
    const scene=new THREE.Scene()
    scene.background=new THREE.Color(0x05070b)
    const camera=new THREE.PerspectiveCamera(38,1,.01,100)
    camera.position.set(0,1.35,4.25)
    cameraRef.current=camera

    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false})
    renderer.outputColorSpace=THREE.SRGBColorSpace
    renderer.toneMapping=THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure=1.02
    // Keep this likeness preview usable on older iPhones without raising GPU memory pressure.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,window.innerWidth<768?1.35:2))
    renderer.shadowMap.enabled=true
    mount.appendChild(renderer.domElement)

    const controls=new OrbitControls(camera,renderer.domElement)
    controls.enableDamping=true
    controls.target.set(0,1.05,0)
    controls.minDistance=1.25
    controls.maxDistance=8
    controls.enablePan=false
    controlsRef.current=controls

    scene.add(new THREE.HemisphereLight(0xf4f7ff,0x18202a,1.20))
    const key=new THREE.DirectionalLight(0xffffff,2.4)
    key.position.set(3.4,5.1,4.5);key.castShadow=true;scene.add(key)
    const rim=new THREE.DirectionalLight(0x96b9df,.70)
    rim.position.set(-4,3,-3);scene.add(rim)
    const fill=new THREE.DirectionalLight(0xffdfc7,.68)
    fill.position.set(-2,2,4);scene.add(fill)

    const floor=new THREE.Mesh(
      new THREE.CircleGeometry(2.1,72),
      new THREE.MeshStandardMaterial({color:0x101720,roughness:.9,metalness:.05})
    )
    floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor)

    const loader=new GLTFLoader()
    let dead=false
    void (async()=>{
      let gltf:Awaited<ReturnType<typeof loader.loadAsync>>|null=null
      let loadedModel='V15'
      for(const candidate of BJ_REVIEW_ASSETS){
        try{gltf=await loader.loadAsync(candidate.url);loadedModel=candidate.name;break}catch{}
      }
      if(dead)return
      if(!gltf){setStatus('BJ GLB unavailable • V15, V12, V7 and V6 could not load');return}
      loadedModelVersionRef.current=loadedModel
      setModelVersion(loadedModel)
      if(dead)return
      const model=gltf.scene
      modelRef.current=model
      model.traverse(node=>{
        if(node instanceof THREE.Mesh){node.castShadow=true;node.receiveShadow=true}
      })
      scene.add(model)
      const photoMatch=installBJPhotoMatchedHead(model)
      likenessHandleRef.current=photoMatch
      if(photoMatch){
        void photoMatch.ready.then(ok=>{
          if(dead)return
          setStatus(ok?'BJ '+loadedModelVersionRef.current+' • APPROVED FACE REFERENCE (NOT CERTIFIED)':'BJ '+loadedModelVersionRef.current+' • BASE GLB (PHOTO NOT APPLIED)')
          setLikenessEnabled(ok)
        })
      }else{
        setStatus('BJ '+loadedModelVersionRef.current+' • BASE GLB (NO COMPATIBLE HEAD)')
        setLikenessEnabled(false)
      }
      const box=new THREE.Box3().setFromObject(model)
      const size=box.getSize(new THREE.Vector3())
      modelHeightRef.current=Math.max(1,size.y)
      const center=box.getCenter(new THREE.Vector3())
      model.position.sub(center)
      model.position.y+=size.y*.5
      floor.position.y=.002
      // Face photo review is the default; full-body mode remains a single tap away.
      camera.position.set(0,size.y*.83,Math.max(.92,size.y*.62))
      controls.target.set(0,size.y*.83,0)
      controls.update()
    })()

    const resize=()=>{
      const rect=mount.getBoundingClientRect()
      const w=Math.max(1,rect.width),h=Math.max(1,rect.height)
      renderer.setSize(w,h,false)
      camera.aspect=w/h
      camera.updateProjectionMatrix()
    }
    resize()
    const observer=new ResizeObserver(resize);observer.observe(mount)

    let frame=0
    const animate=()=>{
      frame=requestAnimationFrame(animate)
      if(modelRef.current&&autoRotateRef.current)modelRef.current.rotation.y+=.0035
      controls.update()
      renderer.render(scene,camera)
    }
    animate()

    return()=>{
      dead=true
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.dispose()
      renderer.dispose()
      scene.traverse(node=>{
        if(node instanceof THREE.Mesh){
          node.geometry?.dispose()
          const mats=Array.isArray(node.material)?node.material:[node.material]
          mats.forEach(m=>m.dispose())
        }
      })
      likenessHandleRef.current?.dispose()
      likenessHandleRef.current=null
      renderer.domElement.remove()
      modelRef.current=null
      cameraRef.current=null
      controlsRef.current=null
    }
  },[])

  const toggleLikeness=()=>{
    const model=modelRef.current
    if(!model)return
    if(likenessHandleRef.current){
      likenessHandleRef.current.dispose()
      likenessHandleRef.current=null
      setLikenessEnabled(false)
      setStatus('BJ '+loadedModelVersionRef.current+' • BASE GLB')
      return
    }
    const handle=installBJPhotoMatchedHead(model)
    likenessHandleRef.current=handle
    if(!handle){setStatus('BJ '+loadedModelVersionRef.current+' • BASE GLB (NO COMPATIBLE HEAD)');return}
    setStatus('Loading approved BJ reference layer…')
    void handle.ready.then(ok=>{
      setLikenessEnabled(ok)
      setStatus(ok?'BJ '+loadedModelVersionRef.current+' • APPROVED FACE REFERENCE (NOT CERTIFIED)':'BJ '+loadedModelVersionRef.current+' • BASE GLB (PHOTO NOT APPLIED)')
    })
  }

  const setCamera=(mode:'full'|'face')=>{
    const camera=cameraRef.current,controls=controlsRef.current
    if(!camera||!controls)return
    const h=modelHeightRef.current
    setCameraMode(mode)
    setAutoRotate(false)
    if(mode==='face'){
      controls.target.set(0,h*.83,0)
      camera.position.set(0,h*.83,Math.max(.92,h*.62))
    }else{
      controls.target.set(0,h*.53,0)
      camera.position.set(0,h*.56,Math.max(2.15,h*1.18))
    }
    controls.update()
  }

  const view=(yaw:number)=>{
    const model=modelRef.current
    const camera=cameraRef.current
    const controls=controlsRef.current
    if(!model||!camera||!controls)return
    model.rotation.y=yaw
    setAutoRotate(false)
    controls.update()
  }

  return <main style={{position:'fixed',inset:0,zIndex:20000,background:'#05070b',color:'#fff',fontFamily:'system-ui,sans-serif',display:'grid',gridTemplateRows:'auto 1fr auto'}}>
    <header style={{padding:'max(12px,env(safe-area-inset-top)) 12px 10px',display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',borderBottom:'1px solid #243042'}}>
      <div>
        <div style={{fontSize:10,letterSpacing:2.5,fontWeight:900,color:'#78d7ff'}}>TRYAMM STREETVERSE</div>
        <h1 style={{fontSize:'clamp(20px,6vw,30px)',margin:'3px 0 0'}}>BJ Stubbs {modelVersion} — Face Review</h1>
      </div>
      <button onClick={onClose} aria-label="Close BJ viewer" style={{minWidth:44,minHeight:44,borderRadius:999,border:'1px solid #3e4b5d',background:'#111722',color:'#fff',fontSize:22}}>×</button>
    </header>

    <section style={{position:'relative',minHeight:0}}>
      <div ref={mountRef} style={{position:'absolute',inset:0,touchAction:'none'}}/>
      <div role="status" aria-live="polite" style={{position:'absolute',left:10,top:10,maxWidth:'68%',padding:'7px 10px',borderRadius:999,background:'#09111dcc',border:'1px solid #2f4359',fontSize:10,fontWeight:900}}>{status}</div>
      <div style={{position:'absolute',right:10,top:10,padding:'7px 10px',borderRadius:999,background:'#09111dcc',border:'1px solid #2f4359',fontSize:9,color:'#a9bbcc'}}>drag to rotate • pinch to zoom</div>
      {referenceCompare&&<div style={{position:'absolute',right:10,bottom:10,width:'min(34vw,150px)',borderRadius:16,overflow:'hidden',border:'1px solid #8c6a42',background:'#090c12dd',boxShadow:'0 10px 30px #000a'}}>
        <img src={BJ_PHOTOMATCH_TEXTURE_DATA_URI} alt="Approved current-era BJ reference" style={{display:'block',width:'100%',height:'auto'}}/>
        <div style={{padding:'6px 7px',fontSize:8,lineHeight:1.25,color:'#d7c4a5'}}>APPROVED CURRENT-ERA REFERENCE</div>
      </div>}
    </section>

    <footer style={{padding:'8px 10px max(12px,env(safe-area-inset-bottom))',borderTop:'1px solid #243042',background:'#070b11',maxHeight:'min(58vh,420px)',overflowY:'auto'}}>
      <div data-bj-face-angle-quick-controls="true" style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>
        <button data-bj-face-front="true" onClick={()=>{setCamera('face');view(0)}} aria-label="BJ face front portrait view" style={{minHeight:50,border:'1px solid #66513a',borderRadius:12,background:cameraMode==='face'?'#3a2917':'#10161f',color:'#fff',fontWeight:950}}>FACE • FRONT</button>
        <button data-bj-face-left="true" onClick={()=>{setCamera('face');view(Math.PI/2)}} aria-label="BJ face left profile" style={{minHeight:50,border:'1px solid #66513a',borderRadius:12,background:'#10161f',color:'#fff',fontWeight:950}}>LEFT PROFILE</button>
        <button data-bj-face-right="true" onClick={()=>{setCamera('face');view(-Math.PI/2)}} aria-label="BJ face right profile" style={{minHeight:50,border:'1px solid #66513a',borderRadius:12,background:'#10161f',color:'#fff',fontWeight:950}}>RIGHT PROFILE</button>
        <button data-bj-face-full="true" onClick={()=>{setCamera('full');view(0)}} aria-label="BJ full body" style={{minHeight:50,border:'1px solid #4c6d8d',borderRadius:12,background:cameraMode==='full'?'#14324c':'#10161f',color:'#fff',fontWeight:950}}>FULL BODY</button>
      </div>
      <button data-bj-compare-reference="true" onClick={()=>setReferenceCompare(v=>!v)} style={{width:'100%',minHeight:48,marginTop:8,border:'1px solid #9a7548',borderRadius:12,background:referenceCompare?'#49371e':'#10161f',color:'#fff',fontWeight:950}}>{referenceCompare?'HIDE ORIGINAL FACE PHOTO':'COMPARE WITH ORIGINAL FACE PHOTO'}</button>
      <button aria-expanded={advancedOpen} aria-controls="bj-viewer-advanced-controls" onClick={()=>setAdvancedOpen(v=>!v)} style={{width:'100%',minHeight:46,marginTop:8,border:'1px solid #4c6d8d',borderRadius:12,background:'#0d1d29',color:'#dff6ff',fontWeight:950}}>
        {advancedOpen?'HIDE CAMERA + LIKENESS OPTIONS ▲':'MORE VIEWS + LIKENESS OPTIONS ▼'}
      </button>
      {advancedOpen&&<div id="bj-viewer-advanced-controls" style={{display:'grid',gap:8,marginTop:8}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:7}}>
          {([
            ['FRONT',0],
            ['¾ LEFT',Math.PI/4],
            ['¾ RIGHT',-Math.PI/4],
            ['BACK',Math.PI],
          ] as const).map(([label,yaw])=><button key={label} onClick={()=>view(yaw)} style={{minHeight:44,border:'1px solid #32445a',borderRadius:12,background:'#0d1520',color:'#fff',fontWeight:900,fontSize:10}}>{label}</button>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7}}>
          <button onClick={()=>view(Math.PI/2)} style={{minHeight:44,border:'1px solid #32445a',borderRadius:12,background:'#0d1520',color:'#fff',fontWeight:900,fontSize:10}}>LEFT PROFILE</button>
          <button onClick={()=>view(-Math.PI/2)} style={{minHeight:44,border:'1px solid #32445a',borderRadius:12,background:'#0d1520',color:'#fff',fontWeight:900,fontSize:10}}>RIGHT PROFILE</button>
        </div>
        <button onClick={toggleLikeness} style={{width:'100%',minHeight:48,border:'1px solid #9a7548',borderRadius:12,background:likenessEnabled?'#4a341b':'#10161f',color:'#fff',fontWeight:950}}>
          {likenessEnabled?'BJ REFERENCE LIKENESS: ON':'BJ REFERENCE: OFF (BASE '+modelVersion+')'}
        </button>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7}}>
          <button onClick={()=>setAutoRotate(v=>!v)} style={{minHeight:46,border:'1px solid #4c6d8d',borderRadius:12,background:autoRotate?'#14324c':'#10161f',color:'#fff',fontWeight:950}}>{autoRotate?'AUTO ROTATE: ON':'AUTO ROTATE: OFF'}</button>
          <button onClick={()=>setReferenceCompare(v=>!v)} style={{minHeight:46,border:'1px solid #9a7548',borderRadius:12,background:referenceCompare?'#4a341b':'#10161f',color:'#fff',fontWeight:950}}>{referenceCompare?'REFERENCE: ON':'REFERENCE: OFF'}</button>
        </div>
        <div style={{fontSize:10,color:'#93a7b8',lineHeight:1.45}}>
          <b>BJ {modelVersion} FACE REVIEW</b> compares the same V15-first model used by StreetVerse with the approved current-era photo when the GLB has a compatible head pivot. This is not a certified photoreal likeness. Check FRONT, ¾ and both profiles.
        </div>
      </div>}
    </footer>
  </main>
}
