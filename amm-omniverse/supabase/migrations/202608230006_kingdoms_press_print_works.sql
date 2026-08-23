-- Kingdoms Press Print Works: physical-production specs, preflight, outside-printer sourcing, quotes and jobs.
-- Real printer submission remains provider-gated and requires explicit order approval.

create table if not exists public.print_editions (
  id uuid primary key default gen_random_uuid(), publication_id uuid not null references public.publications(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade, trim_size text not null default '6x9',
  binding text not null default 'paperback' check (binding in ('paperback','hardcover','coil','saddle-stitch')),
  paper text not null default 'white', interior_color text not null default 'bw' check (interior_color in ('bw','standard-color','premium-color')),
  bleed_mm numeric not null default 3 check (bleed_mm >= 0), page_count integer check (page_count is null or page_count > 0),
  isbn text, barcode_value text, cover_file_url text, interior_file_url text,
  preflight_status text not null default 'draft' check (preflight_status in ('draft','checking','passed','failed')),
  proof_status text not null default 'not-requested' check (proof_status in ('not-requested','requested','ready','approved','rejected')),
  provider_status text not null default 'unconnected' check (provider_status in ('unconnected','sandbox','connected')),
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(publication_id)
);
create table if not exists public.print_preflight_checks (
  id uuid primary key default gen_random_uuid(), edition_id uuid not null references public.print_editions(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade, check_key text not null,
  status text not null default 'pending' check (status in ('pending','passed','failed','warning')), details jsonb not null default '{}'::jsonb,
  checked_at timestamptz not null default now(), unique(edition_id,check_key)
);
create table if not exists public.print_jobs (
  id uuid primary key default gen_random_uuid(), edition_id uuid not null references public.print_editions(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade, job_type text not null default 'proof' check (job_type in ('proof','author-copies','customer-order','bulk')),
  provider_key text not null default 'simulation', provider_order_id text, quantity integer not null default 1 check (quantity > 0), currency text not null default 'USD',
  print_cost_cents integer check (print_cost_cents is null or print_cost_cents >= 0), shipping_cents integer check (shipping_cents is null or shipping_cents >= 0),
  retail_price_cents integer check (retail_price_cents is null or retail_price_cents >= 0),
  status text not null default 'draft' check (status in ('draft','quoted','awaiting-approval','submitted','printing','shipped','delivered','cancelled','failed')),
  shipping_address jsonb not null default '{}'::jsonb, tracking jsonb not null default '{}'::jsonb, provider_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.print_providers (
  id uuid primary key default gen_random_uuid(), provider_key text not null unique, name text not null, ownership_tags text[] not null default '{}', capabilities text[] not null default '{}',
  website text, service_area text[] not null default '{}', fulfillment boolean not null default false, pod boolean not null default false, api_available boolean not null default false,
  verification_status text not null default 'candidate' check (verification_status in ('candidate','verified','contracted','disabled')), notes text not null default '',
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.print_quote_requests (
  id uuid primary key default gen_random_uuid(), edition_id uuid not null references public.print_editions(id) on delete cascade, owner_id uuid not null references auth.users(id) on delete cascade,
  quantity integer not null check (quantity > 0), destination jsonb not null default '{}'::jsonb, requested_provider_keys text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','requested','partially-quoted','quoted','approved','expired','cancelled')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.print_quotes (
  id uuid primary key default gen_random_uuid(), request_id uuid not null references public.print_quote_requests(id) on delete cascade,
  provider_id uuid not null references public.print_providers(id) on delete restrict, owner_id uuid not null references auth.users(id) on delete cascade,
  currency text not null default 'USD', unit_cost_cents integer not null check (unit_cost_cents >= 0), setup_cost_cents integer not null default 0 check (setup_cost_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0), tax_cents integer not null default 0 check (tax_cents >= 0), turnaround_days integer check (turnaround_days is null or turnaround_days >= 0),
  expires_at timestamptz, provider_quote_ref text, quote_source text not null default 'manual' check (quote_source in ('manual','email','api','portal')),
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), unique(request_id,provider_id)
);

create index if not exists print_editions_owner_idx on public.print_editions(owner_id,updated_at desc);
create index if not exists print_preflight_edition_idx on public.print_preflight_checks(edition_id,checked_at desc);
create index if not exists print_jobs_edition_idx on public.print_jobs(edition_id,created_at desc);
create index if not exists print_jobs_owner_idx on public.print_jobs(owner_id,created_at desc);
create index if not exists print_quote_requests_owner_idx on public.print_quote_requests(owner_id,created_at desc);
create index if not exists print_quotes_request_idx on public.print_quotes(request_id,created_at desc);

alter table public.print_editions enable row level security;
alter table public.print_preflight_checks enable row level security;
alter table public.print_jobs enable row level security;
alter table public.print_providers enable row level security;
alter table public.print_quote_requests enable row level security;
alter table public.print_quotes enable row level security;

drop policy if exists "owners manage print editions" on public.print_editions;
create policy "owners manage print editions" on public.print_editions for all to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
drop policy if exists "owners manage print preflight" on public.print_preflight_checks;
create policy "owners manage print preflight" on public.print_preflight_checks for all to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
drop policy if exists "owners manage print jobs" on public.print_jobs;
create policy "owners manage print jobs" on public.print_jobs for all to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
drop policy if exists "authenticated read print providers" on public.print_providers;
create policy "authenticated read print providers" on public.print_providers for select to authenticated using (verification_status <> 'disabled');
drop policy if exists "owners manage print quote requests" on public.print_quote_requests;
create policy "owners manage print quote requests" on public.print_quote_requests for all to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
drop policy if exists "owners read print quotes" on public.print_quotes;
create policy "owners read print quotes" on public.print_quotes for select to authenticated using ((select auth.uid())=owner_id);

insert into public.print_providers(provider_key,name,ownership_tags,capabilities,website,service_area,fulfillment,pod,api_available,verification_status,notes,metadata)
values
('a-good-day-to-print','A Good Day to Print / BCP Digital Printing',array['black-owned','family-owned','union-certified'],array['book-printing','digital-printing','binding','short-runs','nationwide-shipping'],'https://www.agooddaytoprint.com',array['US'],true,true,false,'candidate','Primary Black-owned book-printing candidate. Verify partnership and current commercial terms before automatic ordering.',jsonb_build_object('sourcing_priority',1)),
('diversity-press','Diversity Press',array['black-owned','MBE'],array['commercial-printing','digital','offset','finishing','warehousing','kitting','shipping'],'https://diversity-press.com',array['US'],true,false,false,'candidate','Black-owned MBE candidate for larger runs and fulfillment; obtain book-specific quote/spec confirmation.',jsonb_build_object('sourcing_priority',2)),
('blackgold-publishing','BlackGold Publishing',array['black-owned','black-operated'],array['book-manufacturing','publishing','distribution','marketing'],'https://www.blackgoldpublishing.com',array['US'],true,false,false,'candidate','Bundled manufacturing/distribution candidate; compare bundled cost and rights terms separately from printer-only bids.',jsonb_build_object('sourcing_priority',3)),
('lulu','Lulu',array['fallback-network'],array['print-on-demand','book-printing','global-fulfillment','dropshipping'],'https://www.lulu.com',array['GLOBAL'],true,true,true,'candidate','Fallback POD/API candidate for one-off/global fulfillment.',jsonb_build_object('sourcing_priority',10)),
('ingramspark','IngramSpark',array['fallback-network'],array['print-on-demand','book-printing','global-distribution'],'https://www.ingramspark.com',array['GLOBAL'],true,true,false,'candidate','Fallback POD/distribution candidate.',jsonb_build_object('sourcing_priority',11))
on conflict(provider_key) do update set name=excluded.name,ownership_tags=excluded.ownership_tags,capabilities=excluded.capabilities,website=excluded.website,service_area=excluded.service_area,fulfillment=excluded.fulfillment,pod=excluded.pod,api_available=excluded.api_available,notes=excluded.notes,metadata=excluded.metadata,updated_at=now();
