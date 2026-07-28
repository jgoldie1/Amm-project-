import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const required = ['slug','name','status','version','ageLane'];
export class WorldRegistry {
  constructor(entries){ this.entries=entries; entries.forEach(e=>this.validate(e)); }
  validate(entry){
    const missing=required.filter(k=>entry[k]===undefined||entry[k]===null||entry[k]==='');
    if(missing.length) throw new Error(`World ${entry.slug||'(unknown)'} missing: ${missing.join(', ')}`);
    if(!/^[a-z0-9-]+$/.test(entry.slug)) throw new Error(`Invalid world slug: ${entry.slug}`);
    if(entry.status==='live'){
      if(!entry.spawn||!entry.budget||!entry.environment||!Array.isArray(entry.portals)) throw new Error(`Live world ${entry.slug} lacks runtime metadata`);
      for(const p of entry.portals) if(!p.toSlug||!p.position) throw new Error(`Portal ${p.id||'(unknown)'} is malformed`);
    }
    return true;
  }
  list(){return [...this.entries]}
  get(slug){const entry=this.entries.find(w=>w.slug===slug);if(!entry)throw new Error(`Unknown world: ${slug}`);return entry}
  assertEnterable(slug){const entry=this.get(slug);if(entry.status!=='live')throw new Error(`${entry.name} is ${entry.status}, not live`);return entry}
}

export class SoloAmbientPresence {
  async enter(){return {mode:'solo-ambient'}}
  async leave(){}
  update(){}
}

export class WorldRuntime extends EventTarget {
  constructor({renderer,scene,camera,avatar,presence=new SoloAmbientPresence()}){
    super(); Object.assign(this,{renderer,scene,camera,avatar,presence}); this.current=null; this.portalMeshes=[];
  }
  stats(){return {geometries:this.renderer.info.memory.geometries,textures:this.renderer.info.memory.textures,programs:this.renderer.info.programs?.length||0}}
  enforceBudget(entry){const b=entry.budget;if(b.maxGeometries>100||b.maxTextures>32||b.maxTriangles>500000)throw new Error(`${entry.slug} exceeds platform budget ceiling`)}
  async mount(entry){
    this.enforceBudget(entry); const group=new THREE.Group(); group.name=`world:${entry.slug}`;
    const [x,y,z]=entry.environment.size; const geo=entry.environment.shape==='cylinder'?new THREE.CylinderGeometry(x/2,x/2,y,32):new THREE.BoxGeometry(x,y,z);
    const mat=new THREE.MeshStandardMaterial({color:entry.environment.color,roughness:.8}); const floor=new THREE.Mesh(geo,mat); floor.position.y=-y/2; group.add(floor);
    const light=new THREE.HemisphereLight(0xffffff,0x222244,2);group.add(light);
    this.portalMeshes=entry.portals.map(p=>{const g=new THREE.TorusGeometry(1.5,.22,12,32);const m=new THREE.MeshBasicMaterial({color:0x00ffff});const mesh=new THREE.Mesh(g,m);mesh.position.set(p.position.x,p.position.y,p.position.z);mesh.userData.portal=p;group.add(mesh);return mesh});
    this.scene.add(group); this.avatar.position.set(entry.spawn.x,entry.spawn.y,entry.spawn.z); this.avatar.rotation.y=entry.spawn.rotationY||0;
    await this.presence.enter(entry.slug); this.current={entry,group}; this.dispatchEvent(new CustomEvent('mounted',{detail:entry})); return entry;
  }
  disposeObject(root){root.traverse(obj=>{if(obj.geometry)obj.geometry.dispose();if(obj.material){const mats=Array.isArray(obj.material)?obj.material:[obj.material];mats.forEach(mat=>{Object.values(mat).forEach(v=>v?.isTexture&&v.dispose());mat.dispose()})}})}
  async unmount(){if(!this.current)return;const old=this.current;await this.presence.leave(old.entry.slug);this.scene.remove(old.group);this.disposeObject(old.group);this.portalMeshes=[];this.current=null;this.renderer.renderLists?.dispose?.();this.dispatchEvent(new CustomEvent('unmounted',{detail:old.entry}));}
  async transition(toSlug,registry){const target=registry.assertEnterable(toSlug);await this.unmount();return this.mount(target)}
  checkPortal(){if(!this.current)return null;for(const mesh of this.portalMeshes){const p=mesh.userData.portal;if(this.avatar.position.distanceTo(mesh.position)<=p.radius)return p}return null}
}

export async function bootLivingWorlds(){
  const status=document.querySelector('#worldStatus'),announce=document.querySelector('#worldAnnounce'),canvas=document.querySelector('#worldCanvas');
  const data=await fetch('/data/worlds.json').then(r=>{if(!r.ok)throw new Error('World registry failed to load');return r.json()}); const registry=new WorldRegistry(data.worlds);
  registry.list().filter(w=>w.status==='live').forEach(w=>w.portals.forEach(p=>registry.assertEnterable(p.toSlug)));
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x080b16);const camera=new THREE.PerspectiveCamera(60,canvas.clientWidth/canvas.clientHeight,.1,200);camera.position.set(0,5,14);
  const avatar=new THREE.Mesh(new THREE.CapsuleGeometry(.45,1,6,10),new THREE.MeshStandardMaterial({color:0xffd166}));scene.add(avatar);
  const runtime=new WorldRuntime({renderer,scene,camera,avatar});const keys=new Set();
  runtime.addEventListener('mounted',e=>{status.textContent=`${e.detail.name} · ${runtime.stats().geometries} geometries`;announce.textContent=`Entered ${e.detail.name}`;localStorage.setItem('tryamm_world',e.detail.slug)});
  addEventListener('keydown',e=>{keys.add(e.key.toLowerCase());if(e.key==='Enter'){const p=runtime.checkPortal();if(p)runtime.transition(p.toSlug,registry).catch(showError)}});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  const showError=e=>{status.textContent=e.message;announce.textContent=e.message};
  const clock=new THREE.Clock();function loop(){requestAnimationFrame(loop);const d=clock.getDelta(),speed=5*d;if(keys.has('w')||keys.has('arrowup'))avatar.position.z-=speed;if(keys.has('s')||keys.has('arrowdown'))avatar.position.z+=speed;if(keys.has('a')||keys.has('arrowleft'))avatar.position.x-=speed;if(keys.has('d')||keys.has('arrowright'))avatar.position.x+=speed;camera.position.x+=(avatar.position.x-camera.position.x)*.08;camera.position.z+=(avatar.position.z+12-camera.position.z)*.08;camera.lookAt(avatar.position);const p=runtime.checkPortal();document.querySelector('#portalPrompt').hidden=!p;renderer.render(scene,camera)}
  const start=localStorage.getItem('tryamm_world');await runtime.mount(registry.assertEnterable(start&&registry.get(start).status==='live'?start:'faith-hub'));loop();window.__livingWorlds={runtime,registry,renderer};
}
