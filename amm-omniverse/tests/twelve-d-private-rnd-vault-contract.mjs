import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const migration=read('../supabase/migrations/20261002114500_twelve_d_private_rnd_vault.sql')
const vault=read('../api/_lib/twelve-d-rnd-vault.js')
const api=read('../api/rnd/12d-vault.js')
const panel=read('../src/components/TwelveDPrivateRnDPanel.tsx')
const bridge=read('../src/data/TwelveDPrinterBridge.ts')

for(const token of [
 'revoke all on table public.twelve_d_rnd_records from public, anon, authenticated',
 'grant select,insert,update,delete on table public.twelve_d_rnd_records to service_role',
 "publication_state text not null default 'private'",
]) assert.ok(migration.includes(token),`private 12D migration missing ${token}`)

assert.ok(vault.includes('requireFactoryAuthority(user)'),'12D R&D API must require founder/admin authority')
assert.ok(vault.includes("publicManifest:false"),'12D R&D policy must not expose a public manifest')
assert.ok(vault.includes("anonymousRead:false"),'12D R&D policy must block anonymous reads')
assert.ok(vault.includes("authenticatedDirectRead:false"),'12D R&D records must not be directly readable by ordinary authenticated clients')
assert.ok(vault.includes("publicReleaseEndpointImplemented:false"),'private R&D service must not implement a public release endpoint')
assert.ok(vault.includes("APPROVE_12D_PUBLICATION"),'future publication approval must require an explicit confirmation phrase')
assert.ok(api.includes('requireUser(req,res)'),'12D R&D endpoint must require authentication')
assert.ok(api.includes('publiclyExposed:false'),'publication approval response must explicitly remain non-public')
assert.ok(panel.includes('PRIVATE BY DEFAULT'),'founder panel must communicate private state')
assert.ok(panel.includes('Nothing here can be made public by this panel.'),'founder panel must prevent accidental public release')
assert.ok(!api.includes('public-manifest'),'private API must not create a public manifest route')

assert.ok(bridge.includes("No AI-generated design goes directly from prompt to physical motion."),'existing 12D bridge must preserve human/machine safety boundary')

console.log('Private 12D R&D vault contract: PASS')
