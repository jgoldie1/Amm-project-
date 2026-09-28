import * as THREE from 'three'

export class WorldStreamer{
 constructor(scene,{chunkSize=100,renderDistance=2,loadChunk}={}){
  this.scene=scene;this.chunkSize=chunkSize;this.renderDistance=renderDistance;this.loadedChunks=new Map();this.loadChunkFactory=loadChunk
 }
 async update(playerPosition){
  const cx=Math.floor(playerPosition.x/this.chunkSize),cz=Math.floor(playerPosition.z/this.chunkSize),wanted=new Set(),jobs=[]
  for(let dx=-this.renderDistance;dx<=this.renderDistance;dx++)for(let dz=-this.renderDistance;dz<=this.renderDistance;dz++){
   const x=cx+dx,z=cz+dz,key=x+','+z;wanted.add(key)
   if(!this.loadedChunks.has(key))jobs.push(this.loadChunk(key,x,z))
  }
  await Promise.all(jobs)
  for(const [key,group] of [...this.loadedChunks])if(!wanted.has(key))this.unloadChunk(key,group)
 }
 async loadChunk(key,x,z){
  const group=this.loadChunkFactory?await this.loadChunkFactory({key,x,z}):new THREE.Group()
  group.position.set(x*this.chunkSize,0,z*this.chunkSize);this.scene.add(group);this.loadedChunks.set(key,group);return group
 }
 unloadChunk(key,group){
  this.scene.remove(group)
  group.traverse(child=>{
   if(!child.isMesh||child.userData?.sharedResource)return
   child.geometry?.dispose?.()
   const mats=Array.isArray(child.material)?child.material:[child.material]
   for(const m of mats){if(!m)continue;for(const k of ['map','normalMap','roughnessMap','metalnessMap','emissiveMap'])m[k]?.dispose?.();m.dispose?.()}
  })
  this.loadedChunks.delete(key)
 }
}
