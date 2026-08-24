-- TRYAMM Quantum Convergence v1
-- Quantum here means cross-system orchestration/convergence, not quantum-computing hardware.

create table if not exists public.system_convergence_status (
  service text primary key,
  status text not null default 'unverified' check (status in ('healthy','degraded','down','unverified','gated')),
  environment text not null default 'production',
  public_url text,
  commit_sha text,
  details jsonb not null default '{}'::jsonb,
  checked_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.system_convergence_status enable row level security;

drop policy if exists system_convergence_public_read on public.system_convergence_status;
create policy system_convergence_public_read
on public.system_convergence_status
for select
to anon, authenticated
using (true);

create index if not exists system_convergence_status_checked_idx
on public.system_convergence_status(status, checked_at desc);

insert into public.system_convergence_status(service,status,environment,public_url,commit_sha,details,checked_at,updated_at)
values
 ('supabase','healthy','production','https://fxluchtdfpediivhoksl.supabase.co',null,jsonb_build_object('project_ref','fxluchtdfpediivhoksl','database','postgres-17','rls_core_path','optimized'),now(),now()),
 ('vercel','degraded','production','https://tryamm.online',null,jsonb_build_object('expected_project','amm-omniverse','issue','git deployment currently converges through a different Vercel project; production project requires relink or direct deployment'),now(),now()),
 ('render','unverified','production','https://amm-project-1-rpz9.onrender.com/',null,jsonb_build_object('role','backend/runtime','verification','pending connected-provider access or public health probe'),now(),now()),
 ('github','healthy','production','https://github.com/jgoldie1/Amm-project-','230714fbb8b0d852fec44af737dd53c67ece3cc3',jsonb_build_object('branch','developer-vic','route_fix_merge','6eb7fe0d76b57515de973b9cf748756e827530f6'),now(),now()),
 ('tryamm-web','healthy','production','https://tryamm.online',null,jsonb_build_object('role','public website and PWA','note','public endpoint reachable; commit convergence still requires deployment SHA proof'),now(),now())
on conflict (service) do update set
 status=excluded.status,
 environment=excluded.environment,
 public_url=excluded.public_url,
 commit_sha=excluded.commit_sha,
 details=excluded.details,
 checked_at=excluded.checked_at,
 updated_at=excluded.updated_at;

create or replace view public.system_convergence_summary as
select
  case
    when bool_or(status='down') then 'down'
    when bool_or(status in ('degraded','unverified')) then 'degraded'
    when bool_or(status='gated') then 'gated'
    else 'healthy'
  end as overall_status,
  count(*) filter (where status='healthy') as healthy_count,
  count(*) filter (where status='degraded') as degraded_count,
  count(*) filter (where status='down') as down_count,
  count(*) filter (where status='unverified') as unverified_count,
  count(*) filter (where status='gated') as gated_count,
  max(checked_at) as last_checked_at
from public.system_convergence_status;

grant select on public.system_convergence_summary to anon, authenticated;
