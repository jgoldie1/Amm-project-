-- All American University & Academy production-safe schema for PostgreSQL 17 / Supabase.
-- Software/runtime only. Accreditation, degree authority, professional licensure and official HBCU designation remain external approval gates.
create extension if not exists pgcrypto;

create table if not exists public.university_students (
  id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade,
  student_number text unique, education_stage text not null default 'adult' check (education_stage in ('prek','k5','middle','high','trade','certificate','associate','bachelor','master','doctorate','professional','continuing','adult')),
  program_code text, academic_status text not null default 'active', advisor_user_id uuid references auth.users(id), expected_completion date,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.university_faculty (
  id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade, employee_number text unique,
  role text not null default 'instructor', departments text[] not null default '{}', credentials jsonb not null default '[]'::jsonb,
  verified boolean not null default false, status text not null default 'active', created_at timestamptz not null default now()
);
create table if not exists public.university_programs (
  id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, level text not null, school text not null, description text,
  credit_hours numeric, credential_type text, accreditation_status text not null default 'not_accredited', regulatory_notes text,
  active boolean not null default true, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.university_courses (
  id uuid primary key default gen_random_uuid(), code text not null unique, title text not null, description text, school text, level text,
  credit_hours numeric not null default 0, prerequisites text[] not null default '{}', minimum_age_lane text,
  delivery_modes text[] not null default array['online'], syllabus jsonb not null default '{}'::jsonb, active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.university_sections (
  id uuid primary key default gen_random_uuid(), course_id uuid not null references public.university_courses(id) on delete cascade,
  faculty_id uuid references public.university_faculty(id), term text not null, section_code text not null, capacity integer not null default 30,
  schedule jsonb not null default '{}'::jsonb, modality text not null default 'online', location text, unique(course_id,term,section_code)
);
create table if not exists public.university_enrollments (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.university_students(id) on delete cascade,
  section_id uuid not null references public.university_sections(id) on delete cascade, status text not null default 'enrolled', final_grade text, final_percent numeric,
  credits_attempted numeric not null default 0, credits_earned numeric not null default 0, enrolled_at timestamptz not null default now(), completed_at timestamptz,
  unique(student_id,section_id)
);
create table if not exists public.university_attendance (
  id uuid primary key default gen_random_uuid(), enrollment_id uuid not null references public.university_enrollments(id) on delete cascade,
  meeting_date date not null, status text not null check (status in ('present','absent','excused','late','remote','activity-complete')),
  minutes_present integer, notes text, unique(enrollment_id,meeting_date)
);
create table if not exists public.university_assignments (
  id uuid primary key default gen_random_uuid(), section_id uuid not null references public.university_sections(id) on delete cascade,
  title text not null, assignment_type text not null default 'assignment', instructions text, points_possible numeric not null default 100,
  due_at timestamptz, integrity_mode text not null default 'standard', accommodations_supported boolean not null default true, metadata jsonb not null default '{}'::jsonb
);
create table if not exists public.university_submissions (
  id uuid primary key default gen_random_uuid(), assignment_id uuid not null references public.university_assignments(id) on delete cascade,
  student_id uuid not null references public.university_students(id) on delete cascade, submitted_at timestamptz not null default now(), content jsonb not null default '{}'::jsonb,
  score numeric, feedback text, graded_by uuid references auth.users(id), integrity_result jsonb not null default '{}'::jsonb, attempt integer not null default 1,
  unique(assignment_id,student_id,attempt)
);
create table if not exists public.university_exams (
  id uuid primary key default gen_random_uuid(), section_id uuid not null references public.university_sections(id) on delete cascade,
  title text not null, exam_type text not null default 'exam', starts_at timestamptz, ends_at timestamptz, time_limit_minutes integer,
  proctoring_policy text not null default 'none', question_bank jsonb not null default '[]'::jsonb, accessibility_options jsonb not null default '{}'::jsonb
);
create table if not exists public.university_exam_attempts (
  id uuid primary key default gen_random_uuid(), exam_id uuid not null references public.university_exams(id) on delete cascade,
  student_id uuid not null references public.university_students(id) on delete cascade, started_at timestamptz not null default now(), submitted_at timestamptz,
  score numeric, responses jsonb not null default '{}'::jsonb, integrity_flags jsonb not null default '[]'::jsonb
);
create table if not exists public.university_guardians (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.university_students(id) on delete cascade,
  guardian_user_id uuid not null references auth.users(id) on delete cascade, relationship text not null,
  permissions jsonb not null default '{"view_progress":true,"approve_purchases":false,"approve_publication":false}'::jsonb,
  verified boolean not null default false, unique(student_id,guardian_user_id)
);
create table if not exists public.university_accommodations (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.university_students(id) on delete cascade,
  accommodation_type text not null, approved_by uuid references auth.users(id), details jsonb not null default '{}'::jsonb,
  starts_on date, ends_on date, status text not null default 'active'
);
create table if not exists public.university_credentials (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.university_students(id) on delete cascade,
  credential_type text not null, title text not null, issuer_name text not null default 'All American University & Academy',
  program_id uuid references public.university_programs(id), status text not null default 'issued', issued_at timestamptz not null default now(), expires_at timestamptz,
  verification_code text unique default encode(gen_random_bytes(12),'hex'), metadata jsonb not null default '{}'::jsonb
);
create table if not exists public.university_transcript_entries (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.university_students(id) on delete cascade,
  course_code text not null, course_title text not null, term text not null, credits numeric not null default 0, grade text, grade_points numeric,
  source text not null default 'all-american-university', verified boolean not null default true, unique(student_id,course_code,term)
);
create table if not exists public.university_portfolio_items (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.university_students(id) on delete cascade,
  title text not null, item_type text not null, artifact_url text, description text, skills text[] not null default '{}', visibility text not null default 'private',
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.university_library_items (
  id uuid primary key default gen_random_uuid(), title text not null, item_type text not null, creator text, subject_tags text[] not null default '{}', access_url text,
  rights_status text not null default 'licensed', metadata jsonb not null default '{}'::jsonb
);
create table if not exists public.university_support_sessions (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.university_students(id) on delete cascade,
  provider_user_id uuid references auth.users(id), service_type text not null check (service_type in ('tutoring','academic-advising','career-advising','financial-aid-guidance','mentoring','accessibility-support','counseling-referral')),
  scheduled_at timestamptz, status text not null default 'scheduled', notes jsonb not null default '{}'::jsonb
);
create table if not exists public.university_labs (
  id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, lab_type text not null, location text, capacity integer,
  safety_requirements jsonb not null default '{}'::jsonb, virtual_lab_url text, active boolean not null default true
);
create table if not exists public.university_equipment (
  id uuid primary key default gen_random_uuid(), lab_id uuid references public.university_labs(id) on delete set null, asset_tag text not null unique,
  name text not null, equipment_type text, status text not null default 'available', certification_required text, metadata jsonb not null default '{}'::jsonb
);
create table if not exists public.university_lab_reservations (
  id uuid primary key default gen_random_uuid(), lab_id uuid not null references public.university_labs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, starts_at timestamptz not null, ends_at timestamptz not null, purpose text, status text not null default 'reserved'
);
create table if not exists public.university_employers (
  id uuid primary key default gen_random_uuid(), name text not null, industry text, website text, verified boolean not null default false,
  partnership_type text[] not null default '{}', contact jsonb not null default '{}'::jsonb, metadata jsonb not null default '{}'::jsonb
);
create table if not exists public.university_opportunities (
  id uuid primary key default gen_random_uuid(), employer_id uuid references public.university_employers(id) on delete cascade,
  title text not null, opportunity_type text not null check (opportunity_type in ('internship','apprenticeship','co-op','job','research','service-learning','clinical-partner','externship')),
  description text, requirements jsonb not null default '{}'::jsonb, starts_on date, ends_on date, active boolean not null default true
);
create table if not exists public.university_opportunity_applications (
  id uuid primary key default gen_random_uuid(), opportunity_id uuid not null references public.university_opportunities(id) on delete cascade,
  student_id uuid not null references public.university_students(id) on delete cascade, status text not null default 'submitted',
  submitted_at timestamptz not null default now(), metadata jsonb not null default '{}'::jsonb, unique(opportunity_id,student_id)
);
create table if not exists public.university_alumni (
  id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade,
  graduation_year integer, credentials jsonb not null default '[]'::jsonb, mentorship_available boolean not null default false,
  career_profile jsonb not null default '{}'::jsonb, giving_preferences jsonb not null default '{}'::jsonb
);
create table if not exists public.university_hbcu_partners (
  id uuid primary key default gen_random_uuid(), institution_name text not null unique, official_hbcu boolean not null default false,
  federal_designation_verified boolean not null default false, partnership_status text not null default 'prospect', partnership_areas text[] not null default '{}',
  articulation_terms jsonb not null default '{}'::jsonb, research_terms jsonb not null default '{}'::jsonb, contact jsonb not null default '{}'::jsonb, notes text
);
create table if not exists public.university_black_excellence_programs (
  id uuid primary key default gen_random_uuid(), name text not null, program_type text not null, description text, focus_areas text[] not null default '{}',
  partner_hbcu_id uuid references public.university_hbcu_partners(id) on delete set null, active boolean not null default true, metadata jsonb not null default '{}'::jsonb
);
create table if not exists public.university_integrity_cases (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.university_students(id) on delete cascade,
  source_type text not null, source_id uuid, automated_signals jsonb not null default '{}'::jsonb, status text not null default 'needs_review',
  reviewed_by uuid references auth.users(id), determination text, notes text, created_at timestamptz not null default now(), resolved_at timestamptz
);

-- RLS: default-deny for sensitive records, explicit self access for student profile,
-- explicit read access for the authenticated catalog used by the runtime launcher.
do $$ declare t text; begin
  foreach t in array array[
    'university_students','university_faculty','university_programs','university_courses','university_sections','university_enrollments','university_attendance',
    'university_assignments','university_submissions','university_exams','university_exam_attempts','university_guardians','university_accommodations','university_credentials',
    'university_transcript_entries','university_portfolio_items','university_library_items','university_support_sessions','university_labs','university_equipment',
    'university_lab_reservations','university_employers','university_opportunities','university_opportunity_applications','university_alumni','university_hbcu_partners',
    'university_black_excellence_programs','university_integrity_cases'
  ] loop execute format('alter table public.%I enable row level security',t); end loop;
end $$;

revoke all on public.university_students,public.university_faculty,public.university_programs,public.university_courses,public.university_sections,
 public.university_enrollments,public.university_attendance,public.university_assignments,public.university_submissions,public.university_exams,
 public.university_exam_attempts,public.university_guardians,public.university_accommodations,public.university_credentials,public.university_transcript_entries,
 public.university_portfolio_items,public.university_library_items,public.university_support_sessions,public.university_labs,public.university_equipment,
 public.university_lab_reservations,public.university_employers,public.university_opportunities,public.university_opportunity_applications,
 public.university_alumni,public.university_hbcu_partners,public.university_black_excellence_programs,public.university_integrity_cases from anon,authenticated;

grant select,insert,update on public.university_students to authenticated;
grant select on public.university_programs,public.university_courses,public.university_sections,public.university_library_items,
 public.university_labs,public.university_employers,public.university_opportunities,public.university_hbcu_partners,public.university_black_excellence_programs to authenticated;

drop policy if exists university_students_self_select on public.university_students;
create policy university_students_self_select on public.university_students for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists university_students_self_insert on public.university_students;
create policy university_students_self_insert on public.university_students for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists university_students_self_update on public.university_students;
create policy university_students_self_update on public.university_students for update to authenticated
 using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

drop policy if exists university_programs_read on public.university_programs;
create policy university_programs_read on public.university_programs for select to authenticated using (active=true);
drop policy if exists university_courses_read on public.university_courses;
create policy university_courses_read on public.university_courses for select to authenticated using (active=true);
drop policy if exists university_sections_read on public.university_sections;
create policy university_sections_read on public.university_sections for select to authenticated using (true);
drop policy if exists university_library_read on public.university_library_items;
create policy university_library_read on public.university_library_items for select to authenticated using (true);
drop policy if exists university_labs_read on public.university_labs;
create policy university_labs_read on public.university_labs for select to authenticated using (active=true);
drop policy if exists university_employers_read on public.university_employers;
create policy university_employers_read on public.university_employers for select to authenticated using (verified=true);
drop policy if exists university_opportunities_read on public.university_opportunities;
create policy university_opportunities_read on public.university_opportunities for select to authenticated using (active=true);
drop policy if exists university_hbcu_partners_read on public.university_hbcu_partners;
create policy university_hbcu_partners_read on public.university_hbcu_partners for select to authenticated using (partnership_status in ('active','signed','developing'));
drop policy if exists university_black_excellence_read on public.university_black_excellence_programs;
create policy university_black_excellence_read on public.university_black_excellence_programs for select to authenticated using (active=true);

insert into public.university_programs(code,name,level,school,credential_type,description,accreditation_status,regulatory_notes) values
 ('AAU-PREK','Early Learning & Discovery','prek','All American Academy','learning-record','Play-based literacy, numeracy, arts, science and social development.','not_accredited','Program delivery must comply with applicable early-childhood licensing and education requirements.'),
 ('AAU-K12','K-12 College & Career Academy','k12','All American Academy','diploma-pathway','Standards-aligned academics, Living Worlds labs, arts, STEM and career exploration.','not_accredited','A high-school diploma may only be issued when applicable state authorization/accreditation requirements are satisfied.'),
 ('AAU-TRADE','Trade & Technical Institute','trade','School of Trades & Workforce','certificate','Logistics, warehousing, skilled trades, drones, culinary, manufacturing, IT and other career pathways.','not_accredited','Programs leading to regulated occupations must meet applicable licensing/certification rules.'),
 ('AAU-CERT','Professional Certificate Academy','certificate','School of Professional Studies','certificate','Stackable workforce and technology credentials.','not_accredited','Internal certificates are not represented as state licenses or externally accredited credentials unless separately approved.'),
 ('AAU-BS-AI','AI & Intelligent Systems','bachelor','School of AI, Computing & Robotics','bachelor','AI, software, robotics, data, ethics and applied labs.','not_accredited','Degree-granting authority/accreditation required before marketing or awarding an accredited bachelor degree.'),
 ('AAU-MS-AI','Advanced AI & Autonomous Systems','master','Graduate School','master','Advanced AI, agents, robotics, safety, evaluation and research.','not_accredited','Degree-granting authority/accreditation required before marketing or awarding an accredited master degree.'),
 ('AAU-PHD-AI','AI Systems & Living Worlds Research','doctorate','Graduate School','phd','Research pathway spanning AI, simulation, holography, logistics, education and Living Worlds.','not_accredited','Doctoral degree authority/accreditation required before marketing or awarding a PhD.')
on conflict(code) do nothing;

insert into public.university_black_excellence_programs(name,program_type,description,focus_areas) values
 ('Black Excellence & HBCU Partnership Center','partnership-center','HBCU-inspired Black-serving academic, cultural, research, entrepreneurship and mentorship center; formal HBCU status remains with federally eligible institutions.',array['HBCU partnerships','Black history','STEM','arts','entrepreneurship','research','mentorship','alumni','scholarships']),
 ('Black Innovation & Entrepreneurship Lab','innovation-lab','Student and faculty venture development connecting AI Café, Holo Creator, Holo Work and marketplace tools.',array['entrepreneurship','AI','business','creator economy','community wealth']),
 ('Diaspora History & Culture Institute','academic-center','Black history, African diaspora, archives, music, literature and global cultural research.',array['history','culture','archives','music','publishing']);
