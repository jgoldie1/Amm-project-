import type { Course } from './allAmericanUniversity'
import type { LearningPassport } from './learningPassport'
import type { LearningTask, MasteryRecord } from './missionTaskAssessmentEngine'

export type EducationRole='student'|'guardian'|'teacher'|'instructor'|'advisor'|'admin'
export type EducationPackageState={
 studentId:string
 role:EducationRole
 courseId:string
 moduleIndex:number
 taskQueue:LearningTask[]
 mastery:MasteryRecord[]
 passport:LearningPassport
 attendanceSessions:number
 accommodations:string[]
}

export type EducationPackageCapability={
 id:string
 required:boolean
 status:'CODED'|'GATED'|'EXTERNAL'
 evidence:string
}

export const COMPLETE_EDUCATION_PACKAGE:EducationPackageCapability[]=[
 {id:'curriculum',required:true,status:'CODED',evidence:'All American University course catalog'},
 {id:'student-dashboard',required:true,status:'CODED',evidence:'Student Mission Classroom + Student JARVIS'},
 {id:'lesson-practice-homework',required:true,status:'CODED',evidence:'Mission Task Assessment Engine'},
 {id:'streetverse-simulation',required:true,status:'CODED',evidence:'Living Learning Mission Bridge'},
 {id:'assessment-mastery-reteach',required:true,status:'CODED',evidence:'Mastery records + different retry path'},
 {id:'learning-passport',required:true,status:'CODED',evidence:'Learning Passport credentials/evidence'},
 {id:'accessibility',required:true,status:'CODED',evidence:'one-hand A/B/C + voice-ready + virtual alternative'},
 {id:'youth-safety',required:true,status:'CODED',evidence:'Youth/Family Academy safety contract'},
 {id:'teacher-human-review',required:true,status:'GATED',evidence:'Human grading/instructor verification required where appropriate'},
 {id:'persistent-student-records',required:true,status:'GATED',evidence:'Production identity/storage integration required'},
 {id:'guardian-family-portal',required:true,status:'GATED',evidence:'Production guardian identity/consent UI required'},
 {id:'standards-mapping',required:true,status:'GATED',evidence:'Jurisdiction/grade/course standards must be selected and mapped'},
 {id:'school-sis-lms',required:false,status:'EXTERNAL',evidence:'Requires approved school/provider integration'},
 {id:'accreditation',required:false,status:'EXTERNAL',evidence:'Requires recognized accreditor/education authority; TRYAMM must not self-claim accreditation'},
 {id:'official-degree-credit',required:false,status:'EXTERNAL',evidence:'Requires authorized institution and transfer/credit agreement'},
 {id:'proctored-exams',required:false,status:'EXTERNAL',evidence:'Requires authorized assessment/proctor provider'},
]

export function educationReleaseReadiness(){
 const blockers=COMPLETE_EDUCATION_PACKAGE.filter(x=>x.required&&x.status!=='CODED')
 return {coded:COMPLETE_EDUCATION_PACKAGE.filter(x=>x.status==='CODED').map(x=>x.id),blockers,complete:!blockers.length}
}

export function buildCourseMissionSequence(course:Course,studentId:string):LearningTask[]{
 return course.modules.flatMap((module,index)=>{
  const skillId=`${course.id}:module:${index+1}`
  return [
   {id:`${skillId}:lesson`,courseId:course.id,skillId,title:`${module} • Lesson`,kind:'LESSON',prompt:`Learn and explain the core ideas in ${module}.`,points:10},
   {id:`${skillId}:practice`,courseId:course.id,skillId,title:`${module} • Practice`,kind:'PRACTICE',prompt:`Practice ${module} with feedback.`,points:15},
   {id:`${skillId}:mission`,courseId:course.id,skillId,title:`${module} • StreetVerse Mission`,kind:'MISSION',prompt:`Apply ${module} in a safe fictional StreetVerse simulation.`,points:25},
   {id:`${skillId}:homework`,courseId:course.id,skillId,title:`${module} • Homework`,kind:'HOMEWORK',prompt:`Complete independent evidence for ${module}; AI may coach but may not impersonate the student.`,points:20},
   {id:`${skillId}:quiz`,courseId:course.id,skillId,title:`${module} • Quiz`,kind:'QUIZ',prompt:`Check understanding of ${module} with fresh questions.`,points:15},
   {id:`${skillId}:test`,courseId:course.id,skillId,title:`${module} • Mastery Test`,kind:'TEST',prompt:`Demonstrate mastery of ${module}.`,points:15,requiresHumanGrade:course.requiresHumanInstructor},
  ]
 })
}

export const COMPLETE_EDUCATION_GAMEPLAY_LOOP=[
 'SIGN_IN','LEARNING_PASSPORT','DIAGNOSTIC','COURSE','LESSON','PRACTICE','HOMEWORK','STREETVERSE_MISSION','A_B_C_OR_ACTION','WORLD_CONSEQUENCE','QUIZ','TEST','MASTERY_EVIDENCE','RETEACH_GAP','DIFFERENT_RETRY','HUMAN_REVIEW_WHEN_REQUIRED','PASSPORT_UPDATE','XP_HOLO_CREDITS_NON_CASH','NEXT_SKILL','CAREER_TRADE_COLLEGE_BUSINESS_PATHWAY'
] as const
