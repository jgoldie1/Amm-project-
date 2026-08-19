export type BetaJourneyStage =
  | 'account_authenticated'
  | 'business_profile_persisted'
  | 'domain_dns_configured'
  | 'harmony_site_ready'
  | 'business_jarvis_ready'
  | 'marketplace_seller_ready'
  | 'sandbox_order_created'
  | 'sandbox_payment_recorded'
  | 'delivery_tracking_started'
  | 'delivery_completed'
  | 'business_dashboard_updated'
  | 'audit_verified';

export type StageEvidence = {
  stage: BetaJourneyStage;
  completed: boolean;
  evidenceId?: string;
  completedAt?: string;
  note?: string;
};

export type ProductionBetaJourney = {
  accountId: string;
  businessId: string;
  environment: 'development' | 'preview' | 'production';
  stages: StageEvidence[];
};

export const REQUIRED_BETA_STAGES: BetaJourneyStage[] = [
  'account_authenticated',
  'business_profile_persisted',
  'domain_dns_configured',
  'harmony_site_ready',
  'business_jarvis_ready',
  'marketplace_seller_ready',
  'sandbox_order_created',
  'sandbox_payment_recorded',
  'delivery_tracking_started',
  'delivery_completed',
  'business_dashboard_updated',
  'audit_verified',
];

export type JourneyValidation = {
  ready: boolean;
  completionPercent: number;
  missing: BetaJourneyStage[];
  invalid: string[];
};

export function validateProductionBetaJourney(journey: ProductionBetaJourney): JourneyValidation {
  const byStage = new Map(journey.stages.map((stage) => [stage.stage, stage]));
  const missing = REQUIRED_BETA_STAGES.filter((stage) => !byStage.get(stage)?.completed);
  const invalid: string[] = [];

  for (const stageName of REQUIRED_BETA_STAGES) {
    const stage = byStage.get(stageName);
    if (stage?.completed && !stage.evidenceId) invalid.push(`${stageName}: completed without evidenceId`);
  }

  if (journey.environment === 'production') {
    const sandboxOnly = ['sandbox_order_created', 'sandbox_payment_recorded'] as BetaJourneyStage[];
    if (sandboxOnly.some((stage) => byStage.get(stage)?.completed)) {
      invalid.push('Production journey cannot treat sandbox order/payment evidence as real-money production evidence.');
    }
  }

  const completed = REQUIRED_BETA_STAGES.length - missing.length;
  return {
    ready: missing.length === 0 && invalid.length === 0,
    completionPercent: Math.round((completed / REQUIRED_BETA_STAGES.length) * 100),
    missing,
    invalid,
  };
}

export function nextRequiredStage(journey: ProductionBetaJourney): BetaJourneyStage | undefined {
  const validation = validateProductionBetaJourney(journey);
  return validation.missing[0];
}

// This journey deliberately validates a sandbox commercial loop first.
// Real-money payment/payout/provider approvals remain gated separately.
