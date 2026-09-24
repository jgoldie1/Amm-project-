import { authorizeAction, type AuthorityRequest, type AuthorityDecision } from './HoloGPTHumanAuthorityKernel';

export type LastMileState =
  | 'THINKING'
  | 'AUTHORITY_CHECK'
  | 'AUTHORIZED'
  | 'ACTING'
  | 'OBSERVING'
  | 'VERIFYING'
  | 'RECEIPT_RECORDED'
  | 'MEMORY_UPDATED'
  | 'DENIED'
  | 'FAILED';

export interface PlannedAction {
  id: string;
  intent: string;
  authority: AuthorityRequest;
  expectedOutcome: string;
  reversible: boolean;
}

export interface ToolExecutionResult {
  ok: boolean;
  output?: unknown;
  error?: string;
  externalEvidenceRefs: string[];
}

export interface Observation {
  observed: boolean;
  summary: string;
  evidenceRefs: string[];
}

export interface Verification {
  verified: boolean;
  summary: string;
  evidenceRefs: string[];
}

export interface WorkReceipt {
  actionId: string;
  intent: string;
  state: LastMileState;
  authority: AuthorityDecision;
  expectedOutcome: string;
  observedOutcome?: string;
  evidenceRefs: string[];
  createdAt: string;
}

export interface LastMilePorts {
  execute(action: PlannedAction): Promise<ToolExecutionResult>;
  observe(action: PlannedAction, result: ToolExecutionResult): Promise<Observation>;
  verify(action: PlannedAction, result: ToolExecutionResult, observation: Observation): Promise<Verification>;
  recordReceipt(receipt: WorkReceipt): Promise<void>;
  updateMemory(receipt: WorkReceipt): Promise<void>;
}

export const LAST_MILE_RULES = {
  sequence: [
    'AI_THINKS',
    'AUTHORITY_KERNEL_CHECKS',
    'AUTHORIZED_TOOL_ACTS',
    'SYSTEM_OBSERVES_REAL_RESULT',
    'EVIDENCE_VERIFIES_RESULT',
    'RECEIPT_RECORDS_RESULT',
    'MEMORY_UPDATES_FROM_RECEIPT',
  ],
  invariants: [
    'No tool execution before authority approval.',
    'A tool response alone is not proof of the external result.',
    'Memory updates only from a recorded evidence-backed receipt.',
    'Failed or denied actions remain visible and must not be remembered as completed.',
    'Irreversible actions require an explicit authority decision before execution.',
  ],
} as const;

export async function runLastMile(
  action: PlannedAction,
  ports: LastMilePorts,
): Promise<WorkReceipt> {
  const authority = authorizeAction(action.authority);

  if (!authority.allowed) {
    const receipt: WorkReceipt = {
      actionId: action.id,
      intent: action.intent,
      state: 'DENIED',
      authority,
      expectedOutcome: action.expectedOutcome,
      evidenceRefs: action.authority.evidenceRefs,
      createdAt: new Date().toISOString(),
    };
    await ports.recordReceipt(receipt);
    return receipt;
  }

  const result = await ports.execute(action);
  if (!result.ok) {
    const receipt: WorkReceipt = {
      actionId: action.id,
      intent: action.intent,
      state: 'FAILED',
      authority,
      expectedOutcome: action.expectedOutcome,
      observedOutcome: result.error || 'Tool execution failed.',
      evidenceRefs: [...action.authority.evidenceRefs, ...result.externalEvidenceRefs],
      createdAt: new Date().toISOString(),
    };
    await ports.recordReceipt(receipt);
    return receipt;
  }

  const observation = await ports.observe(action, result);
  const verification = await ports.verify(action, result, observation);

  const receipt: WorkReceipt = {
    actionId: action.id,
    intent: action.intent,
    state: verification.verified ? 'RECEIPT_RECORDED' : 'FAILED',
    authority,
    expectedOutcome: action.expectedOutcome,
    observedOutcome: observation.summary,
    evidenceRefs: [
      ...new Set([
        ...action.authority.evidenceRefs,
        ...result.externalEvidenceRefs,
        ...observation.evidenceRefs,
        ...verification.evidenceRefs,
      ]),
    ],
    createdAt: new Date().toISOString(),
  };

  await ports.recordReceipt(receipt);

  if (verification.verified) {
    await ports.updateMemory({ ...receipt, state: 'MEMORY_UPDATED' });
    return { ...receipt, state: 'MEMORY_UPDATED' };
  }

  return receipt;
}
