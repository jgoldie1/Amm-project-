import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const gatewayPath = path.join(root, 'src/runtime/providerGateway.ts');
if (!fs.existsSync(gatewayPath)) throw new Error('Missing provider gateway.');
const source = fs.readFileSync(gatewayPath, 'utf8');

const requiredProviderKinds = [
  'payments','registrar','maps','delivery','live_video','telehealth','medicaid_billing','telelaw',
  'tax','insurance','realty','remote_notary','identity','app_store','drone_robot','data'
];
for (const kind of requiredProviderKinds) {
  if (!source.includes(`'${kind}'`)) throw new Error(`Provider gateway missing kind: ${kind}`);
}

const requiredHighRiskFeatures = [
  'jin-pay','holo-delivery','marketplace','live-streaming','telehealth','medicaid','telelaw',
  'tax-bookkeeping','insurance-realty','remote-notary','drone-robot','ios-android'
];
for (const id of requiredHighRiskFeatures) {
  if (!source.includes(`'${id}'`)) throw new Error(`Provider gateway missing protected feature: ${id}`);
}

for (const phrase of [
  'Regulatory approval/enrollment evidence is required.',
  'High-risk feature requires end-to-end test evidence.',
  'High-risk feature requires production monitoring evidence.',
  'High-risk feature requires rollback/kill-switch evidence.'
]) {
  if (!source.includes(phrase)) throw new Error(`Provider gateway missing gate: ${phrase}`);
}

console.log('provider-gates: contract integrity OK');
