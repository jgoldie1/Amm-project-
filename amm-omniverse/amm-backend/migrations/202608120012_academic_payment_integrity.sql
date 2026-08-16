-- Academic and payment integrity hardening.

-- Student education stage/program status must be controlled by trusted backend workflows,
-- not direct browser writes. Students retain read access to their own SIS profile.
drop policy if exists university_students_self_insert on public.university_students;
drop policy if exists university_students_self_update on public.university_students;

-- Stripe retries are normal; event processing must be idempotent so token balances and
-- other side effects are not applied twice.
create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  status text not null default 'processing' check (status in ('processing','processed','failed')),
  attempts integer not null default 1,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  processed_at timestamptz
);

alter table public.stripe_webhook_events enable row level security;
-- No client policies: service-role backend only.
