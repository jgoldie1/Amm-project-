export type AdminRisk = 'READ_ONLY' | 'LOW' | 'HIGH';

export type AdminAction =
  | 'INSPECT_STATUS'
  | 'DIAGNOSE_FAILURE'
  | 'RERUN_TEST'
  | 'RETRY_HEALTH_CHECK'
  | 'DEPLOY_PRODUCTION'
  | 'CHANGE_SECURITY'
  | 'DELETE_DATA'
  | 'MOVE_REAL_MONEY';

export interface AdminRequest {
  action: AdminAction;
  target: string;
  reason?: string;
}

export interface AdminDecision {
  allowed: boolean;
  requiresFounderApproval: boolean;
  risk: AdminRisk;
  reason: string;
}

const READ_ONLY = new Set<AdminAction>(['INSPECT_STATUS', 'DIAGNOSE_FAILURE']);
const LOW_RISK = new Set<AdminAction>(['RERUN_TEST', 'RETRY_HEALTH_CHECK']);

/**
 * Founder Admin Agent policy core.
 *
 * This module deliberately separates diagnosis from execution. It never
 * treats a planned feature as LIVE and never grants autonomous authority for
 * production, security, destructive, or real-money operations.
 */
export class FounderAdminAgent {
  decide(request: AdminRequest): AdminDecision {
    if (READ_ONLY.has(request.action)) {
      return {
        allowed: true,
        requiresFounderApproval: false,
        risk: 'READ_ONLY',
        reason: 'Read-only inspection and diagnosis are safe to run automatically.',
      };
    }

    if (LOW_RISK.has(request.action)) {
      return {
        allowed: true,
        requiresFounderApproval: false,
        risk: 'LOW',
        reason: 'Only reversible test and health-check retries may run automatically.',
      };
    }

    return {
      allowed: false,
      requiresFounderApproval: true,
      risk: 'HIGH',
      reason: 'Founder approval is required for production, security, destructive, or real-money actions.',
    };
  }
}

export const founderAdminAgent = new FounderAdminAgent();
