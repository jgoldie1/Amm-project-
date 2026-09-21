export type LearningTaskKind = 'LESSON' | 'PRACTICE' | 'MISSION' | 'HOMEWORK' | 'QUIZ' | 'TEST' | 'PROJECT'
export type MasteryState = 'NOT_STARTED' | 'LEARNING' | 'PRACTICING' | 'READY_TO_TEST' | 'MASTERED' | 'RETEACH_REQUIRED'

export type LearningTask = {
  id: string
  courseId: string
  skillId: string
  title: string
  kind: LearningTaskKind
  prompt: string
  points: number
  dueAt?: string
  requiresHumanGrade?: boolean
  proctored?: boolean
}

export type LearningAttempt = {
  taskId: string
  studentId: string
  answer: string
  scorePercent?: number
  feedback?: string[]
  submittedAt: string
  humanVerified?: boolean
}

export type MasteryRecord = {
  studentId: string
  skillId: string
  state: MasteryState
  bestScorePercent: number
  attempts: number
  evidenceTaskIds: string[]
}

export function canAiGrade(task: LearningTask) {
  if (task.proctored) return { ok:false, reason:'Proctored tests require authorized external or human assessment' } as const
  if (task.requiresHumanGrade || task.kind === 'PROJECT') return { ok:false, reason:'Human grading required' } as const
  return { ok:true, reason:'AI-assisted formative grading allowed with rubric and review path' } as const
}

export function evaluateMastery(record: MasteryRecord, scorePercent: number, taskId: string): MasteryRecord {
  const score=Math.max(0,Math.min(100,scorePercent))
  const best=Math.max(record.bestScorePercent,score)
  const state:MasteryState = best >= 80 ? 'MASTERED' : best >= 60 ? 'READY_TO_TEST' : 'RETEACH_REQUIRED'
  return { ...record, state, bestScorePercent:best, attempts:record.attempts+1, evidenceTaskIds:[...new Set([...record.evidenceTaskIds,taskId])] }
}

export function nextLearningAction(record: MasteryRecord) {
  if(record.state==='MASTERED') return { action:'NEXT_SKILL', message:'Skill mastered; advance while preserving evidence.' } as const
  if(record.state==='READY_TO_TEST') return { action:'TEST', message:'Run a fresh assessment before mastery.' } as const
  if(record.state==='RETEACH_REQUIRED') return { action:'RETEACH', message:'Explain another way, practice the gap, then use a different retry task.' } as const
  return { action:'LEARN', message:'Continue lesson, practice, and mission evidence.' } as const
}

export function homeworkSupportBoundary(prompt:string) {
  const blocked=/take (my|the) (test|exam)|submit (this|my) (homework|assignment)|impersonate me|answer my proctored/i.test(prompt)
  return blocked
    ? { allowed:false, mode:'COACH', reason:'Teach, explain, give hints, review the student attempt, or create similar practice instead of impersonating the student.' } as const
    : { allowed:true, mode:'TUTOR', reason:'Learning support allowed.' } as const
}

export const EDUCATION_MISSION_LOOP = [
  'DIAGNOSE',
  'TEACH',
  'EXPLAIN_BACK',
  'PRACTICE',
  'STREETVERSE_MISSION',
  'HOMEWORK',
  'QUIZ',
  'TEST',
  'REVIEW_EVIDENCE',
  'RETEACH_IF_NEEDED',
  'DIFFERENT_RETRY',
  'MASTERY',
  'LEARNING_PASSPORT',
  'NEXT_SKILL',
] as const
