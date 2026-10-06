import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

const V7_URL='/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V7.glb'

export default function BJStubbsV7Viewer({onClose}:{onClose:()=>void}){
  const mountRef=useRef<HTMLDivElement|null>(null)
  const modelRef=useRef<THREE.Object3D|null>(null)
  const cameraRef=useRef<THREE.PerspectiveCamera|null>(null)
  const controlsRef=useRef<OrbitControls|null>(null)
  const [status,setStatus]=useState('Loading BJ V7…')
  const [autoRotate,setAutoRotate]=useState(true)

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
    renderer.toneMappingExposure=1.15
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2))
    renderer.shadowMap.enabled=true
    mount.appendChild(renderer.domElement)

    const controls=new OrbitControls(camera,renderer.domElement)
    controls.enableDamping=true
    controls.target.set(0,1.05,0)
    controls.minDistance=1.25
    controls.maxDistance=8
    controls.enablePan=false
    controlsRef.current=controls

    scene.add(new THREE.HemisphereLight(0xf4f7ff,0x18202a,2.35))
    const key=new THREE.DirectionalLight(0xffffff,3.2)
    key.position.set(3.4,5.1,4.5);key.castShadow=true;scene.add(key)
    const rim=new THREE.DirectionalLight(0x75a7ff,1.65)
    rim.position.set(-4,3,-3);scene.add(rim)
    const fill=new THREE.DirectionalLight(0xffd7b5,1.25)
    fill.position.set(-2,2,4);scene.add(fill)

    const floor=new THREE.Mesh(
      new THREE.CircleGeometry(2.1,72),
      new THREE.MeshStandardMaterial({color:0x101720,roughness:.9,metalness:.05})
    )
    floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor)

    const loader=new GLTFLoader()
    let dead=false
    loader.load(V7_URL,gltf=>{
      if(dead)return
      const model=gltf.scene
      modelRef.current=model
      model.traverse(node=>{
        if(node instanceof THREE.Mesh){node.castShadow=true;node.receiveShadow=true}
      })
      scene.add(model)
      const box=new THREE.Box3().setFromObject(model)
      const size=box.getSize(new THREE.Vector3())
      const center=box.getCenter(new THREE.Vector3())
      model.position.sub(center)
      model.position.y+=size.y*.5
      floor.position.y=.002
      const radius=Math.max(size.x,size.y,size.z)
      camera.position.set(0,size.y*.56,Math.max(2.15,radius*2.15))
      controls.target.set(0,size.y*.53,0)
      controls.update()
      setStatus('BJ V7 • LIVE PRODUCTION GLB')
    },undefined,error=>{
      console.error(error)
      setStatus('Could not load BJ V7 GLB')
    })

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
      if(modelRef.current&&autoRotate)modelRef.current.rotation.y+=.0035
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
      renderer.domElement.remove()
      modelRef.current=null
      cameraRef.current=null
      controlsRef.current=null
    }
  },[autoRotate])

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
        <h1 style={{fontSize:'clamp(20px,6vw,30px)',margin:'3px 0 0'}}>BJ Stubbs V7 — Real GLB Viewer</h1>
      </div>
      <button onClick={onClose} aria-label="Close BJ viewer" style={{minWidth:44,minHeight:44,borderRadius:999,border:'1px solid #3e4b5d',background:'#111722',color:'#fff',fontSize:22}}>×</button>
    </header>

    <section style={{position:'relative',minHeight:0}}>
      <div ref={mountRef} style={{position:'absolute',inset:0,touchAction:'none'}}/>
      <div style={{position:'absolute',left:10,top:10,padding:'7px 10px',borderRadius:999,background:'#09111dcc',border:'1px solid #2f4359',fontSize:10,fontWeight:900}}>{status}</div>
      <div style={{position:'absolute',right:10,top:10,padding:'7px 10px',borderRadius:999,background:'#09111dcc',border:'1px solid #2f4359',fontSize:9,color:'#a9bbcc'}}>drag to rotate • pinch to zoom</div>
    </section>

    <footer style={{padding:'10px 10px max(12px,env(safe-area-inset-bottom))',borderTop:'1px solid #243042',background:'#070b11'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:7}}>
        {[
          ['FRONT',0],
          ['LEFT',Math.PI/2],
          ['BACK',Math.PI],
          ['RIGHT',-Math.PI/2],
        ].map(([label,yaw])=><button key={String(label)} onClick={()=>view(Number(yaw))} style={{minHeight:44,border:'1px solid #32445a',borderRadius:12,background:'#0d1520',color:'#fff',fontWeight:900,fontSize:10}}>{label}</button>)}
      </div>
      <button onClick={()=>setAutoRotate(v=>!v)} style={{width:'100%',minHeight:46,marginTop:8,border:'1px solid #4c6d8d',borderRadius:12,background:autoRotate?'#14324c':'#10161f',color:'#fff',fontWeight:950}}>
        {autoRotate?'AUTO ROTATE: ON':'AUTO ROTATE: OFF'}
      </button>
      <div style={{fontSize:9,color:'#93a7b8',lineHeight:1.45,marginTop:8}}>
        This viewer loads the exact production file <b>SV_HERO_BJ_STUBBS_V7.glb</b>. It is the owned TRYAMM procedural BJ V7 model, not a certified photoreal likeness.
      </div>
    </footer>
  </main>
}
