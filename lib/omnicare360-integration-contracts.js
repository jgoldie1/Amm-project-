'use strict'
// OmniCare360 integration contracts. Only opaque configuration metadata lives here.
// No patient data or clinical operation is allowed in the general TRYAMM runtime.
const REQUIRED_PROVIDER = Object.freeze([
  'organizationId','providerRef','profession','licenseState','licenseNumberVerifiedBy',
  'licenseVerifiedAt','licenseExpiresAt','malpracticeVerifiedAt','clinicalSupervisorApproved'
])
const REQUIRED_VENDOR = Object.freeze([
  'vendorRef','purpose','dataCategory','contractOwner','securityReviewRef',
  'subprocessorReviewRef','baaDetermination','baaEvidenceRef','approvedBy'
])
const REQUIRED_CLINICAL = Object.freeze([
  'providerRef','patientLocationState','patientIdentityVerified','providerIdentityVerified',
  'telehealthConsentRef','privacyNoticeVersion','guardianReviewComplete',
  'appointmentRef','clinicalSystemRef','authorizationReviewRef'
])
function nonBlank(value){return typeof value==='string'&&value.trim().length>0}
function isDate(value){return nonBlank(value)&&/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)&&!Number.isNaN(Date.parse(value))}
function credentialReview(record={}){
  const missing = REQUIRED_PROVIDER.filter(key=>key==='clinicalSupervisorApproved'?record[key]!==true:!nonBlank(record[key]))
  if(!isDate(record.licenseVerifiedAt)||!isDate(record.licenseExpiresAt)||!isDate(record.malpracticeVerifiedAt))missing.push('validVerificationDates')
  if(isDate(record.licenseExpiresAt)&&Date.parse(record.licenseExpiresAt)<Date.now())missing.push('unexpiredLicense')
  return {reviewComplete:missing.length===0,missing:[...new Set(missing)],disclaimer:'Claims require independent board/source check and signed clinical approval.'}
}
function vendorReview(record={}){
  const missing = REQUIRED_VENDOR.filter(key=>!nonBlank(record[key]))
  if(record.baaDetermination!=='required'&&record.baaDetermination!=='not_required_with_legal_basis')missing.push('legalBaaDetermination')
  if(record.baaDetermination==='not_required_with_legal_basis'&&!nonBlank(record.legalBasisRef))missing.push('legalBasisRef')
  return {reviewComplete:missing.length===0,missing:[...new Set(missing)],disclaimer:'Document references do not prove executed agreements or security controls.'}
}
function clinicalSessionPolicy(request={}){
  // Reject all patient-bearing actions at this layer. A separate, reviewed clinical service is required.
  const forbidden=['patientId','patientName','dateOfBirth','symptoms','diagnosis','medication','medicalHistory','sessionToken','accessToken','notes']
  if(forbidden.some(key=>Object.prototype.hasOwnProperty.call(request,key)))return {allowed:false,reason:'patient-information-not-permitted-in-tryamm'}
  return {allowed:false,reason:'clinical-service-not-implemented',required:REQUIRED_CLINICAL}
}
function publicDirectoryCandidate(provider={}){
  // Public listing contains only the minimum nonclinical professional metadata; never publish automatically.
  const review=credentialReview(provider)
  if(!review.reviewComplete||provider.publicListingConsent!==true||provider.directoryApproved!==true)
    return {publishable:false,reason:'credential-and-publication-review-incomplete'}
  return {publishable:true,reason:'eligible-for-human-reviewed-directory-publishing-only'}
}
module.exports={REQUIRED_PROVIDER,REQUIRED_VENDOR,REQUIRED_CLINICAL,credentialReview,vendorReview,clinicalSessionPolicy,publicDirectoryCandidate}
