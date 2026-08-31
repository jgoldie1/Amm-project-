import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  ensureOmniverseGenesis,
  loadOmniverseEconomy,
  OMNIVERSE_DEMO_ASSETS,
  recordMissionReward,
  recordPurchase,
  recordRental,
  recordSponsorReward,
  resetOmniverseEconomy,
  type OmniverseEconomySnapshot,
} from '../runtime/OmniverseAssetLedger'

const SAVE_KEY='tryamm.streetverse3d.v3'
const WORLD=170
const START={x:0,z:48}

const checkpoints=[
  {id:'welcome',label:'District Welcome',x:0,z:38,reward:10},
  {id:'studio',label:'64 Track Studio',x:-38,z:-28,reward:20},
  {id:'market',label:'All American Market',x:36,z:-22,reward:25},
  {id:'broadcast',label:'All American Network',x:34,z:34,reward:30},
  {id:'marina',label:'Lakefront Marina',x:-42,z:-55,reward:35},
]

const businesses=[
  {id:'welcome-market',label:'All American Market Pop-Up',x:14,z:48,description:'Meet the merchant and open the local commerce interaction.'},
  {id:'studio-desk',label:'64 Track Studio Desk',x:-34,z:-25,description:'Talk to the studio host about a creator mission.'},
]

function loadSave(){
  try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}catch{return {}}
}

export default function StreetVerse3D({onClose}:{onClose:()=>void}){
  const mountRef=useRef<HTMLDivElement|null>(null)
  const inputRef=useRef({up:false,down:false,left:false,right:false})
  const visitedRef=useRef<string[]>(loadSave().visited||[])
  const nearbyBusinessRef=useRef<(typeof businesses)[number]|null>(null)
  const [visited,setVisited]=useState<string[]>(visitedRef.current)
  const [message,setMessage]=useState('Move forward to the glowing District Welcome checkpoint, then explore the living city.')
  const [nearbyBusiness,setNearbyBusiness]=useState<(typeof businesses)[number]|null>(null)
  const [started,setStarted]=useState(true)
  const startedRef=useRef(started)
  const [economy,setEconomy]=useState<OmniverseEconomySnapshot>(()=>loadOmniverseEconomy())
  const [economyMessage,setEconomyMessage]=useState('Demo credits only — no real-money settlement is enabled.')

  useEffect(()=>{startedRef.current=started},[started])
  useEffect(()=>{void ensureOmniverseGenesis().then(setEconomy)},[])

  useEffect(()=>{
    const mount=mountRef.current
    if(!mount)return

    const saved=loadSave()
    const scene=new THREE.Scene()
    scene.background=new THREE.Color(0x89bde0)
    scene.fog=new THREE.Fog(0x89bde0,90,220)

    const camera=new THREE.PerspectiveCamera(62,1,.1,500)
    const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75))
    renderer.shadowMap.enabled=true
    renderer.shadowMap.type=THREE.PCFSoftShadowMap
    renderer.outputColorSpace=THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xd8f2ff,0x3c4b38,2.5))
    const sun=new THREE.DirectionalLight(0xffffff,2.8)
    sun.position.set(30,70,18)
    sun.castShadow=true
    scene.add(sun)

    const ground=new THREE.Mesh(new THREE.PlaneGeometry(WORLD,138),new THREE.MeshStandardMaterial({color:0x52744a,roughness:.96}))
    ground.rotation.x=-Math.PI/2
    ground.position.z=9
    ground.receiveShadow=true
    scene.add(ground)

    const water=new THREE.Mesh(new THREE.PlaneGeometry(WORLD,34),new THREE.MeshStandardMaterial({color:0x147cac,metalness:.05,roughness:.25,transparent:true,opacity:.92}))
    water.rotation.x=-Math.PI/2
    water.position.set(0,.03,-77)
    scene.add(water)

    const shore=new THREE.Mesh(new THREE.BoxGeometry(WORLD,.22,4),new THREE.MeshStandardMaterial({color:0xc7ad77,roughness:1}))
    shore.position.set(0,.1,-59)
    scene.add(shore)

    const roadMat=new THREE.MeshStandardMaterial({color:0x282b31,roughness:1})
    for(const z of [-42,0,42]){
      const road=new THREE.Mesh(new THREE.BoxGeometry(WORLD,.15,12),roadMat)
      road.position.set(0,.08,z)
      road.receiveShadow=true
      scene.add(road)
    }
    for(const x of [-42,0,42]){
      const road=new THREE.Mesh(new THREE.BoxGeometry(12,.15,122),roadMat)
      road.position.set(x,.08,5)
      road.receiveShadow=true
      scene.add(road)
    }

    const laneMat=new THREE.MeshBasicMaterial({color:0xf2d45f})
    for(const z of [-42,0,42])for(let x=-76;x<78;x+=12){
      const line=new THREE.Mesh(new THREE.BoxGeometry(5,.03,.18),laneMat)
      line.position.set(x,.18,z)
      scene.add(line)
    }

    const buildingBoxes:THREE.Box3[]=[]
    const buildingColors=[0x45627d,0x735769,0x4b6f62,0x866348,0x4d7089]
    for(let gx=-2;gx<=2;gx++)for(let gz=-2;gz<=2;gz++){
      if(gx===0||gz===0)continue
      const x=gx*24+(gx%2?3:-3)
      const z=gz*24+(gz%2?-3:3)
      if(z<-52)continue
      const h=12+((Math.abs(gx*13+gz*7)*5)%24)
      const mesh=new THREE.Mesh(new THREE.BoxGeometry(13,h,13),new THREE.MeshStandardMaterial({color:buildingColors[(gx+gz+10)%buildingColors.length],metalness:.1,roughness:.68}))
      mesh.position.set(x,h/2,z)
      mesh.castShadow=true
      mesh.receiveShadow=true
      scene.add(mesh)
      buildingBoxes.push(new THREE.Box3().setFromObject(mesh).expandByScalar(.9))
      for(let wy=4;wy<h-2;wy+=4)for(const side of [-1,1]){
        const light=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.7),new THREE.MeshBasicMaterial({color:0x9ee8ff}))
        light.position.set(x+side*6.51,wy,z+(wy%8?2:-2))
        light.rotation.y=side>0?Math.PI/2:-Math.PI/2
        scene.add(light)
      }
    }

    const treeColliders:THREE.Box3[]=[]
    const makeTree=(scale=1,canopy=0x2f7d3c)=>{
      const tree=new THREE.Group()
      const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.35*scale,.5*scale,3.5*scale,10),new THREE.MeshStandardMaterial({color:0x7a4d2c,roughness:1}))
      trunk.position.y=1.75*scale
      trunk.castShadow=true
      tree.add(trunk)
      const crownA=new THREE.Mesh(new THREE.SphereGeometry(1.65*scale,14,10),new THREE.MeshStandardMaterial({color:canopy,roughness:.95}))
      crownA.position.set(0,4.2*scale,0)
      crownA.castShadow=true
      tree.add(crownA)
      const crownB=new THREE.Mesh(new THREE.SphereGeometry(1.2*scale,12,9),new THREE.MeshStandardMaterial({color:0x3d9850,roughness:.95}))
      crownB.position.set(.65*scale,4.8*scale,.25*scale)
      crownB.castShadow=true
      tree.add(crownB)
      return tree
    }

    const treeSpots=[
      [-68,55,1.15],[-55,53,.9],[-28,54,1.05],[27,54,.9],[54,54,1.15],[70,52,.95],
      [-68,25,1],[-58,16,.85],[-28,22,.95],[28,22,1.05],[58,22,.9],[69,30,1.1],
      [-70,-20,1.05],[-57,-29,.9],[-27,-20,1.1],[27,-28,.9],[57,-18,1.05],[70,-31,.95],
      [-69,-52,.9],[-31,-51,1.05],[31,-51,1],[67,-51,.95],
    ] as const

    treeSpots.forEach(([x,z,scale],i)=>{
      const tree=makeTree(scale,i%3===0?0x286d35:i%3===1?0x347f42:0x3a8f49)
      tree.position.set(x,0,z)
      scene.add(tree)
      treeColliders.push(new THREE.Box3(new THREE.Vector3(x-1.1*scale,0,z-1.1*scale),new THREE.Vector3(x+1.1*scale,5.8*scale,z+1.1*scale)))
    })

    const park=new THREE.Mesh(new THREE.CircleGeometry(11,40),new THREE.MeshStandardMaterial({color:0x3d8e46,roughness:1}))
    park.rotation.x=-Math.PI/2
    park.position.set(-63,.03,2)
    scene.add(park)
    for(let i=0;i<4;i++){
      const tree=makeTree(.82+i*.05)
      const angle=i*Math.PI/2+.35
      tree.position.set(-63+Math.cos(angle)*7,0,2+Math.sin(angle)*7)
      scene.add(tree)
    }

    const avatar=new THREE.Group()
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(1.15,2.1,5,10),new THREE.MeshStandardMaterial({color:0x35d9ff,metalness:.25,roughness:.35}))
    body.castShadow=true
    body.position.y=2.2
    avatar.add(body)
    const head=new THREE.Mesh(new THREE.SphereGeometry(.8,18,14),new THREE.MeshStandardMaterial({color:0xd6a17e}))
    head.position.y=4.25
    head.castShadow=true
    avatar.add(head)
    avatar.position.set(saved.x??START.x,0,saved.z??START.z)
    scene.add(avatar)

    const beacons=new Map<string,THREE.Group>()
    checkpoints.forEach(cp=>{
      const g=new THREE.Group()
      g.position.set(cp.x,0,cp.z)
      const ring=new THREE.Mesh(new THREE.TorusGeometry(2.5,.22,12,42),new THREE.MeshBasicMaterial({color:0xffd35e}))
      ring.rotation.x=Math.PI/2
      ring.position.y=.3
      g.add(ring)
      const beam=new THREE.Mesh(new THREE.CylinderGeometry(.35,.7,10,18,1,true),new THREE.MeshBasicMaterial({color:0x55ddff,transparent:true,opacity:.2,side:THREE.DoubleSide}))
      beam.position.y=5
      g.add(beam)
      scene.add(g)
      beacons.set(cp.id,g)
    })

    businesses.forEach(business=>{
      const g=new THREE.Group()
      g.position.set(business.x,0,business.z)
      const kiosk=new THREE.Mesh(new THREE.BoxGeometry(4.6,3.4,4.6),new THREE.MeshStandardMaterial({color:0x17364a,emissive:0x062638,emissiveIntensity:.45,metalness:.2,roughness:.5}))
      kiosk.position.y=1.7
      kiosk.castShadow=true
      g.add(kiosk)
      const sign=new THREE.Mesh(new THREE.BoxGeometry(3.8,.8,.18),new THREE.MeshBasicMaterial({color:0x58e8ff}))
      sign.position.set(0,3.45,2.4)
      g.add(sign)
      const interactionRing=new THREE.Mesh(new THREE.TorusGeometry(3,.16,10,36),new THREE.MeshBasicMaterial({color:0x79ffad}))
      interactionRing.rotation.x=Math.PI/2
      interactionRing.position.y=.22
      g.add(interactionRing)
      scene.add(g)
    })

    const npcs:THREE.Mesh[]=[]
    for(let i=0;i<10;i++){
      const npc=new THREE.Mesh(new THREE.CapsuleGeometry(.45,1.2,4,8),new THREE.MeshStandardMaterial({color:i%2?0xff77aa:0xffc05f}))
      npc.position.set(-60+i*13,1.2,(i%2?8:-8))
      npc.castShadow=true
      scene.add(npc)
      npcs.push(npc)
    }
    const merchant=new THREE.Mesh(new THREE.CapsuleGeometry(.5,1.35,4,8),new THREE.MeshStandardMaterial({color:0x79ffad}))
    merchant.position.set(businesses[0].x-3,1.3,businesses[0].z)
    merchant.castShadow=true
    scene.add(merchant)

    const makeCar=(color:number,scale=1)=>{
      const car=new THREE.Group()
      const chassis=new THREE.Mesh(new THREE.BoxGeometry(4.3*scale,.85*scale,2.05*scale),new THREE.MeshStandardMaterial({color,metalness:.72,roughness:.2}))
      chassis.position.y=.85*scale
      chassis.castShadow=true
      car.add(chassis)
      const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.25*scale,.72*scale,1.75*scale),new THREE.MeshStandardMaterial({color:0x172535,metalness:.45,roughness:.16}))
      cabin.position.set(-.15*scale,1.55*scale,0)
      car.add(cabin)
      for(const x of [-1.35,1.35])for(const z of [-1,1]){
        const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.42*scale,.42*scale,.26*scale,14),new THREE.MeshStandardMaterial({color:0x090a0c,roughness:1}))
        wheel.rotation.x=Math.PI/2
        wheel.position.set(x*scale,.5*scale,z*.92*scale)
        car.add(wheel)
      }
      return car
    }

    const cars=[
      {mesh:makeCar(0x3869ff),laneZ:-44.3,speed:11,start:-72},
      {mesh:makeCar(0xe6e8ee,1.08),laneZ:2.3,speed:-14,start:68},
      {mesh:makeCar(0xd12828,.92),laneZ:39.7,speed:18,start:-58},
      {mesh:makeCar(0x101216,.88),laneZ:-39.7,speed:-21,start:42},
    ]
    cars.forEach(({mesh,laneZ,start})=>{mesh.position.set(start,0,laneZ);scene.add(mesh)})

    const makeAnimal=(kind:'dog'|'deer'|'horse',color:number,scale:number)=>{
      const g=new THREE.Group()
      const torso=new THREE.Mesh(new THREE.BoxGeometry(2.2*scale,1.05*scale,.85*scale),new THREE.MeshStandardMaterial({color,roughness:.88}))
      torso.position.y=1.2*scale
      g.add(torso)
      const headMesh=new THREE.Mesh(new THREE.SphereGeometry(.52*scale,12,10),new THREE.MeshStandardMaterial({color,roughness:.88}))
      headMesh.position.set(1.25*scale,1.6*scale,0)
      g.add(headMesh)
      for(const x of [-.75,.75])for(const z of [-.28,.28]){
        const leg=new THREE.Mesh(new THREE.BoxGeometry(.22*scale,.9*scale,.22*scale),new THREE.MeshStandardMaterial({color,roughness:.95}))
        leg.position.set(x*scale,.55*scale,z*scale)
        g.add(leg)
      }
      g.userData.kind=kind
      return g
    }

    const animals=[
      {mesh:makeAnimal('dog',0xa97748,.55),baseX:-54,baseZ:20,pace:5},
      {mesh:makeAnimal('deer',0x8e6845,.85),baseX:58,baseZ:24,pace:7},
      {mesh:makeAnimal('horse',0x3a281e,1.05),baseX:55,baseZ:-29,pace:6},
    ]
    animals.forEach(({mesh,baseX,baseZ})=>{mesh.position.set(baseX,0,baseZ);scene.add(mesh)})

    const birds:THREE.Mesh[]=[]
    for(let i=0;i<5;i++){
      const bird=new THREE.Mesh(new THREE.ConeGeometry(.32,.9,5),new THREE.MeshStandardMaterial({color:0xd9edf4}))
      bird.rotation.z=Math.PI/2
      scene.add(bird)
      birds.push(bird)
    }

    const makeBoat=(color:number,scale=1)=>{
      const boat=new THREE.Group()
      const hull=new THREE.Mesh(new THREE.BoxGeometry(5.5*scale,.8*scale,2.15*scale),new THREE.MeshStandardMaterial({color,metalness:.2,roughness:.34}))
      hull.position.y=.45*scale
      boat.add(hull)
      const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.2*scale,1.05*scale,1.6*scale),new THREE.MeshStandardMaterial({color:0xe8f2f8,metalness:.1,roughness:.28}))
      cabin.position.set(-.5*scale,1.2*scale,0)
      boat.add(cabin)
      return boat
    }

    const boats=[
      {mesh:makeBoat(0xff7b2f,.75),z:-72,speed:8,start:-62},
      {mesh:makeBoat(0xf4f4f4,1.18),z:-82,speed:-5,start:54},
    ]
    boats.forEach(({mesh,z,start})=>{mesh.position.set(start,.2,z);scene.add(mesh)})

    const keys=new Set<string>()
    const keyDown=(e:KeyboardEvent)=>{
      if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase())){
        e.preventDefault()
        keys.add(e.key.toLowerCase())
      }
    }
    const keyUp=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase())
    window.addEventListener('keydown',keyDown,{passive:false})
    window.addEventListener('keyup',keyUp)

    const resize=()=>{
      const w=Math.max(1,mount.clientWidth)
      const h=Math.max(420,mount.clientHeight)
      camera.aspect=w/h
      camera.updateProjectionMatrix()
      renderer.setSize(w,h,false)
    }
    const ro=new ResizeObserver(resize)
    ro.observe(mount)
    resize()

    camera.position.set(START.x,10,START.z+15)
    camera.lookAt(START.x,2.4,START.z-4)

    const clock=new THREE.Clock()
    let raf=0
    let lastSave=0
    const tmp=new THREE.Vector3()
    const desiredCam=new THREE.Vector3()
    const collides=(x:number,z:number)=>buildingBoxes.some(box=>box.containsPoint(tmp.set(x,2,z)))||treeColliders.some(box=>box.containsPoint(tmp.set(x,2,z)))

    const animate=()=>{
      const dt=Math.min(.033,clock.getDelta())
      const t=performance.now()/1000
      const input=inputRef.current
      let dx=0,dz=0
      if(keys.has('w')||keys.has('arrowup')||input.up)dz-=1
      if(keys.has('s')||keys.has('arrowdown')||input.down)dz+=1
      if(keys.has('a')||keys.has('arrowleft')||input.left)dx-=1
      if(keys.has('d')||keys.has('arrowright')||input.right)dx+=1
      const pads=navigator.getGamepads?.()||[]
      const gp=pads[0]
      if(gp){
        dx+=Math.abs(gp.axes[0]||0)>.18?(gp.axes[0]||0):0
        dz+=Math.abs(gp.axes[1]||0)>.18?(gp.axes[1]||0):0
      }
      if(startedRef.current&&(dx||dz)){
        const len=Math.hypot(dx,dz)||1
        dx/=len;dz/=len
        const speed=18*dt
        const nx=THREE.MathUtils.clamp(avatar.position.x+dx*speed,-80,80)
        const nz=THREE.MathUtils.clamp(avatar.position.z+dz*speed,-56,70)
        if(!collides(nx,avatar.position.z))avatar.position.x=nx
        if(!collides(avatar.position.x,nz))avatar.position.z=nz
        avatar.rotation.y=Math.atan2(dx,dz)
      }

      npcs.forEach((npc,i)=>{
        npc.position.z=Math.sin(t/1.4+i)*14+(i%2?20:-20)
        npc.rotation.y=Math.sin(t/1.8+i)
      })
      merchant.rotation.y=Math.sin(t*.8)*.3

      cars.forEach(car=>{
        car.mesh.position.x+=car.speed*dt
        if(car.speed>0&&car.mesh.position.x>84)car.mesh.position.x=-84
        if(car.speed<0&&car.mesh.position.x<-84)car.mesh.position.x=84
        car.mesh.position.z=car.laneZ
        car.mesh.rotation.y=car.speed>0?0:Math.PI
      })

      animals.forEach((animal,i)=>{
        animal.mesh.position.x=animal.baseX+Math.sin(t*.45+i)*animal.pace
        animal.mesh.position.z=animal.baseZ+Math.cos(t*.32+i)*animal.pace*.65
        animal.mesh.rotation.y=Math.sin(t*.45+i)>0?0:Math.PI
      })

      birds.forEach((bird,i)=>{
        const angle=t*.28+i*1.25
        bird.position.set(Math.cos(angle)*(28+i*4),12+i*1.4,Math.sin(angle)*(25+i*3)-10)
        bird.rotation.y=-angle
      })

      boats.forEach((boat,i)=>{
        boat.mesh.position.x+=boat.speed*dt
        if(boat.speed>0&&boat.mesh.position.x>82)boat.mesh.position.x=-82
        if(boat.speed<0&&boat.mesh.position.x<-82)boat.mesh.position.x=82
        boat.mesh.position.y=.2+Math.sin(t*1.8+i)*.16
        boat.mesh.rotation.y=boat.speed>0?0:Math.PI
      })

      checkpoints.forEach(cp=>{
        const g=beacons.get(cp.id)
        if(g)g.rotation.y+=dt*.9
        const d=Math.hypot(avatar.position.x-cp.x,avatar.position.z-cp.z)
        if(d<4.2&&!visitedRef.current.includes(cp.id)){
          visitedRef.current=[...visitedRef.current,cp.id]
          setVisited(visitedRef.current)
          setMessage(`Checkpoint reached: ${cp.label}. +${cp.reward} demo credits recorded to the internal ledger.`)
          void recordMissionReward(cp.reward,cp.id).then(setEconomy)
        }
      })

      const nearest=businesses.map(business=>({business,distance:Math.hypot(avatar.position.x-business.x,avatar.position.z-business.z)})).sort((a,b)=>a.distance-b.distance)[0]
      const nextBusiness=nearest&&nearest.distance<7?nearest.business:null
      if(nextBusiness?.id!==nearbyBusinessRef.current?.id){
        nearbyBusinessRef.current=nextBusiness
        setNearbyBusiness(nextBusiness)
      }

      desiredCam.set(avatar.position.x,10,avatar.position.z+15)
      camera.position.lerp(desiredCam,1-Math.pow(.001,dt))
      camera.lookAt(avatar.position.x,2.4,avatar.position.z-4)

      const now=performance.now()
      if(now-lastSave>900){
        localStorage.setItem(SAVE_KEY,JSON.stringify({x:avatar.position.x,z:avatar.position.z,visited:visitedRef.current,updatedAt:new Date().toISOString()}))
        lastSave=now
      }

      renderer.render(scene,camera)
      raf=requestAnimationFrame(animate)
    }

    animate()

    return()=>{
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('keydown',keyDown)
      window.removeEventListener('keyup',keyUp)
      renderer.dispose()
      renderer.domElement.remove()
    }
  },[])

  const press=(key:keyof typeof inputRef.current,value:boolean)=>{inputRef.current[key]=value}
  const completed=visited.length===checkpoints.length

  const interactBusiness=()=>{
    if(!nearbyBusiness)return
    setMessage(`${nearbyBusiness.label}: ${nearbyBusiness.description} Interaction confirmed in the playable StreetVerse scene.`)
  }

  const transact=async(action:'buy'|'rent'|'sponsor',assetId?:string)=>{
    try{
      const next=action==='buy'&&assetId?await recordPurchase(assetId):action==='rent'&&assetId?await recordRental(assetId):await recordSponsorReward(5)
      setEconomy(next)
      setEconomyMessage(action==='buy'?'Asset ownership recorded.':action==='rent'?'Rental revenue event recorded.':'Sponsored mission reward recorded.')
    }catch(error){
      setEconomyMessage(error instanceof Error?error.message:'Transaction failed')
    }
  }

  const featured=OMNIVERSE_DEMO_ASSETS.filter(asset=>asset.class==='luxury-car'||asset.class==='boat').slice(0,4)

  return <div role="dialog" aria-modal="true" aria-label="StreetVerse 3D" style={{position:'fixed',inset:0,zIndex:16000,background:'#02040a',color:'#fff',display:'grid',gridTemplateRows:'auto 1fr auto',fontFamily:'Inter,system-ui,sans-serif'}}>
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,padding:'10px 12px',background:'#060b13ee',borderBottom:'1px solid #24384b'}}>
      <div><div style={{fontSize:10,fontWeight:950,letterSpacing:2.2,color:'#58e8ff'}}>STREETVERSE • DISTRICT 01 • LIVING ECONOMY DEMO</div><div style={{fontWeight:950,fontSize:'clamp(18px,4vw,30px)'}}>Chicago Living World</div></div>
      <button onClick={onClose} aria-label="Close StreetVerse" style={{width:44,height:44,borderRadius:14,border:'1px solid #3a4d60',background:'#0c1420',color:'#fff',fontSize:24}}>×</button>
    </header>
    <main style={{position:'relative',minHeight:0,overflow:'hidden'}}>
      <div ref={mountRef} style={{position:'absolute',inset:0,minHeight:420}}/>
      <div style={{position:'absolute',left:10,top:10,maxWidth:'min(350px,72vw)',padding:10,borderRadius:14,background:'#030914dc',border:'1px solid #2b485e',backdropFilter:'blur(8px)'}}>
        <div style={{fontSize:10,color:'#ffd45e',fontWeight:900}}>MISSION: DISTRICT INTRO</div>
        <div style={{fontSize:12,lineHeight:1.45,marginTop:5}}>{message}</div>
        <div style={{fontSize:10,marginTop:7,color:completed?'#79ffad':'#b7c6d5'}}>{visited.length}/{checkpoints.length} checkpoints {completed?'• COMPLETE ✓':''}</div>
        {nearbyBusiness&&<button onClick={interactBusiness} style={{...actionBtn,background:'#16472f',borderColor:'#79ffad'}}>INTERACT • {nearbyBusiness.label}</button>}
        <div style={{fontSize:9,marginTop:6,color:'#8fa5b7'}}>WORLD: player • pedestrians • ordered traffic • buildings • trees • park • animals • boats</div>
      </div>
      <aside style={{position:'absolute',right:10,top:10,width:'min(320px,38vw)',maxHeight:'calc(100% - 20px)',overflow:'auto',padding:10,borderRadius:14,background:'#030914e8',border:'1px solid #2b485e',backdropFilter:'blur(9px)'}}>
        <div style={{fontSize:10,fontWeight:950,color:'#58e8ff'}}>EL SATURN INTERNAL ASSET LEDGER</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:8}}>
          <Metric label="PLAYER" value={`${economy.playerBalance} cr`}/><Metric label="PLATFORM DEMO GROSS" value={`${economy.grossPlatformCredits} cr`}/>
          <Metric label="OWNED ASSETS" value={String(economy.ownedAssetIds.length)}/><Metric label="CHAIN BLOCKS" value={String(economy.ledger.length)}/>
        </div>
        <div style={{fontSize:9,color:'#a9bdcc',lineHeight:1.35,marginTop:8}}>{economyMessage}</div>
        <button onClick={()=>void transact('sponsor')} style={actionBtn}>COMPLETE SPONSORED EVENT +5 cr</button>
        <div style={{fontSize:9,fontWeight:900,marginTop:10,marginBottom:5,color:'#ffd45e'}}>SHOWROOM + MARINA</div>
        {featured.map(asset=><div key={asset.id} style={{padding:'7px 0',borderTop:'1px solid #203344'}}>
          <div style={{fontSize:10,fontWeight:850}}>{asset.label} • {asset.valueCredits} cr</div>
          <div style={{fontSize:8,color:'#8fa5b7'}}>{asset.license} • unbranded/provenance tracked</div>
          <div style={{display:'flex',gap:5,marginTop:5}}><button onClick={()=>void transact('rent',asset.id)} style={miniBtn}>RENT</button><button onClick={()=>void transact('buy',asset.id)} disabled={economy.ownedAssetIds.includes(asset.id)} style={miniBtn}>{economy.ownedAssetIds.includes(asset.id)?'OWNED':'BUY'}</button></div>
        </div>)}
        <div style={{fontSize:8,color:'#7890a3',marginTop:8}}>Demo credits only. This proves game/asset/ledger attribution flow; it does not represent real cash receipts or a public cryptocurrency.</div>
      </aside>
    </main>
    <footer style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:10,padding:'8px 10px max(8px,env(safe-area-inset-bottom))',background:'#050912',borderTop:'1px solid #24384b'}}>
      <div style={{fontSize:10,color:'#8fa5b7'}}>WASD / arrows • gamepad • touch pad</div>
      <div style={{display:'grid',gridTemplateColumns:'58px 58px 58px',gap:5,touchAction:'none',userSelect:'none'}}>
        <span/><Pad label="▲" down={()=>press('up',true)} up={()=>press('up',false)}/><span/>
        <Pad label="◀" down={()=>press('left',true)} up={()=>press('left',false)}/><Pad label="▼" down={()=>press('down',true)} up={()=>press('down',false)}/><Pad label="▶" down={()=>press('right',true)} up={()=>press('right',false)}/>
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8}}><button onClick={()=>{localStorage.removeItem(SAVE_KEY);resetOmniverseEconomy();location.reload()}} style={smallBtn}>RESET</button><button onClick={()=>setStarted(v=>!v)} style={smallBtn}>{started?'PAUSE':'PLAY'}</button></div>
    </footer>
  </div>
}

function Metric({label,value}:{label:string;value:string}){return <div style={{padding:7,borderRadius:9,background:'#0b1621',border:'1px solid #21384b'}}><div style={{fontSize:7,color:'#7890a3',fontWeight:900}}>{label}</div><div style={{fontSize:12,fontWeight:950,marginTop:2}}>{value}</div></div>}
function Pad({label,down,up}:{label:string;down:()=>void;up:()=>void}){return <button aria-label={`Move ${label}`} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);down()}} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} style={{width:58,height:48,borderRadius:13,border:'1px solid #4a6a82',background:'#0d1a28',color:'#fff',fontSize:18,fontWeight:900}}>{label}</button>}
const actionBtn:React.CSSProperties={width:'100%',marginTop:8,border:'1px solid #4d7188',borderRadius:9,padding:'8px 6px',background:'#10283a',color:'#fff',fontSize:9,fontWeight:900}
const miniBtn:React.CSSProperties={border:'1px solid #3b5368',borderRadius:8,padding:'5px 8px',background:'#0d1722',color:'#fff',fontSize:8,fontWeight:900}
const smallBtn:React.CSSProperties={border:'1px solid #3b5368',borderRadius:10,padding:'9px 11px',background:'#0d1722',color:'#fff',fontSize:10,fontWeight:900}
