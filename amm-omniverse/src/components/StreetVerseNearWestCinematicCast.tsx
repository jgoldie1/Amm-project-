import {useEffect,useRef,useState,type MutableRefObject} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {loadStreetVerseMeshyBJHero,type StreetVerseMeshyBJHeroHandle} from '../runtime/StreetVerseMeshyBJHeroRuntime'
import {loadStreetVerseMeshyCharacter,type StreetVerseMeshyLoadedCharacter} from '../runtime/StreetVerseMeshyCharacterRuntime'
import {installBJPhotoMatchedHead,type BJPhotoMatchedHeadHandle} from '../runtime/StreetVerseBJPhotoMatchRuntime'
import {NEAR_WEST_NPCS,type NearWestNpc} from '../data/streetVerseNearWestPopulation'
import {inspectCharacterGeometry as inspectVisibleGeometry} from '../runtime/StreetVerseCharacterGeometry'

// Keep the existing procedural figures until the actual GLB GET and parsing complete.
// No paid generation request is needed; models must already be published to storage.
export function StreetVerseNearWestHeroGLB({
  movement,onReady,
}:{
  movement:MutableRefObject<{x:number;z:number}>
  onReady:(ready:boolean)=>void
}){
  const host=useRef<THREE.Group>(null)
  const handle=useRef<StreetVerseMeshyBJHeroHandle|null>(null)
  const photoHead=useRef<BJPhotoMatchedHeadHandle|null>(null)
  const readyCallback=useRef(onReady)
  readyCallback.current=onReady

  useEffect(()=>{
    let mounted=true
    void loadStreetVerseMeshyBJHero().then(async loaded=>{
      if(!loaded)return
      if(!mounted||!host.current){loaded.dispose();return}
      const geometry=inspectVisibleGeometry(loaded.object)
      if(geometry.meshes===0){loaded.dispose();return}
      handle.current=loaded
      host.current.add(loaded.object)
      // A fitted MetaHuman face must never be covered with the older photo-mask.
      // Legacy GLBs still receive the approved reference overlay as before.
      if(!loaded.object.userData.metahumanWebPreview)try{
        const head=installBJPhotoMatchedHead(loaded.object)
        if(head){
          photoHead.current=head
          void head.ready.then(ok=>{
            if(mounted)window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-head-preview',{
              detail:{loaded:ok,certifiedLikeness:false,source:'approved-reference-preview'},
            }))
          }).catch(()=>{})
        }
      }catch{/* Keep the real rig even if this head cannot accept the overlay. */}
      readyCallback.current(true)
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-hero-render-ready',{
        detail:{characterId:'bj-stubbs',modelType:'existing-published-glb',geometry,certifiedLikeness:false},
      }))
    }).catch(()=>{/* Procedural BJ stays visible if GLB loading fails. */})
    return()=>{
      mounted=false
      readyCallback.current(false)
      photoHead.current?.dispose()
      photoHead.current=null
      handle.current?.dispose()
      handle.current=null
    }
  },[])

  useFrame(()=>{
    if(!handle.current)return
    const moving=Math.abs(movement.current.x)+Math.abs(movement.current.z)>.05
    handle.current.tick(performance.now(),{moving,running:false,breathing:.4})
  })
  return <group ref={host} name="streetverse-bj-production-glb-near-west"/>
}

const CAST_SLOT_IDS=[
  'sv-black-man-adult-01',
  'sv-black-woman-adult-01',
  'sv-black-man-youngadult-01',
  'sv-black-woman-youngadult-01',
] as const

function DetailedResident({
  npc,index,reaction,onLoaded,playerPosition,
}:{
  npc:NearWestNpc
  index:number
  reaction:'stagger'|'downed'|null
  playerPosition:MutableRefObject<{x:number;z:number}>
  onLoaded:(id:string,loaded:boolean)=>void
}){
  const host=useRef<THREE.Group>(null)
  const model=useRef<StreetVerseMeshyLoadedCharacter|null>(null)
  const callback=useRef(onLoaded)
  callback.current=onLoaded
  useEffect(()=>{
    let mounted=true
    // Non-essential walk/run companion files are fetched only if somebody moves.
    void loadStreetVerseMeshyCharacter(CAST_SLOT_IDS[index%CAST_SLOT_IDS.length],{
      deferCompanionAnimations:true,
    }).then(loaded=>{
      if(!loaded)return
      if(!mounted||!host.current){loaded.dispose();return}
      if(inspectVisibleGeometry(loaded.object).meshes===0){loaded.dispose();return}
      host.current.add(loaded.object)
      model.current=loaded
      callback.current(npc.id,true)
    }).catch(()=>{/* Keep original ambient resident as the fallback. */})
    return()=>{
      mounted=false
      callback.current(npc.id,false)
      model.current?.dispose()
      model.current=null
    }
  },[npc.id,index])
  useFrame((_,dt)=>{
    if(host.current){
      const tilt=reaction==='downed'?1.38:reaction==='stagger'?.26:0
      host.current.rotation.z=THREE.MathUtils.damp(host.current.rotation.z,tilt,9,dt)
      if(!reaction){
        const dx=playerPosition.current.x-npc.position.x
        const dz=playerPosition.current.z-npc.position.z
        const distance=Math.hypot(dx,dz)
        if(distance>1&&distance<13){
          const desired=Math.atan2(dx,dz)
          const turn=THREE.MathUtils.euclideanModulo(desired-host.current.rotation.y+Math.PI,Math.PI*2)-Math.PI
          host.current.rotation.y+=turn*Math.min(1,dt*3)
        }
      }
    }
    model.current?.tick(performance.now(),{moving:false})
  })
  return <group
    ref={host}
    position={[npc.position.x,0,npc.position.z]}
    name={'near-west-production-resident-'+npc.id}
    userData={{residentId:npc.id,fictional:true,characterUpgrade:'published-glb-with-fallback'}}
  />
}

export function StreetVerseNearWestDetailedNpcLayer({
  playerPosition,reaction,onResidentLoaded,
}:{
  playerPosition:MutableRefObject<{x:number;z:number}>
  reaction:{id:string;reaction:'stagger'|'downed'}|null
  onResidentLoaded:(id:string,loaded:boolean)=>void
}){
  const [nearbyIds,setNearbyIds]=useState<readonly string[]>([])
  const lastScan=useRef(0)
  useFrame((state,dt)=>{
    lastScan.current+=dt
    if(lastScan.current<1.2)return
    lastScan.current=0
    const {x,z}=playerPosition.current
    // Older iPhones retain a small resident budget, rather than downloading all
    // 24 rigs and textures as soon as the whole Chicago map mounts.
    const mobile=typeof window!=='undefined'&&window.innerWidth<750
    const maxCharacters=mobile?2:4
    const radius=mobile?65:90
    const picked=NEAR_WEST_NPCS
      .map(npc=>({id:npc.id,distance:Math.hypot(npc.position.x-x,npc.position.z-z)}))
      .filter(entry=>entry.distance<=radius)
      .sort((a,b)=>a.distance-b.distance)
      .slice(0,maxCharacters)
      .map(entry=>entry.id)
      .sort()
    setNearbyIds(previous=>
      previous.length===picked.length&&previous.every((id,i)=>id===picked[i])?previous:picked
    )
  })
  return <group name="streetverse-near-west-detailed-local-residents">
    {nearbyIds.map(id=>{
      const index=NEAR_WEST_NPCS.findIndex(npc=>npc.id===id)
      if(index<0)return null
      const npc=NEAR_WEST_NPCS[index]
      return <DetailedResident
        key={id} npc={npc} index={index}
        reaction={reaction?.id===id?reaction.reaction:null}
        playerPosition={playerPosition}
        onLoaded={onResidentLoaded}
      />
    })}
  </group>
}
