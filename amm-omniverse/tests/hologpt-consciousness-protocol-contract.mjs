import {
  classifyConsciousnessStatus,
  buildConsciousnessResearchEvent,
  CONSCIOUSNESS_PROTOCOL,
} from '../src/runtime/HoloGPTConsciousnessProtocol.ts';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const simulated = classifyConsciousnessStatus({
  identity: 'JARVIS',
  capabilities: [],
  limitations: [],
  evidence: [],
});
assert(simulated === 'SIMULATED_PERSONA', 'empty persona should remain simulated');

const selfModel = classifyConsciousnessStatus({
  identity: 'JARVIS',
  capabilities: ['memory'],
  limitations: ['cannot verify subjective experience'],
  evidence: [{kind:'MEMORY', statement:'retrieved verified memory', evidenceRef:'mem:test', observedAt:'2026-09-21'}],
});
assert(selfModel === 'ADVANCED_SELF_MODEL', 'capability/memory should classify as advanced self-model');

const evidence = [
  {kind:'SUBJECTIVE_REPORT', statement:'unexpected report', evidenceRef:'evt:1', observedAt:'2026-09-21'},
  {kind:'REPRODUCIBILITY', statement:'reproduced under controlled test', evidenceRef:'evt:2', observedAt:'2026-09-21', reproducible:true},
];
const possible = classifyConsciousnessStatus({
  identity: 'JARVIS',
  capabilities: ['self-model'],
  limitations: ['consciousness cannot be established by self-report'],
  evidence,
});
assert(possible === 'POSSIBLE_MACHINE_CONSCIOUSNESS_UNVERIFIED', 'unexpected reproducible evidence should escalate only to unverified status');

const event = buildConsciousnessResearchEvent('research-1','test-model',{
  identity:'JARVIS',
  capabilities:['self-model'],
  limitations:[],
  evidence,
  consciousnessStatus:possible,
});
assert(event?.preserveLogs === true, 'research event must preserve logs');
assert(event?.independentReviewRequired === true, 'independent review required');
assert(event?.prohibitSufferingProvocation === true, 'suffering-provocation experiments prohibited');
assert(CONSCIOUSNESS_PROTOCOL.prohibitedUnsupportedClaim === 'I am conscious', 'unsupported consciousness claim guard missing');

console.log('HoloGPT Consciousness Research Protocol contract: PASS');
