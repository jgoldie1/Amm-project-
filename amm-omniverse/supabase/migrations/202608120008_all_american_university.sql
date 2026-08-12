-- All American University & Academy: Pre-K through doctoral/professional education.
-- New institution software includes an HBCU-inspired/Black-serving division and HBCU partnership network.
-- It does not claim federal HBCU designation; eligibility/designation must come from an institution that meets federal law.

create extension if not exists pgcrypto;

create table if not exists university_students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  student_number text unique,
  education_stage text not null default 'adult' check (education_stage in ('prek','k5','middle','high','trade','certificate','associate','bachelor','master','doctorate','professional','continuing','adult')),
  program_code text,
  academic_status text not null default 'active',
  advisor_user_id uuid references auth.users(id),
  expected_completion date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists university_faculty (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  employee_number text unique,
  role text not null default 'instructor',
  departments text[] not null default '{}',
  credentials jsonb not null default '[]'::jsonb,
  verified boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists university_programs (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  level text not null,
  school text not null,
  description text,
  credit_hours numeric,
  credential_type text,
  accreditation_status text not null default 'not_accredited',
  regulatory_notes text,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists university_courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  school text,
  level text,
  credit_hours numeric not null default 0,
  prerequisites text[] not null default '{}',
  minimum_age_lane text,
  delivery_modes text[] not null default array['online'],
  syllabus jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists university_sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references university_courses(id) on delete cascade,
  faculty_id uuid references university_faculty(id),
  term text not null,
  section_code text not null,
  capacity integer not null default 30,
  schedule jsonb not null default '{}'::jsonb,
  modality text not null default 'online',
  location text,
  unique(course_id, term, section_code)
);

create table if not exists university_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references university_students(id) on delete cascade,
  section_id uuid not null references university_sections(id) on delete cascade,
  status text not null default 'enrolled',
  final_grade text,
  final_percent numeric,
  credits_attempted numeric not null default 0,
  credits_earned numeric not null default 0,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(student_id, section_id)
);

create table if not exists university_attendance (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references university_enrollments(id) on delete cascade,
  meeting_date date not null,
  status text not null check (status in ('present','absent','excused','late','remote','activity-complete')),
  minutes_present integer,
  notes text,
  unique(enrollment_id, meeting_date)
);

create table if not exists university_assignments (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references university_sections(id) on delete cascade,
  title text not null,
  assignment_type text not null default 'assignment',
  instructions text,
  points_possible numeric not null default 100,
  due_at timestamptz,
  integrity_mode text not null default 'standard',
  accommodations_supported boolean not null default true,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists university_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references university_assignments(id) on delete cascade,
  student_id uuid not null references university_students(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  content jsonb not null default '{}'::jsonb,
  score numeric,
  feedback text,
  graded_by uuid references auth.users(id),
  integrity_result jsonb not null default '{}'::jsonb,
  attempt integer not null default 1,
  unique(assignment_id, student_id, attempt)
);

create table if not exists university_exams (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references university_sections(id) on delete cascade,
  title text not null,
  exam_type text not null default 'exam',
  starts_at timestamptz,
  ends_at timestamptz,
  time_limit_minutes integer,
  proctoring_policy text not null default 'none',
  question_bank jsonb not null default '[]'::jsonb,
  accessibility_options jsonb not null default '{}'::jsonb
);

create table if not exists university_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references university_exams(id) on delete cascade,
  student_id uuid not null references university_students(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score numeric,
  responses jsonb not null default '{}'::jsonb,
  integrity_flags jsonb not null default '[]'::jsonb
);

create table if not exists university_guardians (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references university_students(id) on delete cascade,
  guardian_user_id uuid not null references auth.users(id) on delete cascade,
  relationship text not null,
  permissions jsonb not null default '{"view_progress":true,"approve_purchases":false,"approve_publication":false}'::jsonb,
  verified boolean not null default false,
  unique(student_id, guardian_user_id)
);

create table if not exists university_accommodations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references university_students(id) on delete cascade,
  accommodation_type text not null,
  approved_by uuid references auth.users(id),
  details jsonb not null default '{}'::jsonb,
  starts_on date,
  ends_on date,
  status text not null default 'active'
);

create table if not exists university_credentials (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references university_students(id) on delete cascade,
  credential_type text not null,
  title text not null,
  issuer_name text not null default 'All American University & Academy',
  program_id uuid references university_programs(id),
  status text not null default 'issued',
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  verification_code text unique default encode(gen_random_bytes(12),'hex'),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists university_transcript_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references university_students(id) on delete cascade,
  course_code text not null,
  course_title text not null,
  term text not null,
  credits numeric not null default 0,
  grade text,
  grade_points numeric,
  source text not null default 'all-american-university',
  verified boolean not null default true,
  unique(student_id, course_code, term)
);

create table if not exists university_portfolio_items (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references university_students(id) on delete cascade,
  title text not null,
  item_type text not null,
  artifact_url text,
  description text,
  skills text[] not null default '{}',
  visibility text not null default 'private',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists university_library_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  item_type text not null,
  creator text,
  subject_tags text[] not null default '{}',
  access_url text,
  rights_status text not null default 'licensed',
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists university_support_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references university_students(id) on delete cascade,
  provider_user_id uuid references auth.users(id),
  service_type text not null check (service_type in ('tutoring','academic-advising','career-advising','financial-aid-guidance','mentoring','accessibility-support','counseling-referral')),
  scheduled_at timestamptz,
  status text not null default 'scheduled',
  notes jsonb not null default '{}'::jsonb
);

create table if not exists university_labs (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  lab_type text not null,
  location text,
  capacity integer,
  safety_requirements jsonb not null default '{}'::jsonb,
  virtual_lab_url text,
  active boolean not null default true
);

create table if not exists university_equipment (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid references university_labs(id) on delete set null,
  asset_tag text not null unique,
  name text not null,
  equipment_type text,
  status text not null default 'available',
  certification_required text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists university_lab_reservations (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid not null references university_labs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  purpose text,
  status text not null default 'reserved'
);

create table if not exists university_employers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  website text,
  verified boolean not null default false,
  partnership_type text[] not null default '{}',
  contact jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists university_opportunities (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid references university_employers(id) on delete cascade,
  title text not null,
  opportunity_type text not null check (opportunity_type in ('internship','apprenticeship','co-op','job','research','service-learning','clinical-partner','externship')),
  description text,
  requirements jsonb not null default '{}'::jsonb,
  starts_on date,
  ends_on date,
  active boolean not null default true
);

create table if not exists university_opportunity_applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references university_opportunities(id) on delete cascade,
  student_id uuid not null references university_students(id) on delete cascade,
  status text not null default 'submitted',
  submitted_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique(opportunity_id, student_id)
);

create table if not exists university_alumni (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  graduation_year integer,
  credentials jsonb not null default '[]'::jsonb,
  mentorship_available boolean not null default false,
  career_profile jsonb not null default '{}'::jsonb,
  giving_preferences jsonb not null default '{}'::jsonb
);

create table if not exists university_hbcu_partners (
  id uuid primary key default gen_random_uuid(),
  institution_name text not null unique,
  official_hbcu boolean not null default false,
  federal_designation_verified boolean not null default false,
  partnership_status text not null default 'prospect',
  partnership_areas text[] not null default '{}',
  articulation_terms jsonb not null default '{}'::jsonb,
  research_terms jsonb not null default '{}'::jsonb,
  contact jsonb not null default '{}'::jsonb,
  notes text
);

create table if not exists university_black_excellence_programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  program_type text not null,
  description text,
  focus_areas text[] not null default '{}',
  partner_hbcu_id uuid references university_hbcu_partners(id) on delete set null,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb
);

-- Academic integrity review records keep automated signals separate from human determinations.
create table if not exists university_integrity_cases (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references university_students(id) on delete cascade,
  source_type text not null,
  source_id uuid,
  automated_signals jsonb not null default '{}'::jsonb,
  status text not null default 'needs_review',
  reviewed_by uuid references auth.users(id),
  determination text,
  notes text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- Basic RLS: students own their records; faculty/admin workflows should use server-side service role and explicit authorization.
do $$
declare t text;
begin
  foreach t in array array[
    'university_students','university_enrollments','university_attendance','university_submissions','university_exam_attempts',
    'university_guardians','university_accommodations','university_credentials','university_transcript_entries','university_portfolio_items',
    'university_support_sessions','university_lab_reservations','university_opportunity_applications','university_alumni','university_integrity_cases'
  ] loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

create policy if not exists university_students_self_select on university_students for select using (user_id = auth.uid());
create policy if not exists university_students_self_insert on university_students for insert with check (user_id = auth.uid());
create policy if not exists university_students_self_update on university_students for update using (user_id = auth.uid());

-- Public/catalog-facing tables: authenticated users may read active curriculum/resources/partners.
alter table university_programs enable row level security;
alter table university_courses enable row level security;
alter table university_sections enable row level security;
alter table university_library_items enable row level security;
alter table university_labs enable row level security;
alter table university_employers enable row level security;
alter table university_opportunities enable row level security;
alter table university_hbcu_partners enable row level security;
alter table university_black_excellence_programs enable row level security;

create policy if not exists university_programs_read on university_programs for select using (active = true);
create policy if not exists university_courses_read on university_courses for select using (active = true);
create policy if not exists university_sections_read on university_sections for select using (true);
create policy if not exists university_library_read on university_library_items for select using (auth.uid() is not null);
create policy if not exists university_labs_read on university_labs for select using (active = true);
create policy if not exists university_employers_read on university_employers for select using (verified = true);
create policy if not exists university_opportunities_read on university_opportunities for select using (active = true);
create policy if not exists university_hbcu_partners_read on university_hbcu_partners for select using (partnership_status in ('active','signed','developing'));
create policy if not exists university_black_excellence_read on university_black_excellence_programs for select using (active = true);

insert into university_programs (code,name,level,school,credential_type,description,accreditation_status,regulatory_notes)
values
 ('AAU-PREK','Early Learning & Discovery','prek','All American Academy','learning-record','Play-based literacy, numeracy, arts, science and social development.','not_accredited','Program delivery must comply with applicable early-childhood licensing and education requirements.'),
 ('AAU-K12','K-12 College & Career Academy','k12','All American Academy','diploma-pathway','Standards-aligned academics, Living Worlds labs, arts, STEM and career exploration.','not_accredited','A high-school diploma may only be issued when applicable state authorization/accreditation requirements are satisfied.'),
 ('AAU-TRADE','Trade & Technical Institute','trade','School of Trades & Workforce','certificate','Logistics, warehousing, skilled trades, drones, culinary, manufacturing, IT and other career pathways.','not_accredited','Programs leading to regulated occupations must meet applicable licensing/certification rules.'),
 ('AAU-CERT','Professional Certificate Academy','certificate','School of Professional Studies','certificate','Stackable workforce and technology credentials.','not_accredited','Internal certificates are not represented as state licenses or externally accredited credentials unless separately approved.'),
 ('AAU-BS-AI','AI & Intelligent Systems','bachelor','School of AI, Computing & Robotics','bachelor','AI, software, robotics, data, ethics and applied labs.','not_accredited','Degree-granting authority/accreditation required before marketing or awarding an accredited bachelor degree.'),
 ('AAU-MS-AI','Advanced AI & Autonomous Systems','master','Graduate School','master','Advanced AI, agents, robotics, safety, evaluation and research.','not_accredited','Degree-granting authority/accreditation required before marketing or awarding an accredited master degree.'),
 ('AAU-PHD-AI','AI Systems & Living Worlds Research','doctorate','Graduate School','phd','Research pathway spanning AI, simulation, holography, logistics, education and Living Worlds.','not_accredited','Doctoral degree authority/accreditation required before marketing or awarding a PhD.')
on conflict (code) do nothing;

insert into university_black_excellence_programs (name,program_type,description,focus_areas)
values
 ('Black Excellence & HBCU Partnership Center','partnership-center','HBCU-inspired Black-serving academic, cultural, research, entrepreneurship and mentorship center; formal HBCU status remains with federally eligible institutions.',array['HBCU partnerships','Black history','STEM','arts','entrepreneurship','research','mentorship','alumni','scholarships']),
 ('Black Innovation & Entrepreneurship Lab','innovation-lab','Student and faculty venture development connecting AI Café, Holo Creator, Holo Work and marketplace tools.',array['entrepreneurship','AI','business','creator economy','community wealth']),
 ('Diaspora History & Culture Institute','academic-center','Black history, African diaspora, archives, music, literature and global cultural research.',array['history','culture','archives','music','publishing'])
on conflict do nothing;
