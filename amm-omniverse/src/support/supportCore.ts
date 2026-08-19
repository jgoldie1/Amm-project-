export type SupportChannel = 'in_app' | 'email' | 'chat' | 'voice' | 'system' | 'beta_founder';
export type SupportPriority = 'low' | 'normal' | 'high' | 'urgent' | 'security';
export type SupportStatus = 'new' | 'ai_triage' | 'waiting_user' | 'human_review' | 'engineering' | 'resolved' | 'closed';
export type SupportCategory =
  | 'account'
  | 'billing'
  | 'marketplace'
  | 'delivery'
  | 'creator'
  | 'school'
  | 'accessibility'
  | 'business'
  | 'bug'
  | 'feature_request'
  | 'abuse'
  | 'security'
  | 'legal_request'
  | 'healthcare_request'
  | 'other';

export type SupportTicket = {
  id: string;
  accountId?: string;
  createdAt: string;
  updatedAt: string;
  channel: SupportChannel;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  subject: string;
  description: string;
  route?: 'ai' | 'support_agent' | 'specialist' | 'engineering' | 'security' | 'legal_compliance';
  linkedIssueId?: string;
  linkedIncidentId?: string;
  aiSummary?: string;
  userVisibleReason?: string;
  evidenceUrls?: string[];
};

export type TriageDecision = {
  route: SupportTicket['route'];
  priority: SupportPriority;
  requiresHuman: boolean;
  reason: string;
};

export function triageSupportTicket(ticket: SupportTicket): TriageDecision {
  if (ticket.category === 'security' || ticket.priority === 'security') {
    return { route: 'security', priority: 'security', requiresHuman: true, reason: 'Security reports require protected human review and incident handling.' };
  }
  if (ticket.category === 'legal_request' || ticket.category === 'healthcare_request') {
    return { route: 'legal_compliance', priority: ticket.priority === 'urgent' ? 'urgent' : 'high', requiresHuman: true, reason: 'Regulated or professional-service request requires qualified human/compliance review.' };
  }
  if (ticket.category === 'abuse') {
    return { route: 'specialist', priority: ticket.priority === 'low' ? 'normal' : ticket.priority, requiresHuman: true, reason: 'Abuse/safety reports require moderation review when consequential.' };
  }
  if (ticket.category === 'bug' && (ticket.priority === 'urgent' || ticket.priority === 'high')) {
    return { route: 'engineering', priority: ticket.priority, requiresHuman: true, reason: 'High-impact bug should enter engineering queue.' };
  }
  if (ticket.category === 'billing' || ticket.category === 'delivery') {
    return { route: 'support_agent', priority: ticket.priority, requiresHuman: true, reason: 'Money/order outcome may require account-specific review.' };
  }
  return { route: 'ai', priority: ticket.priority, requiresHuman: false, reason: 'AI can attempt first response with escalation if unresolved.' };
}

export type BetaReport = {
  id: string;
  reporterAccountId?: string;
  createdAt: string;
  page?: string;
  release?: string;
  type: 'bug' | 'confusing' | 'slow' | 'accessibility' | 'idea' | 'other';
  description: string;
  reproductionSteps?: string[];
  screenshotUrl?: string;
  logsCorrelationId?: string;
  consentToFollowUp: boolean;
};

export type HealthSignal = {
  id: string;
  occurredAt: string;
  service: string;
  kind: 'latency' | 'error_rate' | 'availability' | 'queue_depth' | 'payment_failure' | 'delivery_failure' | 'security' | 'resource_usage';
  severity: 'info' | 'warning' | 'critical';
  value?: number;
  threshold?: number;
  correlationId?: string;
  details?: string;
};

export type HealingAction = {
  id: string;
  service: string;
  proposedAt: string;
  action: 'retry' | 'restart_worker' | 'pause_feature' | 'rollback_release' | 'switch_provider' | 'open_incident' | 'escalate_human';
  automaticAllowed: boolean;
  requiresApproval: boolean;
  reason: string;
  status: 'proposed' | 'approved' | 'executing' | 'completed' | 'failed' | 'rejected';
};

export function proposeHealingAction(signal: HealthSignal): HealingAction {
  const base = {
    id: globalThis.crypto?.randomUUID?.() ?? `heal-${Date.now()}`,
    service: signal.service,
    proposedAt: new Date().toISOString(),
    status: 'proposed' as const,
  };
  if (signal.severity === 'critical' && signal.kind === 'security') {
    return { ...base, action: 'pause_feature', automaticAllowed: false, requiresApproval: true, reason: 'Critical security signal: contain impact and escalate to Security Command Center.' };
  }
  if (signal.severity === 'critical') {
    return { ...base, action: 'open_incident', automaticAllowed: true, requiresApproval: false, reason: 'Critical reliability signal requires incident creation and coordinated response.' };
  }
  if (signal.kind === 'queue_depth' || signal.kind === 'availability') {
    return { ...base, action: 'restart_worker', automaticAllowed: true, requiresApproval: false, reason: 'Safe bounded worker recovery may restore service.' };
  }
  return { ...base, action: 'retry', automaticAllowed: true, requiresApproval: false, reason: 'Bounded retry is the lowest-risk recovery action.' };
}

// Production rules:
// - AI may resolve routine questions, but it cannot make final legal/medical/security determinations.
// - Money-impacting resolutions, account ownership disputes, safety/abuse actions, and security incidents require appropriate human review.
// - GitHub issue creation should include sanitized technical detail only; never dump secrets, private messages, medical data, or financial credentials.
// - Self-healing actions must be bounded, reversible and audited. High-impact kill switches/rollbacks require feature-gate policy and human approval where configured.
