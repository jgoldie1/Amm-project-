export const ACADEMY_IMPLEMENTATION_ORDER = [
  '1. PRESERVE CANONICAL CONTRACTS',
  '2. RECONCILE RETAIL/HOLO FON RECOVERY BEFORE MERGE',
  '3. WIRE STREAMERS ACADEMY UI',
  '4. WIRE SKILLS/TALENT PASSPORT PERSISTENCE',
  '5. WIRE OPPORTUNITY CENTER UI + SEARCH',
  '6. WIRE MIDDLEVERSE JOB MATCHING',
  '7. WIRE CREATE MY BUSINESS',
  '8. WIRE HIRE FROM STREETVERSE',
  '9. CONNECT CREATOR PORTAL + LIVE/PK/REELS + RADIO/MUSIC/ADS/DISTRIBUTION',
  '10. CONNECT CHICAGO 77 DEMAND',
  '11. RUN ACCESSIBILITY + MOBILE + SECURITY QA',
  '12. VERIFY REAL PROVIDERS/EMPLOYERS/CREDENTIAL ISSUERS BEFORE LIVE CLAIMS',
  '13. MERGE ONLY AFTER EXACT-HEAD CI + RELEASE PRESERVATION',
] as const;

export const HUMAN_REQUIRED_ACTIONS = [
  'authorize production secrets through provider UI when connector cannot write them',
  'complete physical iPhone/Android Save-to-Phone evidence',
  'execute real carrier/employer/sponsor/credential agreements',
] as const;

export const AUTOMATABLE_ACTIONS = [
  'code recovery',
  'contract tests',
  'branch and pull request management',
  'CI inspection',
  'preview inspection',
  'non-secret configuration validation',
] as const;
