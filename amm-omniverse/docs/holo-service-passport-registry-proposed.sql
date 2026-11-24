-- Candidate schema only; NOT executed on production.
-- HoloService Passport registry supports read-only preflight, not real dispatch.
-- Review with database owner, audit existing schema, and apply through migration tooling.
create table if not exists public.holo_service_passport_authorizations (
 id uuid primary key default gen_random_uuid(),
 owner_user_id uuid not null references auth.users(id) on delete cascade,
 provider_display_name text not null check (length(btrim(provider_display_name)) between 2 and 180),
 status text not null default 'draft' check(status in ('draft','review','approved','suspended','revoked')),
 approved_region text not null,
 approved_service text not null check(approved_service in
  ('rideshare','delivery','freight','drone','advertising','commerce','farm-discovery','gallery')),
 authorization_expires_at timestamptz,
 approved_at timestamptz,
 approved_by uuid,
 consent_document_ref text,
 credential_evidence_ref text,
 insurance_evidence_ref text,
 compliance_review_ref text,
 provider_authority_ref text,
 guardian_covenant_ref text,
 revoked_at timestamptz,
 revocation_reason_private text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint holo_passport_approval_complete check(
  status<>'approved' or (
   authorization_expires_at is not null and
   approved_at is not null and approved_by is not null and
   consent_document_ref is not null and credential_evidence_ref is not null and
   compliance_review_ref is not null and provider_authority_ref is not null and
   guardian_covenant_ref is not null and revoked_at is null
  )
 ),
 constraint holo_passport_revocation_consistent check (
  status not in ('suspended','revoked') or revoked_at is not null
 )
);
create index if not exists holo_passport_owner_service_idx
 on public.holo_service_passport_authorizations(owner_user_id,approved_service,status);
alter table public.holo_service_passport_authorizations enable row level security;
revoke all on public.holo_service_passport_authorizations from public,anon,authenticated;
grant select,insert,update,delete on public.holo_service_passport_authorizations to service_role;
-- No public or end-user access policies. Privileged updates must be done through
-- a dedicated audited administrative API, with verified operator role and MFA.
-- Approval is not execution permission. An authorized service-specific endpoint must
-- independently check driver/aircraft/food requirements, signed provider events,
-- recipient consent, payment authority, incident support, and idempotency.
