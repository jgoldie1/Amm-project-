import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'

const root = process.cwd()
const dataFabric = fs.readFileSync(path.join(root, 'src/runtime/StubbsDataFabric.ts'), 'utf8')
const commerce = fs.readFileSync(path.join(root, 'src/runtime/GlobalBusinessCommerce.ts'), 'utf8')
const ontology = fs.readFileSync(path.join(root, 'src/runtime/StubbsOperationalOntology.ts'), 'utf8')

for (const token of [
  'SOURCE_REGISTRATION_REQUIRED',
  'PURPOSE_LIMITATION_REQUIRED',
  'LEAST_PRIVILEGE_ACCESS',
  'LINEAGE_REQUIRED',
  'DATA_MINIMIZATION',
  'AUTOMATIC_EXPIRATION',
  'RESTRICTED_FEEDS_REQUIRE_AUTHORIZATION',
]) assert.ok(dataFabric.includes(token), `Missing data-fabric guardrail ${token}`)

for (const token of [
  'LICENSED_PAYMENT_PROVIDER_FOR_REAL_MONEY',
  'SERVER_AUTHORITATIVE_LEDGER',
  'STREET_CREDIT_NOT_CASH_CONVERTIBLE',
  'PAYABLE_REQUIRES_VERIFIED_TRANSACTION',
  'DISCLOSED_SCOUT_COMMISSIONS',
  'KYC_KYB_WHERE_REQUIRED',
  'SANCTIONS_AND_COUNTRY_CONTROLS',
  'CHARGEBACK_AND_REFUND_CONTROLS',
  'NO_CLIENT_AUTHORITY_OVER_PAYABLE_BALANCE',
]) assert.ok(commerce.includes(token), `Missing commerce guardrail ${token}`)

for (const token of [
  'DIRECTORY',
  'BUSINESS_PASSPORT',
  'DIGITAL_TWIN',
  'PLANET_CLONE',
  'MARKETPLACE',
  'DELIVERY',
  'HOLO_ADS',
  'MIDDLEVERSE_JOBS',
  'SUPPLIER_NETWORK',
  'CONTRACT_OPPORTUNITIES',
  'VERIFIED_SETTLEMENT',
]) assert.ok(commerce.includes(token), `Missing business growth step ${token}`)

for (const token of [
  'COVERT_PERSON_TRACKING',
  'PRIVATE_COMMUNICATION_INTERCEPTION',
  'BIOMETRIC_MASS_SURVEILLANCE',
  'AUTONOMOUS_HIGH_IMPACT_ENFORCEMENT',
]) assert.ok(ontology.includes(token), `Missing operational safety boundary ${token}`)

console.log('Stubbs Data Fabric + Global Business Commerce contract passed')
