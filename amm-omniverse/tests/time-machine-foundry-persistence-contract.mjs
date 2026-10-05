import fs from 'node:fs'

const runtime=fs.readFileSync(new URL('../src/runtime/TimeMachineWorldFoundryRuntime.ts',import.meta.url),'utf8')
const center=fs.readFileSync(new URL('../src/components/TimeMachineWorldFoundryCenter.tsx',import.meta.url),'utf8')
const api=fs.readFileSync(new URL('../api/time-machine/foundry-receipts.js',import.meta.url),'utf8')
const migration=fs.readFileSync(new URL('../supabase/migrations/20261005121500_time_machine_world_foundry_receipts.sql',import.meta.url),'utf8')
const analysis=fs.readFileSync(new URL('../src/data/TwoWeekConvergenceAnalysis.ts',import.meta.url),'utf8')
const doc=fs.readFileSync(new URL('../docs/RECENT-TWO-WEEK-WORLD-CONSTRUCTION-RECOVERY.md',import.meta.url),'utf8')

for(const x of [
 "createBuildingCadPlan","makeWorldForgeRecipe","getAccessToken","worldForge?:","WORLD FORGER / CAD RECIPE",
 "tryamm:world-forger-recipe-ready","syncServerReceipt","/api/time-machine/foundry-receipts",
 "crossDeviceReceipts:true","explicitWorldForgerCad:true"
])if(!runtime.includes(x))throw new Error('Time Machine Foundry persistence/forger integration missing '+x)

for(const x of [
 "SERVER / CROSS-DEVICE RECEIPT","WORLD FORGER / CAD","FORGE: {a.worldForge","tryamm:time-machine-foundry-receipt-synced"
])if(!center.includes(x))throw new Error('Foundry UI missing '+x)

for(const x of [
 "requireUser","tryamm_time_machine_foundry_receipts","Authorization","receipt"
])if(!api.includes(x))throw new Error('Foundry receipt API missing '+x)

for(const x of [
 "create table if not exists public.tryamm_time_machine_foundry_receipts",
 "user_id uuid not null references auth.users",
 "production_mutation boolean not null default false",
 "publish_allowed boolean not null default false",
 "requires_human_review boolean not null default true",
 "enable row level security",
 "tryamm_time_machine_foundry_read_own"
])if(!migration.includes(x))throw new Error('Foundry receipt migration missing '+x)

for(const x of [
 "App/runtime bootstrap","AI/world construction orchestration","Time Machine / ChronoVerse","Metaverse Bible / FaithVerse",
 "Characters/buildings/vehicles","World memory / persistence","CI / production visibility","Do not add another parallel engine"
])if(!analysis.includes(x))throw new Error('Two-week convergence analysis missing '+x)

for(const x of [
 "Canonical construction flow","World Forger","Mind Over Matter","Genie in the Bottle","HoloForge / Holo Gen","Holo Lab","Metaverse Bible","Kingdom of Yahisrael / Judah"
])if(!doc.includes(x))throw new Error('Two-week recovery doc missing '+x)

console.log('Time Machine Foundry persistent construction convergence: PASS')
