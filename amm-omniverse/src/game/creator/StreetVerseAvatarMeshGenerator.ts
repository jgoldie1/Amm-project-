import * as THREE from 'three';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
import type {AvatarProfile} from './StreetVersePersonalAvatar';

/** Locally generated, skin-weighted humanoid fallback. Not a likeness reconstruction. */
export async function generateRiggedProxyGLB(profile:AvatarProfile):Promise<Blob>{
 const scene=new THREE.Scene(),root=new THREE.Group();root.name='StreetVersePlayer';scene.add(root);
 const hip=new THREE.Bone();hip.name='Hips';hip.position.y=1;root.add(hip);
 const spine=new THREE.Bone();spine.name='Spine';spine.position.y=.42;hip.add(spine);
 const neck=new THREE.Bone();neck.name='Neck';neck.position.y=.38;spine.add(neck);
 const head=new THREE.Bone();head.name='Head';head.position.y=.22;neck.add(head);
 const bones=[hip,spine,neck,head];
 for(const side of [-1,1]){
  const arm=new THREE.Bone();arm.name=side<0?'LeftArm':'RightArm';arm.position.set(side*.32,.28,0);spine.add(arm);bones.push(arm);
  const forearm=new THREE.Bone();forearm.name=side<0?'LeftForeArm':'RightForeArm';forearm.position.set(side*.32,-.08,0);arm.add(forearm);bones.push(forearm);
  const leg=new THREE.Bone();leg.name=side<0?'LeftUpLeg':'RightUpLeg';leg.position.set(side*.16,-.08,0);hip.add(leg);bones.push(leg);
  const shin=new THREE.Bone();shin.name=side<0?'LeftLeg':'RightLeg';shin.position.y=-.47;leg.add(shin);bones.push(shin);
 }
 root.updateMatrixWorld(true);
 const skeleton=new THREE.Skeleton(bones);
 const skin=new THREE.MeshStandardMaterial({color:profile.skinTone,roughness:.8});
 const cloth=new THREE.MeshStandardMaterial({color:profile.outfitPrimary,roughness:.85});
 function piece(name:string,geometry:THREE.BufferGeometry,material:THREE.Material,bone:THREE.Bone,offset:THREE.Vector3){
  const idx=bones.indexOf(bone);const count=geometry.getAttribute('position').count;
  const indices=new Uint16Array(count*4),weights=new Float32Array(count*4);
  for(let i=0;i<count;i++){indices[i*4]=idx;weights[i*4]=1}
  geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));
  geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
  const mesh=new THREE.SkinnedMesh(geometry,material);mesh.name=name;
  const pos=new THREE.Vector3();bone.getWorldPosition(pos);mesh.position.copy(pos).add(offset);
  root.add(mesh);mesh.bind(skeleton);return mesh;
 }
 piece('Torso',new THREE.CapsuleGeometry(.28,.5,6,16),cloth,spine,new THREE.Vector3(0,-.02,0));
 piece('HeadMesh',new THREE.SphereGeometry(.24,20,16),skin,head,new THREE.Vector3(0,.12,0));
 for(const side of [-1,1]){
  const arm=bones.find(b=>b.name===(side<0?'LeftArm':'RightArm'))!;
  const forearm=bones.find(b=>b.name===(side<0?'LeftForeArm':'RightForeArm'))!;
  const leg=bones.find(b=>b.name===(side<0?'LeftUpLeg':'RightUpLeg'))!;
  const shin=bones.find(b=>b.name===(side<0?'LeftLeg':'RightLeg'))!;
  piece(arm.name+'Mesh',new THREE.CapsuleGeometry(.105,.3,4,10),cloth,arm,new THREE.Vector3(side*.1,-.14,0));
  piece(forearm.name+'Mesh',new THREE.CapsuleGeometry(.085,.28,4,10),skin,forearm,new THREE.Vector3(side*.04,-.16,0));
  piece(leg.name+'Mesh',new THREE.CapsuleGeometry(.14,.28,4,10),cloth,leg,new THREE.Vector3(0,-.2,0));
  piece(shin.name+'Mesh',new THREE.CapsuleGeometry(.11,.27,4,10),cloth,shin,new THREE.Vector3(0,-.2,0));
 }
 root.updateMatrixWorld(true);
 const exporter=new GLTFExporter();
 const output=await exporter.parseAsync(scene,{binary:true,onlyVisible:true});
 if(!(output instanceof ArrayBuffer))throw new Error('GLB export failed');
 return new Blob([output],{type:'model/gltf-binary'});
}
// Basic single-bone skin weights are intentionally a fallback.
// AAA fidelity needs real licensed geometry, multi-weight deformation,
// facial blendshapes, textures, retargeted motion and visual QA.
