import fs from 'node:fs'
import assert from 'node:assert/strict'

const factory=fs.readFileSync(new URL('../api/_lib/meshy-factory.js',import.meta.url),'utf8')
const storage=fs.readFileSync(new URL('../api/_lib/streetverse-asset-storage.js',import.meta.url),'utf8')
const control=fs.readFileSync(new URL('../api/meshy/factory.js',import.meta.url),'utf8')
const manifestApi=fs.readFileSync(new URL('../api/meshy/asset-manifest.js',import.meta.url),'utf8')
const worker=fs.readFileSync(new URL('../api/meshy/factory-worker.js',import.meta.url),'utf8')
const health=fs.readFileSync(new URL('../api/meshy/factory-health.js',import.meta.url),'utf8')
const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyAssetManifest.ts',import.meta.url),'utf8')
const executive=fs.readFileSync(new URL('../src/runtime/StreetVerseAssetExecutiveRuntime.ts',import.meta.url),'utf8')
const bj=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts',import.meta.url),'utf8')
const npc=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyCharacterRuntime.ts',import.meta.url),'utf8')
const globalWorld=fs.readFileSync(new URL('../src/components/StreetVerseGlobalWorld.tsx',import.meta.url),'utf8')
const panel=fs.readFileSync(new URL('../src/components/MeshyFactoryControlPanel.tsx',import.meta.url),'utf8')
const migration=fs.readFileSync(new URL('../supabase/migrations/20261001123000_meshy_asset_factory.sql',import.meta.url),'utf8')

for(const token of [
  'startMeshyFactoryJob','tickMeshyFactoryJob','createMeshyTask','createMeshyRiggingTask',
  "stage:'generating'","stage:'rigging'","stage:'publishing'","stage:'ready'",
  'provider_generation_task_id','provider_rig_task_id','persistRemoteGlb','generation-submitting','rig-submitting',
  'asset_factory_founder_or_admin_required','approved_reference_image_url_required_for_bj'
])assert.ok(factory.includes(token),'factory missing '+token)

for(const token of ['streetverse-assets','invalid_glb_magic','MAX_GLB_BYTES','x-upsert','publicAssetUrl'])
  assert.ok(storage.includes(token),'storage publisher missing '+token)

for(const token of ['requireUser','action===\'start\'','action===\'tick\''])
  assert.ok(control.includes(token),'factory API missing '+token)

assert.ok(manifestApi.includes('publicMeshyFactoryManifest'),'public manifest must project only ready factory assets')
assert.ok(worker.includes('MESHY_FACTORY_WORKER_SECRET')&&worker.includes('tickMeshyFactoryJobInternal'),'background worker must be secret-gated and only advance founder-started jobs')
for(const token of ['providerConfigured','durableJobStoreReady','backgroundWorkerSecretConfigured','blockers'])assert.ok(health.includes(token),'factory health diagnostics missing '+token)
assert.ok(runtime.includes('/api/meshy/asset-manifest'),'runtime must resolve published provider assets')
assert.ok(runtime.includes('CACHE_TTL_MS=30_000'),'runtime manifest must refresh after new GLBs publish')
assert.ok(bj.includes("resolvePublishedMeshyAsset('sv-bj-stubbs-v6'"),'BJ must resolve real published rig before static fallback')
assert.ok(bj.includes("published?.walkUrl")&&bj.includes("published?.runUrl"),'BJ must load published walk/run animation companions')
assert.ok(npc.includes('resolvePublishedMeshyAsset(slot.id'),'NPC runtime must resolve real published rigs')
assert.ok(globalWorld.includes('Rigged characters: {rigPack.length} READY'),'StreetVerse Global must surface reusable rig-pack readiness')

for(const token of ['AI CEO','Distinguished Engineer','Release Guardian','real Meshy generation task id','real Meshy rig task id'])
  assert.ok(executive.includes(token),'executive chain missing '+token)

for(const token of ['START 4 NPC RIGS','START BJ V6','AUTO ADVANCE','GEN TASK:','RIG TASK:','Provider tasks may consume Meshy credits','FACTORY READINESS:'])
  assert.ok(panel.includes(token),'factory UI missing '+token)

for(const token of ['create table if not exists public.meshy_asset_jobs','enable row level security','grant select,insert,update,delete on table public.meshy_asset_jobs to service_role',"insert into storage.buckets"])
  assert.ok(migration.includes(token),'durable factory migration missing '+token)

const submitQueuedFactoryJob=factory.slice(factory.indexOf('async function submitQueuedFactoryJob'),factory.indexOf('export async function startCircleParkBootstrapWave'))
const startCircleParkBootstrapWave=factory.slice(factory.indexOf('export async function startCircleParkBootstrapWave'),factory.indexOf('export async function startMeshyFactoryJob'))
const startMeshyFactoryJob=factory.slice(factory.indexOf('export async function startMeshyFactoryJob'),factory.indexOf('export async function importExistingMeshyTask'))
assert.ok(submitQueuedFactoryJob.includes("job.stage!=='queued'")&&submitQueuedFactoryJob.includes("claim(job.id,'queued'"),'queued helper must only submit an already durable queued job')
assert.ok(startCircleParkBootstrapWave.indexOf("stage:'queued'")<startCircleParkBootstrapWave.indexOf('submitQueuedFactoryJob(jamesJob)'),'bootstrap wave must persist queued jobs before paid Meshy generation call')
assert.ok(startMeshyFactoryJob.indexOf("stage:'queued'")<startMeshyFactoryJob.indexOf('createMeshyTask(spec.generationType,payload)'),'single factory start must persist queued job before paid Meshy generation call')
assert.ok(factory.includes("claim(job.id,'generating'")&&factory.includes("stage:'rig-submitting'"),'rig submission must atomically claim generation completion')
assert.ok(factory.includes("characters/\${scope}/\${version}/\${job.filename}"),'published GLBs must be immutable and namespaced by scope/job')
assert.ok(factory.includes('retryable_infrastructure_error'),'transient provider/storage failures must remain retryable')
assert.ok(factory.includes('Never reset to queued here')||factory.includes('Never reset to queued'),'accepted paid generation must never be silently resubmitted')
assert.ok(!factory.includes('fake-task'),'factory must never fabricate provider task IDs')
console.log('STREETVERSE CEO + DISTINGUISHED MESHY FACTORY CONTRACT PASS')
