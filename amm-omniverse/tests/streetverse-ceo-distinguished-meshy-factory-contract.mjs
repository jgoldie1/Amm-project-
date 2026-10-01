import fs from 'node:fs'
import assert from 'node:assert/strict'

const factory=fs.readFileSync(new URL('../api/_lib/meshy-factory.js',import.meta.url),'utf8')
const storage=fs.readFileSync(new URL('../api/_lib/streetverse-asset-storage.js',import.meta.url),'utf8')
const control=fs.readFileSync(new URL('../api/meshy/factory.js',import.meta.url),'utf8')
const manifestApi=fs.readFileSync(new URL('../api/meshy/asset-manifest.js',import.meta.url),'utf8')
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
  'provider_generation_task_id','provider_rig_task_id','persistRemoteGlb',
  'asset_factory_founder_or_admin_required','approved_reference_image_url_required_for_bj'
])assert.ok(factory.includes(token),'factory missing '+token)

for(const token of ['streetverse-assets','invalid_glb_magic','MAX_GLB_BYTES','x-upsert','publicAssetUrl'])
  assert.ok(storage.includes(token),'storage publisher missing '+token)

for(const token of ['requireUser','action===\'start\'','action===\'tick\''])
  assert.ok(control.includes(token),'factory API missing '+token)

assert.ok(manifestApi.includes('publicMeshyFactoryManifest'),'public manifest must project only ready factory assets')
assert.ok(runtime.includes('/api/meshy/asset-manifest'),'runtime must resolve published provider assets')
assert.ok(bj.includes("resolvePublishedMeshyAsset('sv-bj-stubbs-v6'"),'BJ must resolve real published rig before static fallback')
assert.ok(bj.includes("published?.walkUrl")&&bj.includes("published?.runUrl"),'BJ must load published walk/run animation companions')
assert.ok(npc.includes('resolvePublishedMeshyAsset(slot.id'),'NPC runtime must resolve real published rigs')
assert.ok(globalWorld.includes('Rigged characters: {rigPack.length} READY'),'StreetVerse Global must surface reusable rig-pack readiness')

for(const token of ['AI CEO','Distinguished Engineer','Release Guardian','real Meshy generation task id','real Meshy rig task id'])
  assert.ok(executive.includes(token),'executive chain missing '+token)

for(const token of ['START 4 NPC RIGS','START BJ V6','AUTO ADVANCE','GEN TASK:','RIG TASK:','Provider tasks may consume Meshy credits'])
  assert.ok(panel.includes(token),'factory UI missing '+token)

for(const token of ['create table if not exists public.meshy_asset_jobs','enable row level security','grant select,insert,update,delete on table public.meshy_asset_jobs to service_role',"insert into storage.buckets"])
  assert.ok(migration.includes(token),'durable factory migration missing '+token)

assert.ok(!factory.includes('fake-task'),'factory must never fabricate provider task IDs')
console.log('STREETVERSE CEO + DISTINGUISHED MESHY FACTORY CONTRACT PASS')
