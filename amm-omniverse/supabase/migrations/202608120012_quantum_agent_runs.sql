create table if not exists public.quantum_agent_runs (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete set null,
  agent_key text not null,
  task text not null,
  status text not null check (status in ('running','completed','failed','awaiting_approval','cancelled')),
  model text,
  response_id text,
  input_context jsonb not null default '{}'::jsonb,
  output_text text,
  error_text text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists quantum_agent_runs_user_created_idx on public.quantum_agent_runs(user_id,created_at desc);
alter table public.quantum_agent_runs enable row level security;
create policy if not exists quantum_agent_runs_read_own on public.quantum_agent_runs for select using (auth.uid()=user_id);
-- Writes are server-side through the service role only.
