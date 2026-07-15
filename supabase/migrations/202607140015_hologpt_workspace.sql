create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public, file_size_limit)
values ('hologpt-files', 'hologpt-files', false, 26214400)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

create table if not exists public.hologpt_files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  object_path text not null unique,
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 26214400),
  status text not null default 'uploaded' check (status in ('uploading','uploaded','processing','ready','failed','quarantined')),
  metadata jsonb not null default '{}'::jsonb,
  extracted_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hologpt_threads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New HoloGPT conversation',
  provider_preference text,
  model_preference text,
  system_profile text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hologpt_messages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  thread_id uuid not null references public.hologpt_threads(id) on delete cascade,
  role text not null check (role in ('user','assistant','system','tool')),
  content text not null,
  attachment_ids uuid[] not null default '{}',
  provider text,
  model text,
  token_usage jsonb not null default '{}'::jsonb,
  safety jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.hologpt_analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  thread_id uuid references public.hologpt_threads(id) on delete set null,
  task text not null,
  prompt text not null default '',
  file_ids uuid[] not null default '{}',
  status text not null default 'queued' check (status in ('queued','processing','completed','failed','cancelled')),
  provider text,
  model text,
  result jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create index if not exists hologpt_files_owner_created_idx on public.hologpt_files(owner_id, created_at desc);
create index if not exists hologpt_threads_owner_updated_idx on public.hologpt_threads(owner_id, updated_at desc);
create index if not exists hologpt_messages_thread_created_idx on public.hologpt_messages(thread_id, created_at);
create index if not exists hologpt_jobs_owner_created_idx on public.hologpt_analysis_jobs(owner_id, created_at desc);

alter table public.hologpt_files enable row level security;
alter table public.hologpt_threads enable row level security;
alter table public.hologpt_messages enable row level security;
alter table public.hologpt_analysis_jobs enable row level security;

do $$ begin
  create policy "owners manage hologpt files" on public.hologpt_files for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "owners manage hologpt threads" on public.hologpt_threads for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "owners manage hologpt messages" on public.hologpt_messages for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "owners manage hologpt analysis jobs" on public.hologpt_analysis_jobs for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "owners upload hologpt objects" on storage.objects for insert to authenticated with check (bucket_id = 'hologpt-files' and (storage.foldername(name))[1] = auth.uid()::text);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "owners read hologpt objects" on storage.objects for select to authenticated using (bucket_id = 'hologpt-files' and (storage.foldername(name))[1] = auth.uid()::text);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "owners delete hologpt objects" on storage.objects for delete to authenticated using (bucket_id = 'hologpt-files' and (storage.foldername(name))[1] = auth.uid()::text);
exception when duplicate_object then null; end $$;
