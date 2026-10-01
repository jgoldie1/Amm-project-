import fs from 'node:fs'
import assert from 'node:assert/strict'

const factory=fs.readFileSync(new URL('../api/_lib/meshy-factory.js',import.meta.url),'utf8')
const worker=fs.readFileSync(new URL('../api/meshy/factory-worker.js',import.meta.url),'utf8')
const panel=fs.readFileSync(new URL('../src/components/MeshyFactoryControlPanel.tsx',import.meta.url),'utf8')
const rigFactory=fs.readFileSync(new URL('../src/runtime/MeshyRigFactory.ts',import.meta.url),'utf8')
const migration=fs.readFileSync(new URL('../supabase/migrations/20261001123000_meshy_asset_factory.sql',import.meta.url),'utf8')

for(const token of [
  'sv-james-body-base-v1',
  'SV_HERO_JAMES_BODY_BASE_V1.glb',
  'neutral non-identifying face',
  'sv-female-body-base-v1',
  'SV_BODY_FEMALE_BASE_V1.glb',
  'startCircleParkBootstrapWave',
  "wave:'james-female-circle-park-v1'",
  "sequence:'James body base → reusable female body base → four Circle Park residents in parallel'"
])assert.ok(factory.includes(token),'bootstrap factory missing '+token)

assert.ok(factory.indexOf("assetId:'sv-james-body-base-v1'")<factory.indexOf("assetId:'sv-female-body-base-v1'"),'James must be first')
assert.ok(factory.includes("dependsOn:'previous'"),'female base must depend on James')
assert.ok((factory.match(/dependsOn:'female'/g)||[]).length>=4,'Circle Park resident jobs must wait for female base')
assert.ok(worker.includes("stage:'in.(queued,generating,rigging,publishing)'"),'worker must advance dependency-ready queued jobs')
assert.ok(panel.includes('START BOOTSTRAP WAVE'),'founder needs one-tap bootstrap control')
assert.ok(panel.includes('The exact James facial likeness still waits for an approved reference image.'),'UI must not misrepresent the identity-neutral body as final likeness')
assert.ok(rigFactory.indexOf("sv-james-body-base-v1")<rigFactory.indexOf("sv-female-body-base-v1"),'rig queue order must keep James first')
assert.ok(migration.includes('depends_on_job_id uuid references public.meshy_asset_jobs'),'durable dependency chain required')
assert.ok(migration.includes('wave_id uuid'),'wave provenance required')

console.log('JAMES → FEMALE → CIRCLE PARK MESHY BOOTSTRAP CONTRACT PASS')
