import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { replacePrimitiveWithStreetVerseAsset } from '../services/streetverseAssetLoader'

const SAVE_KEY='tryamm.streetverse.living.v1'
const CHARACTER_KEY='tryamm.streetverse.playable-character.v1'
const START={x:0,z:54}
const ROAD_CENTERS=[-48,0,48]
const RESIDENT_ASSETS=['npc-citizen-a','npc-resident-premium-a','npc-resident-premium-b','npc-resident-premium-c']
const MISSIONS=[
  {id:'studio',label:'Aniyah 64 Track Studio',x:-42,z:-30},
  {id:'market',label:'All American Marketplace',x:42,z:-24},
  {id:'network',label:'All American Network',x:38,z:38},
  {id:'club',label:'Chicago After Dark',x:-38,z:38},
]

type Traffic={axis:'x'|'z';roadCenter:number;dir:1|-1;laneOffset:number;speed:number;phase:number}
type ResidentRoute={axis:'x'|'z';fixed:number;dir:1|-1;speed:number;phase:number}
type CharacterSelect={id?:string;label?:string;index?:number}

function loadSave(){try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}catch{return {}}}
function loadCharacter(){try{return JSON.parse(localStorage.getItem(CHARACTER_KEY)||'{}')?.character as CharacterSelect|undefined}catch{return undefined}}
function material(color:number,metalness=.1,roughness=.72){return new THREE.MeshStandardMaterial({color,metalness,roughness})}
function wrap(v:number,min=-88,max=88){const span=max-min;return min+((((v-min)%span)+span)%span)}
function nearestIntersection(v:number){return ROAD_CENTERS.reduce((best,n)=>Math.abs(v-n)<Math.abs(v-best)?n:best,ROAD_CENTERS[0])}
function approachingIntersection(v:number,dir:1|-1){const center=nearestIntersection(v);const distance=(center-v)*dir;return distance>0&&distance<10}

function makeResident(i:number){
  const g=new THREE.Group()
  const skin=[0x5a321f,0x7a4a2f,0x9a6244,0xbd805b,0xd2a075,0xe2b899][i%6]
  const shirt=[0xff6f9e,0x65d8ff,0xffcf67,0x75e08e,0xb58cff,0xff8e62][i%6]
  const pants=[0x202936,0x283548,0x35313c,0x172d3d][i%4]
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.43,1.05,4,8),material(shirt,.05,.72));torso.position.y=1.55;torso.castShadow=true;g.add(torso)
  const head=new THREE.Mesh(new THREE.SphereGeometry(.38,12,10),material(skin,0,.62));head.position.y=2.78;head.castShadow=true;g.add(head)
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.39,10,8,0,Math.PI*2,0,Math.PI*.48),material([0x16120f,0x2b1c15,0x473126][i%3],0,.92));hair.position.y=2.9;g.add(hair)
  for(const side of [-1,1]){
    const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.72,3,6),material(skin,0,.66));arm.position.set(side*.55,1.65,0);arm.rotation.z=side*.14;g.add(arm)
    const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.15,.78,3,6),material(pants,0,.85));leg.position.set(side*.2,.52,0);g.add(leg)
  }
  const shoes=new THREE.Mesh(new THREE.BoxGeometry(.62,.18,.72),material(0x15171b,.05,.92));shoes.position.set(0,.12,-.08);g.add(shoes)
  return g
}

function makeCar(i:number){
  const car=new THREE.Group()
  const color=[0xe84141,0x3f8cff,0xe8c84b,0xeaeaea,0x1f1f27,0x4ccf8a][i%6]
  const shell=new THREE.Mesh(new THREE.BoxGeometry(4.9,1.12,2.2),material(color,.55,.3));shell.position.y=1;shell.castShadow=true;car.add(shell)
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.45,.84,1.88),material(0x83b9d6,.7,.18));cabin.position.set(-.25,1.78,0);cabin.castShadow=true;car.add(cabin)
  const hood=new THREE.Mesh(new THREE.BoxGeometry(.9,.18,1.92),material(color,.5,.3));hood.position.set(2.05,1.47,0);car.add(hood)
  for(const sx of [-1.5,1.5])for(const sz of [-1,1]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.3,12),material(0x111111,0,.9));wheel.rotation.x=Math.PI/2;wheel.position.set(sx,.55,sz*1.05);car.add(wheel)}
  for(const z of [-.68,.68]){
    const headlight=new THREE.Mesh(new THREE.BoxGeometry(.08,.26,.34),new THREE.MeshBasicMaterial({color:0xfff2c2}));headlight.position.set(2.47,1.03,z);car.add(headlight)
    const tail=new THREE.Mesh(new THREE.BoxGeometry(.08,.25,.32),new THREE.MeshBasicMaterial({color:0xff293d}));tail.position.set(-2.47,1.02,z);car.add(tail)
  }
  return car
}

export default function StreetVerseLivingWorld({onClose}:{onClose:()=>void}){
  const mountRef=useRef<HTMLDivElement|null>(null)
  const inputRef=useRef({up:false,down:false,left:false,right:false})
  const visitedRef=useRef<string[]>(loadSave().visited||[])
  const [visited,setVisited]=useState<string[]>(visitedRef.current)
  const [message,setMessage]=useState('Welcome to District 01. Explore the living city and reach the glowing mission beacons.')
  const [paused,setPaused]=useState(false)
  const [assetStatus,setAssetStatus]=useState('PROCEDURAL CITY • 24 RESIDENTS • 20 VEHICLES')
  const [signalStatus,setSignalStatus]=useState('E/W GO • N/S WALK')
  const [activeCharacter,setActiveCharacter]=useState(()=>loadCharacter()?.label||'YOU')

  useEffect(()=>{visitedRef.current=visited},[visited])

  useEffect(()=>{
    const mount=mountRef.current
    if(!mount)return
    const saved=loadSave()
    const scene=new THREE.Scene();scene.background=new THREE.Color(0x07101d);scene.fog=new THREE.FogExp2(0x07101d,.007)
    const camera=new THREE.PerspectiveCamera(63,1,.1,600)
    const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;mount.appendChild(renderer.domElement)
    const hemi=new THREE.HemisphereLight(0x9bdcff,0x17111b,2.7);scene.add(hemi)
    const sun=new THREE.DirectionalLight(0xffe0bd,3.4);sun.position.set(55,90,25);sun.castShadow=true;scene.add(sun)

    const ground=new THREE.Mesh(new THREE.PlaneGeometry(190,190),material(0x142019,0,.98));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground)
    const roadMat=material(0x1c2029,0,.98),sidewalkMat=material(0x6c7073,0,.95),laneMat=new THREE.MeshBasicMaterial({color:0xe8d97a}),crosswalkMat=new THREE.MeshBasicMaterial({color:0xf4f5ef})
    for(const z of ROAD_CENTERS){const road=new THREE.Mesh(new THREE.BoxGeometry(190,.12,14),roadMat);road.position.set(0,.07,z);scene.add(road);for(const dz of [-9,9]){const walk=new THREE.Mesh(new THREE.BoxGeometry(190,.2,3),sidewalkMat);walk.position.set(0,.12,z+dz);scene.add(walk)}for(let x=-84;x<=84;x+=12){const mark=new THREE.Mesh(new THREE.BoxGeometry(6,.03,.16),laneMat);mark.position.set(x,.145,z);scene.add(mark)}}
    for(const x of ROAD_CENTERS){const road=new THREE.Mesh(new THREE.BoxGeometry(14,.12,190),roadMat);road.position.set(x,.07,0);scene.add(road);for(const dx of [-9,9]){const walk=new THREE.Mesh(new THREE.BoxGeometry(3,.2,190),sidewalkMat);walk.position.set(x+dx,.12,0);scene.add(walk)}for(let z=-84;z<=84;z+=12){const mark=new THREE.Mesh(new THREE.BoxGeometry(.16,.03,6),laneMat);mark.position.set(x,.145,z);scene.add(mark)}}
    for(const x of ROAD_CENTERS)for(const z of ROAD_CENTERS){for(const offset of [-5,-3,-1,1,3,5]){const eastWest=new THREE.Mesh(new THREE.BoxGeometry(.7,.035,5.2),crosswalkMat);eastWest.position.set(x+offset,.17,z+7.15);scene.add(eastWest);const northSouth=new THREE.Mesh(new THREE.BoxGeometry(5.2,.035,.7),crosswalkMat);northSouth.position.set(x+7.15,.17,z+offset);scene.add(northSouth)}}

    const signalLights:{axis:'x'|'z';lamp:THREE.Mesh}[]=[]
    for(const x of ROAD_CENTERS)for(const z of ROAD_CENTERS)for(const axis of ['x','z'] as const){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.1,.12,3.8,8),material(0x33383e,.7,.3));pole.position.set(x+(axis==='x'?8.5:-8.5),1.9,z+(axis==='z'?8.5:-8.5));scene.add(pole);const lamp=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),new THREE.MeshBasicMaterial({color:0x43ff7b}));lamp.position.copy(pole.position);lamp.position.y=3.85;scene.add(lamp);signalLights.push({axis,lamp})}

    const collisionBoxes:THREE.Box3[]=[]
    const districtColors=[0x223a51,0x352a4b,0x2f4a3e,0x54392d,0x29485b,0x4b2e46]
    const buildingPositions=[[-70,-70],[-70,-25],[-70,25],[-70,70],[-25,-70],[-25,-25],[-25,25],[-25,70],[25,-70],[25,-25],[25,25],[25,70],[70,-70],[70,-25],[70,25],[70,70]]
    buildingPositions.forEach(([x,z],i)=>{const h=14+((i*11)%30),w=16+(i%3)*3,d=16+((i+1)%3)*3;const building=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(districtColors[i%districtColors.length],.18,.68));building.position.set(x,h/2,z);building.castShadow=true;building.receiveShadow=true;scene.add(building);collisionBoxes.push(new THREE.Box3().setFromObject(building).expandByScalar(1.2))})

    const shopDefs=[{x:-42,z:-30,c:0xb96cff},{x:42,z:-24,c:0x5be7ff},{x:38,z:38,c:0xffc95b},{x:-38,z:38,c:0xff4f9a}]
    shopDefs.forEach(shop=>{const base=new THREE.Mesh(new THREE.BoxGeometry(15,7,11),material(shop.c,.28,.42));base.position.set(shop.x,3.5,shop.z);base.castShadow=true;scene.add(base);const glow=new THREE.PointLight(shop.c,14,24,2);glow.position.set(shop.x,5,shop.z+7);scene.add(glow);collisionBoxes.push(new THREE.Box3().setFromObject(base).expandByScalar(.8))})

    const trees:THREE.Group[]=[];for(let i=0;i<34;i++){const g=new THREE.Group();const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.35,.48,3,8),material(0x69482f));trunk.position.y=1.5;g.add(trunk);const crown=new THREE.Mesh(new THREE.SphereGeometry(1.7,10,8),material(i%3?0x256b3f:0x34794d));crown.position.y=4;g.add(crown);const side=i%2?1:-1;g.position.set(side*(18+(i%4)*16),0,-78+(i*11)%156);scene.add(g);trees.push(g)}
    const streetLights:THREE.Group[]=[];for(let i=0;i<18;i++){const g=new THREE.Group();const pole=new THREE.Mesh(new THREE.CylinderGeometry(.12,.16,6,8),material(0x353b45,.7,.3));pole.position.y=3;g.add(pole);const lamp=new THREE.PointLight(0xffd7a0,5,18,2);lamp.position.y=6.2;g.add(lamp);g.position.set(i%2?10:-10,0,-76+i*9);scene.add(g);streetLights.push(g)}

    const avatar=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(1.05,2.2,5,10),material(0x58e8ff,.38,.32));body.position.y=2.2;body.castShadow=true;avatar.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.78,18,14),material(0xc98e67,0,.58));head.position.y=4.25;avatar.add(head);avatar.position.set(saved.x??START.x,0,saved.z??START.z);scene.add(avatar)
    replacePrimitiveWithStreetVerseAsset({id:'player-default',fallback:avatar,scene,position:avatar.position.clone()}).then(ok=>ok&&setAssetStatus('PLAYER GLB • RESIDENT GLB GATE ACTIVE • 20 VEHICLES'))

    const npcs:THREE.Group[]=[]
    for(let i=0;i<24;i++){
      const anchor=new THREE.Group();const fallback=makeResident(i);anchor.add(fallback)
      const horizontal=i<16;const dir=(i%2===0?1:-1) as 1|-1;const route:ResidentRoute=horizontal?{axis:'x',fixed:i<8?-18:18,dir,speed:1.7+(i%5)*.18,phase:i*9}:{axis:'z',fixed:i<20?-18:18,dir,speed:1.55+(i%4)*.2,phase:i*11};anchor.userData.route=route
      if(route.axis==='x')anchor.position.set(wrap(-78+route.phase),0,route.fixed);else anchor.position.set(route.fixed,0,wrap(-78+route.phase));scene.add(anchor);npcs.push(anchor)
      const id=RESIDENT_ASSETS[i%RESIDENT_ASSETS.length]
      replacePrimitiveWithStreetVerseAsset({id,fallback,scene,parent:anchor,position:new THREE.Vector3(0,0,0),requireClearance:true}).then(ok=>{if(ok)setAssetStatus('GLB RESIDENTS • SMART CROSSWALKS • 20 VEHICLES')})
    }

    let controlled:THREE.Group=avatar
    let controlledIndex=-1
    const selectCharacter=(detail:CharacterSelect)=>{
      const requested=Number(detail.index)
      if(Number.isInteger(requested)&&requested>=0&&requested<npcs.length){
        controlledIndex=requested;controlled=npcs[requested];avatar.visible=false;controlled.userData.playerControlled=true
        setActiveCharacter(detail.label||`RESIDENT ${String(requested+1).padStart(2,'0')}`)
        setMessage(`${detail.label||`Resident ${requested+1}`} is now player-controlled. WASD, arrows, touch and gamepad now move this character.`)
      }else{
        if(controlledIndex>=0&&npcs[controlledIndex])npcs[controlledIndex].userData.playerControlled=false
        controlledIndex=-1;controlled=avatar;avatar.visible=true;setActiveCharacter(detail.label||'YOU');setMessage('Main StreetVerse character restored to player control.')
      }
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-controlled',{detail:{id:detail.id||'you',label:detail.label||'YOU',index:controlledIndex,x:controlled.position.x,z:controlled.position.z}}))
    }
    const onCharacterSelect=(event:Event)=>selectCharacter((event as CustomEvent<CharacterSelect>).detail||{})
    addEventListener('tryamm:streetverse-character-select',onCharacterSelect)
    const initialCharacter=loadCharacter();if(initialCharacter)selectCharacter(initialCharacter)

    const cars:THREE.Group[]=[]
    for(let i=0;i<20;i++){const car=makeCar(i);const horizontal=i<12;const dir=(i%2===0?1:-1) as 1|-1;const roadCenter=horizontal?(i<6?-48:48):(i<16?-48:48);const traffic:Traffic={axis:horizontal?'x':'z',roadCenter,dir,laneOffset:dir>0?2.4:-2.4,speed:8.5+(i%5)*1.05,phase:i*13};car.userData.traffic=traffic;if(horizontal){car.position.set(wrap(-82+traffic.phase),.05,roadCenter+traffic.laneOffset);car.rotation.y=dir>0?0:Math.PI}else{car.position.set(roadCenter+traffic.laneOffset,.05,wrap(-82+traffic.phase));car.rotation.y=dir>0?-Math.PI/2:Math.PI/2}scene.add(car);cars.push(car)}

    const dogs:THREE.Group[]=[];for(let i=0;i<3;i++){const dog=new THREE.Group();const dogBody=new THREE.Mesh(new THREE.BoxGeometry(1.6,.75,.7),material(i?0x8a5b35:0x303033));dogBody.position.y=.75;dog.add(dogBody);dog.position.set(-20+i*22,0,62-i*15);scene.add(dog);dogs.push(dog)}
    const birds:THREE.Mesh[]=[];for(let i=0;i<9;i++){const bird=new THREE.Mesh(new THREE.ConeGeometry(.28,.8,5),material(0xd9e8f5,.15,.7));bird.rotation.z=Math.PI/2;scene.add(bird);birds.push(bird)}

    const beacons=new Map<string,THREE.Group>();MISSIONS.forEach(m=>{const g=new THREE.Group();g.position.set(m.x,0,m.z);const ring=new THREE.Mesh(new THREE.TorusGeometry(2.4,.22,12,44),new THREE.MeshBasicMaterial({color:0xffd45e}));ring.rotation.x=Math.PI/2;ring.position.y=.35;g.add(ring);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.35,.9,12,18,1,true),new THREE.MeshBasicMaterial({color:0x55ddff,transparent:true,opacity:.2,side:THREE.DoubleSide}));beam.position.y=6;g.add(beam);scene.add(g);beacons.set(m.id,g)})

    const keys=new Set<string>();const down=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(k)){e.preventDefault();keys.add(k)}};const up=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase());addEventListener('keydown',down,{passive:false});addEventListener('keyup',up)
    const resize=()=>{const w=mount.clientWidth,h=Math.max(420,mount.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};const ro=new ResizeObserver(resize);ro.observe(mount);resize()
    const clock=new THREE.Clock(),tmp=new THREE.Vector3(),desiredCam=new THREE.Vector3();let raf=0,lastSave=0,elapsed=0,lastWorldPulse=0,lastSignalPhase=-1
    const collides=(x:number,z:number)=>collisionBoxes.some(box=>box.containsPoint(tmp.set(x,2,z)))
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-enter',{detail:{district:'01',residents:npcs.length,vehicles:cars.length,smartIntersections:true}}))

    const animate=()=>{
      const dt=Math.min(.033,clock.getDelta());elapsed+=dt
      const phase=Math.floor(elapsed/8)%2;const eastWestGreen=phase===0
      if(phase!==lastSignalPhase){lastSignalPhase=phase;setSignalStatus(eastWestGreen?'E/W GO • N/S WALK':'N/S GO • E/W WALK');window.dispatchEvent(new CustomEvent('tryamm:streetverse-signal',{detail:{eastWestGreen,phase}}))}
      signalLights.forEach(s=>{(s.lamp.material as THREE.MeshBasicMaterial).color.setHex((s.axis==='x'?eastWestGreen:!eastWestGreen)?0x43ff7b:0xff3f54)})
      const input=inputRef.current;let dx=0,dz=0;if(keys.has('w')||keys.has('arrowup')||input.up)dz-=1;if(keys.has('s')||keys.has('arrowdown')||input.down)dz+=1;if(keys.has('a')||keys.has('arrowleft')||input.left)dx-=1;if(keys.has('d')||keys.has('arrowright')||input.right)dx+=1
      const gp=(navigator.getGamepads?.()||[])[0];if(gp){dx+=Math.abs(gp.axes[0]||0)>.18?(gp.axes[0]||0):0;dz+=Math.abs(gp.axes[1]||0)>.18?(gp.axes[1]||0):0}
      if(!paused&&(dx||dz)){const len=Math.hypot(dx,dz)||1;dx/=len;dz/=len;const speed=(keys.has('shift')?28:18)*dt;const nx=THREE.MathUtils.clamp(controlled.position.x+dx*speed,-88,88),nz=THREE.MathUtils.clamp(controlled.position.z+dz*speed,-88,88);if(!collides(nx,controlled.position.z))controlled.position.x=nx;if(!collides(controlled.position.x,nz))controlled.position.z=nz;controlled.rotation.y=Math.atan2(dx,dz)}
      npcs.forEach((npc,i)=>{if(i===controlledIndex){npc.position.y=0;return}const r=npc.userData.route as ResidentRoute;const walkAllowed=r.axis==='x'?!eastWestGreen:eastWestGreen;const current=r.axis==='x'?npc.position.x:npc.position.z;const stop=approachingIntersection(current,r.dir)&&!walkAllowed;const speed=stop?0:r.speed;const travel=wrap(-88+elapsed*speed*r.dir+r.phase);if(r.axis==='x'){npc.position.x=travel;npc.position.z=r.fixed;npc.rotation.y=r.dir>0?Math.PI/2:-Math.PI/2}else{npc.position.x=r.fixed;npc.position.z=travel;npc.rotation.y=r.dir>0?0:Math.PI}npc.position.y=Math.sin(elapsed*5+i)*.025})
      cars.forEach(car=>{const t=car.userData.traffic as Traffic;const current=t.axis==='x'?car.position.x:car.position.z;const green=t.axis==='x'?eastWestGreen:!eastWestGreen;const stop=approachingIntersection(current,t.dir)&&!green;const effective=stop?0:t.speed;const travel=wrap(-88+elapsed*effective*t.dir+t.phase);if(t.axis==='x'){car.position.x=travel;car.position.z=t.roadCenter+t.laneOffset;car.rotation.y=t.dir>0?0:Math.PI}else{car.position.x=t.roadCenter+t.laneOffset;car.position.z=travel;car.rotation.y=t.dir>0?-Math.PI/2:Math.PI/2}})
      dogs.forEach((dog,i)=>{dog.position.x+=Math.sin(elapsed*.8+i)*dt*.8;dog.rotation.y=Math.sin(elapsed+i)});birds.forEach((bird,i)=>{const a=elapsed*.35+i*.68,b=26+i%3*4;bird.position.set(Math.cos(a)*b,18+i%3*3,Math.sin(a)*b);bird.rotation.y=-a});trees.forEach((tree,i)=>{tree.rotation.z=Math.sin(elapsed*.7+i)*.015})
      MISSIONS.forEach(m=>{const g=beacons.get(m.id);if(g)g.rotation.y+=dt*.9;const d=Math.hypot(controlled.position.x-m.x,controlled.position.z-m.z);if(d<4.5&&!visitedRef.current.includes(m.id)){const next=[...visitedRef.current,m.id];visitedRef.current=next;setVisited(next);setMessage(`Checkpoint reached: ${m.label}. ${MISSIONS.length-next.length} district objective${MISSIONS.length-next.length===1?'':'s'} remaining.`)}})
      const day=(Math.sin(elapsed*.03)+1)/2;sun.intensity=1.5+day*2.4;hemi.intensity=1.4+day*1.6;streetLights.forEach(g=>{g.visible=day<.56})
      desiredCam.set(controlled.position.x,11,controlled.position.z+16);camera.position.lerp(desiredCam,1-Math.pow(.001,dt));camera.lookAt(controlled.position.x,2.5,controlled.position.z-4)
      const now=performance.now();window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-position',{detail:{x:controlled.position.x,z:controlled.position.z,character:activeCharacter,index:controlledIndex}}));if(now-lastWorldPulse>650){const car=cars[Math.floor(elapsed)%cars.length],npc=npcs[Math.floor(elapsed*1.7)%npcs.length];window.dispatchEvent(new CustomEvent('tryamm:world-sound',{detail:{kind:'vehicle',x:car.position.x,z:car.position.z,speed:(car.userData.traffic as Traffic).speed,level:.08}}));window.dispatchEvent(new CustomEvent('tryamm:world-sound',{detail:{kind:'footstep',x:npc.position.x,z:npc.position.z,level:.035}}));lastWorldPulse=now}if(now-lastSave>900){localStorage.setItem(SAVE_KEY,JSON.stringify({x:controlled.position.x,z:controlled.position.z,controlledIndex,character:activeCharacter,visited:visitedRef.current,updatedAt:new Date().toISOString()}));lastSave=now}
      renderer.render(scene,camera);raf=requestAnimationFrame(animate)
    }
    animate()
    return()=>{window.dispatchEvent(new CustomEvent('tryamm:streetverse-exit',{detail:{district:'01'}}));cancelAnimationFrame(raf);ro.disconnect();removeEventListener('keydown',down);removeEventListener('keyup',up);removeEventListener('tryamm:streetverse-character-select',onCharacterSelect);renderer.dispose();renderer.domElement.remove()}
  },[paused])

  const press=(key:keyof typeof inputRef.current,value:boolean)=>{inputRef.current[key]=value}
  return <div role="dialog" aria-modal="true" aria-label="StreetVerse Living World" style={{position:'fixed',inset:0,zIndex:16000,background:'#02040a',color:'#fff',display:'grid',gridTemplateRows:'auto 1fr auto',fontFamily:'Inter,system-ui,sans-serif'}}>
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,padding:'9px 12px',background:'#050a12ee',borderBottom:'1px solid #28425a'}}><div><div style={{fontSize:9,fontWeight:950,letterSpacing:2,color:'#59e7ff'}}>STREETVERSE • CHICAGO • LIVING WORLD</div><div style={{fontWeight:950,fontSize:'clamp(18px,4vw,29px)'}}>District 01</div><div style={{fontSize:9,color:'#ffd45e',marginTop:3}}>PLAYING AS • {activeCharacter}</div></div><div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:9,color:'#8effb7'}}>{assetStatus}</span><button onClick={onClose} aria-label="Close StreetVerse" style={{width:42,height:42,borderRadius:13,border:'1px solid #3a5369',background:'#0c1520',color:'#fff',fontSize:22}}>×</button></div></header>
    <main style={{position:'relative',minHeight:0}}><div ref={mountRef} style={{position:'absolute',inset:0,minHeight:420}}/><div style={{position:'absolute',left:10,top:10,maxWidth:340,padding:10,borderRadius:14,background:'#030914dc',border:'1px solid #2b485e',backdropFilter:'blur(9px)'}}><div style={{fontSize:9,color:'#ffd45e',fontWeight:950}}>LIVING CITY MISSION</div><div style={{fontSize:12,lineHeight:1.45,marginTop:5}}>{message}</div><div style={{fontSize:10,marginTop:7,color:visited.length===MISSIONS.length?'#79ffad':'#b7c6d5'}}>{visited.length}/{MISSIONS.length} locations {visited.length===MISSIONS.length?'• DISTRICT COMPLETE ✓':''}</div></div><div style={{position:'absolute',right:10,top:10,display:'grid',gap:5,justifyItems:'end'}}><div style={{padding:'7px 9px',borderRadius:999,background:'#030914dc',border:'1px solid #2b485e',fontSize:9}}>24 PLAYABLE RESIDENTS • 20 TRAFFIC VEHICLES • SMART INTERSECTIONS</div><div style={{padding:'7px 9px',borderRadius:999,background:'#030914dc',border:'1px solid #2b485e',fontSize:9,color:'#8effb7'}}>{signalStatus}</div></div></main>
    <footer style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:8,padding:'8px 10px',background:'#050912',borderTop:'1px solid #24384b'}}><div style={{fontSize:9,color:'#8fa5b7'}}>WASD/arrows • Shift run • touch • standard gamepad • character switcher</div><div style={{display:'grid',gridTemplateColumns:'54px 54px 54px',gap:4,touchAction:'none',userSelect:'none'}}><span/><Pad label="▲" down={()=>press('up',true)} up={()=>press('up',false)}/><span/><Pad label="◀" down={()=>press('left',true)} up={()=>press('left',false)}/><Pad label="▼" down={()=>press('down',true)} up={()=>press('down',false)}/><Pad label="▶" down={()=>press('right',true)} up={()=>press('right',false)}/></div><div style={{display:'flex',justifyContent:'flex-end',gap:7}}><button onClick={()=>{localStorage.removeItem(SAVE_KEY);location.reload()}} style={smallBtn}>RESET</button><button onClick={()=>setPaused(v=>!v)} style={smallBtn}>{paused?'PLAY':'PAUSE'}</button></div></footer>
  </div>
}

function Pad({label,down,up}:{label:string;down:()=>void;up:()=>void}){return <button aria-label={`Move ${label}`} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);down()}} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} style={{width:54,height:44,borderRadius:12,border:'1px solid #4a6a82',background:'#0d1a28',color:'#fff',fontSize:17,fontWeight:900}}>{label}</button>}
const smallBtn:React.CSSProperties={border:'1px solid #3b5368',borderRadius:10,padding:'9px 10px',background:'#0d1722',color:'#fff',fontSize:9,fontWeight:900}