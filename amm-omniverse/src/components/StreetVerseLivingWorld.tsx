import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { replacePrimitiveWithStreetVerseAsset } from '../services/streetverseAssetLoader'

const SAVE_KEY='tryamm.streetverse.living.v1'
const START={x:0,z:54}
const MISSIONS=[
  {id:'studio',label:'Aniyah 64 Track Studio',x:-42,z:-30},
  {id:'market',label:'All American Marketplace',x:42,z:-24},
  {id:'network',label:'All American Network',x:38,z:38},
  {id:'club',label:'Chicago After Dark',x:-38,z:38},
]

function loadSave(){try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}catch{return {}}}
function material(color:number,metalness=.1,roughness=.72){return new THREE.MeshStandardMaterial({color,metalness,roughness})}

export default function StreetVerseLivingWorld({onClose}:{onClose:()=>void}){
  const mountRef=useRef<HTMLDivElement|null>(null)
  const inputRef=useRef({up:false,down:false,left:false,right:false})
  const visitedRef=useRef<string[]>(loadSave().visited||[])
  const [visited,setVisited]=useState<string[]>(visitedRef.current)
  const [message,setMessage]=useState('Welcome to District 01. Explore the living city and reach the glowing mission beacons.')
  const [paused,setPaused]=useState(false)
  const [assetStatus,setAssetStatus]=useState('PROCEDURAL CITY ACTIVE')

  useEffect(()=>{visitedRef.current=visited},[visited])

  useEffect(()=>{
    const mount=mountRef.current
    if(!mount)return
    const saved=loadSave()
    const scene=new THREE.Scene()
    scene.background=new THREE.Color(0x07101d)
    scene.fog=new THREE.FogExp2(0x07101d,.007)

    const camera=new THREE.PerspectiveCamera(63,1,.1,600)
    const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.8))
    renderer.shadowMap.enabled=true
    renderer.shadowMap.type=THREE.PCFSoftShadowMap
    renderer.outputColorSpace=THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const hemi=new THREE.HemisphereLight(0x9bdcff,0x17111b,2.7);scene.add(hemi)
    const sun=new THREE.DirectionalLight(0xffe0bd,3.4);sun.position.set(55,90,25);sun.castShadow=true;scene.add(sun)

    const ground=new THREE.Mesh(new THREE.PlaneGeometry(190,190),material(0x142019,0,.98));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground)
    const roadMat=material(0x1c2029,0,.98)
    const sidewalkMat=material(0x6c7073,0,.95)
    for(const z of [-48,0,48]){
      const road=new THREE.Mesh(new THREE.BoxGeometry(190,.12,14),roadMat);road.position.set(0,.07,z);scene.add(road)
      for(const dz of [-9,9]){const walk=new THREE.Mesh(new THREE.BoxGeometry(190,.2,3),sidewalkMat);walk.position.set(0,.12,z+dz);scene.add(walk)}
    }
    for(const x of [-48,0,48]){
      const road=new THREE.Mesh(new THREE.BoxGeometry(14,.12,190),roadMat);road.position.set(x,.07,0);scene.add(road)
      for(const dx of [-9,9]){const walk=new THREE.Mesh(new THREE.BoxGeometry(3,.2,190),sidewalkMat);walk.position.set(x+dx,.12,0);scene.add(walk)}
    }

    const collisionBoxes:THREE.Box3[]=[]
    const districtColors=[0x223a51,0x352a4b,0x2f4a3e,0x54392d,0x29485b,0x4b2e46]
    const buildingPositions=[
      [-70,-70],[-70,-25],[-70,25],[-70,70],[-25,-70],[-25,-25],[-25,25],[-25,70],
      [25,-70],[25,-25],[25,25],[25,70],[70,-70],[70,-25],[70,25],[70,70]
    ]
    buildingPositions.forEach(([x,z],i)=>{
      const h=14+((i*11)%30),w=16+(i%3)*3,d=16+((i+1)%3)*3
      const building=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(districtColors[i%districtColors.length],.18,.68))
      building.position.set(x,h/2,z);building.castShadow=true;building.receiveShadow=true;scene.add(building)
      collisionBoxes.push(new THREE.Box3().setFromObject(building).expandByScalar(1.2))
      for(let y=4;y<h-1;y+=4)for(const sx of [-1,1]){
        const windowLight=new THREE.Mesh(new THREE.PlaneGeometry(1.15,.65),new THREE.MeshBasicMaterial({color:i%2?0xffd58c:0x67dfff}))
        windowLight.position.set(x+sx*(w/2+.01),y,z+(y%8?2.6:-2.6));windowLight.rotation.y=sx>0?Math.PI/2:-Math.PI/2;scene.add(windowLight)
      }
      if(i%4===0){const sign=new THREE.Mesh(new THREE.BoxGeometry(w*.72,1.1,.22),new THREE.MeshBasicMaterial({color:i%8?0x45e6ff:0xff54b4}));sign.position.set(x,3,z+d/2+.15);scene.add(sign)}
    })

    const shopDefs=[
      {name:'64 TRACK STUDIO',x:-42,z:-30,c:0xb96cff},
      {name:'ALL AMERICAN MARKET',x:42,z:-24,c:0x5be7ff},
      {name:'ALL AMERICAN NETWORK',x:38,z:38,c:0xffc95b},
      {name:'CHICAGO AFTER DARK',x:-38,z:38,c:0xff4f9a},
    ]
    shopDefs.forEach((shop,i)=>{
      const base=new THREE.Mesh(new THREE.BoxGeometry(15,7,11),material(shop.c,.28,.42));base.position.set(shop.x,3.5,shop.z);base.castShadow=true;scene.add(base)
      const glow=new THREE.PointLight(shop.c,14,24,2);glow.position.set(shop.x,5,shop.z+7);scene.add(glow)
      const canopy=new THREE.Mesh(new THREE.BoxGeometry(11,.55,3),new THREE.MeshBasicMaterial({color:shop.c}));canopy.position.set(shop.x,4.8,shop.z+7);scene.add(canopy)
      collisionBoxes.push(new THREE.Box3().setFromObject(base).expandByScalar(.8))
      void i
    })

    const trees:THREE.Group[]=[]
    for(let i=0;i<34;i++){
      const g=new THREE.Group();const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.35,.48,3,8),material(0x69482f));trunk.position.y=1.5;g.add(trunk)
      const crown=new THREE.Mesh(new THREE.SphereGeometry(1.7,10,8),material(i%3?0x256b3f:0x34794d));crown.position.y=4;g.add(crown)
      const side=i%2?1:-1;g.position.set(side*(18+(i%4)*16),0,-78+(i*11)%156);scene.add(g);trees.push(g)
    }

    const streetLights:THREE.Group[]=[]
    for(let i=0;i<18;i++){
      const g=new THREE.Group();const pole=new THREE.Mesh(new THREE.CylinderGeometry(.12,.16,6,8),material(0x353b45,.7,.3));pole.position.y=3;g.add(pole)
      const lamp=new THREE.PointLight(0xffd7a0,5,18,2);lamp.position.y=6.2;g.add(lamp)
      const bulb=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),new THREE.MeshBasicMaterial({color:0xffd7a0}));bulb.position.y=6.2;g.add(bulb)
      g.position.set(i%2?10:-10,0,-76+i*9);scene.add(g);streetLights.push(g)
    }

    const avatar=new THREE.Group()
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(1.05,2.2,5,10),material(0x58e8ff,.38,.32));body.position.y=2.2;body.castShadow=true;avatar.add(body)
    const head=new THREE.Mesh(new THREE.SphereGeometry(.78,18,14),material(0xc98e67,0,.58));head.position.y=4.25;head.castShadow=true;avatar.add(head)
    avatar.position.set(saved.x??START.x,0,saved.z??START.z);scene.add(avatar)
    replacePrimitiveWithStreetVerseAsset({id:'player-default',fallback:avatar,scene,position:avatar.position.clone()}).then(ok=>ok&&setAssetStatus('PLAYER GLB LOADED • LIVING CITY ACTIVE'))

    const npcs:THREE.Group[]=[]
    for(let i=0;i<16;i++){
      const g=new THREE.Group();const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.42,1.2,4,8),material([0xff6f9e,0x65d8ff,0xffcf67,0x75e08e][i%4]));torso.position.y=1.25;g.add(torso)
      const h=new THREE.Mesh(new THREE.SphereGeometry(.36,10,8),material([0x7a4a2f,0xbd805b,0x4d2d22,0xd2a075][i%4]));h.position.y=2.55;g.add(h)
      g.position.set(-70+(i%8)*20,0,i<8?-18:18);scene.add(g);npcs.push(g)
    }

    const cars:THREE.Group[]=[]
    for(let i=0;i<10;i++){
      const car=new THREE.Group();const shell=new THREE.Mesh(new THREE.BoxGeometry(4.8,1.15,2.2),material([0xe84141,0x3f8cff,0xe8c84b,0xeaeaea,0x1f1f27][i%5],.55,.3));shell.position.y=1;car.add(shell)
      const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.5,.85,1.9),material(0x83b9d6,.7,.18));cabin.position.set(-.2,1.8,0);car.add(cabin)
      for(const sx of [-1.45,1.45])for(const sz of [-1,1]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.3,12),material(0x111111,0,.9));wheel.rotation.x=Math.PI/2;wheel.position.set(sx,.55,sz*1.05);car.add(wheel)}
      car.position.set(-82+i*18,.05,i%2?48:-48);scene.add(car);cars.push(car)
    }

    const dogs:THREE.Group[]=[]
    for(let i=0;i<3;i++){
      const dog=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(1.6,.75,.7),material(i?0x8a5b35:0x303033));body.position.y=.75;dog.add(body)
      const head=new THREE.Mesh(new THREE.BoxGeometry(.65,.65,.62),material(i?0x8a5b35:0x303033));head.position.set(.95,1.05,0);dog.add(head)
      dog.position.set(-20+i*22,0,62-i*15);scene.add(dog);dogs.push(dog)
    }

    const birds:THREE.Mesh[]=[]
    for(let i=0;i<9;i++){
      const bird=new THREE.Mesh(new THREE.ConeGeometry(.28,.8,5),material(0xd9e8f5,.15,.7));bird.rotation.z=Math.PI/2;scene.add(bird);birds.push(bird)
    }

    const beacons=new Map<string,THREE.Group>()
    MISSIONS.forEach(m=>{
      const g=new THREE.Group();g.position.set(m.x,0,m.z)
      const ring=new THREE.Mesh(new THREE.TorusGeometry(2.4,.22,12,44),new THREE.MeshBasicMaterial({color:0xffd45e}));ring.rotation.x=Math.PI/2;ring.position.y=.35;g.add(ring)
      const beam=new THREE.Mesh(new THREE.CylinderGeometry(.35,.9,12,18,1,true),new THREE.MeshBasicMaterial({color:0x55ddff,transparent:true,opacity:.2,side:THREE.DoubleSide}));beam.position.y=6;g.add(beam)
      scene.add(g);beacons.set(m.id,g)
    })

    const keys=new Set<string>()
    const down=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(k)){e.preventDefault();keys.add(k)}}
    const up=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase())
    addEventListener('keydown',down,{passive:false});addEventListener('keyup',up)
    const resize=()=>{const w=mount.clientWidth,h=Math.max(420,mount.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
    const ro=new ResizeObserver(resize);ro.observe(mount);resize()

    const clock=new THREE.Clock(),tmp=new THREE.Vector3(),desiredCam=new THREE.Vector3();let raf=0,lastSave=0,elapsed=0
    const collides=(x:number,z:number)=>collisionBoxes.some(box=>box.containsPoint(tmp.set(x,2,z)))
    const animate=()=>{
      const dt=Math.min(.033,clock.getDelta());elapsed+=dt
      const input=inputRef.current;let dx=0,dz=0
      if(keys.has('w')||keys.has('arrowup')||input.up)dz-=1;if(keys.has('s')||keys.has('arrowdown')||input.down)dz+=1
      if(keys.has('a')||keys.has('arrowleft')||input.left)dx-=1;if(keys.has('d')||keys.has('arrowright')||input.right)dx+=1
      const gp=(navigator.getGamepads?.()||[])[0];if(gp){dx+=Math.abs(gp.axes[0]||0)>.18?(gp.axes[0]||0):0;dz+=Math.abs(gp.axes[1]||0)>.18?(gp.axes[1]||0):0}
      if(!paused&&(dx||dz)){
        const len=Math.hypot(dx,dz)||1;dx/=len;dz/=len;const speed=(keys.has('shift')?28:18)*dt
        const nx=THREE.MathUtils.clamp(avatar.position.x+dx*speed,-88,88),nz=THREE.MathUtils.clamp(avatar.position.z+dz*speed,-88,88)
        if(!collides(nx,avatar.position.z))avatar.position.x=nx;if(!collides(avatar.position.x,nz))avatar.position.z=nz;avatar.rotation.y=Math.atan2(dx,dz)
      }
      npcs.forEach((npc,i)=>{npc.position.x=-72+((elapsed*2.2+i*13)%144);npc.position.z=i<8?-18:18;npc.rotation.y=Math.PI/2})
      cars.forEach((car,i)=>{const dir=i%2?1:-1;car.position.x=dir*(-88+((elapsed*(10+i*.5)+i*17)%176));car.position.z=i%2?48:-48;car.rotation.y=dir>0?Math.PI/2:-Math.PI/2})
      dogs.forEach((dog,i)=>{dog.position.x+=Math.sin(elapsed*.8+i)*dt*.8;dog.rotation.y=Math.sin(elapsed+i)})
      birds.forEach((bird,i)=>{const a=elapsed*.35+i*.68,b=26+i%3*4;bird.position.set(Math.cos(a)*b,18+i%3*3,Math.sin(a)*b);bird.rotation.y=-a})
      trees.forEach((tree,i)=>{tree.rotation.z=Math.sin(elapsed*.7+i)*.015})
      MISSIONS.forEach(m=>{const g=beacons.get(m.id);if(g)g.rotation.y+=dt*.9;const d=Math.hypot(avatar.position.x-m.x,avatar.position.z-m.z);if(d<4.5&&!visitedRef.current.includes(m.id)){const next=[...visitedRef.current,m.id];visitedRef.current=next;setVisited(next);setMessage(`Checkpoint reached: ${m.label}. ${MISSIONS.length-next.length} district objective${MISSIONS.length-next.length===1?'':'s'} remaining.`)}})
      const day=(Math.sin(elapsed*.03)+1)/2;sun.intensity=1.5+day*2.4;hemi.intensity=1.4+day*1.6;streetLights.forEach(g=>{g.visible=day<.56})
      desiredCam.set(avatar.position.x,11,avatar.position.z+16);camera.position.lerp(desiredCam,1-Math.pow(.001,dt));camera.lookAt(avatar.position.x,2.5,avatar.position.z-4)
      const now=performance.now();if(now-lastSave>900){localStorage.setItem(SAVE_KEY,JSON.stringify({x:avatar.position.x,z:avatar.position.z,visited:visitedRef.current,updatedAt:new Date().toISOString()}));lastSave=now}
      renderer.render(scene,camera);raf=requestAnimationFrame(animate)
    }
    animate()
    return()=>{cancelAnimationFrame(raf);ro.disconnect();removeEventListener('keydown',down);removeEventListener('keyup',up);renderer.dispose();renderer.domElement.remove()}
  },[paused])

  const press=(key:keyof typeof inputRef.current,value:boolean)=>{inputRef.current[key]=value}
  return <div role="dialog" aria-modal="true" aria-label="StreetVerse Living World" style={{position:'fixed',inset:0,zIndex:16000,background:'#02040a',color:'#fff',display:'grid',gridTemplateRows:'auto 1fr auto',fontFamily:'Inter,system-ui,sans-serif'}}>
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,padding:'9px 12px',background:'#050a12ee',borderBottom:'1px solid #28425a'}}>
      <div><div style={{fontSize:9,fontWeight:950,letterSpacing:2,color:'#59e7ff'}}>STREETVERSE • CHICAGO • LIVING WORLD</div><div style={{fontWeight:950,fontSize:'clamp(18px,4vw,29px)'}}>District 01</div></div>
      <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:9,color:'#8effb7'}}>{assetStatus}</span><button onClick={onClose} aria-label="Close StreetVerse" style={{width:42,height:42,borderRadius:13,border:'1px solid #3a5369',background:'#0c1520',color:'#fff',fontSize:22}}>×</button></div>
    </header>
    <main style={{position:'relative',minHeight:0}}>
      <div ref={mountRef} style={{position:'absolute',inset:0,minHeight:420}}/>
      <div style={{position:'absolute',left:10,top:10,maxWidth:340,padding:10,borderRadius:14,background:'#030914dc',border:'1px solid #2b485e',backdropFilter:'blur(9px)'}}><div style={{fontSize:9,color:'#ffd45e',fontWeight:950}}>LIVING CITY MISSION</div><div style={{fontSize:12,lineHeight:1.45,marginTop:5}}>{message}</div><div style={{fontSize:10,marginTop:7,color:visited.length===MISSIONS.length?'#79ffad':'#b7c6d5'}}>{visited.length}/{MISSIONS.length} locations {visited.length===MISSIONS.length?'• DISTRICT COMPLETE ✓':''}</div></div>
      <div style={{position:'absolute',right:10,top:10,padding:'7px 9px',borderRadius:999,background:'#030914dc',border:'1px solid #2b485e',fontSize:9}}>AUTO SAVE • TOUCH • GAMEPAD • NPCs • TRAFFIC • ANIMALS</div>
    </main>
    <footer style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:8,padding:'8px 10px',background:'#050912',borderTop:'1px solid #24384b'}}>
      <div style={{fontSize:9,color:'#8fa5b7'}}>WASD/arrows • Shift run • touch • standard gamepad</div>
      <div style={{display:'grid',gridTemplateColumns:'54px 54px 54px',gap:4,touchAction:'none',userSelect:'none'}}><span/><Pad label="▲" down={()=>press('up',true)} up={()=>press('up',false)}/><span/><Pad label="◀" down={()=>press('left',true)} up={()=>press('left',false)}/><Pad label="▼" down={()=>press('down',true)} up={()=>press('down',false)}/><Pad label="▶" down={()=>press('right',true)} up={()=>press('right',false)}/></div>
      <div style={{display:'flex',justifyContent:'flex-end',gap:7}}><button onClick={()=>{localStorage.removeItem(SAVE_KEY);location.reload()}} style={smallBtn}>RESET</button><button onClick={()=>setPaused(v=>!v)} style={smallBtn}>{paused?'PLAY':'PAUSE'}</button></div>
    </footer>
  </div>
}

function Pad({label,down,up}:{label:string;down:()=>void;up:()=>void}){return <button aria-label={`Move ${label}`} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);down()}} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} style={{width:54,height:44,borderRadius:12,border:'1px solid #4a6a82',background:'#0d1a28',color:'#fff',fontSize:17,fontWeight:900}}>{label}</button>}
const smallBtn:React.CSSProperties={border:'1px solid #3b5368',borderRadius:10,padding:'9px 10px',background:'#0d1722',color:'#fff',fontSize:9,fontWeight:900}
