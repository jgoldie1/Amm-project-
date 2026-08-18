import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readinessPath = path.join(root, 'src/runtime/productionReadiness.ts');
if (!fs.existsSync(readinessPath)) throw new Error('Missing production readiness registry.');

const source = fs.readFileSync(readinessPath, 'utf8');
const forbiddenLive = [
  'telehealth','medicaid','telelaw','tax-bookkeeping','insurance-realty','remote-notary',
  'drone-robot','ios-android','jin-pay','live-streaming'
];

for (const id of forbiddenLive) {
  const pattern = new RegExp(`id:\\s*['\"]${id}['\"][\\s\\S]{0,500}?state:\\s*['\"]LIVE['\"]`);
  if (pattern.test(source)) {
    throw new Error(`High-risk/external feature ${id} cannot be marked LIVE without external production evidence.`);
  }
}

const requiredIds = [
  'core-web','accessibility-passport','business-jarvis','trust-core','marketplace','holo-delivery',
  'money-engine','sustainability','business-launch','domain-dns','quantum-zapier','quantum-discord'
];
for (const id of requiredIds) {
  if (!source.includes(`id: '${id}'`) && !source.includes(`id: \"${id}\"`)) {
    throw new Error(`Readiness registry missing required feature: ${id}`);
  }
}

console.log('production-readiness: registry integrity OK');
