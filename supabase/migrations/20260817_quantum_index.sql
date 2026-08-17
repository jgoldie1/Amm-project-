-- TRYAMM Quantum Internet persistent search/index foundation
create extension if not exists vector;

create table if not exists public.quantum_documents (
  id uuid primary key default gen_random_uuid(),
  canonical_url text not null,
  source_url text not null,
  title text,
  body text not null default '',
  language text not null default 'und',
  source_type text not null default 'quantum-crawl',
  captured_at timestamptz not null default now(),
  indexed_at timestamptz not null default now(),
  content_hash text not null,
  provenance jsonb not null default '{}'::jsonb,
  safety jsonb not null default '{"status":"unreviewed"}'::jsonb,
  search_vector tsvector generated always as (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(body,''))) stored,
  embedding vector(1536),
  unique(canonical_url, content_hash)
);

create index if not exists quantum_documents_search_gin on public.quantum_documents using gin(search_vector);
create index if not exists quantum_documents_url_time on public.quantum_documents(canonical_url, captured_at desc);
create index if not exists quantum_documents_source_time on public.quantum_documents(source_type, captured_at desc);
create index if not exists quantum_documents_embedding_hnsw on public.quantum_documents using hnsw (embedding vector_cosine_ops) where embedding is not null;

create table if not exists public.quantum_links (
  source_document_id uuid not null references public.quantum_documents(id) on delete cascade,
  target_url text not null,
  rel text,
  anchor_text text,
  created_at timestamptz not null default now(),
  primary key(source_document_id, target_url)
);

create table if not exists public.quantum_entities (
  id uuid primary key default gen_random_uuid(),
  normalized_name text not null,
  entity_type text not null default 'unknown',
  aliases text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  unique(normalized_name, entity_type)
);

create table if not exists public.quantum_document_entities (
  document_id uuid not null references public.quantum_documents(id) on delete cascade,
  entity_id uuid not null references public.quantum_entities(id) on delete cascade,
  confidence real not null default 0.5 check(confidence >= 0 and confidence <= 1),
  primary key(document_id, entity_id)
);

alter table public.quantum_documents enable row level security;
alter table public.quantum_links enable row level security;
alter table public.quantum_entities enable row level security;
alter table public.quantum_document_entities enable row level security;

-- Search results are public only after safety review. Crawler/index writes use a server-side service role.
create policy "public can read approved quantum documents" on public.quantum_documents for select using ((safety->>'status') = 'approved');
create policy "public can read entities" on public.quantum_entities for select using (true);

create or replace function public.quantum_hybrid_search(
  query_text text,
  query_embedding vector(1536) default null,
  match_count integer default 20
) returns table (
  id uuid, canonical_url text, source_url text, title text, body text,
  source_type text, captured_at timestamptz, lexical_score real, semantic_score real
) language sql stable as $$
  with ranked as (
    select d.*,
      ts_rank_cd(d.search_vector, websearch_to_tsquery('simple', query_text))::real lexical_score,
      case when query_embedding is null or d.embedding is null then 0::real
           else (1 - (d.embedding <=> query_embedding))::real end semantic_score
    from public.quantum_documents d
    where (d.safety->>'status') = 'approved'
      and (d.search_vector @@ websearch_to_tsquery('simple', query_text) or query_embedding is not null)
  )
  select id, canonical_url, source_url, title, body, source_type, captured_at, lexical_score, semantic_score
  from ranked
  order by (lexical_score * 0.55 + semantic_score * 0.45) desc, captured_at desc
  limit greatest(1, least(match_count, 100));
$$;
