import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/runtime/OmniAfterDarkMissionRuntime.ts',import.meta.url),'utf8')
for(const x of ['after-dark-white-night-file','after-dark-night-market','after-dark-creator-run','after-dark-safe-ride',"oneHandChoices:['A','B','C']",'financialReward:false','21+ age gate and consent required','Mission XP and Holo Credits are non-cash rewards','never create a payable balance']) if(!s.includes(x)) throw new Error('Omni After Dark contract missing: '+x)
if(/financialReward:\s*true/.test(s)) throw new Error('After Dark mission must not silently create cash rewards')
console.log('Omni After Dark mission contract: PASS')
