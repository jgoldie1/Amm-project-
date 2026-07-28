'use strict';
const { EventEmitter } = require('events');
const { SoloAmbientPresenceAdapter } = require('./presence-adapter');

function disposeMaterial(material, shared=new Set()) {
  if (!material || shared.has(material)) return;
  for (const value of Object.values(material)) if (value && typeof value.dispose==='function' && value.isTexture && !shared.has(value)) value.dispose();
  material.dispose?.();
}
function disposeObject(root, sharedAssets=new Set()) {
  if (!root) return;
  root.traverse?.((node)=>{
    if (node.geometry && !sharedAssets.has(node.geometry)) node.geometry.dispose?.();
    if (Array.isArray(node.material)) node.material.forEach((m)=>disposeMaterial(m,sharedAssets));
    else disposeMaterial(node.material,sharedAssets);
  });
  while (root.children?.length) root.remove(root.children[0]);
}
function counts(renderer){ return { geometries:Number(renderer?.info?.memory?.geometries||0), textures:Number(renderer?.info?.memory?.textures||0) }; }
class WorldLoader extends EventEmitter {
  constructor({registry,renderer,scene,avatar,THREE,assetLoader,presenceAdapter,persistence,reducedMotion=false,sharedAssets=[]}) {
    super(); Object.assign(this,{registry,renderer,scene,avatar,THREE,assetLoader,persistence,reducedMotion});
    this.presenceAdapter=presenceAdapter||new SoloAmbientPresenceAdapter(); this.sharedAssets=new Set(sharedAssets); this.current=null; this.transitioning=false;
    if(!registry||!renderer||!scene||!avatar||!THREE) throw new Error('WorldLoader requires registry, renderer, scene, avatar and THREE');
  }
  async preload(slug){
    const world=this.registry.get(slug); if(!world) throw new Error(`Unknown world: ${slug}`); if(world.status!=='live') throw new Error(`World ${slug} is not enterable because status is ${world.status}`);
    this.emit('progress',{slug,phase:'validate',percent:10});
    let resource=null;
    if(world.environment.kind==='gltf' && world.environment.assetUrl && this.assetLoader){ resource=await this.assetLoader(world.environment.assetUrl,(p)=>this.emit('progress',{slug,phase:'download',percent:10+Math.round(p*70)})); }
    this.emit('progress',{slug,phase:'ready',percent:90}); return {world,resource};
  }
  buildPrimitive(world){
    const f=world.environment.fallback||{}; const color=f.color||'#444444'; let geometry;
    if(f.shape==='cylinder') geometry=new this.THREE.CylinderGeometry((f.size?.[0]||18)/2,(f.size?.[0]||18)/2,f.size?.[1]||1,32);
    else geometry=new this.THREE.BoxGeometry(...(f.size||[20,1,20]));
    const material=new this.THREE.MeshStandardMaterial({color}); const mesh=new this.THREE.Mesh(geometry,material); mesh.position.y=-(f.size?.[1]||1)/2; return mesh;
  }
  enforceBudget(world,before,after){ const dg=after.geometries-before.geometries, dt=after.textures-before.textures; if(dg>world.budget.maxGeometries) throw new Error(`World ${world.slug} exceeds geometry ceiling ${world.budget.maxGeometries}: ${dg}`); if(dt>world.budget.maxTextures) throw new Error(`World ${world.slug} exceeds texture ceiling ${world.budget.maxTextures}: ${dt}`); }
  async mount(preloaded,viewer={}){
    if(this.current) throw new Error('One-world-at-a-time invariant violated: unmount current world first');
    const {world,resource}=preloaded; const baseline=counts(this.renderer); const group=new this.THREE.Group(); group.name=`world:${world.slug}`;
    group.add(resource?.scene||this.buildPrimitive(world));
    for(const p of world.portals){ const marker=new this.THREE.Mesh(new this.THREE.CylinderGeometry(p.radius,p.radius,0.12,24),new this.THREE.MeshBasicMaterial({color:'#00d7ff',transparent:true,opacity:.55})); marker.name=`portal:${p.id}`; marker.position.set(p.position.x,p.position.y,p.position.z); marker.userData.portal=p; group.add(marker); }
    this.scene.add(group); this.renderer.render?.(this.scene,this.avatar.camera||undefined); const after=counts(this.renderer);
    try{ this.enforceBudget(world,baseline,after); } catch(e){ this.scene.remove(group); disposeObject(group,this.sharedAssets); throw e; }
    this.avatar.position?.set(world.spawn.x,world.spawn.y,world.spawn.z); await this.presenceAdapter.join(world,viewer); this.current={world,group,baseline,mountedCounts:after}; this.emit('mounted',{world,stats:this.getStats()}); this.emit('announce',`Entered ${world.name}`); return this.current;
  }
  async unmount(){
    if(!this.current) return {released:true,before:counts(this.renderer),after:counts(this.renderer)};
    const current=this.current; const before=counts(this.renderer); await this.presenceAdapter.leave(current.world); this.scene.remove(current.group); disposeObject(current.group,this.sharedAssets); this.renderer.renderLists?.dispose?.(); this.renderer.render?.(this.scene,this.avatar.camera||undefined); const after=counts(this.renderer); this.current=null;
    const released=after.geometries<=current.baseline.geometries && after.textures<=current.baseline.textures;
    this.emit('unmounted',{slug:current.world.slug,before,after,released}); return {released,before,after,baseline:current.baseline};
  }
  async transition(toSlug,viewer={}){ if(this.transitioning) throw new Error('A world transition is already in progress'); this.transitioning=true; try{ const from=this.current?.world.slug||null; this.emit('transition',{from,to:toSlug,phase:'start',reducedMotion:this.reducedMotion}); const release=await this.unmount(); if(!release.released) throw new Error(`GPU memory was not released before loading ${toSlug}`); const preloaded=await this.preload(toSlug); const mounted=await this.mount(preloaded,viewer); this.persistence?.save(toSlug,{x:this.avatar.position.x,y:this.avatar.position.y,z:this.avatar.position.z}); this.emit('transition',{from,to:toSlug,phase:'complete'}); return mounted; } finally{ this.transitioning=false; } }
  async checkPortals(viewer={}){ if(!this.current)return null; const pos=this.avatar.position; for(const p of this.current.world.portals){ const dx=pos.x-p.position.x,dy=pos.y-p.position.y,dz=pos.z-p.position.z; if(Math.hypot(dx,dy,dz)<=p.radius) return this.transition(p.toSlug,viewer); } return null; }
  getStats(){ return {currentWorld:this.current?.world.slug||null,memory:counts(this.renderer),baseline:this.current?.baseline||null}; }
  async dispose(){ await this.unmount(); this.presenceAdapter.dispose?.(); this.removeAllListeners(); }
}
module.exports={WorldLoader,disposeObject,counts};
