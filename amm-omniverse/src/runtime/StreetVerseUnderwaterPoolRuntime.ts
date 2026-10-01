import * as THREE from 'three'

export type StreetVerseSwimStroke='freestyle'|'breaststroke'|'backstroke'|'dolphin'
type SwimCommand='stroke'|'kick'|'dive'|'ascend'|'left'|'right'|'surface'

export function createStreetVerseUnderwaterPoolRuntime(scene:THREE.Scene,camera:THREE.PerspectiveCamera,avatar:THREE.Group){
 const root=new THREE.Group();root.name='streetverse-underwater-pool-runtime';scene.add(root)
 root.visible=false

 const poolFloor=new THREE.Mesh(new THREE.BoxGeometry(13.5,.14,7.5),new THREE.MeshLambertMaterial({color:0xb9dbe2}))
 poolFloor.position.set(5,-2.35,63);root.add(poolFloor)
 const tileMat=new THREE.MeshBasicMaterial({color:0x2b83a4,transparent:true,opacity:.66})
 for(let x=-1;x<=11;x+=2){const line=new THREE.Mesh(new THREE.BoxGeometry(.035,.025,7.2),tileMat);line.position.set(x,-2.25,63);root.add(line)}
 for(let z=60;z<=66;z+=2){const line=new THREE.Mesh(new THREE.BoxGeometry(13.2,.025,.035),tileMat);line.position.set(5,-2.24,z);root.add(line)}
 const laneMat=new THREE.MeshBasicMaterial({color:0x154f78})
 for(const x of [1.6,5,8.4]){const lane=new THREE.Mesh(new THREE.BoxGeometry(.08,.035,6.8),laneMat);lane.position.set(x,-2.20,63);root.add(lane)}
 const wallMat=new THREE.MeshLambertMaterial({color:0xa8d1dc,side:THREE.DoubleSide})
 for(const [size,pos] of [
  [[13.5,2.55,.16],[5,-1.08,59.28]],[[13.5,2.55,.16],[5,-1.08,66.72]],
  [[.16,2.55,7.5],[-1.72,-1.08,63]],[[.16,2.55,7.5],[11.72,-1.08,63]],
 ] as [[number,number,number],[number,number,number]][]){const wall=new THREE.Mesh(new THREE.BoxGeometry(...size),wallMat);wall.position.set(...pos);root.add(wall)}

 const surface=new THREE.Mesh(new THREE.PlaneGeometry(13.4,7.4,16,10),new THREE.MeshBasicMaterial({color:0x59c7e8,transparent:true,opacity:.24,side:THREE.DoubleSide,depthWrite:false}))
 surface.rotation.x=-Math.PI/2;surface.position.set(5,.20,63);root.add(surface)

 const caustics:THREE.Mesh[]=[]
 for(let i=0;i<5;i++){const c=new THREE.Mesh(new THREE.RingGeometry(.35+i*.06,.44+i*.06,20),new THREE.MeshBasicMaterial({color:0xbaf5ff,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide}));c.rotation.x=-Math.PI/2;c.position.set(-.3+i*2.65,-2.12,61+(i%2)*3.6);c.scale.set(2.2,.85,1);root.add(c);caustics.push(c)}

 const bubbles:THREE.Mesh[]=[]
 for(let i=0;i<26;i++){const bubble=new THREE.Mesh(new THREE.SphereGeometry(.035+(i%4)*.012,6,5),new THREE.MeshBasicMaterial({color:0xd9f8ff,transparent:true,opacity:.55,depthWrite:false}));bubble.visible=false;root.add(bubble);bubbles.push(bubble)}

 const arms=avatar.children.filter(x=>x.name==='hero-arm')
 const legs=avatar.children.filter(x=>x.name==='hero-leg')
 const originalFog=scene.fog
 const originalBackground=scene.background
 const ground=scene.getObjectByName('streetverse-ground') as THREE.Object3D|null
 let groundWasVisible=true
 let active=false,stroke:StreetVerseSwimStroke='freestyle',yaw=Math.PI,depth=1.0,speed=0,verticalVelocity=0,strokeBurst=0,lastTick=performance.now()
 const home=new THREE.Vector3(5,-.85,64.7)

 const setUnderwaterLook=(on:boolean)=>{
  if(on){
   scene.fog=new THREE.FogExp2(0x0b6380,.082)
   scene.background=new THREE.Color(0x0a506b)
   if(ground){groundWasVisible=ground.visible;ground.visible=false}
  }else{
   scene.fog=originalFog
   scene.background=originalBackground
   if(ground)ground.visible=groundWasVisible
  }
 }

 const enter=(detail:Record<string,unknown>={})=>{
  active=true;root.visible=true;stroke=(String(detail.stroke||'freestyle') as StreetVerseSwimStroke)
  yaw=Math.PI;depth=1.0;speed=0;verticalVelocity=0;strokeBurst=0
  avatar.visible=true;avatar.position.copy(home);avatar.rotation.set(-Math.PI/2,yaw,0)
  setUnderwaterLook(true)
  window.dispatchEvent(new CustomEvent('tryamm:pool-underwater-state',{detail:{active:true,stroke,poolId:detail.poolId||'circle-park-pool'}}))
 }
 const exit=()=>{
  if(!active)return
  active=false;root.visible=false;speed=0;verticalVelocity=0
  avatar.rotation.set(0,0,0);avatar.position.set(5,0,67.6)
  arms.forEach(a=>a.rotation.set(0,0,a.position.x<0?-.12:.12));legs.forEach(l=>l.rotation.set(0,0,0))
  setUnderwaterLook(false)
  window.dispatchEvent(new CustomEvent('tryamm:pool-underwater-state',{detail:{active:false}}))
 }
 const command=(cmd:SwimCommand)=>{
  if(!active)return
  if(cmd==='stroke'){speed=Math.min(4.8,speed+1.7);strokeBurst=1}
  else if(cmd==='kick')speed=Math.min(5.4,speed+1.0)
  else if(cmd==='dive')verticalVelocity=-1.25
  else if(cmd==='ascend')verticalVelocity=1.15
  else if(cmd==='left')yaw+=.30
  else if(cmd==='right')yaw-=.30
  else if(cmd==='surface'){depth=.42;verticalVelocity=.35}
 }
 const onEnter=(e:Event)=>enter((e as CustomEvent<Record<string,unknown>>).detail||{})
 const onExit=()=>exit()
 const onCommand=(e:Event)=>command(String((e as CustomEvent<{command?:string}>).detail?.command||'stroke') as SwimCommand)
 const onStroke=(e:Event)=>{const value=String((e as CustomEvent<{stroke?:string}>).detail?.stroke||'freestyle');if(['freestyle','breaststroke','backstroke','dolphin'].includes(value))stroke=value as StreetVerseSwimStroke}
 window.addEventListener('tryamm:pool-underwater-enter',onEnter)
 window.addEventListener('tryamm:pool-underwater-exit',onExit)
 window.addEventListener('tryamm:pool-swim-command',onCommand)
 window.addEventListener('tryamm:pool-swim-stroke',onStroke)

 const tick=(now:number)=>{
  if(!active)return
  const dt=Math.min(.05,Math.max(0,(now-lastTick)/1000));lastTick=now
  speed=Math.max(0,speed-dt*.62);verticalVelocity*=Math.pow(.12,dt);depth=THREE.MathUtils.clamp(depth-verticalVelocity*dt,.35,2.05)
  const dirX=Math.sin(yaw),dirZ=Math.cos(yaw)
  avatar.position.x=THREE.MathUtils.clamp(avatar.position.x+dirX*speed*dt,-1.1,11.1)
  avatar.position.z=THREE.MathUtils.clamp(avatar.position.z+dirZ*speed*dt,59.7,66.3)
  avatar.position.y=.18-depth+Math.sin(now*.004)*.035
  avatar.rotation.x=stroke==='backstroke'?Math.PI/2:-Math.PI/2
  avatar.rotation.y=yaw
  strokeBurst=Math.max(0,strokeBurst-dt*1.7)
  const cycle=now*.001*(stroke==='dolphin'?8.8:stroke==='breaststroke'?5.2:7.2)
  const amp=.35+.65*strokeBurst
  arms.forEach((a,i)=>{
   if(stroke==='breaststroke'){a.rotation.x=Math.sin(cycle)*1.05*amp;a.rotation.z=(i?1:-1)*(.35+.45*Math.cos(cycle))}
   else if(stroke==='backstroke'){a.rotation.x=(i?1:-1)*Math.sin(cycle)*1.35*amp}
   else{a.rotation.x=(i?1:-1)*Math.sin(cycle)*1.55*amp;a.rotation.z=(i?1:-1)*.16}
  })
  legs.forEach((l,i)=>{
   const kick=stroke==='dolphin'?Math.sin(cycle)*.72:Math.sin(cycle+(i?Math.PI:0))*.48
   l.rotation.x=kick*amp
  })
  const camBehind=stroke==='backstroke'?4.4:3.8
  camera.position.lerp(new THREE.Vector3(avatar.position.x-dirX*camBehind,avatar.position.y+1.05,avatar.position.z-dirZ*camBehind),.14)
  camera.lookAt(avatar.position.x+dirX*2.4,avatar.position.y+.25,avatar.position.z+dirZ*2.4)
  bubbles.forEach((b,i)=>{
   b.visible=true
   const age=(now*.001+i*.19)%2.1
   b.position.set(avatar.position.x-dirX*.55+Math.sin(i*2.1)*.35,avatar.position.y+.55+age*.75,avatar.position.z-dirZ*.55+Math.cos(i*1.7)*.35)
   ;(b.material as THREE.MeshBasicMaterial).opacity=Math.max(0,.55-age*.24)
  })
  caustics.forEach((c,i)=>{c.rotation.z=Math.sin(now*.0008+i)*.28;c.scale.x=1.9+.35*Math.sin(now*.0012+i);(c.material as THREE.MeshBasicMaterial).opacity=.11+.07*Math.sin(now*.0015+i)})
  const pos=surface.geometry.getAttribute('position')
  for(let i=0;i<pos.count;i++)pos.setZ(i,Math.sin(now*.003+i*.7)*.045)
  pos.needsUpdate=true
 }

 const dispose=()=>{exit();window.removeEventListener('tryamm:pool-underwater-enter',onEnter);window.removeEventListener('tryamm:pool-underwater-exit',onExit);window.removeEventListener('tryamm:pool-swim-command',onCommand);window.removeEventListener('tryamm:pool-swim-stroke',onStroke);root.removeFromParent();root.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose())}})}
 return{tick,enter,exit,command,dispose,isActive:()=>active}
}
