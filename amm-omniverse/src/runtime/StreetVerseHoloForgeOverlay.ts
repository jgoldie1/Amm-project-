import * as THREE from 'three'
import type { HoloForgeAssetManifest } from './HoloForgeAssetRuntime'

const SAVE_KEY='tryamm.streetverse3d.v3'
let installed=false
let renderer:THREE.WebGLRenderer|null=null
let scene:THREE.Scene|null=null
let camera:THREE.PerspectiveCamera|null=null
let mount:HTMLElement|null=null
let raf=0
const spawned=new Map<string,THREE.Object3D>()

function readPlayer(){try{const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');return {x:Number(saved.x)||0,z:Number(saved.z)||48}}catch{return {x:0,z:48}}}
function color(kind:string){return ({character:0x7be7ff,vehicle:0x6f8cff,building:0x9a7655,prop:0xffd35e,animal:0xc58a55,road:0x34383f,mission:0x79ffad,fx:0xd66cff}[kind]||0x58e8ff) as number}
function mat(kind:string){return new THREE.MeshStandardMaterial({color:color(kind),roughness:.6,metalness:.15})}
function shadow(root:THREE.Object3D){root.traverse(o=>{const m=o as THREE.Mesh;if(m.isMesh){m.castShadow=true;m.receiveShadow=true}});return root}
function makeObject(manifest:HoloForgeAssetManifest){
 if(manifest.kind==='vehicle'){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(4.4,.9,2.1),mat('vehicle'));body.position.y=.9;g.add(body);const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.2,.75,1.7),new THREE.MeshStandardMaterial({color:0x172535,metalness:.35,roughness:.3}));cabin.position.set(-.15,1.55,0);g.add(cabin);return shadow(g)}
 if(manifest.kind==='character'){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.48,1.35,5,9),mat('character'));body.position.y=1.25;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.42,14,10),new THREE.MeshStandardMaterial({color:0xd6a17e}));head.position.y=2.65;g.add(head);return shadow(g)}
 if(manifest.kind==='animal'){const g=new THREE.Group();const torso=new THREE.Mesh(new THREE.BoxGeometry(1.8,.8,.75),mat('animal'));torso.position.y=.9;g.add(torso);const head=new THREE.Mesh(new THREE.SphereGeometry(.38,12,9),mat('animal'));head.position.set(1,.98,0);g.add(head);return shadow(g)}
 if(manifest.kind==='building'){const h=10+Math.min(22,manifest.prompt.length%18);const mesh=new THREE.Mesh(new THREE.BoxGeometry(10,h,10),mat('building'));mesh.position.y=h/2;return shadow(mesh)}
 if(manifest.kind==='road'){const mesh=new THREE.Mesh(new THREE.BoxGeometry(22,.12,7),mat('road'));mesh.position.y=.07;return mesh}
 if(manifest.kind==='fx'){const mesh=new THREE.Mesh(new THREE.SphereGeometry(1.3,18,12),new THREE.MeshBasicMaterial({color:color('fx'),transparent:true,opacity:.55}));mesh.position.y=2;return mesh}
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.8,1.8),mat(manifest.kind));mesh.position.y=.9;return shadow(mesh)
}
function place(index:number){const ring=20+Math.floor(index/8)*7,angle=(index%8)/8*Math.PI*2;return {x:Math.cos(angle)*ring,z:Math.sin(angle)*ring+8}}
function findMount(){const dialog=document.querySelector('[aria-label="StreetVerse 3D"]');const base=dialog?.querySelector('main > div:first-child') as HTMLElement|null;return base}
function ensureRenderer(){
 if(renderer&&scene&&camera&&mount?.isConnected)return true
 mount=findMount();if(!mount)return false
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(62,1,.1,500);renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.setClearColor(0x000000,0);renderer.domElement.dataset.holoforgeOverlay='true';Object.assign(renderer.domElement.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none'});mount.appendChild(renderer.domElement);scene.add(new THREE.HemisphereLight(0xd8f2ff,0x3c4b38,1.8));const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(30,70,18);scene.add(sun);return true
}
function animate(){
 if(!renderer||!scene||!camera||!mount?.isConnected){renderer?.dispose();renderer=null;scene=null;camera=null;mount=null;raf=requestAnimationFrame(animate);return}
 const rect=mount.getBoundingClientRect();const w=Math.max(1,rect.width),h=Math.max(1,rect.height);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);const p=readPlayer();camera.position.set(p.x,10,p.z+15);camera.lookAt(p.x,2.4,p.z-4);renderer.render(scene,camera);raf=requestAnimationFrame(animate)
}
function materialize(manifest:HoloForgeAssetManifest){
 if(!manifest?.id||spawned.has(manifest.id)||!manifest.integration?.spawnable)return
 if(!ensureRenderer()){setTimeout(()=>materialize(manifest),400);return}
 const object=makeObject(manifest),p=place(spawned.size);object.position.x=p.x;object.position.z=p.z;object.userData={...object.userData,holoforgeAssetId:manifest.id,assetKind:manifest.kind,worldSessionId:manifest.worldSessionId,missionId:manifest.missionId,tags:manifest.tags,generated:true};scene!.add(object);spawned.set(manifest.id,object)
 const box=manifest.integration.collision?new THREE.Box3().setFromObject(object):null
 window.dispatchEvent(new CustomEvent('tryamm:streetverse-asset-materialized',{detail:{assetId:manifest.id,kind:manifest.kind,worldSessionId:manifest.worldSessionId,missionId:manifest.missionId,position:{x:object.position.x,y:object.position.y,z:object.position.z},collider:box?{min:box.min.toArray(),max:box.max.toArray()}:null,integration:manifest.integration}}))
 if(manifest.integration.navigation)window.dispatchEvent(new CustomEvent('tryamm:streetverse-navigation-asset-added',{detail:{assetId:manifest.id,kind:manifest.kind,position:{x:object.position.x,z:object.position.z}}}))
 if(manifest.integration.animation)window.dispatchEvent(new CustomEvent('tryamm:streetverse-animation-asset-added',{detail:{assetId:manifest.id,kind:manifest.kind}}))
}
export function installStreetVerseHoloForgeOverlay(){if(installed||typeof window==='undefined')return;installed=true;window.addEventListener('tryamm:streetverse-asset-spawn-request',(event:Event)=>materialize((event as CustomEvent<HoloForgeAssetManifest>).detail));window.addEventListener('tryamm:streetverse-enter',()=>ensureRenderer());raf=requestAnimationFrame(animate);window.dispatchEvent(new CustomEvent('tryamm:streetverse-holoforge-overlay-ready',{detail:{ready:true,capabilities:['materialize','camera-follow','collision-metadata','navigation-events','animation-events','mission-binding','world-session-binding']}}))}
