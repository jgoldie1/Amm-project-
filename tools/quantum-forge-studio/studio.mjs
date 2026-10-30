import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {PARAMS,validateDesign,makeBuilding} from './quantum-forge-core.mjs';
import {loadThreeMesh,decodeImageFile,checkXR,prepareSlicing} from './quantum-forge-bridge.mjs';
import {toAsciiSTL} from './quantum-forge-core.mjs';
const $=id=>document.getElementById(id),canvas=$('view'),renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene();scene.background=new THREE.Color('#242438');const camera=new THREE.PerspectiveCamera(50,1,.1,2000);camera.position.set(20,16,25);camera.lookAt(0,4,0);scene.add(new THREE.HemisphereLight(0xffffff,0x444466,2));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(12,20,10);scene.add(light);const grid=new THREE.GridHelper(100,50);scene.add(grid);let current=null,model=null,spin=0;
function status(s){$('status').textContent=s}
function replace(obj){if(current){scene.remove(current);current.traverse?.(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}})}current=obj;scene.add(obj)}
const defaults=validateDesign();for(const key of PARAMS){const label=document.createElement('label');label.textContent=key;const input=document.createElement('input');input.type='number';input.step=key==='levels'||key==='windowCount'?'1':'0.1';input.value=defaults[key];input.id='param-'+key;input.addEventListener('change',()=>refresh());label.append(input);$('controls').append(label)}
async function show(m){model=m;replace(await loadThreeMesh(THREE,m));status(m.warning||'Preview ready')}
async function refresh(){try{const p=Object.fromEntries(PARAMS.map(k=>[k,Number($('param-'+k).value)]));await show(makeBuilding(p))}catch(e){status(e.message)}}
$('generate').onclick=refresh;
$('stl').onclick=()=>{if(!model){status('Generate a printable model first');return}const c=prepareSlicing(model);if(!c.readyForExternalSlicer){status('Mesh not watertight; STL export blocked');return}const blob=new Blob([toAsciiSTL(model)],{type:'model/stl'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='quantum-forge-prototype.stl';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);status('Prototype STL saved; verify scale, wall thickness and slicer settings')}
$('xr').onclick=async()=>{const r=await checkXR(navigator);status('WebXR support: AR '+r.ar+', VR '+r.vr+'. Headset sessions are not launched in this prototype.')};
$('image').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{status('Decoding image...');await show(await decodeImageFile(file))}catch(err){status(err.message)}};
$('glb').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const url=URL.createObjectURL(file);try{const gltf=await new GLTFLoader().loadAsync(url);model=null;replace(gltf.scene);status('Imported '+file.name+' for visual inspection; '+gltf.animations.length+' animation clips found. No gameplay controller connected.')}finally{URL.revokeObjectURL(url)}}catch(err){status(err.message)}};
let dragging=false,last=0;canvas.addEventListener('pointerdown',e=>{dragging=true;last=e.clientX;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointermove',e=>{if(dragging&&current){current.rotation.y+=(e.clientX-last)*.008;last=e.clientX}});
function draw(){const w=canvas.clientWidth,h=canvas.clientHeight;if(canvas.width!==Math.floor(w*renderer.getPixelRatio())||canvas.height!==Math.floor(h*renderer.getPixelRatio())){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}renderer.render(scene,camera);requestAnimationFrame(draw)}refresh();draw();
