import * as THREE from 'three'

export type StreetVerseRodentKind='rat'|'mouse'

export function createStreetVerseRodentRuntime(scene:THREE.Scene){
 const root=new THREE.Group();root.name='streetverse-rodents';scene.add(root)
 const defs=[
  {kind:'rat' as const,x:15,z:51,count:4,size:.18,speed:2.7},
  {kind:'rat' as const,x:-10,z:54,count:3,size:.18,speed:2.5},
  {kind:'mouse' as const,x:9,z:49,count:5,size:.11,speed:3.7},
  {kind:'mouse' as const,x:-14,z:50,count:4,size:.11,speed:3.5},
 ]
 const animals:Array<{mesh:THREE.Mesh;kind:StreetVerseRodentKind;x:number;z:number;phase:number;speed:number}>=[]
 const counts={rat:0,mouse:0}
 defs.forEach(d=>{for(let i=0;i<d.count;i++){
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(d.size,7,5),new THREE.MeshLambertMaterial({color:d.kind==='rat'?0x5a5048:0x8b8177}))
  mesh.scale.set(d.kind==='rat'?1.8:1.45,.62,.82);mesh.position.set(d.x,d.kind==='rat'?.18:.12,d.z);mesh.userData={kind:d.kind,urbanRodent:true};root.add(mesh)
  animals.push({mesh,kind:d.kind,x:d.x,z:d.z,phase:i*.91+animals.length*.37,speed:d.speed});counts[d.kind]++
 }})
 let scanIndex=0
 const scan=()=>{const kind=(['rat','mouse'] as const)[scanIndex++%2];window.dispatchEvent(new CustomEvent('tryamm:urban-rodent-discovered',{detail:{kind,world:'circle-park'}}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-sanitation-mission-open',{detail:{id:'circle-park-rodent-check',kind,steps:['inspect','secure-food-trash','check-entry-points','maintenance-report']}}))}
 const onScan=()=>scan();window.addEventListener('tryamm:rodent-check-request',onScan)
 const tick=(now:number)=>{const t=now*.001,hour=new Date().getHours(),night=hour>=19||hour<6;animals.forEach(a=>{a.mesh.visible=night;const r=a.kind==='rat'?2.2:1.55;a.mesh.position.x=a.x+Math.sin(t*a.speed+a.phase)*r;a.mesh.position.z=a.z+Math.cos(t*a.speed*.77+a.phase)*r*.72;a.mesh.rotation.y=Math.atan2(Math.cos(t*a.speed+a.phase),-Math.sin(t*a.speed*.77+a.phase))})}
 const dispose=()=>{window.removeEventListener('tryamm:rodent-check-request',onScan);root.removeFromParent();root.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(o.material as THREE.Material).dispose()}})}
 return{tick,scan,dispose,counts}
}
