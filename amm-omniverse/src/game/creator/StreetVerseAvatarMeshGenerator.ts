import * as THREE from 'three';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
import type {AvatarProfile} from './StreetVersePersonalAvatar';
// Deterministic playable proxy, not a face reconstruction or identity match.
// Uses a basic humanoid skeleton so an avatar can be exported without a paid AI API.
export async function generateRiggedProxyGLB(profile:AvatarProfile):Promise<Blob>{
 const scene=new THREE.Scene(),root=new THREE.Group();root.name='StreetVersePlayer';scene.add(root);
 const hip=new THREE.Bone();hip.name='Hips';hip.position.y=1;root.add(hip);
 const spine=new THREE.Bone();spine.name='Spine';spine.position.y=.45;hip.add(spine);
 const neck=new THREE.Bone();neck.name='Neck';neck.position.y=.35;spine.add(neck);
 const head=new THREE.Bone();head.name='Head';head.position.y=.22;neck.add(head);
 for(const side of [-1,1]){
  const arm=new THREE.Bone();arm.name=side<0?'LeftArm':'RightArm';arm.position.set(side*.27,.28,0);spine.add(arm);
  const forearm=new THREE.Bone();forearm.name=side<0?'LeftForeArm':'RightForeArm';forearm.position.set(side*.38,-.12,0);arm.add(forearm);
  const leg=new THREE.Bone();leg.name=side<0?'LeftUpLeg':'RightUpLeg';leg.position.set(side*.17,-.04,0);hip.add(leg);
  const shin=new THREE.Bone();shin.name=side<0?'LeftLeg':'RightLeg';shin.position.y=-.48;leg.add(shin);
 }
 const skin=new THREE.MeshStandardMaterial({color:profile.skinTone,roughness:.8});
 const cloth=new THREE.MeshStandardMaterial({color:profile.outfitPrimary,roughness:.85});
 const parts:[THREE.BufferGeometry,THREE.Material,THREE.Bone,number][]=[
  [new THREE.CapsuleGeometry(.28,.55,4,12),cloth,spine,-.05],
  [new THREE.SphereGeometry(.24,16,12),skin,head,.15],
 ];
 for(const [geometry,material,bone,y] of parts){const mesh=new THREE.Mesh(geometry,material);mesh.position.y=y;bone.add(mesh)}
 root.updateMatrixWorld(true);
 const exporter=new GLTFExporter();
 const output=await exporter.parseAsync(scene,{binary:true,onlyVisible:true});
 if(!(output instanceof ArrayBuffer))throw new Error('GLB export failed');
 return new Blob([output],{type:'model/gltf-binary'});
}
// This is a rig-hierarchy proxy only: it is not skin-weighted, face-matched,
// motion-retargeted, or photorealistic. Real reconstruction must use approved assets.
