import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readinessPath = path.join(root, 'src/runtime/productionReadiness.ts');
if (!fs.existsSync(readinessPath)) throw new Error('Missing production readiness registry.');

const source = fs.readFileSync(readinessPath, 'utf8');
const forbiddenLive = [
  'telehealth','medicaid','telelaw','tax-bookkeeping','insurance-realty','remote-notary',
  'drone-robot','ios-android','jin-pay','live-streaming'
];

for (const id of forbiddenLive) {
  const pattern = new RegExp(`id:\\s*['\"]${id}['\"][\\s\\S]{0,500}?state:\\s*['\"]LIVE['\"]`);
  if (pattern.test(source)) {
    throw new Error(`High-risk/external feature ${id} cannot be marked LIVE without external production evidence.`);
  }
}

const requiredIds = [
  'core-web','accessibility-passport','business-jarvis','trust-core','marketplace','holo-delivery',
  'money-engine','sustainability','business-launch','domain-dns','quantum-zapier','quantum-discord'
];
for (const id of requiredIds) {
  if (!source.includes(`id: '${id}'`) && !source.includes(`id: \"${id}\"`)) {
    throw new Error(`Readiness registry missing required feature: ${id}`);
  }
}

const exists=(p)=>fs.existsSync(path.join(root,p));
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const must=(condition,message)=>{if(!condition)throw new Error(`StreetVerse readiness: ${message}`)};

must(exists('api/streetverse/life/[action].ts'),'life API missing');
must(exists('src/components/StreetVerseBiographyProofHub.tsx'),'biography proof UI missing');
must(exists('src/services/streetVerseLifeApi.ts'),'life API client missing');
must(exists('supabase/migrations/20260820253000_streetverse_life_world_memory.sql'),'life persistence migration missing');
must(exists('tests/e2e/streetverse-biography-proof.spec.ts'),'biography E2E missing');
const life=read('api/streetverse/life/[action].ts');
for(const action of ['biography-save','return-world','archive-progress','creator-work','rejoin']) must(life.includes(`action==='${action}'`),`life action ${action} missing`);
const migration=read('supabase/migrations/20260820253000_streetverse_life_world_memory.sql');
for(const table of ['streetverse_biography_snapshots','streetverse_world_changes','streetverse_archive_mission_progress','streetverse_creator_works']) must(migration.includes(table),`migration table ${table} missing`);
must(migration.includes('enable row level security'),'life RLS missing');
must(migration.includes('revoke all'),'anonymous Data API hardening missing');

console.log('production-readiness: registry integrity + StreetVerse life proof contracts OK');
