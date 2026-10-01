-- StreetVerse Meshy asset factory: durable generation/rig/publish state.
-- Service-role only. Public gameplay reads only the narrow manifest API.

create table if not exists public.meshy_asset_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  asset_id text not null,
  filename text not null,
  city_scope text not null default 'global',
  generation_type text not null check (generation_type in ('text-to-3d','image-to-3d','multi-image-to-3d')),
  prompt text,
  source_image_url text,
  stage text not null default 'queued'
    check (stage in ('queued','generating','rigging','publishing','ready','failed','cancelled')),
  progress integer not null default 0 check (progress between 0 and 100),
  provider_generation_task_id text,
  provider_rig_task_id text,
  generation_glb_url text,
  rigged_glb_url text,
  walking_glb_url text,
  running_glb_url text,
  published_path text,
  public_url text,
  walking_public_url text,
  running_public_url text,
  provider_credits numeric,
  evidence jsonb not null default '{}'::jsonb,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists meshy_asset_jobs_owner_created_idx
  on public.meshy_asset_jobs(owner_user_id,created_at desc);
create index if not exists meshy_asset_jobs_asset_stage_idx
  on public.meshy_asset_jobs(asset_id,stage,created_at desc);
create index if not exists meshy_asset_jobs_scope_ready_idx
  on public.meshy_asset_jobs(city_scope,stage,updated_at desc);

alter table public.meshy_asset_jobs enable row level security;
revoke all on table public.meshy_asset_jobs from public, anon, authenticated;
grant select,insert,update,delete on table public.meshy_asset_jobs to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values(
  'streetverse-assets',
  'streetverse-assets',
  true,
  104857600,
  array['model/gltf-binary','application/octet-stream']::text[]
)
on conflict (id) do update set
  public=excluded.public,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;
