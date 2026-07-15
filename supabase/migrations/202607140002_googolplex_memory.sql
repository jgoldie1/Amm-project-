create extension if not exists vector;

create table if not exists public.ai_memories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  subject_type text not null default 'user',
  subject_id text,
  tier text not null check (tier in ('working','episodic','semantic','procedural','relational','project','npc','arena','commerce')),
  title text not null,
  content text not null,
  facts jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  source_ids text[] not null default '{}',
  confidence numeric not null default 0.7 check (confidence between 0 and 1),
  importance numeric not null default 0.5 check (importance between 0 and 1),
  visibility text not null default 'private' check (visibility in ('private','shared','public')),
  consent boolean not null default false,
  status text not null default 'active' check (status in ('active','superseded','forgotten')),
  supersedes_id uuid references public.ai_memories(id),
  expires_at timestamptz,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_memory_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  source_memory_id uuid not null references public.ai_memories(id) on delete cascade,
  target_memory_id uuid not null references public.ai_memories(id) on delete cascade,
  relation text not null default 'related_to',
  weight numeric not null default 1 check (weight between 0 and 10),
  created_at timestamptz not null default now(),
  unique(source_memory_id,target_memory_id,relation)
);

create index if not exists ai_memories_owner_idx on public.ai_memories(owner_id);
create index if not exists ai_memories_subject_idx on public.ai_memories(subject_type,subject_id);
create index if not exists ai_memories_tier_idx on public.ai_memories(tier);
create index if not exists ai_memories_tags_idx on public.ai_memories using gin(tags);
create index if not exists ai_memories_content_search_idx on public.ai_memories using gin(to_tsvector('english',title||' '||content));

alter table public.ai_memories enable row level security;
alter table public.ai_memory_links enable row level security;

create policy "Users read own or public memories" on public.ai_memories
for select using (owner_id=auth.uid() or visibility='public');

create policy "Users insert own memories" on public.ai_memories
for insert with check (owner_id=auth.uid());

create policy "Users update own memories" on public.ai_memories
for update using (owner_id=auth.uid()) with check (owner_id=auth.uid());

create policy "Users delete own memories" on public.ai_memories
for delete using (owner_id=auth.uid());

create policy "Users manage own memory links" on public.ai_memory_links
for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());

create or replace function public.set_memory_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at=now();
  return new;
end;
$$;

drop trigger if exists ai_memories_updated_at on public.ai_memories;
create trigger ai_memories_updated_at before update on public.ai_memories
for each row execute function public.set_memory_updated_at();
