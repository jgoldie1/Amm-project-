-- Install only after owner approves the database release and a backup/restore check.
-- All access is via server-side service-role requests scoped to the authenticated TRYAMM user.
create table if not exists public.website_brand_projects (
 id uuid primary key,
 owner_id text not null,
 revision integer not null default 0 check (revision >= 0),
 brand jsonb not null default '{}'::jsonb,
 cloud_setup jsonb,
 status text not null default 'draft' check (status in ('draft','review-requested','approved','rejected')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.website_brand_projects add column if not exists cloud_setup jsonb;
create index if not exists website_brand_projects_owner_updated_idx on public.website_brand_projects(owner_id,updated_at desc);
alter table public.website_brand_projects enable row level security;
revoke all on public.website_brand_projects from public,anon,authenticated;
grant select,insert,update on public.website_brand_projects to service_role;
-- Do not grant direct client data API access: application auth uses established session IDs
-- and the server injects/filters owner_id. No user-supplied owner_id is accepted.
