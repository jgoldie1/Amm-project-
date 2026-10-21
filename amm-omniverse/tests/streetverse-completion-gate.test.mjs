import test from 'node:test'
import assert from 'node:assert/strict'
import {inspectGlb} from '../scripts/streetverse-completion-gate.mjs'

function fixture(edit=()=>{}){
  const json={asset:{version:'2.0'},buffers:[{byteLength:96}],bufferViews:[{buffer:0,byteLength:96}],accessors:[{bufferView:0,componentType:5126,type:'VEC3',count:1},{bufferView:0,componentType:5123,type:'VEC4',count:1},{bufferView:0,componentType:5126,type:'VEC4',count:1},{bufferView:0,componentType:5126,type:'SCALAR',count:1}],meshes:[{primitives:[{attributes:{POSITION:0,JOINTS_0:1,WEIGHTS_0:2}}]}],nodes:[{mesh:0,skin:0},{}],skins:[{joints:[1]}],animations:[{name:'idle',samplers:[{input:3,output:2}],channels:[{sampler:0,target:{node:1,path:'rotation'}}]}]}
  edit(json)
  let text=JSON.stringify(json);text+=' '.repeat((4-text.length%4)%4)
  const bytes=Buffer.alloc(12+8+text.length+8+96)
  bytes.write('glTF');bytes.writeUInt32LE(2,4);bytes.writeUInt32LE(bytes.length,8)
  bytes.writeUInt32LE(text.length,12);bytes.writeUInt32LE(0x4e4f534a,16);bytes.write(text,20)
  bytes.writeUInt32LE(96,20+text.length);bytes.writeUInt32LE(0x004e4942,24+text.length)
  return bytes
}
const rig={rig:true,requiredAnimations:['idle']}
test('bound fixture includes clip inventory and checksum',()=>{const r=inspectGlb(fixture(),rig);assert.equal(r.skins,1);assert.deepEqual(r.animations,['idle']);assert.match(r.sha256,/^[a-f0-9]{64}$/)})
test('rejects HTML, truncation and invalid chunk lengths',()=>{
  assert.throws(()=>inspectGlb(Buffer.from('<html>not a model</html>')))
  assert.throws(()=>inspectGlb(fixture().subarray(0,30)))
  const b=fixture();b.writeUInt32LE(b.length,12);assert.throws(()=>inspectGlb(b))
})
test('rejects an unbound hero and missing required clips',()=>{
  assert.throws(()=>inspectGlb(fixture(j=>j.nodes[0].skin=undefined),rig),/bound/)
  assert.throws(()=>inspectGlb(fixture(j=>j.animations=[]),rig),/Missing animation/)
})
test('rejects bad joint, attribute, buffer and animation references',()=>{
  for(const mutate of [j=>j.skins[0].joints=[99],j=>delete j.meshes[0].primitives[0].attributes.WEIGHTS_0,j=>j.bufferViews[0].byteLength=1000,j=>j.animations[0].channels[0].target.node=999])assert.throws(()=>inspectGlb(fixture(mutate),rig))
})
