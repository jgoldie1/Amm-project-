create table public.tryamm_stay_reservations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.property_network_listings(id) on delete cascade,
  guest_user_id uuid not null references auth.users(id) on delete cascade,
  check_in date not null,
  check_out date not null,
  guest_count integer not null check (guest_count between 1 and 50),
  status text not null default 'requested' check (status in ('requested','held','confirmed','checked_in','checked_out','cancelled')),
  availability_hold_id text,
  payment_authorization_evidence_id text,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tryamm_stay_dates_valid check (check_out > check_in),
  constraint tryamm_stay_hold_required check (status = 'requested' or status = 'cancelled' or nullif(btrim(availability_hold_id),'') is not null),
  constraint tryamm_stay_payment_evidence_required check (status not in ('confirmed','checked_in','checked_out') or nullif(btrim(payment_authorization_evidence_id),'') is not null)
);

create index tryamm_stay_reservations_listing_dates_idx on public.tryamm_stay_reservations(listing_id, check_in, check_out);
create index tryamm_stay_reservations_guest_idx on public.tryamm_stay_reservations(guest_user_id, created_at desc);
alter table public.tryamm_stay_reservations enable row level security;

create policy "stay participants read reservations"
on public.tryamm_stay_reservations for select
to authenticated
using (
  guest_user_id = (select auth.uid())
  or exists (
    select 1 from public.property_network_listings l
    where l.id = tryamm_stay_reservations.listing_id
      and l.owner_id = (select auth.uid())
  )
);

create policy "guest creates requested stay"
on public.tryamm_stay_reservations for insert
to authenticated
with check (
  guest_user_id = (select auth.uid())
  and status = 'requested'
  and availability_hold_id is null
  and payment_authorization_evidence_id is null
  and check_in >= current_date
  and exists (
    select 1 from public.property_network_listings l
    where l.id = tryamm_stay_reservations.listing_id
      and l.listing_type = 'short-term-rental'
      and l.verification_status = 'verified'
      and l.availability_status = 'available'
  )
);

revoke all on table public.tryamm_stay_reservations from anon;
grant select, insert on table public.tryamm_stay_reservations to authenticated;
grant select, insert, update, delete on table public.tryamm_stay_reservations to service_role;

create table public.tryamm_agency_contracts (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.tryamm_agency_memberships(id) on delete cascade,
  proposed_by_user_id uuid not null references auth.users(id) on delete cascade,
  commission_bps integer not null check (commission_bps between 0 and 10000),
  status text not null default 'proposed' check (status in ('proposed','accepted','declined','terminated','expired')),
  contract_evidence_id text not null check (nullif(btrim(contract_evidence_id),'') is not null),
  creator_acceptance_evidence_id text,
  guardian_consent_evidence_id text,
  age_compliance_reviewed boolean not null default false,
  effective_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agency_contract_acceptance_evidence check (
    status <> 'accepted'
    or (nullif(btrim(creator_acceptance_evidence_id),'') is not null and effective_at is not null)
  ),
  constraint agency_contract_dates_valid check (expires_at is null or effective_at is null or expires_at > effective_at)
);

create index tryamm_agency_contracts_membership_idx on public.tryamm_agency_contracts(membership_id, created_at desc);
alter table public.tryamm_agency_contracts enable row level security;

create policy "contract visible to creator or agency owner"
on public.tryamm_agency_contracts for select
to authenticated
using (
  exists (
    select 1
    from public.tryamm_agency_memberships m
    join public.tryamm_agencies a on a.id = m.agency_id
    where m.id = tryamm_agency_contracts.membership_id
      and (m.user_id = (select auth.uid()) or a.owner_user_id = (select auth.uid()))
  )
);

create policy "agency owner proposes contract"
on public.tryamm_agency_contracts for insert
to authenticated
with check (
  proposed_by_user_id = (select auth.uid())
  and status = 'proposed'
  and creator_acceptance_evidence_id is null
  and effective_at is null
  and exists (
    select 1
    from public.tryamm_agency_memberships m
    join public.tryamm_agencies a on a.id = m.agency_id
    where m.id = tryamm_agency_contracts.membership_id
      and a.owner_user_id = (select auth.uid())
  )
);

revoke all on table public.tryamm_agency_contracts from anon;
grant select, insert on table public.tryamm_agency_contracts to authenticated;
grant select, insert, update, delete on table public.tryamm_agency_contracts to service_role;

create table public.tryamm_family_groups (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tryamm_family_groups_owner_idx on public.tryamm_family_groups(owner_user_id, created_at desc);
alter table public.tryamm_family_groups enable row level security;

create table public.tryamm_family_memberships (
  id uuid primary key default gen_random_uuid(),
  family_group_id uuid not null references public.tryamm_family_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('guardian','adult','teen','child')),
  status text not null default 'invited' check (status in ('invited','active','removed')),
  guardian_approval_evidence_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_group_id, user_id),
  constraint minor_family_membership_evidence check (
    role not in ('teen','child') or nullif(btrim(guardian_approval_evidence_id),'') is not null
  )
);

create index tryamm_family_memberships_user_idx on public.tryamm_family_memberships(user_id, status);
alter table public.tryamm_family_memberships enable row level security;

create policy "family owner or member reads group"
on public.tryamm_family_groups for select
to authenticated
using (
  owner_user_id = (select auth.uid())
  or exists (
    select 1 from public.tryamm_family_memberships m
    where m.family_group_id = tryamm_family_groups.id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  )
);

create policy "user creates own family group"
on public.tryamm_family_groups for insert
to authenticated
with check (owner_user_id = (select auth.uid()) and status = 'active');

create policy "family owner updates group"
on public.tryamm_family_groups for update
to authenticated
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));

create policy "family membership visible to self or owner"
on public.tryamm_family_memberships for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.tryamm_family_groups g
    where g.id = tryamm_family_memberships.family_group_id
      and g.owner_user_id = (select auth.uid())
  )
);

create policy "family owner invites member"
on public.tryamm_family_memberships for insert
to authenticated
with check (
  status = 'invited'
  and exists (
    select 1 from public.tryamm_family_groups g
    where g.id = tryamm_family_memberships.family_group_id
      and g.owner_user_id = (select auth.uid())
  )
  and (
    role not in ('teen','child')
    or exists (
      select 1 from public.guardian_family_links gl
      where gl.guardian_user_id = (select auth.uid())
        and gl.child_user_id = tryamm_family_memberships.user_id
        and gl.status = 'active'
    )
  )
);

revoke all on table public.tryamm_family_groups from anon;
grant select, insert, update on table public.tryamm_family_groups to authenticated;
grant select, insert, update, delete on table public.tryamm_family_groups to service_role;

revoke all on table public.tryamm_family_memberships from anon;
grant select, insert on table public.tryamm_family_memberships to authenticated;
grant select, insert, update, delete on table public.tryamm_family_memberships to service_role;
