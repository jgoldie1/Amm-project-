'use strict'
// OmniCare360 clinical launch gate: a specification and a guardrail, NOT a clinical service.
// Evidence is supplied by accountable reviewers and must be independently validated.
// Never persist PHI, patient identifiers, credentials, consent payloads or clinical notes here.
const REQUIREMENTS = Object.freeze([
  ['role_and_scope','HIPAA/FTC/state applicability and clinical operating model signed off','legal'],
  ['clinical_entity','Licensed clinical operator and malpractice coverage verified','clinical'],
  ['licensing','Provider credentialing and patient-location authorization verified','clinical'],
  ['identity','Patient and clinician identity proofing, MFA, access lifecycle reviewed','security'],
  ['privacy_notice','HIPAA Notice of Privacy Practices or applicable consumer privacy notice reviewed','privacy'],
  ['consent','Documented jurisdiction-specific consent and guardian workflows reviewed','clinical'],
  ['scheduling','Appointment, cancellations, time zones and notifications tested','operations'],
  ['video','Vendor-approved private video/audio and accessibility testing completed','technical'],
  ['baas','Required hosting, video, EHR, AI, transcription and support BAAs executed','legal'],
  ['ehr','Authorized provider EHR/clinical documentation and access-review integration tested','clinical'],
  ['data_isolation','PHI excluded from AI Commons, Mycelium, game, advertising, analytics and trading','security'],
  ['security','Risk analysis, access audits, encryption, retention and vulnerability testing approved','security'],
  ['incident','Breach response, support escalation, recovery and notification drills passed','security'],
  ['clinical_safety','Emergency escalation, follow-up, prescribing and nonclinical scope reviewed','clinical'],
  ['accessibility','One-hand, keyboard, captions, screen-reader, audio-only and low-bandwidth tested','accessibility'],
  ['billing','Price, refund, eligibility, payer and financial disclosures authorized','operations'],
  ['production','Independent legal, security, clinical, privacy and owner go-live approvals','governance']
].map(([id, label, owner]) => Object.freeze({ id, label, owner })))
const VALID_IDS = new Set(REQUIREMENTS.map(x=>x.id))
function readiness(evidence = {}) {
  const safe = evidence && typeof evidence === 'object' && !Array.isArray(evidence) ? evidence : {}
  const states = REQUIREMENTS.map(req => {
    // Developer assertions alone are NOT regulatory evidence: a reviewer id and evidence reference are required.
    const item = safe[req.id]
    const verified = Boolean(item && item.approved === true && typeof item.reviewer === 'string' &&
      item.reviewer.trim().length >= 2 && typeof item.evidenceRef === 'string' && item.evidenceRef.trim().length >= 6 &&
      item.independentReview === true)
    return { ...req, status: verified ? 'claimed_reviewed' : 'missing' }
  })
  // A full matrix of reviewer claims is NOT sufficient to enable clinical operations.
  return { clinicalEnabled: false, readyForIndependentAudit: states.every(x => x.status === 'claimed_reviewed'),
    requirements: states, missing: states.filter(x => x.status !== 'claimed_reviewed').map(x => x.id),
    note: 'Claimed evidence is not independently authenticated. Clinical service remains disabled pending separate audited deployment.' }
}
function handleClinicalRequest(request = {}) {
  // A public facade must never start a session based on unverified browser flags.
  const action = String(request.action || '')
  if (!['public_information','care_access_preview'].includes(action)) return { allowed:false, code:'CLINICAL_SERVICE_DISABLED' }
  if (request.containsHealthData === true || request.patientId || request.clinicianId || request.sessionToken)
    return { allowed:false, code:'SENSITIVE_DATA_REJECTED' }
  return { allowed:true, code:'PUBLIC_INFORMATION_ONLY' }
}
module.exports = { REQUIREMENTS, VALID_IDS, readiness, handleClinicalRequest }
