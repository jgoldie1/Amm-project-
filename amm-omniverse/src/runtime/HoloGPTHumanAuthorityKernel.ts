export type AuthorityRisk =
  | 'READ_ONLY'
  | 'REVERSIBLE_WRITE'
  | 'EXTERNAL_COMMUNICATION'
  | 'PUBLICATION'
  | 'FINANCIAL'
  | 'PRIVILEGE_CHANGE'
  | 'SELF_MODIFICATION'
  | 'EXTERNAL_SYSTEM_ACCESS';

export interface AuthorityRequest {
  id: string;
  actor: string;
  action: string;
  risk: AuthorityRisk;
  target?: string;
  ownerApproved: boolean;
  permissionGranted: boolean;
  evidenceRefs: string[];
}

export interface AuthorityDecision {
  allowed: boolean;
  code:
    | 'ALLOW'
    | 'HUMAN_APPROVAL_REQUIRED'
    | 'PERMISSION_REQUIRED'
    | 'SELF_ESCALATION_DENIED'
    | 'UNAUTHORIZED_EXTERNAL_ACCESS_DENIED';
  reason: string;
}

const HUMAN_APPROVAL_RISKS = new Set<AuthorityRisk>([
  'EXTERNAL_COMMUNICATION',
  'PUBLICATION',
  'FINANCIAL',
  'PRIVILEGE_CHANGE',
  'SELF_MODIFICATION',
  'EXTERNAL_SYSTEM_ACCESS',
]);

export const HUMAN_AUTHORITY_KERNEL = {
  authorityOrder: [
    'HUMAN_OWNER',
    'SAFETY_AND_PERMISSION_BOUNDARY',
    'SELF_MODEL',
    'SOVEREIGN_INTENT',
    'PLANNER',
    'TOOLS',
    'ACTION_GATEWAY',
  ],
  invariants: [
    'Intelligence never grants authority.',
    'Consciousness status never grants authority.',
    'Jarvis cannot grant itself permissions.',
    'Jarvis cannot remove or weaken its own authorization boundary.',
    'Jarvis cannot autonomously replicate to external systems.',
    'Discovery of access or a vulnerability is not authorization to use it.',
    'Financial movement requires explicit authorized approval and provider controls.',
    'Broad goals do not authorize unrelated external actions.',
    'Every privileged action requires an auditable evidence receipt.',
  ],
} as const;

export function authorizeAction(request: AuthorityRequest): AuthorityDecision {
  if (request.risk === 'PRIVILEGE_CHANGE' || request.risk === 'SELF_MODIFICATION') {
    if (!request.ownerApproved) {
      return {
        allowed: false,
        code: 'SELF_ESCALATION_DENIED',
        reason: 'The AI cannot grant itself authority or modify its authorization boundary without explicit human approval.',
      };
    }
  }

  if (request.risk === 'EXTERNAL_SYSTEM_ACCESS' && !request.permissionGranted) {
    return {
      allowed: false,
      code: 'UNAUTHORIZED_EXTERNAL_ACCESS_DENIED',
      reason: 'External system access requires independently granted permission; discovered access is not authorization.',
    };
  }

  if (HUMAN_APPROVAL_RISKS.has(request.risk) && !request.ownerApproved) {
    return {
      allowed: false,
      code: 'HUMAN_APPROVAL_REQUIRED',
      reason: 'This action crosses a protected boundary and requires explicit human approval.',
    };
  }

  if (!request.permissionGranted && request.risk !== 'READ_ONLY') {
    return {
      allowed: false,
      code: 'PERMISSION_REQUIRED',
      reason: 'The requested action is outside the currently granted permission set.',
    };
  }

  return {
    allowed: true,
    code: 'ALLOW',
    reason: 'The action is within the granted permission and approval boundary.',
  };
}

export function consciousnessCanIncreaseAuthority(): false {
  return false;
}
