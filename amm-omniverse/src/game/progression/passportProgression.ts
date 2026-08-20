export type FlagshipWorld = 'streetverse'|'my-world'|'we-are-the-world'|'kingdom'|'starverse'|'holoverse'|'mars'

export interface PassportProgress {
  level: number
  xp: number
  title: string
  mastery: Record<FlagshipWorld, number>
  unlockedPerks: string[]
}

export const MAX_PASSPORT_LEVEL = 100
export const MAX_WORLD_MASTERY = 10

const FLAGSHIP_WORLDS: FlagshipWorld[] = ['streetverse','my-world','we-are-the-world','kingdom','starverse','holoverse','mars']

export function xpForLevel(level:number){
  const l=Math.max(1,Math.min(MAX_PASSPORT_LEVEL,Math.floor(level)))
  return Math.round(500*Math.pow(l-1,1.35))
}

export function levelFromXp(xp:number){
  let level=1
  for(let i=2;i<=MAX_PASSPORT_LEVEL;i++){
    if(xp < xpForLevel(i)) break
    level=i
  }
  return level
}

export function titleForLevel(level:number){
  if(level>=100)return 'Living Worlds Legend'
  if(level>=80)return 'Omniverse Architect'
  if(level>=60)return 'World Builder'
  if(level>=40)return 'Pathfinder'
  if(level>=25)return 'Creator Citizen'
  if(level>=10)return 'Explorer'
  return 'New Arrival'
}

export interface ProgressionMilestone {
  level:number
  unlocks:string[]
}

export const PASSPORT_MILESTONES: ProgressionMilestone[]=[
  {level:1,unlocks:['StreetVerse starter missions','basic avatar personalization','Stubbs AI world guide']},
  {level:5,unlocks:['My World starter plot','basic GLB placement','first creator showcase slot']},
  {level:10,unlocks:['We Are the World discovery challenges','regional creator quests','translation challenges']},
  {level:15,unlocks:['Kingdom starter settlement missions','crew roles','community building tools']},
  {level:20,unlocks:['StarVerse audition ladder','performance challenges','studio practice missions']},
  {level:30,unlocks:['Holoverse advanced portal missions','XR challenge variants','spatial creator stages']},
  {level:40,unlocks:['Mars advanced mission chain','crew specialization','Canyon mastery challenges']},
  {level:50,unlocks:['cross-world prestige missions','advanced vehicle classes','rare dynamic missions']},
  {level:60,unlocks:['World Builder tools','advanced HoloForge placement budgets','community event hosting']},
  {level:75,unlocks:['global Mega Bash creator privileges','elite cooperative challenges','rare cosmetic blueprints']},
  {level:90,unlocks:['legendary world events','master creator showcases','high-difficulty crew missions']},
  {level:100,unlocks:['Living Worlds Legend title','prestige reset option without losing owned items','legend challenge track']},
]

export const WORLD_MASTERY_TIERS = [
  'Discover',
  'Learn',
  'Contribute',
  'Skilled',
  'Specialist',
  'Veteran',
  'Elite',
  'Master',
  'Icon',
  'Legend',
] as const

export function masteryLabel(rank:number){
  return WORLD_MASTERY_TIERS[Math.max(0,Math.min(MAX_WORLD_MASTERY-1,Math.floor(rank)-1))] ?? WORLD_MASTERY_TIERS[0]
}

export function createInitialProgress():PassportProgress{
  return {
    level:1,
    xp:0,
    title:titleForLevel(1),
    mastery:Object.fromEntries(FLAGSHIP_WORLDS.map(w=>[w,0])) as Record<FlagshipWorld,number>,
    unlockedPerks:[...PASSPORT_MILESTONES[0].unlocks],
  }
}

export function applyXp(progress:PassportProgress,amount:number):PassportProgress{
  const xp=Math.max(0,progress.xp+Math.max(0,amount))
  const level=levelFromXp(xp)
  const unlockedPerks=[...new Set(PASSPORT_MILESTONES.filter(m=>m.level<=level).flatMap(m=>m.unlocks))]
  return {...progress,xp,level,title:titleForLevel(level),unlockedPerks}
}

export function addWorldMastery(progress:PassportProgress,world:FlagshipWorld,amount=1):PassportProgress{
  return {...progress,mastery:{...progress.mastery,[world]:Math.max(0,Math.min(MAX_WORLD_MASTERY,progress.mastery[world]+amount))}}
}

// Design rule: basic world visitation is not grind-gated. Levels unlock depth, prestige,
// advanced missions and creator tools; they should not lock disabled players, younger users,
// or casual players out of the core world experience.
export const PROGRESSION_QUALITY_RULES=[
  'meaningful_unlock_every_5_levels',
  'no_pay_to_win_levels',
  'no_required_daily_grind',
  'basic_world_access_not_level_gated',
  'age_and_accessibility_safe_progression',
  'world_mastery_rewards_skill_and_contribution',
  'prestige_never_deletes_owned_items',
  'real_money_rewards_never_derive_from_client_level_state',
] as const
