create table if not exists public.user_safety_relationships (
  owner_user_id uuid not null,
  target_user_id uuid not null,
  blocked boolean not null default false,
  muted boolean not null default false,
  reason text null,
  source text not null default 'user-action',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(owner_user_id,target_user_id),
  check (owner_user_id <> target_user_id)
);

alter table public.user_safety_relationships enable row level security;
revoke all on public.user_safety_relationships from anon;

create index if not exists user_safety_relationships_target_idx on public.user_safety_relationships(target_user_id);
create index if not exists user_safety_relationships_blocked_idx on public.user_safety_relationships(owner_user_id,blocked) where blocked=true;
create index if not exists user_safety_relationships_muted_idx on public.user_safety_relationships(owner_user_id,muted) where muted=true;
