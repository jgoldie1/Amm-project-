export const ALL_AMERICAN_UNIVERSITY_LOOP = [
  'TEACH',
  'PRACTICE + REPEAT',
  'EXPLAIN BACK',
  'STREETVERSE LAB',
  'TEST / PRACTICAL',
  'COURSE COMPLETION EVIDENCE',
  'SKILLS / EMPLOYMENT PASSPORT',
  'APPRENTICESHIP / JOB / CREATOR OPPORTUNITY',
  'CREATE BUSINESS',
  'HIRE + MENTOR',
] as const;

export const ALL_AMERICAN_UNIVERSITY_LEVELS = [
  'Explorer', 'Apprentice', 'Builder', 'Creator', 'Entrepreneur', 'Professional', 'Mentor',
] as const;

export const ALL_AMERICAN_UNIVERSITY_PROGRAMS = [
  'Winter Level-Up League',
  'Skill Trees',
  'Boss Missions',
  'Portfolio Projects',
  'Internship / Apprenticeship Pathways',
  'First-Customer Challenge',
  'Spring Draft',
] as const;

export const UNIVERSITY_TRUTH_RULES = {
  masteryTrackingRequired: true,
  accessibilityRequired: true,
  humanOversightForHighImpactDecisions: true,
  completionIsNotAccreditedDegreeUnlessAuthorized: true,
  realEmployerControlsHiringDecision: true,
} as const;
