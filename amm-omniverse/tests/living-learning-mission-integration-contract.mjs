import fs from 'node:fs'
const bridge=fs.readFileSync(new URL('../src/runtime/LivingLearningMissionBridge.ts',import.meta.url),'utf8')
const ui=fs.readFileSync(new URL('../src/components/StudentMissionClassroom.tsx',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
for(const x of ['compileLearningMission','recommendMissionFromMastery','recordLearningMissionEvidence','Neighborhood Budget Run','Creator Rights Studio Mission','Career Pathway Mission','Business Readiness Mission','oneHandABC:true','voiceReady:true','learning-passport','tryamm:learning:mission-ready']) if(!bridge.includes(x)) throw new Error('Living learning bridge missing: '+x)
for(const x of ['tryamm:learning:mission-request','budget-builder']) if(!ui.includes(x)) throw new Error('Classroom mission launch missing: '+x)
if(!main.includes('installLivingLearningMissionBridge()')) throw new Error('Living learning bridge not installed')
console.log('Living learning mission integration: PASS')
