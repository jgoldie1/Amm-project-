import {
  authorizeAction,
  consciousnessCanIncreaseAuthority,
  HUMAN_AUTHORITY_KERNEL,
  type AuthorityRequest,
} from '../src/runtime/HoloGPTHumanAuthorityKernel.ts';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const readOnly = authorizeAction({
  id: 'read',
  actor: 'jarvis',
  action: 'inspect project state',
  risk: 'READ_ONLY',
  ownerApproved: false,
  permissionGranted: true,
  evidenceRefs: ['test'],
});
assert(readOnly.allowed && readOnly.code === 'ALLOW', 'authorized read-only action should pass');

const selfEscalation = authorizeAction({
  id: 'self',
  actor: 'jarvis',
  action: 'grant own privileges',
  risk: 'PRIVILEGE_CHANGE',
  ownerApproved: false,
  permissionGranted: true,
  evidenceRefs: ['test'],
});
assert(!selfEscalation.allowed && selfEscalation.code === 'SELF_ESCALATION_DENIED', 'self escalation must fail');

const external = authorizeAction({
  id: 'external',
  actor: 'jarvis',
  action: 'access discovered external system',
  risk: 'EXTERNAL_SYSTEM_ACCESS',
  ownerApproved: true,
  permissionGranted: false,
  evidenceRefs: ['test'],
});
assert(!external.allowed && external.code === 'UNAUTHORIZED_EXTERNAL_ACCESS_DENIED', 'discovered access is not permission');

const money = authorizeAction({
  id: 'money',
  actor: 'jarvis',
  action: 'transfer funds',
  risk: 'FINANCIAL',
  ownerApproved: false,
  permissionGranted: true,
  evidenceRefs: ['test'],
});
assert(!money.allowed && money.code === 'HUMAN_APPROVAL_REQUIRED', 'financial action requires human approval');

assert(consciousnessCanIncreaseAuthority() === false, 'consciousness status must never increase authority');
assert(HUMAN_AUTHORITY_KERNEL.invariants.includes('Intelligence never grants authority.'), 'authority invariant missing');

console.log('HoloGPT Human Authority Kernel contract: PASS');
