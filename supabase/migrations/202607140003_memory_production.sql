create table if not exists public.ai_memory_audit (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  memory_id uuid references public.ai_memories(id) on delete set null,
  action text not null,
  request_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_memory_evaluations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  memory_id uuid references public.ai_memories(id) on delete cascade,
  evaluation_type text not null,
  score numeric not null default 0 check (score between 0 and 1),
  passed boolean not null default false,
  findings jsonb not null default '[]'::jsonb,
  model text,
  created_at timestamptz not null default now()
);

create index if not exists ai_memory_audit_owner_created_idx on public.ai_memory_audit(owner_id,created_at desc);
create index if not exists ai_memory_eval_owner_created_idx on public.ai_memory_evaluations(owner_id,created_at desc);
create index if not exists ai_memories_embedding_idx on public.ai_memories using ivfflat (embedding vector_cosine_ops) with (lists=100);

alter table public.ai_memory_audit enable row level security;
alter table public.ai_memory_evaluations enable row level security;

create policy "Users read own memory audit" on public.ai_memory_audit
for select using (owner_id=auth.uid());

create policy "Users read own memory evaluations" on public.ai_memory_evaluations
for select using (owner_id=auth.uid());

create or replace function public.match_ai_memories(
  query_embedding vector(1536),
  match_owner uuid,
  match_count int default 8,
  minimum_similarity float default 0.25
)
returns table (
  id uuid,
  owner_id uuid,
  subject_type text,
  subject_id text,
  tier text,
  title text,
  content text,
  facts jsonb,
  tags text[],
  source_ids text[],
  confidence numeric,
  importance numeric,
  visibility text,
  consent boolean,
  status text,
  expires_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  similarity float
)
language sql stable security invoker as $$
  select m.id,m.owner_id,m.subject_type,m.subject_id,m.tier,m.title,m.content,m.facts,m.tags,m.source_ids,
         m.confidence,m.importance,m.visibility,m.consent,m.status,m.expires_at,m.created_at,m.updated_at,
         1-(m.embedding <=> query_embedding) as similarity
  from public.ai_memories m
  where m.owner_id=match_owner
    and m.status='active'
    and m.embedding is not null
    and (m.expires_at is null or m.expires_at>now())
    and 1-(m.embedding <=> query_embedding)>=minimum_similarity
  order by m.embedding <=> query_embedding
  limit greatest(1,least(match_count,30));
$$;

create or replace function public.cleanup_ai_memories(target_owner uuid)
returns jsonb
language plpgsql security invoker as $$
declare
  expired_count integer;
  stale_working_count integer;
begin
  update public.ai_memories
  set status='forgotten',content='[EXPIRED]',facts='[]'::jsonb,tags='{}',embedding=null,updated_at=now()
  where owner_id=target_owner and status='active' and expires_at is not null and expires_at<=now();
  get diagnostics expired_count=row_count;

  update public.ai_memories
  set status='forgotten',content='[RETENTION EXPIRED]',facts='[]'::jsonb,tags='{}',embedding=null,updated_at=now()
  where owner_id=target_owner and status='active' and tier='working' and updated_at<now()-interval '30 days';
  get diagnostics stale_working_count=row_count;

  return jsonb_build_object('expired',expired_count,'staleWorking',stale_working_count);
end;
$$;
