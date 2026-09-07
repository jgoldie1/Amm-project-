import fs from 'node:fs'

const persistence=fs.readFileSync(new URL('../src/services/staysAgencyFamilyPersistence.ts',import.meta.url),'utf8')
const migration=fs.readFileSync(new URL('../../supabase/migrations/20260904193012_stays_agency_family_persistence.sql',import.meta.url),'utf8')
const hardening=fs.readFileSync(new URL('../../supabase/migrations/20260904194009_family_group_policy_recursion_hardening.sql',import.meta.url),'utf8')

const adapterTokens=[
  "from './supabaseClient'",
  "from('tryamm_stay_reservations')",
  "status:'requested'",
  "from('tryamm_agency_contracts')",
  "status:'proposed'",
  "from('tryamm_family_groups')",
  "from('tryamm_family_memberships')",
  "status:'invited'",
  'getAuthenticatedUserId',
  'guardianApprovalEvidenceId',
]
for(const token of adapterTokens){
  if(!persistence.includes(token))throw new Error(`Missing persistence adapter guard: ${token}`)
}

for(const forbidden of ['.update(','.delete(','.rpc(','SERVICE_ROLE','SUPABASE_SERVICE','service_role']){
  if(persistence.includes(forbidden))throw new Error(`Browser persistence adapter must not contain privileged mutation path: ${forbidden}`)
}

const migrationTokens=[
  'create table public.tryamm_stay_reservations',
  'create table public.tryamm_agency_contracts',
  'create table public.tryamm_family_groups',
  'create table public.tryamm_family_memberships',
  'alter table public.tryamm_stay_reservations enable row level security',
  'alter table public.tryamm_agency_contracts enable row level security',
  'alter table public.tryamm_family_groups enable row level security',
  'alter table public.tryamm_family_memberships enable row level security',
  'revoke all on table public.tryamm_stay_reservations from anon',
  'revoke all on table public.tryamm_agency_contracts from anon',
  'revoke all on table public.tryamm_family_groups from anon',
  'revoke all on table public.tryamm_family_memberships from anon',
  "status = 'requested'",
  "status = 'proposed'",
  "status = 'invited'",
  'creator_acceptance_evidence_id',
  'minor_family_membership_evidence',
  'guardian_family_links',
]
for(const token of migrationTokens){
  if(!migration.includes(token))throw new Error(`Missing persistence migration protection: ${token}`)
}

if(migration.toLowerCase().includes('security definer'))throw new Error('Persistence migration must not add SECURITY DEFINER authority')
if(!hardening.includes('drop policy if exists "family owner or member reads group"'))throw new Error('Family group recursive read policy must be removed')
if(!hardening.includes('create policy "family owner reads group"'))throw new Error('Family group owner-only read policy hardening missing')
if(hardening.includes('tryamm_family_memberships'))throw new Error('Family group read hardening must not recurse through family membership RLS')

console.log('TRYAMM Stays/Agency/Family persistence contract: PASS')
