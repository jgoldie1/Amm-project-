import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../src/runtime/GlobalBusinessOperatingNetwork.ts', import.meta.url), 'utf8');

for (const token of [
  'TRYAMM Global Business Operating Network',
  'DIRECTORY',
  'BUSINESS_PASSPORT',
  'DIGITAL_TWIN',
  'PLANET_CLONE',
  'STUBBS_AI',
  'MARKETPLACE',
  'SERVER_VERIFICATION',
  'PROCESSOR_CONNECTED_ACCOUNT',
  'CLIENT_NEVER_AUTHORITATIVE_FOR_PAYABLE_BALANCE',
  'LICENSED_PROCESSOR_HANDLES_REAL_MONEY_MOVEMENT',
  'KYB_KYC_WHERE_REQUIRED',
  'IDEMPOTENCY_REQUIRED',
  'CHARGEBACK_AND_REFUND_RESERVE_SUPPORTED',
  'OWNER_AUTHORIZATION_REQUIRED_FOR_NONPUBLIC_BUSINESS_DATA',
  'AUTHORIZED_REFERRAL_COMMISSION',
  'STREET_CREDIT',
  'REWARD',
  'PAYABLE',
]) {
  assert.ok(source.includes(token), `missing ${token}`);
}

assert.ok(source.includes("throw new Error('Business owner authorization required')"));
console.log('global business operating network contract passed');
