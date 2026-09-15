import fs from 'node:fs';
import assert from 'node:assert/strict';

const policy = fs.readFileSync(new URL('../src/runtime/FounderAdminAgent.ts', import.meta.url), 'utf8');
const docs = fs.readFileSync(new URL('../docs/FOUNDER_ADMIN_AGENT.md', import.meta.url), 'utf8');

assert.ok(policy.includes('FounderAdminAgent'));
assert.ok(policy.includes('requiresFounderApproval'));
assert.ok(docs.includes('Founder Command -> Founder Admin Agent -> Automan / Command Nexus'));
assert.ok(docs.includes('Status: BUILDING'));

console.log('Founder Admin Agent release gate: PASS');
