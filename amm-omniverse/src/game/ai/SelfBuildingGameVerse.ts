import { createRepairCandidate, evaluateRepair, evaluateCanary, type HealthSignal, type VerificationEvidence } from '../../runtime/SelfHealingRuntime'

export type GeneratedContentKind='mission'|'quest'|'npc-dialogue'|'world-event'|'balance-proposal'|'asset-manifest'|'test-fixture'|'localization'

export type GeneratedContentCandidate={
  id:string
  kind:GeneratedContentKind
  title:string
  payload:Record<string,unknown>
  sourcePrompt:string
  rulesVersion:string
  generatedAt:number
  safetyTags:string[]
  requiresHumanReview:boolean
}

export function createContentCandidate(input:Omit<GeneratedContentCandidate,'id'|'generatedAt'>):GeneratedContentCandidate{
  return {...input,id:`gamegen-${input.kind}-${Date.now()}`,generatedAt:Date.now()}
}

export function validateContentCandidate(candidate:GeneratedContentCandidate){
  const blockedKeys=['realMoneyStatBoost','bypassModeration','grantEntitlement','grantCurrency','overrideInventory','disableAgeGate']
  const payload=JSON.stringify(candidate.payload)
  const violations=blockedKeys.filter(k=>payload.includes(k))
  return {
    valid:violations.length===0,
    violations,
    requiresHumanReview:candidate.requiresHumanReview||candidate.kind==='balance-proposal',
  }
}

export function buildGameRepairSignal(gameId:string,kind:string,message:string,severity:'warning'|'error'|'critical'='error'):HealthSignal{
  return {id:`game-${gameId}-${kind}-${Date.now()}`,subsystem:`game:${gameId}`,kind,severity,message,occurredAt:Date.now()}
}

export function planGameRepair(signal:HealthSignal,evidence:Partial<VerificationEvidence>={}){
  const candidate=createRepairCandidate(signal,{touchesCompetitiveState:signal.kind.includes('balance')||signal.kind.includes('economy')})
  return {candidate,decision:evaluateRepair(candidate,evidence)}
}

export function promoteGameCandidate(evidence:VerificationEvidence){
  return evaluateCanary(evidence)
}

export const GAMEVERSE_AI_FACTORY={
  canGenerate:['missions','quests','npc-dialogue','localized-dialogue','world-events','test-fixtures','asset-manifest-candidates','balance-proposals'],
  canAutoRepair:['stuck-npc-reset','broken-spawn-fallback','provider-failover','safe-feature-disable','server-worker-restart','rollback'],
  requiresVerification:['code-patches','mission-logic-changes','save-schema-changes','multiplayer-changes','anti-cheat-rules','balance-changes'],
  neverAutoChange:['real-money-economy','wallet-balances','paid-entitlements','player-owned-items','moderation-bans','age-safety-rules'],
  lifecycle:['observe','diagnose','generate-candidate','quantum-sandbox','second-brain-review','spider-sense','tests','canary','promote-or-rollback','audit'],
} as const
