-- PREPRODUCTION: review, backup and apply to an isolated Supabase environment first.
-- Server-only service_role access; do not expose this data to browser/API roles.
create table if not exists public.quantum_mail_accounts (
 id uuid primary key default gen_random_uuid(),
 owner_id text not null,
 domain text not null,
 address text not null,
 provider text not null default 'resend',
 verified_at timestamptz,
 incoming_enabled boolean not null default false,
 outgoing_enabled boolean not null default false,
 status text not null default 'pending' check (status in ('pending','verified','disabled')),
 created_at timestamptz not null default now(),
 unique (address)
);
create index if not exists quantum_mail_accounts_owner_idx on public.quantum_mail_accounts(owner_id);

create table if not exists public.quantum_mail_messages (
 id uuid primary key default gen_random_uuid(),
 owner_id text not null,
 account_id uuid references public.quantum_mail_accounts(id),
 direction text not null check(direction in ('draft','outbound','inbound')),
 status text not null check(status in ('draft','sending','sent','delivered','bounced','complained','received','failed','quarantined')),
 from_address text,
 to_addresses text[] not null default '{}',
 subject text not null default '',
 body_text text not null default '',
 provider_message_id text unique,
 provider_event_id text unique,
 threat_status text not null default 'unreviewed' check(threat_status in ('unreviewed','quarantined','reviewed')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists quantum_mail_messages_owner_idx on public.quantum_mail_messages(owner_id,created_at desc);
create index if not exists quantum_mail_messages_account_idx on public.quantum_mail_messages(account_id,created_at desc);

alter table public.quantum_mail_accounts enable row level security;
alter table public.quantum_mail_messages enable row level security;
revoke all on public.quantum_mail_accounts from public,anon,authenticated;
revoke all on public.quantum_mail_messages from public,anon,authenticated;
grant select,insert,update on public.quantum_mail_accounts to service_role;
grant select,insert,update on public.quantum_mail_messages to service_role;
-- Backups: daily encrypted database backup, restore rehearsal and retention policy
-- must be separately verified. A database table is not itself a backup.
-- Provider inbound webhook must use signature verification, deduplication, spam
-- triage and tenant/account mapping before inserting received messages.

create table if not exists public.quantum_mail_suppressions (
 id uuid primary key default gen_random_uuid(),
 owner_id text not null,
 account_id uuid not null references public.quantum_mail_accounts(id),
 recipient text not null,
 reason text not null check (reason in ('hard-bounce','complaint','abuse-review')),
 created_at timestamptz not null default now(),
 unique (account_id,recipient)
);
create index if not exists quantum_mail_suppressions_owner_idx on public.quantum_mail_suppressions(owner_id,account_id);
alter table public.quantum_mail_suppressions enable row level security;
revoke all on public.quantum_mail_suppressions from public,anon,authenticated;
grant select,insert on public.quantum_mail_suppressions to service_role;
