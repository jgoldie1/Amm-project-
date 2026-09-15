import fs from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8')
const experience=read('src/runtime/OmniverseAssetLedger.ts')
const migration=read('../supabase/migrations/20260904195500_set_apart_kingdom_chain_layer.sql')
const projectionMigration=read('../supabase/migrations/20260904204500_set_apart_passport_projection.sql')
const docs=read('docs/THREE_LAYER_INTERNAL_BLOCKCHAIN.md')
const app=read('src/App.tsx')
const familyHub=read('src/components/StaysAgencyFamilyHub.tsx')
const passportPanel=read('src/components/SetApartPassportReceipts.tsx')
const passportService=read('src/services/setApartPassportPersistence.ts')

const checks=[
  ['Layer 1 local hash chain',experience.includes('previousHash')&&experience.includes('SHA-256')&&experience.includes('verifyOmniverseLedger')],
  ['Layer 2 documented server chain',docs.includes('internal_chain_blocks')&&docs.includes('anchor_internal_chain_event')],
  ['Layer 3 separate table',migration.includes('set_apart_chain_blocks')],
  ['Layer 3 separate anchor function',migration.includes('anchor_set_apart_chain_event')],
  ['Layer 3 service-role only',migration.includes('revoke all on function public.anchor_set_apart_chain_event')&&migration.includes('grant execute on function public.anchor_set_apart_chain_event')&&migration.includes('to service_role')],
  ['Layer 3 RLS enabled',migration.includes('alter table public.set_apart_chain_blocks enable row level security')],
  ['Layer 3 supports platform cross-anchor',migration.includes('platform_block_hash')],
  ['Set Apart categories represented',migration.includes("'SABBATH'")&&migration.includes("'NEW_MOON'")&&migration.includes("'MINISTRY_SERVICE'")&&migration.includes("'LEGACY'")],
  ['No commerce authority claim',docs.includes('cannot create a payment')&&docs.includes('customs clearance')&&docs.includes('inventory mutation')],
  ['No civil sovereignty claim',docs.includes('citizenship or nationality')&&docs.includes('governmental recognition')&&docs.includes('legal sovereignty')],
  ['Set Apart Passport visible',familyHub.includes("passport:{label:'SET APART PASSPORT'")&&familyHub.includes("tab==='passport'")&&familyHub.includes('tryamm-set-apart-kingdom-chain-v1')],
  ['Set Apart Passport read-only',familyHub.includes("['CLIENT WRITE AUTHORITY','NONE']")&&familyHub.includes('TRUSTED SERVER ONLY')&&familyHub.includes('RLS PROTECTED')],
  ['Set Apart Passport browser cannot anchor',!familyHub.includes('anchor_set_apart_chain_event')&&!familyHub.includes('.rpc(')],
  ['Set Apart Passport civil disclaimer',familyHub.includes('not a government passport')&&familyHub.includes('citizenship or nationality record')&&familyHub.includes('legal sovereignty')],
  ['Set Apart Passport Command Nexus launcher',app.includes('__showSetApartPassport')&&app.includes("'SET APART PASSPORT'")&&app.includes("setStaysAgencyFamilyInitialTab('passport')")],
  ['Set Apart Passport Family entry',familyHub.includes('Open Set Apart Passport')&&familyHub.includes("setTab('passport')")],
  ['Passport projection table protected',projectionMigration.includes('set_apart_passport_receipts')&&projectionMigration.includes('enable row level security')&&projectionMigration.includes('grant select on table public.set_apart_passport_receipts to authenticated')],
  ['Passport projection owner-only read',projectionMigration.includes('owner_user_id = auth.uid()')&&projectionMigration.includes('for select')],
  ['Passport publisher server-only',projectionMigration.includes('revoke all on function public.publish_set_apart_passport_receipt')&&projectionMigration.includes('to service_role')],
  ['Passport projection is private only',projectionMigration.includes("visibility = 'PRIVATE'")],
  ['Passport client reads projection',passportService.includes(".from('set_apart_passport_receipts')")&&passportService.includes(".eq('owner_user_id',userId)")&&passportService.includes('.select(')],
  ['Passport client has no write/RPC path',!passportService.includes('.insert(')&&!passportService.includes('.update(')&&!passportService.includes('.delete(')&&!passportService.includes('.rpc(')&&!passportService.includes('service_role')],
  ['Passport UI loads approved receipts',familyHub.includes('<SetApartPassportReceipts/>')&&passportPanel.includes('listMySetApartPassportReceipts')&&passportPanel.includes('My approved Set Apart Passport receipts')],
  ['Passport UI safe states',passportPanel.includes('Unable to load protected Passport receipts.')&&passportPanel.includes('No approved Set Apart attestations have been published to this Passport yet.')],
  ['Set Apart Passport docs preserve projection boundary',docs.includes('authenticated, owner-only read projection')&&docs.includes('direct browser calls to `anchor_set_apart_chain_event`: prohibited')],
]

const failed=checks.filter(([,ok])=>!ok)
for(const [name,ok] of checks)console.log(`${ok?'PASS':'FAIL'} ${name}`)
if(failed.length){console.error(`Three-layer blockchain contract failed: ${failed.map(([name])=>name).join(', ')}`);process.exit(1)}
console.log('Three-layer blockchain contract passed')
