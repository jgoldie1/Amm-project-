import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {execFileSync} from 'node:child_process'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {createStreetVerseCameraClearance} from '../src/runtime/StreetVerseCameraClearance.ts'
import {weatherVisualFromState} from '../src/runtime/StreetVerseWeatherRuntime.ts'
import {normalizeStreetVerseHumanHeight} from '../src/runtime/StreetVerseHumanScale.ts'

const focus=new THREE.Vector3(),target=new THREE.Vector3()
const wall=new THREE.Box3(new THREE.Vector3(-3,0,3),new THREE.Vector3(3,20,12))
createStreetVerseCameraClearance([],[])(focus,5.6,9.2,target)
assert.ok(target.distanceTo(new THREE.Vector3(0,5.6,9.2))<.001,'unobstructed camera keeps its framing')
createStreetVerseCameraClearance([wall],[])(focus,5.6,9.2,target)
assert.ok(target.x>8,'camera finds a clear side of the building')
assert.equal(wall.containsPoint(target),false)
const ray=new THREE.Ray(new THREE.Vector3(0,1.15,0),target.clone().sub(new THREE.Vector3(0,1.15,0)).normalize())
assert.equal(ray.intersectBox(wall,new THREE.Vector3()),null,'wall cannot obscure the player')
createStreetVerseCameraClearance([],[wall])(focus,5.6,9.2,target)
assert.ok(target.x>8,'late school/world colliders also protect the camera')
const unavailable=weatherVisualFromState({unavailable:true})
assert.equal(unavailable.kind,'unavailable','unavailable weather stays honestly labelled')
assert.ok(new THREE.Color(unavailable.sky).getHSL({h:0,s:0,l:0}).l>.3,'provider failure keeps a readable neutral sky')

const out=fs.mkdtempSync(path.join(os.tmpdir(),'streetverse-character-'))
try{
  execFileSync(process.execPath,['scripts/tryamm-native-asset-foundry.mjs',out],{stdio:'pipe'})
  const bytes=fs.readFileSync(path.join(out,'kit/streetverse-hero-player.glb'))
  const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')
  const hero=gltf.scene
  normalizeStreetVerseHumanHeight(hero,1.82)
  const box=new THREE.Box3().setFromObject(hero)
  assert.ok(Math.abs(box.max.y-box.min.y-1.82)<.01,'actual exported GLB renders at human height')
  assert.ok(Math.abs(box.min.y)<.01,'character feet rest on the pavement')
  const head=hero.getObjectByName('rig-head'),pelvis=hero.getObjectByName('rig-pelvis')
  assert.ok(head&&pelvis,'animation rig survives proportion repair')
  const headBox=new THREE.Box3().setFromObject(hero.getObjectByName('hero-head'))
  assert.ok((headBox.max.y-headBox.min.y)/1.82<.32,'head is not an oversized capsule')
  assert.ok(pelvis.getWorldPosition(new THREE.Vector3()).y>.72,'legs occupy a normal share of human height')
}finally{fs.rmSync(out,{recursive:true,force:true})}
console.log('StreetVerse birthday repair: exported human scale, grounded feet, readable weather and camera clearance PASS')
