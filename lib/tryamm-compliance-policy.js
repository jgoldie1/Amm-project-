'use strict'
// TRYAMM policy gate: defensive fail-closed layer; NOT a HIPAA compliance certification.
// This module contains no PHI, credentials or real money transaction capability.
const CONTROL_IDS = Object.freeze([
  'legal_role_determined','security_officer_assigned','privacy_officer_assigned',
  'risk_analysis_approved','vendor_inventory_reviewed','required_baas_executed',
  'least_privilege_verified','mfa_verified','encryption_verified',
  'audit_logging_verified','incident_response_tested','breach_notification_plan_approved',
  'backup_restore_tested','retention_deletion_reviewed','patient_notice_consent_reviewed',
  'provider_licensing_verified','clinical_safety_approved','accessibility_tested',
  'device_e2e_tested','human_signoff'
])
const HIGH_RISK = new Set(['clinical_visit','prescribe','clinical_triage','diagnosis','patient_record_access','patient_record_export','health_ai_advice'])
const FINANCE_RISK = new Set(['live_trade','auto_trade','withdraw','transfer_funds','financial_advice','brokerage_account_link'])
const LEGAL_RISK = new Set(['legal_advice','sign_contract','submit_regulatory_filing','represent_as_attorney'])
const LOW_RISK = new Set(['public_info','service_directory','accessibility_help','nonclinical_navigation','draft_marketing','simulation_trade'])
function evaluateAction(input = {}) {
  const action = String(input.action || '')
  const domain = String(input.domain || '')
  if (!action || !domain) return { allowed:false, reason:'invalid-action' }
  if (HIGH_RISK.has(action) || domain === 'clinical') {
    // Clinical transactions must use a separately deployed, audited regulated workflow.
    return { allowed:false, reason:'clinical-workflow-not-certified', required: CONTROL_IDS }
  }
  if (FINANCE_RISK.has(action) || domain === 'brokerage') return { allowed:false, reason:'regulated-financial-action-requires-authorized-provider-and-human-approval' }
  if (LEGAL_RISK.has(action) || domain === 'legal') return { allowed:false, reason:'licensed-professional-or-authorized-person-required' }
  if (action === 'charge_customer' || action === 'publish_campaign' || action === 'bind_partner') return { allowed:false, reason:'explicit-authorization-required' }
  if (LOW_RISK.has(action) && ['public','commerce','education','care_navigation','trading_simulation'].includes(domain)) {
    // A low-risk allowance never authorizes PHI access, payments or regulated activities.
    if (input.containsSensitiveData === true) return { allowed:false, reason:'sensitive-data-not-permitted-on-general-fabric' }
    return { allowed:true, reason:'nonregulated-action-only' }
  }
  return { allowed:false, reason:'unreviewed-action-denied' }
}
function assessLaunch(evidence = {}) {
  const checks = Object.fromEntries(CONTROL_IDS.map(id => [id, evidence[id] === true]))
  return { ready: CONTROL_IDS.every(id => checks[id]), checks, missing: CONTROL_IDS.filter(id => !checks[id]), note:'Documented flags require independent audit evidence and professional review; do not use this result alone as legal certification.' }
}
module.exports = { CONTROL_IDS, evaluateAction, assessLaunch }
