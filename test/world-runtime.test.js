'use strict';
const assert=require('assert');
const path=require('path');
const {createWorldRegistry,validate}=require('../src/worlds/world-registry');
const {WorldLoader}=require('../src/worlds/world-loader');
const registry=createWorldRegistry({file:path.join(__dirname,'..','data','worlds.json')});
assert.equal(registry.get('faith-hub').name,'The Faith Hub');
assert.throws(()=>validate({slug:'Bad Slug'}),/Invalid world registry entry/);
assert.equal(registry.get('missing'),null);
class Obj{constructor(){this.children=[];this.position={x:0,y:0,z:0,set:(x,y,z)=>Object.assign(this.position,{x,y,z})};this.userData={};}add(o){this.children.push(o)}remove(o){this.children=this.children.filter(x=>x!==o)}traverse(fn){fn(this);this.children.forEach(c=>c.traverse?c.traverse(fn):fn(c))}}
function fakeThree(memory){class Geo{constructor(){memory.geometries++;this.disposed=false}dispose(){if(!this.disposed){memory.geometries--;this.disposed=true}}}class Mat{constructor(){this.disposed=false}dispose(){this.disposed=true}}class Mesh extends Obj{constructor(g,m){super();this.geometry=g;this.material=m}}return {Group:Obj,BoxGeometry:Geo,CylinderGeometry:Geo,MeshStandardMaterial:Mat,MeshBasicMaterial:Mat,Mesh};}
(async()=>{
 const memory={geometries:0,textures:0};const THREE=fakeThree(memory);const scene=new Obj();const avatar=new Obj();const renderer={info:{memory},render(){},renderLists:{dispose(){}}};
 const loader=new WorldLoader({registry,renderer,scene,avatar,THREE});
 await loader.mount(await loader.preload('faith-hub'),{id:'viewer'});assert.equal(loader.current.world.slug,'faith-hub');assert.deepEqual({x:avatar.position.x,y:avatar.position.y,z:avatar.position.z},registry.get('faith-hub').spawn);assert(loader.getStats().memory.geometries>0);
 avatar.position.set(0,1,-8);await loader.checkPortals({id:'viewer'});assert.equal(loader.current.world.slug,'lion-kingdom-gate');assert.equal(loader.current.baseline.geometries,0,'faith-hub geometry must be released before lion world mounts');
 const release=await loader.unmount();assert.equal(release.released,true);assert.deepEqual(renderer.info.memory,{geometries:0,textures:0});
 await assert.rejects(()=>loader.preload('chicago-commons'),/not enterable/);
 const over={...registry.get('faith-hub'),slug:'over-budget',budget:{maxGeometries:1,maxTextures:0},portals:[]};const overRegistry=createWorldRegistry({worlds:[over]});const overLoader=new WorldLoader({registry:overRegistry,renderer,scene,avatar,THREE});overLoader.buildPrimitive=()=>{const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial()));g.add(new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial()));return g};await assert.rejects(()=>overLoader.mount(await overLoader.preload('over-budget')),/geometry ceiling 1/);assert.equal(memory.geometries,0);
 console.log('Living Worlds runtime tests passed: registry, portal transition, memory release and budget enforcement.');
})().catch(e=>{console.error(e);process.exitCode=1});
