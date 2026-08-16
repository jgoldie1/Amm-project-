export type LeagueLane = 'men' | 'women' | 'mixed'
export type SportKind = 'basketball' | 'boxing' | 'mma' | 'football' | 'baseball' | 'soccer' | 'hockey' | 'track'

export type AthleteStats = {
  speed: number
  power: number
  agility: number
  stamina: number
  defense: number
  skill: number
}

export type Athlete = {
  id: string
  displayName: string
  lane: LeagueLane
  stats: AthleteStats
  energy: number
  fouls: number
}

export type BasketballState = {
  sport: 'basketball'
  lane: LeagueLane
  home: Athlete[]
  away: Athlete[]
  homeScore: number
  awayScore: number
  quarter: 1 | 2 | 3 | 4 | 5
  gameClockSeconds: number
  shotClockSeconds: number
  possession: 'home' | 'away'
  selectedAthleteId: string
}

export type CombatState = {
  sport: 'boxing' | 'mma'
  lane: Exclude<LeagueLane, 'mixed'>
  red: Athlete
  blue: Athlete
  redScore: number
  blueScore: number
  round: number
  roundClockSeconds: number
  redHealth: number
  blueHealth: number
}

const clamp = (n:number,min=0,max=100)=>Math.max(min,Math.min(max,n))
const roll = (rating:number, difficulty=.5)=> Math.random() < clamp((rating/100)*.65 + .2 - difficulty*.12, .08, .92)

export function createAthlete(id:string,name:string,lane:LeagueLane,overrides:Partial<AthleteStats>={}):Athlete {
  return {
    id, displayName:name, lane, energy:100, fouls:0,
    stats:{ speed:72,power:68,agility:74,stamina:76,defense:70,skill:73,...overrides }
  }
}

export function createBasketballGame(lane:LeagueLane='mixed'):BasketballState {
  const mk=(side:'home'|'away',i:number)=>createAthlete(`${side}-${i}`,`${side==='home'?'Kingdom':'Nexus'} ${i+1}`,lane,{skill:68+i*3,speed:72+i})
  const home=Array.from({length:5},(_,i)=>mk('home',i))
  const away=Array.from({length:5},(_,i)=>mk('away',i))
  return {sport:'basketball',lane,home,away,homeScore:0,awayScore:0,quarter:1,gameClockSeconds:720,shotClockSeconds:24,possession:'home',selectedAthleteId:home[0].id}
}

export function basketballAction(state:BasketballState, action:'pass'|'drive'|'shoot2'|'shoot3'|'dunk'|'steal'|'block'):BasketballState {
  const next=structuredClone(state) as BasketballState
  const team=next.possession==='home'?next.home:next.away
  const athlete=team.find(a=>a.id===next.selectedAthleteId) || team[0]
  const spend=(n:number)=>{ athlete.energy=clamp(athlete.energy-n) }
  let scored=0
  if(action==='pass'){ spend(1); next.shotClockSeconds=Math.max(1,next.shotClockSeconds-2) }
  if(action==='drive'){ spend(4); next.shotClockSeconds=Math.max(1,next.shotClockSeconds-3); if(!roll((athlete.stats.agility+athlete.stats.speed)/2)) next.possession=next.possession==='home'?'away':'home' }
  if(action==='shoot2'){ spend(3); if(roll(athlete.stats.skill,.45)) scored=2; next.possession=next.possession==='home'?'away':'home'; next.shotClockSeconds=24 }
  if(action==='shoot3'){ spend(4); if(roll(athlete.stats.skill-8,.5)) scored=3; next.possession=next.possession==='home'?'away':'home'; next.shotClockSeconds=24 }
  if(action==='dunk'){ spend(6); if(roll((athlete.stats.power+athlete.stats.agility)/2,.35)) scored=2; next.possession=next.possession==='home'?'away':'home'; next.shotClockSeconds=24 }
  if(action==='steal'){ spend(5); if(roll((athlete.stats.defense+athlete.stats.agility)/2,.6)){ next.possession=next.possession==='home'?'away':'home'; next.shotClockSeconds=24 } }
  if(action==='block'){ spend(5) }
  if(scored){ if(state.possession==='home') next.homeScore+=scored; else next.awayScore+=scored }
  next.gameClockSeconds=Math.max(0,next.gameClockSeconds-4)
  if(next.gameClockSeconds===0 && next.quarter<4){ next.quarter=(next.quarter+1) as 1|2|3|4; next.gameClockSeconds=720; next.shotClockSeconds=24 }
  else if(next.gameClockSeconds===0 && next.quarter===4 && next.homeScore===next.awayScore){ next.quarter=5; next.gameClockSeconds=300; next.shotClockSeconds=24 }
  return next
}

export function createCombatGame(sport:'boxing'|'mma', lane:Exclude<LeagueLane,'mixed'>='men'):CombatState {
  const red=createAthlete('red','Judah Red',lane,{power:80,agility:72,stamina:78})
  const blue=createAthlete('blue','Nexus Blue',lane,{defense:78,skill:76,stamina:76})
  return {sport,lane,red,blue,redScore:0,blueScore:0,round:1,roundClockSeconds:sport==='boxing'?180:300,redHealth:100,blueHealth:100}
}

export function combatAction(state:CombatState, side:'red'|'blue', action:'jab'|'cross'|'hook'|'body'|'block'|'dodge'|'takedown'|'grapple'):CombatState {
  const next=structuredClone(state) as CombatState
  const attacker=side==='red'?next.red:next.blue
  const defender=side==='red'?next.blue:next.red
  const targetHealth=side==='red'?'blueHealth':'redHealth'
  const scoreKey=side==='red'?'redScore':'blueScore'
  const legalGrapple=next.sport==='mma'
  if((action==='takedown'||action==='grapple')&&!legalGrapple) return next
  const attackRating = action==='jab'?attacker.stats.skill : action==='dodge'?attacker.stats.agility : action==='block'?attacker.stats.defense : action==='takedown'||action==='grapple'?(attacker.stats.power+attacker.stats.skill)/2:attacker.stats.power
  attacker.energy=clamp(attacker.energy-(action==='block'?2:action==='dodge'?3:5))
  if(action==='block'||action==='dodge') return next
  if(roll(attackRating,.48)){
    const base=action==='jab'?3:action==='cross'?6:action==='hook'?7:action==='body'?5:action==='takedown'?8:9
    const damage=Math.max(1,Math.round(base*(.75+attacker.stats.power/200)*(1-defender.stats.defense/260)))
    next[targetHealth]=clamp(next[targetHealth]-damage)
    next[scoreKey]+= action==='jab'?1: action==='takedown'||action==='grapple'?3:2
  }
  next.roundClockSeconds=Math.max(0,next.roundClockSeconds-3)
  if(next.roundClockSeconds===0){ next.round+=1; next.roundClockSeconds=next.sport==='boxing'?180:300; next.red.energy=clamp(next.red.energy+18); next.blue.energy=clamp(next.blue.energy+18) }
  return next
}

export function isBasketballOver(state:BasketballState){ return state.quarter===5 ? state.gameClockSeconds===0 : state.quarter===4 && state.gameClockSeconds===0 && state.homeScore!==state.awayScore }
export function isCombatOver(state:CombatState){ return state.redHealth<=0 || state.blueHealth<=0 || state.round>(state.sport==='boxing'?12:5) }
