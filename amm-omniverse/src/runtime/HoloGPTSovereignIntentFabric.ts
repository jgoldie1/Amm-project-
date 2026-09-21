export type HoloCapability =
  | 'reasoning' | 'web-search' | 'vision' | 'speech' | 'image-generation' | 'video-generation'
  | 'file-analysis' | 'data-analysis' | 'coding' | 'agent-actions' | 'translation' | '3d-generation'
  | 'streetverse' | 'commerce' | 'communications' | 'digital-ownership'

export type HoloInputKind =
  | 'text' | 'voice' | 'camera' | 'image' | 'pdf' | 'docx' | 'txt' | 'csv' | 'xlsx'
  | 'pptx' | 'audio' | 'video' | 'code' | 'repository' | 'cloud-file'

export type CapabilityProvider = {
  id: string
  capabilities: HoloCapability[]
  inputKinds: HoloInputKind[]
  priority: number
  enabled: boolean
  dataClass: 'LOCAL' | 'PRIVATE_CLOUD' | 'APPROVED_EXTERNAL'
}

export type IntentStep = {
  id: string
  capability: HoloCapability
  instruction: string
  risk: 'READ_ONLY' | 'REVERSIBLE_WRITE' | 'FINANCIAL' | 'PUBLICATION' | 'EXTERNAL_COMMUNICATION'
  requiresApproval: boolean
}

export type IntentPlan = {
  intentId: string
  goal: string
  steps: IntentStep[]
  createdAt: string
}

const providers = new Map<string, CapabilityProvider>()

export function registerHoloCapabilityProvider(provider: CapabilityProvider) {
  if (!provider.id) throw new Error('provider id required')
  providers.set(provider.id, provider)
  return provider
}

export function routeHoloCapability(capability: HoloCapability, inputKind: HoloInputKind) {
  return [...providers.values()]
    .filter(p => p.enabled && p.capabilities.includes(capability) && p.inputKinds.includes(inputKind))
    .sort((a, b) => a.priority - b.priority)[0] ?? null
}

export function enforceIntentApproval(step: IntentStep, approvedStepIds: ReadonlySet<string>) {
  const highImpact = step.risk === 'FINANCIAL' || step.risk === 'PUBLICATION' || step.risk === 'EXTERNAL_COMMUNICATION'
  if ((step.requiresApproval || highImpact) && !approvedStepIds.has(step.id)) throw new Error('human approval required')
  return step
}

export type VaultRecord = {
  id: string
  ownerId: string
  kind: HoloInputKind
  contentHash: string
  retention: 'SESSION' | 'PROJECT' | 'USER_PINNED' | 'LEGAL_REQUIRED'
  permissions: string[]
  expiresAt?: string
}

export function validateVaultRecord(record: VaultRecord) {
  if (!record.id || !record.ownerId || !record.contentHash) throw new Error('vault provenance required')
  if (record.retention === 'SESSION' && !record.expiresAt) throw new Error('session records require expiry')
  return record
}

/**
 * Sovereign Intent Fabric:
 * One user goal can compile into an inspectable, permissioned plan across AI,
 * files, worlds, commerce, communications and digital ownership.
 * HoloGPT must show the plan, require approval for high-impact actions,
 * preserve receipts, and allow provider replacement without changing user intent.
 */
export const SOVEREIGN_INTENT_FABRIC = {
  principles: [
    'intent-is-portable-across-model-providers',
    'files-enter-through-a-permissioned-vault',
    'minimum-necessary-data-is-shared',
    'high-impact-actions-require-human-approval',
    'every-action-produces-an-auditable-receipt',
    'world-commerce-and-ownership-actions-share-one-intent-plan',
    'provider-failure-can-fall-back-without-silently-changing-the-goal',
  ],
  example:
    'Read my business plan -> identify missing items -> build approved storefront draft -> create Digital Twin draft -> prepare campaign assets -> stage StreetVerse experience -> show every external/financial action for approval.',
} as const
