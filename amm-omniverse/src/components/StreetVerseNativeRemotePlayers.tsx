import { useEffect } from 'react'
import * as THREE from 'three'
import { subscribeStreetVerseScene } from '../game/streetverseSceneRegistry'

type RemotePlayer={userId:string;x:number;z:number;heading?:number;vehicle?:boolean;vehicleType?:string;rideLabel?:string}
type PresenceDetail={players?:RemotePlayer[]}
type NativeRemote={group:THREE.Group;target:THREE.Vector3;heading:number;vehicle:boolean;rideType:string}

function bodyFor(player:RemotePlayer){
  const g=new THREE.Group()
  if(player.vehicle){
    const isPower=player.vehicleType==='powersport'||/bike|atv|utv|kart|buggy/i.test(String(player.rideLabel||''))
    if(isPower){
      const frame=new THREE.Mesh(new THREE.BoxGeometry(2.4,.42,1.1),new THREE.MeshStandardMaterial({color:0x65d8ff,metalness:.35,roughness:.42}));frame.position.y=.62;g.add(frame)
      for(const x of [-.82,.82]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,.18,10),new THREE.MeshStandardMaterial({color:0x111111,roughness:.9}));w.rotation.x=Math.PI/2;w.position.set(x,.35,0);g.add(w)}
    }else{
      const shell=new THREE.Mesh(new THREE.BoxGeometry(4.2,1.02,1.95),new THREE.MeshStandardMaterial({color:0x8b7cff,metalness:.48,roughness:.32}));shell.position.y=.95;g.add(shell)
      const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.05,.72,1.6),new THREE.MeshStandardMaterial({color:0x7ec8e8,metalness:.6,roughness:.22}));cabin.position.set(-.2,1.66,0);g.add(cabin)
      for(const x of [-1.32,1.32])for(const z of [-.9,.9]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.24,10),new THREE.MeshStandardMaterial({color:0x111111,roughness:.92}));w.rotation.x=Math.PI/2;w.position.set(x,.42,z);g.add(w)}
    }
  }else{
    const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.42,1.05,4,8),new THREE.MeshStandardMaterial({color:0x65d8ff,roughness:.68}));torso.position.y=1.52;g.add(torso)
    const head=new THREE.Mesh(new THREE.SphereGeometry(.38,12,10),new THREE.MeshStandardMaterial({color:0xb97955,roughness:.6}));head.position.y=2.78;g.add(head)
    for(const side of [-1,1]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.14,.74,3,6),new THREE.MeshStandardMaterial({color:0x202936,roughness:.84}));leg.position.set(side*.2,.5,0);g.add(leg)}
  }
  g.userData.streetverseRemotePlayer=true
  g.userData.remoteUserId=player.userId
  return g
}

export default function StreetVerseNativeRemotePlayers(){
  useEffect(()=>{
    let scene:THREE.Scene|null=null
    const remotes=new Map<string,NativeRemote>()
    let raf=0
    const clear=()=>{if(scene)for(const remote of remotes.values())scene.remove(remote.group);remotes.clear()}
    const unsubscribe=subscribeStreetVerseScene(handle=>{clear();scene=handle?.scene||null})
    const onPresence=(event:Event)=>{
      if(!scene)return
      const incoming=((event as CustomEvent<PresenceDetail>).detail?.players||[]).slice(0,20)
      const active=new Set(incoming.map(p=>p.userId))
      for(const [id,remote] of remotes){if(!active.has(id)){scene.remove(remote.group);remotes.delete(id)}}
      for(const player of incoming){
        const vehicle=Boolean(player.vehicle),rideType=String(player.rideLabel||player.vehicleType||'')
        let remote=remotes.get(player.userId)
        if(!remote||remote.vehicle!==vehicle||remote.rideType!==rideType){if(remote)scene.remove(remote.group);const group=bodyFor(player);group.position.set(player.x,0,player.z);scene.add(group);remote={group,target:new THREE.Vector3(player.x,0,player.z),heading:Number(player.heading||0),vehicle,rideType};remotes.set(player.userId,remote)}
        remote.target.set(Number(player.x)||0,0,Number(player.z)||0);remote.heading=Number(player.heading||remote.heading||0)
      }
    }
    const tick=()=>{for(const remote of remotes.values()){remote.group.position.lerp(remote.target,.18);remote.group.rotation.y=THREE.MathUtils.lerp(remote.group.rotation.y,remote.heading,.2)}raf=requestAnimationFrame(tick)}
    addEventListener('tryamm:streetverse-multiplayer-presence',onPresence);tick()
    return()=>{cancelAnimationFrame(raf);removeEventListener('tryamm:streetverse-multiplayer-presence',onPresence);unsubscribe();clear()}
  },[])
  return null
}
