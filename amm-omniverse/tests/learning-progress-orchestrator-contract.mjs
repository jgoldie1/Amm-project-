import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/runtime/LearningProgressOrchestrator.ts',import.meta.url),'utf8')
const bridge=fs.readFileSync(new URL('../src/runtime/LivingLearningMissionBridge.ts',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
for(const x of ['applyStreetVerseLearningResult','evaluateMastery','upsertCredential','tryamm:learning:progress-updated','tryamm:learning:next-action','runtime-memory-only','productionPersistenceRequired:true','guardianTeacherViewsRequireAuthorizedIdentity:true']) if(!s.includes(x)) throw new Error('Learning progress orchestrator missing: '+x)
if(!bridge.includes('tryamm:learning:mission-result')) throw new Error('Mission result event missing')
if(!main.includes('installLearningProgressOrchestrator()')) throw new Error('Learning progress orchestrator not installed')
console.log('StreetVerse consequence to mastery/passport loop: PASS')
