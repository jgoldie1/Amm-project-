export type LearningStage = 'prek' | 'elementary' | 'middle' | 'high' | 'ged' | 'trade' | 'college' | 'adult';

export type LearningCredential = {
  id: string;
  title: string;
  category: 'academic' | 'financial' | 'career' | 'creator' | 'service' | 'business' | 'accessibility';
  status: 'not_started' | 'in_progress' | 'completed' | 'verified';
  progress: number;
  evidence?: string[];
  completedAt?: string;
};

export type LearningPassport = {
  version: 1;
  userId?: string;
  stage: LearningStage;
  goals: string[];
  credentials: LearningCredential[];
  currentStreakDays: number;
  lastActiveAt: string;
};

export const createLearningPassport = (partial: Partial<LearningPassport> = {}): LearningPassport => ({
  version: 1,
  userId: partial.userId,
  stage: partial.stage ?? 'adult',
  goals: partial.goals ?? [],
  credentials: partial.credentials ?? [],
  currentStreakDays: partial.currentStreakDays ?? 0,
  lastActiveAt: new Date().toISOString(),
});

export function upsertCredential(passport: LearningPassport, credential: LearningCredential): LearningPassport {
  const existing = passport.credentials.findIndex((c) => c.id === credential.id);
  const credentials = [...passport.credentials];
  if (existing >= 0) credentials[existing] = credential;
  else credentials.push(credential);
  return { ...passport, credentials, lastActiveAt: new Date().toISOString() };
}

export function learningPassportSummary(passport: LearningPassport) {
  const completed = passport.credentials.filter((c) => c.status === 'completed' || c.status === 'verified').length;
  const active = passport.credentials.filter((c) => c.status === 'in_progress').length;
  const total = passport.credentials.length;
  return {
    completed,
    active,
    total,
    percentComplete: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export const coreLearningCredentials: LearningCredential[] = [
  { id: 'budget-builder', title: 'Budget Builder', category: 'financial', status: 'not_started', progress: 0 },
  { id: 'first-paycheck', title: 'First Paycheck', category: 'financial', status: 'not_started', progress: 0 },
  { id: 'credit-smart', title: 'Credit Smart', category: 'financial', status: 'not_started', progress: 0 },
  { id: 'emergency-ready', title: 'Emergency Ready', category: 'financial', status: 'not_started', progress: 0 },
  { id: 'community-circulator', title: '12-Circulation Challenge', category: 'financial', status: 'not_started', progress: 0 },
  { id: 'college-trade-ready', title: 'College / Trade Ready', category: 'career', status: 'not_started', progress: 0 },
  { id: 'grant-ready', title: 'Grant Readiness', category: 'business', status: 'not_started', progress: 0 },
  { id: 'creator-rights', title: 'Creator Rights', category: 'creator', status: 'not_started', progress: 0 },
  { id: 'community-steward', title: 'Community Steward', category: 'service', status: 'not_started', progress: 0 },
];
