import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/education/completeEducationPackage.ts',import.meta.url),'utf8')
for(const x of ['curriculum','student-dashboard','lesson-practice-homework','streetverse-simulation','assessment-mastery-reteach','learning-passport','accessibility','youth-safety','teacher-human-review','persistent-student-records','guardian-family-portal','standards-mapping','school-sis-lms','accreditation','official-degree-credit','proctored-exams','buildCourseMissionSequence','STREETVERSE_MISSION','WORLD_CONSEQUENCE','DIFFERENT_RETRY','HUMAN_REVIEW_WHEN_REQUIRED','XP_HOLO_CREDITS_NON_CASH']) if(!s.includes(x)) throw new Error('Complete education package missing: '+x)
if(!s.includes("complete:!blockers.length")) throw new Error('Release readiness truth gate missing')
console.log('Complete education gameplay package contract: PASS')
