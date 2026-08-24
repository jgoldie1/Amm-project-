create table if not exists public.family_financial_literacy_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_key text not null,
  status text not null default 'started' check (status in ('started','completed')),
  score integer check (score is null or (score between 0 and 100)),
  updated_at timestamptz not null default now(),
  primary key(user_id,lesson_key)
);
alter table public.family_financial_literacy_progress enable row level security;
drop policy if exists family_financial_progress_read_own on public.family_financial_literacy_progress;
create policy family_financial_progress_read_own on public.family_financial_literacy_progress for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists family_financial_progress_write_own on public.family_financial_literacy_progress;
create policy family_financial_progress_write_own on public.family_financial_literacy_progress for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

insert into public.system_convergence_status(service,status,environment,public_url,details,checked_at,updated_at)
values
 ('aniyah-studio','healthy','production','https://tryamm.online',jsonb_build_object('owner','FamilyLegacyHub','backend','/api/family/aniyah/audio','persistence','aniyah_audio_projects + aniyah_audio_tracks'),now(),now()),
 ('aniyah-crossborder','gated','production','https://tryamm.online',jsonb_build_object('owner','FamilyLegacyHub','backend','/api/family/aniyah/crossborder','moneyMovement','disabled','requirements',jsonb_build_array('licensed provider','KYC','AML','sanctions','approved corridors','human confirmation')),now(),now()),
 ('financial-literacy','healthy','production','https://tryamm.online',jsonb_build_object('owner','FamilyLegacyHub','persistence','family_financial_literacy_progress','scope','education only; not individualized financial advice'),now(),now()),
 ('isaiah-starverse','healthy','production','https://tryamm.online',jsonb_build_object('owner','FamilyLegacyHub','backend','/api/family/isaiah/starverse','brand','Anyone Can Be A Star'),now(),now()),
 ('isaiah-ai-tv','degraded','production','https://tryamm.online',jsonb_build_object('owner','OTTIsaiahTV','state','UI/OTT catalog present','blocker','recording/egress/storage/distribution providers still require production verification'),now(),now()),
 ('free-tv','degraded','production','https://tryamm.online',jsonb_build_object('owner','OTTIsaiahTV','freeLanes',jsonb_build_array('Showcase','Debate','Games','Music','Podcasts','LIVE Replays'),'blocker','licensed/owned content and publishing pipeline verification required'),now(),now())
on conflict(service) do update set status=excluded.status,environment=excluded.environment,public_url=excluded.public_url,details=excluded.details,checked_at=excluded.checked_at,updated_at=excluded.updated_at;
