import type { WorkforceFundingSource, WorkforceLane, WorkforceTask } from './jarvisWorkforceEngine';

export type AiCafeRole =
  | 'cafe_operator'
  | 'inventory_assistant'
  | 'creator_table_host'
  | 'digital_twin_qa'
  | 'holo_ad_assistant'
  | 'customer_experience'
  | 'waste_quality_monitor'
  | 'business_analyst';

export type AiCafeMetricSnapshot = {
  ordersCompleted: number;
  customerScore: number;
  wasteScore: number;
  inventoryAccuracyPercent: number;
  campaignQaPassed?: boolean;
};

export const AI_CAFE_WORKFORCE_MAP: Record<AiCafeRole, WorkforceLane> = {
  cafe_operator: 'customer_support',
  inventory_assistant: 'data_quality',
  creator_table_host: 'creator_operations',
  digital_twin_qa: 'release_testing',
  holo_ad_assistant: 'ad_campaign_qa',
  customer_experience: 'customer_support',
  waste_quality_monitor: 'data_quality',
  business_analyst: 'documentation',
};

export const AI_CAFE_FUNDING_PRIORITY: WorkforceFundingSource[] = [
  'product_placement_operating_share',
  'holo_ad_operating_share',
  'creator_campaign_operating_share',
  'marketplace_operating_share',
  'subscription_operating_share',
  'tryamm_general_operations',
];

export function buildAiCafeStarterTasks(): WorkforceTask[] {
  return [
    {
      id: 'ai-cafe-inventory-audit',
      lane: 'data_quality',
      title: 'AI Café inventory + reorder audit',
      instructions: ['Review stock levels', 'Flag items at/below reorder level', 'Verify unit cost and sell price', 'Submit discrepancies'],
      estimatedMinutes: 45,
      evidenceRequired: ['inventory_snapshot', 'reorder_report'],
      fundingSource: 'marketplace_operating_share',
      status: 'available',
    },
    {
      id: 'ai-cafe-digital-twin-qa',
      lane: 'release_testing',
      title: 'AI Café digital twin QA',
      instructions: ['Start a test café shift', 'Verify order/waste/customer metrics', 'Confirm persistent state reload', 'Document defects'],
      estimatedMinutes: 60,
      evidenceRequired: ['shift_id', 'qa_report'],
      fundingSource: 'tryamm_general_operations',
      status: 'available',
    },
    {
      id: 'ai-cafe-holo-ad-qa',
      lane: 'ad_campaign_qa',
      title: 'AI Café Holo Ad + product-placement QA',
      instructions: ['Verify campaign placement', 'Test CTA destination', 'Check brand/product metadata', 'Record impression/interaction test evidence'],
      estimatedMinutes: 45,
      evidenceRequired: ['campaign_id', 'placement_capture', 'cta_result'],
      fundingSource: 'holo_ad_operating_share',
      status: 'available',
    },
    {
      id: 'ai-cafe-creator-table-host',
      lane: 'creator_operations',
      title: 'Creator Table session support',
      instructions: ['Prepare creator table', 'Verify stream/reel tools', 'Support approved guest workflow', 'Submit session summary'],
      estimatedMinutes: 90,
      evidenceRequired: ['session_id', 'session_summary'],
      fundingSource: 'creator_campaign_operating_share',
      status: 'available',
    },
  ];
}

export function aiCafeShiftEligibleForWorkCredit(metrics: AiCafeMetricSnapshot) {
  return metrics.ordersCompleted >= 1
    && metrics.customerScore >= 80
    && metrics.wasteScore >= 80
    && metrics.inventoryAccuracyPercent >= 95;
}

export const AI_CAFE_CAPABILITIES = {
  persistentDigitalTwin: true,
  inventoryAndReorderTraining: true,
  shiftOperations: true,
  creatorTables: true,
  holoAdvertisingQa: true,
  productPlacementQa: true,
  customerExperienceTraining: true,
  wasteAndQualityTraining: true,
  businessAnalyticsTraining: true,
  workforceEvidenceRequired: true,
  workerCannotSelfApprove: true,
  schoolPriorityForStudents: true,
} as const;
