create table if not exists public.academy_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.academy_progress enable row level security;

drop policy if exists "academy progress select own" on public.academy_progress;
create policy "academy progress select own"
on public.academy_progress for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "academy progress insert own" on public.academy_progress;
create policy "academy progress insert own"
on public.academy_progress for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "academy progress delete own" on public.academy_progress;
create policy "academy progress delete own"
on public.academy_progress for delete to authenticated
using (auth.uid() = user_id);

create index if not exists academy_progress_user_completed_idx
  on public.academy_progress(user_id, completed_at desc);
