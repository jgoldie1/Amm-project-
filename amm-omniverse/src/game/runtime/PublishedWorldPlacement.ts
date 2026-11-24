import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {resolvePublishedMeshyAsset} from '../../runtime/StreetVerseMeshyAssetManifest'

export type WorldPlacement={id:string;assetId:string;position:[number,number,number];rotationY:number;scale:number}
export async function placePublishedWorldAssets(parent:THREE.Object3D,worldId:string,placements:WorldPlacement[]){
 const ids=new Set<string>()
 for(const p of placements){
  if(!p.id.trim()||ids.has(p.id)||!p.assetId.trim()||p.position.length!==3||![...p.position,p.rotationY,p.scale].every(Number.isFinite)||p.scale<=0)throw new Error('Invalid world placement: '+p.id)
  ids.add(p.id)
 }
 const root=new THREE.Group();root.name='published-world:'+worldId
 const loader=new GLTFLoader()
 const dispose=()=>{
  root.removeFromParent()
  const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>()
  root.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);for(const v of Object.values(m))if(v instanceof THREE.Texture)textures.add(v)}}})
  textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());root.clear()
 }
 try{
  for(const p of placements){
   const asset=await resolvePublishedMeshyAsset(p.assetId,worldId)
   if(!asset?.ready||(asset.cityScope!==worldId&&asset.cityScope!=='global'))throw new Error('Published asset missing: '+p.assetId)
   const url=new URL(asset.url,window.location.origin)
   if(url.protocol!=='https:'&&url.origin!==window.location.origin)throw new Error('Unsafe asset URL')
   const gltf=await loader.loadAsync(url.href)
   const model=gltf.scene
   model.name=p.id;model.position.set(...p.position);model.rotation.y=p.rotationY;model.scale.setScalar(p.scale)
   model.userData={...model.userData,assetId:p.assetId,worldId,completedAt:asset.completedAt}
   root.add(model)
   let meshCount=0;model.traverse(o=>{if(o instanceof THREE.Mesh)meshCount++})
   if(!meshCount)throw new Error('No renderable meshes: '+p.assetId)
  }
  parent.add(root)
  return {root,placedIds:[...ids],dispose}
 }catch(error){dispose();throw error}
}
