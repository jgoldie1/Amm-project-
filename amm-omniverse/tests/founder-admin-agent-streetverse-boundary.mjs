import fs from 'node:fs';
import assert from 'node:assert/strict';

const docs = fs.readFileSync(new URL('../docs/FOUNDER_ADMIN_AGENT.md', import.meta.url), 'utf8');
const policy = fs.readFileSync(new URL('../src/runtime/FounderAdminAgent.ts', import.meta.url), 'utf8');

assert.match(docs, /diagnose failures across StreetVerse/i);
assert.ok(policy.includes('DIAGNOSE_FAILURE'));
assert.ok(policy.includes('INSPECT_STATUS'));
assert.ok(policy.includes('DEPLOY_PRODUCTION'));
assert.ok(policy.includes('requiresFounderApproval: true'));

console.log('Founder Admin Agent StreetVerse boundary: PASS');
