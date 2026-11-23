-- One live submission for the shared pilot reveal. Replays and concurrent tabs
-- cannot submit a second job. Ambiguous provider failures retain the reservation.
create table if not exists public.tryamm_reveal_reservations (
  shot text primary key check (shot = 'two-mics'),
  creator_id uuid not null,
  reserved_at timestamptz not null default now()
);
alter table public.tryamm_reveal_reservations enable row level security;
revoke all on public.tryamm_reveal_reservations from public, anon, authenticated;
grant select, insert on public.tryamm_reveal_reservations to service_role;
