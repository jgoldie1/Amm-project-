import type { WorldChange } from './LivingWorldContinuityEngine'

export type GeneratedMission = {
  id: string
  title: string
  sourceEntityId: string
  type: 'reunion'|'business'|'school'|'neighborhood'|'career'|'legacy'
  objective: string
  choices: string[]
  memoryWrite: string
}

export function missionsFromWorldChanges(changes: WorldChange[]): GeneratedMission[] {
  return changes.slice(0,12).map((change,index) => {
    const lower = change.after.toLowerCase()
    const type: GeneratedMission['type'] = lower.includes('expanded') || lower.includes('closed') || lower.includes('staff')
      ? 'business' : lower.includes('term') || lower.includes('alumni') ? 'school' : lower.includes('district') ? 'neighborhood' : 'reunion'
    const title = type === 'business' ? 'The Store You Remember'
      : type === 'school' ? 'Back Through Those Doors'
      : type === 'neighborhood' ? 'The Block Changed Without You'
      : 'Somebody You Used to Know'
    return {
      id:`return-${index}-${change.entityId}`,
      title,
      sourceEntityId:change.entityId,
      type,
      objective:`Discover why ${change.entityId} changed from ${change.before} to ${change.after}.`,
      choices:['help','listen','invest-or-contribute','walk-away'],
      memoryWrite:`Return consequence resolved: ${change.entityId} -> ${change.after}`,
    }
  })
}

export const LEGACY_MISSION_TEMPLATES: GeneratedMission[] = [
  { id:'legacy-old-friend', title:'Somebody You Used to Know', sourceEntityId:'dynamic-npc', type:'reunion', objective:'Reconnect with an old friend whose life changed while you were away.', choices:['reconnect','offer opportunity','make amends','keep distance'], memoryWrite:'relationship return choice' },
  { id:'legacy-first-job', title:'Where You Earned the First Dollar', sourceEntityId:'first-job', type:'career', objective:'Return to the place of your first job and decide how to help the next worker.', choices:['mentor','hire','fund training','share story'], memoryWrite:'first-job legacy choice' },
  { id:'legacy-school', title:'Come Speak to the Class', sourceEntityId:'school-history', type:'school', objective:'Return as an alumnus and turn your life experience into a new student opportunity.', choices:['career talk','arts program','sports program','entrepreneurship program'], memoryWrite:'school legacy contribution' },
  { id:'legacy-neighborhood', title:'What Do We Build Here?', sourceEntityId:'home-neighborhood', type:'neighborhood', objective:'Choose an original community improvement that changes the playable district.', choices:['arts space','sports space','business incubator','technology lab'], memoryWrite:'neighborhood legacy project' },
  { id:'legacy-business', title:'The Employee Became the Owner', sourceEntityId:'former-employee', type:'business', objective:'Meet a former employee whose career continued after you left.', choices:['partner','invest','mentor','compete respectfully'], memoryWrite:'employee-to-owner relationship' },
  { id:'legacy-time-machine', title:'Meet Your Younger Self', sourceEntityId:'time-machine', type:'legacy', objective:'Walk through holographic choice echoes from earlier biography chapters and choose what the next generation should inherit.', choices:['knowledge','opportunity','art','business'], memoryWrite:'legacy inheritance choice' },
]
