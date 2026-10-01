import {useEffect,useMemo,useRef,useState} from 'react'
import * as THREE from 'three'
import {subscribeStreetVerseScene} from '../game/streetverseSceneRegistry'

type RoomId='entrance'|'classroom-101'|'classroom-102'|'classroom-201'|'science-lab'|'library'|'computer-lab'|'music-art'|'cafeteria'|'gym'|'locker-shower'|'nurse-office'
type Room={id:RoomId;label:string;subject:string;x:number;z:number;w:number;d:number}

const CAMPUS={
  id:'thomas-jefferson-legacy-campus',
  label:'Thomas Jefferson School • Legacy Campus',
  historicalAddress:'1522 W Fillmore St • Near West Side',
  exactHistoricalFloorplan:false,
  gameplayInterior:true,
  accessible:true,
} as const

const ROOMS:Room[]=[
  {id:'entrance',label:'Main Entrance / Welcome',subject:'orientation',x:-47,z:56,w:12,d:5},
  {id:'classroom-101',label:'Classroom 101',subject:'reading + language arts',x:-62,z:61,w:10,d:8},
  {id:'classroom-102',label:'Classroom 102',subject:'math',x:-62,z:71,w:10,d:8},
  {id:'science-lab',label:'Science Lab',subject:'science + experiments',x:-62,z:78,w:10,d:6},
  {id:'library',label:'Library / Media Center',subject:'reading + research',x:-49,z:61,w:10,d:8},
  {id:'cafeteria',label:'Cafeteria',subject:'meals + community',x:-49,z:71,w:10,d:8},
  {id:'music-art',label:'Music + Art Room',subject:'music + visual arts',x:-49,z:78,w:10,d:6},
  {id:'classroom-201',label:'Classroom 201',subject:'history + social studies',x:-35,z:61,w:10,d:8},
  {id:'computer-lab',label:'Computer Lab',subject:'coding + AI + digital literacy',x:-35,z:70,w:10,d:7},
  {id:'nurse-office',label:'Nurse + Student Support',subject:'wellness + support',x:-35,z:78,w:10,d:6},
  {id:'gym',label:'Gymnasium + Basketball Court',subject:'basketball + PE',x:-22,z:68,w:14,d:16},
  {id:'locker-shower',label:'Locker + Shower Facilities',subject:'privacy-safe PE facilities',x:-22,z:79,w:14,d:5},
]

const mat=(color:number)=>new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.06})
const floorMat=mat(0xbfae91),brickMat=mat(0x8b4a3b),trimMat=mat(0xe7dfcf),doorMat=mat(0x27485c),gymMat=mat(0xd49b55)

const signTexture=(text:string)=>{
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=128
  const ctx=canvas.getContext('2d')!;ctx.fillStyle='rgba(5,12,18,.92)';ctx.fillRect(0,0,640,128)
  ctx.strokeStyle='#e7dfcf';ctx.lineWidth=4;ctx.strokeRect(4,4,632,120);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='900 34px system-ui';ctx.fillText(text,320,64)
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture
}
const signSprite=(text:string,w=9,h=1.8)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:signTexture(text),transparent:true}));s.scale.set(w,h,1);return s}
const wall=(w:number,h:number,d:number,x:number,y:number,z:number,material=brickMat)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;return mesh}
const roomFloor=(room:Room)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(room.w,.12,room.d),room.id==='gym'?gymMat:floorMat);mesh.position.set(room.x,.06,room.z);mesh.receiveShadow=true;mesh.name='school-room-floor-'+room.id;mesh.userData={schoolRoomId:room.id,label:room.label};return mesh}

function addDeskRows(group:THREE.Group,room:Room,rows=2,cols=3){
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const desk=new THREE.Mesh(new THREE.BoxGeometry(1.25,.72,.62),mat(0x8f6846));desk.position.set(room.x-room.w*.24+c*1.75,.42,room.z-room.d*.20+r*1.65);group.add(desk)
    const chair=new THREE.Mesh(new THREE.BoxGeometry(.58,.62,.58),mat(0x33495b));chair.position.set(desk.position.x,.32,desk.position.z+.85);group.add(chair)
  }
}

function buildGym(group:THREE.Group,room:Room){
  group.add(roomFloor(room))
  const lineMat=new THREE.MeshBasicMaterial({color:0xf7f3dd})
  const center=new THREE.Mesh(new THREE.TorusGeometry(2,.07,6,36),lineMat);center.rotation.x=Math.PI/2;center.position.set(room.x,.14,room.z);group.add(center)
  const mid=new THREE.Mesh(new THREE.BoxGeometry(.08,.02,room.d-1),lineMat);mid.position.set(room.x,.14,room.z);group.add(mid)
  for(const sx of [-1,1]){
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,3.1,10),mat(0x202832));pole.position.set(room.x+sx*(room.w/2-1.3),1.55,room.z);group.add(pole)
    const board=new THREE.Mesh(new THREE.BoxGeometry(.12,2.2,3.1),mat(0xf3f5ef));board.position.set(room.x+sx*(room.w/2-1.3),3.0,room.z);group.add(board)
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.48,.06,6,24),new THREE.MeshStandardMaterial({color:0xe06b2f}));rim.rotation.y=Math.PI/2;rim.position.set(room.x+sx*(room.w/2-1.0),2.7,room.z);group.add(rim)
  }
}

function buildSchool(){
  const group=new THREE.Group();group.name='streetverse-thomas-jefferson-school'
  const collisionBoxes:THREE.Box3[]=[]
  const addWall=(mesh:THREE.Mesh)=>{group.add(mesh);collisionBoxes.push(new THREE.Box3().setFromObject(mesh))}
  const slab=new THREE.Mesh(new THREE.BoxGeometry(52,.25,30),mat(0x77736b));slab.position.set(-46,.12,68);group.add(slab)

  addWall(wall(52,2.8,.45,-46,1.4,82))
  addWall(wall(.45,2.8,30,-72,1.4,67))
  addWall(wall(.45,2.8,30,-20,1.4,67))
  addWall(wall(21,2.8,.45,-61.5,1.4,53))
  addWall(wall(21,2.8,.45,-30.5,1.4,53))

  const entranceSign=signSprite('THOMAS JEFFERSON SCHOOL • LEGACY CAMPUS',16,2.3);entranceSign.position.set(-46,4.1,52.7);group.add(entranceSign)
  const addressSign=signSprite('NEAR WEST SIDE • STREETVERSE RECONSTRUCTION',12,1.5);addressSign.position.set(-46,2.8,52.65);group.add(addressSign)
  const ramp=new THREE.Mesh(new THREE.BoxGeometry(7,.15,5),mat(0x8d8d87));ramp.position.set(-46,.08,50.5);group.add(ramp)
  const hall=new THREE.Mesh(new THREE.BoxGeometry(7,.10,25),mat(0xc9c3b6));hall.position.set(-46,.18,68);group.add(hall)

  for(const room of ROOMS){
    if(room.id==='entrance')continue
    if(room.id==='gym'){buildGym(group,room);continue}
    group.add(roomFloor(room))
    const label=signSprite(room.label.toUpperCase(),Math.min(10,room.w*.8),1.25);label.position.set(room.x,2.55,room.z-room.d/2+.35);group.add(label)
    if(room.id.startsWith('classroom'))addDeskRows(group,room,2,3)
    if(room.id==='science-lab')addDeskRows(group,room,2,2)
    if(room.id==='computer-lab'){
      addDeskRows(group,room,2,2)
      for(const x of [-1.8,1.8]){const monitor=new THREE.Mesh(new THREE.BoxGeometry(.9,.55,.08),mat(0x101820));monitor.position.set(room.x+x,1.16,room.z);group.add(monitor)}
    }
    if(room.id==='library'){
      for(let i=0;i<4;i++){const shelf=new THREE.Mesh(new THREE.BoxGeometry(.55,1.8,room.d-1.5),mat(0x725236));shelf.position.set(room.x-room.w/2+1.2+i*2.1,.95,room.z);group.add(shelf)}
    }
    if(room.id==='cafeteria'){
      for(let i=0;i<3;i++){const table=new THREE.Mesh(new THREE.BoxGeometry(5,.18,.9),mat(0x8f6846));table.position.set(room.x,.8,room.z-2+i*2);group.add(table)}
    }
    if(room.id==='music-art'){
      const piano=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.2,1),mat(0x171717));piano.position.set(room.x-2.5,.65,room.z);group.add(piano)
      const easel=new THREE.Mesh(new THREE.BoxGeometry(.12,1.8,1.2),mat(0x8c6748));easel.position.set(room.x+2.5,1,room.z);group.add(easel)
    }
    if(room.id==='nurse-office'){
      const bed=new THREE.Mesh(new THREE.BoxGeometry(3,.45,1.2),mat(0xddebf0));bed.position.set(room.x,.45,room.z);group.add(bed)
    }
    if(room.id==='locker-shower'){
      for(let i=0;i<5;i++){const locker=new THREE.Mesh(new THREE.BoxGeometry(.72,1.9,.55),mat(i%2?0x3e6a82:0x5d7d8d));locker.position.set(room.x-room.w/2+1+i*1.2,1,room.z-1);group.add(locker)}
      for(let i=0;i<3;i++){const stall=new THREE.Mesh(new THREE.BoxGeometry(1.6,2.0,1.6),new THREE.MeshStandardMaterial({color:0xdde6ea,transparent:true,opacity:.62}));stall.position.set(room.x+2.5+i*1.8,1,room.z+1);group.add(stall)}
    }
  }

  const gym=ROOMS.find(r=>r.id==='gym')!
  addWall(wall(.35,3.2,gym.d,gym.x-gym.w/2,1.6,gym.z,trimMat))
  addWall(wall(.35,3.2,gym.d,gym.x+gym.w/2,1.6,gym.z,trimMat))
  addWall(wall(gym.w,3.2,.35,gym.x,1.6,gym.z+gym.d/2,trimMat))
  addWall(wall(4.3,3.2,.35,gym.x-gym.w/2+2.15,1.6,gym.z-gym.d/2,trimMat))
  addWall(wall(4.3,3.2,.35,gym.x+gym.w/2-2.15,1.6,gym.z-gym.d/2,trimMat))
  const gymLabel=signSprite('GYMNASIUM • BASKETBALL',10,1.4);gymLabel.position.set(gym.x,3.45,gym.z-gym.d/2-.2);group.add(gymLabel)

  const elevator=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.6,.3),doorMat);elevator.position.set(-42.2,1.3,79.8);group.add(elevator)
  const elevSign=signSprite('ELEVATOR • ACCESSIBLE',5.5,1);elevSign.position.set(-42.2,3.15,79.6);group.add(elevSign)

  group.userData={...CAMPUS,rooms:ROOMS.map(r=>r.id),privacySafeLockerShower:true,exactFloorplan:false}
  return {group,collisionBoxes}
}

const contains=(room:Room,x:number,z:number)=>Math.abs(x-room.x)<=room.w/2&&Math.abs(z-room.z)<=room.d/2

export default function StreetVerseThomasJeffersonSchool(){
  const [near,setNear]=useState(false)
  const [roomId,setRoomId]=useState<RoomId|null>(null)
  const room=useMemo(()=>ROOMS.find(r=>r.id===roomId)||null,[roomId])
  const nearRef=useRef(false)
  const roomRef=useRef<Room|null>(null)
  const privacyRoomRef=useRef(false)

  useEffect(()=>{
    let scene:THREE.Scene|null=null,group:THREE.Group|null=null,collisionOwner:THREE.Box3[]|null=null,installedBoxes:THREE.Box3[]=[]
    const unsub=subscribeStreetVerseScene(handle=>{
      if(group&&scene)scene.remove(group)
      if(collisionOwner)for(const box of installedBoxes){const i=collisionOwner.indexOf(box);if(i>=0)collisionOwner.splice(i,1)}
      if(privacyRoomRef.current){privacyRoomRef.current=false;window.dispatchEvent(new CustomEvent('tryamm:school-privacy-zone',{detail:{campusId:CAMPUS.id,roomId:null,active:false,cameraCapture:true,reelCapture:true,privacySafe:true}}))}
      scene=handle?.scene||null;group=null;installedBoxes=[];collisionOwner=handle?.collisionBoxes||null
      if(!handle)return
      const built=buildSchool();group=built.group;installedBoxes=built.collisionBoxes;handle.scene.add(group);handle.collisionBoxes.push(...installedBoxes)
      window.dispatchEvent(new CustomEvent('tryamm:thomas-jefferson-school-ready',{detail:{...CAMPUS,rooms:ROOMS.map(r=>({id:r.id,label:r.label,subject:r.subject})),worldPosition:{x:-46,z:68}}}))
    })

    const onPosition=(event:Event)=>{
      const d=(event as CustomEvent<{x?:number;z?:number}>).detail||{};const x=Number(d.x),z=Number(d.z);if(!Number.isFinite(x)||!Number.isFinite(z))return
      const isNear=Math.hypot(x+46,z-54)<=14;nearRef.current=isNear;setNear(isNear)
      const active=ROOMS.find(r=>contains(r,x,z))||null;roomRef.current=active
      const privacyActive=active?.id==='locker-shower'
      if(privacyActive!==privacyRoomRef.current){privacyRoomRef.current=privacyActive;window.dispatchEvent(new CustomEvent('tryamm:school-privacy-zone',{detail:{campusId:CAMPUS.id,roomId:privacyActive?'locker-shower':null,active:privacyActive,cameraCapture:!privacyActive,reelCapture:!privacyActive,privacySafe:true}}))}
      setRoomId(prev=>{
        if(prev===active?.id)return prev
        if(active)window.dispatchEvent(new CustomEvent('tryamm:school-room-enter',{detail:{campusId:CAMPUS.id,roomId:active.id,label:active.label,subject:active.subject}}))
        return active?.id||null
      })
    }

    const onAction=()=>{
      const active=roomRef.current
      if(active){
        if(active.id==='gym')window.dispatchEvent(new CustomEvent('tryamm:basketball-open',{detail:{court:'thomas-jefferson-gym',source:'thomas-jefferson-school'}}))
        else if(active.id==='locker-shower')window.dispatchEvent(new CustomEvent('tryamm:school-privacy-zone',{detail:{campusId:CAMPUS.id,roomId:active.id,cameraCapture:false,privacySafe:true}}))
        else window.dispatchEvent(new CustomEvent('tryamm:school-learning-activity',{detail:{campusId:CAMPUS.id,roomId:active.id,label:active.label,subject:active.subject}}))
      }else if(nearRef.current)window.dispatchEvent(new CustomEvent('tryamm:school-campus-enter',{detail:{campusId:CAMPUS.id,label:CAMPUS.label}}))
    }

    addEventListener('tryamm:streetverse-player-position',onPosition)
    addEventListener('tryamm:streetverse-action',onAction)
    return()=>{
      unsub();removeEventListener('tryamm:streetverse-player-position',onPosition);removeEventListener('tryamm:streetverse-action',onAction)
      if(group&&scene)scene.remove(group)
      if(collisionOwner)for(const box of installedBoxes){const i=collisionOwner.indexOf(box);if(i>=0)collisionOwner.splice(i,1)}
    }
  },[])

  if(!near&&!room)return null
  return <div aria-live="polite" style={{position:'fixed',left:'50%',top:'calc(env(safe-area-inset-top,0px) + 68px)',transform:'translateX(-50%)',zIndex:41020,maxWidth:'min(84vw,430px)',padding:'7px 10px',borderRadius:999,background:'#06121dea',border:'1px solid #e9d28d99',color:'#fff',fontFamily:'system-ui',fontSize:9,fontWeight:900,pointerEvents:'none',textAlign:'center'}}>
    {room?'🏫 '+room.label.toUpperCase()+' • '+room.subject.toUpperCase()+' • ACTION TO USE':'🏫 THOMAS JEFFERSON SCHOOL • WALK THROUGH THE FRONT ENTRANCE'}
  </div>
}
