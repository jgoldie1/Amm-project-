import * as THREE from 'three'

type Point={x:number;z:number}
type WindowRig={panel:THREE.Mesh;frame:THREE.Mesh;buildingX:number;buildingZ:number;phase:number;open:number;lastState:boolean}
type ElevatorRig={cab:THREE.Group;shaft:THREE.Group;buildingX:number;buildingZ:number;minY:number;maxY:number;phase:number;lastFloor:number}

let installed=false
let active=false
let root:HTMLDivElement|null=null
let renderer:THREE.WebGLRenderer|null=null
let scene:THREE.Scene|null=null
let camera:THREE.PerspectiveCamera|null=null
let raf=0
let player:Point={x:0,z:58}
let targetPlayer:Point={x:0,z:58}
const windows:WindowRig[]=[]
const elevators:ElevatorRig[]=[]

const BUILDINGS:[number,number,number,number,number][]=[[-98,-72,22,28,20],[-98,-28,18,22,18],[-98,20,24,38,19],[-50,-72,19,24,18],[-50,-22,23,34,22],[-50,22,18,20,17],[5,-72,24,42,20],[5,-25,18,25,18],[5,22,22,36,20],[58,-72,20,30,19],[58,-25,22,44,20],[58,20,19,27,18],[105,-70,18,24,17],[105,-22,22,35,19],[105,20,20,31,18]]

function makeWindow(x:number,z:number,w:number,h:number,d:number,index:number){
  if(!scene)return
  const floors=Math.max(2,Math.floor((h-5)/5.5))
  const cols=Math.max(2,Math.min(4,Math.floor(w/5)))
  for(let fy=0;fy<floors;fy++)for(let cx=0;cx<cols;cx++){
    if((index+fy+cx)%2)continue
    const px=x+(cx-(cols-1)/2)*3.15
    const py=5+fy*5.4
    const frame=new THREE.Mesh(new THREE.BoxGeometry(2.05,2.25,.18),new THREE.MeshBasicMaterial({color:0x162231,transparent:true,opacity:.82,depthWrite:false}))
    frame.position.set(px,py,z+d/2+.13)
    scene.add(frame)
    const panelMat=new THREE.MeshBasicMaterial({color:(index+cx)%2?0xffc56e:0x68dfff,transparent:true,opacity:.72,side:THREE.DoubleSide,depthWrite:false,toneMapped:false})
    const panel=new THREE.Mesh(new THREE.PlaneGeometry(1.72,1.78),panelMat)
    panel.position.set(px,py,z+d/2+.25)
    panel.geometry.translate(-.86,0,0)
    scene.add(panel)
    windows.push({panel,frame,buildingX:x,buildingZ:z,phase:index*.71+fy*.83+cx*.39,open:0,lastState:false})
  }
}

function makeElevator(x:number,z:number,w:number,h:number,d:number,index:number){
  if(!scene||index%3!==0||h<24)return
  const shaft=new THREE.Group()
  const glass=new THREE.Mesh(new THREE.BoxGeometry(2.9,h-3,1.25),new THREE.MeshBasicMaterial({color:0x5ccfff,transparent:true,opacity:.08,depthWrite:false}))
  glass.position.y=(h-3)/2+1.5
  shaft.add(glass)
  for(let y=3;y<h-2;y+=4.5){
    const rail=new THREE.Mesh(new THREE.BoxGeometry(2.55,.06,.08),new THREE.MeshBasicMaterial({color:0x8be8ff,transparent:true,opacity:.22,depthWrite:false}))
    rail.position.set(0,y,.66)
    shaft.add(rail)
  }
  shaft.position.set(x+w*.28,0,z+d/2+.5)
  scene.add(shaft)
  const cab=new THREE.Group()
  const shell=new THREE.Mesh(new THREE.BoxGeometry(2.15,2.25,1),new THREE.MeshBasicMaterial({color:0xd8f7ff,transparent:true,opacity:.34,depthWrite:false}))
  cab.add(shell)
  const glow=new THREE.Mesh(new THREE.BoxGeometry(1.65,.14,1.03),new THREE.MeshBasicMaterial({color:0x65e9ff,transparent:true,opacity:.9,depthWrite:false,toneMapped:false}))
  glow.position.y=1.05
  cab.add(glow)
  cab.position.set(x+w*.28,3.2,z+d/2+.58)
  scene.add(cab)
  elevators.push({cab,shaft,buildingX:x,buildingZ:z,minY:3.2,maxY:h-3.2,phase:index*.63,lastFloor:-1})
}

function emit(kind:'window'|'elevator',x:number,z:number,detail:Record<string,unknown>={}){
  const level=kind==='window'?.055:.075
  const eventName=kind==='window'?'tryamm:world-sound':'tryamm:elevator-move'
  window.dispatchEvent(new CustomEvent(eventName,{detail:{kind:kind==='window'?'window':'elevator',x,z,level,...detail}}))
}

function build(){
  root=document.createElement('div')
  root.id='tryamm-streetverse-building-life-3d'
  Object.assign(root.style,{position:'fixed',inset:'0',zIndex:'20001',pointerEvents:'none',display:'none'})
  document.body.appendChild(root)
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'})
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.35))
  renderer.setClearColor(0x000000,0)
  renderer.outputColorSpace=THREE.SRGBColorSpace
  root.appendChild(renderer.domElement)
  scene=new THREE.Scene()
  camera=new THREE.PerspectiveCamera(60,1,.1,900)
  BUILDINGS.forEach((b,i)=>{makeWindow(...b,i);makeElevator(...b,i)})
  const resize=()=>{if(!renderer||!camera)return;const w=innerWidth,h=Math.max(430,innerHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
  addEventListener('resize',resize)
  resize()
}

function animate(){
  if(!active||!renderer||!scene||!camera){raf=requestAnimationFrame(animate);return}
  const t=performance.now()/1000
  player.x=THREE.MathUtils.lerp(player.x,targetPlayer.x,.08)
  player.z=THREE.MathUtils.lerp(player.z,targetPlayer.z,.08)
  const follow=new THREE.Vector3(player.x+11,8.5,player.z+14)
  camera.position.lerp(follow,.13)
  camera.lookAt(player.x,2.3,player.z)
  windows.forEach((w,i)=>{
    const wave=(Math.sin(t*.42+w.phase)+1)/2
    const target=wave>.76?1:0
    w.open=THREE.MathUtils.lerp(w.open,target,.035)
    w.panel.rotation.y=-w.open*Math.PI*.48
    const panelMat=w.panel.material as THREE.MeshBasicMaterial
    panelMat.opacity=.48+.3*(1-w.open)
    const isOpen=w.open>.55
    if(isOpen!==w.lastState){w.lastState=isOpen;emit('window',w.buildingX,w.buildingZ,{state:isOpen?'open':'closed',windowIndex:i})}
  })
  elevators.forEach((e,i)=>{
    const unit=(Math.sin(t*.22+e.phase)+1)/2
    const y=THREE.MathUtils.lerp(e.minY,e.maxY,unit)
    e.cab.position.y=y
    const floor=Math.round((y-e.minY)/4.5)
    if(floor!==e.lastFloor){e.lastFloor=floor;emit('elevator',e.buildingX,e.buildingZ,{floor,elevatorIndex:i,speed:.8})}
  })
  renderer.render(scene,camera)
  raf=requestAnimationFrame(animate)
}

function start(){active=true;if(root)root.style.display='block'}
function stop(){active=false;if(root)root.style.display='none'}

export function installStreetVerseBuildingLife3D(){
  if(installed||typeof window==='undefined')return
  installed=true
  build()
  window.addEventListener('tryamm:streetverse-enter',start)
  window.addEventListener('tryamm:streetverse-exit',stop)
  window.addEventListener('tryamm:streetverse-player-position',(event:Event)=>{const d=(event as CustomEvent<{x?:number;z?:number}>).detail||{};if(Number.isFinite(d.x)&&Number.isFinite(d.z))targetPlayer={x:Number(d.x),z:Number(d.z)}})
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-building-life-ready',{detail:{animatedWindowPanels:windows.length,animatedElevators:elevators.length,audioLinked:true,transparentWorldLayer:true}}))
  animate()
}
