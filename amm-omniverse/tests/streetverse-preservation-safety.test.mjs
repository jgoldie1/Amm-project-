import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {validateLock,validateGlbHeader} from '../scripts/preserve-streetverse-supabase-assets.mjs'

const lock=JSON.parse(fs.readFileSync(new URL('../config/streetverse-asset-lock-20261005.json',import.meta.url),'utf8'))

test('locked inventory contains all four saved character sets, each with walk and run',()=>{
  assert.equal(validateLock(lock),true)
  assert.equal(lock.assetCount,12)
  assert.equal(lock.assets.length,12)
  assert.equal(lock.assets.reduce((total,item)=>total+item.bytes,0),150635616)
})

test('cannot silently lose a saved walking/running companion',()=>{
  const broken=structuredClone(lock)
  broken.assets=broken.assets.filter(item=>!item.path.includes('SV_NPC_BLACK_MAN_ADULT_01.walk.glb'))
  broken.assets.push({...broken.assets[0]})
  assert.throws(()=>validateLock(broken),/Duplicate asset/)
  broken.assets[broken.assets.length-1]={path:'characters/static-wave1/SV_NPC_FAKE_01.glb',bytes:12345}
  assert.throws(()=>validateLock(broken),/Missing required/)
})

test('cannot switch bucket or introduce traversal paths',()=>{
  assert.throws(()=>validateLock({...lock,baseUrl:'https://example.com/'}),/origin/)
  const traversal=structuredClone(lock)
  traversal.assets[0].path='../overwrite.glb'
  assert.throws(()=>validateLock(traversal),/Unsafe or unexpected/)
})

test('reject invalid, truncated, or wrong-version GLB headers',()=>{
  const make=(bytes,version=2)=>{
    const header=Buffer.alloc(12)
    header.write('glTF',0,'ascii')
    header.writeUInt32LE(version,4)
    header.writeUInt32LE(bytes,8)
    return header
  }
  assert.equal(validateGlbHeader(make(20000),20000,20000),true)
  assert.throws(()=>validateGlbHeader(make(20000),20001,20000),/length mismatch/)
  assert.throws(()=>validateGlbHeader(make(20000),20000,20001),/locked/)
  assert.throws(()=>validateGlbHeader(make(20000,1),20000,20000),/version/)
  assert.throws(()=>validateGlbHeader(Buffer.from('bad'),20000,20000),/header/)
})
