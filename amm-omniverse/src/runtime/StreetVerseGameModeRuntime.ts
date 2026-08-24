export type GameMode='story'|'driving'|'sports'|'creator'|'business'|'faith'|'security'|'exploration'|'mixed'
export type Difficulty='easy'|'normal'|'hard'|'legend'

export type GameModeProfile={
  id:GameMode
  label:string
  description:string
  recommendedLevel:number
  missionTags:string[]
}

export const STREETVERSE_GAME_MODES:GameModeProfile[]=[
  {id:'story',label:'Story Mode',description:'Character-driven missions, city arcs, family legacy, choices, and progression.',recommendedLevel:1,missionTags:['story','community','mentorship']},
  {id:'driving',label:'Driving & Street Racing',description:'Open-city driving, delivery runs, timed routes, vehicle challenges, and exploration.',recommendedLevel:1,missionTags:['driving','delivery','exploration']},
  {id:'sports',label:'Sports Mode',description:'Training, tournaments, team challenges, creator leagues, and sports events.',recommendedLevel:2,missionTags:['sports','competition','training']},
  {id:'creator',label:'Creator Mode',description:'Shoot reels, make music, perform, edit, publish, and grow reputation through content.',recommendedLevel:1,missionTags:['creative','music','film','reels']},
  {id:'business',label:'Business & Marketplace',description:'Build stores, complete customer missions, run deliveries, learn business, and grow community commerce.',recommendedLevel:3,missionTags:['business','marketplace','commerce']},
  {id:'faith',label:'Faith & Community',description:'Service, learning, reflection, mentoring, peaceful community events, and spiritual missions.',recommendedLevel:1,missionTags:['faith','community','service']},
  {id:'security',label:'Security Guardian',description:'Nonviolent prevention, safe-passage, de-escalation, escort, event security, and community-protection missions.',recommendedLevel:3,missionTags:['peacekeeping','rescue','community']},
  {id:'exploration',label:'World Explorer',description:'Travel city to city, discover landmarks, cultures, local events, and location-specific challenges.',recommendedLevel:1,missionTags:['exploration','travel','culture']},
  {id:'mixed',label:'Open World Mix',description:'Play all available systems together and let StreetVerse surface missions based on your level and location.',recommendedLevel:1,missionTags:['all']},
]

const MODE_KEY='tryamm_streetverse_game_mode_v1'
const DIFFICULTY_KEY='tryamm_streetverse_difficulty_v1'
let installed=false

function safeMode(value:unknown):GameMode{
  return STREETVERSE_GAME_MODES.some(m=>m.id===value)?value as GameMode:'mixed'
}
function safeDifficulty(value:unknown):Difficulty{
  return ['easy','normal','hard','legend'].includes(String(value))?value as Difficulty:'normal'
}
function levelScale(level:number,difficulty:Difficulty){
  const d=difficulty==='easy'?.8:difficulty==='hard'?1.25:difficulty==='legend'?1.5:1
  return Math.max(1,Math.round((1+Math.max(0,level-1)*.08)*d*100)/100)
}

export function installStreetVerseGameModeRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  const publish=()=>{
    const mode=safeMode(localStorage.getItem(MODE_KEY)||'mixed')
    const difficulty=safeDifficulty(localStorage.getItem(DIFFICULTY_KEY)||'normal')
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-game-mode-state',{detail:{mode,difficulty,modes:STREETVERSE_GAME_MODES}}))
  }
  queueMicrotask(publish)
  window.addEventListener('tryamm:streetverse-game-mode-select',(event:Event)=>{
    const mode=safeMode((event as CustomEvent<any>).detail?.mode)
    try{localStorage.setItem(MODE_KEY,mode)}catch{}
    publish()
  })
  window.addEventListener('tryamm:streetverse-difficulty-select',(event:Event)=>{
    const difficulty=safeDifficulty((event as CustomEvent<any>).detail?.difficulty)
    try{localStorage.setItem(DIFFICULTY_KEY,difficulty)}catch{}
    publish()
  })
  window.addEventListener('tryamm:streetverse-level-context',(event:Event)=>{
    const level=Math.max(1,Number((event as CustomEvent<any>).detail?.level||1))
    const mode=safeMode(localStorage.getItem(MODE_KEY)||'mixed')
    const difficulty=safeDifficulty(localStorage.getItem(DIFFICULTY_KEY)||'normal')
    const unlocked=STREETVERSE_GAME_MODES.filter(m=>level>=m.recommendedLevel).map(m=>m.id)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-level-scaled-mode',{detail:{level,mode,difficulty,unlocked,scale:levelScale(level,difficulty)}}))
  })
}
