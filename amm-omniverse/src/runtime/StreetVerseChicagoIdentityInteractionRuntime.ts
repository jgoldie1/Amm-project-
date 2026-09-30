import * as THREE from 'three'

export type StreetVerseInteractionKind='mission'|'shop'|'talk'|'ride'|'explore'

export type StreetVerseInteractionPrompt={
  id:string
  label:string
  action:string
  kind:StreetVerseInteractionKind
  x:number
  z:number
  distance:number
}

type Target={
  id:string
  label:string
  action:string
  kind:StreetVerseInteractionKind
  x:number
  z:number
  radius:number
  event:string
  detail:Record<string,unknown>
  accent:number
}

export type StreetVerseChicagoIdentityInteractionRuntime={
  getNearestInteraction:(x:number,z:number)=>StreetVerseInteractionPrompt|null
  activate:(id:string)=>boolean
  dispose:()=>void
  counts:{
    identityZones:number
    interactionTargets:number
    districtMarkers:number
    lakefrontSegments:number
    ctaMarkers:number
  }
}

const TARGETS:Target[]=[
  {
    id:'creator-studio',
    label:'64 Track Studio',
    action:'START MISSION',
    kind:'mission',
    x:-42,z:-30,radius:9,
    event:'tryamm:streetverse-mission-open',
    detail:{missionId:'studio',district:'Chicago',source:'context-prompt'},
    accent:0xb96cff,
  },
  {
    id:'all-american-market',
    label:'All American Market',
    action:'SHOP',
    kind:'shop',
    x:42,z:-24,radius:9,
    event:'tryamm:streetverse-commerce-open',
    detail:{businessId:'all-american-market',district:'Chicago',source:'context-prompt'},
    accent:0x5be7ff,
  },
  {
    id:'riverwalk',
    label:'Chicago Riverwalk',
    action:'EXPLORE',
    kind:'explore',
    x:38,z:38,radius:10,
    event:'tryamm:streetverse-discover',
    detail:{id:'chicago-riverwalk',label:'Chicago Riverwalk',source:'context-prompt'},
    accent:0xffc95b,
  },
  {
    id:'creator-stage',
    label:'StreetVerse Stage',
    action:'START MISSION',
    kind:'mission',
    x:-38,z:38,radius:9,
    event:'tryamm:streetverse-mission-open',
    detail:{missionId:'stage',district:'Chicago',source:'context-prompt'},
    accent:0xff4f9a,
  },
  {
    id:'cta-loop',
    label:'CTA Loop Station',
    action:'RIDE CTA',
    kind:'ride',
    x:0,z:-35,radius:10,
    event:'tryamm:streetverse-transit-board',
    detail:{mode:'subway',line:'Loop',stop:'StreetVerse Central',destination:'Chicago Loop',source:'context-prompt'},
    accent:0x00a1de,
  },
  {
    id:'lakefront',
    label:'Lake Michigan Lakefront',
    action:'EXPLORE',
    kind:'explore',
    x:72,z:14,radius:11,
    event:'tryamm:streetverse-discover',
    detail:{id:'lake-michigan-lakefront',label:'Lake Michigan Lakefront',source:'context-prompt'},
    accent:0x4fd7ff,
  },
  {
    id:'neighborhood-guide',
    label:'Chicago Neighborhood Guide',
    action:'TALK',
    kind:'talk',
    x:-58,z:54,radius:8,
    event:'tryamm:streetverse-npc-dialogue',
    detail:{npcId:'chicago-neighborhood-guide',topic:'Chicago districts',source:'context-prompt'},
    accent:0x78ffb4,
  },
  {
    id:'circle-park-basketball',
    label:'Circle Park Basketball Court',
    action:'PLAY BALL',
    kind:'explore',
    x:-48,z:61,radius:6,
    event:'tryamm:circle-park-activity',
    detail:{activity:'basketball',mode:'shootaround',source:'circle-park-recreation'},
    accent:0xffb84d,
  },
  {
    id:'circle-park-playground',
    label:'Circle Park Playground',
    action:'PLAY',
    kind:'explore',
    x:-15,z:61,radius:6,
    event:'tryamm:circle-park-activity',
    detail:{activity:'playground',mode:'slide-and-play',source:'circle-park-recreation'},
    accent:0x4f9bd7,
  },
  {
    id:'circle-park-grill',
    label:'Circle Park Grill',
    action:'BARBECUE',
    kind:'explore',
    x:-25,z:69,radius:5,
    event:'tryamm:circle-park-activity',
    detail:{activity:'barbecue',mode:'cookout',source:'circle-park-recreation'},
    accent:0xff6b35,
  },
  {
    id:'circle-park-pool',
    label:'StreetVerse Circle Park Pool',
    action:'SWIM',
    kind:'explore',
    x:5,z:63,radius:7,
    event:'tryamm:circle-park-activity',
    detail:{activity:'swimming',mode:'free-swim',fictionalAmenity:true,source:'circle-park-recreation'},
    accent:0x38c9ff,
  },
  {
    id:'circle-park-tennis',
    label:'StreetVerse Circle Park Tennis Courts',
    action:'PLAY TENNIS',
    kind:'explore',
    x:22,z:61,radius:8,
    event:'tryamm:circle-park-activity',
    detail:{activity:'tennis',mode:'rally',fictionalAmenity:true,source:'circle-park-recreation'},
    accent:0xb6ef5c,
  },
  {
    id:'circle-park-courtyard',
    label:'Circle Park Courtyard',
    action:'HANG OUT',
    kind:'explore',
    x:-20,z:58,radius:6,
    event:'tryamm:circle-park-activity',
    detail:{activity:'social',mode:'courtyard',source:'circle-park-recreation'},
    accent:0x7ae582,
  },
  {
    id:'circle-park-senior-commons',
    label:'Circle Park Senior Commons',
    action:'ENTER COMMONS',
    kind:'explore',
    x:-31,z:41,radius:7,
    event:'tryamm:senior-commons-open',
    detail:{location:'circle-park',streetVersePlacement:'roosevelt-side',source:'context-prompt'},
    accent:0xd7c68a,
  },
]

const DISTRICTS=[
  {id:'loop',label:'THE LOOP',x:8,z:16,accent:0x66cfff},
  {id:'river',label:'CHICAGO RIVER',x:0,z:-18,accent:0x49b9e8},
  {id:'north',label:'NORTH SIDE',x:-58,z:-66,accent:0xff78bd},
  {id:'south',label:'SOUTH SIDE',x:-58,z:66,accent:0xf0b35b},
  {id:'lake',label:'LAKEFRONT',x:73,z:54,accent:0x5ae3ff},
] as const

function makeLabel(text:string,accent:number){
  const canvas=document.createElement('canvas')
  canvas.width=512
  canvas.height=112
  const ctx=canvas.getContext('2d')!
  ctx.clearRect(0,0,canvas.width,canvas.height)
  ctx.fillStyle='rgba(4,12,20,.82)'
  ctx.fillRect(0,10,512,92)
  ctx.strokeStyle='#'+new THREE.Color(accent).getHexString()
  ctx.lineWidth=5
  ctx.strokeRect(4,14,504,84)
  ctx.fillStyle='#ffffff'
  ctx.font='900 34px system-ui'
  ctx.textAlign='center'
  ctx.textBaseline='middle'
  ctx.fillText(text,256,56)
  const texture=new THREE.CanvasTexture(canvas)
  texture.colorSpace=THREE.SRGBColorSpace
  const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false})
  const sprite=new THREE.Sprite(material)
  sprite.scale.set(9.2,2,1)
  sprite.userData.texture=texture
  return sprite
}

function disposeObject(root:THREE.Object3D){
  root.traverse((object:any)=>{
    if(object.geometry)object.geometry.dispose?.()
    if(object.material){
      const materials=Array.isArray(object.material)?object.material:[object.material]
      materials.forEach((material:any)=>{
        material.map?.dispose?.()
        material.dispose?.()
      })
    }
  })
}

export function createStreetVerseChicagoIdentityInteraction(
  scene:THREE.Scene,
):StreetVerseChicagoIdentityInteractionRuntime{
  const root=new THREE.Group()
  root.name='streetverse-chicago-identity-interaction-pass-5'
  scene.add(root)

  const markerGeometry=new THREE.TorusGeometry(1.35,.11,6,18)
  const markerMaterial=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.78,vertexColors:true})
  const markers=new THREE.InstancedMesh(markerGeometry,markerMaterial,TARGETS.length)
  const matrix=new THREE.Object3D()
  const tint=new THREE.Color()
  TARGETS.forEach((target,index)=>{
    matrix.position.set(target.x,.18,target.z)
    matrix.rotation.set(Math.PI/2,0,0)
    matrix.scale.set(1,1,1)
    matrix.updateMatrix()
    markers.setMatrixAt(index,matrix.matrix)
    markers.setColorAt(index,tint.setHex(target.accent))
  })
  markers.instanceMatrix.needsUpdate=true
  if(markers.instanceColor)markers.instanceColor.needsUpdate=true
  markers.name='streetverse-chicago-context-markers'
  root.add(markers)

  const districtRoot=new THREE.Group()
  districtRoot.name='streetverse-chicago-district-labels'
  DISTRICTS.forEach(district=>{
    const label=makeLabel(district.label,district.accent)
    label.position.set(district.x,8,district.z)
    districtRoot.add(label)
  })
  root.add(districtRoot)

  const ctaRoot=new THREE.Group()
  ctaRoot.name='streetverse-chicago-cta-identity'
  const ctaPoleMat=new THREE.MeshLambertMaterial({color:0x29343b})
  const ctaSignMat=new THREE.MeshBasicMaterial({color:0x00a1de})
  for(const x of [-34,0,34]){
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.09,.11,4.3,6),ctaPoleMat)
    pole.position.set(x,2.15,-35)
    const roundel=new THREE.Mesh(new THREE.CylinderGeometry(.66,.66,.16,18),ctaSignMat)
    roundel.rotation.x=Math.PI/2
    roundel.position.set(x,4.25,-35)
    ctaRoot.add(pole,roundel)
  }
  root.add(ctaRoot)

  const lakeRoot=new THREE.Group()
  lakeRoot.name='streetverse-chicago-lakefront-identity'
  const lakeMat=new THREE.MeshLambertMaterial({color:0x176d91,transparent:true,opacity:.88})
  const seawallMat=new THREE.MeshLambertMaterial({color:0x8b8f94})
  const lake=new THREE.Mesh(new THREE.PlaneGeometry(22,184),lakeMat)
  lake.rotation.x=-Math.PI/2
  lake.position.set(88,.025,0)
  lakeRoot.add(lake)
  const seawall=new THREE.Mesh(new THREE.BoxGeometry(2.2,.34,184),seawallMat)
  seawall.position.set(76.9,.18,0)
  lakeRoot.add(seawall)
  const bollardGeometry=new THREE.CylinderGeometry(.1,.14,.85,6)
  const bollardMaterial=new THREE.MeshLambertMaterial({color:0x343b42})
  const bollardSpots:number[]=[]
  for(let z=-78;z<=78;z+=13)bollardSpots.push(z)
  const bollards=new THREE.InstancedMesh(bollardGeometry,bollardMaterial,bollardSpots.length)
  bollardSpots.forEach((z,i)=>{
    matrix.position.set(75.5,.46,z)
    matrix.rotation.set(0,0,0)
    matrix.scale.set(1,1,1)
    matrix.updateMatrix()
    bollards.setMatrixAt(i,matrix.matrix)
  })
  bollards.instanceMatrix.needsUpdate=true
  bollards.name='streetverse-mobile-lakefront-bollards'
  lakeRoot.add(bollards)
  root.add(lakeRoot)

  const porchRoot=new THREE.Group()
  porchRoot.name='streetverse-chicago-neighborhood-identity'
  const brickMat=new THREE.MeshLambertMaterial({color:0x7b4434})
  const porchMat=new THREE.MeshLambertMaterial({color:0x584638})
  const neighborhoodHomes:[number,number][]=[[-72,54],[-51,67],[-28,70],[-72,73],[-51,48],[-28,52]]
  neighborhoodHomes.forEach(([x,z],i)=>{
    const stoop=new THREE.Mesh(new THREE.BoxGeometry(5.4,.8,2.4),porchMat)
    stoop.position.set(x,.4,z+(i%2?7.6:-7.6))
    porchRoot.add(stoop)
    const columns=new THREE.InstancedMesh(new THREE.BoxGeometry(.32,3.5,.32),brickMat,2)
    for(let c=0;c<2;c++){
      matrix.position.set(x+(c?2.1:-2.1),2.1,z+(i%2?7.2:-7.2))
      matrix.rotation.set(0,0,0)
      matrix.scale.set(1,1,1)
      matrix.updateMatrix()
      columns.setMatrixAt(c,matrix.matrix)
    }
    columns.instanceMatrix.needsUpdate=true
    porchRoot.add(columns)
  })
  root.add(porchRoot)

  let activeTargetId=''
  const getNearestInteraction=(x:number,z:number)=>{
    let best:Target|null=null
    let distance=Infinity
    for(const target of TARGETS){
      const d=Math.hypot(target.x-x,target.z-z)
      if(d<=target.radius&&d<distance){
        best=target
        distance=d
      }
    }
    const nextId=best?.id||''
    if(nextId!==activeTargetId){
      activeTargetId=nextId
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-context-prompt',{
        detail:best?{id:best.id,label:best.label,action:best.action,kind:best.kind,distance}:{id:null},
      }))
    }
    return best?{
      id:best.id,
      label:best.label,
      action:best.action,
      kind:best.kind,
      x:best.x,
      z:best.z,
      distance,
    }:null
  }

  const activate=(id:string)=>{
    const target=TARGETS.find(item=>item.id===id)
    if(!target)return false
    const detail={...target.detail,id:target.id,label:target.label,kind:target.kind,action:target.action}
    window.dispatchEvent(new CustomEvent(target.event,{detail}))
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-context-interaction',{detail}))
    window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:`${target.action} • ${target.label}`}}))
    return true
  }

  const onActivate=(event:Event)=>{
    const detail=(event as CustomEvent<{id?:string}>).detail||{}
    if(detail.id)activate(String(detail.id))
  }
  window.addEventListener('tryamm:streetverse-context-action',onActivate)

  const counts={
    identityZones:DISTRICTS.length,
    interactionTargets:TARGETS.length,
    districtMarkers:DISTRICTS.length,
    lakefrontSegments:1,
    ctaMarkers:3,
  }

  window.dispatchEvent(new CustomEvent('tryamm:streetverse-chicago-identity-interaction-ready',{
    detail:{...counts,contextPrompts:true,proximityInteraction:true,mobile:true},
  }))

  return{
    counts,
    getNearestInteraction,
    activate,
    dispose(){
      window.removeEventListener('tryamm:streetverse-context-action',onActivate)
      root.removeFromParent()
      disposeObject(root)
    },
  }
}
