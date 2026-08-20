export type EducationLevel = 'grammar-school' | 'high-school' | 'community-college' | 'college' | 'university' | 'trade-school'

export type EducationInstitution = {
  id: string
  name: string
  region: string
  level: EducationLevel
  visitable: boolean
  attendable: boolean
  publicIdentity: 'real-reference' | 'fictionalized'
  programs: string[]
  jobs: string[]
  missions: string[]
  accessRules: string[]
}

export const EDUCATION_INSTITUTIONS: EducationInstitution[] = [
  {
    id: 'chicago-grammar-network',
    name: 'Chicago Grammar School Network',
    region: 'Chicago',
    level: 'grammar-school',
    visitable: true,
    attendable: true,
    publicIdentity: 'fictionalized',
    programs: ['Reading', 'Math', 'Science', 'Arts', 'Music', 'Digital citizenship', 'Accessibility learning'],
    jobs: ['Teacher simulation', 'Tutor', 'Coach', 'Custodial services', 'Cafeteria services', 'School transportation'],
    missions: ['First Day', 'Science Fair', 'Music Showcase', 'Safe Route Home', 'Community Reading Day'],
    accessRules: ['Student/guardian/staff/approved-visitor lanes', 'No adult stranger gameplay around minors', 'No real student identities', 'Age-appropriate chat and missions only']
  },
  {
    id: 'chicago-high-network',
    name: 'Chicago High School Network',
    region: 'Chicago',
    level: 'high-school',
    visitable: true,
    attendable: true,
    publicIdentity: 'fictionalized',
    programs: ['College prep', 'CTE/trades', 'Sports', 'Music', 'Media', 'Coding', 'Entrepreneurship'],
    jobs: ['Tutor', 'Coach', 'Event staff', 'Media assistant', 'Food service', 'Facilities'],
    missions: ['Freshman Year', 'Build a Team', 'Career Day', 'Start a Student Business', 'Graduation Path'],
    accessRules: ['Student/guardian/staff/approved-visitor lanes', 'No real student identities', 'No adult-minor dating or sexual content', 'Moderated school communications']
  },
  {
    id: 'chicago-college-network',
    name: 'Chicago College + University Network',
    region: 'Chicago',
    level: 'college',
    visitable: true,
    attendable: true,
    publicIdentity: 'fictionalized',
    programs: ['Business', 'Computer science', 'Healthcare', 'Supply chain', 'Media', 'Music', 'Law/public service', 'Engineering'],
    jobs: ['Student worker', 'Research assistant simulation', 'Tutor', 'Campus events', 'IT support', 'Dining', 'Athletics staff'],
    missions: ['Choose a Major', 'First Campus Job', 'Internship Hunt', 'Build a Portfolio', 'Launch a Startup'],
    accessRules: ['Adult/campus visitor rules', 'Verified institution partnerships required before claiming official affiliation']
  },
  {
    id: 'greenville-university',
    name: 'Greenville University District',
    region: 'Greenville, Illinois',
    level: 'university',
    visitable: true,
    attendable: true,
    publicIdentity: 'real-reference',
    programs: ['Liberal arts', 'Business', 'Education', 'Science', 'Music', 'Athletics', 'Career preparation'],
    jobs: ['Student worker', 'Tutor', 'Athletics/event staff', 'Dining', 'Campus services', 'Local business intern'],
    missions: ['Move In', 'Find a Campus Job', 'Join a Team or Organization', 'Downtown Internship', 'Career Launch'],
    accessRules: ['Reference-only until an official institutional partnership exists', 'Do not represent enrollment, admissions or campus policies as official unless verified']
  },
  {
    id: 'detroit-career-campus',
    name: 'Detroit Career + College Network',
    region: 'Detroit + Southeast Michigan',
    level: 'community-college',
    visitable: true,
    attendable: true,
    publicIdentity: 'fictionalized',
    programs: ['Automotive/EV', 'Advanced manufacturing', 'Healthcare', 'Logistics', 'Music production', 'Entrepreneurship'],
    jobs: ['Apprentice', 'Lab assistant simulation', 'Tutor', 'Event staff', 'Career-center assistant'],
    missions: ['Choose a Trade', 'Apprenticeship Interview', 'Build an EV Module', 'Music Lab Session', 'Employer Showcase'],
    accessRules: ['Adult/college-age gameplay', 'No claim of real certification without partner validation']
  },
  {
    id: 'california-creator-tech-network',
    name: 'California Creator + Tech Education Network',
    region: 'Southern + Northern California',
    level: 'university',
    visitable: true,
    attendable: true,
    publicIdentity: 'fictionalized',
    programs: ['Film/TV', 'Acting', 'Editing', 'AI/software', 'Hardware', 'Design', 'Hospitality', 'Business'],
    jobs: ['Production assistant', 'Lab assistant simulation', 'Tutor', 'Studio intern', 'Event staff', 'Startup intern'],
    missions: ['Southern California Production Semester', 'Silver Lake Creator Lab', 'Northern California Startup Sprint', 'San Jose Demo Day'],
    accessRules: ['Institutional claims remain fictionalized until verified', 'Internship/job claims require verified employers for real-world placement']
  }
]

export const EDUCATION_PROGRESS_PATH = [
  'Visit campus',
  'Choose learner profile',
  'Enroll in a simulated course or training path',
  'Complete class/skill missions',
  'Earn non-cash skill XP and portfolio evidence',
  'Qualify for internships/apprenticeships/jobs',
  'Build references and career reputation',
  'Use career income/experience to launch or expand a verified business'
] as const

export const EDUCATION_SAFETY_RULES = [
  'K-12 students are synthetic characters; never ingest or expose real minor identities.',
  'Adult players cannot use school systems to privately contact minors.',
  'School access is role-gated: student, guardian, staff or approved visitor.',
  'Real institutions are clearly labeled as reference-only until an official partnership verifies programs, admissions, jobs and policies.',
  'Game completion does not equal a real diploma, license, certification or college credit unless a verified partner explicitly awards it.'
] as const
