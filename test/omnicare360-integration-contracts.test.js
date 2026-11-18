'use strict'
const assert=require('node:assert/strict')
const {REQUIRED_PROVIDER,REQUIRED_VENDOR,REQUIRED_CLINICAL,credentialReview,vendorReview,clinicalSessionPolicy,publicDirectoryCandidate}=require('../lib/omnicare360-integration-contracts')
assert.ok(REQUIRED_PROVIDER.length>=8)
assert.ok(REQUIRED_VENDOR.length>=8)
assert.ok(REQUIRED_CLINICAL.length>=8)
assert.equal(credentialReview({}).reviewComplete,false)
assert.equal(vendorReview({}).reviewComplete,false)
assert.equal(vendorReview({baaDetermination:'not_required_with_legal_basis'}).reviewComplete,false)
assert.equal(publicDirectoryCandidate({}).publishable,false)
assert.equal(clinicalSessionPolicy({}).allowed,false)
for(const field of ['patientId','patientName','dateOfBirth','symptoms','diagnosis','medication','medicalHistory','sessionToken','accessToken','notes']) {
 assert.equal(clinicalSessionPolicy({[field]:'test'}).reason,'patient-information-not-permitted-in-tryamm',field)
}
const provider={organizationId:'org-test',providerRef:'provider-test',profession:'MD',licenseState:'IL',licenseNumberVerifiedBy:'reviewer',licenseVerifiedAt:'2026-11-17',licenseExpiresAt:'2030-12-31',malpracticeVerifiedAt:'2026-11-17',clinicalSupervisorApproved:true}
assert.equal(credentialReview(provider).reviewComplete,true)
assert.equal(publicDirectoryCandidate({...provider,publicListingConsent:true,directoryApproved:true}).publishable,true)
assert.equal(publicDirectoryCandidate({...provider,publicListingConsent:false,directoryApproved:true}).publishable,false)
console.log('OmniCare360 integration contract checks passed: unreviewed clinical workflows remain blocked')
