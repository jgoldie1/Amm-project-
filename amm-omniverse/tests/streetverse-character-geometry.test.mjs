import assert from 'node:assert/strict'
import {test} from 'node:test'
import * as THREE from 'three'
import {inspectCharacterGeometry} from '../src/runtime/StreetVerseCharacterGeometry.ts'

const body=()=>new THREE.Mesh(new THREE.BoxGeometry(.5,1.8,.3),new THREE.MeshBasicMaterial())
test('empty scene and presentation-only shadow cannot hide fallback',()=>{
  const scene=new THREE.Group()
  assert.equal(inspectCharacterGeometry(scene).meshes,0)
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(.4),new THREE.MeshBasicMaterial())
  shadow.name='bj-contact-shadow-v8'
  scene.add(shadow)
  assert.equal(inspectCharacterGeometry(scene).meshes,0)
})
test('actual indexed and nonindexed bodies qualify',()=>{
  const mesh=body()
  assert.deepEqual(inspectCharacterGeometry(mesh),{meshes:1,triangles:12})
  mesh.geometry=mesh.geometry.toNonIndexed()
  assert.deepEqual(inspectCharacterGeometry(mesh),{meshes:1,triangles:12})
})
test('hidden ancestors, invisible materials and zero opacity do not qualify',()=>{
  const scene=new THREE.Group(),mesh=body()
  scene.add(mesh);scene.visible=false
  assert.equal(inspectCharacterGeometry(scene).meshes,0)
  scene.visible=true;mesh.material.visible=false
  assert.equal(inspectCharacterGeometry(scene).meshes,0)
  mesh.material.visible=true;mesh.material.transparent=true;mesh.material.opacity=0
  assert.equal(inspectCharacterGeometry(scene).meshes,0)
})
test('zero vertices and empty draw ranges do not qualify',()=>{
  const mesh=body()
  mesh.geometry.setDrawRange(0,0)
  assert.equal(inspectCharacterGeometry(mesh).meshes,0)
  mesh.geometry=new THREE.BufferGeometry()
  mesh.geometry.setAttribute('position',new THREE.Float32BufferAttribute([],3))
  assert.equal(inspectCharacterGeometry(mesh).meshes,0)
})
test('material groups only count drawable triangles',()=>{
  const mesh=body()
  mesh.material=[new THREE.MeshBasicMaterial({visible:false}),new THREE.MeshBasicMaterial()]
  mesh.geometry.clearGroups();mesh.geometry.addGroup(0,6,0);mesh.geometry.addGroup(6,6,1)
  assert.deepEqual(inspectCharacterGeometry(mesh),{meshes:1,triangles:2})
})
