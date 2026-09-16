export type BuildStatus = 'LIVE' | 'READY' | 'BUILDING' | 'LOCKED' | 'COMING SOON';

export type StatusRecord = {
  system: string;
  status: BuildStatus;
  reason: string;
};

export const ACADEMY_STATUS_REGISTRY: readonly StatusRecord[] = [
  { system: 'Streamers Academy', status: 'BUILDING', reason: 'foundation, curriculum and regression contracts recovered; production UI/provider evidence still required' },
  { system: 'All American University', status: 'BUILDING', reason: 'progression and opportunity contract protected; production learning workflow requires certification' },
  { system: 'Youth Media Academy', status: 'LOCKED', reason: 'protected architecture retained; age-appropriate production implementation requires evidence' },
  { system: 'Jacobie Vision Cyber Academy', status: 'LOCKED', reason: 'authorized defensive blueprint preserved; real sponsor/employer/credential claims require verification' },
  { system: 'HoloStyle Fashion Academy', status: 'LOCKED', reason: 'historical architecture exists; production recovery requires exact integration evidence' },
  { system: 'Music / Record Label Academy', status: 'BUILDING', reason: 'creator/music pathway protected; production course and rights workflow requires evidence' },
  { system: '64-Track Studio pathway', status: 'BUILDING', reason: 'creator pathway protected; production studio workflow requires evidence' },
  { system: 'TRYAMM Opportunity Center', status: 'BUILDING', reason: 'business/job pathways and authority contracts created; production UI and backend matching remain' },
  { system: 'Skills / Talent Passport', status: 'BUILDING', reason: 'evidence model and privacy rules created; persistent production data path remains' },
] as const;
