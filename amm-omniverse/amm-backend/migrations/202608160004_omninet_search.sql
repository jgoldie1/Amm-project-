create table if not exists public.omninet_documents (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid null references auth.users(id) on delete cascade,
  visibility text not null default 'public' check (visibility in ('public','private','unlisted')),
  source_type text not null default 'omninet',
  source_key text null,
  title text not null,
  url text null,
  summary text not null default '',
  body_text text not null default '',
  language text not null default 'und',
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  published_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists omninet_documents_source_key_uq on public.omninet_documents(source_type,source_key) where source_key is not null;
create index if not exists omninet_documents_visibility_idx on public.omninet_documents(visibility,created_at desc);
create index if not exists omninet_documents_search_idx on public.omninet_documents using gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(body_text,'')));
create index if not exists omninet_documents_tags_idx on public.omninet_documents using gin(tags);

create table if not exists public.omninet_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  query_text text not null,
  mode text not null default 'hybrid',
  result_count integer not null default 0,
  providers text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.omninet_documents enable row level security;
alter table public.omninet_queries enable row level security;

drop policy if exists omninet_public_read on public.omninet_documents;
create policy omninet_public_read on public.omninet_documents for select using (visibility='public' or owner_user_id=auth.uid());
drop policy if exists omninet_owner_insert on public.omninet_documents;
create policy omninet_owner_insert on public.omninet_documents for insert with check (owner_user_id=auth.uid());
drop policy if exists omninet_owner_update on public.omninet_documents;
create policy omninet_owner_update on public.omninet_documents for update using (owner_user_id=auth.uid()) with check (owner_user_id=auth.uid());
drop policy if exists omninet_owner_delete on public.omninet_documents;
create policy omninet_owner_delete on public.omninet_documents for delete using (owner_user_id=auth.uid());

drop policy if exists omninet_query_self on public.omninet_queries;
create policy omninet_query_self on public.omninet_queries for select using (user_id=auth.uid());

create or replace function public.omninet_search(q text, max_results integer default 20)
returns table(id uuid,title text,url text,summary text,source_type text,language text,published_at timestamptz,rank real)
language sql stable security definer set search_path=public as $$
  select d.id,d.title,d.url,d.summary,d.source_type,d.language,d.published_at,
    ts_rank(to_tsvector('simple',coalesce(d.title,'')||' '||coalesce(d.summary,'')||' '||coalesce(d.body_text,'')), plainto_tsquery('simple',q)) as rank
  from public.omninet_documents d
  where (d.visibility='public' or d.owner_user_id=auth.uid())
    and to_tsvector('simple',coalesce(d.title,'')||' '||coalesce(d.summary,'')||' '||coalesce(d.body_text,'')) @@ plainto_tsquery('simple',q)
  order by rank desc, d.published_at desc nulls last, d.created_at desc
  limit greatest(1,least(max_results,50));
$$;

grant execute on function public.omninet_search(text,integer) to authenticated;
