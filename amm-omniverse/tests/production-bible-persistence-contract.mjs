import fs from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const service=fs.readFileSync(path.join(root,'src/services/productionBiblePersistence.ts'),'utf8')
const migration=fs.readFileSync(path.join(root,'../supabase/migrations/20260906004000_production_bible_persistence.sql'),'utf8')

const checks=[
  ['Production Bible table exists',migration.includes('create table if not exists public.production_bibles')],
  ['Owner RLS enabled',migration.includes('alter table public.production_bibles enable row level security')&&migration.includes('owner_user_id = auth.uid()')],
  ['Owner CRUD policies exist',migration.includes('Production Bible owner read')&&migration.includes('Production Bible owner insert')&&migration.includes('Production Bible owner update')&&migration.includes('Production Bible owner delete')],
  ['Placement event table exists',migration.includes('create table if not exists public.production_placement_events')],
  ['Placement events client read-only',migration.includes('revoke all on table public.production_placement_events from public, anon, authenticated')&&migration.includes('grant select on table public.production_placement_events to authenticated')],
  ['Placement recorder server-only',migration.includes('record_production_placement_event')&&migration.includes('to service_role')],
  ['Purchase verification is explicit',migration.includes("'PURCHASE_VERIFIED'")&&migration.includes('authoritative payment verification')],
  ['Client lists own bibles',service.includes(".from('production_bibles')")&&service.includes(".eq('owner_user_id',userId)")],
  ['Client saves own bible',service.includes('saveMyProductionBible')&&service.includes('.upsert(')],
  ['Client can delete only own bible',service.includes('deleteMyProductionBible')&&service.includes(".eq('owner_user_id',userId)")],
  ['Placement analytics are read-only in browser',service.includes('listMyPlacementEvents')&&!service.includes(".rpc('record_production_placement_event'")&&!service.includes(".from('production_placement_events').insert")],
]

const failed=checks.filter(([,ok])=>!ok)
for(const [name,ok] of checks)console.log(`${ok?'PASS':'FAIL'} ${name}`)
if(failed.length){
  console.error(`Production Bible persistence contract failed: ${failed.map(([name])=>name).join(', ')}`)
  process.exit(1)
}
console.log('Production Bible persistence contract passed')
