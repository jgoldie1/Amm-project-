import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/runtime/HoloGPTAutonomousRepairEngine.ts',import.meta.url),'utf8')
for(const x of ['EVIDENCE_FIRST','CAPTURE_EXACT_ERROR','CHECK_PRIOR_FAILED_ATTEMPTS','PROPOSE_MINIMUM_REVERSIBLE_PATCH','RUN_NARROW_TEST','RUN_FULL_REQUIRED_TESTS','VERIFY_EXACT_SHA','repair attempt budget exhausted','same failed repair path repeated','no-random-large-feature-batch-during-repair','no-claim-of-success-without-evidence'])if(!s.includes(x))throw new Error('repair engine contract missing: '+x)
console.log('HoloGPT autonomous repair engine contract: PASS')
