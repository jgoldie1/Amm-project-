import { evaluateMastery, nextLearningAction, type MasteryRecord } from '../education/missionTaskAssessmentEngine'
import { createLearningPassport, upsertCredential, type LearningPassport, type LearningCredential } from '../education/learningPassport'

export type LearningMissionResult={missionId:string;studentId:string;skillId:string;scorePercent:number;completed:boolean;submittedAt:string}
export type LearningProgressSnapshot={studentId:string;passport:LearningPassport;mastery:MasteryRecord[];lastMission?:LearningMissionResult;nextAction?:ReturnType<typeof nextLearningAction>}

const progress=new Map<string,LearningProgressSnapshot>()

const emptyMastery=(studentId:string,skillId:string):MasteryRecord=>({studentId,skillId,state:'NOT_STARTED',bestScorePercent:0,attempts:0,evidenceTaskIds:[]})

export function getLearningProgress(studentId:string){
 return progress.get(studentId)??{studentId,passport:createLearningPassport({userId:studentId}),mastery:[]}
}

export function applyStreetVerseLearningResult(result:LearningMissionResult){
 const current=getLearningProgress(result.studentId)
 const old=current.mastery.find(x=>x.skillId===result.skillId)??emptyMastery(result.studentId,result.skillId)
 const updated=evaluateMastery(old,result.scorePercent,result.missionId)
 const mastery=[...current.mastery.filter(x=>x.skillId!==result.skillId),updated]
 const status:LearningCredential['status']=updated.state==='MASTERED'?'completed':'in_progress'
 const credential:LearningCredential={id:result.skillId,title:result.skillId.replaceAll('-',' '),category:'academic',status,progress:Math.min(100,updated.bestScorePercent),evidence:[...updated.evidenceTaskIds]}
 const passport=upsertCredential(current.passport,credential)
 const snapshot={studentId:result.studentId,passport,mastery,lastMission:result,nextAction:nextLearningAction(updated)}
 progress.set(result.studentId,snapshot)
 return snapshot
}

export function installLearningProgressOrchestrator(){
 if(typeof window==='undefined')return
 window.addEventListener('tryamm:learning:mission-result',(event:Event)=>{
  const d=(event as CustomEvent<Partial<LearningMissionResult>>).detail||{}
  if(!d.studentId||!d.skillId||!d.missionId||typeof d.scorePercent!=='number')return
  const snapshot=applyStreetVerseLearningResult({missionId:d.missionId,studentId:d.studentId,skillId:d.skillId,scorePercent:d.scorePercent,completed:d.completed!==false,submittedAt:d.submittedAt||new Date().toISOString()})
  window.dispatchEvent(new CustomEvent('tryamm:learning:progress-updated',{detail:snapshot}))
  window.dispatchEvent(new CustomEvent('tryamm:learning:next-action',{detail:{studentId:d.studentId,skillId:d.skillId,...snapshot.nextAction}}))
 })
 window.dispatchEvent(new CustomEvent('tryamm:learning-progress:ready',{detail:{persistence:'runtime-memory-only',productionPersistenceRequired:true,guardianTeacherViewsRequireAuthorizedIdentity:true}}))
}
