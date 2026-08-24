create extension if not exists pgcrypto;

create table if not exists public.aau_instructors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  bio text,
  specialties text[] not null default '{}',
  status text not null default 'applicant' check (status in ('applicant','verified','active','suspended')),
  credentials_verified boolean not null default false,
  background_check_required boolean not null default false,
  background_check_verified boolean not null default false,
  can_supervise_hands_on boolean not null default false,
  can_grade boolean not null default false,
  credential_evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.aau_courses (
  id uuid primary key default gen_random_uuid(),
  course_key text unique not null,
  title text not null,
  division text not null check (division in ('university','trade-school','career-academy','continuing-education','k12-support')),
  category text not null,
  description text,
  delivery_modes text[] not null default '{}',
  requires_human_instructor boolean not null default false,
  requires_hands_on_supervision boolean not null default false,
  regulated_field boolean not null default false,
  credential_claim text not null default 'learning-record' check (credential_claim in ('learning-record','completion-certificate','industry-cert-prep','degree-pathway')),
  accreditation_status text not null default 'not_accredited' check (accreditation_status in ('not_accredited','application','approved','partner-delivered')),
  active boolean not null default true,
  modules jsonb not null default '[]'::jsonb,
  outcomes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.aau_course_instructors (
  course_id uuid not null references public.aau_courses(id) on delete cascade,
  instructor_id uuid not null references public.aau_instructors(id) on delete cascade,
  role text not null default 'instructor' check (role in ('instructor','lead-instructor','lab-supervisor','grader','mentor')),
  active boolean not null default true,
  primary key(course_id,instructor_id,role)
);

create table if not exists public.aau_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.aau_courses(id) on delete cascade,
  status text not null default 'enrolled' check (status in ('enrolled','in-progress','completed','withdrawn','paused')),
  progress numeric not null default 0 check (progress between 0 and 100),
  accessibility_profile jsonb not null default '{}'::jsonb,
  enrolled_at timestamptz not null default now(), completed_at timestamptz,
  unique(student_user_id,course_id)
);

create table if not exists public.aau_assessments (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.aau_enrollments(id) on delete cascade,
  assessment_type text not null check (assessment_type in ('quiz','project','portfolio','lab','practical','exam','instructor-review')),
  title text not null,
  requires_human_review boolean not null default false,
  score numeric,
  passed boolean,
  evidence jsonb not null default '[]'::jsonb,
  reviewed_by uuid references public.aau_instructors(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.aau_apprenticeship_links (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid references public.aau_courses(id) on delete set null,
  organization text not null,
  opportunity_ref text,
  supervisor_name text,
  safety_verified boolean not null default false,
  pay_terms_verified boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','active','completed','declined','suspended')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table public.aau_instructors enable row level security;
alter table public.aau_courses enable row level security;
alter table public.aau_course_instructors enable row level security;
alter table public.aau_enrollments enable row level security;
alter table public.aau_assessments enable row level security;
alter table public.aau_apprenticeship_links enable row level security;

create policy "aau active courses readable" on public.aau_courses for select using(active=true);
create policy "aau instructor self read" on public.aau_instructors for select using(user_id=auth.uid());
create policy "aau enrollment own read" on public.aau_enrollments for select using(student_user_id=auth.uid());
create policy "aau enrollment own insert" on public.aau_enrollments for insert with check(student_user_id=auth.uid());
create policy "aau assessment through enrollment" on public.aau_assessments for select using(exists(select 1 from public.aau_enrollments e where e.id=enrollment_id and e.student_user_id=auth.uid()));
create policy "aau apprenticeship own read" on public.aau_apprenticeship_links for select using(student_user_id=auth.uid());

insert into public.aau_courses(course_key,title,division,category,delivery_modes,requires_human_instructor,requires_hands_on_supervision,regulated_field,credential_claim,modules,outcomes) values
('ai-foundations','AI Foundations + Responsible AI','university','Artificial Intelligence',array['ai-guided','human-led','hybrid'],false,false,false,'completion-certificate','["AI concepts","prompting","data literacy","model limits","privacy","responsible use","AI project lab"]'::jsonb,'["Use AI productively","Evaluate AI output","Build a supervised AI project"]'::jsonb),
('ai-builder','Applied AI Builder','career-academy','Artificial Intelligence',array['hybrid','lab'],true,false,false,'completion-certificate','["APIs","agents","automation","evaluation","security","deployment","portfolio project"]'::jsonb,'["Build a small AI workflow","Test and document an AI system"]'::jsonb),
('cyber-defense','Cybersecurity + Defensive Operations','university','Cybersecurity',array['hybrid','lab'],true,false,false,'industry-cert-prep','["networking","identity","endpoint security","phishing","logging","incident response","authorized security lab"]'::jsonb,'["Perform defensive QA","Document findings","Prepare for entry-level certification pathways"]'::jsonb),
('realestate-ops','Real Estate Analysis + Flip Operations','career-academy','Real Estate',array['hybrid','lab'],true,false,true,'completion-certificate','["comps","ARV","rehab budgets","carry costs","project documentation","property media","3D scans","Holo listings","marketing","record security"]'::jsonb,'["Analyze a simulated deal","Build a project packet","Know when a licensed professional is required"]'::jsonb),
('electrical','Electrical Trades Foundations','trade-school','Electrical',array['human-led','lab','apprenticeship'],true,true,true,'industry-cert-prep','["safety","tools","circuits","code literacy","diagnostics","hands-on lab","apprenticeship readiness"]'::jsonb,'["Demonstrate supervised fundamentals","Prepare for apprenticeship/licensing pathway"]'::jsonb),
('hvac','HVAC/R Foundations','trade-school','HVAC',array['human-led','lab','apprenticeship'],true,true,true,'industry-cert-prep','["safety","refrigeration concepts","electrical basics","airflow","diagnostics","EPA 608 prep","hands-on lab"]'::jsonb,'["Demonstrate supervised HVAC fundamentals","Prepare for certification/apprenticeship pathway"]'::jsonb),
('plumbing','Plumbing Foundations','trade-school','Plumbing',array['human-led','lab','apprenticeship'],true,true,true,'industry-cert-prep','["safety","tools","water systems","drainage","fixtures","code literacy","hands-on lab"]'::jsonb,'["Demonstrate supervised plumbing fundamentals","Prepare for apprenticeship/licensing pathway"]'::jsonb),
('carpentry','Carpentry + Construction','trade-school','Construction',array['human-led','lab','apprenticeship'],true,true,false,'completion-certificate','["site safety","measurement","framing","finish carpentry","estimating","plans","build lab"]'::jsonb,'["Complete supervised build tasks","Produce a construction portfolio"]'::jsonb),
('welding','Welding Foundations','trade-school','Welding',array['human-led','lab','apprenticeship'],true,true,true,'industry-cert-prep','["PPE","shop safety","processes","materials","joints","inspection basics","supervised weld lab"]'::jsonb,'["Demonstrate supervised welding fundamentals","Prepare for external certification pathway"]'::jsonb),
('automotive','Automotive Service Foundations','trade-school','Automotive',array['human-led','lab','apprenticeship'],true,true,false,'industry-cert-prep','["shop safety","inspection","brakes","electrical","diagnostics","maintenance","service lab"]'::jsonb,'["Perform supervised service tasks","Prepare for certification/employment pathway"]'::jsonb),
('media-creator','Media Production + Creator Business','career-academy','Media',array['hybrid','lab'],true,false,false,'completion-certificate','["camera","audio","editing","reels","LIVE","Holo ads","product placement","rights","portfolio"]'::jsonb,'["Produce portfolio media","Support creator and advertising operations"]'::jsonb),
('entrepreneurship','Entrepreneurship + Small Business Operations','university','Business',array['ai-guided','human-led','hybrid'],false,false,false,'completion-certificate','["business model","pricing","sales","operations","bookkeeping literacy","marketing","risk","pitch"]'::jsonb,'["Build an operating plan","Understand revenue, cost and compliance basics"]'::jsonb)
on conflict(course_key) do nothing;
