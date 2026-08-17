create extension if not exists vector;

create table if not exists public.quantum_media_assets(
 id uuid primary key default gen_random_uuid(),
 media_type text not null check(media_type in('image','video','audio','document','product','vehicle','world3d','model3d','livestream')),
 source_url text not null,canonical_url text not null,title text not null,description text not null default '',transcript text not null default '',ocr_text text not null default '',
 tags text[] not null default '{}',language text not null default 'und',mime_type text,duration_ms bigint,width int,height int,
 content_fingerprint text not null,perceptual_fingerprint text,source_type text not null,provenance jsonb not null default '{}'::jsonb,
 safety jsonb not null default '{"status":"unreviewed"}'::jsonb,captured_at timestamptz not null default now(),indexed_at timestamptz,
 search_vector tsvector generated always as (to_tsvector('simple',coalesce(title,'')||' '||coalesce(description,'')||' '||coalesce(transcript,'')||' '||coalesce(ocr_text,'')||' '||array_to_string(tags,' '))) stored,
 text_embedding vector(1536),image_embedding vector(1536),audio_embedding vector(1536),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(media_type,canonical_url,content_fingerprint));
create index if not exists quantum_media_fts_idx on public.quantum_media_assets using gin(search_vector);
create index if not exists quantum_media_text_hnsw on public.quantum_media_assets using hnsw(text_embedding vector_cosine_ops) where text_embedding is not null;
create index if not exists quantum_media_image_hnsw on public.quantum_media_assets using hnsw(image_embedding vector_cosine_ops) where image_embedding is not null;
create index if not exists quantum_media_audio_hnsw on public.quantum_media_assets using hnsw(audio_embedding vector_cosine_ops) where audio_embedding is not null;
create index if not exists quantum_media_type_idx on public.quantum_media_assets(media_type,captured_at desc);
alter table public.quantum_media_assets enable row level security;
create policy "approved media public read" on public.quantum_media_assets for select using((safety->>'status')='approved');

create table if not exists public.quantum_media_links(
 id uuid primary key default gen_random_uuid(),from_asset uuid not null references public.quantum_media_assets(id) on delete cascade,to_url text not null,relation text not null,confidence numeric not null default 0.5,metadata jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
create index if not exists quantum_media_links_from_idx on public.quantum_media_links(from_asset,relation);
alter table public.quantum_media_links enable row level security;

create or replace function public.quantum_multimodal_search(query_text text default '',query_embedding vector(1536) default null,query_image_embedding vector(1536) default null,query_audio_embedding vector(1536) default null,media_filter text default null,match_count int default 20)
returns table(id uuid,media_type text,source_url text,title text,description text,source_type text,captured_at timestamptz,provenance jsonb,score double precision)
language sql stable as $$
 select q.id,q.media_type,q.source_url,q.title,q.description,q.source_type,q.captured_at,q.provenance,
 greatest(
  case when query_text<>'' then ts_rank_cd(q.search_vector,websearch_to_tsquery('simple',query_text)) else 0 end,
  case when query_embedding is not null and q.text_embedding is not null then 1-(q.text_embedding<=>query_embedding) else 0 end,
  case when query_image_embedding is not null and q.image_embedding is not null then 1-(q.image_embedding<=>query_image_embedding) else 0 end,
  case when query_audio_embedding is not null and q.audio_embedding is not null then 1-(q.audio_embedding<=>query_audio_embedding) else 0 end
 )::double precision score
 from public.quantum_media_assets q
 where (q.safety->>'status')='approved' and (media_filter is null or q.media_type=media_filter)
 order by score desc,q.captured_at desc limit greatest(1,least(match_count,100));
$$;
