import fs from 'node:fs'
import assert from 'node:assert/strict'

const source = fs.readFileSync(new URL('../src/mobility/tryammCarShare.ts', import.meta.url), 'utf8')

assert.match(source, /serverAuthoritativeBookings: true/)
assert.match(source, /serverAuthoritativePayments: true/)
assert.match(source, /identityVerificationRequired: true/)
assert.match(source, /driverEligibilityVerificationRequired: true/)
assert.match(source, /protectionOrInsuranceVerificationRequired: true/)
assert.match(source, /ownerVehicleVerificationRequired: true/)
assert.match(source, /paymentCaptureClientSide: false/)
assert.match(source, /rawIdentityDocumentRetention: false/)
assert.match(source, /liveUntilComplianceVerified: false/)
assert.match(source, /calculateRentalSubtotalCents/)
assert.match(source, /canApproveBooking/)

console.log('TRYAMM car share contract: PASS')
