export const HIGH_IMPACT_SUBSYSTEMS = [
  'payments','stripe','flutterwave','cross-border','wallet','wallet-ledger','money-engine','payouts','rewards','gift-economy',
  'identity','auth','permissions','rls','security-definer','moderation-enforcement','competitive-economy','player-inventory',
  'game-reward-reserve','internal-chain','settlements','kyc','aml','sanctions'
] as const

export type GuardEvidence = {
  sandboxPassed?: boolean
  securityPassed?: boolean
  integrationPassed?: boolean
  regressionPassed?: boolean
  canaryHealthy?: boolean
  explicitApproval?: boolean
}

export function isHighImpactSubsystem(subsystem: string) {
  const value = subsystem.toLowerCase()
  return HIGH_IMPACT_SUBSYSTEMS.some(key => value.includes(key))
}

export function canAutoRepair(subsystem: string, action: string) {
  if (isHighImpactSubsystem(subsystem)) return false
  return ['retry','restart-worker','failover-provider','disable-feature','rollback'].includes(action)
}

export function canPromoteRepair(subsystem: string, evidence: GuardEvidence) {
  if (!evidence.sandboxPassed) return { allowed:false, reason:'sandbox verification required' }
  if (!isHighImpactSubsystem(subsystem)) return { allowed:true, reason:'low-impact repair passed sandbox gate' }
  const required: (keyof GuardEvidence)[] = ['securityPassed','integrationPassed','regressionPassed','canaryHealthy','explicitApproval']
  const missing = required.filter(key => evidence[key] !== true)
  return missing.length
    ? { allowed:false, reason:`high-impact promotion blocked: ${missing.join(', ')}` }
    : { allowed:true, reason:'high-impact repair verified and explicitly approved' }
}

export const SELF_REPAIR_LOCK = {
  autoRepair: ['retry','restart-worker','failover-provider','disable-feature','rollback'],
  neverSilentPromotion: HIGH_IMPACT_SUBSYSTEMS,
  rule: 'Low-risk reversible failures may self-repair. Money, identity, permissions, moderation, competitive state and inventory require security/integration/regression evidence, a healthy canary and explicit approval before promotion.'
} as const
