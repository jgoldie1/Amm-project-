export type OmniAfterDarkMissionId =
  | 'after-dark-white-night-file'
  | 'after-dark-night-market'
  | 'after-dark-creator-run'
  | 'after-dark-safe-ride'

export type OmniAfterDarkMission = {
  id: OmniAfterDarkMissionId
  title: string
  lane: 'investigation' | 'commerce' | 'creator' | 'mobility'
  ageGate: 21
  xp: number
  holoCredits: number
  financialReward: false
  oneHandChoices: readonly ['A', 'B', 'C']
  reelEligible: boolean
}

export const OMNI_AFTER_DARK_MISSIONS: OmniAfterDarkMission[] = [
  { id:'after-dark-white-night-file', title:'The White Night File', lane:'investigation', ageGate:21, xp:750, holoCredits:250, financialReward:false, oneHandChoices:['A','B','C'], reelEligible:true },
  { id:'after-dark-night-market', title:'Night Market Run', lane:'commerce', ageGate:21, xp:320, holoCredits:80, financialReward:false, oneHandChoices:['A','B','C'], reelEligible:true },
  { id:'after-dark-creator-run', title:'Midnight Creator Run', lane:'creator', ageGate:21, xp:360, holoCredits:90, financialReward:false, oneHandChoices:['A','B','C'], reelEligible:true },
  { id:'after-dark-safe-ride', title:'Safe Ride Home', lane:'mobility', ageGate:21, xp:300, holoCredits:75, financialReward:false, oneHandChoices:['A','B','C'], reelEligible:true },
]

export type OmniAfterDarkProgress = {
  missionId: OmniAfterDarkMissionId
  ageVerified: boolean
  consentAccepted: boolean
  choiceHistory: Array<'A' | 'B' | 'C'>
  completed: boolean
}

export function canStartOmniAfterDark(progress: OmniAfterDarkProgress) {
  if (!progress.ageVerified || !progress.consentAccepted) return { ok:false, reason:'21+ age gate and consent required' } as const
  return { ok:true, reason:'After Dark mission eligible to start' } as const
}

export function recordAfterDarkChoice(progress: OmniAfterDarkProgress, choice: 'A' | 'B' | 'C') {
  const gate=canStartOmniAfterDark(progress)
  if(!gate.ok) return progress
  return { ...progress, choiceHistory:[...progress.choiceHistory,choice] }
}

export function completeOmniAfterDarkMission(progress: OmniAfterDarkProgress) {
  const gate=canStartOmniAfterDark(progress)
  if(!gate.ok) return { accepted:false, xp:0, holoCredits:0, financialReward:false as const, reason:gate.reason }
  const mission=OMNI_AFTER_DARK_MISSIONS.find(item=>item.id===progress.missionId)
  if(!mission) return { accepted:false, xp:0, holoCredits:0, financialReward:false as const, reason:'Mission not found' }
  if(progress.choiceHistory.length<1) return { accepted:false, xp:0, holoCredits:0, financialReward:false as const, reason:'Choose A, B, or C before completion' }
  return { accepted:true, xp:mission.xp, holoCredits:mission.holoCredits, financialReward:false as const, reelEligible:mission.reelEligible, reason:'mission-contract-satisfied' }
}

export const OMNI_AFTER_DARK_BOUNDARY =
  'After Dark is a 21+ fictional entertainment lane. Mature themes do not require explicit sexual gameplay. Mission XP and Holo Credits are non-cash rewards and never create a payable balance.'
