import * as THREE from 'three'

type Trigger={id:string;center:THREE.Vector3;radius:number;mission:string;easterEgg?:string}
export type ObamaCenterWorld3D={group:THREE.Group;update:(player:THREE.Vector3)=>void;dispose:()=>void}
const mat=(color:number,rough=.8,metal=.04,transparent=false,opacity=1)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,transparent,opacity})
const box=(p:THREE.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,m:THREE.Material)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o}
const person=(color:number)=>{const g=new THREE.Group();const b=new THREE.Mesh(new THREE.CapsuleGeometry(.25,.72,3,6),mat(color));b.position.y=1;const h=new THREE.Mesh(new THREE.SphereGeometry(.22,8,8),mat(0x805438));h.position.y=1.72;g.add(b,h);return g}

export function addStreetVerseObamaCenterWorld3D(scene:THREE.Scene):ObamaCenterWorld3D{
 const root=new THREE.Group();root.name='streetverse-obama-center-inspired-district';root.position.set(55,0,96);scene.add(root)
 const stone=mat(0xa89d8c,.9,.04),glass=mat(0x5f8192,.18,.45,true,.78),green=mat(0x47784b,.95),path=mat(0x777a76,.9),water=mat(0x315f70,.2,.1,true,.72),courtMat=mat(0x344c62,.72)
 // StreetVerse interpretation of the public-facing Jackson Park campus; no restricted/back-of-house layouts.
 const museum=box(root,0,17,0,20,34,18,stone);museum.scale.set(.78,1,1.08)
 for(let y=5;y<30;y+=6)box(root,0,y,-9.25,10,.22,.18,glass)
 const forum=box(root,-25,4,13,24,8,18,stone);box(root,-25,4,3.9,16,4,.2,glass)
 const library=box(root,25,3.5,14,22,7,17,stone);box(root,25,3.5,5.4,14,3.5,.2,glass)
 const homeCourt=box(root,27,4,-18,24,8,18,stone);box(root,27,.12,-18,18,.24,11,courtMat)
 const lawn=box(root,-7,.08,32,62,.16,25,green);const plaza=box(root,0,.1,-23,58,.2,16,path)
 const terrace=new THREE.Mesh(new THREE.CylinderGeometry(8,8,.18,28),water);terrace.position.set(-31,.1,-18);root.add(terrace)
 for(let i=0;i<18;i++){const t=new THREE.Group();box(t,0,1.3,0,.45,2.6,.45,mat(0x65462d,.94));const crown=new THREE.Mesh(new THREE.SphereGeometry(1.55,9,7),green);crown.position.y=3.4;t.add(crown);const a=i/18*Math.PI*2;t.position.set(Math.cos(a)*42,0,Math.sin(a)*36+5);root.add(t)}
 const people:THREE.Group[]=[];for(let i=0;i<20;i++){const p=person([0x294c6b,0x8b5c45,0x526b43,0x785889][i%4]);p.position.set(-28+(i%10)*6,0,-29+Math.floor(i/10)*7);root.add(p);p.userData.phase=i*.55;people.push(p)}
 const egg=new THREE.Mesh(new THREE.DodecahedronGeometry(.65,0),mat(0xf0c84b,.25,.55));egg.position.set(-35,1.1,31);root.add(egg)
 const triggers:Trigger[]=[
  {id:'opc-arrival',center:new THREE.Vector3(55,0,73),radius:12,mission:'Jackson Park Arrival'},
  {id:'opc-museum-story',center:new THREE.Vector3(55,0,96),radius:13,mission:'Democracy Story Hunt',easterEgg:'44 Archive Token'},
  {id:'opc-library',center:new THREE.Vector3(80,0,110),radius:11,mission:'Library Knowledge Run',easterEgg:'Hidden Chicago Reading List'},
  {id:'opc-forum',center:new THREE.Vector3(30,0,109),radius:11,mission:'Community Forum Challenge'},
  {id:'opc-home-court',center:new THREE.Vector3(82,0,78),radius:12,mission:'Home Court Leadership Game',easterEgg:'South Side Court Crown'},
  {id:'opc-great-lawn',center:new THREE.Vector3(48,0,128),radius:15,mission:'Great Lawn Creator Festival'},
  {id:'opc-water-terrace',center:new THREE.Vector3(24,0,78),radius:10,mission:'Water Terrace Reflection Trail'},
  {id:'opc-skyline',center:new THREE.Vector3(55,0,96),radius:8,mission:'Skyline Time Echo',easterEgg:'Future Chicago Postcard'},
  {id:'opc-jackson-park',center:new THREE.Vector3(55,0,118),radius:20,mission:'Jackson Park Ecology Run',easterEgg:'Wooded Island Nature Cipher'},
  {id:'opc-chrono',center:new THREE.Vector3(20,0,127),radius:8,mission:'South Side Chronokey',easterEgg:'Presidential Time Capsule'}
 ]
 const fired=new Set<string>()
 const update=(player:THREE.Vector3)=>{const t=performance.now()/1000;people.forEach((p,i)=>{p.position.x+=Math.sin(t*.55+p.userData.phase)*.006;p.rotation.y=Math.sin(t*.4+i)*.25});for(const z of triggers){const d=player.distanceTo(z.center);if(d<=z.radius&&!fired.has(z.id)){fired.add(z.id);window.dispatchEvent(new CustomEvent('tryamm:obama-center-mission-enter',{detail:{id:z.id,title:z.mission,publicFacing:true,streetVerseInterpretation:true,position:{x:z.center.x,y:z.center.y,z:z.center.z}}}));window.dispatchEvent(new CustomEvent('tryamm:mission-offered',{detail:{id:z.id,title:z.mission,source:'obama-center-south-side'}}));if(z.easterEgg)window.dispatchEvent(new CustomEvent('tryamm:easter-egg-found',{detail:{id:z.id+'-egg',title:z.easterEgg,source:'obama-center-south-side'}}))}else if(d>z.radius*1.5)fired.delete(z.id)}}
 window.dispatchEvent(new CustomEvent('tryamm:obama-center-world-ready',{detail:{district:'Jackson Park / South Side',museum:true,forum:true,library:true,homeCourt:true,greatLawn:true,waterTerrace:true,missions:triggers.length,publicFacingOnly:true}}))
 const dispose=()=>{scene.remove(root);root.traverse(o=>{const m=o as THREE.Mesh;m.geometry?.dispose?.();const mt=(m as any).material;if(Array.isArray(mt))mt.forEach((x:THREE.Material)=>x.dispose());else mt?.dispose?.()})}
 return {group:root,update,dispose}
}
