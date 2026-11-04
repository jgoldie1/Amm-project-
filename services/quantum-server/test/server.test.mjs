import test from 'node:test'
import assert from 'node:assert/strict'
import {createApp,simulateCircuit} from '../src/server.mjs'

test('single qubit Hadamard produces exact balanced probabilities',()=>{
  const v=simulateCircuit({qubits:1,gates:[{type:'H',target:0}],shots:512})
  assert.equal(v.physicalQuantumHardware,false)
  assert.deepEqual(v.results.map(x=>x.probability),[.5,.5])
  assert.equal(v.results.reduce((s,x)=>s+x.counts,0),512)
})
test('Bell circuit creates 00/11 and conserves shots',()=>{
  const v=simulateCircuit({qubits:2,gates:[{type:'H',target:0},{type:'CX',control:0,target:1}],shots:200})
  assert.deepEqual(v.results.map(x=>x.state),['00','01','10','11'])
  assert.deepEqual(v.results.map(x=>x.probability),[.5,0,0,.5])
  assert.equal(v.results[1].counts+v.results[2].counts,0)
  assert.equal(v.results.reduce((s,x)=>s+x.counts,0),200)
})
test('gate validation and resource limits',()=>{
  assert.throws(()=>simulateCircuit({qubits:8,gates:[]}),/qubits/)
  assert.throws(()=>simulateCircuit({qubits:1,gates:[{type:'CX',control:0,target:0}]}),/control/)
  assert.throws(()=>simulateCircuit({qubits:1,gates:[{type:'H',target:2}]}),/target/)
  assert.throws(()=>simulateCircuit({qubits:1,gates:[{type:'Q',target:0}]}),/unsupported_gate/)
  assert.throws(()=>simulateCircuit({qubits:1,gates:[],shots:100000}),/shots/)
  const v=simulateCircuit({qubits:2,gates:[{type:'X',target:0},{type:'S',target:0},{type:'T',target:0},{type:'Z',target:0}],shots:25})
  assert.equal(v.results[1].probability,1)
})
async function start(token,now=Date.now){
  const server=createApp({token,now})
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
  const url='http://127.0.0.1:'+server.address().port
  const close=()=>new Promise(resolve=>server.close(resolve))
  return{url,close}
}
const req=(url,path,token,body,method='POST')=>fetch(url+path,{method,
  headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},
  ...(body===undefined?{}:{body:JSON.stringify(body)})})
test('public health reports no physical quantum and disables private API without token',async t=>{
  const {url,close}=await start('');t.after(close)
  assert.equal((await fetch(url+'/healthz')).status,200)
  const caps=await (await fetch(url+'/v1/capabilities')).json()
  assert.equal(caps.physicalQubits,0)
  assert.equal(caps.realQuantumProviderConnected,false)
  assert.equal((await req(url,'/v1/quantum/simulate','',{qubits:1,gates:[]})).status,503)
})
test('private endpoints require valid bearer credentials',async t=>{
  const {url,close}=await start('local-test-token');t.after(close)
  assert.equal((await req(url,'/v1/quantum/simulate','',{qubits:1,gates:[]})).status,401)
  assert.equal((await req(url,'/v1/dance/rooms','wrong',{name:'Soul Ascension Stage'})).status,401)
  const resp=await req(url,'/v1/quantum/simulate','local-test-token',
    {qubits:1,gates:[{type:'X',target:0}],shots:16})
  assert.equal(resp.status,200)
  const result=await resp.json()
  assert.equal(result.results[1].counts,16)
  assert.equal(result.physicalQuantumHardware,false)
})
test('Soul Ascension room cues use server time, sequence and TTL',async t=>{
  let clock=1_797_000_000_000
  const {url,close}=await start('test-only',()=>clock);t.after(close)
  const cr=await req(url,'/v1/dance/rooms','test-only',{name:'Soul Ascension Virtual Dance Line'})
  assert.equal(cr.status,201)
  const room=await cr.json()
  assert.match(room.roomId,/^[0-9a-f-]{36}$/)
  const cue=await req(url,'/v1/dance/rooms/'+room.roomId+'/cues','test-only',
    {moveId:'soul-1980s-moonwalk',delayMs:1800})
  assert.equal(cue.status,201)
  const detail=await cue.json()
  assert.equal(detail.cue.startAt,clock+1800)
  assert.equal(detail.cue.sequence,1)
  const read=await req(url,'/v1/dance/rooms/'+room.roomId,'test-only',undefined,'GET')
  assert.equal(read.status,200)
  assert.equal((await read.json()).cues[0].moveId,'soul-1980s-moonwalk')
  assert.equal((await req(url,'/v1/dance/rooms/'+room.roomId+'/cues','test-only',
    {moveId:'../../etc/passwd'})).status,400)
  clock+=2*60*60*1000+1000
  assert.equal((await req(url,'/v1/dance/rooms/'+room.roomId,'test-only',undefined,'GET')).status,404)
})
