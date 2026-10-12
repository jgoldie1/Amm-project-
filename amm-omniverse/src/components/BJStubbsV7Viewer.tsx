import {useEffect,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {normalizeStreetVerseHumanHeight} from '../runtime/StreetVerseHumanScale'
import {resolvePublishedMeshyAsset} from '../runtime/StreetVerseMeshyAssetManifest'
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
  const proofCaptureRef=useRef<(()=>void)|null>(null)
  const photoSettledRef=useRef(false)
  const photoAppliedRef=useRef(false)
  // An automatic turntable obscures facial comparisons. Start in still frontal close-up.
  const autoRotateRef=useRef(false)
  const [status,setStatus]=useState('Loading BJ V15 face review…')
  const [bjReviewSource,setBJReviewSource]=useState<'owned'|'published'>(()=>typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('svBJModel')==='meshy'?'published':'owned')
  const [sourceNote,setSourceNote]=useState('This V15 GLB is built by TRYAMM, not Meshy.')
  const [autoRotate,setAutoRotate]=useState(false)
  const [likenessEnabled,setLikenessEnabled]=useState(true)
  const [cameraMode,setCameraMode]=useState<'full'|'face'>('face')
  const [referenceCompare,setReferenceCompare]=useState(true)
  const [modelVersion,setModelVersion]=useState('V15')
  const [advancedOpen,setAdvancedOpen]=useState(false)
  const [modelReady,setModelReady]=useState(false)
  const [renderProof,setRenderProof]=useState<{version:string;photoApplied:boolean;capturedAt:string;shots:Array<{angle:string;image:string}>}|null>(null)
  const [proofMessage,setProofMessage]=useState('Render the actual BJ GLB beside the approved photo, front and profiles.')

  useEffect(()=>{autoRotateRef.current=autoRotate},[autoRotate])

  useEffect(()=>{
    const mount=mountRef.current
    if(!mount)return
    const scene=new THREE.Scene()
    scene.background=new THREE.Color(0x05070b)
    const camera=new THREE.PerspectiveCamera(38,1,.01,100)
    camera.position.set(0,1.35,4.25)
    cameraRef.current=camera

    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true})
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
    photoSettledRef.current=false;photoAppliedRef.current=false
    modelRef.current=null;likenessHandleRef.current=null
    void (async()=>{
      let gltf:Awaited<ReturnType<typeof loader.loadAsync>>|null=null
      let loadedModel='V15'
      const candidates:Array<{name:string;url:string}>=[]
      if(bjReviewSource==='published'){
        // Read-only registry check. This does not submit or charge a Meshy task.
        const published=await resolvePublishedMeshyAsset('sv-bj-stubbs-v6','global')
        if(dead)return
        if(published?.ready&&published.url){
          candidates.push({name:'PUBLISHED MESHY',url:published.url})
          setSourceNote('Actual published Meshy GLB • compare its baked face with the reference. Source-photo accuracy has NOT been verified.')
        }else setSourceNote('No finished BJ Meshy GLB is published in the registry; showing the owned V15 fallback.')
      }else setSourceNote('This V15 GLB is built by TRYAMM, not Meshy.')
      candidates.push(...BJ_REVIEW_ASSETS)
      for(const candidate of candidates){
        try{gltf=await loader.loadAsync(candidate.url);loadedModel=candidate.name;break}catch{}
      }
      if(dead)return
      if(!gltf){setStatus('BJ GLB unavailable • V15, V12, V7 and V6 could not load');return}
      loadedModelVersionRef.current=loadedModel
      setModelVersion(loadedModel)
      if(dead)return
      const model=gltf.scene
      if(loadedModel==='PUBLISHED MESHY'){
        normalizeStreetVerseHumanHeight(model,1.82)
        // Make original Meshy bone compatibility explicit. This is a reversible
        // FACE PREVIEW adapter, NOT proof of a proper photo-UV head resculpt.
        model.userData={...model.userData,publishedOverrideActive:true,modelProvider:'published-meshy-glb',certifiedLikeness:false}
      }
      modelRef.current=model
      setModelReady(true)
      model.traverse(node=>{
        if(node instanceof THREE.Mesh){node.castShadow=true;node.receiveShadow=true}
      })
      scene.add(model)
      // A real Meshy head should use its own baked texture; overlaying
      // the small frontal portrait as a flat face would hide the true geometry.
      const photoMatch=loadedModel==='PUBLISHED MESHY'?null:installBJPhotoMatchedHead(model)
      likenessHandleRef.current=photoMatch
      photoSettledRef.current=!photoMatch
      if(photoMatch){
        void photoMatch.ready.then(ok=>{
          if(dead)return
          photoAppliedRef.current=ok;photoSettledRef.current=true
          setStatus(ok?'BJ '+loadedModelVersionRef.current+' • APPROVED FACE REFERENCE (NOT CERTIFIED)':'BJ '+loadedModelVersionRef.current+' • BASE GLB (PHOTO NOT APPLIED)')
          setLikenessEnabled(ok)
        })
      }else{
        setStatus(loadedModel==='PUBLISHED MESHY'?'PUBLISHED MESHY GLB • FACIAL LIKENESS NEEDS HUMAN APPROVAL':'BJ '+loadedModelVersionRef.current+' • BASE GLB (NO COMPATIBLE HEAD)')
        photoAppliedRef.current=false;photoSettledRef.current=true
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

    // Keep viewer-only drawing buffers valid for deterministic evidence capture.
    // The gameplay renderer still uses its normal low-memory WebGL defaults.
    proofCaptureRef.current=()=>{
      const current=modelRef.current
      if(!current||!photoSettledRef.current){setProofMessage('Wait for the loaded BJ model and reference to finish.');return}
      const previousYaw=current.rotation.y,previousCamera=camera.position.clone(),previousTarget=controls.target.clone()
      autoRotateRef.current=false;setAutoRotate(false)
      try{
        const h=modelHeightRef.current
        camera.position.set(0,h*.83,Math.max(.92,h*.62))
        controls.target.set(0,h*.83,0)
        const shots:Array<{angle:string;image:string}>=[]
        for(const [angle,yaw] of [['FRONT',0],['THREE-QUARTER',Math.PI/4],['LEFT PROFILE',Math.PI/2],['RIGHT PROFILE',-Math.PI/2]] as const){
          current.rotation.y=yaw
          controls.update()
          // First draw lets photo-facing LOD switch from portrait to real side sculpt.
          renderer.render(scene,camera)
          // Second draw captures the settled face mesh instead of the prior view.
          renderer.render(scene,camera)
          const image=renderer.domElement.toDataURL('image/png')
          if(!image.startsWith('data:image/png;base64,')||image.length<2000)throw new Error('Empty WebGL canvas capture')
          shots.push({angle,image})
        }
        setRenderProof({version:loadedModelVersionRef.current,photoApplied:photoAppliedRef.current,capturedAt:new Date().toISOString(),shots})
        setProofMessage('Four real Three.js character renders captured.')
      }catch(err){setProofMessage('WebGL proof unavailable: '+(err instanceof Error?err.message:'canvas export failed'))}
      finally{
        current.rotation.y=previousYaw;camera.position.copy(previousCamera);controls.target.copy(previousTarget);controls.update();renderer.render(scene,camera)
      }
    }

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
      proofCaptureRef.current=null
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
  },[bjReviewSource])

  const chooseBJSource=(next:'owned'|'published')=>{
    if(next===bjReviewSource)return
    setModelReady(false);setRenderProof(null);setLikenessEnabled(false)
    setProofMessage('Loading the actual '+(next==='published'?'published Meshy':'owned V15')+' GLB for front/profile comparison.')
    setBJReviewSource(next)
  }

  const toggleLikeness=()=>{
    const model=modelRef.current
    if(!model)return
    if(likenessHandleRef.current){
      likenessHandleRef.current.dispose()
      likenessHandleRef.current=null
      setLikenessEnabled(false)
      photoAppliedRef.current=false;photoSettledRef.current=true
      setStatus('BJ '+loadedModelVersionRef.current+' • BASE GLB')
      return
    }
    const handle=installBJPhotoMatchedHead(model)
    likenessHandleRef.current=handle
    photoAppliedRef.current=false;photoSettledRef.current=!handle
    if(!handle){setStatus('BJ '+loadedModelVersionRef.current+' • BASE GLB (NO COMPATIBLE HEAD)');return}
    setStatus('Loading approved BJ reference layer…')
    void handle.ready.then(ok=>{
      if(likenessHandleRef.current!==handle)return
      photoAppliedRef.current=ok;photoSettledRef.current=true
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

  return <><main data-bj-model-version={modelVersion} style={{position:'fixed',inset:0,zIndex:20000,background:'#05070b',color:'#fff',fontFamily:'system-ui,sans-serif',display:'grid',gridTemplateRows:'auto 1fr auto'}}>
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
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8,marginBottom:8}}>
        <button data-bj-owned-glb-preview="true" onClick={()=>chooseBJSource('owned')} aria-pressed={bjReviewSource==='owned'} style={{minHeight:50,border:'1px solid #79c7e4',borderRadius:12,color:'#fff',background:bjReviewSource==='owned'?'#1b5064':'#142532',fontWeight:900}}>OWNED V15 GLB</button>
        <button data-bj-actual-meshy-preview="true" onClick={()=>chooseBJSource('published')} aria-pressed={bjReviewSource==='published'} style={{minHeight:50,border:'1px solid #e5ce91',borderRadius:12,color:'#fff',background:bjReviewSource==='published'?'#4b3c21':'#30291d',fontWeight:900}}>ACTUAL MESHY GLB</button>
      </div>
      <div data-bj-model-provenance="true" role="status" aria-live="polite" style={{padding:'2px 3px 8px',fontSize:10,color:'#bdccdb'}}>{sourceNote}</div>
      {bjReviewSource==='published'&&modelVersion==='PUBLISHED MESHY'&&
        <button data-bj-apply-approved-face-meshy="true" onClick={toggleLikeness} style={{width:'100%',minHeight:50,marginBottom:8,borderRadius:12,border:'2px solid #f4d087',background:likenessEnabled?'#40381d':'#163c32',color:'#fff',fontWeight:900}}>
          {likenessEnabled?'REMOVE APPROVED FACE PREVIEW':'APPLY BJ APPROVED FACE • PREVIEW'}
        </button>}
      {bjReviewSource==='published'&&modelVersion==='PUBLISHED MESHY'&&<p style={{fontSize:10,color:'#d2b9a0',margin:'0 2px 8px'}}>Face placement follows compatible Meshy Head bones. Alignment is approximate; compare front and both sides before approving. A proper UV face texture and sculpt are still needed for AAA fidelity.</p>}
      <div data-bj-face-angle-quick-controls="true" style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>
        <button data-bj-face-front="true" onClick={()=>{setCamera('face');view(0)}} aria-label="BJ face front portrait view" style={{minHeight:50,border:'1px solid #66513a',borderRadius:12,background:cameraMode==='face'?'#3a2917':'#10161f',color:'#fff',fontWeight:950}}>FACE • FRONT</button>
        <button data-bj-face-left="true" onClick={()=>{setCamera('face');view(Math.PI/2)}} aria-label="BJ face left profile" style={{minHeight:50,border:'1px solid #66513a',borderRadius:12,background:'#10161f',color:'#fff',fontWeight:950}}>LEFT PROFILE</button>
        <button data-bj-face-right="true" onClick={()=>{setCamera('face');view(-Math.PI/2)}} aria-label="BJ face right profile" style={{minHeight:50,border:'1px solid #66513a',borderRadius:12,background:'#10161f',color:'#fff',fontWeight:950}}>RIGHT PROFILE</button>
        <button data-bj-face-full="true" onClick={()=>{setCamera('full');view(0)}} aria-label="BJ full body" style={{minHeight:50,border:'1px solid #4c6d8d',borderRadius:12,background:cameraMode==='full'?'#14324c':'#10161f',color:'#fff',fontWeight:950}}>FULL BODY</button>
      </div>
      <button data-bj-render-comparison="true" disabled={!modelReady} onClick={()=>proofCaptureRef.current?.()} aria-label="Capture actual BJ GLB front and side view comparison" style={{width:'100%',minHeight:52,marginTop:8,border:'2px solid #84dafa',borderRadius:12,background:'#1a435a',color:'#fff',fontWeight:950,opacity:modelReady?1:.55}}>📸 RENDER REAL 3D FACE COMPARISON</button>
      <div role="status" aria-live="polite" style={{fontSize:10,color:'#b6cad8',padding:'5px 3px'}}>{proofMessage}</div>
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
  {renderProof&&createPortal(<section data-bj-render-proof="true" role="dialog" aria-label="BJ Stubbs rendered GLB reference comparison" aria-modal="true" style={{position:'fixed',inset:0,zIndex:2147483000,isolation:'isolate',overscrollBehavior:'contain',overflowY:'auto',background:'#060b13',color:'#fff',padding:'max(12px,env(safe-area-inset-top)) 12px max(20px,env(safe-area-inset-bottom))',fontFamily:'system-ui'}}>
   <div style={{maxWidth:900,margin:'0 auto'}}>
    <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,marginBottom:12}}><div><strong>BJ STUBBS • REAL 3D RENDER PROOF</strong><small style={{display:'block',color:'#aac5d5'}}>GLB {renderProof.version} • Four fixed camera angles • {renderProof.capturedAt}</small></div><button onClick={()=>setRenderProof(null)} data-bj-proof-close="true" style={{minWidth:60,minHeight:50,color:'#fff',border:'1px solid #87dcfb',borderRadius:10,background:'#1b4054'}}>CLOSE</button></header>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:9,marginBottom:10}}><div style={{border:'1px solid #9e875a',borderRadius:12,padding:8,background:'#111c25'}}><img src={BJ_PHOTOMATCH_TEXTURE_DATA_URI} alt="Approved original BJ portrait reference image" style={{width:'100%',maxHeight:170,objectFit:'contain'}}/><b style={{display:'block',fontSize:11}}>APPROVED FRONT REFERENCE</b><small style={{fontSize:10}}>Low-resolution photo; no side photos provided</small></div><div style={{padding:11,border:'1px solid #59778d',borderRadius:12,background:'#172536',fontSize:11,lineHeight:1.6}}><b>RENDER FACTS</b><div>Actual GLB: {renderProof.version}</div><div>Photo layer: {renderProof.photoApplied?'Applied':'Not applied'}</div><div>Capture: Three.js WebGLRenderer</div><div>Angles: front, ¾, left, right</div><div>Not a certified photoreal likeness.</div></div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:9}}>{renderProof.shots.map(shot=><article key={shot.angle} data-bj-rendered-angle={shot.angle} style={{minWidth:0,background:'#132130',border:'1px solid #46617b',borderRadius:12,overflow:'hidden'}}><img src={shot.image} alt={'Actual BJ GLB rendered '+shot.angle+' view'} style={{width:'100%',aspectRatio:'3/4',objectFit:'contain',display:'block'}}/><div style={{padding:8,display:'flex',alignItems:'center',justifyContent:'space-between',gap:5}}><b style={{fontSize:10}}>{shot.angle}</b><a href={shot.image} download={'BJ-'+renderProof.version+'-'+shot.angle+'.png'} style={{fontSize:10,minHeight:40,display:'inline-flex',alignItems:'center',border:'1px solid #7da8bd',borderRadius:9,padding:'0 10px',color:'#fff',background:'#1d465c'}}>SAVE PNG</a></div></article>)}</div>
    <p style={{fontSize:11,color:'#b0bece'}}>Compare jawline, eyes, nose, beard shape and long locs. The frontal reference does not independently verify the side profiles. This is not a certified photoreal likeness.</p>
   </div>
  </section>,document.body)}</>
}
