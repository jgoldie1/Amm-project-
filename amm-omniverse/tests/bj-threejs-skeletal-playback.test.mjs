import assert from 'node:assert/strict'
import test from 'node:test'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {createBJOriginalRiggedGLB} from '../scripts/build-bj-original-rigged-glb.mjs'

// This test uses only first-party generated geometry. Never commit owner photo assets.
test('original BJ standby GLB can be parsed, skinned and animated by real Three.js mixer',async()=>{
 const glb=createBJOriginalRiggedGLB()
 const loader=new GLTFLoader()
 const decoded=await loader.parseAsync(glb.buffer.slice(glb.byteOffset,glb.byteOffset+glb.byteLength),'')
 const root=decoded.scene
 const skins=[]
 root.traverse(node=>{if(node instanceof THREE.SkinnedMesh)skins.push(node)})
 assert.ok(skins.length>=1,'GLTFLoader must reconstruct SkinnedMesh, not generic Mesh')
 assert.ok(skins.some(mesh=>mesh.skeleton.bones.length>=17),'expected real 17-bone skeleton')
 const hips=root.getObjectByName('Hips')
 const leftLeg=root.getObjectByName('Thigh.L')
 assert.ok(hips&&leftLeg,'original animation target bones must exist')
 const clip=decoded.animations.find(clip=>/walk/i.test(clip.name))
 assert.ok(clip&&clip.tracks.length>0,'walk animation must contain live tracks')
 const mixer=new THREE.AnimationMixer(root)
 const before=leftLeg.quaternion.clone()
 mixer.clipAction(clip).reset().play()
 mixer.update(.16)
 root.updateMatrixWorld(true)
 for(const mesh of skins)mesh.skeleton.update()
 assert.ok(before.angleTo(leftLeg.quaternion)>.02,'walk clip must rotate an actual rig bone')
 assert.ok(skins.some(mesh=>mesh.skeleton.boneMatrices.some(n=>Math.abs(n)>1e-6)),
  'skin matrices should update after motion')
 mixer.stopAllAction()
})
