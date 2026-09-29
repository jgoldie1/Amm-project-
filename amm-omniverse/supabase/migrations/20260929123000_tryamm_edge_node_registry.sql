create table if not exists public.tryamm_edge_nodes (
  id uuid primary key default gen_random_uuid(),
  owner_user_id text not null,
  install_hash text not null,
  node_class text not null check (node_class in ('pocket','tablet','workstation','cafe','business','cloud')),
  status text not null default 'online' check (status in ('online','offline','degraded','disabled')),
  trust_state text not null default 'registered' check (trust_state in ('registered','managed','disabled')),
  capabilities jsonb not null default '{}'::jsonb,
  lease_limit integer not null default 1 check (lease_limit between 1 and 16),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_user_id, install_hash)
);

create table if not exists public.tryamm_edge_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id text not null,
  job_class text not null check (job_class in ('cache-sync','world-state-sync','light-ai','media-thumbnail','asset-optimize','offline-reconcile','telemetry-aggregate')),
  required_capability text not null,
  payload_ref text,
  payload_hash text,
  result_ref text,
  status text not null default 'queued' check (status in ('queued','leased','completed','failed','cancelled')),
  leased_node_id uuid references public.tryamm_edge_nodes(id) on delete set null,
  lease_expires_at timestamptz,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.tryamm_edge_nodes enable row level security;
alter table public.tryamm_edge_jobs enable row level security;

revoke all on table public.tryamm_edge_nodes from anon, authenticated;
revoke all on table public.tryamm_edge_jobs from anon, authenticated;
grant select, insert, update, delete on table public.tryamm_edge_nodes to service_role;
grant select, insert, update, delete on table public.tryamm_edge_jobs to service_role;

create index if not exists tryamm_edge_nodes_owner_seen_idx
  on public.tryamm_edge_nodes(owner_user_id,last_seen_at desc);
create index if not exists tryamm_edge_jobs_owner_status_created_idx
  on public.tryamm_edge_jobs(owner_user_id,status,created_at);
create index if not exists tryamm_edge_jobs_lease_expiry_idx
  on public.tryamm_edge_jobs(status,lease_expires_at);

comment on table public.tryamm_edge_nodes is
'Backend-only TRYAMM Edge Node registry. Browser installation identifiers are HMAC-hashed before storage.';
comment on table public.tryamm_edge_jobs is
'Backend-only safe edge-job metadata. Never store raw auth tokens, secrets, private keys, or sensitive plaintext payloads here.';
