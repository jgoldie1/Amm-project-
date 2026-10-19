import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import * as THREE from 'three'

function harness(remoteFails){
  const calls=[];const events=[]
  const remote='https://storage.invalid/resident.glb',native='/native/resident.glb'
  class GLTFLoader{async loadAsync(url){
    calls.push(url)
    if(remoteFails&&url===remote)throw new Error('HTTP 402')
    return {scene:new THREE.Group(),animations:[]}
  }}
  const slot={id:'resident',fallbackResidentIndex:0,targetHeightMeters:1.75}
  const modules={
    three:THREE,
    'three/examples/jsm/loaders/GLTFLoader.js':{GLTFLoader},
    '../data/streetVerseMeshyCharacterSlots':{STREETVERSE_MESHY_CHARACTER_SLOTS:[slot],STREETVERSE_MESHY_DURABLE_OVERRIDES:{resident:remote},streetVerseMeshyCharacterUrl:()=>remote},
    './StreetVerseHumanScale':{normalizeStreetVerseHumanHeight(){}},
    './StreetVerseMeshyAssetManifest':{resolvePublishedMeshyAsset:async()=>null,resetPublishedMeshyManifest(){}},
    '../data/TryammNativeRuntimeAssetCatalog':{TRYAMM_NATIVE_RUNTIME_ASSETS:Object.fromEntries('ABCDEFGH'.split('').map(c=>['resident'+c,{url:native}]))},
  }
  const source=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyCharacterRuntime.ts',import.meta.url),'utf8')
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
  const exports={}
  vm.runInNewContext(code,{exports,require:n=>{assert.ok(modules[n],n);return modules[n]},performance,
    window:{dispatchEvent:e=>events.push(e)},CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail}}})
  return {load:exports.loadStreetVerseMeshyCharacter,calls,events,remote,native}
}

for(const deferred of [false,true])test(`storage outage avoids incompatible remote animation downloads (deferred=${deferred})`,async()=>{
  const h=harness(true)
  const model=await h.load('resident',{deferCompanionAnimations:deferred})
  assert.ok(model)
  model.tick(performance.now(),{moving:true,running:true})
  await Promise.resolve()
  assert.equal(model.sourceUrl,h.native)
  assert.deepEqual(h.calls,[h.remote,h.native])
  assert.equal(model.object.userData.tryammNativeFallback,true)
  assert.ok(h.events.some(e=>e.type==='tryamm:native-character-ready'))
})

test('healthy stored resident retains its walk and run companions',async()=>{
  const h=harness(false),model=await h.load('resident')
  assert.ok(model)
  assert.equal(model.sourceUrl,h.remote)
  assert.deepEqual(h.calls,[h.remote,h.remote.replace('.glb','.walk.glb'),h.remote.replace('.glb','.run.glb')])
  assert.equal(model.object.userData.tryammNativeFallback,false)
})
