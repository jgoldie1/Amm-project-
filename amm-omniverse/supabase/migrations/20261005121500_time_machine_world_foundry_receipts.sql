-- Time Machine World Foundry authenticated build receipts.
-- Browser localStorage remains a cache; this table is the cross-device recovery record.

create table if not exists public.tryamm_time_machine_foundry_receipts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  era text not null default 'unspecified',
  mode text not null,
  truth_label text not null,
  source text not null,
  phase text not null default 'compiled',
  plan jsonb not null,
  preview_only boolean not null default true,
  production_mutation boolean not null default false,
  publish_allowed boolean not null default false,
  requires_human_review boolean not null default true,
  blockers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tryamm_time_machine_foundry_user_updated_idx
  on public.tryamm_time_machine_foundry_receipts(user_id,updated_at desc);

alter table public.tryamm_time_machine_foundry_receipts enable row level security;
revoke insert,update,delete on public.tryamm_time_machine_foundry_receipts from anon,authenticated;
grant select on public.tryamm_time_machine_foundry_receipts to authenticated;

drop policy if exists tryamm_time_machine_foundry_read_own on public.tryamm_time_machine_foundry_receipts;
create policy tryamm_time_machine_foundry_read_own
on public.tryamm_time_machine_foundry_receipts
for select to authenticated
using ((select auth.uid())=user_id);

comment on table public.tryamm_time_machine_foundry_receipts is
'Authenticated cross-device recovery receipts for Time Machine World Foundry preview plans. Production mutation and publishing remain separately approval/certification gated.';
