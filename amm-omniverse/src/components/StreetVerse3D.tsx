import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { appendInternalWorldEvent } from '../runtime/InternalWorldLedger'

const SAVE_KEY='tryamm.streetverse3d.v1'
const WORLD=140
const START={x:0,z:42}
const checkpoints=[
  {id:'studio',label:'64 Track Studio',x:-38,z:-28},
  {id:'market',label:'All American Market',x:36,z:-22},
  {id:'broadcast',label:'All American Network',x:34,z:34},
]
const revenueChannels=['Sponsored missions','Holo Ads','Marketplace commerce','Creator clips','Vehicle rentals','Boat experiences']

function loadSave(){
  try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}catch{return {}}
}

function makeLuxuryVehicle(color:number){
  const group=new THREE.Group()
  const body=new THREE.Mesh(new THREE.BoxGeometry(4.6,1.05,2.15),new THREE.MeshStandardMaterial({color,metalness:.72,roughness:.2}))
  body.position.y=.9;body.castShadow=true;group.add(body)
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.3,.78,1.8),new THREE.MeshStandardMaterial({color:0x182431,metalness:.55,roughness:.18}))
  cabin.position.set(-.25,1.72,0);cabin.castShadow=true;group.add(cabin)
  const trim=new THREE.Mesh(new THREE.BoxGeometry(4.72,.12,2.24),new THREE.MeshStandardMaterial({color:0xe5d4a4,metalness:.9,roughness:.12}))
  trim.position.y=.53;group.add(trim)
  for(const x of [-1.45,1.45])for(const z of [-1.05,1.05]){
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.34,16),new THREE.MeshStandardMaterial({color:0x0b0c0e,roughness:.75}))
    wheel.rotation.x=Math.PI/2;wheel.position.set(x,.42,z);group.add(wheel)
  }
  return group
}

function makeBoat(color:number){
  const group=new THREE.Group()
  const hull=new THREE.Mesh(new THREE.BoxGeometry(5.8,.72,2.25),new THREE.MeshStandardMaterial({color,metalness:.35,roughness:.32}))
  hull.position.y=.72;group.add(hull)
  const deck=new THREE.Mesh(new THREE.BoxGeometry(3.2,.7,1.55),new THREE.MeshStandardMaterial({color:0xf1f4f8,roughness:.3}))
  deck.position.set(-.45,1.32,0);group.add(deck)
  const glass=new THREE.Mesh(new THREE.BoxGeometry(1.55,.55,1.4),new THREE.MeshStandardMaterial({color:0x6eb9da,transparent:true,opacity:.55,metalness:.2,roughness:.05}))
  glass.position.set(-.4,1.85,0);group.add(glass)
  return group
}

function makeAnimal(kind:'dog'|'deer'|'horse',color:number){
  const group=new THREE.Group()
  const bodyScale=kind==='horse'?1.35:kind==='deer'?1.05:.75
  const body=new THREE.Mesh(new THREE.BoxGeometry(2.2*bodyScale,1.05*bodyScale,.82*bodyScale),new THREE.MeshStandardMaterial({color,roughness:.72}))
  body.position.y=1.05*bodyScale;body.castShadow=true;group.add(body)
  const head=new THREE.Mesh(new THREE.BoxGeometry(.72*bodyScale,.78*bodyScale,.72*bodyScale),body.material)
  head.position.set(1.25*bodyScale,1.45*bodyScale,0);head.castShadow=true;group.add(head)
  for(const x of [-.72,.72])for(const z of [-.28,.28]){
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.16*bodyScale,.9*bodyScale,.16*bodyScale),body.material)
    leg.position.set(x*bodyScale,.48*bodyScale,z*bodyScale);group.add(leg)
  }
  return group
}

export default function StreetVerse3D({onClose}:{onClose:()=>void}){
  const mountRef=useRef<HTMLDivElement|null>(null)
  const inputRef=useRef({up:false,down:false,left:false,right:false})
  const visitedRef=useRef<string[]>(loadSave().visited||[])
  const discoveredRef=useRef(new Set<string>())
  const [visited,setVisited]=useState<string[]>(visitedRef.current)
  const [message,setMessage]=useState('Explore District 01. Walk to the glowing mission beacons.')
  const [started,setStarted]=useState(true)
  const [worldEvents,setWorldEvents]=useState(0)

  useEffect(()=>{
    const mount=mountRef.current
    if(!mount)return
    const saved=loadSave()
    const scene=new THREE.Scene()
    scene.background=new THREE.Color(0x050814)
    scene.fog=new THREE.Fog(0x050814,65,180)

    const camera=new THREE.PerspectiveCamera(62,1,.1,500)
    const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
    renderer.shadowMap.enabled=true
    renderer.shadowMap.type=THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0x8fdfff,0x121018,2.4))
    const sun=new THREE.DirectionalLight(0xffffff,2.5)
    sun.position.set(35,70,20);sun.castShadow=true;scene.add(sun)

    const ground=new THREE.Mesh(new THREE.PlaneGeometry(WORLD,WORLD),new THREE.MeshStandardMaterial({color:0x101722,roughness:.92}))
    ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground)

    const water=new THREE.Mesh(new THREE.PlaneGeometry(WORLD,13),new THREE.MeshStandardMaterial({color:0x123e58,metalness:.35,roughness:.2,transparent:true,opacity:.88}))
    water.rotation.x=-Math.PI/2;water.position.set(0,.13,-62);scene.add(water)

    const roadMat=new THREE.MeshStandardMaterial({color:0x20242c,roughness:1})
    for(const z of [-42,0,42]){const road=new THREE.Mesh(new THREE.BoxGeometry(WORLD,0.15,12),roadMat);road.position.set(0,.08,z);scene.add(road)}
    for(const x of [-42,0,42]){const road=new THREE.Mesh(new THREE.BoxGeometry(12,.15,WORLD),roadMat);road.position.set(x,.08,0);scene.add(road)}

    const park=new THREE.Mesh(new THREE.CircleGeometry(13,36),new THREE.MeshStandardMaterial({color:0x183b28,roughness:.95}))
    park.rotation.x=-Math.PI/2;park.position.set(-47,.1,47);scene.add(park)

    const buildingMat=[0x253448,0x312b49,0x2b433c,0x47352d,0x253c4c]
    const buildingBoxes:THREE.Box3[]=[]
    for(let gx=-2;gx<=2;gx++)for(let gz=-2;gz<=2;gz++){
      if(gx===0||gz===0)continue
      const x=gx*24+(gx%2?3:-3),z=gz*24+(gz%2?-3:3)
      const h=12+((Math.abs(gx*13+gz*7)*5)%24)
      const mesh=new THREE.Mesh(new THREE.BoxGeometry(13,h,13),new THREE.MeshStandardMaterial({color:buildingMat[(gx+gz+10)%buildingMat.length],metalness:.15,roughness:.7}))
      mesh.position.set(x,h/2,z);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh)
      buildingBoxes.push(new THREE.Box3().setFromObject(mesh).expandByScalar(.9))
      for(let wy=4;wy<h-2;wy+=4)for(const side of [-1,1]){
        const light=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.7),new THREE.MeshBasicMaterial({color:0x74dfff}))
        light.position.set(x+side*6.51,wy,z+(wy%8?2:-2));light.rotation.y=side>0?Math.PI/2:-Math.PI/2;scene.add(light)
      }
    }

    const avatar=new THREE.Group()
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(1.15,2.1,5,10),new THREE.MeshStandardMaterial({color:0x59e7ff,metalness:.35,roughness:.35}))
    body.castShadow=true;body.position.y=2.2;avatar.add(body)
    const head=new THREE.Mesh(new THREE.SphereGeometry(.8,18,14),new THREE.MeshStandardMaterial({color:0xd6a17e}))
    head.position.y=4.25;head.castShadow=true;avatar.add(head)
    avatar.position.set(saved.x??START.x,0,saved.z??START.z);scene.add(avatar)

    const beacons=new Map<string,THREE.Group>()
    checkpoints.forEach(cp=>{
      const g=new THREE.Group();g.position.set(cp.x,0,cp.z)
      const ring=new THREE.Mesh(new THREE.TorusGeometry(2.5,.22,12,42),new THREE.MeshBasicMaterial({color:0xffd35e}))
      ring.rotation.x=Math.PI/2;ring.position.y=.3;g.add(ring)
      const beam=new THREE.Mesh(new THREE.CylinderGeometry(.35,.7,10,18,1,true),new THREE.MeshBasicMaterial({color:0x55ddff,transparent:true,opacity:.18,side:THREE.DoubleSide}))
      beam.position.y=5;g.add(beam);scene.add(g);beacons.set(cp.id,g)
    })

    const npcMat=new THREE.MeshStandardMaterial({color:0xff77aa})
    const npcs:THREE.Mesh[]=[]
    for(let i=0;i<8;i++){
      const npc=new THREE.Mesh(new THREE.CapsuleGeometry(.45,1.2,4,8),npcMat)
      npc.position.set(-55+i*15,1.2,(i%2?8:-8));npc.castShadow=true;scene.add(npc);npcs.push(npc)
    }

    const vehicles=[0x2d65ff,0xa11228,0xe7e8ea,0x131313,0x7a48d6,0x0d8a72].map((color,i)=>{
      const mesh=makeLuxuryVehicle(color)
      mesh.position.set(-64+i*23,.02,i%2===0?-42:42)
      scene.add(mesh)
      return {mesh,lane:i%2===0?-42:42,speed:8+i*1.15,direction:i%2===0?1:-1,id:`luxury-${i+1}`}
    })

    const boats=[0xeeeeee,0xd9a62e,0x194c7b].map((color,i)=>{
      const mesh=makeBoat(color)
      mesh.position.set(-54+i*48,.2,-62)
      scene.add(mesh)
      return {mesh,speed:4.5+i*1.2,direction:i===1?-1:1,id:`boat-${i+1}`}
    })

    const animalSpecs:[string,'dog'|'deer'|'horse',number,number,number][]=[
      ['dog-1','dog',0x8b623f,-49,48],['dog-2','dog',0xc1a17e,-40,43],['deer-1','deer',0x8a6844,-56,43],['horse-1','horse',0x3b2b24,-38,53],
    ]
    const animals=animalSpecs.map(([id,kind,color,x,z],i)=>{
      const mesh=makeAnimal(kind,color);mesh.position.set(x,0,z);scene.add(mesh)
      return {id,kind,mesh,originX:x,originZ:z,phase:i*1.7}
    })

    const keys=new Set<string>()
    const keyDown=(e:KeyboardEvent)=>{if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase())){e.preventDefault();keys.add(e.key.toLowerCase())}}
    const keyUp=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase())
    window.addEventListener('keydown',keyDown,{passive:false});window.addEventListener('keyup',keyUp)

    const resize=()=>{const w=mount.clientWidth,h=Math.max(420,mount.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
    const ro=new ResizeObserver(resize);ro.observe(mount);resize()

    const clock=new THREE.Clock();let raf=0;let lastSave=0
    const tmp=new THREE.Vector3();const desiredCam=new THREE.Vector3()
    const collides=(x:number,z:number)=>buildingBoxes.some(box=>box.containsPoint(tmp.set(x,2,z)))
    const recordDiscovery=(key:string,type:'vehicle_interaction'|'boat_interaction'|'animal_discovery',label:string,metadata:Record<string,unknown>)=>{
      if(discoveredRef.current.has(key))return
      discoveredRef.current.add(key)
      setWorldEvents(discoveredRef.current.size)
      setMessage(`${label} discovered. Receipt added to the internal StreetVerse ledger.`)
      void appendInternalWorldEvent(type,key,metadata)
    }

    const animate=()=>{
      const dt=Math.min(.033,clock.getDelta())
      const input=inputRef.current
      let dx=0,dz=0
      if(keys.has('w')||keys.has('arrowup')||input.up)dz-=1
      if(keys.has('s')||keys.has('arrowdown')||input.down)dz+=1
      if(keys.has('a')||keys.has('arrowleft')||input.left)dx-=1
      if(keys.has('d')||keys.has('arrowright')||input.right)dx+=1
      const pads=navigator.getGamepads?.()||[];const gp=pads[0]
      if(gp){dx+=Math.abs(gp.axes[0]||0)>.18?(gp.axes[0]||0):0;dz+=Math.abs(gp.axes[1]||0)>.18?(gp.axes[1]||0):0}
      if(started&&(dx||dz)){
        const len=Math.hypot(dx,dz)||1;dx/=len;dz/=len
        const speed=18*dt;const nx=THREE.MathUtils.clamp(avatar.position.x+dx*speed,-66,66),nz=THREE.MathUtils.clamp(avatar.position.z+dz*speed,-66,66)
        if(!collides(nx,avatar.position.z))avatar.position.x=nx
        if(!collides(avatar.position.x,nz))avatar.position.z=nz
        avatar.rotation.y=Math.atan2(dx,dz)
      }

      const elapsed=performance.now()/1000
      npcs.forEach((npc,i)=>{npc.position.z=Math.sin(performance.now()/1400+i)*14+(i%2?20:-20);npc.rotation.y=Math.sin(performance.now()/1800+i)})
      vehicles.forEach(vehicle=>{
        vehicle.mesh.position.x+=vehicle.speed*vehicle.direction*dt
        if(vehicle.mesh.position.x>68)vehicle.mesh.position.x=-68
        if(vehicle.mesh.position.x<-68)vehicle.mesh.position.x=68
        vehicle.mesh.rotation.y=vehicle.direction>0?0:Math.PI
        if(Math.hypot(avatar.position.x-vehicle.mesh.position.x,avatar.position.z-vehicle.lane)<5.5)recordDiscovery(vehicle.id,'vehicle_interaction','Original luxury vehicle',{class:'original-luxury',rentalEligible:true})
      })
      boats.forEach(boat=>{
        boat.mesh.position.x+=boat.speed*boat.direction*dt
        if(boat.mesh.position.x>66)boat.mesh.position.x=-66
        if(boat.mesh.position.x<-66)boat.mesh.position.x=66
        boat.mesh.rotation.y=boat.direction>0?0:Math.PI
        if(Math.hypot(avatar.position.x-boat.mesh.position.x,avatar.position.z+62)<6.5)recordDiscovery(boat.id,'boat_interaction','Lakefront boat',{experienceEligible:true})
      })
      animals.forEach(animal=>{
        animal.mesh.position.x=animal.originX+Math.sin(elapsed*.45+animal.phase)*4
        animal.mesh.position.z=animal.originZ+Math.cos(elapsed*.38+animal.phase)*3
        animal.mesh.rotation.y=Math.sin(elapsed*.7+animal.phase)
        if(Math.hypot(avatar.position.x-animal.mesh.position.x,avatar.position.z-animal.mesh.position.z)<4.8)recordDiscovery(animal.id,'animal_discovery',`${animal.kind[0].toUpperCase()}${animal.kind.slice(1)}`,{speciesClass:animal.kind})
      })

      checkpoints.forEach(cp=>{
        const g=beacons.get(cp.id);if(g)g.rotation.y+=dt*.9
        const d=Math.hypot(avatar.position.x-cp.x,avatar.position.z-cp.z)
        if(d<4.2&&!visitedRef.current.includes(cp.id)){
          const next=[...visitedRef.current,cp.id]
          visitedRef.current=next
          setVisited(next)
          setMessage(`Mission checkpoint reached: ${cp.label}. Internal ledger receipt created.`)
          void appendInternalWorldEvent('mission_checkpoint',cp.id,{label:cp.label,progress:Math.round((next.length/checkpoints.length)*100)})
        }
      })
      desiredCam.set(avatar.position.x,10,avatar.position.z+15)
      camera.position.lerp(desiredCam,1-Math.pow(.001,dt));camera.lookAt(avatar.position.x,2.4,avatar.position.z-4)
      const now=performance.now();if(now-lastSave>900){localStorage.setItem(SAVE_KEY,JSON.stringify({x:avatar.position.x,z:avatar.position.z,visited:visitedRef.current,updatedAt:new Date().toISOString()}));lastSave=now}
      renderer.render(scene,camera);raf=requestAnimationFrame(animate)
    }
    animate()

    return()=>{cancelAnimationFrame(raf);ro.disconnect();window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp);renderer.dispose();renderer.domElement.remove()}
  },[started])

  const press=(key:keyof typeof inputRef.current,value:boolean)=>{inputRef.current[key]=value}
  const completed=visited.length===checkpoints.length

  return <div role="dialog" aria-modal="true" aria-label="StreetVerse 3D" style={{position:'fixed',inset:0,zIndex:16000,background:'#02040a',color:'#fff',display:'grid',gridTemplateRows:'auto 1fr auto',fontFamily:'Inter,system-ui,sans-serif'}}>
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,padding:'10px 12px',background:'#060b13ee',borderBottom:'1px solid #24384b'}}>
      <div><div style={{fontSize:10,fontWeight:950,letterSpacing:2.2,color:'#58e8ff'}}>STREETVERSE • DISTRICT 01 • 3D PLAYABLE</div><div style={{fontWeight:950,fontSize:'clamp(18px,4vw,30px)'}}>Chicago Living World</div></div>
      <button onClick={onClose} aria-label="Close StreetVerse" style={{width:44,height:44,borderRadius:14,border:'1px solid #3a4d60',background:'#0c1420',color:'#fff',fontSize:24}}>×</button>
    </header>
    <main style={{position:'relative',minHeight:0}}>
      <div ref={mountRef} style={{position:'absolute',inset:0,minHeight:420}}/>
      <div style={{position:'absolute',left:10,top:10,maxWidth:350,padding:10,borderRadius:14,background:'#030914dc',border:'1px solid #2b485e',backdropFilter:'blur(8px)'}}>
        <div style={{fontSize:10,color:'#ffd45e',fontWeight:900}}>MISSION: DISTRICT INTRO</div>
        <div style={{fontSize:12,lineHeight:1.45,marginTop:5}}>{message}</div>
        <div style={{fontSize:10,marginTop:7,color:completed?'#79ffad':'#b7c6d5'}}>{visited.length}/{checkpoints.length} checkpoints {completed?'• COMPLETE ✓':''} • {worldEvents} discoveries</div>
      </div>
      <div style={{position:'absolute',right:10,top:10,maxWidth:265,padding:'9px 10px',borderRadius:14,background:'#030914dc',border:'1px solid #2b485e',fontSize:10,lineHeight:1.45}}>
        <strong>ECONOMY LANES</strong><br/>{revenueChannels.join(' • ')}<br/><span style={{color:'#8fa5b7'}}>World receipts are tamper-evident local records; cash payout still requires server verification/funding.</span>
      </div>
    </main>
    <footer style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:10,padding:'10px 12px',background:'#050912',borderTop:'1px solid #24384b'}}>
      <div style={{fontSize:10,color:'#8fa5b7'}}>WASD / arrows • gamepad • touch • animals • moving cars • lakefront boats</div>
      <div style={{display:'grid',gridTemplateColumns:'56px 56px 56px',gap:5,touchAction:'none',userSelect:'none'}}>
        <span/><Pad label="▲" down={()=>press('up',true)} up={()=>press('up',false)}/><span/>
        <Pad label="◀" down={()=>press('left',true)} up={()=>press('left',false)}/><Pad label="▼" down={()=>press('down',true)} up={()=>press('down',false)}/><Pad label="▶" down={()=>press('right',true)} up={()=>press('right',false)}/>
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8}}><button onClick={()=>{localStorage.removeItem(SAVE_KEY);location.reload()}} style={smallBtn}>RESET</button><button onClick={()=>setStarted(v=>!v)} style={smallBtn}>{started?'PAUSE':'PLAY'}</button></div>
    </footer>
  </div>
}

function Pad({label,down,up}:{label:string;down:()=>void;up:()=>void}){return <button aria-label={`Move ${label}`} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);down()}} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} style={{width:56,height:46,borderRadius:13,border:'1px solid #4a6a82',background:'#0d1a28',color:'#fff',fontSize:18,fontWeight:900}}>{label}</button>}
const smallBtn:React.CSSProperties={border:'1px solid #3b5368',borderRadius:10,padding:'9px 11px',background:'#0d1722',color:'#fff',fontSize:10,fontWeight:900}
