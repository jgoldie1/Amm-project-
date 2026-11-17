import assert from 'node:assert/strict'
import {test} from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {spawnSync} from 'node:child_process'
import statusHandler from '../api/live/status.js'
const keys=['LIVEKIT_URL','LIVEKIT_WS_URL','LIVEKIT_API_KEY','LIVEKIT_API_SECRET','TRYAMM_LIVE_HOST_VIEWER_VERIFIED','TRYAMM_LIVE_RECONNECT_VERIFIED','TRYAMM_LIVE_MODERATION_VERIFIED']
function environment(values,fn){const previous=Object.fromEntries(keys.map(k=>[k,process.env[k]]));try{for(const k of keys)delete process.env[k];for(const [k,v] of Object.entries(values))process.env[k]=v;return fn()}finally{for(const k of keys){if(previous[k]===undefined)delete process.env[k];else process.env[k]=previous[k]}}}
const invoke=()=>{const result={};const res={setHeader(){},status(code){result.status=code;return this},json(body){result.body=body;return this}};statusHandler({method:'GET'},res);return result}
test('LIVE public readiness fails closed with credentials only',()=>{
 environment({LIVEKIT_URL:'wss://example.invalid',LIVEKIT_API_KEY:'fake',LIVEKIT_API_SECRET:'fake'},()=>{
  const r=invoke();assert.equal(r.body.configured,true);assert.equal(r.body.readyForPublic,false);assert.equal(r.body.activation.state,'provider-configured')
 })
})
test('LIVE status requires token-compatible URL and all three operator proofs',()=>{
 environment({LIVEKIT_WS_URL:'wss://example.invalid',LIVEKIT_API_KEY:'fake',LIVEKIT_API_SECRET:'fake'},()=>{
  assert.equal(invoke().body.configured,false)
 })
 environment({LIVEKIT_URL:'wss://example.invalid',LIVEKIT_API_KEY:'fake',LIVEKIT_API_SECRET:'fake',TRYAMM_LIVE_HOST_VIEWER_VERIFIED:'true',TRYAMM_LIVE_RECONNECT_VERIFIED:'true'},()=>{
  assert.equal(invoke().body.readyForPublic,false)
 })
 environment({LIVEKIT_URL:'wss://example.invalid',LIVEKIT_API_KEY:'fake',LIVEKIT_API_SECRET:'fake',TRYAMM_LIVE_HOST_VIEWER_VERIFIED:'true',TRYAMM_LIVE_RECONNECT_VERIFIED:'true',TRYAMM_LIVE_MODERATION_VERIFIED:'true'},()=>{
  assert.equal(invoke().body.readyForPublic,true)
 })
})
test('Aniyah Studio copy distinguishes editor from external financial availability',()=>{
 const s=fs.readFileSync(new URL('../src/components/Aniyah64TrackStudio.tsx',import.meta.url),'utf8')
 assert.match(s,/Studio editor available/)
 assert.match(s,/live commerce is readiness-gated/)
 assert.match(s,/readyForPayout/)
 assert.match(s,/PAYMENT_GATED/)
})
test('Super App source audit is reproducible, explicitly uncertified and exportable',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tryamm-super-app-'))
 try{
  const target=path.join(dir,'super-app-source-audit.json')
  const result=spawnSync(process.execPath,[new URL('../scripts/tryamm-super-app-source-audit.mjs',import.meta.url).pathname,target],{encoding:'utf8'})
  assert.equal(result.status,0,result.stderr||result.stdout)
  const report=JSON.parse(fs.readFileSync(target,'utf8'))
  assert.equal(report.sourceReady,true)
  assert.equal(report.releaseCertified,false)
  for(const id of ['credits-never-real-money','aniyah-crossborder-sandbox-not-live-money','weather-labels-simulation-and-unavailable','livekit-provider-config-not-public-proof'])
   assert.equal(report.safety.find(s=>s.id===id)?.passed,true,id)
  assert.ok(report.externalReleaseBlockers.length>5)
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
})
