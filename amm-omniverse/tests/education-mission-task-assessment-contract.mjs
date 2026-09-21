import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/education/missionTaskAssessmentEngine.ts',import.meta.url),'utf8')
for(const x of ['LESSON','PRACTICE','MISSION','HOMEWORK','QUIZ','TEST','PROJECT','RETEACH_REQUIRED','canAiGrade','Proctored tests require authorized external or human assessment','Human grading required','evaluateMastery','nextLearningAction','homeworkSupportBoundary','EXPLAIN_BACK','STREETVERSE_MISSION','RETEACH_IF_NEEDED','DIFFERENT_RETRY','LEARNING_PASSPORT']) if(!s.includes(x)) throw new Error('Education assessment engine missing: '+x)
if(!s.includes("best >= 80 ? 'MASTERED'")) throw new Error('Mastery threshold contract missing')
console.log('Education mission/task/testing/homework engine: PASS')
