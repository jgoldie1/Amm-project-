import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../src/runtime/FounderAdminAgent.ts', import.meta.url), 'utf8');
const highRiskBlock = source.slice(source.indexOf("return {\n      allowed: false"));

assert.ok(source.includes("'MOVE_REAL_MONEY'"));
assert.ok(highRiskBlock.includes('allowed: false'));
assert.ok(highRiskBlock.includes('requiresFounderApproval: true'));
assert.match(highRiskBlock, /real-money actions/);

console.log('Founder Admin Agent real-money fail-closed contract: PASS');
