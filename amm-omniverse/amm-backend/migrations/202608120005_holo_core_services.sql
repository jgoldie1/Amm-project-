create extension if not exists pgcrypto;

create table if not exists holo_identity_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  age_lane text not null default 'adult' check (age_lane in ('child','teen','adult')),
  accessibility jsonb not null default '{}'::jsonb,
  permissions jsonb not null default '{}'::jsonb,
  credentials jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists holo_work_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  headline text,
  skills jsonb not null default '{}'::jsonb,
  career_goals jsonb not null default '[]'::jsonb,
  availability jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists holo_work_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_type text not null,
  title text not null,
  status text not null default 'open' check (status in ('open','active','completed','cancelled')),
  source text not null default 'workforce',
  payload jsonb not null default '{}'::jsonb,
  score numeric,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists holo_wellness_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  goals jsonb not null default '[]'::jsonb,
  preferences jsonb not null default '{}'::jsonb,
  disclaimer_acknowledged boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists holo_wellness_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null,
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  intensity text,
  notes text,
  wellness_score numeric,
  created_at timestamptz not null default now()
);

create table if not exists holo_courses (
  id uuid primary key default gen_random_uuid(),
  course_key text unique not null,
  title text not null,
  description text,
  audience text not null default 'all',
  status text not null default 'published',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists holo_course_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references holo_courses(id) on delete cascade,
  progress numeric not null default 0 check (progress between 0 and 100),
  status text not null default 'enrolled' check (status in ('enrolled','active','completed')),
  credential jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(user_id, course_id)
);

create table if not exists holo_creator_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_type text not null check (project_type in ('video','music','game','book','world','app','agent','other')),
  title text not null,
  status text not null default 'draft' check (status in ('draft','building','testing','published','archived')),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists holo_metric_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  metric_key text not null,
  scope text not null default 'platform',
  value numeric not null default 1,
  dimensions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists holo_payment_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'stripe',
  purpose text not null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd',
  status text not null default 'requires_confirmation' check (status in ('requires_confirmation','checkout_created','paid','failed','cancelled')),
  provider_session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table holo_identity_profiles enable row level security;
alter table holo_work_profiles enable row level security;
alter table holo_work_tasks enable row level security;
alter table holo_wellness_profiles enable row level security;
alter table holo_wellness_sessions enable row level security;
alter table holo_courses enable row level security;
alter table holo_course_enrollments enable row level security;
alter table holo_creator_projects enable row level security;
alter table holo_metric_events enable row level security;
alter table holo_payment_intents enable row level security;

create policy if not exists "identity own row" on holo_identity_profiles for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy if not exists "work profile own row" on holo_work_profiles for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy if not exists "work tasks own rows" on holo_work_tasks for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy if not exists "wellness profile own row" on holo_wellness_profiles for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy if not exists "wellness sessions own rows" on holo_wellness_sessions for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy if not exists "courses readable" on holo_courses for select using (status='published');
create policy if not exists "enrollment own rows" on holo_course_enrollments for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy if not exists "creator project own rows" on holo_creator_projects for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy if not exists "metrics own insert" on holo_metric_events for insert with check (auth.uid()=user_id or user_id is null);
create policy if not exists "metrics own read" on holo_metric_events for select using (auth.uid()=user_id);
create policy if not exists "payment intent own rows" on holo_payment_intents for select using (auth.uid()=user_id);

insert into holo_courses(course_key,title,description,audience,metadata) values
('career-logistics-101','Holo Logistics Foundations','Dispatch, warehouse, routing and supply-chain fundamentals.','teen-adult','{"pathway":"logistics"}'::jsonb),
('creator-studio-101','Holo Creator Studio','Plan, build, test and publish multimedia projects.','all','{"pathway":"creator"}'::jsonb),
('business-ops-101','Holo Business Operations','Pricing, inventory, service, analytics and operations.','teen-adult','{"pathway":"business"}'::jsonb),
('wellness-basics','Holo Wellness Basics','General movement, recovery, hydration and healthy-habit education. Not medical care.','all','{"pathway":"wellness"}'::jsonb)
on conflict(course_key) do nothing;
