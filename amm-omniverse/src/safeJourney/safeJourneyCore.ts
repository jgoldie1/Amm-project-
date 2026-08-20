export type JourneyStatus = 'requested' | 'scheduled' | 'assigned' | 'worker_en_route' | 'member_checked_in' | 'in_progress' | 'arriving' | 'completed' | 'cancelled' | 'incident';
export type EscalationLevel = 'none' | 'check_in' | 'supervisor' | 'emergency_services';
export type JourneyMode = 'walk_companion' | 'transit_companion' | 'vehicle_companion' | 'virtual_check_in' | 'campus_escort' | 'workplace_escort';

export type SafeJourney = {
  id: string;
  organizationId?: string;
  memberId: string;
  workerId?: string;
  dispatcherId?: string;
  mode: JourneyMode;
  status: JourneyStatus;
  requestedAt: string;
  scheduledStart?: string;
  startedAt?: string;
  completedAt?: string;
  pickupLabel: string;
  destinationLabel: string;
  privatePickupGeo?: { lat: number; lng: number };
  privateDestinationGeo?: { lat: number; lng: number };
  accessibilityNeeds?: string[];
  memberNotes?: string;
  escalationLevel: EscalationLevel;
  consentToLiveLocation: boolean;
  retentionHours: number;
};

export type WorkerProfile = {
  id: string;
  displayName: string;
  status: 'offline' | 'available' | 'assigned' | 'on_journey' | 'paused';
  trainingComplete: boolean;
  backgroundCheckStatus: 'not_started' | 'pending' | 'clear' | 'review' | 'expired';
  modes: JourneyMode[];
  accessibilitySkills?: string[];
};

export type IncidentRecord = {
  id: string;
  journeyId: string;
  occurredAt: string;
  category: 'late_arrival' | 'member_unreachable' | 'worker_unreachable' | 'threat' | 'medical' | 'harassment' | 'route_issue' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  escalatedTo?: 'supervisor' | 'emergency_services' | 'partner_contact';
  resolvedAt?: string;
};

export type OrganizationContract = {
  id: string;
  organizationId: string;
  includedJourneysMonthly: number;
  coveredHours: string;
  targetOnTimePercent: number;
  targetCompletionPercent: number;
  responseTargetMinutes?: number;
  contractStart: string;
  contractEnd: string;
  renewalTargetPercent?: number;
};

export type JourneyMetrics = {
  requested: number;
  completed: number;
  cancelled: number;
  incidents: number;
  onTime: number;
  averageResponseMinutes?: number;
  averageSatisfaction?: number;
  costPerCompletedJourneyMinor?: number;
};

export function calculateSla(metrics: JourneyMetrics) {
  const completionRate = metrics.requested ? metrics.completed / metrics.requested : 0;
  const onTimeRate = metrics.completed ? metrics.onTime / metrics.completed : 0;
  const incidentRate = metrics.completed ? metrics.incidents / metrics.completed : 0;
  return { completionRate, onTimeRate, incidentRate };
}

export function build500JourneyEvidence(metrics: JourneyMetrics) {
  const sla = calculateSla(metrics);
  return {
    evidenceReady: metrics.completed >= 500,
    completedJourneys: metrics.completed,
    onTimePercent: Math.round(sla.onTimeRate * 1000) / 10,
    completionPercent: Math.round(sla.completionRate * 1000) / 10,
    incidentPercent: Math.round(sla.incidentRate * 1000) / 10,
    averageResponseMinutes: metrics.averageResponseMinutes,
    averageSatisfaction: metrics.averageSatisfaction,
    costPerCompletedJourneyMinor: metrics.costPerCompletedJourneyMinor,
  };
}

export type TrainingModule = {
  id: string;
  title: string;
  required: boolean;
  topics: string[];
};

export const safeJourneyTraining: TrainingModule[] = [
  { id: 'presence', title: 'Visible Presence & Professional Boundaries', required: true, topics: ['non-enforcement role','member dignity','scope limits'] },
  { id: 'deescalation', title: 'De-escalation & Conflict Avoidance', required: true, topics: ['verbal de-escalation','distance','exit routes','when to disengage'] },
  { id: 'accessibility', title: 'Accessibility & Communication', required: true, topics: ['mobility','hearing','vision','communication preferences','one-handed support'] },
  { id: 'privacy', title: 'Privacy & Location Handling', required: true, topics: ['consent','minimum necessary location','retention','no public tracking'] },
  { id: 'emergency', title: 'Emergency Escalation', required: true, topics: ['when to call emergency services','supervisor escalation','incident documentation'] },
  { id: 'first-aid', title: 'First Aid/CPR Pathway', required: false, topics: ['external certification where required','do not exceed training'] },
];

// This service is companionship, routing, check-in, de-escalation, escalation and documentation.
// It is not law enforcement and must not be marketed as armed security unless separately licensed and insured for that role.
// Production must enforce consent-based location access, least-privilege worker/member data, and jurisdiction-specific insurance/licensing review.
