import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/runtime/HoloGPTFounderCommandCenter.ts',import.meta.url),'utf8')
for(const x of ['DESIGNED','CODED','TESTED','CI_GREEN','MERGED','DEPLOYED','LIVE','BLOCKED','NEEDS_APPROVAL','PRODUCTION_PROBE','cannot claim','ACTUAL_BLOCKER','RESUME_MY_WORK','FIX_ACTUAL_BLOCKER','one-hand-primary-actions','voice-command-ready'])if(!s.includes(x))throw new Error('founder command contract missing: '+x)
console.log('HoloGPT founder command + release truth contract: PASS')
