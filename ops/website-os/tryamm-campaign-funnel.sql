-- Staging-only install after backup and owner approval; no live customer data changes.
create table if not exists public.tryamm_campaigns (
 id uuid primary key, owner_id text not null, project_id uuid not null references public.website_brand_projects(id),
 name text not null, offer text not null, landing_url text not null, source text not null default 'holo-reel',
 status text not null default 'draft' check (status in ('draft','approved','paused','archived')),
 evidence jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.tryamm_campaign_leads (
 id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.tryamm_campaigns(id),
 owner_id text not null, email text not null, interest text not null,
 marketing_opt_in boolean not null default false, consent_at timestamptz not null default now(),
 status text not null default 'new' check (status in ('new','review','quoted','paid','closed')),
 created_at timestamptz not null default now()
);
create index if not exists tryamm_campaigns_owner_idx on public.tryamm_campaigns(owner_id,created_at desc);
create index if not exists tryamm_campaign_leads_owner_idx on public.tryamm_campaign_leads(owner_id,campaign_id);
alter table public.tryamm_campaigns enable row level security;
alter table public.tryamm_campaign_leads enable row level security;
revoke all on public.tryamm_campaigns from public,anon,authenticated;
revoke all on public.tryamm_campaign_leads from public,anon,authenticated;
grant select,insert,update on public.tryamm_campaigns to service_role;
grant select,insert,update on public.tryamm_campaign_leads to service_role;
-- No unverified payment records. Paid sales require a separate transactional Stripe webhook integration,
-- reconciliation and durable outbox. Visits must not be inferred from click previews.
