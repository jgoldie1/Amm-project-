/** TRYAMM Guardian Covenant / Decentralized AI Constitution operational guard.
 * Internal governance is not a declaration of legal compliance.
 * Enforce again on the authenticated server; this helper is not a trust boundary. */
import {evaluatePassport,type HoloServicePassport,type PassportService} from './holoServicePassport'
export const TRYAMM_CONSTITUTION_RULES={
 noUnauthorizedLaunch:'No unauthorized launch',
 protectHumanLife:'Protect human life',
 guardianCovenant:'Guardian Covenant human authorization checkpoint',
 auditSensitiveActions:'Sensitive actions require accountable audit evidence',
 privacyAndConsent:'Honor consent withdrawal, privacy and minimal disclosure',
 realVsSimulation:'Simulated value, dispatch and tracking never count as real',
 unifiedValueLedger:'Real money transitions require provider and ledger reconciliation'
} as const
export type GovernedAction='publish-provider'|'publish-farm'|'advertisement'|'dispatch-ride'|'dispatch-delivery'|'dispatch-freight'|'dispatch-drone'|'charge-payment'|'issue-refund'
export type ComplianceEvidence={
 humanApproved:boolean;humanApproverId:string|null;
 policyVersion:string;policyReviewReference:string|null;
 riskReviewed:boolean;consentCurrent:boolean;
 privacyReviewReference:string|null;
 incidentEscalationAvailable:boolean;
 authorizationReference:string|null;
 auditRecordReference:string|null;
 providerResponseVerified:boolean;
 valueLedgerReference:string|null;
 simulation:boolean
}
const paidActions=new Set<GovernedAction>(['charge-payment','issue-refund','advertisement'])
const safetyCritical=new Set<GovernedAction>(['dispatch-ride','dispatch-delivery','dispatch-freight','dispatch-drone'])
export function evaluateGuardianCovenant(action:GovernedAction,e:ComplianceEvidence){
 const checks:Record<string,boolean>={
  noUnauthorizedLaunch:e.humanApproved&&!!e.humanApproverId?.trim()&&!!e.authorizationReference?.trim(),
  riskReviewed:e.riskReviewed&&!!e.policyReviewReference?.trim()&&!!e.policyVersion.trim(),
  privacyAndConsent:e.consentCurrent&&!!e.privacyReviewReference?.trim(),
  auditSensitiveActions:!!e.auditRecordReference?.trim(),
  providerResponseVerified:e.providerResponseVerified,
  realVsSimulation:!e.simulation,
  protectHumanLife:!safetyCritical.has(action)||e.incidentEscalationAvailable,
  unifiedValueLedger:!paidActions.has(action)||!!e.valueLedgerReference?.trim()
 }
 const missing=Object.keys(checks).filter(k=>!checks[k])
 return {allowed:missing.length===0,missing,ruleSet:'TRYAMM Guardian Covenant'}
}
export function authorizeGovernedHoloAction(p:HoloServicePassport,service:PassportService,region:string,action:GovernedAction,e:ComplianceEvidence,now=new Date()){
 const passport=evaluatePassport(p,service,region,now)
 const governance=evaluateGuardianCovenant(action,e)
 return {allowed:passport.approved&&governance.allowed,
  missing:[...passport.missing.map(k=>'passport:'+k),...governance.missing.map(k=>'covenant:'+k)]}
}
