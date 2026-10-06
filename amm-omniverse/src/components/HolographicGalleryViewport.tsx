import {useEffect,useRef} from 'react'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

type Props={assetUrl?:string;title:string}

function disposeObject(root:THREE.Object3D){
  root.traverse(node=>{
    if(!(node instanceof THREE.Mesh))return
    node.geometry?.dispose()
    const materials=Array.isArray(node.material)?node.material:[node.material]
    for(const material of materials){
      if(!material)continue
      for(const value of Object.values(material as unknown as Record<string,unknown>)){
        if(value instanceof THREE.Texture)value.dispose()
      }
      material.dispose()
    }
  })
}

export default function HolographicGalleryViewport({assetUrl,title}:Props){
  const mountRef=useRef<HTMLDivElement|null>(null)

  useEffect(()=>{
    const mount=mountRef.current
    if(!mount)return
    let cancelled=false
    let raf=0
    const renderer=new THREE.WebGLRenderer({antialias:false,alpha:true,powerPreference:'default'})
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.35))
    renderer.outputColorSpace=THREE.SRGBColorSpace
    renderer.toneMapping=THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure=1.15
    mount.innerHTML=''
    mount.appendChild(renderer.domElement)

    const scene=new THREE.Scene()
    scene.background=new THREE.Color(0x030811)
    scene.fog=new THREE.Fog(0x030811,8,24)

    // Native holographic ambient/screensaver layer. Keeps the gallery alive even
    // when no exhibit is selected, without adding another rendering dependency.
    const particleCount=420
    const particlePositions=new Float32Array(particleCount*3)
    for(let i=0;i<particleCount;i++){
      const r=4+Math.random()*10
      const a=Math.random()*Math.PI*2
      const y=-1+Math.random()*8
      particlePositions[i*3]=Math.cos(a)*r
      particlePositions[i*3+1]=y
      particlePositions[i*3+2]=Math.sin(a)*r
    }
    const particleGeometry=new THREE.BufferGeometry()
    particleGeometry.setAttribute('position',new THREE.BufferAttribute(particlePositions,3))
    const particleMaterial=new THREE.PointsMaterial({color:0x64eaff,size:.035,transparent:true,opacity:.62,depthWrite:false})
    const particles=new THREE.Points(particleGeometry,particleMaterial)
    particles.name='holo-gallery-ambient-particles'
    scene.add(particles)

    const grid=new THREE.GridHelper(22,44,0x195f78,0x0b2636)
    grid.position.y=.01
    ;(grid.material as THREE.Material).transparent=true
    ;(grid.material as THREE.Material).opacity=.28
    scene.add(grid)

    const screenRingA=new THREE.Mesh(new THREE.TorusGeometry(4.1,.018,8,96),new THREE.MeshBasicMaterial({color:0x2edbff,transparent:true,opacity:.28}))
    screenRingA.rotation.x=Math.PI/2;screenRingA.position.y=1.8;scene.add(screenRingA)
    const screenRingB=new THREE.Mesh(new THREE.TorusGeometry(5.3,.014,8,96),new THREE.MeshBasicMaterial({color:0xc34cff,transparent:true,opacity:.18}))
    screenRingB.rotation.x=Math.PI/2;screenRingB.position.y=2.25;scene.add(screenRingB)

    const scanPlane=new THREE.Mesh(new THREE.PlaneGeometry(11,.36),new THREE.MeshBasicMaterial({color:0x6beeff,transparent:true,opacity:.055,side:THREE.DoubleSide,depthWrite:false}))
    scanPlane.position.set(0,.35,-2.8);scene.add(scanPlane)
    const camera=new THREE.PerspectiveCamera(46,1,.05,50)
    camera.position.set(4.8,3.2,5.8)

    const controls=new OrbitControls(camera,renderer.domElement)
    controls.enableDamping=true
    controls.enablePan=false
    controls.minDistance=2.2
    controls.maxDistance=11
    controls.target.set(0,1.25,0)
    controls.autoRotate=true
    controls.autoRotateSpeed=.8

    scene.add(new THREE.HemisphereLight(0xa9eaff,0x160c24,2.2))
    const key=new THREE.DirectionalLight(0xffffff,2.1);key.position.set(4,8,5);scene.add(key)
    const rim=new THREE.PointLight(0x46ecff,18,12);rim.position.set(-3,3,-2);scene.add(rim)
    const magenta=new THREE.PointLight(0xff49d7,12,10);magenta.position.set(3,2,-3);scene.add(magenta)

    const pedestal=new THREE.Mesh(
      new THREE.CylinderGeometry(1.55,1.8,.35,48),
      new THREE.MeshStandardMaterial({color:0x071725,metalness:.65,roughness:.25,emissive:0x073b52,emissiveIntensity:.65}),
    )
    pedestal.position.y=.18
    scene.add(pedestal)

    const ring1=new THREE.Mesh(new THREE.TorusGeometry(1.8,.035,10,64),new THREE.MeshBasicMaterial({color:0x54eaff,transparent:true,opacity:.8}))
    ring1.rotation.x=Math.PI/2;ring1.position.y=.42;scene.add(ring1)
    const ring2=new THREE.Mesh(new THREE.TorusGeometry(2.25,.025,10,64),new THREE.MeshBasicMaterial({color:0xff4bd8,transparent:true,opacity:.45}))
    ring2.rotation.x=Math.PI/2;ring2.position.y=.44;scene.add(ring2)

    const displayRoot=new THREE.Group()
    scene.add(displayRoot)

    const fallback=()=>{
      const core=new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.15,2),
        new THREE.MeshStandardMaterial({color:0x173d58,emissive:0x18bce8,emissiveIntensity:1.2,metalness:.55,roughness:.22,transparent:true,opacity:.9}),
      )
      core.position.y=1.75
      displayRoot.add(core)
      const halo=new THREE.Mesh(new THREE.TorusGeometry(1.55,.055,12,72),new THREE.MeshBasicMaterial({color:0x76efff,transparent:true,opacity:.72}))
      halo.position.y=1.75;halo.rotation.x=Math.PI/2.5;displayRoot.add(halo)
    }

    const fit=(object:THREE.Object3D)=>{
      object.updateMatrixWorld(true)
      const box=new THREE.Box3().setFromObject(object)
      const size=new THREE.Vector3();box.getSize(size)
      const max=Math.max(size.x,size.y,size.z)
      if(max>0){
        const scale=Math.min(3.4/max,8)
        object.scale.setScalar(scale)
      }
      object.updateMatrixWorld(true)
      const adjusted=new THREE.Box3().setFromObject(object)
      const center=new THREE.Vector3();adjusted.getCenter(center)
      object.position.x-=center.x
      object.position.z-=center.z
      object.position.y+=.42-adjusted.min.y
    }

    if(assetUrl){
      new GLTFLoader().load(assetUrl,gltf=>{
        if(cancelled){disposeObject(gltf.scene);return}
        fit(gltf.scene)
        gltf.scene.traverse(node=>{
          if(node instanceof THREE.Mesh){
            node.castShadow=false
            node.receiveShadow=true
            node.frustumCulled=true
          }
        })
        displayRoot.add(gltf.scene)
        window.dispatchEvent(new CustomEvent('tryamm:holographic-gallery-model-ready',{detail:{title,assetUrl}}))
      },undefined,()=>fallback())
    }else fallback()

    const resize=()=>{
      const w=Math.max(1,mount.clientWidth),h=Math.max(1,mount.clientHeight)
      renderer.setSize(w,h,false)
      camera.aspect=w/h
      camera.updateProjectionMatrix()
    }
    const ro=new ResizeObserver(resize);ro.observe(mount);resize()

    const animate=()=>{
      raf=requestAnimationFrame(animate)
      const t=performance.now()*.001
      particles.rotation.y=t*.028
      particles.rotation.x=Math.sin(t*.09)*.035
      grid.rotation.y=Math.sin(t*.05)*.02
      screenRingA.rotation.z=t*.045
      screenRingB.rotation.z=-t*.032
      scanPlane.position.y=.5+((t*.52)%4.8)
      scanPlane.material.opacity=.035+Math.sin(t*2.1)*.015
      if(!assetUrl){camera.position.x=4.8+Math.sin(t*.18)*.6;camera.position.z=5.8+Math.cos(t*.16)*.7}
      ring1.rotation.z=t*.35
      ring2.rotation.z=-t*.22
      rim.intensity=15+Math.sin(t*1.7)*3
      controls.update()
      renderer.render(scene,camera)
    }
    animate()

    return()=>{
      cancelled=true
      cancelAnimationFrame(raf)
      ro.disconnect()
      controls.dispose()
      disposeObject(displayRoot)
      pedestal.geometry.dispose();(pedestal.material as THREE.Material).dispose()
      ring1.geometry.dispose();(ring1.material as THREE.Material).dispose()
      ring2.geometry.dispose();(ring2.material as THREE.Material).dispose()
      particleGeometry.dispose();particleMaterial.dispose()
      grid.geometry.dispose();(grid.material as THREE.Material).dispose()
      screenRingA.geometry.dispose();(screenRingA.material as THREE.Material).dispose()
      screenRingB.geometry.dispose();(screenRingB.material as THREE.Material).dispose()
      scanPlane.geometry.dispose();(scanPlane.material as THREE.Material).dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  },[assetUrl,title])

  return <div ref={mountRef} role="img" aria-label={'Interactive holographic 3D preview: '+title} style={{width:'100%',height:'clamp(260px,42vw,430px)',borderRadius:18,overflow:'hidden',border:'1px solid #31566e',background:'radial-gradient(circle,#50e7ff22,#07101a 52%,#02050a)'}}/>
}
