create table if not exists public.quantum_time_documents (
  id uuid primary key default gen_random_uuid(),
  canonical_url text not null,
  source_url text not null,
  source_type text not null check (source_type in ('internet-archive','common-crawl','current','tryamm','manual')),
  captured_at timestamptz not null,
  archive_timestamp text,
  title text,
  description text,
  content_excerpt text not null default '',
  content_hash text not null,
  business_name text,
  ad_signals jsonb not null default '[]'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  verification_status text not null default 'source-capture',
  supersedes uuid references public.quantum_time_documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (canonical_url, source_type, captured_at)
);

create index if not exists quantum_time_documents_url_time_idx
  on public.quantum_time_documents (canonical_url, captured_at desc);

create index if not exists quantum_time_documents_hash_idx
  on public.quantum_time_documents (content_hash);

create index if not exists quantum_time_documents_business_time_idx
  on public.quantum_time_documents (business_name, captured_at desc)
  where business_name is not null;

alter table public.quantum_time_documents enable row level security;

revoke all on table public.quantum_time_documents from anon, authenticated;
grant select, insert, update, delete on table public.quantum_time_documents to service_role;

comment on table public.quantum_time_documents is
  'Server-managed provenance index for TRYAMM Quantum Time historical web captures. No claim of complete Internet history; rows represent observed archive captures only.';
