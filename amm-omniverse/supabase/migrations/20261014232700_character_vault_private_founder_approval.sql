-- Durable source of truth for the production Character Vault (applied via Supabase).
-- Founders are granted by an administrator after real Supabase sign-in.
-- NEVER grant permissions by client-editable user_metadata.
create table if not exists public.asset_factory_operators(
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check(role in ('founder','asset_admin')),
 granted_at timestamptz not null default now(),
 granted_by uuid references auth.users(id) on delete set null,
 revoked_at timestamptz
);
alter table public.asset_factory_operators enable row level security;
revoke all on table public.asset_factory_operators from public,anon,authenticated;
grant select,insert,update,delete on public.asset_factory_operators to service_role;

create table if not exists public.asset_factory_assets(
 id uuid primary key default gen_random_uuid(),
 asset_id text not null check(asset_id ~ '^[a-z0-9][a-z0-9_-]{2,89}$'),
 owner_user_id uuid not null references auth.users(id) on delete restrict,
 filename text not null check(filename ~* '^[a-z0-9_-]{3,95}[.]glb$'),
 city_scope text not null default 'global' check(city_scope ~ '^[a-z0-9_-]{1,80}$'),
 draft_path text not null unique,
 draft_bucket text not null default 'streetverse-character-drafts' check(draft_bucket='streetverse-character-drafts'),
 status text not null default 'uploading',
 sha256 text check(sha256 ~ '^[0-9a-f]{64}$'),
 byte_size bigint check(byte_size between 12 and 52428800),
 mesh_count integer check(mesh_count>=0),
 animation_count integer check(animation_count>=0),
 source_kind text not null default 'manual_glb'
   check(source_kind in ('manual_glb','meshy_existing','meshy_generated','higgsfield_glb')),
 source_task_id text,
 approved_by uuid references auth.users(id) on delete set null,
 approved_at timestamptz,
 published_path text unique,
 published_url text,
 published_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint published_only_after_approval
   check(status<>'published' or (approved_by is not null and approved_at is not null
     and published_path is not null and published_url is not null and sha256 is not null))
);
alter table public.asset_factory_assets
 drop constraint if exists asset_factory_assets_status_check;
alter table public.asset_factory_assets
 add constraint asset_factory_assets_status_check
 check(status in ('uploading','pending_review','publishing','published','rejected','archived'));
create index if not exists asset_factory_assets_status_created_idx on public.asset_factory_assets(status,created_at desc);
create index if not exists asset_factory_assets_public_manifest_idx on public.asset_factory_assets(city_scope,asset_id,published_at desc) where status='published';
create index if not exists asset_factory_assets_owner_idx on public.asset_factory_assets(owner_user_id,created_at desc);
alter table public.asset_factory_assets enable row level security;
revoke all on public.asset_factory_assets from public,anon,authenticated;
grant select,insert,update,delete on public.asset_factory_assets to service_role;
-- Expose only the approved URL columns. Unapproved records are invisible by RLS.
grant select(asset_id,city_scope,published_url,published_at) on public.asset_factory_assets to anon,authenticated;
drop policy if exists asset_factory_published_urls_only on public.asset_factory_assets;
create policy asset_factory_published_urls_only on public.asset_factory_assets for select to anon,authenticated
 using (status='published' and published_at is not null and published_url is not null);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('streetverse-character-drafts','streetverse-character-drafts',false,52428800,
   array['model/gltf-binary','application/octet-stream']::text[])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,
 allowed_mime_types=excluded.allowed_mime_types;
-- No anon/auth storage policies are created on private drafts; only signed upload tokens.
