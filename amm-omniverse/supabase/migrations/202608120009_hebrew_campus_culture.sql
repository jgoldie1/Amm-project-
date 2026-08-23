-- Hebrew-centered campus culture for All American University.
-- No Greek-letter fraternity/sorority model is used.

create table if not exists university_campus_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  organization_type text not null check (organization_type in ('house','tribe-circle','service-fellowship','mentorship-circle','academic-society','business-guild','arts-group','music-ensemble','research-circle','athletics-club','community-service')),
  description text,
  values jsonb not null default '{}'::jsonb,
  age_lanes text[] not null default '{}',
  faculty_advisor_user_id uuid references auth.users(id),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists university_campus_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references university_campus_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  status text not null default 'active',
  joined_at timestamptz not null default now(),
  unique(organization_id,user_id)
);

alter table university_campus_organizations enable row level security;
alter table university_campus_memberships enable row level security;

create policy if not exists university_campus_orgs_read on university_campus_organizations for select using (active = true);
create policy if not exists university_campus_memberships_self_read on university_campus_memberships for select using (user_id = auth.uid());
create policy if not exists university_campus_memberships_self_insert on university_campus_memberships for insert with check (user_id = auth.uid());
create policy if not exists university_campus_memberships_self_delete on university_campus_memberships for delete using (user_id = auth.uid());

insert into university_campus_organizations (name, organization_type, description, values, age_lanes)
values
 ('Judah House','house','Leadership, service, music, scholarship, entrepreneurship and community responsibility.', '{"principles":["service","wisdom","leadership","stewardship"]}'::jsonb, array['high','trade','certificate','associate','bachelor','master','doctorate','adult']),
 ('Scribes Academic Society','academic-society','Writing, publishing, languages, archives, research and Kingdoms Press collaboration.', '{"principles":["study","truthfulness","citation","preservation"]}'::jsonb, array['middle','high','college','adult']),
 ('Builders Business Guild','business-guild','Entrepreneurship, trades, logistics, AI Café operations and community wealth-building.', '{"principles":["work","stewardship","innovation","service"]}'::jsonb, array['high','trade','college','adult']),
 ('Psalmists Music & Arts Fellowship','arts-group','Music, performance, production, visual arts and cultural preservation.', '{"principles":["creativity","discipline","community"]}'::jsonb, array['k5','middle','high','college','adult']),
 ('Servants Community Fellowship','service-fellowship','Volunteer service, mentoring, food support, environmental restoration and neighborhood projects.', '{"principles":["service","care","responsibility"]}'::jsonb, array['k5','middle','high','college','adult']),
 ('STEM & Creation Research Circle','research-circle','AI, robotics, space, biosphere, engineering and Living Worlds research.', '{"principles":["inquiry","evidence","building","safety"]}'::jsonb, array['middle','high','college','adult'])
on conflict (name) do nothing;
