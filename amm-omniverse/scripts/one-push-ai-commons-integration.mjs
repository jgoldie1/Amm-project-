/** One-command quality/release gate: node scripts/one-push-ai-commons-integration.mjs
 * --release also requires actual user-owned models and verified LIVE evidence.
 * This script performs work NOW, never silently queues a job or fakes a pass.
 */
import {spawnSync} from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
const root=process.cwd()
const release=process.argv.includes('--release')
const checks=[
 ['jarvis-deluxe','node',['--test','tests/jarvis-deluxe-integration.test.mjs']],
 ['ai-playground','node',['--test','tests/ai-cafe-playground-integration.test.mjs']],
 ['ai-commons-privacy','node',['--test','tests/ai-cafe-commons-integration.test.mjs']],
 ['five-senses-live','node',['--test','tests/ai-cafe-sense-live-status.test.mjs']],
 ['character-health','node',['--test','tests/streetverse-three-character-health-episodes.test.mjs']],
 ['rig-and-mycelium','node',['--test','tests/streetverse-universal-rig-mycelium-contract.mjs']],
 ['injury-organ-contract','node',['tests/streetverse-three-character-injury-organs-contract.mjs']],
 ['chicago-delivery-no-duplicate','node',['tests/streetverse-delivery-replay-contract.mjs']],
 ['ai-api-syntax','node',['--check','api/ai/answer.js']],
 ['typescript','npm',['run','typecheck']],
]
const results=[]
for(const [name,cmd,args] of checks){
 const run=spawnSync(cmd,args,{cwd:root,encoding:'utf8',timeout:240000,maxBuffer:2e6,shell:process.platform==='win32'})
 const output=((run.stdout||'')+'\n'+(run.stderr||'')).slice(-3000)
 const passed=run.status===0&&!run.error
 results.push({name,status:passed?'PASS':'FAIL',exitCode:run.status,detail:passed?'':output||String(run.error||'No output')})
 console.log(name,passed?'PASS':'FAIL',passed?'':'\n'+output)
}
const assets=spawnSync('node',['scripts/verify-recovered-cast-assets.mjs'],{cwd:root,encoding:'utf8',timeout:30000,maxBuffer:1e6})
const assetsVerified=assets.status===0
const livekitConfigured=Boolean(process.env.LIVEKIT_URL&&process.env.LIVEKIT_API_KEY&&process.env.LIVEKIT_API_SECRET)
const blocking=[
 {name:'three-original-character-GLBs',status:assetsVerified?'VERIFIED':'BLOCKED',reason:assetsVerified?'SHA / rig inspection passed':'User-owned recovered GLB files are absent or failed verification'},
 {name:'livekit-production-credentials',status:livekitConfigured?'PRESENT_UNVERIFIED':'BLOCKED',reason:livekitConfigured?'Credentials exist, but a two-device stream is still not verified':'Missing required server-side LiveKit environment configuration'},
 {name:'livekit-two-device-test',status:'NOT_VERIFIED',reason:'No actual phone/Chromebook host-viewer test evidence collected by this script'},
 {name:'tiktok-bigo-live-ingest',status:'NOT_VERIFIED',reason:'Platform permissions and broadcast sessions require separate external verification'},
 {name:'kit-ai-home-monitor',status:'NOT_CONNECTED',reason:'No authorized device connector or explicit consented monitoring session verified'},
]
const status=results.every(x=>x.status==='PASS')?'QUALITY_TESTS_PASS':'QUALITY_TESTS_FAIL'
const releaseReady=status==='QUALITY_TESTS_PASS'&&blocking.every(x=>x.status==='VERIFIED')
const report={schema:'tryamm.ai-commons.one-push.v1',status,releaseReady,releaseEnforced:release,checkedAt:new Date().toISOString(),checks:results,externalAndAssetGates:blocking,
 notes:['Passing code checks does not certify AI sentience, actual voice connections, 3D visual appearance, or real device/home monitoring.','No production mutation is performed by the test.']}
const dir=path.join(root,'test-results');fs.mkdirSync(dir,{recursive:true})
fs.writeFileSync(path.join(dir,'one-push-ai-commons-integration.json'),JSON.stringify(report,null,2))
console.log('ONE PUSH SUMMARY',status,'RELEASE_READY',releaseReady,'report=test-results/one-push-ai-commons-integration.json')
if(status!=='QUALITY_TESTS_PASS'||release&&!releaseReady)process.exitCode=1
