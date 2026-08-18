import type { AccessibilityPassport } from '../accessibility/accessibilityPassport';
import { matchAccessibility, type AccessibleOpportunity } from '../accessibility/accessibilityMatch';
import type { LearningPassport, LearningStage } from './learningPassport';

export type StudentOpportunityType = 'scholarship' | 'grant' | 'college' | 'hbcu' | 'trade' | 'ged' | 'internship' | 'apprenticeship' | 'job' | 'mentor' | 'tutoring';

export type StudentOpportunity = AccessibleOpportunity & {
  type: StudentOpportunityType;
  stages?: LearningStage[];
  deadline?: string;
  geography?: string[];
  amountMin?: number;
  amountMax?: number;
  requirements?: string[];
  source?: string;
  lastVerifiedAt?: string;
};

export type StudentOpportunityMatch = {
  opportunity: StudentOpportunity;
  status: 'likely_match' | 'possible_match' | 'not_a_match' | 'verify';
  reasons: string[];
  missingInformation: string[];
  accessibility: ReturnType<typeof matchAccessibility>;
};

export function matchStudentOpportunity(
  learning: LearningPassport,
  accessibility: AccessibilityPassport,
  opportunity: StudentOpportunity,
): StudentOpportunityMatch {
  const reasons: string[] = [];
  const missingInformation: string[] = [];
  let hardFail = false;

  if (opportunity.stages?.length) {
    if (opportunity.stages.includes(learning.stage)) reasons.push(`Education stage matches: ${learning.stage}`);
    else hardFail = true;
  } else {
    missingInformation.push('Education-stage eligibility not specified');
  }

  if (opportunity.deadline) {
    const deadline = new Date(opportunity.deadline);
    if (Number.isNaN(deadline.getTime())) missingInformation.push('Deadline needs verification');
    else if (deadline.getTime() < Date.now()) hardFail = true;
    else reasons.push(`Deadline open through ${deadline.toLocaleDateString()}`);
  }

  if (!opportunity.requirements?.length) missingInformation.push('Detailed eligibility requirements');
  if (!opportunity.source) missingInformation.push('Official source');
  if (!opportunity.lastVerifiedAt) missingInformation.push('Last-verified date');

  const accessibilityMatch = matchAccessibility(accessibility, opportunity);
  if (accessibilityMatch.matched.length) reasons.push(...accessibilityMatch.explanation.filter((x) => x.includes('✓')));

  const status: StudentOpportunityMatch['status'] = hardFail
    ? 'not_a_match'
    : missingInformation.length > 0
      ? reasons.length > 0 ? 'possible_match' : 'verify'
      : 'likely_match';

  return { opportunity, status, reasons, missingInformation, accessibility: accessibilityMatch };
}

export function rankStudentOpportunities(
  learning: LearningPassport,
  accessibility: AccessibilityPassport,
  opportunities: StudentOpportunity[],
) {
  const priority = { likely_match: 0, possible_match: 1, verify: 2, not_a_match: 3 } as const;
  return opportunities
    .map((opportunity) => matchStudentOpportunity(learning, accessibility, opportunity))
    .sort((a, b) => {
      const statusDiff = priority[a.status] - priority[b.status];
      if (statusDiff !== 0) return statusDiff;
      return b.accessibility.score - a.accessibility.score;
    });
}
