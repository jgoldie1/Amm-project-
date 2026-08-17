create table if not exists public.domain_events(
 id text primary key,
 event_type text not null,
 aggregate_type text not null,
 aggregate_id text not null,
 idempotency_key text not null unique,
 payload jsonb not null default '{}'::jsonb,
 metadata jsonb not null default '{}'::jsonb,
 status text not null default 'pending' check(status in('pending','processed','failed')),
 attempts integer not null default 0,
 occurred_at timestamptz not null default now(),
 processed_at timestamptz,
 last_attempt_at timestamptz,
 last_error text
);
create index if not exists domain_events_aggregate_idx on public.domain_events(aggregate_type,aggregate_id,occurred_at desc);
create index if not exists domain_events_status_idx on public.domain_events(status,occurred_at);

create table if not exists public.outbox_messages(
 id text primary key,
 event_id text not null references public.domain_events(id) on delete cascade,
 topic text not null,
 destination text,
 payload jsonb not null default '{}'::jsonb,
 status text not null default 'pending' check(status in('pending','processing','sent','failed','dead-letter')),
 attempts integer not null default 0,
 next_attempt_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 sent_at timestamptz,
 last_error text
);
create index if not exists outbox_pending_idx on public.outbox_messages(status,next_attempt_at);

create table if not exists public.idempotency_keys(
 scope text not null,
 key text not null,
 request_hash text not null,
 response_status integer,
 response_body jsonb,
 created_at timestamptz not null default now(),
 expires_at timestamptz,
 primary key(scope,key)
);
create index if not exists idempotency_expiry_idx on public.idempotency_keys(expires_at);

alter table public.domain_events enable row level security;
alter table public.outbox_messages enable row level security;
alter table public.idempotency_keys enable row level security;
-- Server service-role only by default. Do not add public policies for financial/operational events.
