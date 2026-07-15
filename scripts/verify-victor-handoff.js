const fs=require('fs');
const path=require('path');

const required=[
  'VICTOR_START_HERE.md',
  'server.js',
  'package.json',
  '.env.example',
  'public/index.html',
  'public/platform.html',
  'public/workstation.html',
  'public/immersive-marketplace.html',
  'public/memory-control.html',
  'public/game-launcher.html',
  'public/game-production.html',
  'public/yogihoo.html',
  'public/openworld.html',
  'services/hologpt-orchestrator.js',
  'services/hologpt-api.js',
  'services/hologpt-workspace-api.js',
  'services/memory-api.js',
  'services/payments.js',
  'services/stripe.js',
  'services/livekit.js',
  'services/meshy.js',
  'services/game-platform-api.js',
  'services/game-production-api.js',
  'docs/VICTOR_FINAL_HANDOFF_CHECKLIST.md',
  'docs/VICTOR_GAMEVERSE_IMPLEMENTATION_HANDOFF.md',
  'docs/VICTOR_GAMEVERSE_PRODUCTION_HANDOFF.md',
  'supabase/migrations/202607140001_tryamm_beta_core.sql',
  'supabase/migrations/202607140018_game_production_pipeline.sql'
];

const missing=required.filter(file=>!fs.existsSync(path.join(process.cwd(),file)));
const migrations=fs.readdirSync(path.join(process.cwd(),'supabase','migrations')).filter(name=>name.endsWith('.sql')).sort();
const pages=fs.readdirSync(path.join(process.cwd(),'public')).filter(name=>name.endsWith('.html')).sort();
const services=fs.readdirSync(path.join(process.cwd(),'services')).filter(name=>name.endsWith('.js')).sort();

console.log('TryAMM Victor handoff verification');
console.log(`Frontend HTML pages: ${pages.length}`);
console.log(`Backend service modules: ${services.length}`);
console.log(`Supabase migrations: ${migrations.length}`);
console.log(`First migration: ${migrations[0]||'none'}`);
console.log(`Last migration: ${migrations[migrations.length-1]||'none'}`);

if(missing.length){
  console.error('\nMissing required handoff files:');
  missing.forEach(file=>console.error(`- ${file}`));
  process.exit(1);
}

console.log('\nPASS: Repository contains the expected frontend, backend, intelligence, database and Victor handoff files.');
console.log('External provider credentials, database application, binary brand assets and live acceptance testing are still required.');
