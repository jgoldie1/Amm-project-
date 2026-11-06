import * as THREE from 'three'
import {initialLivingWorldState} from './StreetVerseLivingStoreRuntime'
/** Lightweight original 3D vendor kiosks, NPC shopkeepers and animated customer silhouettes. */
export function mountLivingStoreScene(scene:THREE.Scene){
 const root=new THREE.Group();root.name='streetverse-living-stores-3d'
 const meshes:THREE.Mesh[]=[]
 const box=(parent:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,color:number)=>{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.65}))
  mesh.position.set(x,y,z);parent.add(mesh);meshes.push(mesh);return mesh
 }
 const vendors:THREE.Group[]=[]
 initialLivingWorldState().stores.forEach((store,i)=>{
  const group=new THREE.Group();group.name='shop-'+store.id;group.position.set(store.x,0,store.z)
  // Keep interior hollow so the avatar can walk through the front entrance.
  box(group,5,.2,5,0,3,0,[0x413d70,0x6a4a36,0x36566b][i])
  box(group,4.4,.55,.55,0,2.65,2.2,[0xf4b55a,0xffd175,0x90d9ee][i])
  // Open front arcade: walkable floor, side walls, rear wall and accessible doorway.
  box(group,5,.15,5,0,.08,0,0x8999a2)
  box(group,.25,2.6,5,-2.45,1.4,0,0x3e465a)
  box(group,.25,2.6,5,2.45,1.4,0,0x3e465a)
  box(group,5,2.6,.25,0,1.4,-2.45,0x3e465a)
  for(const side of [-1,1]){
   box(group,1.5,1.3,.25,side*1.75,1,2.4,0x1c384d)
   for(const shelfY of [.6,1.2,1.8])box(group,1.3,.12,1.2,side*1.5,shelfY,-.75,0xb3a08a)
   for(const itemZ of [-1.1,-.7,-.3])box(group,.3,.3,.3,side*1.5,1.43,itemZ,[0xecc96b,0xa9c4e4,0xc88fbc][i])
  }
  box(group,2.5,.8,.75,0,.55,-1.7,0x966f53)
  const vendor=new THREE.Group();vendor.name='npc-vendor-'+store.id
  box(vendor,.55,1,.35,0,1.15,0,0x1d86aa)
  box(vendor,.43,.43,.43,0,1.85,0,0x9b6548)
  vendor.position.set(0,0,-1.6);group.add(vendor);vendors.push(vendor)
  const labelCanvas=typeof document!=='undefined'?document.createElement('canvas'):null
  if(labelCanvas){labelCanvas.width=512;labelCanvas.height=96;const ctx=labelCanvas.getContext('2d')
   if(ctx){ctx.fillStyle='#102b43';ctx.fillRect(0,0,512,96);ctx.fillStyle='#ffffff';ctx.font='bold 29px sans-serif';ctx.textAlign='center';ctx.fillText(store.name.slice(0,26),256,60)
    const texture=new THREE.CanvasTexture(labelCanvas),mat=new THREE.SpriteMaterial({map:texture,transparent:true})
    const sprite=new THREE.Sprite(mat);sprite.scale.set(4.4,.83,1);sprite.position.set(0,3.6,2.15);group.add(sprite)
   }
  }
  root.add(group)
 })
 scene.add(root)
 return {root,update:(elapsed:number)=>{vendors.forEach((v,i)=>{v.rotation.y=Math.sin(elapsed*.001+i)*.2;v.position.y=Math.sin(elapsed*.002+i)*.035})},dispose:()=>{scene.remove(root);root.traverse(o=>{if(o instanceof THREE.Sprite){o.material.map?.dispose();o.material.dispose()}});meshes.forEach(m=>{m.geometry.dispose();(m.material as THREE.Material).dispose()})}}
}

/** Capsule-footprint approximation for small shops, preserving a central front doorway. */
export function storeInteriorCollision(x:number,z:number,radius=.28):{inside:boolean;blocked:boolean;storeId:string|null}{
 for(const store of initialLivingWorldState().stores){
  const dx=x-store.x,dz=z-store.z
  if(Math.abs(dx)>3.2||Math.abs(dz)>3.2)continue
  const inside=Math.abs(dx)<2.4&&Math.abs(dz)<2.4
  const sideWall=Math.abs(dx)>2.15&&Math.abs(dx)<2.7&&Math.abs(dz)<2.7
  const rearWall=dz< -2.15&&dz> -2.7&&Math.abs(dx)<2.7
  const frontWall=dz>2.15&&dz<2.7&&Math.abs(dx)>1.02
  const shelves=Math.abs(dx)>1.03&&Math.abs(dx)<2.12&&dz> -1.48&&dz<.18
  const counter=Math.abs(dx)<1.55&&dz< -1.1&&dz> -2.18
  const blocked=sideWall||rearWall||frontWall||shelves||counter
  // Radius expansion keeps the avatar from clipping walls and fixtures.
  const nearWall=Math.abs(dx)+radius>2.28&&Math.abs(dz)<2.6
  return {inside,blocked:blocked||nearWall,storeId:store.id}
 }
 return {inside:false,blocked:false,storeId:null}
}
