import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import * as THREE from 'three'

test('world reload preserves other worlds and removes its own collision boxes',async()=>{
  const source=fs.readFileSync(new URL('../src/runtime/StreetVerseWestSideVisibleWorldRuntime.ts',import.meta.url),'utf8')
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText
  const context2d=new Proxy({measureText:()=>({width:100}),createLinearGradient:()=>({addColorStop(){}})}, {get:(o,k)=>o[k]||(()=>{})})
  const listeners=new Map(),exports={}
  vm.runInNewContext(compiled,{
    exports,console,Math,Set,Map,
    document:{createElement:()=>({width:0,height:0,getContext:()=>context2d})},
    window:{addEventListener:(key,fn)=>{if(!listeners.has(key))listeners.set(key,new Set());listeners.get(key).add(fn)},removeEventListener:(key,fn)=>listeners.get(key)?.delete(fn),dispatchEvent:()=>{}},
    CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}},
    require:id=>{
      if(id==='three')return THREE
      if(id.includes('TryammNativeAssetRuntime'))return {loadTryammNativeCircleParkLayer:async()=>({group:new THREE.Group(),loaded:0,failed:[],usedUrls:[]}),disposeNativeAssetLayer:g=>g.removeFromParent()}
      if(id.includes('StreetVerseChicagoReconstructionSources'))return {STREETVERSE_CHICAGO_PROOF_ZONE:{id:'test'},STREETVERSE_CHICAGO_RECONSTRUCTION_SOURCES:[]}
      throw new Error('Unexpected dependency '+id)
    }
  })
  const scene=new THREE.Scene(),collisions=[],create=exports.createStreetVerseWestSideVisibleWorld
  const first=create(scene,collisions),second=create(scene,collisions)
  await Promise.resolve()
  assert.ok(first.collisionBoxes.length>0)
  let secondDisposed=0,firstDisposed=0
  second.group.traverse(o=>{o.geometry?.addEventListener('dispose',()=>secondDisposed++)})
  first.group.traverse(o=>{o.geometry?.addEventListener('dispose',()=>firstDisposed++)})
  first.dispose()
  assert.ok(firstDisposed>0)
  assert.equal(secondDisposed,0,'another world must keep its geometries')
  assert.equal(collisions.length,second.collisionBoxes.length,'removed world must not leave invisible collision walls')
  const count=firstDisposed;first.dispose();assert.equal(firstDisposed,count,'dispose is idempotent')
  second.dispose();assert.equal(collisions.length,0)
  assert.equal(listeners.get('tryamm:streetverse-player-position').size,0)
})
