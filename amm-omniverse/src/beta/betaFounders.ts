export type BetaMissionType = 'onboarding' | 'accessibility' | 'creator' | 'marketplace' | 'delivery' | 'business' | 'school' | 'security' | 'community';

export type BetaMission = {
  id: string;
  title: string;
  description: string;
  type: BetaMissionType;
  difficulty: 'easy' | 'medium' | 'hard';
  aiActionReward: number;
  badge?: string;
  active: boolean;
};

export type BetaReport = {
  id: string;
  accountId: string;
  missionId?: string;
  createdAt: string;
  severity: 'suggestion' | 'minor' | 'major' | 'critical';
  category: 'bug' | 'ux' | 'accessibility' | 'performance' | 'security' | 'content' | 'payment' | 'delivery' | 'other';
  title: string;
  description: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  route?: string;
  device?: string;
  appVersion?: string;
  reproductionSteps?: string[];
  attachmentRefs?: string[];
  status: 'new' | 'triaged' | 'duplicate' | 'accepted' | 'in_fix' | 'fixed' | 'verified' | 'closed';
  qualityScore?: number;
};

export type BetaFounderProgress = {
  accountId: string;
  missionsCompleted: string[];
  acceptedReports: number;
  verifiedFixes: number;
  aiActionsEarned: number;
  badges: string[];
  tier: 'explorer' | 'tester' | 'pathfinder' | 'guardian' | 'founder';
};

export function calculateBetaTier(progress: BetaFounderProgress): BetaFounderProgress['tier'] {
  const score = progress.missionsCompleted.length + progress.acceptedReports * 2 + progress.verifiedFixes * 3;
  if (score >= 50) return 'founder';
  if (score >= 30) return 'guardian';
  if (score >= 15) return 'pathfinder';
  if (score >= 5) return 'tester';
  return 'explorer';
}

export function rewardAcceptedReport(report: BetaReport) {
  if (report.status !== 'accepted' && report.status !== 'fixed' && report.status !== 'verified') return 0;
  const severityReward = { suggestion: 10, minor: 20, major: 50, critical: 100 }[report.severity];
  const qualityMultiplier = Math.max(0.5, Math.min(2, (report.qualityScore ?? 100) / 100));
  return Math.round(severityReward * qualityMultiplier);
}

// Beta rewards are non-cash platform benefits such as AI Actions, badges, founder status,
// early access, profile recognition, or eligible promotional perks. Do not create gambling,
// guaranteed cash value, or incentives for unsafe vulnerability exploitation. Security findings
// should route to a responsible disclosure/security review workflow.
