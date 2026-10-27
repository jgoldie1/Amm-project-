#!/usr/bin/env node
/**
 * GoogleX Memory Guardian: executable, offline repository-context worker.
 * Usage: node scripts/googlex-memory-guardian.mjs [repo-root] [output-json]
 * Reads only allowlisted public project files. Never invokes models or deploys.
 */
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs'
import {resolve,join,dirname} from 'node:path'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {execFileSync} from 'node:child_process'
const root=resolve(process.argv[2]||fileURLToPath(new URL('..',import.meta.url)))
const output=process.argv[3]&&resolve(process.argv[3])
const sources=['README.md','AGENTS.md','.agents/skills/googlex-quantum-memory/SKILL.md','docs/architecture/GOOGLEX_MEMORY_GITHUB_CONTINUITY_BRIDGE.md','docs/gameplay/STREETVERSE_LEGACY_MECHANICS_PRESERVATION_AUDIT_2026-10.md']
const modules={
 googleX:'amm-omniverse/src/runtime/GoogleXProjectContextManifest.ts',
 holoGPT:'amm-omniverse/src/runtime/HoloGPTAutonomousRepairEngine.ts',
 holoAds:'amm-omniverse/src/runtime/HoloAdsRevenueRuntime.ts',
 crossVerse:'amm-omniverse/src/runtime/CrossVerseConsentRuntime.ts',
 holoVerse:'amm-omniverse/src/runtime/StreetVerseNextGenExperienceGate.ts',
 afterDark:'amm-omniverse/src/runtime/AfterDarkIntimateDeviceRuntime.ts',
 streetVerse:'amm-omniverse/src/components/StreetVerseMobilePlayableWorld.tsx',
 store:'amm-omniverse/src/runtime/AllAmericanStoreCrossVerseDistributionGate.ts'
}
const hash=x=>createHash('sha256').update(x).digest('hex')
function read(relative){
 const path=join(root,relative)
 if(!existsSync(path))return{path:relative,status:'missing'}
 const content=readFileSync(path)
 return{path:relative,status:'present',sha256:hash(content),bytes:content.length}
}
function revision(){try{return execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()}catch{return null}}
const approved=process.env.GOOGLEX_PROJECT_APPROVED==='true'
const authenticated=process.env.GOOGLEX_WORKER_AUTHORIZED==='true'
const result={
 schema:'tryamm.googlex.guardian-checkpoint.v1',
 executedAt:new Date().toISOString(),
 repositoryRevision:revision(),
 authorized:approved&&authenticated,
 publicSources:sources.map(read),
 existingModules:Object.fromEntries(Object.entries(modules).map(([name,path])=>[name,read(path)])),
 repairs:[
  {id:'iphone-bj-view',status:'needs_real_device_evidence',next:'capture failing iPhone viewport and narrow reproducible test'},
  {id:'supabase-402-character-assets',status:'needs_provider_evidence',next:'check provider quota/authorization and existing fallback; do not mask billing restriction'},
  {id:'circle-park-taylor-mission',status:'needs_playthrough_evidence',next:'test mobile navigation, NPC, driving, exit, save and reload'}
 ],
 privacy:{publicRepoOnly:true,noPrivateAccountData:true,noModelCalls:true,noDeploy:true,noPayments:true},
 status:approved&&authenticated?'context_checkpoint_created':'authorization_required_before_agent_use'
}
result.checkpointId=hash(JSON.stringify({revision:result.repositoryRevision,sources:result.publicSources,modules:result.existingModules}))
if(output){mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(result,null,2)+'\n')}
process.stdout.write(JSON.stringify(result,null,2)+'\n')
if(result.publicSources.some(x=>x.status==='missing'))process.exitCode=2
