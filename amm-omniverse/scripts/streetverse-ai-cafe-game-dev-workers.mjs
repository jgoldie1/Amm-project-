/**
 * StreetVerse Game Dev AI Café: deterministic, allow-listed development workers.
 * No external model calls, npm installs, deployments, privileged access, shell evaluation,
 * production file changes, or real money operations. Produces review-only evidence artifacts.
 * Coding via external LLM agents is not claimed by this script.
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'

const here=path.dirname(fileURLToPath(import.meta.url))
const project=path.resolve(here,'..')
const repo=path.resolve(project,'..')
const output=path.join(repo,'artifacts','streetverse-ai-cafe')
fs.mkdirSync(output,{recursive:true})
const queueFile=path.join(repo,'docs','STREETVERSE_AI_CAFE_GAME_DEV_QUEUE.json')
const queue=JSON.parse(fs.readFileSync(queueFile,'utf8'))
if(queue.schema!=='tryamm.streetverse.ai-cafe.game-dev-queue.v1'||!Array.isArray(queue.orders)||queue.orders.length>7||queue.orders.length<1||queue.maxWorkers!==7){
 throw new Error('Rejected invalid or over-capacity AI Café work order queue')
}
const allowed=new Set(['bj-preview-regression','west-side-builder-regression','free-asset-readiness','circle-park-preview-pack','ai-cafe-capability-audit','release-blocker-audit','omni-cast-regression'])
const ids=new Set()
for(const order of queue.orders){
 if(!allowed.has(order.id)||ids.has(order.id)||order.status!=='queued'||typeof order.agent!=='string')throw new Error('Unknown, duplicate, or unqueued task was rejected')
 ids.add(order.id)
}
function exists(relative){return fs.existsSync(path.join(repo,relative))}
function read(relative){return fs.readFileSync(path.join(repo,relative),'utf8')}
function result(status,evidence,detail){return {status,evidence,detail}}
function checkTest(rel){
 if(!exists(rel))return result('blocked',['Missing check: '+rel],'Cannot execute a missing test')
 const launched=spawnSync(process.execPath,[path.join(repo,rel)],{cwd:project,encoding:'utf8',timeout:30000,maxBuffer:1024*1024,env:{...process.env,CI:'true'}})
 return result(launched.status===0?'passed':'failed',[(launched.stdout||'').slice(-1400),(launched.stderr||'').slice(-900)].filter(Boolean),launched.error?String(launched.error):`Exit status ${launched.status}`)
}
const workers={
 'bj-preview-regression'(){
  const preview=checkTest('amm-omniverse/tests/chromebook-streetverse-bj-v5-contract.cjs')
  const extracted=checkTest('amm-omniverse/tests/bj-owned-v3-extraction-integration.mjs')
  const content=read('amm-omniverse/public/chromebook-streetverse-bj-v5-animated.html')
  const own=content.includes('BJ_ARTICULATED_V3_BASE64')&&content.includes('BJ_STUBBS_V15_')&&content.includes('SV_NPC_BLACK_MAN_ADULT_01.glb')===false
  if(!own)return result('failed',['BJ development mesh embedded: '+content.includes('BJ_ARTICULATED_V3_BASE64')],'Wrong or missing hero binding')
  return result(preview.status==='passed'&&extracted.status==='passed'?'passed':'failed',
    [...preview.evidence,...extracted.evidence,'Owner-approved BJ V15 likeness remains prioritized; own articulated V3 is the verified offline fallback.'],
    'Animated game: '+preview.status+'; extracted GLB + actual Three.js player binding: '+extracted.status)
 },
 'omni-cast-regression'(){
   const report=checkTest('amm-omniverse/tests/streetverse-omni-cast-production-contract.mjs')
   const models=checkTest('amm-omniverse/tests/streetverse-omni-cast-glb-forge-contract.mjs')
   const stage=checkTest('amm-omniverse/tests/streetverse-original-music-stage-contract.mjs')
   const star=checkTest('amm-omniverse/tests/starverse-isaiah-tv-audition-bridge-contract.mjs')
   return result(report.status==='passed'&&models.status==='passed'&&stage.status==='passed'&&star.status==='passed'?'passed':'failed',
     [...report.evidence,...models.evidence,...stage.evidence,...star.evidence],
     'Unified cast: '+report.status+'; expanded original GLBs: '+models.status+'; 106-genre stage: '+stage.status+'; Isaiah AI TV / StarVerse auditions: '+star.status)
 },
 'west-side-builder-regression'(){
  const a=checkTest('amm-omniverse/tests/streetverse-visible-forge-real-placement.test.mjs')
  const b=checkTest('amm-omniverse/tests/streetverse-existing-forge-bridge-contract.test.mjs')
  return result(a.status==='passed'&&b.status==='passed'?'passed':'failed',[...a.evidence,...b.evidence],`Forge: ${a.status}; existing asset bridge: ${b.status}. Source-level checks, not Chrome gameplay.`)
 },
 'free-asset-readiness'(){
  const cat=read('amm-omniverse/src/data/TryammCc0FreeAssetCatalog.ts')
  const sync=read('amm-omniverse/scripts/sync-cc0-free-assets.mjs')
  const folder='amm-omniverse/public/free-assets/kenney'
  let status=exists(folder)?'passed':'blocked'
  const names=[...cat.matchAll(/url:\`\$\{base\}\/([^`]+\.glb)\`/g)].map(m=>m[1])
  const present=names.filter(n=>exists(folder+'/'+n))
  if(present.length!==names.length)status='blocked'
  const doc={source:'Kenney (source packs claim CC0; re-verify on license source)',catalogEntries:names.length,checkedAt:new Date().toISOString(),present:present.length,missing:names.filter(n=>!present.includes(n)),syncScriptPresent:sync.includes('SOURCE_COMMIT'),deployable:present.length===names.length}
  fs.writeFileSync(path.join(output,'free-assets-readiness.json'),JSON.stringify(doc,null,2))
  return result(status,[`${present.length}/${names.length} catalog asset files present`, 'Kenney sync script exists but is not run by worker (no network/dependency spend).'],'Catalog alone is not a delivered asset. Run curated cloud asset sync after review.')
 },
 'circle-park-preview-pack'(){
  const native=read('amm-omniverse/src/data/TryammNativeRuntimeAssetCatalog.ts')
  const start=native.indexOf('export const CIRCLE_PARK_NATIVE_PREVIEW_PLACEMENTS')
  const end=native.indexOf('export const CHICAGO_WEST_NATIVE_PREVIEW_PLACEMENTS',start)
  if(start<0||end<start)return result('failed',[],'Canonical Circle Park placements are missing')
  const block=native.slice(start,end)
  const found=[]
  const regex=/\{asset:'([^']+)',position:\[([^\]]+)\][^}]*\}/g
  let m
  while((m=regex.exec(block))!==null){
   const position=m[2].split(',').map(v=>Number(v.trim()))
   if(position.length===3&&position.every(Number.isFinite))found.push({type:m[1],position})
  }
  if(found.length<12)return result('failed',[],`Only ${found.length} native placements parsed; refusing incomplete pack`)
  const scenePack={schema:'tryamm.streetverse.review-only-scene-pack.v1',name:'Circle Park owned-native preview',status:'review-only',authority:'source-catalog',sourceFile:'amm-omniverse/src/data/TryammNativeRuntimeAssetCatalog.ts',placements:found,artifactsAreNotProduction:true,notes:'Generated from existing source declarations; check scene collisions before integrating.'}
  fs.writeFileSync(path.join(output,'circle-park-preview-pack.json'),JSON.stringify(scenePack,null,2))
  return result('passed',[`${found.length} source-backed building, tree, street and vehicle placement declarations compiled`],'A real scene placement data artifact was generated (not yet mounted into production game).')
 },
 'ai-cafe-capability-audit'(){
  const runtime=read('amm-omniverse/src/runtime/AICafeMultiAgentRuntime.ts')
  const executor=read('amm-omniverse/api/_lib/ai-cafe-executor.js')
  const service=read('amm-omniverse/scripts/ai-cafe-worker.mjs')
  let agents=[...runtime.matchAll(/id:'([^']+)',name:/g)].map(m=>m[1])
  const types=['website-draft','city-build-plan'].filter(s=>executor.includes(`'${s}'`))
  const doc={agentCount:agents.length,agents,serverJobTypes:types,browserTaskCoordination:runtime.includes("tryamm:ai-cafe-task"),serverWorkerRequiresServiceRole:service.includes('SUPABASE_SERVICE_ROLE_KEY'),automatedCodingModelConnected:false,truth:'Browser assignment events do not execute server code; the existing server worker processes only allow-listed kinds when configured.'}
  fs.writeFileSync(path.join(output,'ai-cafe-capabilities.json'),JSON.stringify(doc,null,2))
  return result('passed',[`${agents.length} configured browser agent roles`,`${types.join(', ')} supported server job types`,'No paid coding model or secret was used.'],'AI Café capabilities audited; new CI workers are deterministic, not an LLM coding agent.')
 },
 'release-blocker-audit'(){
  const source=read('amm-omniverse/src/runtime/StreetVerseMeshyBJHeroRuntime.ts')
  const bjV6=exists('amm-omniverse/public/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V6.glb')
  const native=exists('amm-omniverse/public/generated-assets/native/kit/streetverse-hero-player.glb')
  const readiness={bjV15SourceIsRemote:source.includes('BJ_STUBBS_V15_ACTING_FACE_LOOK_NOD.glb'),bjV15DownloadVerified:false,bjV6FileInRepository:bjV6,nativeGeneratedHeroPresent:native,actualBrowserRenderVerified:false,livePaymentConfiguredVerified:false,deployable:false}
  fs.writeFileSync(path.join(output,'release-blockers.json'),JSON.stringify(readiness,null,2))
  return result('blocked',[`BJ V6 committed: ${bjV6}; native BJ source committed: ${native}`,'BJ V15 network, browser acceptance, live checkout still require verification.'],'No release or payment changes authorized. Production guards remain intact.')
 }
}
const started=new Date().toISOString()
const records=[]
for(const order of queue.orders){
 let out
 try{out=workers[order.id]()}catch(e){out=result('failed',[],String(e?.message||e))}
 records.push({id:order.id,agent:order.agent,priority:order.priority,...out})
 console.log(JSON.stringify({worker:order.id,status:out.status,detail:out.detail}))
}
const report={schema:'tryamm.streetverse.ai-cafe.worker-evidence.v1',batchId:queue.batchId,started,finished:new Date().toISOString(),branch:'streetverse-chromebook-workbench',safeMode:true,modelCalls:0,paidSubscriptionsCreated:0,productionMutations:0,results:records,summary:{passed:records.filter(x=>x.status==='passed').length,blocked:records.filter(x=>x.status==='blocked').length,failed:records.filter(x=>x.status==='failed').length}}
fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2))
console.log('Worker evidence saved:',path.join(output,'report.json'))
if(report.summary.failed)process.exitCode=1