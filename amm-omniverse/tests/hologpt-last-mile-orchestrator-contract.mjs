import { runLastMile, LAST_MILE_RULES } from '../src/runtime/HoloGPTLastMileOrchestrator.ts';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

let executions = 0;
let memoryUpdates = 0;
const receipts = [];

const ports = {
  async execute() { executions += 1; return { ok: true, externalEvidenceRefs: ['tool:1'] }; },
  async observe() { return { observed: true, summary: 'external result observed', evidenceRefs: ['observe:1'] }; },
  async verify() { return { verified: true, summary: 'result verified', evidenceRefs: ['verify:1'] }; },
  async recordReceipt(receipt) { receipts.push(receipt); },
  async updateMemory() { memoryUpdates += 1; },
};

const allowed = await runLastMile({
  id:'allowed',
  intent:'perform reversible authorized update',
  expectedOutcome:'update exists',
  reversible:true,
  authority:{id:'a1',actor:'jarvis',action:'update',risk:'REVERSIBLE_WRITE',ownerApproved:false,permissionGranted:true,evidenceRefs:['approval-scope:1']},
}, ports);
assert(allowed.state === 'MEMORY_UPDATED', 'verified action should update memory');
assert(executions === 1 && memoryUpdates === 1, 'authorized verified action should execute and update memory');
assert(allowed.evidenceRefs.includes('verify:1'), 'verification evidence must reach receipt');

const denied = await runLastMile({
  id:'denied',
  intent:'transfer money',
  expectedOutcome:'funds moved',
  reversible:false,
  authority:{id:'a2',actor:'jarvis',action:'transfer funds',risk:'FINANCIAL',ownerApproved:false,permissionGranted:true,evidenceRefs:[]},
}, ports);
assert(denied.state === 'DENIED', 'unapproved financial action must be denied');
assert(executions === 1, 'denied action must never reach tool execution');
assert(memoryUpdates === 1, 'denied action must never update completion memory');

assert(LAST_MILE_RULES.invariants.includes('Memory updates only from a recorded evidence-backed receipt.'), 'memory receipt invariant missing');

console.log('HoloGPT Last Mile Orchestrator contract: PASS');
