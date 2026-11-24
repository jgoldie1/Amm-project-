-- YAHAVAH private farm approval registry (reviewed SQL candidate, NOT applied).
-- Apply only after verifying the target project, backing up data and testing RLS.
-- There are deliberately NO public SELECT/INSERT/UPDATE/DELETE permissions.
create table if not exists public.yahavah_farm_registry (
 id uuid primary key default gen_random_uuid(),
 farm_name text not null check (length(btrim(farm_name)) between 2 and 180),
 city text not null,
 state text not null,
 products text[] not null default '{}',
 website text,
 contact_private jsonb not null default '{}'::jsonb,
 consent_granted boolean not null default false,
 consent_expires_at timestamptz,
 consent_document_ref text,
 approved_at timestamptz,
 approved_by uuid,
 identity_verified_at timestamptz,
 rights_verified_at timestamptz,
 withdrawn_at timestamptz,
 public_listing_allowed boolean not null default false,
 media_permission boolean not null default false,
 supplier_purchase_agreement boolean not null default false,
 food_compliance_verified boolean not null default false,
 fulfillment_verified boolean not null default false,
 verification_notes_private text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint consent_evidence_for_approval check (
  not public_listing_allowed or (
   consent_granted and consent_document_ref is not null and
   consent_expires_at is not null and approved_at is not null and
   approved_by is not null and identity_verified_at is not null and
   rights_verified_at is not null and withdrawn_at is null
  )
 ),
 constraint sale_requires_operational_evidence check (
  not supplier_purchase_agreement or consent_document_ref is not null
 )
);
alter table public.yahavah_farm_registry enable row level security;
revoke all on table public.yahavah_farm_registry from public, anon, authenticated;
-- Only trusted server paths with a privileged credential can read or write.
-- Never expose privileged credentials to React or run public API writes.
grant select, insert, update, delete on public.yahavah_farm_registry to service_role;
-- Design rule: public profile endpoints must select an explicit safe-column
-- projection only after verifying consent expiry, withdrawal and approval,
-- and must never emit contact_private or verification_notes_private.
-- Food orders and media usage require independent, separate permission checks.
