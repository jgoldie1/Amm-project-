import type { AccessibilityPassport } from './accessibilityPassport';

export type AccessibilityFeature =
  | 'remote'
  | 'flexible_schedule'
  | 'step_free'
  | 'adaptive_equipment'
  | 'captioning'
  | 'interpreting'
  | 'voice_first'
  | 'keyboard_accessible'
  | 'one_handed_compatible'
  | 'accessible_transit'
  | 'accommodation_process';

export type AccessibleOpportunity = {
  id: string;
  title: string;
  organization: string;
  features: Partial<Record<AccessibilityFeature, boolean>>;
  verification?: Partial<Record<AccessibilityFeature, 'self-reported' | 'verified' | 'unknown'>>;
};

export type AccessibilityMatchResult = {
  opportunityId: string;
  score: number;
  matched: AccessibilityFeature[];
  missing: AccessibilityFeature[];
  unknown: AccessibilityFeature[];
  explanation: string[];
};

function desiredFeatures(passport: AccessibilityPassport): AccessibilityFeature[] {
  const p = passport.preferences;
  const wanted = new Set<AccessibilityFeature>();
  if (p.captions || p.transcripts) wanted.add('captioning');
  if (p.voiceControl || p.speechToText) wanted.add('voice_first');
  if (p.keyboardOnly || p.switchAccess) wanted.add('keyboard_accessible');
  if (p.oneHandedMode) wanted.add('one_handed_compatible');
  passport.opportunityNeeds.forEach((need) => {
    const normalized = need.trim().toLowerCase().replace(/\s+/g, '_') as AccessibilityFeature;
    const valid: AccessibilityFeature[] = ['remote','flexible_schedule','step_free','adaptive_equipment','captioning','interpreting','voice_first','keyboard_accessible','one_handed_compatible','accessible_transit','accommodation_process'];
    if (valid.includes(normalized)) wanted.add(normalized);
  });
  return [...wanted];
}

const labels: Record<AccessibilityFeature, string> = {
  remote: 'Remote option',
  flexible_schedule: 'Flexible schedule',
  step_free: 'Step-free access',
  adaptive_equipment: 'Adaptive equipment',
  captioning: 'Captioning',
  interpreting: 'Interpreting process',
  voice_first: 'Voice-first workflow',
  keyboard_accessible: 'Keyboard/switch compatible',
  one_handed_compatible: 'One-handed compatible',
  accessible_transit: 'Accessible transit information',
  accommodation_process: 'Accommodation process',
};

export function matchAccessibility(
  passport: AccessibilityPassport,
  opportunity: AccessibleOpportunity,
): AccessibilityMatchResult {
  const desired = desiredFeatures(passport);
  const matched: AccessibilityFeature[] = [];
  const missing: AccessibilityFeature[] = [];
  const unknown: AccessibilityFeature[] = [];

  desired.forEach((feature) => {
    const value = opportunity.features[feature];
    if (value === true) matched.push(feature);
    else if (value === false) missing.push(feature);
    else unknown.push(feature);
  });

  const score = desired.length === 0 ? 100 : Math.round((matched.length / desired.length) * 100);
  const explanation = [
    ...matched.map((f) => `${labels[f]} ✓`),
    ...unknown.map((f) => `${labels[f]} — verify with organization`),
    ...missing.map((f) => `${labels[f]} — not currently listed`),
  ];

  return { opportunityId: opportunity.id, score, matched, missing, unknown, explanation };
}

export function rankAccessibleOpportunities(
  passport: AccessibilityPassport,
  opportunities: AccessibleOpportunity[],
) {
  return opportunities
    .map((opportunity) => ({ opportunity, match: matchAccessibility(passport, opportunity) }))
    .sort((a, b) => b.match.score - a.match.score);
}

// Accessibility settings may improve matching but must never be used as a negative
// eligibility factor or exposed to an organization without explicit user consent.
