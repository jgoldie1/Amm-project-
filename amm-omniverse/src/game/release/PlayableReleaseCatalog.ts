export type SliceStatus='PLAYABLE_SLICE'|'PROTOTYPE'|'PLANNED'
export type SliceGame={id:string;name:string;status:SliceStatus;levels:{id:string;name:string;objective:string;proof:string}[];releaseGates:string[]}
export const TIER_ONE_RELEASE_GAMES:SliceGame[]=[
 {id:'streetverse',name:'StreetVerse',status:'PLAYABLE_SLICE',levels:[
  {id:'block-remembers',name:'The Block Remembers',objective:'Create/claim character, enter Chicago, make first life choice.',proof:'character + mission + World Memory entry'},
  {id:'court-echo',name:'Court Echo',objective:'Complete a consequence-bearing mission and save outcome.',proof:'mission state + biography save'},
  {id:'business-life',name:'Build a Life',objective:'Progress school/job/business/storefront path.',proof:'economy/reputation/world consequence'},
  {id:'return',name:'Return Home',objective:'Leave and return to changed world state.',proof:'rejoin + world-change evidence'}],
  releaseGates:['auth','save/rejoin','mission runtime','World Memory','mobile controls','performance']},
 {id:'court-kings',name:'Court Kings',status:'PLAYABLE_SLICE',levels:[
  {id:'shootaround',name:'Shootaround',objective:'Complete timed shot-selection challenge.',proof:'input + scoring loop'},
  {id:'street-three',name:'Street 3v3',objective:'Win team-possession objective set.',proof:'team score + possession state'},
  {id:'arena',name:'Arena Night',objective:'Complete regulation game loop with fouls/time.',proof:'clock + rules + final score'},
  {id:'season',name:'Season Opener',objective:'Save result and advance player reputation.',proof:'progression + leaderboard-ready result'}],
  releaseGates:['input/gamepad','rules engine','AI/opponent path','save result','multiplayer contract','performance']},
 {id:'volcano',name:'Volcano: Last Route',status:'PLAYABLE_SLICE',levels:[
  {id:'rumble',name:'The Rumble',objective:'Evacuate research village.',proof:'route choice + rescue count'},
  {id:'lava',name:'Lava Run',objective:'Cross reactive hazard route.',proof:'timed hazard state'},
  {id:'ash',name:'Ash Sky',objective:'Restore communications in low visibility.',proof:'team beacon objectives'},
  {id:'heart',name:'Heart of the Volcano',objective:'Stabilize station and choose evacuation finale.',proof:'branching ending + World Memory'}],
  releaseGates:['room-scale safety','hazard state','co-op contract','World Memory','highlight capture','performance']},
 {id:'battle-deck',name:'Battle Deck: Holo Champions',status:'PLAYABLE_SLICE',levels:[
  {id:'academy',name:'Deck Academy',objective:'Learn energy, position and counter system.',proof:'turn + energy + card actions'},
  {id:'district',name:'District Trials',objective:'Win three tactical encounters.',proof:'deck state + encounter scoring'},
  {id:'rift',name:'Rift Tournament',objective:'Adapt to rotating arena modifiers.',proof:'modifier + tournament state'},
  {id:'crown',name:'Crown Circuit',objective:'Defeat multi-phase Holo Champion.',proof:'boss phases + persistent unlock'}],
  releaseGates:['original-card rules','no pay-to-win','save deck','tournament result','spectator path','performance']}
]
export const RELEASE_ORDER=['streetverse','court-kings','volcano','battle-deck','sports-framework','living-racing','pinball-recovery','remaining-worlds'] as const
export const PROGRESS_RULE='A world counts upward only when its playable slice has input, objective, result, save/rejoin or equivalent persistence, smoke coverage and a release gate. Design-only entries stay PLANNED.'
