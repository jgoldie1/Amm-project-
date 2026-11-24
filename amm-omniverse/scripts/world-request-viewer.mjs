import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
const scenes=PREVIEW_SCENES,models=PREVIEW_MODELS,status=document.querySelector('#status')
async function start(){
 const renderer=new THREE.WebGLRenderer({antialias:true})
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));document.querySelector('main').append(renderer.domElement)
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xbcd5e1)
 const camera=new THREE.PerspectiveCamera(55,1,.1,100)
 scene.add(new THREE.HemisphereLight(0xffffff,0xb7a386,2))
 const sun=new THREE.DirectionalLight(0xffeedc,2);sun.position.set(6,10,4);scene.add(sun)
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x818d78}));floor.rotation.x=-Math.PI/2;scene.add(floor)
 const loader=new GLTFLoader(),library={}
 for(const [key,b64] of Object.entries(models)){
  const data=Uint8Array.from(atob(b64),c=>c.charCodeAt(0))
  library[key]=(await loader.parseAsync(data.buffer,'')).scene
 }
 const group=new THREE.Group();scene.add(group)
 const select=document.querySelector('#site')
 for(const site of Object.keys(scenes))select.add(new Option(site==='laflin'?'Circle Park · Laflin':'Greenville · Student Union',site))
 let index=-1
 function draw(){const c=renderer.domElement;renderer.setSize(c.clientWidth,c.clientHeight,false);camera.aspect=c.clientWidth/Math.max(1,c.clientHeight);camera.updateProjectionMatrix();renderer.render(scene,camera)}
 function home(){
  index=-1;const side=select.value==='laflin'?1:-1
  camera.position.set(0,5,side*21);camera.lookAt(0,1,side*6);status.textContent=group.children.length+' placed props · entrance view';draw()
 }
 function load(){group.clear();for(const p of scenes[select.value]){const model=library[p.asset].clone(true);model.position.set(...p.position);model.rotation.y=p.rotationY||0;model.name=p.asset;group.add(model)}home()}
 select.onchange=load;document.querySelector('#back').onclick=home
 document.querySelector('#walk').onclick=()=>{index=(index+1)%group.children.length;const model=group.children[index];camera.position.copy(model.position).add(new THREE.Vector3(2,1.65,3));camera.lookAt(model.position.x,1,model.position.z);status.textContent='At '+model.name;draw()}
 load();window.addEventListener('resize',draw)
}
start().catch(error=>{status.textContent='Preview could not open: '+error.message})
